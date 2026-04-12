// Signs and verifies short-lived JWTs for patient sessions.
// These tokens are issued by `enroll-patient` and verified by
// `save-checkin-message` and `complete-checkin`.
//
// The patient JWT is intentionally separate from Supabase Auth JWTs —
// patients are not auth.users rows. They authenticate via a one-time
// enrollment (hospital code + name + DOB) and the token lives in memory
// only on the client, per the HIPAA rules in PatientAppPWA/CLAUDE.md.

import { create, getNumericDate, verify } from 'https://deno.land/x/djwt@v3.0.1/mod.ts';

const PATIENT_JWT_SECRET = Deno.env.get('PATIENT_JWT_SECRET') ?? '';
if (!PATIENT_JWT_SECRET) {
  console.warn(
    '[patientJwt] PATIENT_JWT_SECRET is not set — tokens will be unsignable',
  );
}

async function getKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(PATIENT_JWT_SECRET);
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export interface PatientClaims {
  patient_id: string;
  hospital_id: string;
  iat?: number;
  exp?: number;
}

export async function signPatientToken(
  claims: Omit<PatientClaims, 'iat' | 'exp'>,
  ttlSeconds = 60 * 60 * 24 * 30, // 30 days
): Promise<string> {
  const key = await getKey();
  const payload = {
    ...claims,
    iat: getNumericDate(0),
    exp: getNumericDate(ttlSeconds),
  };
  return await create({ alg: 'HS256', typ: 'JWT' }, payload, key);
}

export async function verifyPatientToken(
  token: string,
): Promise<PatientClaims> {
  const key = await getKey();
  const payload = await verify(token, key);
  if (
    typeof payload !== 'object' ||
    payload === null ||
    typeof (payload as Record<string, unknown>).patient_id !== 'string' ||
    typeof (payload as Record<string, unknown>).hospital_id !== 'string'
  ) {
    throw new Error('Invalid patient token payload');
  }
  return payload as unknown as PatientClaims;
}
