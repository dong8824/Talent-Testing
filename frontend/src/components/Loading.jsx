import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const messages = [
  "正在连接潜意识...",
  "解析思维图谱...",
  "聚合核心能量..."
];

export default function Loading() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="relative w-24 h-24 mb-16">
        <div className="absolute inset-0 bg-spa-accent/20 rounded-full animate-breathe blur-xl"></div>
        <div className="absolute inset-0 border border-spa-accent/30 rounded-full animate-[spin_8s_linear_infinite]"></div>
        <div className="absolute inset-4 border border-white/10 rounded-full animate-[spin_12s_linear_infinite_reverse]"></div>
      </div>

      <motion.div
        key={msgIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.8 }}
        className="text-sm uppercase tracking-widest text-spa-text-secondary font-light"
      >
        {messages[msgIndex]}
      </motion.div>
    </div>
  );
}
