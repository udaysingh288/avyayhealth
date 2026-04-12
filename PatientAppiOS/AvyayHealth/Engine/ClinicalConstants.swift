import Foundation

// MARK: - RED Emergency Keywords

let RED_KEYWORDS: [String] = [
    "cannot breathe", "can't breathe", "cant breathe", "hard to breathe",
    "trouble breathing", "chest pain", "chest hurts", "blue lips",
    "blue fingers", "passed out", "fainted", "heart attack",
    "not breathing", "unconscious", "dying", "very short of breath",
    "extremely short of breath", "can't sleep lying flat",
]

func containsRedKeyword(_ text: String) -> Bool {
    let lower = text.lowercased()
    return RED_KEYWORDS.contains { lower.contains($0) }
}

// MARK: - Emergency Patterns

let EMERGENCY_PATTERNS: [NSRegularExpression] = {
    let patterns = [
        "can'?t\\s*breathe", "cannot\\s*breathe", "hard\\s*to\\s*breathe",
        "chest\\s*pain", "chest\\s*hurts?", "severe\\s*chest",
        "blue\\s*(lips?|fingers?|nails?)", "passed?\\s*out", "fainted",
        "heart\\s*attack", "not\\s*breathing", "unconscious",
        "\\b911\\b", "\\bdying\\b", "can'?t\\s*sleep\\s*(lying|flat)",
        "very\\s*short\\s*of\\s*breath", "extremely\\s*short\\s*of\\s*breath",
    ]
    return patterns.compactMap { try? NSRegularExpression(pattern: $0, options: .caseInsensitive) }
}()

// MARK: - Symptom Rules

struct SymptomRule {
    let pattern: NSRegularExpression
    let type: String
    let severity: String // "green" or "yellow"
}

let SYMPTOM_RULES: [SymptomRule] = {
    let defs: [(String, String, String)] = [
        ("short(ness)?\\s*(of\\s*)?breath", "breathing", "yellow"),
        ("breath(ing|less|e)\\s*(hard|difficult|worse|problem)", "breathing", "yellow"),
        ("hard(er)?\\s*to\\s*breathe", "breathing", "yellow"),
        ("winded", "breathing", "yellow"),
        ("wheez(ing|e|y)", "breathing", "yellow"),
        ("gasping", "breathing", "yellow"),
        ("swell(ing|ed|olen)", "swelling", "yellow"),
        ("ankle.*(puff|swell|big)", "swelling", "yellow"),
        ("feet.*(swell|puff|big)", "swelling", "yellow"),
        ("legs?.*(swell|puff|big|heavy)", "swelling", "yellow"),
        ("puffy", "swelling", "yellow"),
        ("bloat(ed|ing)?", "swelling", "yellow"),
        ("chest\\s*(tight|pressure|discomfort)", "chest_pain", "yellow"),
        ("tight(ness)?\\s*(in\\s*(my\\s*)?)?chest", "chest_pain", "yellow"),
        ("cough(ing|ed|s)?", "cough", "green"),
        ("cough.*(worse|more|bad|constant)", "cough", "yellow"),
        ("hack(ing)?", "cough", "green"),
        ("mucus", "mucus", "yellow"),
        ("phlegm", "mucus", "yellow"),
        ("(green|yellow|brown|bloody)\\s*(mucus|phlegm|sputum)", "mucus", "yellow"),
        ("tired", "fatigue", "green"),
        ("exhaust(ed|ing)", "fatigue", "green"),
        ("fatigue", "fatigue", "green"),
        ("no\\s*energy", "fatigue", "green"),
        ("weak(ness)?", "fatigue", "green"),
        ("worn\\s*out", "fatigue", "green"),
        ("wiped\\s*out", "fatigue", "green"),
        ("drain(ed|ing)", "fatigue", "green"),
        ("pain(ful|s|ing)?", "pain", "green"),
        ("\\bhurts?\\b", "pain", "green"),
        ("\\bsore(ness)?\\b", "pain", "green"),
        ("\\bach(e|es|ing|y)\\b", "pain", "green"),
        ("throb(bing)?", "pain", "green"),
        ("fever", "fever", "yellow"),
        ("temperature", "fever", "yellow"),
        ("chills?", "fever", "yellow"),
        ("sweating", "fever", "green"),
        ("weight\\s*(gain|up|increase)", "weight_gain", "yellow"),
        ("gain(ed|ing)?\\s*weight", "weight_gain", "yellow"),
        ("heavier", "weight_gain", "yellow"),
        ("dizz(y|iness)", "dizziness", "yellow"),
        ("light\\s*head(ed)?", "dizziness", "yellow"),
        ("vertigo", "dizziness", "yellow"),
        ("room\\s*(spin|swirl|mov)", "dizziness", "yellow"),
        ("unsteady", "dizziness", "green"),
        ("nause(a|ous|ated)", "nausea", "yellow"),
        ("throw(ing)?\\s*up", "nausea", "yellow"),
        ("threw\\s*up", "nausea", "yellow"),
        ("vomit(ing|ed)?", "nausea", "yellow"),
        ("sick\\s*to\\s*(my\\s*)?stomach", "nausea", "yellow"),
        ("queasy", "nausea", "green"),
        ("can'?t\\s*sleep", "sleep", "green"),
        ("couldn'?t\\s*sleep", "sleep", "green"),
        ("trouble\\s*sleep", "sleep", "green"),
        ("insomnia", "sleep", "green"),
        ("up\\s*all\\s*night", "sleep", "green"),
        ("no\\s*appetite", "appetite", "green"),
        ("not\\s*(eating|hungry)", "appetite", "green"),
        ("can'?t\\s*eat", "appetite", "green"),
        ("lost\\s*(my\\s*)?appetite", "appetite", "green"),
        ("confus(ed|ing|ion)", "confusion", "yellow"),
        ("foggy", "confusion", "green"),
        ("forgetful", "confusion", "green"),
        ("brain\\s*fog", "confusion", "green"),
    ]

    return defs.compactMap { (pat, type, sev) in
        guard let regex = try? NSRegularExpression(pattern: pat, options: .caseInsensitive) else { return nil }
        return SymptomRule(pattern: regex, type: type, severity: sev)
    }
}()

// MARK: - SDOH

let SDOH_SCREENING_DAYS = [3, 7, 14, 21, 28]
let SDOH_DOMAINS: [String] = [
    "transportation", "food_insecurity", "housing_instability",
    "utility_difficulty", "interpersonal_safety",
]

func sdohDomainForDay(_ day: Int) -> String? {
    guard let idx = SDOH_SCREENING_DAYS.firstIndex(of: day), idx < SDOH_DOMAINS.count else { return nil }
    return SDOH_DOMAINS[idx]
}
