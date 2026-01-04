import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Landing({ onStart }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 md:p-12 text-center max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-16"
      >
        <header className="space-y-6">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif leading-tight tracking-tight text-spa-text-primary">
            天赋<br />
            <span className="text-spa-text-secondary italic">说明书</span>
          </h1>
          <p className="text-lg md:text-xl text-spa-text-secondary font-light max-w-lg mx-auto leading-relaxed">
            抽离喧嚣，在接下来的十分钟里，<br />
            与潜意识里的自己，进行一场深度对话。
          </p>
        </header>

        <div className="flex flex-col items-center gap-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStart("normal")}
            className="group flex items-center gap-4 px-10 py-5 bg-spa-text-primary text-spa-bg rounded-full 
                       text-lg tracking-widest uppercase transition-all duration-500 
                       hover:bg-spa-accent hover:text-spa-bg shadow-soft hover:shadow-lg"
          >
            <span>开启探索</span>
            <ArrowRight strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform duration-300" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
