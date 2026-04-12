import { motion } from 'framer-motion';
import { AvatarDot } from './ChatBubble';

export default function TypingIndicator() {
  return (
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
  );
}
