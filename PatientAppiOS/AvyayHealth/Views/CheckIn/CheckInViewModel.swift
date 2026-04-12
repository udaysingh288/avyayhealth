import SwiftUI

@MainActor
final class CheckInViewModel: ObservableObject {
    @Published var conversation: [Message] = []
    @Published var replyText = ""
    @Published var isSending = false
    @Published var showEscalation = false
    @Published var isCompleted = false
    @Published var dayNumber = 1
    @Published var quickReplies: [String] = []

    private var convState = ConversationState()
    private var patientToken = ""
    private var session: PatientSession?
    private var seenDmIds = Set<String>()
    private var dmPollTimer: Timer?

    var stepIndex: Int {
        if isCompleted { return 2 }
        switch convState.phase {
        case .symptom_check, .symptom_followup: return 0
        case .medication_check, .medication_followup: return 1
        case .sdoh_screen, .complete: return 2
        }
    }

    var showComposer: Bool {
        !isCompleted || conversation.contains(where: { $0.role == .coordinator })
    }

    var canSend: Bool {
        !replyText.trimmingCharacters(in: .whitespaces).isEmpty && !isSending
    }

    func setup(store: PatientStore) {
        guard let session = store.session else { return }
        self.session = session
        self.patientToken = session.token
        self.dayNumber = session.daysInProgram

        if let checkin = store.checkin {
            self.conversation = checkin.conversation
            self.isCompleted = checkin.status == .completed
        } else {
            let checkin = store.buildInitialCheckin()
            store.checkin = checkin
            self.conversation = checkin.conversation
        }

        self.quickReplies = quickRepliesForPhase(convState.phase, session.condition)
        startDMPolling()
    }

    // MARK: - Send

    func send(text: String? = nil, store: PatientStore) {
        let msg = (text ?? replyText).trimmingCharacters(in: .whitespaces)
        guard !msg.isEmpty, session != nil else { return }

        haptic(.light)

        // Check if replying to coordinator
        let hasCoordinatorMsg = conversation.contains { $0.role == .coordinator }
        let lastNonPatient = conversation.last { $0.role != .patient }
        let isReplyToCoordinator = isCompleted ? hasCoordinatorMsg : lastNonPatient?.role == .coordinator

        if isReplyToCoordinator {
            let patientMsg = Message(role: .patient, content: msg)
            replyText = ""
            conversation.append(patientMsg)
            syncCheckin(store: store)

            Task { await APIClient.shared.sendDirectMessage(token: patientToken, content: msg) }
            return
        }

        if isCompleted { return }
        if isSending { return }

        let patientMsg = Message(role: .patient, content: msg)
        let isRed = containsRedKeyword(msg)
        replyText = ""
        isSending = true
        conversation.append(patientMsg)

        Task { await APIClient.shared.saveMessage(token: patientToken, message: patientMsg) }

        if isRed {
            haptic(.warning)
            showEscalation = true
            isSending = false
            syncCheckin(store: store)
            return
        }

        Task {
            await processAIReply(patientMsg: patientMsg, store: store)
        }
    }

    private func processAIReply(patientMsg: Message, store: PatientStore) async {
        guard let session = session else { isSending = false; return }

        // Build conversation for API
        let conversationForApi = conversation
            .filter { $0.role == .ai || $0.role == .patient }
            .map { ["role": $0.role.rawValue, "content": $0.content] }

        // Try AI API first
        let aiReply = await APIClient.shared.getChatReply(
            token: patientToken,
            messages: conversationForApi,
            phase: convState.phase.rawValue,
            dayNumber: dayNumber,
            condition: session.condition.rawValue,
            firstName: session.firstName
        )

        if let aiReply = aiReply {
            var responses = [aiReply.reply]
            if let followUp = aiReply.followUp { responses.append(followUp) }

            convState.phase = ConversationPhase(rawValue: aiReply.nextPhase) ?? .complete
            convState.overallRisk = aiReply.riskLevel
            convState.turnCount += 1
            convState.summaryParts.append(aiReply.summary)

            await addAIMessages(responses, riskLevel: aiReply.riskLevel, isComplete: aiReply.isComplete, summary: aiReply.summary, store: store)
        } else {
            // Fallback to local engine
            let result = processReply(
                text: patientMsg.content,
                firstName: session.firstName,
                condition: session.condition,
                dayNumber: dayNumber,
                state: convState
            )
            convState = result.nextState
            await addAIMessages(result.responses, riskLevel: result.riskLevel, isComplete: result.isComplete, summary: buildSummary(result.nextState), store: store)
        }

        quickReplies = quickRepliesForPhase(convState.phase, session.condition)
        isSending = false
    }

    private func addAIMessages(_ messages: [String], riskLevel: RiskLevel, isComplete: Bool, summary: String, store: PatientStore) async {
        for (i, content) in messages.enumerated() {
            let msg = Message(role: .ai, content: content, riskLevel: i == 0 ? riskLevel : nil)

            if i == messages.count - 1 && isComplete {
                haptic(.success)
                isCompleted = true
                conversation.append(msg)
                syncCheckin(store: store)
                Task { await APIClient.shared.saveMessage(token: patientToken, message: msg) }
                Task { await APIClient.shared.completeCheckIn(token: patientToken, riskLevel: riskLevel, summary: summary) }
            } else {
                conversation.append(msg)
                syncCheckin(store: store)
                Task { await APIClient.shared.saveMessage(token: patientToken, message: msg) }

                if i < messages.count - 1 {
                    try? await Task.sleep(nanoseconds: UInt64((0.7 + Double.random(in: 0...0.4)) * 1_000_000_000))
                }
            }
        }
    }

    func dismissEscalation(store: PatientStore) {
        showEscalation = false
        let aiMsg = Message(role: .ai, content: "I'm glad you're okay. Your care team has been notified just in case. Let's continue — how is your breathing right now?")
        conversation.append(aiMsg)
        syncCheckin(store: store)
    }

    private func syncCheckin(store: PatientStore) {
        store.checkin = TodayCheckin(
            checkinId: store.checkin?.checkinId ?? "ci-day\(dayNumber)",
            dayNumber: dayNumber,
            status: isCompleted ? .completed : .pending,
            question: store.checkin?.question ?? "",
            conversation: conversation,
            completedAt: isCompleted ? ISO8601DateFormatter().string(from: Date()) : nil
        )
    }

    // MARK: - DM Polling

    private func startDMPolling() {
        dmPollTimer?.invalidate()
        pollDMs()
        dmPollTimer = Timer.scheduledTimer(withTimeInterval: 8, repeats: true) { [weak self] _ in
            Task { @MainActor [weak self] in self?.pollDMs() }
        }
    }

    private func pollDMs() {
        guard !patientToken.isEmpty else { return }
        Task {
            let msgs = await APIClient.shared.getMessages(token: patientToken)
            for dm in msgs where dm.senderType == "coordinator" && !seenDmIds.contains(dm.id) {
                seenDmIds.insert(dm.id)
                let coordMsg = Message(id: "dm-\(dm.id)", role: .coordinator, content: dm.content, sentAt: dm.createdAt)
                conversation.append(coordMsg)
                haptic(.medium)
            }
        }
    }

    deinit {
        dmPollTimer?.invalidate()
    }
}
