'use client'
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TypingIndicatorProps {
  isTyping: boolean;
  isDarkTheme?: boolean;
}

const dotVariants = {
  initial: { y: 0, opacity: 0.4 },
  animate: (i: number) => ({
    y: [0, -5, 0],
    opacity: [0.4, 1, 0.4],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      delay: i * 0.15,
      ease: 'easeInOut',
    },
  }),
};

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isTyping, isDarkTheme = true }) => {
  const dotColor = isDarkTheme ? 'bg-blue-400' : 'bg-blue-500';

  return (
    <AnimatePresence>
      {isTyping && (
        <motion.div
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <span className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
            Typing
          </span>
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${dotColor}`}
                variants={dotVariants}
                initial="initial"
                animate="animate"
                custom={i}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TypingIndicator;
