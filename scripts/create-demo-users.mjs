#!/usr/bin/env node
// create-demo-users.mjs
// =====================================================
// One-shot script to provision the two demo Supabase Auth users:
//   - Maya Rodriguez (quality_director) — logs into QualityDashboard
//   - Sarah Chen (care_coordinator)     — logs into HospitalDashboard (future)
//
// Usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_KEY=sb_secret_... \
//     node scripts/create-demo-users.mjs
//
// This script uses the service key (never the publishable key) to:
//   1. Look up the Riverside hospital row
//   2. Create the auth.users row with user_metadata = { hospital_id, role, display_name }
//   3. The on_auth_user_created trigger then populates public.profiles
//
// If a user already exists, their password is NOT rotated — delete them
// from the Supabase dashboard first if you want to re-provision.
// =====================================================

import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_KEY env vars. Aborting.',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function generatePassword() {
  // 18 chars, mixed case + digits + symbols
  const chars =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
  const bytes = randomBytes(18);
  let out = '';
  for (let i = 0; i < 18; i++) out += chars[bytes[i] % chars.length];
  return out;
}

async function findUserByEmail(email) {
  // Admin API: list users and filter. For demo scale this is fine.
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (error) throw error;
  return data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
}

async function createUser({ email, displayName, role, hospitalId }) {
  const existing = await findUserByEmail(email);
  if (existing) {
    console.log(`✓ ${email} already exists — skipping`);
    return { email, password: null, skipped: true };
  }
  const password = generatePassword();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      hospital_id: hospitalId,
      role,
      display_name: displayName,
    },
  });
  if (error) throw error;
  console.log(`✓ created ${email} (${role}) id=${data.user.id}`);
  return { email, password, skipped: false };
}

async function main() {
  // Look up Riverside
  const { data: hospital, error: hospErr } = await supabase
    .from('hospitals')
    .select('id, name')
    .eq('enrollment_code', 'RIVERSIDE')
    .maybeSingle();

  if (hospErr) throw hospErr;
  if (!hospital) {
    console.error(
      'Riverside hospital row not found. Run `supabase db push` and apply seed.sql first.',
    );
    process.exit(1);
  }
  console.log(`Using hospital: ${hospital.name} (${hospital.id})`);

  const results = [];
  results.push(
    await createUser({
      email: 'maya.rodriguez@riverside.demo',
      displayName: 'Maya Rodriguez',
      role: 'quality_director',
      hospitalId: hospital.id,
    }),
  );
  results.push(
    await createUser({
      email: 'sarah.chen@riverside.demo',
      displayName: 'Sarah Chen',
      role: 'care_coordinator',
      hospitalId: hospital.id,
    }),
  );

  console.log('\n====================================');
  console.log('  DEMO USER CREDENTIALS');
  console.log('====================================');
  for (const r of results) {
    if (r.skipped) {
      console.log(`${r.email}: (already existed — unchanged)`);
    } else {
      console.log(`${r.email}`);
      console.log(`  password: ${r.password}`);
    }
  }
  console.log('====================================\n');
  console.log(
    'Save these somewhere safe. The script does NOT store them anywhere.',
  );
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
