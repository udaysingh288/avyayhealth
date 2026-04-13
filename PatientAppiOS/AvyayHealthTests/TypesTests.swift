import XCTest
@testable import AvyayHealth

final class TypesTests: XCTestCase {

    // MARK: - RiskLevel

    func testRiskLevel_allCases() {
        XCTAssertEqual(RiskLevel.allCases.count, 3)
        XCTAssertTrue(RiskLevel.allCases.contains(.green))
        XCTAssertTrue(RiskLevel.allCases.contains(.yellow))
        XCTAssertTrue(RiskLevel.allCases.contains(.red))
    }

    func testRiskLevel_accessibilityLabels() {
        XCTAssertEqual(RiskLevel.green.accessibilityLabel, "Stable")
        XCTAssertEqual(RiskLevel.yellow.accessibilityLabel, "Needs attention")
        XCTAssertEqual(RiskLevel.red.accessibilityLabel, "Alert")
    }

    func testRiskLevel_iconNames() {
        XCTAssertEqual(RiskLevel.green.iconName, "checkmark.circle.fill")
        XCTAssertEqual(RiskLevel.yellow.iconName, "exclamationmark.circle.fill")
        XCTAssertEqual(RiskLevel.red.iconName, "exclamationmark.triangle.fill")
    }

    func testRiskLevel_codable() throws {
        let json = "\"green\""
        let data = json.data(using: .utf8)!
        let decoded = try JSONDecoder().decode(RiskLevel.self, from: data)
        XCTAssertEqual(decoded, .green)
    }

    // MARK: - Condition

    func testCondition_allCases() {
        XCTAssertEqual(Condition.allCases.count, 4)
    }

    func testCondition_labels() {
        XCTAssertEqual(Condition.chf.label, "Heart Failure")
        XCTAssertEqual(Condition.copd.label, "COPD")
        XCTAssertEqual(Condition.pneumonia.label, "Pneumonia")
        XCTAssertEqual(Condition.ami.label, "Heart Condition")
    }

    func testCondition_codable() throws {
        let json = "\"copd\""
        let data = json.data(using: .utf8)!
        let decoded = try JSONDecoder().decode(Condition.self, from: data)
        XCTAssertEqual(decoded, .copd)
    }

    // MARK: - SDOHDomain

    func testSDOHDomain_allCases() {
        XCTAssertEqual(SDOHDomain.allCases.count, 5)
    }

    func testSDOHDomain_labels() {
        XCTAssertEqual(SDOHDomain.transportation.label, "Transportation")
        XCTAssertEqual(SDOHDomain.food_insecurity.label, "Food Access")
        XCTAssertEqual(SDOHDomain.housing_instability.label, "Housing Stability")
        XCTAssertEqual(SDOHDomain.utility_difficulty.label, "Utility Payments")
        XCTAssertEqual(SDOHDomain.interpersonal_safety.label, "Personal Safety")
    }

    // MARK: - MessageType

    func testMessageType_includesAudio() {
        XCTAssertNotNil(MessageType(rawValue: "audio"))
        XCTAssertEqual(MessageType.audio.rawValue, "audio")
    }

    func testMessageType_includesText() {
        XCTAssertEqual(MessageType.text.rawValue, "text")
    }

    func testMessageType_includesImage() {
        XCTAssertEqual(MessageType.image.rawValue, "image")
    }

    // MARK: - Message Codable

    func testMessage_decodesFromJSON() throws {
        let json = """
        {
            "id": "msg-1",
            "role": "patient",
            "content": "Feeling good",
            "sent_at": "2026-03-15T12:00:00Z",
            "risk_level": null,
            "message_type": "text",
            "image_storage_path": null,
            "image_classification": null
        }
        """
        let data = json.data(using: .utf8)!
        let msg = try JSONDecoder().decode(Message.self, from: data)
        XCTAssertEqual(msg.id, "msg-1")
        XCTAssertEqual(msg.role, .patient)
        XCTAssertEqual(msg.content, "Feeling good")
        XCTAssertEqual(msg.messageType, .text)
        XCTAssertNil(msg.riskLevel)
    }

    func testMessage_decodesWithMissingOptionals() throws {
        let json = """
        {
            "role": "ai",
            "content": "How are you?"
        }
        """
        let data = json.data(using: .utf8)!
        let msg = try JSONDecoder().decode(Message.self, from: data)
        XCTAssertEqual(msg.role, .ai)
        XCTAssertEqual(msg.content, "How are you?")
        XCTAssertEqual(msg.messageType, .text) // default
        XCTAssertNil(msg.riskLevel)
    }

    func testMessage_decodesAudioType() throws {
        let json = """
        {
            "role": "patient",
            "content": "Voice transcription",
            "message_type": "audio"
        }
        """
        let data = json.data(using: .utf8)!
        let msg = try JSONDecoder().decode(Message.self, from: data)
        XCTAssertEqual(msg.messageType, .audio)
    }

    // MARK: - Medication Codable

    func testMedication_decodesFromJSON() throws {
        let json = """
        {
            "name": "Lisinopril",
            "dose": "10mg",
            "frequency": "Once daily",
            "timing": "Morning"
        }
        """
        let data = json.data(using: .utf8)!
        let med = try JSONDecoder().decode(Medication.self, from: data)
        XCTAssertEqual(med.name, "Lisinopril")
        XCTAssertEqual(med.dose, "10mg")
    }

    func testMedication_decodesWithMissingOptionals() throws {
        let json = """
        {
            "name": "Aspirin"
        }
        """
        let data = json.data(using: .utf8)!
        let med = try JSONDecoder().decode(Medication.self, from: data)
        XCTAssertEqual(med.name, "Aspirin")
        XCTAssertEqual(med.dose, "") // default
        XCTAssertEqual(med.frequency, "") // default
    }

    // MARK: - EnrollResponse Codable

    func testEnrollResponse_decodesFromJSON() throws {
        let json = """
        {
            "patient_id": "pat-1",
            "hospital_id": "hosp-1",
            "hospital_name": "General Hospital",
            "coordinator_first_name": "Sarah",
            "first_name": "Maria",
            "condition": "chf",
            "discharge_date": "2026-03-01",
            "days_in_program": 5,
            "total_days": 30,
            "session_token": "tok-123"
        }
        """
        let data = json.data(using: .utf8)!
        let resp = try JSONDecoder().decode(EnrollResponse.self, from: data)
        XCTAssertEqual(resp.patientId, "pat-1")
        XCTAssertEqual(resp.firstName, "Maria")
        XCTAssertEqual(resp.condition, .chf)
        XCTAssertEqual(resp.sessionToken, "tok-123")
        XCTAssertNil(resp.medications)
    }

    func testEnrollResponse_defaultsForMissingFields() throws {
        let json = """
        {
            "patient_id": "pat-1",
            "hospital_id": "hosp-1",
            "hospital_name": "General Hospital",
            "coordinator_first_name": "Sarah",
            "first_name": "Maria",
            "condition": "copd",
            "discharge_date": "2026-03-01",
            "session_token": "tok-123"
        }
        """
        let data = json.data(using: .utf8)!
        let resp = try JSONDecoder().decode(EnrollResponse.self, from: data)
        XCTAssertEqual(resp.daysInProgram, 1) // default
        XCTAssertEqual(resp.totalDays, 30) // default
    }

    // MARK: - Invalid JSON

    func testRiskLevel_invalidValue_throws() {
        let json = "\"critical\""
        let data = json.data(using: .utf8)!
        XCTAssertThrowsError(try JSONDecoder().decode(RiskLevel.self, from: data))
    }

    func testCondition_invalidValue_throws() {
        let json = "\"diabetes\""
        let data = json.data(using: .utf8)!
        XCTAssertThrowsError(try JSONDecoder().decode(Condition.self, from: data))
    }
}
