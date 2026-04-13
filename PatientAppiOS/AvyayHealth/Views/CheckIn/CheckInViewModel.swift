import SwiftUI
import UIKit

@MainActor
final class CheckInViewModel: ObservableObject {
    @Published var conversation: [Message] = []
    @Published var replyText = ""
    @Published var isSending = false
    @Published var showEscalation = false
    @Published var isCompleted = false
    @Published var dayNumber = 1
    @Published var quickReplies: [String] = []

    // Image upload state (rolled back — kept for future use)
    @Published var showImagePicker = false
    @Published var showImageConsent = false
    @Published var isUploadingImage = false
    @Published var imageConsentGiven = false
    var pendingImage: UIImage?
    @Published var loadedImages: [String: UIImage] = [:]

    // Audio recording state
    @Published var isRecording = false
    @Published var isTranscribing = false
    @Published var recordingPulse = false
    @Published var recordingDuration: TimeInterval = 0
    private let audioManager = AudioRecorderManager()

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
            convState = ConversationState()
            let checkin = store.buildInitialCheckin()
            store.checkin = checkin
            self.conversation = checkin.conversation
        }

        self.quickReplies = quickRepliesForPhase(convState.phase, session.condition)
        startDMPolling()
    }

    // MARK: - Send

    func send(text: String? = nil, store: PatientStore, messageType: MessageType = .text) {
        let msg = (text ?? replyText).trimmingCharacters(in: .whitespaces)
        guard !msg.isEmpty, session != nil else { return }

        haptic(.light)

        // Check if replying to coordinator
        let hasCoordinatorMsg = conversation.contains { $0.role == .coordinator }
        let lastNonPatient = conversation.last { $0.role != .patient }
        let isReplyToCoordinator = isCompleted ? hasCoordinatorMsg : lastNonPatient?.role == .coordinator

        if isReplyToCoordinator {
            let patientMsg = Message(role: .patient, content: msg, messageType: messageType)
            replyText = ""
            conversation.append(patientMsg)
            syncCheckin(store: store)

            Task { await APIClient.shared.sendDirectMessage(token: patientToken, content: msg) }
            return
        }

        if isCompleted { return }
        if isSending { return }

        let patientMsg = Message(role: .patient, content: msg, messageType: messageType)
        let isRed = containsRedKeyword(msg)
        replyText = ""
        isSending = true
        conversation.append(patientMsg)

        Task { await APIClient.shared.saveMessage(token: patientToken, message: patientMsg) }

        if isRed {
            haptic(.warning)
            showEscalation = true
            isSending = false
            isCompleted = true
            syncCheckin(store: store)
            Task {
                await APIClient.shared.completeCheckIn(
                    token: patientToken,
                    riskLevel: .red,
                    summary: "RED ALERT: Patient message contained urgent keywords — \(msg)"
                )
            }
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
            firstName: session.firstName,
            medications: session.medications
        )

        if let aiReply = aiReply {
            var responses = [aiReply.reply]
            if let followUp = aiReply.followUp { responses.append(followUp) }

            let risk = aiReply.riskLevel ?? .green
            convState.phase = ConversationPhase(rawValue: aiReply.nextPhase) ?? .complete
            convState.overallRisk = risk
            convState.turnCount += 1
            convState.summaryParts.append(aiReply.summary)

            await addAIMessages(responses, riskLevel: risk, isComplete: aiReply.isComplete, summary: aiReply.summary, store: store)
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
                UIAccessibility.post(notification: .announcement, argument: "Check-in complete. \(content)")
            } else {
                conversation.append(msg)
                syncCheckin(store: store)
                Task { await APIClient.shared.saveMessage(token: patientToken, message: msg) }

                if i < messages.count - 1 {
                    try? await Task.sleep(for: .milliseconds(700 + Int.random(in: 0...400)))
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

    // MARK: - Image Upload

    func sendImage(_ image: UIImage, store: PatientStore) {
        guard session != nil else { return }

        // Check consent first
        if !imageConsentGiven {
            pendingImage = image
            showImageConsent = true
            return
        }

        isUploadingImage = true
        isSending = true

        // Add placeholder message with local image
        let placeholderId = UUID().uuidString
        let placeholder = Message(id: placeholderId, role: .patient, content: "[Photo attached]", messageType: .image)
        loadedImages[placeholderId] = image
        conversation.append(placeholder)
        syncCheckin(store: store)

        Task {
            let result = await APIClient.shared.uploadImage(token: patientToken, image: image)

            isUploadingImage = false
            isSending = false

            if let result = result {
                // Add AI classification response
                let risk = result.riskLevel ?? .yellow
                let aiMsg = Message(role: .ai, content: result.classificationSummary, riskLevel: risk)
                conversation.append(aiMsg)
                syncCheckin(store: store)

                if risk == .red {
                    haptic(.warning)
                    showEscalation = true
                } else {
                    haptic(.success)
                }
            } else {
                let errorMsg = Message(role: .ai, content: "I wasn't able to process that photo. Could you describe what you're seeing instead?")
                conversation.append(errorMsg)
                syncCheckin(store: store)
            }
        }
    }

    func onImageConsentGiven(store: PatientStore) {
        imageConsentGiven = true
        if let image = pendingImage {
            pendingImage = nil
            sendImage(image, store: store)
        }
    }

    // MARK: - Audio Recording

    func toggleAudioRecording(store: PatientStore) {
        if isRecording {
            stopAndTranscribe(store: store)
        } else {
            startAudioRecording()
        }
    }

    private var durationTimer: Timer?

    private func startAudioRecording() {
        Task {
            await audioManager.startRecording()
            isRecording = audioManager.isRecording
            if isRecording {
                recordingPulse = true
                recordingDuration = 0
                haptic(.medium)
                // Poll duration from audio manager
                durationTimer = Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { [weak self] _ in
                    Task { @MainActor [weak self] in
                        guard let self else { return }
                        self.recordingDuration = self.audioManager.recordingDuration
                        if !self.audioManager.isRecording && self.isRecording {
                            // Auto-stopped at max duration
                            self.isRecording = false
                            self.recordingPulse = false
                        }
                    }
                }
            }
        }
    }

    private func stopAndTranscribe(store: PatientStore) {
        audioManager.stopRecording()
        isRecording = false
        recordingPulse = false
        isTranscribing = true
        durationTimer?.invalidate()
        durationTimer = nil
        haptic(.light)

        Task {
            let text = await audioManager.transcribe()
            isTranscribing = false

            if let text, !text.isEmpty {
                // Send the transcribed text as a voice message
                send(text: text, store: store, messageType: .audio)
            } else {
                // Show error as AI message
                let errorContent = audioManager.error ?? "Could not understand the audio. Please try again or type your message."
                let errorMsg = Message(role: .ai, content: errorContent)
                conversation.append(errorMsg)
                syncCheckin(store: store)
            }
        }
    }

    func cancelAudioRecording() {
        audioManager.cancel()
        isRecording = false
        isTranscribing = false
        recordingPulse = false
        recordingDuration = 0
        durationTimer?.invalidate()
        durationTimer = nil
    }

    /// Load an image from a signed URL into memory (never to disk).
    func loadImageForMessage(_ message: Message) {
        guard message.messageType == .image,
              let path = message.imageStoragePath,
              loadedImages[message.id] == nil else { return }

        Task {
            guard let urlString = await APIClient.shared.getImageUrl(token: patientToken, storagePath: path),
                  let url = URL(string: urlString),
                  let (data, _) = try? await URLSession.shared.data(from: url),
                  let image = UIImage(data: data) else { return }
            loadedImages[message.id] = image
        }
    }

    private func syncCheckin(store: PatientStore) {
        store.checkin = TodayCheckin(
            checkinId: store.checkin?.checkinId ?? "ci-day\(dayNumber)",
            dayNumber: dayNumber,
            status: isCompleted ? .completed : .pending,
            question: store.checkin?.question ?? "",
            conversation: conversation,
            completedAt: isCompleted ? iso8601Now() : nil
        )
    }

    // MARK: - DM Polling

    func stopDMPolling() {
        dmPollTimer?.invalidate()
        dmPollTimer = nil
    }

    private func startDMPolling() {
        stopDMPolling()
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
                // Also check conversation to avoid duplicates from prior polls
                let dmMsgId = "dm-\(dm.id)"
                guard !conversation.contains(where: { $0.id == dmMsgId }) else { continue }
                let coordMsg = Message(id: dmMsgId, role: .coordinator, content: dm.content, sentAt: dm.createdAt)
                conversation.append(coordMsg)
                haptic(.medium)
                UIAccessibility.post(notification: .announcement, argument: "New message from coordinator: \(dm.content)")
            }
        }
    }

    deinit {
        dmPollTimer?.invalidate()
        durationTimer?.invalidate()
    }
}
