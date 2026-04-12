import Foundation

// MARK: - Condition labels

private let COND_LABEL: [Condition: String] = [
    .chf: "heart failure", .copd: "COPD", .pneumonia: "pneumonia", .ami: "heart condition",
]

// MARK: - SDOH Questions

private let SDOH_QUESTIONS: [String: String] = [
    "transportation": "One more thing — do you have a way to get to your follow-up appointments? Like a car or someone who can drive you?",
    "food_insecurity": "Quick question — are you able to get enough healthy food at home? Sometimes that can be tricky after getting out of the hospital.",
    "housing_instability": "I want to make sure you have a comfortable place to recover. Is your living situation feeling stable right now?",
    "utility_difficulty": "Are you able to keep your home at a comfortable temperature? Any worries about heat, electricity, or other utilities?",
    "interpersonal_safety": "Last question — do you feel safe and supported at home? Sometimes recovery is easier when people around you are helpful.",
]

// MARK: - Process Reply (main entry)

func processReply(text: String, firstName: String, condition: Condition, dayNumber: Int, state: ConversationState) -> EngineOutput {
    let cl = classify(text)
    var nextState = state
    nextState.turnCount += 1

    if cl.severity == "red" { nextState.overallRisk = .red }
    else if cl.severity == "yellow" && nextState.overallRisk != .red { nextState.overallRisk = .yellow }

    if nextState.turnCount > 8 {
        let msg = completionMessage(firstName, dayNumber, &nextState)
        nextState.phase = .complete
        return EngineOutput(responses: [msg], nextState: nextState, isComplete: true, riskLevel: nextState.overallRisk)
    }

    let result: (responses: [String], nextPhase: ConversationPhase, isComplete: Bool)

    switch state.phase {
    case .symptom_check:
        result = handleSymptomCheck(cl: cl, firstName: firstName, condition: condition, dayNumber: dayNumber, state: &nextState)
    case .symptom_followup:
        result = handleSymptomFollowUp(cl: cl, firstName: firstName, condition: condition, state: &nextState)
    case .medication_check, .medication_followup:
        result = handleMedicationCheck(cl: cl, firstName: firstName, condition: condition, dayNumber: dayNumber, state: &nextState)
    case .sdoh_screen:
        result = handleSdohScreen(cl: cl, firstName: firstName, dayNumber: dayNumber, state: &nextState)
    case .complete:
        let msg = "Thank you, \(firstName). Your check-in is complete for today — we'll talk again tomorrow."
        result = ([msg], .complete, true)
    }

    nextState.phase = result.nextPhase
    return EngineOutput(responses: result.responses, nextState: nextState, isComplete: result.isComplete, riskLevel: nextState.overallRisk)
}

// MARK: - Symptom Check

private func handleSymptomCheck(cl: ClassificationResult, firstName: String, condition: Condition, dayNumber: Int, state: inout ConversationState) -> ([String], ConversationPhase, Bool) {
    var responses: [String] = []
    let condLabel = COND_LABEL[condition] ?? "condition"

    switch cl.intent {
    case .positive_feeling:
        let pool = dayNumber <= 7
            ? ["That's good to hear, \(firstName). The first week is really important, so I'm glad you're feeling positive.",
               "Glad to hear that, \(firstName)! Your body is still adjusting after discharge, so take it easy even on good days.",
               "That's encouraging, \(firstName). Keep listening to your body — the first few days matter a lot for your \(condLabel) recovery."]
            : dayNumber <= 20
                ? ["Great to hear, \(firstName)! You're making really solid progress.",
                   "That's wonderful, \(firstName). You've been doing well — keep it up!"]
                : ["Excellent, \(firstName)! You're nearing the end of your 30-day program and you should feel proud.",
                   "That's great news, \(firstName). You've done a fantastic job staying on top of your recovery."]
        responses.append(pick(pool, &state, "pos"))
        state.summaryParts.append("Patient reports feeling well")
        responses.append(pick(["Have you been able to take all your medications today?",
                               "Quick check — have you taken your medications as prescribed today?",
                               "And how about your medications — were you able to take them all today?"], &state, "medq"))
        return (responses, .medication_check, false)

    case .negative_feeling:
        responses.append(pick([
            "I'm sorry to hear that, \(firstName). Can you tell me a bit more? Are you having any specific symptoms — like trouble breathing, swelling, or pain?",
            "Thank you for being honest, \(firstName). I want to make sure we understand what's going on. Can you describe what's bothering you most right now?",
            "I hear you, \(firstName). That's exactly why we check in every day. What's been the hardest part?",
        ], &state, "neg"))
        state.summaryParts.append("Patient reports not feeling well: \"\(String(cl.raw.prefix(60)))\"")
        return (responses, .symptom_followup, false)

    case .specific_symptom:
        state.detectedSymptoms.append(contentsOf: cl.symptoms)
        responses.append(symptomResponse(cl.symptoms, cl.severity, condition, firstName, &state))
        if let followUp = symptomFollowUp(cl.symptoms, condition, &state) {
            responses.append(followUp)
        }
        state.summaryParts.append("Reports \(cl.symptoms.joined(separator: ", "))")
        return (responses, .symptom_followup, false)

    case .emotional:
        responses.append(pick([
            "I really appreciate you sharing that, \(firstName). It's completely natural to feel that way during recovery. You're not alone — your care team is here for you.",
            "Thank you for telling me, \(firstName). Recovery isn't just physical — how you're feeling emotionally matters too. I've noted this for your care coordinator.",
        ], &state, "emot"))
        state.summaryParts.append("Emotional concern: \"\(String(cl.raw.prefix(60)))\"")
        if state.overallRisk == .green { state.overallRisk = .yellow }
        responses.append(pick(["On the physical side — any trouble breathing, pain, or swelling today?",
                               "And how about physically — any new symptoms or changes since yesterday?"], &state, "physq"))
        return (responses, .symptom_followup, false)

    case .greeting:
        let symptomQ = condition == .chf ? "shortness of breath, swelling, or changes" : condition == .copd ? "breathing changes, coughing, or fatigue" : "new symptoms or concerns"
        responses.append("Hi \(firstName)! Good to hear from you. How are you feeling today? Any \(symptomQ)?")
        return (responses, .symptom_check, false)

    case .life_update:
        responses.append(pick([
            "That's great to hear, \(firstName) — it sounds like you're getting back into your routine! Now for your daily check-in: how are you feeling physically today?",
            "I love hearing that, \(firstName)! Staying active and connected is so important for recovery. How about your body — any symptoms or concerns today?",
        ], &state, "life"))
        return (responses, .symptom_followup, false)

    case .frustration:
        responses.append(pick([
            "I understand, \(firstName), and I'm sorry if this feels like a lot. These daily check-ins are designed to catch problems early. I'll keep it quick today.",
            "I hear you, \(firstName). I know it can be tiring. But catching a small issue now can prevent a big one later. Just a couple quick questions.",
        ], &state, "frust"))
        responses.append("How are you feeling physically today? Just a quick answer is fine.")
        return (responses, .symptom_followup, false)

    case .affirmative:
        responses.append(pick([
            "Good to hear! Any specific symptoms today — breathing trouble, swelling, pain, or anything else?",
            "Glad to hear it, \(firstName). Just to be thorough — no shortness of breath, swelling, or new pain?",
        ], &state, "affirm"))
        return (responses, .symptom_followup, false)

    case .negative_short:
        responses.append(pick([
            "I'm sorry to hear that, \(firstName). Can you tell me what's going on? Any specific symptoms like trouble breathing, pain, or swelling?",
            "Thanks for being honest. What's been bothering you most? Even a short answer helps me understand.",
        ], &state, "negsh"))
        state.summaryParts.append("Patient reports not feeling well")
        return (responses, .symptom_followup, false)

    case .goodbye:
        responses.append("Thank you, \(firstName)! But before we wrap up — let me quickly check: any symptoms or health concerns today? Even just \"all good\" works.")
        return (responses, .symptom_followup, false)

    case .question:
        responses.append(questionResponse(cl.raw, condition, firstName, &state))
        responses.append("Now let me check on you — how are you feeling physically today?")
        return (responses, .symptom_followup, false)

    default:
        responses.append(pick([
            "Thanks for your message, \(firstName). How are you feeling physically today? Any symptoms or concerns?",
            "Got it, \(firstName)! For today's check-in: how's your body doing? Any pain, breathing trouble, or other symptoms?",
        ], &state, "unc"))
        return (responses, .symptom_followup, false)
    }
}

// MARK: - Symptom Follow-Up

private func handleSymptomFollowUp(cl: ClassificationResult, firstName: String, condition: Condition, state: inout ConversationState) -> ([String], ConversationPhase, Bool) {
    var responses: [String] = []

    switch cl.intent {
    case .specific_symptom:
        state.detectedSymptoms.append(contentsOf: cl.symptoms)
        responses.append(symptomResponse(cl.symptoms, cl.severity, condition, firstName, &state))
        state.summaryParts.append("Also reports \(cl.symptoms.joined(separator: ", "))")

    case .positive_feeling, .affirmative:
        responses.append(pick(["That's reassuring — thank you for the details.",
                               "Good to hear, \(firstName). I've noted everything in today's report."], &state, "fupos"))

    case .negative_feeling:
        responses.append(pick([
            "I'm sorry you're feeling this way, \(firstName). I've made a note for your care team.",
            "Thank you for telling me, \(firstName). I've flagged it for follow-up.",
        ], &state, "funeg"))
        state.summaryParts.append("General discomfort: \"\(String(cl.raw.prefix(60)))\"")
        if state.overallRisk == .green { state.overallRisk = .yellow }

    case .emotional:
        responses.append(pick([
            "I really appreciate you sharing that, \(firstName). Your emotional wellbeing matters just as much as the physical side.",
            "Thank you for being open about that, \(firstName). Recovery can be emotionally tough.",
        ], &state, "fuemot"))
        state.summaryParts.append("Emotional concern reported")
        if state.overallRisk == .green { state.overallRisk = .yellow }

    case .frustration:
        responses.append("I understand, \(firstName). We're almost done — just one more quick question.")

    default:
        responses.append(pick(["Got it, \(firstName). Thank you for sharing.",
                               "Understood. I've noted that in today's report.",
                               "Thanks, \(firstName). I appreciate you telling me."], &state, "fuunk"))
    }

    responses.append(pick([
        "Now let me check on your medications — have you been able to take them all today?",
        "One more thing — how are you doing with your medications? Taken them all today?",
        "And your medications — have you been able to take everything as prescribed?",
    ], &state, "medq"))

    return (responses, .medication_check, false)
}

// MARK: - Medication Check

private func handleMedicationCheck(cl: ClassificationResult, firstName: String, condition: Condition, dayNumber: Int, state: inout ConversationState) -> ([String], ConversationPhase, Bool) {
    var responses: [String] = []
    let condLabel = COND_LABEL[condition] ?? "condition"
    let sdohDomain = sdohDomainForDay(dayNumber)

    var medIntent = cl.intent
    if ![.medication_yes, .medication_no, .medication_issue].contains(medIntent) {
        if cl.intent == .affirmative || cl.intent == .positive_feeling { medIntent = .medication_yes }
        else if cl.intent == .negative_short || cl.intent == .negative_feeling { medIntent = .medication_no }
    }

    switch medIntent {
    case .medication_yes:
        responses.append(pick([
            "Great job staying on top of your medications — that's one of the most important things for your recovery.",
            "Wonderful, \(firstName). Consistent medication is really making a difference in your recovery.",
        ], &state, "medy"))
        state.medicationStatus = "adherent"
        state.summaryParts.append("Medications taken as prescribed")

    case .medication_no:
        responses.append(pick([
            "Thank you for being honest, \(firstName). Missing a dose happens, but it's important to get back on track. Your medications are key for managing your \(condLabel).",
            "I appreciate you telling me, \(firstName). Try to take your next dose on schedule.",
        ], &state, "medn"))
        state.medicationStatus = "missed"
        state.summaryParts.append("Missed medication doses")
        if state.overallRisk == .green { state.overallRisk = .yellow }

    case .medication_issue:
        responses.append(pick([
            "I understand, \(firstName). Medication issues are really common after discharge. I've flagged it for your care coordinator.",
            "Thank you for letting me know. Your care coordinator can help — whether it's a refill, cost, or side effects.",
        ], &state, "medi"))
        state.medicationStatus = "needs_help"
        state.summaryParts.append("Medication issue: \"\(String(cl.raw.prefix(60)))\"")
        if state.overallRisk == .green { state.overallRisk = .yellow }

    case .question:
        responses.append(questionResponse(cl.raw, condition, firstName, &state))
        responses.append("And about your medications — have you been able to take them today?")
        return (responses, .medication_check, false)

    case .specific_symptom:
        state.detectedSymptoms.append(contentsOf: cl.symptoms)
        responses.append(symptomResponse(cl.symptoms, cl.severity, condition, firstName, &state))
        state.summaryParts.append("Additional symptom: \(cl.symptoms.joined(separator: ", "))")
        responses.append("And your medications — have you been able to take them today?")
        return (responses, .medication_check, false)

    default:
        responses.append(pick([
            "Got it, \(firstName). Just a reminder — taking your medications consistently is really important for your \(condLabel).",
            "Thank you, \(firstName). If you need help with medications — refills, reminders, or understanding — your coordinator is there for you.",
        ], &state, "medunk"))
        state.summaryParts.append("Medication status unclear")
    }

    if let domain = sdohDomain, let question = SDOH_QUESTIONS[domain] {
        responses.append(question)
        return (responses, .sdoh_screen, false)
    }

    responses.append(completionMessage(firstName, dayNumber, &state))
    return (responses, .complete, true)
}

// MARK: - SDOH Screen

private func handleSdohScreen(cl: ClassificationResult, firstName: String, dayNumber: Int, state: inout ConversationState) -> ([String], ConversationPhase, Bool) {
    var responses: [String] = []
    let domain = sdohDomainForDay(dayNumber) ?? "transportation"
    let hasConcern = cl.intent == .negative_short || cl.intent == .negative_feeling ||
        cl.sentiment == "negative" || cl.raw.range(of: "no|don't|can't|difficult|hard|struggle|trouble|problem|worry|help|need", options: [.regularExpression, .caseInsensitive]) != nil

    if hasConcern && cl.intent != .positive_feeling && cl.intent != .affirmative {
        let domainResponses: [String: String] = [
            "transportation": "I understand, \(firstName). Getting to appointments can be tough. I've flagged this for your care coordinator — they can help arrange transportation.",
            "food_insecurity": "Thank you for telling me, \(firstName). Proper nutrition is important for recovery. I've let your coordinator know.",
            "housing_instability": "I appreciate you sharing that, \(firstName). A stable living situation makes a big difference in recovery. Your coordinator will follow up.",
            "utility_difficulty": "I'm sorry to hear that, \(firstName). Staying comfortable at home matters for healing. I've flagged this for your coordinator.",
            "interpersonal_safety": "Thank you for trusting me with that, \(firstName). Your safety is the most important thing. I've flagged this for your care coordinator.",
        ]
        responses.append(domainResponses[domain] ?? "Thank you for sharing, \(firstName). I've flagged this for your coordinator.")
        state.sdohConcern = domain
        state.summaryParts.append("SDOH concern flagged: \(domain.replacingOccurrences(of: "_", with: " "))")
        if state.overallRisk == .green { state.overallRisk = .yellow }
    } else {
        responses.append(pick([
            "Good to hear — I'm glad that's not a concern. Thank you for answering.",
            "That's great, \(firstName). Just want to make sure you have everything you need.",
        ], &state, "sdohok"))
    }

    responses.append(completionMessage(firstName, dayNumber, &state))
    return (responses, .complete, true)
}

// MARK: - Response Helpers

private func symptomResponse(_ symptoms: [String], _ severity: String, _ condition: Condition, _ firstName: String, _ state: inout ConversationState) -> String {
    let condLabel = COND_LABEL[condition] ?? "condition"
    if severity == "yellow" {
        if symptoms.contains("breathing") {
            return pick([
                "Thank you for telling me about your breathing, \(firstName). With \(condLabel), changes in breathing are something we take seriously. I've flagged this for your care coordinator. Please rest and call 911 if it gets worse.",
                "I appreciate you letting me know, \(firstName). Shortness of breath is an important signal. I've shared this with your coordinator right away.",
            ], &state, "sybreath")
        }
        if symptoms.contains("swelling") {
            return pick([
                "Swelling is something we watch closely with \(condLabel), \(firstName). I've flagged this for your coordinator. Try to elevate your feet and weigh yourself tomorrow morning.",
                "Thank you for mentioning the swelling, \(firstName). I've let your care team know. Try to keep your feet elevated and reduce salt intake.",
            ], &state, "syswell")
        }
        if symptoms.contains("chest_pain") {
            return "\(firstName), chest discomfort is always worth paying attention to. I've flagged this for your care team immediately. If the pain gets worse, spreads to your arm or jaw, or you feel short of breath, please call 911."
        }
        if symptoms.contains("fever") {
            return "A fever is important to monitor during recovery, \(firstName). I've let your coordinator know. Please drink plenty of fluids. If it goes above 101.5°F, call your care team right away."
        }
        return "Thank you for letting me know, \(firstName). I've flagged this for your care coordinator so they can follow up with you."
    }

    if symptoms.contains("fatigue") {
        return pick([
            "Some tiredness is normal during recovery, \(firstName). Make sure you're getting enough rest and staying hydrated.",
            "Fatigue is common after discharge, \(firstName). Your body is healing and that takes energy. Try to balance rest with gentle movement.",
        ], &state, "syfat")
    }
    if symptoms.contains("pain") {
        return "Some mild discomfort can be part of recovery, \(firstName). Keep track of it — if the pain gets worse, please tell your care team."
    }
    return "Thank you for letting me know, \(firstName). I've noted this in today's check-in."
}

private func symptomFollowUp(_ symptoms: [String], _ condition: Condition, _ state: inout ConversationState) -> String? {
    if symptoms.contains("breathing") && condition == .chf {
        return pick(["Have you noticed any swelling in your ankles or feet today?",
                     "Have your shoes or socks been feeling tighter than usual?"], &state, "fuq")
    }
    if symptoms.contains("breathing") && condition == .copd {
        return pick(["Have you noticed any changes in your mucus — like a different color or more than usual?",
                     "Are you using your inhaler more often than usual?"], &state, "fuq")
    }
    if symptoms.contains("swelling") {
        return pick(["Have you been weighing yourself? Any sudden weight gain?",
                     "Is the swelling new today, or has it been building up?"], &state, "fuq")
    }
    return nil
}

private func questionResponse(_ text: String, _ condition: Condition, _ firstName: String, _ state: inout ConversationState) -> String {
    let lower = text.lowercased()
    if lower.contains("normal") || lower.contains("supposed to") {
        return "That's a great question, \(firstName). If you're concerned about whether something is normal, it's always best to check with your care team."
    }
    if lower.contains("when") || lower.contains("appointment") || lower.contains("doctor") {
        return "Good question, \(firstName). Your care coordinator would have the best answer about appointments and follow-ups."
    }
    if lower.contains("eat") || lower.contains("food") || lower.contains("diet") || lower.contains("salt") {
        let advice = condition == .chf ? "With heart failure, watching your salt and fluid intake is important." : "Good nutrition helps your body heal."
        return "\(advice) For specific diet questions, your care team can give you personalized guidance, \(firstName)."
    }
    return "That's a good question, \(firstName). I'll flag this for your care coordinator so they can follow up with you directly."
}

private func completionMessage(_ firstName: String, _ dayNumber: Int, _ state: inout ConversationState) -> String {
    if state.overallRisk == .yellow {
        return "That's everything for today, \(firstName). I've shared your responses with your care team, and someone may follow up. If anything gets worse, please call your care coordinator. Take care."
    }
    if dayNumber == 1 {
        return "You've completed your very first check-in, \(firstName)! You're doing great. I'll be here again tomorrow. Remember, your care team is just a call away."
    }
    if dayNumber >= 28 {
        return "Thank you, \(firstName)! You're almost at the end of your 30-day program — you should be really proud. Just a few more days!"
    }
    return pick([
        "That's everything for today, \(firstName). You're doing a great job with your recovery. Rest well, and I'll check in again tomorrow.",
        "All done for today! Thank you for taking the time, \(firstName). Take care of yourself.",
        "Check-in complete, \(firstName)! You're making great progress. See you tomorrow.",
    ], &state, "comp")
}
