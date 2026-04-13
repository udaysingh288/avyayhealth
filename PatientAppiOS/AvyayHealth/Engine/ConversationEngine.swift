import Foundation

// MARK: - Types

enum ConversationPhase: String {
    case symptom_check, symptom_followup
    case medication_check, medication_followup
    case sdoh_screen, complete
}

struct ConversationState {
    var phase: ConversationPhase = .symptom_check
    var turnCount: Int = 0
    var overallRisk: RiskLevel = .green
    var detectedSymptoms: [String] = []
    var medicationStatus: String = "unknown"
    var sdohConcern: String? = nil
    var summaryParts: [String] = []
    var usedResponseKeys: [String] = []
}

enum Intent: String {
    case positive_feeling, negative_feeling, specific_symptom, emergency
    case medication_yes, medication_no, medication_issue
    case sdoh_ok, sdoh_concern
    case question, emotional, life_update, greeting
    case affirmative, negative_short, unclear, goodbye, frustration
}

struct ClassificationResult {
    var intent: Intent = .unclear
    var symptoms: [String] = []
    var severity: String = "green"
    var sentiment: String = "neutral"
    var raw: String = ""
}

struct EngineOutput {
    let responses: [String]
    let nextState: ConversationState
    let isComplete: Bool
    let riskLevel: RiskLevel
}

// MARK: - Helpers

private func matches(_ text: String, _ regex: NSRegularExpression) -> Bool {
    regex.firstMatch(in: text, range: NSRange(text.startIndex..., in: text)) != nil
}

private func matchesAny(_ text: String, _ patterns: [NSRegularExpression]) -> Bool {
    patterns.contains { matches(text, $0) }
}

private func regex(_ pattern: String) -> NSRegularExpression? {
    try? NSRegularExpression(pattern: pattern, options: .caseInsensitive)
}

private let POSITIVE_PATTERNS: [NSRegularExpression] = [
    "\\b(good|great|fine|well|better|okay|ok|alright|wonderful|excellent|fantastic|amazing|lovely)\\b",
    "feeling\\s*(good|great|fine|better|ok|alright|much\\s*better)",
    "doing\\s*(good|great|fine|well|better|ok|alright)",
    "no\\s*(pain|issue|problem|complaint|concern|symptom)",
    "i'?m\\s*(good|fine|ok|great|well|better|alright)",
    "all\\s*(good|fine|ok|taken|clear)",
    "much\\s*better", "improving", "on\\s*the\\s*mend",
    "feeling\\s*strong", "getting\\s*better",
    "went\\s*(for\\s*)?(a\\s*)?(walk|stroll)", "walked",
].compactMap { regex($0) }

private let NEGATIVE_FEELING_PATTERNS: [NSRegularExpression] = [
    "not\\s*(good|great|well|ok|fine|feeling)",
    "\\b(bad|terrible|awful|horrible|rough|lousy|miserable|struggling)\\b",
    "feel(ing)?\\s*(bad|terrible|awful|worse|rough|lousy|down|low|off|sick|unwell)",
    "not\\s*(doing|feeling)\\s*(well|good|great|ok)",
    "been\\s*better", "worse\\s*than", "not\\s*myself",
    "having\\s*a\\s*(hard|tough|rough|bad|difficult)\\s*(time|day)",
].compactMap { regex($0) }

private let EMOTIONAL_PATTERNS: [NSRegularExpression] = [
    "\\b(scared|afraid|anxious|worried|nervous|terrified|lonely|alone|depress|sad|crying|overwhelm)\\b",
    "i'?m\\s*(scared|worried|anxious|afraid|nervous|lonely|sad)",
    "feel(ing)?\\s*(scared|worried|anxious|afraid|nervous|lonely|alone|sad|depressed|overwhelmed|hopeless)",
    "no\\s*one\\s*(is\\s*)?here", "by\\s*myself", "all\\s*alone",
].compactMap { regex($0) }

private let QUESTION_PATTERNS: [NSRegularExpression] = [
    "\\?\\s*$",
    "^(can|should|what|when|how|why|is|are|do|does|will|would|could|where)\\s",
    "is\\s+(that|it|this)\\s+(ok|normal|fine|bad|good|right)",
].compactMap { regex($0) }

private let GREETING_PATTERNS: [NSRegularExpression] = [
    "^(hi|hey|hello|good\\s*(morning|afternoon|evening))\\s*[!.,]?\\s*$",
    "^(hi|hey|hello)\\s",
].compactMap { regex($0) }

private let FRUSTRATION_PATTERNS: [NSRegularExpression] = [
    "stop\\s*(asking|texting|messaging|bothering)",
    "leave\\s*me\\s*alone", "don'?t\\s*(want|need|care|bother)",
    "annoying", "this\\s*is\\s*stupid", "waste\\s*of\\s*time",
    "hate\\s*this",
].compactMap { regex($0) }

private let GOODBYE_PATTERNS: [NSRegularExpression] = [
    "\\b(bye|goodbye|good\\s*night|take\\s*care|see\\s*you|talk\\s*(later|tomorrow)|night)\\b",
    "\\bthanks?\\b", "\\bthank\\s*you\\b",
].compactMap { regex($0) }

private let LIFE_UPDATE_PATTERNS: [NSRegularExpression] = [
    "\\b(daughter|son|wife|husband|kid|grandchild|friend|neighbor|church|grocery|cook|garden|tv|movie|book|read|visit|walked|drove|clean|laundry)\\b",
    "my\\s+(daughter|son|wife|husband|family|friend|neighbor|doc)",
    "went\\s+to\\s+(the\\s+)?(store|church|doctor|park|hospital|pharmacy)",
].compactMap { regex($0) }

private let MED_YES_PATTERNS: [NSRegularExpression] = [
    "\\b(yes|yeah|yep|yea|yup|sure|definitely|absolutely|of\\s*course)\\b",
    "all\\s*taken", "took\\s*(them|it|all|my|every)", "taking\\s*(them|it|my)",
    "on\\s*schedule", "haven'?t\\s*missed", "every\\s*(day|morning|night|dose)",
].compactMap { regex($0) }

private let MED_NO_PATTERNS: [NSRegularExpression] = [
    "miss(ed|ing)?", "forgot", "skip(ped|ping)?",
    "didn'?t\\s*(take|remember)", "haven'?t\\s*(taken|had)",
    "not\\s*(yet|today|sure|taken)",
].compactMap { regex($0) }

private let MED_ISSUE_PATTERNS: [NSRegularExpression] = [
    "refill", "ran\\s*out", "run(ning)?\\s*out", "pharmacy", "prescription",
    "side\\s*effect", "makes?\\s*me\\s*(sick|nauseous|dizzy|tired)",
    "too\\s*(many|much|expensive|confusing)", "cost", "afford", "expensive",
].compactMap { regex($0) }

private let AFFIRMATIVE_PATTERNS: [NSRegularExpression] = [
    "^(yes|yeah|yep|yea|yup|ok|okay|sure|right|correct|exactly|definitely|absolutely)\\s*[.!]?\\s*$",
    "^(y|ye|ya|si)\\s*$",
].compactMap { regex($0) }

private let NEGATIVE_SHORT_PATTERNS: [NSRegularExpression] = [
    "^(no|nah|nope|negative|not\\s*really)\\s*[.!]?\\s*$",
    "^(n)\\s*$",
].compactMap { regex($0) }

// MARK: - Classify

func classify(_ text: String) -> ClassificationResult {
    let raw = text.trimmingCharacters(in: .whitespacesAndNewlines)
    var result = ClassificationResult(raw: raw)
    if raw.count < 2 { return result }

    // 1. Emergency
    if matchesAny(raw, EMERGENCY_PATTERNS) {
        return ClassificationResult(intent: .emergency, severity: "red", sentiment: "negative", raw: raw)
    }

    // 2. Symptoms
    var detectedSymptoms: [String] = []
    var maxSev = "green"
    for rule in SYMPTOM_RULES {
        if matches(raw, rule.pattern) && !detectedSymptoms.contains(rule.type) {
            detectedSymptoms.append(rule.type)
            if rule.severity == "yellow" { maxSev = "yellow" }
        }
    }
    if !detectedSymptoms.isEmpty {
        return ClassificationResult(intent: .specific_symptom, symptoms: detectedSymptoms, severity: maxSev, sentiment: "negative", raw: raw)
    }

    // 3. Medication
    if matchesAny(raw, MED_ISSUE_PATTERNS) { result.intent = .medication_issue; result.sentiment = "negative"; return result }
    if matchesAny(raw, MED_NO_PATTERNS) { result.intent = .medication_no; result.sentiment = "negative"; return result }
    if matchesAny(raw, MED_YES_PATTERNS) { result.intent = .medication_yes; result.sentiment = "positive"; return result }

    // 4. Affirmative / Negative short
    if matchesAny(raw, AFFIRMATIVE_PATTERNS) { result.intent = .affirmative; result.sentiment = "positive"; return result }
    if matchesAny(raw, NEGATIVE_SHORT_PATTERNS) { result.intent = .negative_short; result.sentiment = "negative"; return result }

    // 5-12. Other intents in priority order
    if matchesAny(raw, FRUSTRATION_PATTERNS) { result.intent = .frustration; result.sentiment = "negative"; return result }
    if matchesAny(raw, NEGATIVE_FEELING_PATTERNS) { result.intent = .negative_feeling; result.sentiment = "negative"; return result }
    if matchesAny(raw, EMOTIONAL_PATTERNS) { result.intent = .emotional; result.sentiment = "negative"; return result }
    if matchesAny(raw, POSITIVE_PATTERNS) { result.intent = .positive_feeling; result.sentiment = "positive"; return result }
    if matchesAny(raw, QUESTION_PATTERNS) { result.intent = .question; return result }
    if matchesAny(raw, GREETING_PATTERNS) { result.intent = .greeting; result.sentiment = "positive"; return result }
    if matchesAny(raw, GOODBYE_PATTERNS) { result.intent = .goodbye; result.sentiment = "positive"; return result }
    if matchesAny(raw, LIFE_UPDATE_PATTERNS) { result.intent = .life_update; result.sentiment = "positive"; return result }

    return result
}

// MARK: - Pick (non-repeating response selector)

func pick(_ pool: [String], _ state: inout ConversationState, _ key: String) -> String {
    guard !pool.isEmpty else { return "" }
    for (i, r) in pool.enumerated() {
        let rKey = "\(key):\(i)"
        if !state.usedResponseKeys.contains(rKey) {
            state.usedResponseKeys.append(rKey)
            return r
        }
    }
    return pool[state.turnCount % pool.count]
}

// MARK: - Quick Replies

func quickRepliesForPhase(_ phase: ConversationPhase, _ condition: Condition) -> [String] {
    switch phase {
    case .symptom_check:
        switch condition {
        case .chf: return ["Feeling good", "A bit tired", "Some swelling", "Short of breath"]
        case .copd: return ["Feeling good", "A bit tired", "Coughing more", "Harder to breathe"]
        case .pneumonia: return ["Feeling good", "A bit tired", "Still coughing", "Have a fever"]
        case .ami: return ["Feeling good", "A bit tired", "Some pain", "Not great today"]
        }
    case .symptom_followup:
        switch condition {
        case .chf: return ["No, just that", "Some swelling too", "A bit dizzy", "It's getting worse"]
        case .copd: return ["No, that's all", "More mucus", "A little wheezy", "It's getting worse"]
        default: return ["No, that's all", "A little", "Yes, getting worse", "Not sure"]
        }
    case .medication_check:
        return ["Yes, all taken", "Missed one today", "Need a refill", "Having side effects"]
    case .sdoh_screen:
        return ["Yes, all good", "Could use some help", "It's been difficult"]
    default:
        return []
    }
}

// MARK: - Build Summary

func buildSummary(_ state: ConversationState) -> String {
    if state.summaryParts.isEmpty { return "Check-in completed. No concerns reported." }
    return state.summaryParts.joined(separator: ". ") + "."
}
