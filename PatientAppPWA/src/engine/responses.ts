/**
 * Response generators for the conversation engine.
 *
 * Contains response pool selection, symptom-specific responses,
 * follow-up generators, question handling, and completion messages.
 */

import type { Condition } from '../types';
import type { SymptomType, ConversationState } from './types';

// ─── Condition labels ─────────────────────────────────────────────

const COND_LABEL: Record<Condition, string> = {
  chf: 'heart failure',
  copd: 'COPD',
  pneumonia: 'pneumonia',
  ami: 'heart condition',
};

// ─── Response pool picker ─────────────────────────────────────────

export function pick(pool: string[], state: ConversationState, key: string): string {
  if (pool.length === 0) return '';
  for (const r of pool) {
    const rKey = `${key}:${pool.indexOf(r)}`;
    if (!state.usedResponseKeys.includes(rKey)) {
      state.usedResponseKeys.push(rKey);
      return r;
    }
  }
  return pool[state.turnCount % pool.length];
}

// ─── Symptom responses ────────────────────────────────────────────

export function generateSymptomResponse(
  symptoms: SymptomType[],
  severity: 'green' | 'yellow' | 'red',
  condition: Condition,
  firstName: string,
  state: ConversationState,
): string {
  // RED should be caught by containsRedKeyword before reaching here,
  // but handle it as yellow to be safe
  if (severity === 'red') severity = 'yellow';
  if (severity === 'yellow') {
    if (symptoms.includes('breathing')) {
      if (condition === 'chf') {
        return pick([
          `Thank you for telling me about your breathing, ${firstName}. With ${COND_LABEL[condition]}, changes in breathing are something we take seriously. I've flagged this for your care coordinator — they may reach out today. Please rest and call your care team or 911 if it gets worse.`,
          `I appreciate you letting me know, ${firstName}. Shortness of breath is an important signal with heart failure. I've shared this with your coordinator right away. Try to rest in an upright position, and if your breathing gets significantly worse, please call for help.`,
        ], state, 'sybreath');
      }
      if (condition === 'copd') {
        return pick([
          `Thank you for telling me, ${firstName}. Breathing changes are important to track with COPD. I've shared this with your coordinator. Keep your rescue inhaler nearby, and call your care team if it gets significantly worse.`,
          `I hear you, ${firstName}. Changes in breathing with COPD need attention. I've flagged this for your coordinator. Try pursed-lip breathing if it helps, and don't hesitate to call your care team.`,
        ], state, 'sybreath');
      }
      return `Thank you for letting me know, ${firstName}. I've flagged your breathing concerns for your care team. Please rest and call them if it gets worse.`;
    }

    if (symptoms.includes('swelling')) {
      return pick([
        `Swelling is something we watch closely with ${COND_LABEL[condition]}, ${firstName}. I've flagged this for your coordinator. Try to elevate your feet when you can, and weigh yourself tomorrow morning — if you gain more than 2 pounds overnight, call your care team.`,
        `Thank you for mentioning the swelling, ${firstName}. I've let your care team know. Try to keep your feet elevated and reduce salt intake. If the swelling gets suddenly worse or you have trouble breathing, call your care team right away.`,
      ], state, 'syswell');
    }

    if (symptoms.includes('chest_pain')) {
      return `${firstName}, chest discomfort is always worth paying attention to. I've flagged this for your care team immediately. If the pain gets worse, spreads to your arm or jaw, or you feel short of breath, please call 911 right away. Otherwise, your coordinator will follow up with you.`;
    }

    if (symptoms.includes('fever')) {
      return pick([
        `A fever is important to monitor during recovery, ${firstName}. I've let your coordinator know. Please drink plenty of fluids and keep track of your temperature. If it goes above 101.5°F or you feel much worse, call your care team right away.`,
        `Thank you for telling me about the fever, ${firstName}. I've flagged this for your care team. Stay hydrated and rest. If your temperature keeps rising or you develop new symptoms, please call for help.`,
      ], state, 'syfever');
    }

    if (symptoms.includes('dizziness') || symptoms.includes('nausea')) {
      return pick([
        `Thank you for telling me, ${firstName}. Dizziness can sometimes be related to your medications or your condition. I've flagged this for your coordinator. Please sit or lie down when you feel dizzy, and make sure you're drinking enough water.`,
        `I appreciate you mentioning that, ${firstName}. I've let your care team know. Try to move slowly when standing up, stay hydrated, and call your care team if it continues or gets worse.`,
      ], state, 'sydiznau');
    }

    if (symptoms.includes('cough') || symptoms.includes('mucus')) {
      return pick([
        `Changes in your cough or mucus are worth noting, ${firstName}. I've flagged this for your coordinator. Keep track of the color and amount — and call your care team if you develop a fever or your breathing gets worse.`,
        `Thank you for telling me about that, ${firstName}. I've let your care team know. Watch for any fever, blood in your mucus, or worsening breathing — those would need more urgent attention.`,
      ], state, 'sycough');
    }

    if (symptoms.includes('weight_gain')) {
      return `Sudden weight gain can be an important signal with ${COND_LABEL[condition]}, ${firstName}. I've flagged this for your coordinator. Keep weighing yourself each morning and try to limit salt intake. If you gain more than 3 pounds in a day, call your care team.`;
    }

    if (symptoms.includes('confusion')) {
      return `Thank you for mentioning that, ${firstName}. Any changes in mental clarity are worth noting. I've shared this with your care team. Make sure you're staying hydrated and getting enough rest.`;
    }

    return `Thank you for letting me know, ${firstName}. I've flagged this for your care coordinator so they can follow up with you. Please rest and call your care team if anything gets worse.`;
  }

  // Green severity — mild
  if (symptoms.includes('fatigue')) {
    return pick([
      `Some tiredness is normal during recovery, ${firstName}, but I'm glad you mentioned it. Make sure you're getting enough rest and staying hydrated. If the fatigue gets much worse or you can't do daily activities, let me know tomorrow.`,
      `Fatigue is common after discharge, ${firstName}. Your body is healing and that takes energy. Try to balance rest with gentle movement — even short walks can help. Let me know if it gets worse.`,
    ], state, 'syfat');
  }
  if (symptoms.includes('sleep')) {
    return pick([
      `Sleep trouble can be common during recovery, ${firstName}. Try to keep a regular schedule and avoid screens before bed. If you need extra pillows to breathe comfortably at night, that's something to tell your care team about.`,
      `I'm sorry you're having trouble sleeping, ${firstName}. Good rest is important for healing. If you find yourself needing to sleep sitting up or waking up gasping, please let me know — that's something your care team would want to know about.`,
    ], state, 'sysleep');
  }
  if (symptoms.includes('pain')) {
    return pick([
      `Some mild discomfort can be part of recovery, ${firstName}. Keep track of it — if the pain gets worse, moves to a new area, or becomes hard to manage, please tell your care team.`,
      `Thank you for mentioning that, ${firstName}. I've noted it. If the pain increases or you need something stronger for relief, your care team can help.`,
    ], state, 'sypain');
  }
  if (symptoms.includes('appetite')) {
    return pick([
      `Appetite changes can happen during recovery, ${firstName}. Try small, frequent meals and make sure you're staying hydrated. If you go more than a day without eating, please let your care team know.`,
      `That's worth noting, ${firstName}. Even if you're not very hungry, try to eat small amounts throughout the day — your body needs fuel to heal.`,
    ], state, 'syapp');
  }
  if (symptoms.includes('cough')) {
    return pick([
      `A mild cough can be normal during recovery. Keep an eye on it, ${firstName} — if it gets worse or you notice any blood, contact your care team.`,
      `I've noted the cough, ${firstName}. Watch for any changes in color, amount, or if you develop a fever. Those would be worth calling your care team about.`,
    ], state, 'sycoughmild');
  }

  return `Thank you for letting me know, ${firstName}. I've noted this in today's check-in. Keep monitoring how you feel.`;
}

// ─── Symptom follow-up questions ──────────────────────────────────

export function generateSymptomFollowUp(
  symptoms: SymptomType[],
  condition: Condition,
  state: ConversationState,
): string | null {
  if (symptoms.includes('breathing') && condition === 'chf') {
    return pick([
      'Have you noticed any swelling in your ankles or feet today?',
      'Have your shoes or socks been feeling tighter than usual?',
    ], state, 'fuq');
  }
  if (symptoms.includes('breathing') && condition === 'copd') {
    return pick([
      'Have you noticed any changes in your mucus — like a different color or more than usual?',
      'Are you using your inhaler more often than usual?',
    ], state, 'fuq');
  }
  if (symptoms.includes('swelling')) {
    return pick([
      'Have you been weighing yourself? Any sudden weight gain in the last day or two?',
      'Is the swelling new today, or has it been building up over a few days?',
    ], state, 'fuq');
  }
  if (symptoms.includes('cough') || symptoms.includes('mucus')) {
    return pick([
      'Have you had any fever or chills along with the cough?',
      'When is the cough worst — at night, in the morning, or all day?',
    ], state, 'fuq');
  }
  return null;
}

// ─── Question responses ───────────────────────────────────────────

export function generateQuestionResponse(
  text: string,
  condition: Condition,
  firstName: string,
  state: ConversationState,
): string {
  const lower = text.toLowerCase();

  if (/normal/i.test(lower) || /supposed\s*to/i.test(lower) || /is\s*(this|that|it)\s*(ok|normal)/i.test(lower)) {
    return pick([
      `That's a great question, ${firstName}. If you're concerned about whether something is normal, it's always best to check with your care team. They can give you specific guidance for your situation. Would you like me to flag this question for your coordinator?`,
      `I appreciate you asking, ${firstName}. Everyone's recovery is a little different. Your care coordinator is the best person to answer that — I'll make sure they know you had this question.`,
    ], state, 'qnorm');
  }

  if (/when|appointment|follow.?up|visit|doctor/i.test(lower)) {
    return `Good question, ${firstName}. Your care coordinator would have the best answer about appointments and follow-ups. I'll note your question so they can get back to you.`;
  }

  if (/eat|food|diet|salt|sodium|drink|water|fluid/i.test(lower)) {
    const dietAdvice = condition === 'chf'
      ? 'With heart failure, watching your salt and fluid intake is important. As a general rule, try to limit sodium and follow any fluid restrictions your doctor gave you.'
      : 'Good nutrition helps your body heal. Try to eat balanced meals and stay hydrated.';
    return `${dietAdvice} For specific diet questions, your care team can give you personalized guidance, ${firstName}. I'll note your question.`;
  }

  if (/exercis|walk|active|move|stairs/i.test(lower)) {
    return `Activity is great for recovery, but it's important to follow your doctor's specific guidelines, ${firstName}. Start slow and listen to your body. If any activity makes you feel short of breath, dizzy, or causes pain, stop and rest. Your care team can help create an activity plan that's right for you.`;
  }

  return pick([
    `That's a good question, ${firstName}. I want to make sure you get the right answer — I'll flag this for your care coordinator so they can follow up with you directly.`,
    `I appreciate you asking, ${firstName}. For specific medical questions, your care coordinator is the best person to help. I've noted your question for them.`,
  ], state, 'qgen');
}

// ─── Completion messages ──────────────────────────────────────────

export function generateCompletionMessage(
  firstName: string,
  dayNumber: number,
  state: ConversationState,
): string {
  if (state.overallRisk === 'yellow') {
    return pick([
      `That's everything for today, ${firstName}. I've shared your responses with your care team, and someone may follow up with you. If anything gets worse before tomorrow, please call your care coordinator right away. Take care.`,
      `Thank you for checking in, ${firstName}. Because of some of the things you mentioned, I've made sure your care team has all the details. Don't hesitate to call them if you need anything before our next check-in.`,
    ], state, 'compwarn');
  }

  if (dayNumber === 1) {
    return `You've completed your very first check-in, ${firstName}! You're doing great. I'll be here again tomorrow — same time. Remember, your care team is just a call away if you need anything. Rest well tonight.`;
  }

  if (dayNumber >= 28) {
    return `Thank you, ${firstName}! You're almost at the end of your 30-day program — you should be really proud of how far you've come. Just a few more days! Take care and I'll talk to you tomorrow.`;
  }

  return pick([
    `That's everything for today, ${firstName}. You're doing a great job with your recovery. Rest well, and I'll check in again tomorrow.`,
    `All done for today! Thank you for taking the time, ${firstName}. Take care of yourself, and I'll talk to you tomorrow.`,
    `Check-in complete, ${firstName}! You're making great progress. See you tomorrow — have a good rest of your day.`,
    `Thank you, ${firstName}. Today's check-in is all set. Keep doing what you're doing, and I'll be back tomorrow.`,
  ], state, 'comp');
}
