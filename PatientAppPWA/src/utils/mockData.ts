import type { PatientSession, TodayCheckin, DayHistory, Message } from '../types';

export const MOCK_SESSION: PatientSession = {
  patient_id: 'pat-001',
  first_name: 'Maria',
  condition: 'chf',
  discharge_date: '2026-04-07T10:00:00Z',
  days_in_program: 3,
  total_days: 30,
  hospital_name: 'Riverside Community Medical Center',
  coordinator_first_name: 'Sarah',
  token: 'demo-patient-token',
};

const baseMessages: Message[] = [
  {
    id: 'm-1',
    role: 'ai',
    content: 'Good morning, Maria! It\'s Day 3 of your recovery. How are you feeling today? Any pain, shortness of breath, or swelling?',
    sent_at: new Date(Date.now() - 3600000).toISOString(),
    risk_level: null,
  },
];

export const MOCK_CHECKIN_PENDING: TodayCheckin = {
  checkin_id: 'ci-day3',
  day_number: 3,
  status: 'pending',
  question: 'Good morning, Maria! It\'s Day 3 of your recovery. How are you feeling today? Any pain, shortness of breath, or swelling?',
  conversation: baseMessages,
  completed_at: null,
};

export const MOCK_CHECKIN_COMPLETED: TodayCheckin = {
  checkin_id: 'ci-day3',
  day_number: 3,
  status: 'completed',
  question: '',
  conversation: [
    ...baseMessages,
    {
      id: 'm-2',
      role: 'patient',
      content: 'Feeling a bit tired, some swelling in my ankle.',
      sent_at: new Date(Date.now() - 2400000).toISOString(),
      risk_level: null,
    },
    {
      id: 'm-3',
      role: 'ai',
      content: 'Thank you for letting me know. Ankle swelling after discharge is worth watching. I\'ve let your care team know. Please rest with your feet elevated when you can. One more quick question — are you able to get to your follow-up appointment next week?',
      sent_at: new Date(Date.now() - 2000000).toISOString(),
      risk_level: 'yellow',
    },
    {
      id: 'm-4',
      role: 'patient',
      content: 'I don\'t have a ride, my son works during the day.',
      sent_at: new Date(Date.now() - 1800000).toISOString(),
      risk_level: null,
    },
    {
      id: 'm-5',
      role: 'ai',
      content: 'Got it — I\'ve flagged this for your care coordinator Sarah, who will help arrange transportation for you. You\'re doing great, Maria. We\'ll check in again tomorrow.',
      sent_at: new Date(Date.now() - 1600000).toISOString(),
      risk_level: null,
    },
  ],
  completed_at: new Date(Date.now() - 1600000).toISOString(),
};

// Build 30-day history
export const MOCK_HISTORY: DayHistory[] = Array.from({ length: 30 }, (_, i) => {
  const dayNum = i + 1;
  const date = new Date('2026-04-07');
  date.setDate(date.getDate() + i);

  if (dayNum > 3) {
    return { day_number: dayNum, date: date.toISOString(), status: 'pending', risk_level: null, summary: null };
  }

  const histories: Record<number, DayHistory> = {
    1: {
      day_number: 1,
      date: '2026-04-08T08:00:00Z',
      status: 'completed',
      risk_level: 'red',
      summary: 'Reported dizziness and nausea. Care team was notified.',
    },
    2: {
      day_number: 2,
      date: '2026-04-09T08:00:00Z',
      status: 'completed',
      risk_level: 'yellow',
      summary: 'Mild fatigue, took all medications. Transportation barrier flagged.',
    },
    3: {
      day_number: 3,
      date: '2026-04-10T08:00:00Z',
      status: 'pending',
      risk_level: null,
      summary: null,
    },
  };

  return histories[dayNum] ?? { day_number: dayNum, date: date.toISOString(), status: 'pending', risk_level: null, summary: null };
});

