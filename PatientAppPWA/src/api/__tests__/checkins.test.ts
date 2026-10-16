import { afterEach, describe, expect, it, vi } from 'vitest';
import { completeCheckIn, saveMessage } from '../checkins';

vi.mock('../client', () => ({
  hasSupabase: true,
  edgeFunctionUrl: (name: string) => `https://example.test/${name}`,
  patientHeaders: () => ({}),
}));
afterEach(() => vi.unstubAllGlobals());

describe('clinical persistence failures', () => {
  it('rejects failed completion so callers cannot report successful escalation', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 500 })));
    await expect(completeCheckIn({ patientToken: 'test', riskLevel: 'red', summary: 'Urgent' })).rejects.toThrow('Unable to save your check-in');
  });
  it('rejects failed message writes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 401 })));
    await expect(saveMessage({ patientToken: 'test', message: { id: 'test', role: 'patient', content: 'Test', sent_at: '', risk_level: null } })).rejects.toThrow('Unable to save your message');
  });
});
