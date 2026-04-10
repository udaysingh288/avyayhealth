import { motion } from 'framer-motion';
import type { Message } from '../../types';
import { shortTime } from '../../utils/dateUtils';

interface ConversationBubbleProps {
  message: Message;
}

export default function ConversationBubble({ message }: ConversationBubbleProps) {
  const isAI = message.role === 'ai';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
    >
      {isAI && (
        <div className="w-9 h-9 bg-forest rounded-full flex items-center justify-center shrink-0 mt-1">
          <span className="text-white font-serif font-bold text-sm" aria-hidden="true">A</span>
        </div>
      )}

      <div className={`max-w-[80%] ${isAI ? '' : 'items-end flex flex-col'}`}>
        {isAI && (
          <div className="text-xs font-sans text-slate-400 mb-1 ml-1">Avyay Health</div>
        )}

        <div
          className={`rounded-2xl px-4 py-3 text-base font-sans leading-relaxed
            ${isAI
              ? 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm shadow-sm'
              : 'bg-forest text-white rounded-tr-sm'
            }`}
          style={isAI ? {} : { userSelect: 'none' }}
          onCopy={isAI ? undefined : (e) => e.preventDefault()}
        >
          {message.content}
        </div>

        <div className={`text-xs font-sans text-slate-400 mt-1 ${isAI ? 'ml-1' : 'mr-1'}`}>
          {shortTime(message.sent_at)}
        </div>
      </div>
    </motion.div>
  );
}
