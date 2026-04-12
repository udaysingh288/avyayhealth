import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePatientStore } from '../store/patientStore';
import EscalationAlert from '../components/checkin/EscalationAlert';
import { haptic } from '../utils/haptics';
import { shortTime } from '../utils/dateUtils';
import { saveMessage, completeCheckIn } from '../api/checkins';
import type { TodayCheckin, Message, RiskLevel } from '../types';

const RED_KEYWORDS = [
  'cannot breathe',
  "can't breathe",
  'cant breathe',
  'hard to breathe',
  'trouble breathing',
  'chest pain',
  'chest hurts',
  'blue lips',
  'blue fingers',
  'unconscious',
  'not breathing',
  '911',
  'dying',
  'severe chest',
  'heart attack',
  'passed out',
  'fainted',
  'i need help',
];

function containsRedKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return RED_KEYWORDS.some((k) => lower.includes(k));
}

const QUICK_REPLIES_PAIN = ['No pain', 'A little sore', 'Hurts a lot', 'I need help'];
const QUICK_REPLIES_FEELING = ['Feeling good', 'A bit tired', 'Short of breath', 'I need help'];
const QUICK_REPLIES_MEDS = ['Yes, all taken', 'Missed one', 'Not sure', 'Need a refill'];

function getQuickReplies(message: string): string[] {
  const lower = message.toLowerCase();
  if (lower.includes('pain') || lower.includes('sore')) return QUICK_REPLIES_PAIN;
  if (lower.includes('medication') || lower.includes('medicine') || lower.includes('pills'))
    return QUICK_REPLIES_MEDS;
  return QUICK_REPLIES_FEELING;
}

function buildInitialCheckin(firstName: string, dayNumber: number): TodayCheckin {
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const content = `${greeting}, ${firstName}! It's Day ${dayNumber} of your recovery. How are you feeling today? Any pain, shortness of breath, or swelling?`;
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

const FALLBACK_CHECKIN = buildInitialCheckin('', 1);

export default function CheckIn() {
  const navigate = useNavigate();
  const session = usePatientStore((s) => s.session);
  const storeCheckin = usePatientStore((s) => s.checkin);
  const setStoreCheckin = usePatientStore((s) => s.setCheckin);

  const [checkin, setCheckinLocal] = useState<TodayCheckin>(() => {
    if (storeCheckin) return storeCheckin;
    if (session) return buildInitialCheckin(session.first_name, session.days_in_program);
    return FALLBACK_CHECKIN;
  });
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [showEscalation, setShowEscalation] = useState(false);
  const [awaitingFollowUp, setAwaitingFollowUp] = useState(false);
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

  // --- All hooks above this line ---

  if (!session) return null;

  const patientToken = session.token;
  const isCompleted = checkin.status === 'completed';
  const dayNumber = checkin.day_number;

  const lastAiMessage = [...checkin.conversation].reverse().find((m) => m.role === 'ai');
  const quickReplies = lastAiMessage
    ? getQuickReplies(lastAiMessage.content)
    : QUICK_REPLIES_FEELING;

  async function handleSend(textOverride?: string) {
    const text = (textOverride ?? reply).trim();
    if (!text || sending) return;

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
      await new Promise((r) => setTimeout(r, 1400));

      if (isRed) {
        haptic('warning');
        setShowEscalation(true);
        return;
      }

      const lowerText = text.toLowerCase();
      const isYellow =
        lowerText.includes('swell') ||
        lowerText.includes('tired') ||
        lowerText.includes('breath') ||
        lowerText.includes('cough') ||
        lowerText.includes('sore') ||
        lowerText.includes('pain');

      let aiContent: string;
      let nextQuestion: string | null = null;

      if (isYellow) {
        aiContent =
          "Thank you for letting me know. That's worth keeping an eye on. I've shared this with your care team — please rest and let me know if it gets worse.";
        nextQuestion = awaitingFollowUp
          ? null
          : 'One more question — are you able to get enough rest at night?';
      } else {
        aiContent =
          "That's great to hear. Keep taking your medications as prescribed and let us know if anything changes.";
        nextQuestion = awaitingFollowUp
          ? null
          : 'Have you been able to take all your medications today?';
      }

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: 'ai',
        content: aiContent,
        sent_at: new Date().toISOString(),
        risk_level: isYellow ? 'yellow' : 'green',
      };

      if (nextQuestion && !awaitingFollowUp) {
        const followUpMsg: Message = {
          id: crypto.randomUUID(),
          role: 'ai',
          content: nextQuestion,
          sent_at: new Date().toISOString(),
          risk_level: null,
        };

        setCheckin((prev) => ({
          ...prev,
          conversation: [...prev.conversation, aiMsg, followUpMsg],
        }));
        setAwaitingFollowUp(true);
        void saveMessage({ patientToken, message: aiMsg });
        void saveMessage({ patientToken, message: followUpMsg });
      } else {
        haptic('success');
        const completionMsg: Message = {
          id: crypto.randomUUID(),
          role: 'ai',
          content: `Thank you, ${session!.first_name}. You've completed today's check-in. Rest well — we'll check in again tomorrow.`,
          sent_at: new Date().toISOString(),
          risk_level: null,
        };

        setCheckin((prev) => ({
          ...prev,
          status: 'completed',
          completed_at: new Date().toISOString(),
          conversation: [...prev.conversation, aiMsg, completionMsg],
        }));

        const finalRisk: RiskLevel = isYellow ? 'yellow' : 'green';
        void saveMessage({ patientToken, message: aiMsg });
        void saveMessage({ patientToken, message: completionMsg });
        void completeCheckIn({
          patientToken,
          riskLevel: finalRisk,
          summary: text.slice(0, 200),
        });
      }
    } catch {
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: 'ai',
        content:
          "Sorry, we couldn't send your reply right now. Please check your internet connection and try again.",
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

  if (showEscalation) {
    return (
      <EscalationAlert
        hospitalName={session.hospital_name}
        onDismiss={() => {
          setShowEscalation(false);
          const aiMsg: Message = {
            id: crypto.randomUUID(),
            role: 'ai',
            content:
              "I'm glad you're okay. If you feel worse at any time, please call 911. Let's continue — how is your breathing right now?",
            sent_at: new Date().toISOString(),
            risk_level: null,
          };
          setCheckin((prev) => ({
            ...prev,
            conversation: [...prev.conversation, aiMsg],
          }));
        }}
      />
    );
  }

  // Step indicator: 1=first question, 2=follow-up, 3=done
  const stepIndex = isCompleted ? 2 : awaitingFollowUp ? 1 : 0;

  return (
    <div className="flex flex-col h-full min-h-0 bg-warm-oatmeal">
      {/* Header */}
      <header
        className="blur-nav hairline-b shrink-0 z-20"
        style={{ paddingTop: 'max(14px, env(safe-area-inset-top))' }}
      >
        <div className="flex items-center justify-between px-4 pb-3 min-h-[44px]">
          <button
            onClick={() => {
              haptic('light');
              navigate('/');
            }}
            aria-label="Close"
            className="flex items-center justify-center w-11 h-11 -ml-2 rounded-full active:bg-black/5 transition tap-scale focus:outline-none"
          >
            <span className="material-symbols-outlined text-forest-slate" style={{ fontSize: '24px' }}>
              close
            </span>
          </button>

          <div className="flex-1 flex flex-col items-center">
            <h1 className="text-[16px] font-bold text-forest-slate tracking-tight leading-tight">
              Daily Check-in
            </h1>
            <p className="text-[11px] text-sage-muted font-medium">
              Day {dayNumber} of {session.total_days}
            </p>
          </div>

          <div className="w-11" aria-hidden="true" />
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5 px-5 pb-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full overflow-hidden bg-primary/10"
            >
              <motion.div
                initial={false}
                animate={{ width: i <= stepIndex ? '100%' : '0%' }}
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="h-full bg-primary rounded-full"
              />
            </div>
          ))}
        </div>
      </header>

      {/* Chat feed */}
      <main
        className="flex-1 min-h-0 overflow-y-auto scroll-y hide-scrollbar px-4 pt-5 pb-4 flex flex-col gap-4"
      >
        <AnimatePresence initial={false}>
          {checkin.conversation.map((msg, i) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              showAvatar={
                msg.role === 'ai' &&
                (i === 0 || checkin.conversation[i - 1].role !== 'ai')
              }
            />
          ))}
        </AnimatePresence>

        {sending && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end gap-2 max-w-[85%]"
          >
            <AvatarDot />
            <div className="bg-white shadow-ios-sm rounded-[22px] rounded-bl-md px-4 py-3 flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -5, 0],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 1.1,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: 'easeInOut',
                  }}
                  className="w-2 h-2 rounded-full bg-sage-muted"
                />
              ))}
            </div>
          </motion.div>
        )}

        {isCompleted && !sending && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex flex-col items-center py-6 gap-3"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.4 }}
              className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-ios-lg"
            >
              <span
                className="material-symbols-outlined text-white"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 700", fontSize: '32px' }}
              >
                check
              </span>
            </motion.div>
            <p className="text-forest-slate font-bold text-[18px] tracking-tight">
              Check-in complete
            </p>
            <p className="text-sage-muted text-[14px] text-center px-6">
              See you tomorrow for Day {dayNumber + 1}.
            </p>
            <button
              onClick={() => {
                haptic('medium');
                navigate('/');
              }}
              className="mt-4 bg-primary text-white font-semibold text-[17px] h-[52px] px-8 rounded-full shadow-ios tap-scale"
            >
              Back to home
            </button>
          </motion.div>
        )}

        <div ref={conversationEndRef} />
      </main>

      {/* Composer */}
      {!isCompleted && (
        <footer
          className="shrink-0 blur-nav border-t border-hairline px-4 pt-2 z-10"
          style={{
            paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
          }}
        >
          {/* Quick replies */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2.5 -mx-1 px-1">
            {quickReplies.map((opt) => (
              <button
                key={opt}
                type="button"
                disabled={sending}
                onClick={() => handleSend(opt)}
                className="shrink-0 px-4 h-10 rounded-full border border-primary/25 bg-white text-forest-slate text-[14px] font-semibold tap-scale-sm active:bg-primary-pale disabled:opacity-50 transition-colors"
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Input row */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-end gap-2"
          >
            <label
              htmlFor="checkin-input"
              className="flex-1 bg-white border border-hairline rounded-[22px] shadow-ios-sm px-4 py-2.5 min-h-[44px] flex items-center cursor-text"
            >
              <input
                ref={inputRef}
                id="checkin-input"
                type="text"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={sending}
                placeholder="Type your reply…"
                maxLength={500}
                autoComplete="off"
                autoCapitalize="sentences"
                enterKeyHint="send"
                className="w-full bg-transparent outline-none border-0 text-[16px] text-forest-slate placeholder:text-sage-muted/60 disabled:opacity-50"
                aria-label="Type your reply"
              />
            </label>
            <button
              type="submit"
              disabled={!reply.trim() || sending}
              aria-label="Send"
              className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all tap-scale
                ${
                  reply.trim() && !sending
                    ? 'bg-primary text-white shadow-ios'
                    : 'bg-primary/15 text-primary/40 cursor-not-allowed'
                }`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}
              >
                arrow_upward
              </span>
            </button>
          </form>
        </footer>
      )}
    </div>
  );
}

function AvatarDot() {
  return (
    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-ios-sm">
      <svg width="18" height="18" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M16 28 C16 28 3 19 3 10.5 C3 6.91 5.91 4 9.5 4 C11.74 4 13.73 5.14 16 7.3 C18.27 5.14 20.26 4 22.5 4 C26.09 4 29 6.91 29 10.5 C29 19 16 28 16 28 Z"
          fill="white"
        />
        <rect x="14.6" y="9" width="2.8" height="9" rx="0.6" fill="#053027" />
        <rect x="11.5" y="12.1" width="9" height="2.8" rx="0.6" fill="#053027" />
      </svg>
    </div>
  );
}

function ChatBubble({
  message,
  showAvatar,
}: {
  message: Message;
  showAvatar: boolean;
}) {
  const isAI = message.role === 'ai';

  if (isAI) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        className="flex items-end gap-2 max-w-[88%] mr-auto"
      >
        <div className="w-8 shrink-0">{showAvatar && <AvatarDot />}</div>
        <div className="flex flex-col">
          {showAvatar && (
            <p className="text-[11px] text-sage-muted font-semibold mb-1 ml-1">
              Avyay Health
            </p>
          )}
          <div className="bg-white shadow-ios-sm rounded-[22px] rounded-bl-md px-4 py-3 text-[15px] leading-[1.45] text-forest-slate">
            {message.content}
          </div>
          <p className="text-[10px] text-sage-muted/70 mt-1 ml-1">
            {shortTime(message.sent_at)}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
      className="flex flex-col items-end max-w-[85%] ml-auto"
    >
      <div
        className="bg-primary text-white shadow-ios rounded-[22px] rounded-br-md px-4 py-3 text-[15px] leading-[1.45] font-medium"
        style={{ userSelect: 'none' }}
        onCopy={(e) => e.preventDefault()}
      >
        {message.content}
      </div>
      <p className="text-[10px] text-sage-muted/70 mt-1 mr-1">
        {shortTime(message.sent_at)}
      </p>
    </motion.div>
  );
}
