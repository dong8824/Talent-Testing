import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function Assessment({ mode = "normal", onComplete, onProgress }) {
  const [history, setHistory] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [round, setRound] = useState(0);

  // Initialize assessment with AI
  useEffect(() => {
    const startAssessment = async () => {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/assessment/start`, { mode });
        setCurrentQuestion(response.data.message);
        setHistory(response.data.history);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to start assessment:", error);
        setCurrentQuestion("无法连接到咨询师。请刷新重试。");
        setIsLoading(false);
      }
    };
    startAssessment();
  }, [mode]);

  // Update progress based on rounds (assuming approx 8-10 rounds)
  useEffect(() => {
    const progress = Math.min(10 + (round * 10), 90);
    if (onProgress) onProgress(progress);
  }, [round, onProgress]);

  const handleNext = async () => {
    if (input.length < 2) return;

    // Show loading/feedback state
    setShowFeedback(true);
    const userMsg = input;
    setInput(""); 
    
    try {
      // Send user response to AI
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/assessment/chat`, {
        user_message: userMsg,
        history: history
      });

      if (response.data.is_finished) {
        // If AI signals completion, trigger report generation
        if (onProgress) onProgress(95);
        // We pass the full history to onComplete so App.jsx can call /assessment/report
        onComplete(response.data.history);
      } else {
        // Continue to next question
        setHistory(response.data.history);
        setCurrentQuestion(response.data.message);
        setRound(prev => prev + 1);
        setShowFeedback(false);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setShowFeedback(false);
      // Handle error gracefully?
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-spa-accent" />
        <p className="mt-4 text-spa-text-muted text-sm tracking-widest uppercase">正在连接咨询师...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 md:p-12 max-w-3xl mx-auto">
      <AnimatePresence mode="wait">
        {showFeedback ? (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center space-y-6"
          >
            <Loader2 className="w-10 h-10 animate-spin text-spa-accent/50" />
            <p className="text-xl md:text-2xl font-serif text-center text-spa-accent leading-relaxed">
              正在聆听与思考...
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="question"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full space-y-12"
          >
            <div className="flex items-center gap-4 text-xs uppercase tracking-luxury text-spa-text-muted">
              <span>Round 0{round + 1}</span>
              <div className="h-[1px] w-12 bg-white/10"></div>
              <span>Depth Interaction</span>
            </div>
            
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif leading-tight text-spa-text-primary whitespace-pre-line">
              {currentQuestion}
            </h2>

            <div className="relative group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (input.length >= 2) handleNext();
                  }
                }}
                placeholder="在此处书写..."
                className="input-journal h-40"
                autoFocus
              />
              <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-spa-accent transition-all duration-500 group-focus-within:w-full"></div>
            </div>

            <div className="flex justify-between items-center pt-8">
              <span className={`text-xs tracking-wider uppercase transition-colors duration-300 
                ${input.length > 0 && input.length < 2 ? 'text-red-400' : 'text-spa-text-muted'}`}>
                {input.length > 0 && input.length < 2 ? "需更多细节" : <span className="hidden md:inline">按 Enter 发送，Shift+Enter 换行</span>}
              </span>
              
              <button
                onClick={handleNext}
                disabled={input.length < 2}
                className="group flex items-center gap-3 px-8 py-4 border border-zinc-200 rounded-full
                           text-sm uppercase tracking-widest hover:bg-spa-text-primary hover:text-spa-bg
                           disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-spa-text-primary disabled:cursor-not-allowed
                           transition-all duration-300"
              >
                <span>回复</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
