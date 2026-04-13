import XCTest
@testable import AvyayHealth

final class ConversationEngineTests: XCTestCase {

    // MARK: - Classify: Emergency

    func testClassify_emergency_cantBreathe() {
        let r = classify("can't breathe")
        XCTAssertEqual(r.intent, .emergency)
        XCTAssertEqual(r.severity, "red")
        XCTAssertEqual(r.sentiment, "negative")
    }

    func testClassify_emergency_chestPain() {
        XCTAssertEqual(classify("chest pain").intent, .emergency)
    }

    func testClassify_emergency_caseInsensitive() {
        XCTAssertEqual(classify("CHEST PAIN").intent, .emergency)
    }

    func testClassify_emergency_embeddedInText() {
        XCTAssertEqual(classify("I cannot breathe right now").intent, .emergency)
    }

    // MARK: - Classify: Symptoms

    func testClassify_symptoms_breathing() {
        let r = classify("short of breath")
        XCTAssertEqual(r.intent, .specific_symptom)
        XCTAssertTrue(r.symptoms.contains("breathing"))
        XCTAssertEqual(r.severity, "yellow")
    }

    func testClassify_symptoms_swelling() {
        let r = classify("my ankles are swollen")
        XCTAssertEqual(r.intent, .specific_symptom)
        XCTAssertTrue(r.symptoms.contains("swelling"))
    }

    func testClassify_symptoms_fatigue_green() {
        let r = classify("I'm so tired today")
        XCTAssertEqual(r.intent, .specific_symptom)
        XCTAssertTrue(r.symptoms.contains("fatigue"))
        XCTAssertEqual(r.severity, "green")
    }

    func testClassify_symptoms_multiple() {
        let r = classify("short of breath and ankles swollen")
        XCTAssertTrue(r.symptoms.contains("breathing"))
        XCTAssertTrue(r.symptoms.contains("swelling"))
        XCTAssertEqual(r.severity, "yellow")
    }

    func testClassify_symptoms_nausea() {
        XCTAssertTrue(classify("feeling nauseous").symptoms.contains("nausea"))
    }

    func testClassify_symptoms_dizziness() {
        XCTAssertTrue(classify("I'm dizzy").symptoms.contains("dizziness"))
    }

    // MARK: - Classify: Medication

    func testClassify_medication_yes() {
        let r = classify("took all my meds")
        XCTAssertEqual(r.intent, .medication_yes)
        XCTAssertEqual(r.sentiment, "positive")
    }

    func testClassify_medication_no() {
        let r = classify("missed a dose")
        XCTAssertEqual(r.intent, .medication_no)
        XCTAssertEqual(r.sentiment, "negative")
    }

    func testClassify_medication_issue() {
        XCTAssertEqual(classify("need a refill").intent, .medication_issue)
    }

    // MARK: - Classify: Feelings

    func testClassify_positive() {
        let r = classify("feeling good")
        XCTAssertEqual(r.intent, .positive_feeling)
        XCTAssertEqual(r.sentiment, "positive")
    }

    func testClassify_negative() {
        XCTAssertEqual(classify("not good").intent, .negative_feeling)
    }

    func testClassify_emotional() {
        XCTAssertEqual(classify("I'm scared").intent, .emotional)
    }

    // MARK: - Classify: Short forms

    func testClassify_affirmative_ok() {
        XCTAssertEqual(classify("ok").intent, .affirmative)
    }

    func testClassify_negativeShort_no() {
        XCTAssertEqual(classify("no").intent, .negative_short)
    }

    func testClassify_negativeShort_nope() {
        XCTAssertEqual(classify("nope").intent, .negative_short)
    }

    // MARK: - Classify: Other intents

    func testClassify_frustration() {
        XCTAssertEqual(classify("stop texting me").intent, .frustration)
    }

    func testClassify_greeting() {
        XCTAssertEqual(classify("hello").intent, .greeting)
    }

    func testClassify_goodbye() {
        XCTAssertEqual(classify("bye").intent, .goodbye)
    }

    func testClassify_question() {
        XCTAssertEqual(classify("when is my appointment?").intent, .question)
    }

    func testClassify_lifeUpdate() {
        XCTAssertEqual(classify("my daughter visited").intent, .life_update)
    }

    // MARK: - Classify: Edge cases

    func testClassify_emptyString() {
        let r = classify("")
        XCTAssertEqual(r.intent, .unclear)
        XCTAssertEqual(r.severity, "green")
    }

    func testClassify_singleChar() {
        XCTAssertEqual(classify("a").intent, .unclear)
    }

    func testClassify_whitespace() {
        XCTAssertEqual(classify("   ").intent, .unclear)
    }

    func testClassify_unrecognizable() {
        XCTAssertEqual(classify("asdfghjkl").intent, .unclear)
    }

    func testClassify_preservesRaw() {
        XCTAssertEqual(classify("  hello  ").raw, "hello")
    }

    // MARK: - Classify: Priority

    func testClassify_emergencyOverSymptoms() {
        XCTAssertEqual(classify("chest pain").intent, .emergency)
    }

    func testClassify_negativeFeelingOverPositive() {
        XCTAssertEqual(classify("not good").intent, .negative_feeling)
    }

    // MARK: - pick()

    func testPick_returnsFirstUnused() {
        var state = ConversationState()
        let result = pick(["Hello", "Hi", "Hey"], &state, "greet")
        XCTAssertEqual(result, "Hello")
    }

    func testPick_tracksUsedKey() {
        var state = ConversationState()
        _ = pick(["Hello", "Hi"], &state, "greet")
        XCTAssertTrue(state.usedResponseKeys.contains("greet:0"))
    }

    func testPick_skipsUsedResponses() {
        var state = ConversationState()
        state.usedResponseKeys = ["greet:0"]
        let result = pick(["Hello", "Hi", "Hey"], &state, "greet")
        XCTAssertEqual(result, "Hi")
    }

    func testPick_emptyPoolReturnsEmptyString() {
        var state = ConversationState()
        let result = pick([], &state, "empty")
        XCTAssertEqual(result, "")
    }

    func testPick_wrapsAroundWhenAllUsed() {
        var state = ConversationState()
        state.usedResponseKeys = ["greet:0", "greet:1", "greet:2"]
        state.turnCount = 1
        let result = pick(["Hello", "Hi", "Hey"], &state, "greet")
        XCTAssertEqual(result, "Hi") // pool[1 % 3]
    }

    // MARK: - quickRepliesForPhase

    func testQuickReplies_chfSymptomCheck() {
        let replies = quickRepliesForPhase(.symptom_check, .chf)
        XCTAssertTrue(replies.contains("Short of breath"))
        XCTAssertTrue(replies.contains("Some swelling"))
        XCTAssertTrue(replies.contains("Feeling good"))
    }

    func testQuickReplies_copdSymptomCheck() {
        let replies = quickRepliesForPhase(.symptom_check, .copd)
        XCTAssertTrue(replies.contains("Harder to breathe"))
        XCTAssertTrue(replies.contains("Coughing more"))
    }

    func testQuickReplies_medicationCheck() {
        let replies = quickRepliesForPhase(.medication_check, .chf)
        XCTAssertTrue(replies.contains("Yes, all taken"))
        XCTAssertTrue(replies.contains("Missed one today"))
    }

    func testQuickReplies_complete_isEmpty() {
        let replies = quickRepliesForPhase(.complete, .chf)
        XCTAssertTrue(replies.isEmpty)
    }

    // MARK: - buildSummary

    func testBuildSummary_emptyParts() {
        let state = ConversationState()
        XCTAssertEqual(buildSummary(state), "Check-in completed. No concerns reported.")
    }

    func testBuildSummary_joinsParts() {
        var state = ConversationState()
        state.summaryParts = ["Feeling well", "Meds taken"]
        XCTAssertEqual(buildSummary(state), "Feeling well. Meds taken.")
    }

    func testBuildSummary_singlePart() {
        var state = ConversationState()
        state.summaryParts = ["Reports swelling"]
        XCTAssertEqual(buildSummary(state), "Reports swelling.")
    }
}
