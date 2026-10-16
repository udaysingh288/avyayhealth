/**
 * Custom hook that encapsulates all check-in conversation state
 * and logic: message handling, AI replies, RED keyword detection,
 * escalation, and check-in completion.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePatientStore } from '../store/patientStore';
import { haptic } from '../utils/haptics';
import { saveMessage, completeCheckIn, getChatReply } from '../api/checkins';
import { getMessages, sendDirectMessage } from '../api/messages';
import {
  processReply,
  createInitialState,
  buildSummary,
  getQuickRepliesForPhase,
  type ConversationState,
} from '../engine';
import { containsRedKeyword, EMERGENCY_PATTERNS } from '@shared/constants/clinical';
import { riskSortOrder } from '@shared/utils/riskUtils';
import type { TodayCheckin, Message, RiskLevel } from '../types';

// ─── Initial check-in builder ─────────────────────────────────────

function buildInitialCheckin(firstName: string, dayNumber: number, condition: string): TodayCheckin {
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';

  const conditionPrompts: Record<string, string> = {
    chf: 'Any shortness of breath, swelling, or changes in how you feel?',
    copd: 'Any changes in your breathing, coughing, or energy level?',
    pneumonia: 'Any fever, coughing, or difficulty breathing?',
    ami: 'Any chest discomfort, dizziness, or changes in how you feel?',
  };
  const symptomPrompt = conditionPrompts[condition] ?? 'Any pain, shortness of breath, or new symptoms?';
  const content = `${greeting}, ${firstName}! It's Day ${dayNumber} of your recovery. How are you feeling today? ${symptomPrompt}`;

  return {
    checkin_id: `ci-day${dayNumber}`,
    day_number: dayNumber,
    status: 'pending',
    question: content,
    conversation: [
      {
        id: crypto.randomUUID(),
        role: 'ai',
        content,
        sent_at: new Date().toISOString(),
        risk_level: null,
      },
    ],
    completed_at: null,
  };
}

const FALLBACK_CHECKIN = buildInitialCheckin('', 1, 'chf');

// ─── Hook ─────────────────────────────────────────────────────────

export function useCheckinConversation() {
  const session = usePatientStore((s) => s.session);
  const storeCheckin = usePatientStore((s) => s.checkin);
  const setStoreCheckin = usePatientStore((s) => s.setCheckin);

  const [checkin, setCheckinLocal] = useState<TodayCheckin>(() => {
    if (storeCheckin) return storeCheckin;
    if (session) return buildInitialCheckin(session.first_name, session.days_in_program, session.condition);
    return FALLBACK_CHECKIN;
  });
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [showEscalation, setShowEscalation] = useState(false);
  const [escalationStatus, setEscalationStatus] = useState<'pending' | 'saved' | 'failed'>('pending');
  const escalationSummaryRef = useRef('');
  const [convState, setConvState] = useState<ConversationState>(() => {
    const initial = createInitialState();
    // Preserve the highest recorded risk when navigating back to this screen.
    for (const message of checkin.conversation) {
      if (message.risk_level && riskSortOrder(message.risk_level) < riskSortOrder(initial.overallRisk)) {
        initial.overallRisk = message.risk_level;
      }
      if (message.risk_level === 'red' || message.risk_level === 'yellow') {
        initial.summaryParts.push(message.content);
      }
    }
    return initial;
  });
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const setCheckin = useCallback(
    (updater: TodayCheckin | ((prev: TodayCheckin) => TodayCheckin)) => {
      setCheckinLocal((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        setStoreCheckin(next);
        return next;
      });
    },
    [setStoreCheckin],
  );

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [checkin.conversation.length, sending]);

  // Keep the input in view when iOS keyboard opens
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const handle = () => {
      conversationEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    };
    vv.addEventListener('resize', handle);
    return () => vv.removeEventListener('resize', handle);
  }, []);

  // Poll for coordinator direct messages and inject into conversation
  const seenDmIdsRef = useRef(new Set<string>());
  useEffect(() => {
    if (!session?.token) return;
    let cancelled = false;

    async function pollDMs() {
      const msgs = await getMessages({ patientToken: session!.token });
      if (cancelled) return;
      for (const dm of msgs) {
        if (dm.sender_type === 'coordinator' && !seenDmIdsRef.current.has(dm.id)) {
          seenDmIdsRef.current.add(dm.id);
          const coordMsg: Message = {
            id: `dm-${dm.id}`,
            role: 'coordinator',
            content: dm.content,
            sent_at: dm.created_at,
            risk_level: null,
          };
          setCheckin((prev) => ({
            ...prev,
            conversation: [...prev.conversation, coordMsg],
          }));
          haptic('medium');
        }
      }
    }

    pollDMs();
    const interval = setInterval(pollDMs, 8000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [session?.token, setCheckin]);

  const patientToken = session?.token ?? '';
  const isCompleted = checkin.status === 'completed';
  const dayNumber = checkin.day_number;
  const quickReplies = session ? getQuickRepliesForPhase(convState.phase, session.condition) : [];

  // Helper: add AI message(s) to conversation + persist
  async function addAiMessages(
    msgs: string[],
    riskLevel: RiskLevel,
    isComplete: boolean,
    summary: string,
  ) {
    for (let i = 0; i < msgs.length; i++) {
      const msg: Message = {
        id: crypto.randomUUID(),
        role: 'ai',
        content: msgs[i],
        sent_at: new Date().toISOString(),
        risk_level: i === 0 ? riskLevel : null,
      };

      // Only report completion after the clinical record is saved successfully.
      await saveMessage({ patientToken, message: msg });
      if (i === msgs.length - 1 && isComplete) {
        await completeCheckIn({ patientToken, riskLevel, summary });
        haptic('success');
      }
      setCheckin((prev) => ({
        ...prev,
        ...(i === msgs.length - 1 && isComplete
          ? { status: 'completed' as const, completed_at: new Date().toISOString() }
          : {}),
        conversation: [...prev.conversation, msg],
      }));
      if (i < msgs.length - 1) {
        await new Promise((r) => setTimeout(r, 700 + Math.random() * 400));
      }
    }
  }

  async function persistEscalation() {
    setEscalationStatus('pending');
    try {
      await completeCheckIn({
        patientToken,
        riskLevel: 'red',
        summary: escalationSummaryRef.current,
      });
      setEscalationStatus('saved');
    } catch {
      setEscalationStatus('failed');
    }
  }

  async function handleSend(textOverride?: string) {
    const text = (textOverride ?? reply).trim();
    if (!text || !session) return;

    haptic('light');

    // Check if there are coordinator messages in the conversation
    // If the check-in is completed, any reply goes to coordinator as a DM
    // If the check-in is active, only reply to coordinator if the last non-patient message is from them
    const hasCoordinatorMsg = checkin.conversation.some((m) => m.role === 'coordinator');
    const lastNonPatient = [...checkin.conversation].reverse().find((m) => m.role !== 'patient');
    const isReplyToCoordinator = isCompleted
      ? hasCoordinatorMsg
      : lastNonPatient?.role === 'coordinator';

    if (isReplyToCoordinator) {
      const patientMsg: Message = {
        id: crypto.randomUUID(),
        role: 'patient',
        content: text,
        sent_at: new Date().toISOString(),
        risk_level: null,
      };
      setReply('');
      setCheckin((prev) => ({
        ...prev,
        conversation: [...prev.conversation, patientMsg],
      }));
      void sendDirectMessage({ patientToken, content: text });
      return;
    }

    // If check-in is completed and no coordinator messages, don't process
    if (isCompleted) return;

    // Block duplicate AI sends
    if (sending) return;

    const patientMsg: Message = {
      id: crypto.randomUUID(),
      role: 'patient',
      content: text,
      sent_at: new Date().toISOString(),
      risk_level: null,
    };

    const isRed = containsRedKeyword(text) || EMERGENCY_PATTERNS.some((pattern) => pattern.test(text));
    if (isRed) patientMsg.risk_level = 'red';
    setReply('');
    setSending(true);

    setCheckin((prev) => ({
      ...prev,
      conversation: [...prev.conversation, patientMsg],
    }));
    try {
      if (isRed) {
        haptic('warning');
        setShowEscalation(true);
        const nextState = {
          ...convState,
          overallRisk: 'red' as const,
          summaryParts: [...convState.summaryParts, `Emergency symptoms reported: ${text}`],
        };
        setConvState(nextState);
        escalationSummaryRef.current = buildSummary(nextState);
        // Persist the escalation first so a failed message write cannot suppress it.
        await persistEscalation();
        await saveMessage({ patientToken, message: patientMsg });
        return;
      }

      await saveMessage({ patientToken, message: patientMsg });
      const conversationForApi = [...checkin.conversation, patientMsg]
        .filter((m) => m.role === 'ai' || m.role === 'patient')
        .map((m) => ({
          role: m.role as 'ai' | 'patient',
          content: m.content,
        }));

      const aiReply = await getChatReply({
        patientToken,
        messages: conversationForApi,
        phase: convState.phase,
        dayNumber,
        condition: session.condition,
        firstName: session.first_name,
        medications: session.medications,
      });

      if (aiReply) {
        const responses = [aiReply.reply];
        if (aiReply.follow_up) responses.push(aiReply.follow_up);

        const overallRisk = riskSortOrder(aiReply.risk_level) < riskSortOrder(convState.overallRisk)
          ? aiReply.risk_level
          : convState.overallRisk;
        const nextState = {
          ...convState,
          phase: aiReply.next_phase,
          overallRisk,
          turnCount: convState.turnCount + 1,
          summaryParts: [...convState.summaryParts, aiReply.summary],
        };
        setConvState(nextState);
        const summary = buildSummary(nextState);
        if (aiReply.risk_level === 'red') {
          setShowEscalation(true);
          escalationSummaryRef.current = summary;
          await persistEscalation();
        }
        await addAiMessages(responses, overallRisk, aiReply.is_complete, summary);
      } else {
        const result = processReply({
          patientText: text,
          firstName: session.first_name,
          condition: session.condition,
          dayNumber,
          state: convState,
        });

        setConvState(result.nextState);
        if (result.riskLevel === 'red') {
          setShowEscalation(true);
          escalationSummaryRef.current = buildSummary(result.nextState);
          await persistEscalation();
        }
        await addAiMessages(
          result.responses,
          result.riskLevel,
          result.isComplete,
          buildSummary(result.nextState),
        );
      }
    } catch {
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: 'ai',
        content:
          "Sorry, we couldn't process your reply right now. Please check your internet connection and try again.",
        sent_at: new Date().toISOString(),
        risk_level: null,
      };
      setCheckin((prev) => ({
        ...prev,
        conversation: [...prev.conversation, errorMsg],
      }));
    } finally {
      setSending(false);
    }
  }

  function dismissEscalation() {
    setShowEscalation(false);
    const aiMsg: Message = {
      id: crypto.randomUUID(),
      role: 'ai',
      content:
        escalationStatus === 'saved'
          ? "Your urgent concern has been saved for your care team. Please call 911 for emergency symptoms. How is your breathing right now?"
          : "We haven't confirmed that your care team received this concern. Please call 911 for emergency symptoms and contact your care team directly.",
      sent_at: new Date().toISOString(),
      risk_level: null,
    };
    setCheckin((prev) => ({
      ...prev,
      conversation: [...prev.conversation, aiMsg],
    }));
  }

  return {
    session,
    checkin,
    reply,
    setReply,
    sending,
    showEscalation,
    escalationStatus,
    retryEscalation: persistEscalation,
    convState,
    conversationEndRef,
    inputRef,
    isCompleted,
    dayNumber,
    quickReplies,
    handleSend,
    dismissEscalation,
  };
}
