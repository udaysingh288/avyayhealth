import SwiftUI

/// In-memory patient state store. HIPAA compliant — never persists to disk.
@MainActor
final class PatientStore: ObservableObject {
    static let shared = PatientStore()

    @Published var token: String?
    @Published var session: PatientSession?
    @Published var checkin: TodayCheckin?
    @Published var isEnrolled: Bool = false

    /// Tracks last user interaction for 30-minute inactivity timeout (HIPAA)
    private var lastActivityDate = Date()
    private static let inactivityTimeout: TimeInterval = 30 * 60 // 30 minutes

    private init() {}

    func setSession(_ enrollResponse: EnrollResponse) {
        let session = PatientSession(
            patientId: enrollResponse.patientId,
            firstName: enrollResponse.firstName,
            condition: enrollResponse.condition,
            dischargeDate: enrollResponse.dischargeDate,
            daysInProgram: enrollResponse.daysInProgram,
            totalDays: enrollResponse.totalDays,
            hospitalName: enrollResponse.hospitalName,
            coordinatorFirstName: enrollResponse.coordinatorFirstName,
            medications: enrollResponse.medications ?? [],
            token: enrollResponse.sessionToken
        )
        self.token = enrollResponse.sessionToken
        self.session = session
        self.isEnrolled = true
        recordActivity()
    }

    func setSessionDirect(token: String, session: PatientSession) {
        self.token = token
        self.session = session
        self.isEnrolled = true
        recordActivity()
    }

    func clearSession() {
        token = nil
        session = nil
        checkin = nil
        isEnrolled = false
    }

    // MARK: - Inactivity Timeout (HIPAA)

    func recordActivity() {
        lastActivityDate = Date()
    }

    func checkInactivityTimeout() {
        guard isEnrolled else { return }
        if Date().timeIntervalSince(lastActivityDate) > Self.inactivityTimeout {
            clearSession()
        }
    }

    func buildInitialCheckin() -> TodayCheckin {
        guard let session = session else {
            return TodayCheckin(
                checkinId: "ci-day1",
                dayNumber: 1,
                status: .pending,
                question: "",
                conversation: [],
                completedAt: nil
            )
        }

        let h = Calendar.current.component(.hour, from: Date())
        let greeting = h < 12 ? "Good morning" : (h < 17 ? "Good afternoon" : "Good evening")

        let conditionPrompts: [Condition: String] = [
            .chf: "Any shortness of breath, swelling, or changes in how you feel?",
            .copd: "Any changes in your breathing, coughing, or energy level?",
            .pneumonia: "Any fever, coughing, or difficulty breathing?",
            .ami: "Any chest discomfort, dizziness, or changes in how you feel?",
        ]
        let symptomPrompt = conditionPrompts[session.condition] ?? "Any pain, shortness of breath, or new symptoms?"
        let content = "\(greeting), \(session.firstName)! It's Day \(session.daysInProgram) of your recovery. How are you feeling today? \(symptomPrompt)"

        let aiMsg = Message(role: .ai, content: content)

        return TodayCheckin(
            checkinId: "ci-day\(session.daysInProgram)",
            dayNumber: session.daysInProgram,
            status: .pending,
            question: content,
            conversation: [aiMsg],
            completedAt: nil
        )
    }
}
