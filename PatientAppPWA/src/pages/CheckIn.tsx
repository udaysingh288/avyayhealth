import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import EscalationAlert from '../components/checkin/EscalationAlert';
import ChatBubble from '../components/checkin/ChatBubble';
import TypingIndicator from '../components/checkin/TypingIndicator';
import { haptic } from '../utils/haptics';
import { useCheckinConversation } from '../hooks/useCheckinConversation';

export default function CheckIn() {
  const navigate = useNavigate();
  const {
    session,
    checkin,
    reply,
    setReply,
    sending,
    showEscalation,
    escalationStatus,
    retryEscalation,
    convState,
    conversationEndRef,
    inputRef,
    isCompleted,
    dayNumber,
    quickReplies,
    handleSend,
    dismissEscalation,
  } = useCheckinConversation();

  // Check if coordinator has sent any messages — if so, keep composer open even after check-in
  const hasCoordinatorMessage = checkin.conversation.some((m) => m.role === 'coordinator');
  const showComposer = !isCompleted || hasCoordinatorMessage;

  if (!session) return null;

  if (showEscalation) {
    return (
      <EscalationAlert
        hospitalName={session.hospital_name}
        onDismiss={dismissEscalation}
        status={escalationStatus}
        onRetry={retryEscalation}
      />
    );
  }

  // Progress: map conversation phases to step indicators
  const phaseSteps: Record<string, number> = {
    symptom_check: 0,
    symptom_followup: 0,
    medication_check: 1,
    medication_followup: 1,
    sdoh_screen: 2,
    sdoh_followup: 2,
    complete: 2,
  };
  const stepIndex = isCompleted ? 2 : (phaseSteps[convState.phase] ?? 0);

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
              coordinatorName={session.coordinator_first_name}
              showAvatar={
                (msg.role === 'ai' || msg.role === 'coordinator') &&
                (i === 0 || checkin.conversation[i - 1].role !== msg.role)
              }
            />
          ))}
        </AnimatePresence>

        {sending && <TypingIndicator />}

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
              See you tomorrow for Day {Math.min(dayNumber + 1, session.total_days)}.
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
      {showComposer && (
        <footer
          className="shrink-0 blur-nav border-t border-hairline px-4 pt-2 z-10"
          style={{
            paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
          }}
        >
          {/* Quick replies — only during active check-in */}
          {!isCompleted && quickReplies.length > 0 && (
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
          )}

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
                placeholder={isCompleted ? 'Reply to coordinator\u2026' : 'Type your reply\u2026'}
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
                ${reply.trim() && !sending
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
