/**
 * Conversation phase handlers.
 *
 * Each handler processes patient input for a specific phase
 * (symptom check, symptom follow-up, medication check, SDOH screen)
 * and returns the next phase + responses.
 */

import type { Condition } from '../types';
import { SDOH_SCREENING_DAYS, SDOH_DOMAINS } from '@shared/constants/sdoh';
import type { PhaseInput, PhaseOutput } from './types';
import {
  pick,
  generateSymptomResponse,
  generateSymptomFollowUp,
  generateQuestionResponse,
  generateCompletionMessage,
} from './responses';

// ─── Condition labels ─────────────────────────────────────────────

const COND_LABEL: Record<Condition, string> = {
  chf: 'heart failure',
  copd: 'COPD',
  pneumonia: 'pneumonia',
  ami: 'heart condition',
};

// ─── SDOH helpers ─────────────────────────────────────────────────

function sdohDomainForDay(day: number): string | null {
  const idx = (SDOH_SCREENING_DAYS as readonly number[]).indexOf(day);
  return idx >= 0 ? SDOH_DOMAINS[idx] ?? null : null;
}

const SDOH_QUESTIONS: Record<string, string> = {
  transportation: 'One more thing — do you have a way to get to your follow-up appointments? Like a car or someone who can drive you?',
  food_insecurity: 'Quick question — are you able to get enough healthy food at home? Sometimes that can be tricky after getting out of the hospital.',
  housing_instability: 'I want to make sure you have a comfortable place to recover. Is your living situation feeling stable right now?',
  utility_difficulty: 'Are you able to keep your home at a comfortable temperature? Any worries about heat, electricity, or other utilities?',
  interpersonal_safety: 'Last question — do you feel safe and supported at home? Sometimes recovery is easier when people around you are helpful.',
};

// ─── Phase: Symptom Check ─────────────────────────────────────────

export function handleSymptomCheck(input: PhaseInput): PhaseOutput {
  const { cl, firstName, condition, dayNumber, state } = input;
  const responses: string[] = [];

  switch (cl.intent) {
    case 'positive_feeling': {
      const pool = dayNumber <= 7
        ? [
            `That's good to hear, ${firstName}. The first week is really important, so I'm glad you're feeling ${cl.raw.length < 20 ? 'well' : 'positive'}.`,
            `Glad to hear that, ${firstName}! Your body is still adjusting after discharge, so take it easy even on good days.`,
            `That's encouraging, ${firstName}. Keep listening to your body — the first few days matter a lot for your ${COND_LABEL[condition]} recovery.`,
          ]
        : dayNumber <= 20
          ? [
              `Great to hear, ${firstName}! You're making really solid progress.`,
              `That's wonderful, ${firstName}. You've been doing well — keep it up!`,
              `Good to hear you're feeling well, ${firstName}. Your recovery is on track.`,
            ]
          : [
              `Excellent, ${firstName}! You're nearing the end of your 30-day program and you should feel proud of how far you've come.`,
              `That's great news, ${firstName}. You've done a fantastic job staying on top of your recovery.`,
              `Wonderful, ${firstName}! You're really close to completing your program. Great work.`,
            ];

      responses.push(pick(pool, state, 'pos'));
      state.summaryParts.push('Patient reports feeling well');
      responses.push(pick([
        'Have you been able to take all your medications today?',
        'Quick check — have you taken your medications as prescribed today?',
        'And how about your medications — were you able to take them all today?',
      ], state, 'medq'));
      return { responses, nextPhase: 'medication_check', isComplete: false };
    }

    case 'negative_feeling': {
      const pool = [
        `I'm sorry to hear that, ${firstName}. Can you tell me a bit more? Are you having any specific symptoms — like trouble breathing, swelling, or pain?`,
        `Thank you for being honest, ${firstName}. I want to make sure we understand what's going on. Can you describe what's bothering you most right now?`,
        `I hear you, ${firstName}. That's exactly why we check in every day. What's been the hardest part — is it physical symptoms, or more how you're feeling overall?`,
      ];
      responses.push(pick(pool, state, 'neg'));
      state.summaryParts.push(`Patient reports not feeling well: "${cl.raw.slice(0, 60)}"`);
      return { responses, nextPhase: 'symptom_followup', isComplete: false };
    }

    case 'specific_symptom': {
      state.detectedSymptoms.push(...cl.symptoms);
      responses.push(generateSymptomResponse(cl.symptoms, cl.severity, condition, firstName, state));
      const followUp = generateSymptomFollowUp(cl.symptoms, condition, state);
      if (followUp) responses.push(followUp);
      const symptomStr = cl.symptoms.join(', ');
      state.summaryParts.push(`Reports ${symptomStr}`);
      return { responses, nextPhase: 'symptom_followup', isComplete: false };
    }

    case 'emotional': {
      const pool = [
        `I really appreciate you sharing that, ${firstName}. It's completely natural to feel that way during recovery. You're not alone — your care team is here for you, and these feelings often get better with time.`,
        `Thank you for telling me, ${firstName}. Recovery isn't just physical — how you're feeling emotionally matters too. I've noted this for your care coordinator so they can check in with you.`,
        `I hear you, ${firstName}, and I want you to know that what you're feeling is valid. Many patients go through this. Would it help to talk to your care coordinator? I can flag this for them.`,
      ];
      responses.push(pick(pool, state, 'emot'));
      state.summaryParts.push(`Emotional concern: "${cl.raw.slice(0, 60)}"`);
      if (state.overallRisk === 'green') state.overallRisk = 'yellow';
      responses.push(pick([
        'On the physical side — any trouble breathing, pain, or swelling today?',
        'And how about physically — any new symptoms or changes since yesterday?',
      ], state, 'physq'));
      return { responses, nextPhase: 'symptom_followup', isComplete: false };
    }

    case 'greeting': {
      const pool = [
        `Hi ${firstName}! Good to hear from you. How are you feeling today? Any ${condition === 'chf' ? 'shortness of breath, swelling, or changes' : condition === 'copd' ? 'breathing changes, coughing, or fatigue' : 'new symptoms or concerns'}?`,
        `Hello ${firstName}! Let's check in on your recovery. How's your body feeling today?`,
      ];
      responses.push(pick(pool, state, 'greet'));
      return { responses, nextPhase: 'symptom_check', isComplete: false };
    }

    case 'life_update': {
      const pool = [
        `That's great to hear, ${firstName} — it sounds like you're getting back into your routine, which is a good sign! Now for your daily check-in: how are you feeling physically today?`,
        `I love hearing that, ${firstName}! Staying active and connected is so important for recovery. How about your body — any symptoms or concerns today?`,
        `That's wonderful, ${firstName}. It sounds like you're doing well. Let me quickly check on the medical side — any pain, breathing trouble, or swelling today?`,
      ];
      responses.push(pick(pool, state, 'life'));
      return { responses, nextPhase: 'symptom_followup', isComplete: false };
    }

    case 'question': {
      responses.push(generateQuestionResponse(cl.raw, condition, firstName, state));
      responses.push(pick([
        'Now let me check on you — how are you feeling physically today?',
        'Back to your check-in — any symptoms or concerns today?',
      ], state, 'backq'));
      return { responses, nextPhase: 'symptom_followup', isComplete: false };
    }

    case 'frustration': {
      const pool = [
        `I understand, ${firstName}, and I'm sorry if this feels like a lot. These daily check-ins are designed to catch problems early so you don't end up back in the hospital. I'll keep it quick today.`,
        `I hear you, ${firstName}. I know it can be tiring to answer questions every day. But catching a small issue now can prevent a big one later. Just a couple quick questions and we're done for today.`,
      ];
      responses.push(pick(pool, state, 'frust'));
      responses.push('How are you feeling physically today? Just a quick answer is fine.');
      return { responses, nextPhase: 'symptom_followup', isComplete: false };
    }

    case 'goodbye': {
      responses.push(`Thank you, ${firstName}! But before we wrap up — let me quickly check: any symptoms or health concerns today? Even just "all good" works.`);
      return { responses, nextPhase: 'symptom_followup', isComplete: false };
    }

    case 'affirmative':
    case 'negative_short': {
      if (cl.intent === 'affirmative') {
        responses.push(pick([
          `Good to hear! Any specific symptoms today — breathing trouble, swelling, pain, or anything else?`,
          `Glad to hear it, ${firstName}. Just to be thorough — no shortness of breath, swelling, or new pain?`,
        ], state, 'affirm'));
      } else {
        responses.push(pick([
          `I'm sorry to hear that, ${firstName}. Can you tell me what's going on? Any specific symptoms like trouble breathing, pain, or swelling?`,
          `Thanks for being honest. What's been bothering you most? Even a short answer helps me understand.`,
        ], state, 'negsh'));
        state.summaryParts.push('Patient reports not feeling well');
      }
      return { responses, nextPhase: 'symptom_followup', isComplete: false };
    }

    default: {
      const pool = [
        `Thanks for your message, ${firstName}. I want to make sure I check on the right things — how are you feeling physically today? Any symptoms or concerns?`,
        `Got it, ${firstName}! For today's check-in, I need to ask: how's your body doing? Any pain, breathing trouble, or other symptoms?`,
        `Thank you, ${firstName}. Let me ask more specifically — on a good day to bad day scale, how are you feeling? And any new symptoms?`,
      ];
      responses.push(pick(pool, state, 'unc'));
      return { responses, nextPhase: 'symptom_followup', isComplete: false };
    }
  }
}

// ─── Phase: Symptom Follow-Up ─────────────────────────────────────

export function handleSymptomFollowUp(input: PhaseInput): PhaseOutput {
  const { cl, firstName, condition, state } = input;
  const responses: string[] = [];

  switch (cl.intent) {
    case 'specific_symptom': {
      state.detectedSymptoms.push(...cl.symptoms);
      responses.push(generateSymptomResponse(cl.symptoms, cl.severity, condition, firstName, state));
      const symptomStr = cl.symptoms.join(', ');
      state.summaryParts.push(`Also reports ${symptomStr}`);
      break;
    }

    case 'positive_feeling':
    case 'affirmative': {
      responses.push(pick([
        "That's reassuring — thank you for the details.",
        `Good to hear, ${firstName}. I've noted everything in today's report.`,
        "That's good news. Thank you for letting me know.",
      ], state, 'fupos'));
      break;
    }

    case 'negative_feeling': {
      responses.push(pick([
        `I'm sorry you're feeling this way, ${firstName}. I've made a note for your care team so they can check on you.`,
        `Thank you for telling me, ${firstName}. I want your care coordinator to know about this — I've flagged it for follow-up.`,
      ], state, 'funeg'));
      state.summaryParts.push(`General discomfort: "${cl.raw.slice(0, 60)}"`);
      if (state.overallRisk === 'green') state.overallRisk = 'yellow';
      break;
    }

    case 'negative_short': {
      responses.push(pick([
        `Okay, ${firstName}. I've noted that. Let's keep an eye on things.`,
        "Understood. If anything changes, please let me know tomorrow.",
      ], state, 'funs'));
      break;
    }

    case 'emotional': {
      responses.push(pick([
        `I really appreciate you sharing that, ${firstName}. Your emotional wellbeing matters just as much as the physical side. I've noted this for your coordinator.`,
        `Thank you for being open about that, ${firstName}. Recovery can be emotionally tough, and your care team wants to support you through it.`,
      ], state, 'fuemot'));
      state.summaryParts.push(`Emotional concern reported`);
      if (state.overallRisk === 'green') state.overallRisk = 'yellow';
      break;
    }

    case 'life_update': {
      responses.push(pick([
        `That's really nice to hear, ${firstName}. Sounds like recovery is going in the right direction.`,
        `Love hearing that, ${firstName}! Those everyday moments are a great sign.`,
      ], state, 'fulife'));
      break;
    }

    case 'question': {
      responses.push(generateQuestionResponse(cl.raw, condition, firstName, state));
      break;
    }

    case 'frustration': {
      responses.push(`I understand, ${firstName}. We're almost done — just one more quick question.`);
      break;
    }

    default: {
      responses.push(pick([
        `Got it, ${firstName}. Thank you for sharing.`,
        `Understood. I've noted that in today's report.`,
        `Thanks, ${firstName}. I appreciate you telling me.`,
      ], state, 'fuunk'));
      break;
    }
  }

  // Move to medication check
  responses.push(pick([
    'Now let me check on your medications — have you been able to take them all today?',
    'One more thing — how are you doing with your medications? Taken them all today?',
    'And your medications — have you been able to take everything as prescribed?',
  ], state, 'medq'));

  return { responses, nextPhase: 'medication_check', isComplete: false };
}

// ─── Phase: Medication Check ──────────────────────────────────────

export function handleMedicationCheck(input: PhaseInput): PhaseOutput {
  const { cl, firstName, condition, dayNumber, state } = input;
  const responses: string[] = [];
  const sdohDomain = sdohDomainForDay(dayNumber);

  let medIntent = cl.intent;
  if (!['medication_yes', 'medication_no', 'medication_issue'].includes(medIntent)) {
    if (cl.intent === 'affirmative' || cl.intent === 'positive_feeling') medIntent = 'medication_yes';
    else if (cl.intent === 'negative_short' || cl.intent === 'negative_feeling') medIntent = 'medication_no';
  }

  switch (medIntent) {
    case 'medication_yes': {
      responses.push(pick([
        'Great job staying on top of your medications — that\'s one of the most important things for your recovery.',
        `Wonderful, ${firstName}. Consistent medication is really making a difference in your recovery.`,
        "That's excellent. Taking your meds consistently is the single best thing you can do right now.",
      ], state, 'medy'));
      state.medicationStatus = 'adherent';
      state.summaryParts.push('Medications taken as prescribed');
      break;
    }

    case 'medication_no': {
      responses.push(pick([
        `Thank you for being honest about that, ${firstName}. Missing a dose happens, but it's important to get back on track. Your medications are a key part of managing your ${COND_LABEL[condition]}. I've noted this for your coordinator.`,
        `I appreciate you telling me, ${firstName}. Try to take your next dose on schedule. If you're having trouble remembering, your care team can help set up reminders.`,
      ], state, 'medn'));
      state.medicationStatus = 'missed';
      state.summaryParts.push('Missed medication doses');
      if (state.overallRisk === 'green') state.overallRisk = 'yellow';
      break;
    }

    case 'medication_issue': {
      responses.push(pick([
        `I understand, ${firstName}. Medication issues are really common after discharge — you're not alone in this. I've flagged it for your care coordinator so they can help sort it out.`,
        `Thank you for letting me know. Your care coordinator can help with this — whether it's a refill, cost, or side effects. I've made a note for them.`,
      ], state, 'medi'));
      state.medicationStatus = 'needs_help';
      state.summaryParts.push(`Medication issue: "${cl.raw.slice(0, 60)}"`);
      if (state.overallRisk === 'green') state.overallRisk = 'yellow';
      break;
    }

    case 'question': {
      responses.push(generateQuestionResponse(cl.raw, condition, firstName, state));
      responses.push('And about your medications — have you been able to take them today?');
      return { responses, nextPhase: 'medication_check', isComplete: false };
    }

    case 'specific_symptom': {
      state.detectedSymptoms.push(...cl.symptoms);
      responses.push(generateSymptomResponse(cl.symptoms, cl.severity, condition, firstName, state));
      state.summaryParts.push(`Additional symptom: ${cl.symptoms.join(', ')}`);
      responses.push('And your medications — have you been able to take them today?');
      return { responses, nextPhase: 'medication_check', isComplete: false };
    }

    default: {
      responses.push(pick([
        `Got it, ${firstName}. Just a reminder — taking your medications consistently is really important for your ${COND_LABEL[condition]}. If you ever have trouble, your care team can help.`,
        `Thank you, ${firstName}. If you need any help with your medications — refills, reminders, or understanding what they do — your care coordinator is there for you.`,
      ], state, 'medunk'));
      state.summaryParts.push('Medication status unclear');
      break;
    }
  }

  // Check if SDOH screening today
  if (sdohDomain && SDOH_QUESTIONS[sdohDomain]) {
    responses.push(SDOH_QUESTIONS[sdohDomain]);
    return { responses, nextPhase: 'sdoh_screen', isComplete: false };
  }

  // Complete
  responses.push(generateCompletionMessage(firstName, dayNumber, state));
  return { responses, nextPhase: 'complete', isComplete: true };
}

// ─── Phase: SDOH Screen ──────────────────────────────────────────

export function handleSdohScreen(input: PhaseInput): PhaseOutput {
  const { cl, firstName, dayNumber, state } = input;
  const responses: string[] = [];
  const domain = sdohDomainForDay(dayNumber) ?? 'transportation';

  const hasConcern =
    cl.intent === 'negative_short' ||
    cl.intent === 'negative_feeling' ||
    cl.intent === 'sdoh_concern' ||
    cl.sentiment === 'negative' ||
    /no|don'?t|can'?t|cant|difficult|hard|struggle|trouble|problem|worry|help|need/i.test(cl.raw);

  if (hasConcern && cl.intent !== 'positive_feeling' && cl.intent !== 'affirmative') {
    const domainResponses: Record<string, string> = {
      transportation: `I understand, ${firstName}. Getting to appointments can be really tough. I've flagged this for your care coordinator — they can help arrange transportation for your follow-up visits.`,
      food_insecurity: `Thank you for telling me, ${firstName}. Having proper nutrition is important for your recovery. I've let your coordinator know — they can connect you with local food programs that can help.`,
      housing_instability: `I appreciate you sharing that, ${firstName}. A stable living situation makes a big difference in recovery. Your coordinator will follow up to see how they can help.`,
      utility_difficulty: `I'm sorry to hear that, ${firstName}. Staying comfortable at home matters for healing. I've flagged this for your coordinator — there may be assistance programs available.`,
      interpersonal_safety: `Thank you for trusting me with that, ${firstName}. Your safety is the most important thing. I've flagged this for your care coordinator — they will reach out to you privately.`,
    };
    responses.push(domainResponses[domain] ?? `Thank you for sharing, ${firstName}. I've flagged this for your coordinator to follow up.`);
    state.sdohConcern = domain;
    state.summaryParts.push(`SDOH concern flagged: ${domain.replace(/_/g, ' ')}`);
    if (state.overallRisk === 'green') state.overallRisk = 'yellow';
  } else {
    responses.push(pick([
      "Good to hear — I'm glad that's not a concern. Thank you for answering.",
      `That's great, ${firstName}. Just want to make sure you have everything you need.`,
      "Perfect. We ask these questions to make sure nothing falls through the cracks during your recovery.",
    ], state, 'sdohok'));
  }

  // Complete
  responses.push(generateCompletionMessage(firstName, dayNumber, state));
  return { responses, nextPhase: 'complete', isComplete: true };
}
