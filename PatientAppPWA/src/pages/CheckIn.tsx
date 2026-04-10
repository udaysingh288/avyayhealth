import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientStore } from '../store/patientStore';
import { MOCK_CHECKIN_PENDING, MOCK_SESSION } from '../utils/mockData';
import type { TodayCheckin, Message } from '../types';

const RED_KEYWORDS = [
  'cannot breathe',
  "can't breathe",
  'chest pain',
  'blue lips',
  'unconscious',
  'not breathing',
  '911',
  'dying',
  'severe chest',
];

function containsRedKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return RED_KEYWORDS.some((k) => lower.includes(k));
}

// Quick reply options per question context
const QUICK_REPLIES_PAIN = ['No pain', 'A little sore', 'Hurts a lot', 'I need help'];
const QUICK_REPLIES_FEELING = ['Feeling good', 'A bit tired', 'Short of breath', 'I need help'];
const QUICK_REPLIES_MEDS = ['Yes, all taken', 'Missed one', 'Not sure', 'Need a refill'];

function getQuickReplies(message: string): string[] {
  const lower = message.toLowerCase();
  if (lower.includes('pain') || lower.includes('sore')) return QUICK_REPLIES_PAIN;
  if (lower.includes('medication') || lower.includes('medicine') || lower.includes('pills')) return QUICK_REPLIES_MEDS;
  return QUICK_REPLIES_FEELING;
}

export default function CheckIn() {
  const navigate = useNavigate();
  const session = usePatientStore((s) => s.session) ?? MOCK_SESSION;

  const [checkin, setCheckin] = useState<TodayCheckin>(MOCK_CHECKIN_PENDING);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [showEscalation, setShowEscalation] = useState(false);
  const [awaitingFollowUp, setAwaitingFollowUp] = useState(false);
  const [selectedQuickReply, setSelectedQuickReply] = useState<string | null>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  const isCompleted = checkin.status === 'completed';
  const dayNumber = checkin.day_number;

  // Last AI message to derive quick replies from
  const lastAiMessage = [...checkin.conversation].reverse().find((m) => m.role === 'ai');
  const quickReplies = lastAiMessage ? getQuickReplies(lastAiMessage.content) : QUICK_REPLIES_FEELING;

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [checkin.conversation.length, sending]);

  function selectQuickReply(text: string) {
    setSelectedQuickReply(text);
    setReply(text);
  }

  async function handleSend(textOverride?: string) {
    const text = (textOverride ?? reply).trim();
    if (!text || sending) return;

    const patientMsg: Message = {
      id: `m-${Date.now()}`,
      role: 'patient',
      content: text,
      sent_at: new Date().toISOString(),
      risk_level: null,
    };

    const isRed = containsRedKeyword(text);
    setReply('');
    setSelectedQuickReply(null);
    setSending(true);

    setCheckin((prev) => ({
      ...prev,
      conversation: [...prev.conversation, patientMsg],
    }));

    await new Promise((r) => setTimeout(r, 1400));

    if (isRed) {
      setShowEscalation(true);
      setSending(false);
      return;
    }

    const isYellow =
      text.toLowerCase().includes('swell') ||
      text.toLowerCase().includes('tired') ||
      text.toLowerCase().includes('breath') ||
      text.toLowerCase().includes('cough') ||
      text.toLowerCase().includes('sore') ||
      text.toLowerCase().includes('pain');

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
      id: `m-ai-${Date.now()}`,
      role: 'ai',
      content: aiContent,
      sent_at: new Date().toISOString(),
      risk_level: isYellow ? 'yellow' : 'green',
    };

    if (nextQuestion && !awaitingFollowUp) {
      const followUpMsg: Message = {
        id: `m-fup-${Date.now()}`,
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
      setSending(false);
    } else {
      const completionMsg: Message = {
        id: `m-done-${Date.now()}`,
        role: 'ai',
        content: `Thank you, ${session.first_name}! You've completed today's check-in. Rest well — we'll check in again tomorrow.`,
        sent_at: new Date().toISOString(),
        risk_level: null,
      };

      setCheckin((prev) => ({
        ...prev,
        status: 'completed',
        completed_at: new Date().toISOString(),
        conversation: [...prev.conversation, aiMsg, completionMsg],
      }));
      setSending(false);
    }
  }

  if (showEscalation) {
    return (
      <EscalationScreen
        hospitalName={session.hospital_name}
        onDismiss={() => {
          setShowEscalation(false);
          const aiMsg: Message = {
            id: `m-ai-dis-${Date.now()}`,
            role: 'ai',
            content:
              "I'm glad you're okay. If you feel worse at any time, please don't hesitate to call 911. Let's continue — how is your breathing right now?",
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

  return (
    <div className="flex flex-col h-full bg-warm-oatmeal">
      {/* Header */}
      <header
        className="bg-warm-oatmeal px-6 py-5 flex items-center justify-between z-10 sticky top-0 shrink-0"
        style={{ paddingTop: 'max(20px, env(safe-area-inset-top))' }}
      >
        <button
          onClick={() => navigate('/')}
          aria-label="Go back"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <span className="material-symbols-outlined text-forest-slate">close</span>
        </button>

        <div className="flex-1 flex flex-col items-center">
          <h1 className="text-lg font-bold text-forest-slate tracking-tight">Daily Check-in</h1>
          {/* Progress dots */}
          <div className="flex gap-1.5 mt-1.5">
            <div className="h-1.5 w-6 rounded-full bg-primary" />
            <div
              className={`h-1.5 w-6 rounded-full ${awaitingFollowUp ? 'bg-primary' : 'bg-sage-muted/30'}`}
            />
            <div
              className={`h-1.5 w-6 rounded-full ${isCompleted ? 'bg-primary' : 'bg-sage-muted/30'}`}
            />
          </div>
        </div>

        <div className="w-10 h-10" aria-hidden="true" />
      </header>

      {/* Chat feed */}
      <main className="flex-1 overflow-y-auto hide-scrollbar px-6 pb-48 pt-4 flex flex-col gap-6">
        {checkin.conversation.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {sending && (
          <div className="flex items-end gap-3 max-w-[85%]">
            <AvatarDot />
            <div className="bg-white shadow-soft rounded-2xl rounded-bl-sm p-4 flex items-center gap-1.5 h-[52px]">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-sage-muted/50 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completion */}
        {isCompleted && !sending && (
          <div className="flex flex-col items-center py-6 gap-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-soft">
              <span
                className="material-symbols-outlined text-white"
                style={{ fontVariationSettings: "'FILL' 1", fontSize: '32px' }}
              >
                check
              </span>
            </div>
            <p className="text-forest-slate font-bold text-center text-lg">Check-in complete!</p>
            <p className="text-sage-muted text-sm text-center px-4">
              Day {dayNumber} of {session.total_days} recorded. See you tomorrow.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-2 bg-primary text-white font-bold py-4 px-8 rounded-full shadow-soft active:scale-95 transition-all"
            >
              Back to Home
            </button>
          </div>
        )}

        <div ref={conversationEndRef} />
      </main>

      {/* Quick reply footer — only when pending */}
      {!isCompleted && !sending && (
        <footer
          className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-warm-oatmeal via-warm-oatmeal/95 to-transparent pt-12 pb-8 z-20"
          style={{ paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}
        >
          <div className="px-6 flex overflow-x-auto gap-3 hide-scrollbar pb-2 snap-x">
            {quickReplies.map((opt) => (
              <button
                key={opt}
                onClick={() => handleSend(opt)}
                className={`snap-start shrink-0 px-6 py-3.5 rounded-full border-2 font-semibold text-base transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-warm-oatmeal
                  ${
                    selectedQuickReply === opt
                      ? 'border-primary bg-primary text-white shadow-sm'
                      : 'border-primary bg-transparent text-forest-slate hover:bg-primary/5'
                  }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Or type freely */}
          <div className="px-6 mt-3 flex gap-3 items-end">
            <input
              type="text"
              value={reply}
              onChange={(e) => {
                setReply(e.target.value);
                setSelectedQuickReply(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder="Or type your own reply…"
              className="flex-1 px-4 py-3 rounded-full border border-border bg-white text-forest-slate placeholder-sage-muted
                focus:outline-none focus:border-primary transition text-base"
              style={{ fontSize: '16px' }}
              aria-label="Type your reply"
            />
            <button
              onClick={() => handleSend()}
              disabled={!reply.trim()}
              aria-label="Send"
              className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition
                ${reply.trim() ? 'bg-primary text-white active:scale-95 shadow-sm' : 'bg-gray-200 text-sage-muted cursor-not-allowed'}`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                send
              </span>
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}

function AvatarDot() {
  return (
    <div className="w-8 h-8 rounded-full bg-mint-light flex items-center justify-center shrink-0 border border-black/5 shadow-sm">
      <span
        className="material-symbols-outlined text-primary text-sm"
        style={{ fontVariationSettings: "'FILL' 1", fontSize: '16px' }}
      >
        spa
      </span>
    </div>
  );
}

function ChatBubble({ message }: { message: Message }) {
  const isAI = message.role === 'ai';

  if (isAI) {
    return (
      <div className="flex items-end gap-3 max-w-[85%]">
        <AvatarDot />
        <div className="bg-white shadow-soft rounded-2xl rounded-bl-sm p-4 text-[15px] leading-relaxed text-forest-slate">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-3 justify-end w-full">
      <div className="bg-primary shadow-soft rounded-2xl rounded-br-sm p-4 text-[15px] font-medium leading-relaxed text-white max-w-[80%]">
        {message.content}
      </div>
    </div>
  );
}

function EscalationScreen({
  hospitalName,
  onDismiss,
}: {
  hospitalName: string;
  onDismiss: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(229, 139, 136, 0.15)' }}
    >
      <div className="w-full max-w-md mx-auto flex flex-col items-center space-y-8">
        {/* Animated icon */}
        <div className="w-32 h-32 rounded-full bg-white shadow-soft flex items-center justify-center text-triage-red relative">
          <div className="absolute inset-0 rounded-full border-4 border-triage-red opacity-20 scale-110" />
          <span
            className="material-symbols-outlined text-triage-red"
            style={{ fontVariationSettings: "'FILL' 1", fontSize: '64px' }}
          >
            warning
          </span>
        </div>

        <div className="text-center space-y-2">
          <h1 className="font-display font-bold text-[28px] leading-tight text-forest-slate">
            Let's get that checked out.
          </h1>
          <p className="text-sage-muted text-base px-4">
            Your answers suggest we should have a care team member review your symptoms.
          </p>
        </div>

        {/* Next steps */}
        <div className="w-full bg-white rounded-2xl shadow-soft p-6 space-y-4">
          <h2 className="font-display font-bold text-lg text-forest-slate border-b border-gray-100 pb-3">
            Next Steps
          </h2>
          <ul className="space-y-4 text-base text-forest-slate">
            {[
              'Rest comfortably in a seated position if possible.',
              'Do not take any additional pain medication until you speak with the team.',
              'Call the triage line using the button below.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-triage-red-light flex items-center justify-center text-triage-red">
                  <span className="text-sm font-bold">{i + 1}</span>
                </div>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="w-full space-y-3">
          <a
            href="tel:911"
            className="w-full h-14 bg-triage-red text-white rounded-full font-display font-bold text-lg shadow-soft flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              call
            </span>
            Call 911
          </a>
          <button
            onClick={onDismiss}
            className="w-full py-3 text-sm text-sage-muted font-medium underline hover:text-forest-slate transition-colors"
          >
            I'm okay — continue check-in
          </button>
        </div>

        <p className="text-center text-xs text-sage-muted">
          {hospitalName} care team has been notified.
        </p>
      </div>
    </div>
  );
}
