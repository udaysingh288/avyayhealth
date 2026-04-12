#!/usr/bin/env node
// reset-and-seed.mjs
// =====================================================
// Cleans up all test data (patients, check_ins, messages, sdoh_flags)
// and inserts realistic sample patients with conversation histories
// for testing the coordinator and quality dashboards.
//
// Usage:
//   SUPABASE_URL=https://gehcrdcgxifryfwjhpoz.supabase.co \
//   SUPABASE_SERVICE_KEY=<your-service-role-key> \
//     node scripts/reset-and-seed.mjs
//
// This does NOT touch hospitals, coordinators, profiles, or auth users.
// Only patient-side data is cleaned and re-seeded.
// =====================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY env vars.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ─── Helpers ──────────────────────────────────────────

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function hoursAgo(n) {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

function minutesAgo(n) {
  const d = new Date();
  d.setMinutes(d.getMinutes() - n);
  return d.toISOString();
}

// ─── Sample patient data ──────────────────────────────

const PATIENTS = [
  {
    first_name: 'Maria',
    last_name: 'Gonzalez',
    dob: '1958-03-12',
    condition: 'chf',
    discharge_days_ago: 5,
    days_in_program: 5,
    phone: '2015559101',
    status: 'active',
  },
  {
    first_name: 'James',
    last_name: 'Washington',
    dob: '1950-07-22',
    condition: 'copd',
    discharge_days_ago: 12,
    days_in_program: 12,
    phone: '2015559202',
    status: 'active',
  },
  {
    first_name: 'Dorothy',
    last_name: 'Chen',
    dob: '1945-11-08',
    condition: 'chf',
    discharge_days_ago: 3,
    days_in_program: 3,
    phone: '2015559303',
    status: 'active',
  },
  {
    first_name: 'Robert',
    last_name: 'Miller',
    dob: '1952-01-30',
    condition: 'copd',
    discharge_days_ago: 18,
    days_in_program: 18,
    phone: '2015559404',
    status: 'active',
  },
  {
    first_name: 'Sandra',
    last_name: 'Kim',
    dob: '1963-09-14',
    condition: 'chf',
    discharge_days_ago: 7,
    days_in_program: 7,
    phone: '2015559505',
    status: 'active',
  },
  {
    first_name: 'Benjamin',
    last_name: 'Brown',
    dob: '1948-05-20',
    condition: 'pneumonia',
    discharge_days_ago: 2,
    days_in_program: 2,
    phone: '2015559606',
    status: 'active',
  },
  {
    first_name: 'Natalia',
    last_name: 'Sousa',
    dob: '1960-12-03',
    condition: 'ami',
    discharge_days_ago: 10,
    days_in_program: 10,
    phone: '2015559707',
    status: 'active',
  },
  {
    first_name: 'William',
    last_name: 'Patel',
    dob: '1955-06-17',
    condition: 'chf',
    discharge_days_ago: 22,
    days_in_program: 22,
    phone: '2015559808',
    status: 'active',
  },
];

// Check-in scenarios per patient (keyed by first_name)
// Each patient has check-in history for recent days
const CHECK_IN_SCENARIOS = {
  Maria: {
    // RED — ankle swelling and shortness of breath, day 5
    latestDay: 5,
    checkins: [
      {
        day: 1,
        status: 'completed',
        risk: 'green',
        summary: 'First day post-discharge. Reports feeling okay, mild tiredness. Medications taken.',
        messages: [
          { role: 'ai', content: "Hi Maria, it's Avyay Health. Welcome home! How are you feeling today on your first day after discharge?" },
          { role: 'patient', content: 'I feel okay, just a little tired from the hospital stay.' },
          { role: 'ai', content: "That's completely normal, Maria. Rest is important right now. Have you been able to take your medications today?" },
          { role: 'patient', content: 'Yes I took everything this morning with breakfast.' },
          { role: 'ai', content: "Great job! Rest well today, and I'll check in with you tomorrow. Take care, Maria." },
        ],
      },
      {
        day: 2,
        status: 'completed',
        risk: 'green',
        summary: 'Day 2 CHF. Feeling better, no symptoms reported. Meds taken on schedule.',
        messages: [
          { role: 'ai', content: "Good morning Maria, it's day 2 of your recovery. How are you feeling today?" },
          { role: 'patient', content: 'Feeling a little better today. I slept well last night.' },
          { role: 'ai', content: "That's wonderful to hear! Good sleep is so important for recovery. Any swelling in your feet or ankles?" },
          { role: 'patient', content: 'No swelling that I can see. Everything looks normal.' },
          { role: 'ai', content: "That's great news. Have you taken your medications today?" },
          { role: 'patient', content: 'Yes all taken.' },
          { role: 'ai', content: "Perfect, Maria. Keep it up! I'll check in again tomorrow." },
        ],
      },
      {
        day: 3,
        status: 'completed',
        risk: 'green',
        summary: 'Day 3 CHF. Stable. Has transportation to follow-up appointment.',
        messages: [
          { role: 'ai', content: "Hi Maria, day 3! How's your breathing today?" },
          { role: 'patient', content: 'Breathing is fine. I walked around the house a bit today.' },
          { role: 'ai', content: "That's great progress! One quick question — do you have transportation to get to your follow-up appointment next week?" },
          { role: 'patient', content: 'Yes my daughter will drive me.' },
          { role: 'ai', content: "Wonderful. You're doing really well, Maria. See you tomorrow!" },
        ],
      },
      {
        day: 4,
        status: 'completed',
        risk: 'yellow',
        summary: 'Day 4 CHF. Reports mild ankle swelling starting. Meds taken. Coordinator notified.',
        messages: [
          { role: 'ai', content: "Good morning Maria! How are you feeling today? Any changes?" },
          { role: 'patient', content: 'My ankles are a little puffy today. Not sure if that is normal.' },
          { role: 'ai', content: "Thank you for telling me, Maria. Some mild swelling can happen, but it's important to monitor. I've noted this for your care coordinator. Are you weighing yourself each morning?" },
          { role: 'patient', content: "I forgot to weigh myself today. I'll do it tomorrow." },
          { role: 'ai', content: "Please do — and let me know if you gain more than 2 pounds overnight. Have you taken all your medications?" },
          { role: 'patient', content: 'Yes all taken on time.' },
          { role: 'ai', content: "Good. Keep those feet elevated when you're sitting. Your care team has been notified about the swelling." },
        ],
      },
      {
        day: 5,
        status: 'escalated',
        risk: 'red',
        summary: 'URGENT: Day 5 CHF. Worsening ankle swelling, shortness of breath going upstairs. Cannot sleep flat. Coordinator alerted immediately.',
        hoursAgo: 2,
        messages: [
          { role: 'ai', content: "Hi Maria, it's day 5. How are you feeling this morning? Has the swelling changed?" },
          { role: 'patient', content: "The swelling is worse today. Both ankles are puffy and I'm more breathless going upstairs. I couldn't sleep flat last night." },
          { role: 'ai', content: "Maria, this sounds like it needs attention right away. The combination of worsening swelling and trouble breathing is something your care team needs to know about immediately. I've sent an urgent alert. Please rest and keep your feet elevated. If breathing gets worse, call 911." },
        ],
      },
    ],
  },
  James: {
    // YELLOW — coughing more, missed meds
    latestDay: 12,
    checkins: [
      {
        day: 10,
        status: 'completed',
        risk: 'green',
        summary: 'Day 10 COPD. Stable. Using inhaler as prescribed. No increased symptoms.',
        messages: [
          { role: 'ai', content: "Hi James, day 10 of your recovery. How's your breathing today?" },
          { role: 'patient', content: 'Breathing is about the same. Doing my inhaler every morning.' },
          { role: 'ai', content: "Good to hear you're staying consistent with the inhaler. Any changes in your cough or mucus?" },
          { role: 'patient', content: 'No changes. The usual morning cough but nothing different.' },
          { role: 'ai', content: "That's reassuring. Keep it up, James!" },
        ],
      },
      {
        day: 11,
        status: 'completed',
        risk: 'green',
        summary: 'Day 11 COPD. Stable. Went for a short walk. Meds taken.',
        messages: [
          { role: 'ai', content: "Good morning James! How are things today?" },
          { role: 'patient', content: 'Pretty good. I went for a short walk around the block this morning.' },
          { role: 'ai', content: "That's wonderful! Physical activity within your limits is great for recovery. How was your breathing during the walk?" },
          { role: 'patient', content: 'A little winded at the end but I took it slow.' },
          { role: 'ai', content: "Smart approach. Rest when you need to. See you tomorrow, James!" },
        ],
      },
      {
        day: 12,
        status: 'completed',
        risk: 'yellow',
        summary: 'Day 12 COPD. Coughing more than usual. No fever. Missed evening inhaler yesterday. Coordinator should follow up.',
        hoursAgo: 4,
        messages: [
          { role: 'ai', content: "Hi James, day 12 check-in. How are you feeling today?" },
          { role: 'patient', content: 'Coughing more than usual today. No fever though.' },
          { role: 'ai', content: "Thanks for letting me know, James. Increased coughing is worth watching. Has the color of your mucus changed at all?" },
          { role: 'patient', content: "It's a bit more yellowish than normal I think." },
          { role: 'ai', content: "I've noted that for your care team. Yellow mucus can sometimes signal an infection starting. Have you been taking all your inhalers?" },
          { role: 'patient', content: 'I forgot the evening one yesterday but took everything today.' },
          { role: 'ai', content: "Try to stay on schedule — the maintenance inhaler is important even when you feel okay. Your coordinator will follow up about the cough and mucus change." },
        ],
      },
    ],
  },
  Dorothy: {
    // RED — severe breathing difficulty, day 3
    latestDay: 3,
    checkins: [
      {
        day: 1,
        status: 'completed',
        risk: 'green',
        summary: 'Day 1 CHF. First check-in went well. Mild fatigue only. Meds taken.',
        messages: [
          { role: 'ai', content: "Hello Dorothy, welcome home! I'm Avyay Health and I'll be checking in on you every day. How are you feeling?" },
          { role: 'patient', content: 'Im feeling ok just tired from everything' },
          { role: 'ai', content: "That's very normal, Dorothy. Your body needs rest right now. Have you been able to take your medications?" },
          { role: 'patient', content: 'Yes my son helped me organize them' },
          { role: 'ai', content: "That's great to have help! Rest well and I'll check in tomorrow." },
        ],
      },
      {
        day: 2,
        status: 'completed',
        risk: 'yellow',
        summary: 'Day 2 CHF. Reports some shortness of breath. Mild. Meds taken. Monitoring.',
        messages: [
          { role: 'ai', content: "Good morning Dorothy, how are you feeling on day 2?" },
          { role: 'patient', content: 'A little short of breath when I walk to the kitchen' },
          { role: 'ai', content: "Thank you for sharing that. Mild shortness of breath with activity can be normal after discharge, but we want to keep an eye on it. Does it go away when you rest?" },
          { role: 'patient', content: 'Yes it gets better when I sit down' },
          { role: 'ai', content: "That's good. Take things slowly and rest often. I've noted this for your care team. Medications all taken?" },
          { role: 'patient', content: 'Yes' },
          { role: 'ai', content: "Great. If breathing gets worse or doesn't improve with rest, please let me know right away." },
        ],
      },
      {
        day: 3,
        status: 'escalated',
        risk: 'red',
        summary: 'URGENT: Day 3 CHF. Cannot sleep lying flat. Very short of breath at rest. Possible decompensation. 911 recommended.',
        hoursAgo: 1,
        messages: [
          { role: 'ai', content: "Good morning Dorothy. How is your breathing today compared to yesterday?" },
          { role: 'patient', content: 'Cannot sleep lying flat, very short of breath just sitting here' },
          { role: 'ai', content: "Dorothy, this sounds urgent. Please call 911 or have someone take you to the emergency room right away. Being short of breath at rest and unable to lie flat are serious warning signs. Your care team has been notified immediately." },
        ],
      },
    ],
  },
  Robert: {
    // GREEN — stable, doing well on day 18
    latestDay: 18,
    checkins: [
      {
        day: 16,
        status: 'completed',
        risk: 'green',
        summary: 'Day 16 COPD. Stable. Breathing well. Enjoying gentle walks.',
        messages: [
          { role: 'ai', content: "Hi Robert, day 16. How's everything going?" },
          { role: 'patient', content: 'Doing well. Went for two walks today, breathing is good.' },
          { role: 'ai', content: "That's excellent progress, Robert! Two walks is great. Keep listening to your body." },
        ],
      },
      {
        day: 17,
        status: 'completed',
        risk: 'green',
        summary: 'Day 17 COPD. Stable. No symptoms. Meds on schedule.',
        messages: [
          { role: 'ai', content: "Good morning Robert! How's day 17 treating you?" },
          { role: 'patient', content: 'Good morning. Feeling strong today. The grandkids visited yesterday and I kept up with them for a bit.' },
          { role: 'ai', content: "That sounds wonderful! It's great that you're feeling more energy. Just remember to pace yourself. All medications taken?" },
          { role: 'patient', content: 'Yes sir, all on schedule.' },
          { role: 'ai', content: "Perfect. You're doing great, Robert!" },
        ],
      },
      {
        day: 18,
        status: 'completed',
        risk: 'green',
        summary: 'Day 18 COPD. Stable and improving. Good engagement.',
        hoursAgo: 3,
        messages: [
          { role: 'ai', content: "Hi Robert, day 18 check-in! How are you?" },
          { role: 'patient', content: 'Feeling good, went for a short walk today. No breathing problems.' },
          { role: 'ai', content: "Wonderful! You're really making great progress. Keep it up and I'll see you tomorrow." },
        ],
      },
    ],
  },
  Sandra: {
    // GREEN — stable, day 7, SDOH flag for transportation
    latestDay: 7,
    checkins: [
      {
        day: 6,
        status: 'completed',
        risk: 'green',
        summary: 'Day 6 CHF. Stable. Mild fatigue but improving. Meds taken.',
        messages: [
          { role: 'ai', content: "Hi Sandra, how are you feeling on day 6?" },
          { role: 'patient', content: 'A little tired but better than yesterday. No swelling.' },
          { role: 'ai', content: "Good to hear the improvement! And great that there's no swelling. Rest when you need to. Medications?" },
          { role: 'patient', content: 'All taken.' },
          { role: 'ai', content: "Perfect. See you tomorrow, Sandra!" },
        ],
      },
      {
        day: 7,
        status: 'completed',
        risk: 'green',
        summary: 'Day 7 CHF. Stable. SDOH: Transportation barrier flagged — no ride to follow-up. Coordinator notified.',
        hoursAgo: 1,
        messages: [
          { role: 'ai', content: "Good morning Sandra! Day 7 — one week of recovery. How are you feeling?" },
          { role: 'patient', content: 'Feeling good today, went for a short walk.' },
          { role: 'ai', content: "That's great progress! One quick question — do you have a way to get to your follow-up appointment this week?" },
          { role: 'patient', content: "No I don't have a ride and my son works during the day." },
          { role: 'ai', content: "I understand. I've flagged this for your care coordinator — they'll help arrange transportation for your appointment. It's important you don't miss it." },
        ],
      },
    ],
    sdoh_flags: [{ domain: 'transportation', notes: 'No transportation to follow-up appointment. Son works during the day. Needs ride arranged.' }],
  },
  Benjamin: {
    // YELLOW — early days, some fever
    latestDay: 2,
    checkins: [
      {
        day: 1,
        status: 'completed',
        risk: 'green',
        summary: 'Day 1 Pneumonia. First check-in. Mild cough, taking antibiotics. Stable.',
        messages: [
          { role: 'ai', content: "Hi Benjamin, welcome home! How are you feeling after being discharged?" },
          { role: 'patient', content: 'Still coughing but the doctor said that would continue for a while. Taking my antibiotics.' },
          { role: 'ai', content: "Yes, the cough can linger as your lungs heal. The most important thing is finishing the full course of antibiotics. How's your temperature?" },
          { role: 'patient', content: 'Normal when I checked this morning.' },
          { role: 'ai', content: "Good. Rest and fluids are your best friends right now. See you tomorrow, Benjamin!" },
        ],
      },
      {
        day: 2,
        status: 'completed',
        risk: 'yellow',
        summary: 'Day 2 Pneumonia. Low-grade fever 100.4°F. Cough unchanged. Taking antibiotics. Monitor for fever increase.',
        hoursAgo: 5,
        messages: [
          { role: 'ai', content: "Good morning Benjamin. How are you doing today?" },
          { role: 'patient', content: 'I have a mild fever today, 100.4. Cough is about the same.' },
          { role: 'ai', content: "Thank you for checking your temperature. A low-grade fever is worth monitoring but not unusual in early pneumonia recovery. Keep taking your antibiotics on schedule and drink plenty of fluids. If the fever goes above 102°F, let me know right away." },
          { role: 'patient', content: 'Ok I will. Should I be worried?' },
          { role: 'ai', content: "At this level, no need to worry — your body is still fighting the infection and the antibiotics are helping. Just keep resting and I'll check on you again tomorrow. Your care team has been notified about the fever." },
        ],
      },
    ],
  },
  Natalia: {
    // GREEN — AMI recovery, doing well
    latestDay: 10,
    checkins: [
      {
        day: 9,
        status: 'completed',
        risk: 'green',
        summary: 'Day 9 AMI recovery. No chest pain. Walking daily. Meds on schedule.',
        messages: [
          { role: 'ai', content: "Hi Natalia, day 9 check-in! How are you feeling?" },
          { role: 'patient', content: 'Good! No chest pain. I did my 15-minute walk this morning.' },
          { role: 'ai', content: "That's wonderful progress. Walking daily is really important for your heart recovery. Any dizziness or shortness of breath?" },
          { role: 'patient', content: 'No, I felt good during the walk.' },
          { role: 'ai', content: "Excellent. Keep it up, Natalia!" },
        ],
      },
      {
        day: 10,
        status: 'completed',
        risk: 'green',
        summary: 'Day 10 AMI. Stable. Feeling positive. Has food access. Good engagement.',
        hoursAgo: 6,
        messages: [
          { role: 'ai', content: "Good morning Natalia! How's day 10 going?" },
          { role: 'patient', content: 'Feeling really positive today. My energy is coming back slowly.' },
          { role: 'ai', content: "That's so good to hear! Your recovery is going really well. Have you been able to get healthy food and meals easily?" },
          { role: 'patient', content: 'Yes my neighbor has been bringing me meals and I went to the grocery store yesterday.' },
          { role: 'ai', content: "That's great support to have! A heart-healthy diet makes a big difference. I'll see you tomorrow, Natalia." },
        ],
      },
    ],
  },
  William: {
    // GREEN — late in program, day 22, very stable
    latestDay: 22,
    checkins: [
      {
        day: 21,
        status: 'completed',
        risk: 'green',
        summary: 'Day 21 CHF. Stable. SDOH screen: No housing concerns. Feeling safe at home.',
        messages: [
          { role: 'ai', content: "Hi William, day 21 — three weeks of recovery! How are you?" },
          { role: 'patient', content: 'Doing well. The swelling has been gone for over a week now.' },
          { role: 'ai', content: "That's excellent news! One question for today — do you feel safe and stable in your living situation?" },
          { role: 'patient', content: 'Yes, I live with my wife and we have a comfortable home. No concerns there.' },
          { role: 'ai', content: "Great to hear. You're really approaching the finish line, William. Just 9 more days!" },
        ],
      },
      {
        day: 22,
        status: 'completed',
        risk: 'green',
        summary: 'Day 22 CHF. Stable, improving, nearing program end. Strong compliance.',
        hoursAgo: 8,
        messages: [
          { role: 'ai', content: "Good morning William! Day 22 check-in." },
          { role: 'patient', content: 'Morning! Feeling great. Took a longer walk today, about 20 minutes.' },
          { role: 'ai', content: "20 minutes is wonderful progress! Just make sure you're not pushing too hard. All medications taken?" },
          { role: 'patient', content: 'Every day, on the dot.' },
          { role: 'ai', content: "You've been a model patient, William. See you tomorrow!" },
        ],
      },
    ],
  },
};

// ─── Main ─────────────────────────────────────────────

async function main() {
  console.log('🏥 Avyay Health — Database reset and seed');
  console.log('=========================================\n');

  // 1. Look up Riverside hospital and first coordinator
  const { data: hospital, error: hospErr } = await supabase
    .from('hospitals')
    .select('id')
    .eq('enrollment_code', 'RIVERSIDE')
    .maybeSingle();

  if (hospErr || !hospital) {
    console.error('Riverside hospital not found. Run migrations/seed first.');
    process.exit(1);
  }
  console.log(`Hospital: Riverside (${hospital.id})`);

  const { data: coordinator } = await supabase
    .from('coordinators')
    .select('id, first_name, last_name')
    .eq('hospital_id', hospital.id)
    .eq('role', 'care_coordinator')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  console.log(`Coordinator: ${coordinator?.first_name} ${coordinator?.last_name} (${coordinator?.id})\n`);

  // 2. Clean up existing patient data (cascade deletes check_ins, messages, sdoh_flags)
  console.log('Cleaning up existing patient data...');
  const { data: existingPatients } = await supabase
    .from('patients')
    .select('id')
    .eq('hospital_id', hospital.id);

  if (existingPatients && existingPatients.length > 0) {
    // sdoh_flags and messages are cascade-deleted via check_ins -> patients
    const { error: delErr } = await supabase
      .from('patients')
      .delete()
      .eq('hospital_id', hospital.id);
    if (delErr) {
      console.error('Error deleting patients:', delErr);
      process.exit(1);
    }
    console.log(`  Deleted ${existingPatients.length} existing patients (and all related data)\n`);
  } else {
    console.log('  No existing patients to clean up\n');
  }

  // 3. Insert new patients
  console.log('Inserting sample patients...');
  for (const p of PATIENTS) {
    const { data: patient, error: patErr } = await supabase
      .from('patients')
      .insert({
        hospital_id: hospital.id,
        coordinator_id: coordinator?.id ?? null,
        first_name: p.first_name,
        last_name: p.last_name,
        dob: p.dob,
        condition: p.condition,
        discharge_date: daysAgo(p.discharge_days_ago),
        days_in_program: p.days_in_program,
        total_days: 30,
        phone: p.phone,
        status: p.status,
      })
      .select('id')
      .single();

    if (patErr || !patient) {
      console.error(`  Error inserting ${p.first_name}:`, patErr);
      continue;
    }

    const scenario = CHECK_IN_SCENARIOS[p.first_name];
    if (!scenario) {
      console.log(`  ✓ ${p.first_name} ${p.last_name} — no check-in history`);
      continue;
    }

    // Insert check-ins with messages
    for (const ci of scenario.checkins) {
      const checkinDate = daysAgo(p.discharge_days_ago - ci.day + 1);
      const completedAt = ci.hoursAgo ? hoursAgo(ci.hoursAgo) : checkinDate + 'T10:00:00.000Z';

      const { data: checkin, error: ciErr } = await supabase
        .from('check_ins')
        .insert({
          patient_id: patient.id,
          day_number: ci.day,
          date: checkinDate,
          status: ci.status,
          risk_level: ci.risk,
          summary: ci.summary,
          completed_at: ci.status !== 'pending' ? completedAt : null,
        })
        .select('id')
        .single();

      if (ciErr || !checkin) {
        console.error(`    Error inserting check-in day ${ci.day} for ${p.first_name}:`, ciErr);
        continue;
      }

      // Insert messages in order
      for (let i = 0; i < ci.messages.length; i++) {
        const msg = ci.messages[i];
        const msgTime = ci.hoursAgo
          ? minutesAgo(ci.hoursAgo * 60 - i * 2) // space messages 2 min apart
          : new Date(checkinDate + 'T09:' + String(i * 3).padStart(2, '0') + ':00.000Z').toISOString();

        const riskLevel = (msg.role === 'ai' && i === ci.messages.length - 1) ? ci.risk : null;

        await supabase.from('messages').insert({
          check_in_id: checkin.id,
          role: msg.role,
          content: msg.content,
          risk_level: riskLevel,
          sent_at: msgTime,
        });
      }
    }

    // Insert SDOH flags if defined
    if (scenario.sdoh_flags || CHECK_IN_SCENARIOS[p.first_name]?.sdoh_flags) {
      const flags = scenario.sdoh_flags || CHECK_IN_SCENARIOS[p.first_name]?.sdoh_flags || [];
      for (const flag of flags) {
        await supabase.from('sdoh_flags').insert({
          patient_id: patient.id,
          domain: flag.domain,
          notes: flag.notes,
          resolved: false,
        });
      }
    }

    const riskEmoji = { red: '🔴', yellow: '🟡', green: '🟢' };
    const latestRisk = scenario.checkins[scenario.checkins.length - 1].risk;
    console.log(`  ✓ ${p.first_name} ${p.last_name} — ${p.condition.toUpperCase()}, day ${p.days_in_program}, ${riskEmoji[latestRisk]} ${latestRisk.toUpperCase()}, ${scenario.checkins.length} check-ins`);
  }

  // 4. Summary
  console.log('\n=========================================');
  console.log('Seed complete! Patient summary:\n');
  console.log('  🔴 RED (2):     Maria Gonzalez (CHF, day 5)  — worsening swelling + SOB');
  console.log('                  Dorothy Chen (CHF, day 3)    — cannot sleep flat, SOB at rest');
  console.log('  🟡 YELLOW (2):  James Washington (COPD, day 12) — increased cough, yellow mucus');
  console.log('                  Benjamin Brown (Pneumonia, day 2) — low fever 100.4°F');
  console.log('  🟢 GREEN (4):   Sandra Kim (CHF, day 7)     — stable, transportation SDOH flag');
  console.log('                  Robert Miller (COPD, day 18) — stable, improving');
  console.log('                  Natalia Sousa (AMI, day 10)  — stable, good progress');
  console.log('                  William Patel (CHF, day 22)  — nearing program end, strong compliance');
  console.log('\n  Total: 8 patients, ~20 check-ins, ~80 messages');
  console.log('  SDOH flags: 1 (Sandra Kim — transportation barrier)');
  console.log('=========================================\n');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
