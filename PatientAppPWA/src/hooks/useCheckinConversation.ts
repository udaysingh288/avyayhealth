/**
 * Custom hook that encapsulates all check-in conversation state
 * and logic: message handling, AI replies, RED keyword detection,
 * escalation, and check-in completion.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePatientStore } from '../store/patientStore';
import { haptic } from '../utils/haptics';
import { saveMessage, completeCheckIn, getChatReply } from '../api/checkins';
import {
  processReply,
  createInitialState,
  buildSummary,
  getQuickRepliesForPhase,
  type ConversationState,
} from '../engine';
import { containsRedKeyword } from '@shared/constants/clinical';
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
  const [convState, setConvState] = useState<ConversationState>(createInitialState);
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

      if (i === msgs.length - 1 && isComplete) {
        haptic('success');
        setCheckin((prev) => ({
          ...prev,
          status: 'completed',
          completed_at: new Date().toISOString(),
          conversation: [...prev.conversation, msg],
        }));
        void saveMessage({ patientToken, message: msg });
        void completeCheckIn({ patientToken, riskLevel, summary });
      } else {
        setCheckin((prev) => ({
          ...prev,
          conversation: [...prev.conversation, msg],
        }));
        void saveMessage({ patientToken, message: msg });

        if (i < msgs.length - 1) {
          await new Promise((r) => setTimeout(r, 700 + Math.random() * 400));
        }
      }
    }
  }

  async function handleSend(textOverride?: string) {
    const text = (textOverride ?? reply).trim();
    if (!text || sending || !session) return;

    haptic('light');

    const patientMsg: Message = {
      id: crypto.randomUUID(),
      role: 'patient',
      content: text,
      sent_at: new Date().toISOString(),
      risk_level: null,
    };

    const isRed = containsRedKeyword(text);
    setReply('');
    setSending(true);

    setCheckin((prev) => ({
      ...prev,
      conversation: [...prev.conversation, patientMsg],
    }));
    void saveMessage({ patientToken, message: patientMsg });

    try {
      if (isRed) {
        haptic('warning');
        setShowEscalation(true);
        setSending(false);
        return;
      }

      const conversationForApi = [...checkin.conversation, patientMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const aiReply = await getChatReply({
        patientToken,
        messages: conversationForApi,
        phase: convState.phase,
        dayNumber,
        condition: session.condition,
        firstName: session.first_name,
      });

      if (aiReply) {
        const responses = [aiReply.reply];
        if (aiReply.follow_up) responses.push(aiReply.follow_up);

        setConvState((prev) => ({
          ...prev,
          phase: aiReply.next_phase,
          overallRisk: aiReply.risk_level,
          turnCount: prev.turnCount + 1,
          summaryParts: [...prev.summaryParts, aiReply.summary],
        }));

        await addAiMessages(responses, aiReply.risk_level, aiReply.is_complete, aiReply.summary);
      } else {
        const result = processReply({
          patientText: text,
          firstName: session.first_name,
          condition: session.condition,
          dayNumber,
          state: convState,
        });

        setConvState(result.nextState);
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
        "I'm glad you're okay. Your care team has been notified just in case. Let's continue — how is your breathing right now?",
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
