import { motion } from 'framer-motion';
import type { Message } from '../../types';
import { shortTime } from '../../utils/dateUtils';

export function AvatarDot() {
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

export default function ChatBubble({
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
