import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCheckinConversation } from '../useCheckinConversation';
import { usePatientStore } from '../../store/patientStore';
import { getMessages } from '../../api/messages';
import { completeCheckIn, getChatReply, saveMessage } from '../../api/checkins';

vi.mock('../../api/checkins', () => ({
  completeCheckIn: vi.fn(), getChatReply: vi.fn(), saveMessage: vi.fn(),
}));
vi.mock('../../api/messages', () => ({ getMessages: vi.fn().mockResolvedValue([]), sendDirectMessage: vi.fn() }));
vi.mock('../../utils/haptics', () => ({ haptic: vi.fn() }));

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getMessages).mockResolvedValue([]);
  vi.mocked(saveMessage).mockResolvedValue(undefined);
  vi.mocked(completeCheckIn).mockResolvedValue(undefined);
  usePatientStore.getState().clearSession();
  usePatientStore.getState().setSession('test-token', {
    patient_id: 'test-patient', first_name: 'Test', condition: 'chf',
    discharge_date: '2026-10-16', days_in_program: 1, total_days: 30,
    hospital_name: 'Test Hospital', coordinator_first_name: 'Test Coordinator',
    medications: [], token: 'test-token',
  });
});
afterEach(cleanup);

describe('clinical escalation and cumulative risk', () => {
  it('shows the emergency screen immediately and confirms saving only after the server responds', async () => {
    let finish!: () => void;
    vi.mocked(completeCheckIn).mockReturnValue(new Promise<void>((resolve) => { finish = resolve; }));
    const { result } = renderHook(() => useCheckinConversation());
    let sending!: Promise<void>;
    await act(async () => { sending = result.current.handleSend('I have chest pain'); });
    expect(result.current.showEscalation).toBe(true);
    expect(result.current.escalationStatus).toBe('pending');
    expect(completeCheckIn).toHaveBeenCalledWith(expect.objectContaining({
      riskLevel: 'red', summary: expect.stringContaining('chest pain'),
    }));
    await act(async () => { finish(); await sending; });
    expect(result.current.escalationStatus).toBe('saved');
    expect(saveMessage).toHaveBeenCalledWith(expect.objectContaining({ message: expect.objectContaining({ risk_level: 'red' }) }));
    expect(getChatReply).not.toHaveBeenCalled();
  });

  it('reports failed escalation persistence and allows an explicit retry', async () => {
    vi.mocked(completeCheckIn).mockRejectedValueOnce(new Error('offline'));
    const { result } = renderHook(() => useCheckinConversation());
    await act(async () => { await result.current.handleSend('I have chest pain'); });
    expect(result.current.escalationStatus).toBe('failed');
    act(() => result.current.dismissEscalation());
    expect(result.current.checkin.conversation.slice(-1)[0]?.content).toContain("haven't confirmed");
    await act(async () => { await result.current.retryEscalation(); });
    expect(result.current.escalationStatus).toBe('saved');
    expect(completeCheckIn).toHaveBeenCalledTimes(2);
  });

  it('shows an emergency warning for shared emergency patterns even when persistence fails', async () => {
    vi.mocked(completeCheckIn).mockRejectedValue(new Error('offline'));
    vi.mocked(saveMessage).mockRejectedValue(new Error('offline'));
    const { result } = renderHook(() => useCheckinConversation());
    await act(async () => { await result.current.handleSend('I have blue nails'); });
    expect(result.current.showEscalation).toBe(true);
    expect(result.current.escalationStatus).toBe('failed');
    expect(completeCheckIn).toHaveBeenCalledWith(expect.objectContaining({ riskLevel: 'red' }));
    expect(getChatReply).not.toHaveBeenCalled();
  });

  it('keeps yellow symptoms and their summary when a later medication answer is green', async () => {
    vi.mocked(getChatReply)
      .mockResolvedValueOnce({ reply: 'Please tell your care team.', risk_level: 'yellow', next_phase: 'medication_check', is_complete: false, summary: 'Ankle swelling', follow_up: null })
      .mockResolvedValueOnce({ reply: 'Thank you.', risk_level: 'green', next_phase: 'complete', is_complete: true, summary: 'Medication taken', follow_up: null });
    const { result } = renderHook(() => useCheckinConversation());
    await act(async () => { await result.current.handleSend('My ankles are swollen'); });
    await act(async () => { await result.current.handleSend('I took my medication'); });
    expect(completeCheckIn).toHaveBeenLastCalledWith({ patientToken: 'test-token', riskLevel: 'yellow', summary: 'Ankle swelling. Medication taken.' });
    expect(result.current.isCompleted).toBe(true);
  });

  it('retains a red escalation after dismissal and subsequent green answers', async () => {
    vi.mocked(getChatReply).mockResolvedValue({ reply: 'Thank you.', risk_level: 'green', next_phase: 'complete', is_complete: true, summary: 'Feels better', follow_up: null });
    const { result } = renderHook(() => useCheckinConversation());
    await act(async () => { await result.current.handleSend('I have chest pain'); });
    act(() => result.current.dismissEscalation());
    await act(async () => { await result.current.handleSend('I feel better'); });
    expect(completeCheckIn).toHaveBeenLastCalledWith(expect.objectContaining({ riskLevel: 'red', summary: expect.stringContaining('chest pain') }));
  });

  it('persists a red AI response even before the conversation is complete', async () => {
    vi.mocked(getChatReply).mockResolvedValue({ reply: 'Please call 911.', risk_level: 'red', next_phase: 'symptom_followup', is_complete: false, summary: 'Urgent symptoms', follow_up: null });
    const { result } = renderHook(() => useCheckinConversation());
    await act(async () => { await result.current.handleSend('I feel very unwell'); });
    expect(result.current.showEscalation).toBe(true);
    expect(result.current.escalationStatus).toBe('saved');
    expect(completeCheckIn).toHaveBeenCalledWith(expect.objectContaining({ riskLevel: 'red' }));
  });

  it('does not show successful completion when the server rejects the final write', async () => {
    vi.mocked(getChatReply).mockResolvedValue({ reply: 'Thank you.', risk_level: 'green', next_phase: 'complete', is_complete: true, summary: 'Stable', follow_up: null });
    vi.mocked(completeCheckIn).mockRejectedValue(new Error('write failed'));
    const { result } = renderHook(() => useCheckinConversation());
    await act(async () => { await result.current.handleSend('I feel well'); });
    expect(result.current.isCompleted).toBe(false);
    expect(result.current.checkin.conversation.slice(-1)[0]?.content).toContain("couldn't process");
  });
});
