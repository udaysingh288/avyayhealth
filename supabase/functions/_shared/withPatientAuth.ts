// Shared middleware for edge functions that require patient authentication.
// Handles: CORS preflight, POST enforcement, x-patient-token extraction,
// JWT verification, and JSON body parsing.

import { handleCorsPreflight, jsonResponse } from './cors.ts';
import { verifyPatientToken, type PatientClaims } from './patientJwt.ts';

export interface AuthenticatedRequest<T = unknown> {
  claims: PatientClaims;
  body: T;
}

type Handler<T> = (
  ctx: AuthenticatedRequest<T>,
) => Promise<Response> | Response;

/**
 * Wraps an edge function handler with patient auth boilerplate.
 *
 * Usage:
 * ```ts
 * Deno.serve(withPatientAuth<MyBody>(async ({ claims, body }) => {
 *   // claims.patient_id, claims.hospital_id are verified
 *   // body is the parsed JSON request
 *   return jsonResponse({ ok: true });
 * }));
 * ```
 */
export function withPatientAuth<T = unknown>(
  handler: Handler<T>,
): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    const preflight = handleCorsPreflight(req);
    if (preflight) return preflight;

    if (req.method !== 'POST') {
      return jsonResponse({ error: 'method_not_allowed' }, 405);
    }

    const patientToken =
      req.headers.get('x-patient-token') ??
      req.headers.get('X-Patient-Token') ??
      '';
    if (!patientToken) {
      return jsonResponse({ error: 'missing_patient_token' }, 401);
    }

    let claims: PatientClaims;
    try {
      claims = await verifyPatientToken(patientToken);
    } catch (err) {
      console.error('patient token verify failed', err);
      return jsonResponse({ error: 'invalid_patient_token' }, 401);
    }

    let body: T;
    try {
      body = (await req.json()) as T;
    } catch {
      return jsonResponse({ error: 'invalid_json' }, 400);
    }

    return handler({ claims, body });
  };
}
