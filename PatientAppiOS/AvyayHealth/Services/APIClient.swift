import Foundation

/// Central API client for all Supabase edge function calls.
final class APIClient {
    static let shared = APIClient()

    private let supabaseURL = "https://gehcrdcgxifryfwjhpoz.supabase.co"
    private let supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlaGNyZGNneGlmcnlmd2pocG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTE4NDcsImV4cCI6MjA5MTQ2Nzg0N30.QKgdbLbou6I3bOHsBjv2gXI-uptchn7trNp21xaXhjA"
    private let session = URLSession.shared
    private let decoder = JSONDecoder()

    private init() {}

    private func edgeFunctionURL(_ name: String) -> URL {
        URL(string: "\(supabaseURL)/functions/v1/\(name)")!
    }

    private func patientHeaders(_ token: String) -> [String: String] {
        [
            "Content-Type": "application/json",
            "Authorization": "Bearer \(supabaseAnonKey)",
            "apikey": supabaseAnonKey,
            "X-Patient-Token": token,
        ]
    }

    private func anonHeaders() -> [String: String] {
        [
            "Content-Type": "application/json",
            "Authorization": "Bearer \(supabaseAnonKey)",
            "apikey": supabaseAnonKey,
        ]
    }

    // MARK: - Enrollment

    func enroll(hospitalCode: String, firstName: String, dob: String) async throws -> EnrollResponse {
        var request = URLRequest(url: edgeFunctionURL("enroll-patient"))
        request.httpMethod = "POST"
        anonHeaders().forEach { request.setValue($0.value, forHTTPHeaderField: $0.key) }
        request.httpBody = try JSONEncoder().encode([
            "hospital_code": hospitalCode,
            "first_name": firstName,
            "dob": dob,
        ])

        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
            let body = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw APIError.serverError(body)
        }
        return try decoder.decode(EnrollResponse.self, from: data)
    }

    // MARK: - Check-in Messages

    func saveMessage(token: String, message: Message) async {
        var request = URLRequest(url: edgeFunctionURL("save-checkin-message"))
        request.httpMethod = "POST"
        patientHeaders(token).forEach { request.setValue($0.value, forHTTPHeaderField: $0.key) }

        let body: [String: Any?] = [
            "role": message.role.rawValue,
            "content": message.content,
            "risk_level": message.riskLevel?.rawValue,
        ]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body.compactMapValues { $0 })

        _ = try? await session.data(for: request)
    }

    func completeCheckIn(token: String, riskLevel: RiskLevel, summary: String) async {
        var request = URLRequest(url: edgeFunctionURL("complete-checkin"))
        request.httpMethod = "POST"
        patientHeaders(token).forEach { request.setValue($0.value, forHTTPHeaderField: $0.key) }
        request.httpBody = try? JSONEncoder().encode([
            "risk_level": riskLevel.rawValue,
            "summary": summary,
        ])

        _ = try? await session.data(for: request)
    }

    func getChatReply(
        token: String,
        messages: [[String: String]],
        phase: String,
        dayNumber: Int,
        condition: String,
        firstName: String,
        medications: [Medication] = []
    ) async -> ChatReplyResponse? {
        var request = URLRequest(url: edgeFunctionURL("chat-reply"))
        request.httpMethod = "POST"
        patientHeaders(token).forEach { request.setValue($0.value, forHTTPHeaderField: $0.key) }

        var body: [String: Any] = [
            "messages": messages,
            "phase": phase,
            "day_number": dayNumber,
            "condition": condition,
            "first_name": firstName,
        ]
        if !medications.isEmpty {
            body["medications"] = medications.map { [
                "name": $0.name,
                "dose": $0.dose,
                "frequency": $0.frequency,
                "timing": $0.timing,
            ] }
        }
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)

        guard let (data, response) = try? await session.data(for: request),
              let http = response as? HTTPURLResponse, http.statusCode == 200 else {
            return nil
        }
        return try? decoder.decode(ChatReplyResponse.self, from: data)
    }

    // MARK: - Direct Messaging

    func getMessages(token: String, limit: Int = 50) async -> [DirectMessage] {
        var request = URLRequest(url: edgeFunctionURL("get-messages"))
        request.httpMethod = "POST"
        patientHeaders(token).forEach { request.setValue($0.value, forHTTPHeaderField: $0.key) }
        request.httpBody = try? JSONEncoder().encode(["limit": limit])

        guard let (data, response) = try? await session.data(for: request),
              let http = response as? HTTPURLResponse, http.statusCode == 200 else {
            return []
        }

        struct Wrapper: Codable { let messages: [DirectMessage] }
        guard let wrapper = try? decoder.decode(Wrapper.self, from: data) else { return [] }
        return wrapper.messages
    }

    func sendDirectMessage(token: String, content: String) async {
        var request = URLRequest(url: edgeFunctionURL("send-message"))
        request.httpMethod = "POST"
        patientHeaders(token).forEach { request.setValue($0.value, forHTTPHeaderField: $0.key) }
        request.httpBody = try? JSONEncoder().encode(["content": content])

        _ = try? await session.data(for: request)
    }
}

enum APIError: LocalizedError {
    case serverError(String)

    var errorDescription: String? {
        switch self {
        case .serverError(let msg): return msg
        }
    }
}
