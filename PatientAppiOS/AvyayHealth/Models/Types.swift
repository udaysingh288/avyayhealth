import Foundation

// MARK: - Enums

enum RiskLevel: String, Codable, CaseIterable {
    case green, yellow, red
}

enum Condition: String, Codable, CaseIterable {
    case chf, copd, pneumonia, ami

    var label: String {
        switch self {
        case .chf: return "Heart Failure"
        case .copd: return "COPD"
        case .pneumonia: return "Pneumonia"
        case .ami: return "Heart Condition"
        }
    }
}

enum CheckInStatus: String, Codable {
    case pending, completed, missed, escalated
}

enum MessageRole: String, Codable {
    case ai, patient, coordinator
}

enum SDOHDomain: String, Codable, CaseIterable {
    case food_insecurity
    case housing_instability
    case transportation
    case utility_difficulty
    case interpersonal_safety

    var label: String {
        switch self {
        case .food_insecurity: return "Food Access"
        case .housing_instability: return "Housing Stability"
        case .transportation: return "Transportation"
        case .utility_difficulty: return "Utility Payments"
        case .interpersonal_safety: return "Personal Safety"
        }
    }
}

// MARK: - Models

struct Medication: Codable, Identifiable {
    var id: String { name }
    let name: String
    let dose: String
    let frequency: String
    let timing: String
}

struct PatientSession: Codable {
    let patientId: String
    let firstName: String
    let condition: Condition
    let dischargeDate: String
    let daysInProgram: Int
    let totalDays: Int
    let hospitalName: String
    let coordinatorFirstName: String
    let medications: [Medication]
    let token: String

    enum CodingKeys: String, CodingKey {
        case patientId = "patient_id"
        case firstName = "first_name"
        case condition
        case dischargeDate = "discharge_date"
        case daysInProgram = "days_in_program"
        case totalDays = "total_days"
        case hospitalName = "hospital_name"
        case coordinatorFirstName = "coordinator_first_name"
        case medications
        case token = "session_token"
    }
}

struct Message: Identifiable, Codable {
    let id: String
    let role: MessageRole
    let content: String
    let sentAt: String
    let riskLevel: RiskLevel?

    enum CodingKeys: String, CodingKey {
        case id, role, content
        case sentAt = "sent_at"
        case riskLevel = "risk_level"
    }

    init(id: String = UUID().uuidString, role: MessageRole, content: String, sentAt: String? = nil, riskLevel: RiskLevel? = nil) {
        self.id = id
        self.role = role
        self.content = content
        self.sentAt = sentAt ?? ISO8601DateFormatter().string(from: Date())
        self.riskLevel = riskLevel
    }
}

struct TodayCheckin: Codable {
    let checkinId: String
    let dayNumber: Int
    var status: CheckInStatus
    let question: String
    var conversation: [Message]
    var completedAt: String?

    enum CodingKeys: String, CodingKey {
        case checkinId = "checkin_id"
        case dayNumber = "day_number"
        case status, question, conversation
        case completedAt = "completed_at"
    }
}

struct DayHistory: Identifiable, Codable {
    var id: Int { dayNumber }
    let dayNumber: Int
    let date: String
    let status: CheckInStatus
    let riskLevel: RiskLevel?
    let summary: String?

    enum CodingKeys: String, CodingKey {
        case dayNumber = "day_number"
        case date, status
        case riskLevel = "risk_level"
        case summary
    }
}

struct DirectMessage: Identifiable, Codable {
    let id: String
    let senderType: String
    let senderId: String
    let content: String
    let readAt: String?
    let createdAt: String

    enum CodingKeys: String, CodingKey {
        case id
        case senderType = "sender_type"
        case senderId = "sender_id"
        case content
        case readAt = "read_at"
        case createdAt = "created_at"
    }
}

struct ChatReplyResponse: Codable {
    let reply: String
    let riskLevel: RiskLevel
    let nextPhase: String
    let isComplete: Bool
    let summary: String
    let followUp: String?

    enum CodingKeys: String, CodingKey {
        case reply
        case riskLevel = "risk_level"
        case nextPhase = "next_phase"
        case isComplete = "is_complete"
        case summary
        case followUp = "follow_up"
    }
}

struct EnrollResponse: Codable {
    let patientId: String
    let hospitalId: String
    let hospitalName: String
    let coordinatorFirstName: String
    let firstName: String
    let condition: Condition
    let dischargeDate: String
    let daysInProgram: Int
    let totalDays: Int
    let medications: [Medication]
    let sessionToken: String

    enum CodingKeys: String, CodingKey {
        case patientId = "patient_id"
        case hospitalId = "hospital_id"
        case hospitalName = "hospital_name"
        case coordinatorFirstName = "coordinator_first_name"
        case firstName = "first_name"
        case condition
        case dischargeDate = "discharge_date"
        case daysInProgram = "days_in_program"
        case totalDays = "total_days"
        case medications
        case sessionToken = "session_token"
    }
}
