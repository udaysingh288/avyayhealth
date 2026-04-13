import XCTest
@testable import AvyayHealth

final class ClinicalConstantsTests: XCTestCase {

    // MARK: - containsRedKeyword

    func testContainsRedKeyword_exactMatches() {
        XCTAssertTrue(containsRedKeyword("cannot breathe"))
        XCTAssertTrue(containsRedKeyword("can't breathe"))
        XCTAssertTrue(containsRedKeyword("cant breathe"))
        XCTAssertTrue(containsRedKeyword("chest pain"))
        XCTAssertTrue(containsRedKeyword("blue lips"))
        XCTAssertTrue(containsRedKeyword("passed out"))
        XCTAssertTrue(containsRedKeyword("heart attack"))
        XCTAssertTrue(containsRedKeyword("not breathing"))
        XCTAssertTrue(containsRedKeyword("unconscious"))
        XCTAssertTrue(containsRedKeyword("dying"))
    }

    func testContainsRedKeyword_caseInsensitive() {
        XCTAssertTrue(containsRedKeyword("CANNOT BREATHE"))
        XCTAssertTrue(containsRedKeyword("Cannot Breathe"))
        XCTAssertTrue(containsRedKeyword("CHEST PAIN"))
    }

    func testContainsRedKeyword_embeddedInLongerText() {
        XCTAssertTrue(containsRedKeyword("I cannot breathe right now"))
        XCTAssertTrue(containsRedKeyword("my husband has chest pain"))
    }

    func testContainsRedKeyword_benignText() {
        XCTAssertFalse(containsRedKeyword("I'm feeling fine"))
        XCTAssertFalse(containsRedKeyword("Breathing is good"))
        XCTAssertFalse(containsRedKeyword("No pain at all"))
        XCTAssertFalse(containsRedKeyword("Had a good day"))
    }

    func testContainsRedKeyword_edgeCases() {
        XCTAssertFalse(containsRedKeyword(""))
        XCTAssertFalse(containsRedKeyword(" "))
        XCTAssertFalse(containsRedKeyword("hello"))
    }

    // MARK: - RED_KEYWORDS

    func testRedKeywords_hasMinimumCount() {
        XCTAssertGreaterThanOrEqual(RED_KEYWORDS.count, 15)
    }

    func testRedKeywords_includesBreathingEmergencies() {
        XCTAssertTrue(RED_KEYWORDS.contains("cannot breathe"))
        XCTAssertTrue(RED_KEYWORDS.contains("can't breathe"))
        XCTAssertTrue(RED_KEYWORDS.contains("hard to breathe"))
    }

    func testRedKeywords_includesCardiacEmergencies() {
        XCTAssertTrue(RED_KEYWORDS.contains("chest pain"))
        XCTAssertTrue(RED_KEYWORDS.contains("heart attack"))
    }

    // MARK: - EMERGENCY_PATTERNS

    func testEmergencyPatterns_matchBreathing() {
        XCTAssertTrue(EMERGENCY_PATTERNS.contains { matches("can't breathe", $0) })
        XCTAssertTrue(EMERGENCY_PATTERNS.contains { matches("cannot breathe", $0) })
    }

    func testEmergencyPatterns_matchCardiac() {
        XCTAssertTrue(EMERGENCY_PATTERNS.contains { matches("chest pain", $0) })
        XCTAssertTrue(EMERGENCY_PATTERNS.contains { matches("chest hurts", $0) })
    }

    func testEmergencyPatterns_matchCyanosis() {
        XCTAssertTrue(EMERGENCY_PATTERNS.contains { matches("blue lips", $0) })
        XCTAssertTrue(EMERGENCY_PATTERNS.contains { matches("blue fingers", $0) })
    }

    func testEmergencyPatterns_match911() {
        XCTAssertTrue(EMERGENCY_PATTERNS.contains { matches("call 911", $0) })
    }

    func testEmergencyPatterns_noFalsePositives() {
        XCTAssertFalse(EMERGENCY_PATTERNS.contains { matches("feeling good", $0) })
        XCTAssertFalse(EMERGENCY_PATTERNS.contains { matches("no pain", $0) })
    }

    // MARK: - SYMPTOM_RULES

    func testSymptomRules_detectsBreathing() {
        let breathing = SYMPTOM_RULES.filter { $0.type == "breathing" }
        XCTAssertTrue(breathing.contains { matches("short of breath", $0.pattern) })
        XCTAssertTrue(breathing.contains { matches("wheezing", $0.pattern) })
        XCTAssertTrue(breathing.allSatisfy { $0.severity == "yellow" })
    }

    func testSymptomRules_detectsSwelling() {
        let swelling = SYMPTOM_RULES.filter { $0.type == "swelling" }
        XCTAssertTrue(swelling.contains { matches("swelling", $0.pattern) })
        XCTAssertTrue(swelling.contains { matches("swollen", $0.pattern) })
        XCTAssertTrue(swelling.contains { matches("puffy", $0.pattern) })
        XCTAssertTrue(swelling.contains { matches("bloated", $0.pattern) })
    }

    func testSymptomRules_detectsFatigue() {
        let fatigue = SYMPTOM_RULES.filter { $0.type == "fatigue" }
        XCTAssertTrue(fatigue.contains { matches("tired", $0.pattern) })
        XCTAssertTrue(fatigue.contains { matches("exhausted", $0.pattern) })
        XCTAssertTrue(fatigue.allSatisfy { $0.severity == "green" })
    }

    func testSymptomRules_detectsFever() {
        let fever = SYMPTOM_RULES.filter { $0.type == "fever" }
        XCTAssertTrue(fever.contains { matches("fever", $0.pattern) })
        XCTAssertTrue(fever.contains { matches("chills", $0.pattern) })
    }

    func testSymptomRules_coversAllExpectedTypes() {
        let types = Set(SYMPTOM_RULES.map { $0.type })
        for expected in ["breathing", "swelling", "chest_pain", "cough", "fatigue",
                         "pain", "fever", "dizziness", "nausea", "sleep",
                         "appetite", "confusion", "mucus", "weight_gain"] {
            XCTAssertTrue(types.contains(expected), "Missing symptom type: \(expected)")
        }
    }

    // MARK: - SDOH

    func testSdohScreeningDays() {
        XCTAssertEqual(SDOH_SCREENING_DAYS, [3, 7, 14, 21, 28])
    }

    func testSdohDomains_hasExactly5() {
        XCTAssertEqual(SDOH_DOMAINS.count, 5)
    }

    func testSdohDomainForDay_correctMapping() {
        XCTAssertEqual(sdohDomainForDay(3), "transportation")
        XCTAssertEqual(sdohDomainForDay(7), "food_insecurity")
        XCTAssertEqual(sdohDomainForDay(14), "housing_instability")
        XCTAssertEqual(sdohDomainForDay(21), "utility_difficulty")
        XCTAssertEqual(sdohDomainForDay(28), "interpersonal_safety")
    }

    func testSdohDomainForDay_nonScreeningDays() {
        XCTAssertNil(sdohDomainForDay(1))
        XCTAssertNil(sdohDomainForDay(2))
        XCTAssertNil(sdohDomainForDay(10))
        XCTAssertNil(sdohDomainForDay(30))
    }

    func testSdohDomainForDay_boundaryValues() {
        XCTAssertNil(sdohDomainForDay(0))
        XCTAssertNil(sdohDomainForDay(-1))
        XCTAssertNil(sdohDomainForDay(100))
    }

    // MARK: - Helper for tests

    private func matches(_ text: String, _ regex: NSRegularExpression) -> Bool {
        regex.firstMatch(in: text, range: NSRange(text.startIndex..., in: text)) != nil
    }
}
