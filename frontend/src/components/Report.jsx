import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Copy, Share2, Award, Zap, Compass, Check } from 'lucide-react';

export default function Report({ data }) {
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const handleDownload = () => {
    window.print();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Helper to process text: replace literal \n with real newlines and ensure safe rendering
  const formatText = (text) => {
    if (!text) return "";
    return text.replace(/\\n/g, '\n');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-soft text-spa-text-primary selection:bg-spa-accent selection:text-white overflow-hidden">
      {/* Subtle Background Elements for Atmosphere */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-50/30 rounded-full blur-[120px] mix-blend-multiply opacity-60 animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-50/30 rounded-full blur-[120px] mix-blend-multiply opacity-60 animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      <div className="relative z-10 py-24 px-6 md:px-12 max-w-6xl mx-auto">
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-20 md:space-y-32"
        >
          {/* Header */}
          <header className="relative text-center space-y-8">
             {/* Export Options - Top Right (Floating Pill) */}
             <div className="absolute top-0 right-0 hidden md:flex gap-4">
                 <button onClick={handleDownload} className="group flex items-center justify-center w-12 h-12 rounded-full bg-white/40 backdrop-blur-sm border border-white/60 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300">
                     <Download size={18} className="text-zinc-500 group-hover:text-zinc-900 transition-colors" />
                 </button>
                 <button onClick={handleCopy} className="group flex items-center justify-center w-12 h-12 rounded-full bg-white/40 backdrop-blur-sm border border-white/60 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300">
                     {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} className="text-zinc-500 group-hover:text-zinc-900" />}
                 </button>
             </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="inline-block px-4 py-1.5 bg-white/30 backdrop-blur-md border border-white/40 rounded-full text-[10px] font-bold tracking-luxury uppercase text-zinc-500 mb-6 shadow-sm"
            >
              Confidential Report
            </motion.div>
            <h1 className="text-6xl md:text-8xl font-serif text-zinc-900 tracking-tighter leading-tight drop-shadow-sm">
              天赋说明书
            </h1>
            <p className="text-zinc-400 font-light tracking-widest text-sm uppercase">
              关于你的真相
            </p>
          </header>

          {/* Core Keywords Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Fallback to 'keywords' if 'core_traits' is missing, or empty array */}
            {(data.core_traits || data.keywords || []).map((kw, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.8 }}
                className="group relative h-48 rounded-[2.5rem] bg-white/30 backdrop-blur-xl border border-white/40 p-8 flex flex-col justify-center gap-4 transition-all duration-500 hover:shadow-float hover:-translate-y-2 overflow-hidden"
              >
                {/* Abstract background shape */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-zinc-100/50 to-transparent rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <span className="relative text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-8 h-[1px] bg-zinc-300"></span>
                  0{i+1} / 核心
                </span>
                <h3 className="relative text-4xl font-serif text-zinc-800 group-hover:text-zinc-900 transition-colors duration-300 leading-tight">
                  {kw}
                </h3>
                <div className="absolute bottom-8 right-8 w-8 h-8 rounded-full border border-zinc-200/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                  <div className="w-1.5 h-1.5 bg-zinc-900 rounded-full"></div>
                </div>
              </motion.div>
            ))}
          </section>

          {/* Main Content Layout */}
          <div className="space-y-16">
            
            {/* Analysis Section */}
            <motion.section 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white/30 backdrop-blur-xl p-10 md:p-16 rounded-[3rem] border border-white/40 shadow-soft"
            >
                <div className="flex items-center gap-6 mb-12">
                  {/* Clean icon container - no background, just icon */}
                  <div className="w-10 h-10 flex items-center justify-center opacity-70">
                    <Compass strokeWidth={1} size={24} className="text-zinc-800" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-luxury text-zinc-400">深度解析</h3>
                </div>
                <div className="text-lg md:text-xl leading-loose text-zinc-600 font-light whitespace-pre-wrap">
                  {formatText(data.deep_analysis || data.analysis)}
                </div>
            </motion.section>

            {/* Action Guide Section */}
            <motion.section 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white/30 backdrop-blur-xl p-10 md:p-16 rounded-[3rem] border border-white/40 shadow-soft"
            >
                <div className="flex items-center gap-6 mb-12">
                   {/* Clean icon container - no background, just icon */}
                  <div className="w-10 h-10 flex items-center justify-center opacity-70">
                    <Award strokeWidth={1} size={24} className="text-zinc-800" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-luxury text-zinc-400">行动指南</h3>
                </div>
                <div className="text-lg md:text-xl leading-loose text-zinc-600 font-light whitespace-pre-wrap">
                  {formatText(data.action_guide)}
                </div>
            </motion.section>

             {/* Career Recommendations Section */}
             {data.careers && data.careers.length > 0 && (
                <section className="space-y-8">
                  <div className="flex items-center gap-4 px-4">
                     <div className="h-px bg-zinc-200/50 flex-1"></div>
                     <h3 className="text-xs font-bold uppercase tracking-luxury text-zinc-400">职业建议</h3>
                     <div className="h-px bg-zinc-200/50 flex-1"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {data.careers.map((career, idx) => (
                      <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1, duration: 0.6 }}
                        className="group p-10 rounded-[2.5rem] bg-white/30 backdrop-blur-md border border-white/40 hover:bg-white/50 hover:shadow-float transition-all duration-500"
                      >
                        <h4 className="text-2xl font-serif text-zinc-800 mb-4">{career.title}</h4>
                        <p className="text-sm text-zinc-500 font-light leading-relaxed">{career.reason}</p>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

            {/* Not Suitable Section (Shadow) - Softened Dark Mode */}
            <motion.section 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative bg-gradient-to-br from-zinc-900 to-zinc-800 p-10 md:p-16 rounded-[3rem] text-zinc-100 overflow-hidden shadow-2xl shadow-zinc-900/10"
            >
                {/* Abstract decoration - smoother */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-6 mb-12">
                      <div className="w-14 h-14 flex items-center justify-center opacity-80">
                          <Zap strokeWidth={1} size={24} className="text-zinc-300" />
                      </div>
                      <h3 className="text-xs font-bold uppercase tracking-luxury text-zinc-400">潜在盲点 / 需注意</h3>
                    </div>
                    <div className="text-xl md:text-2xl font-serif italic text-zinc-200 leading-relaxed mb-10 whitespace-pre-wrap opacity-90">
                      "{formatText(data.not_suitable || data.shadow_transformation)}"
                    </div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest border-t border-white/10 pt-8 inline-block">
                      阴影整合建议
                    </p>
                </div>
            </motion.section>

            {/* Mobile Export Options */}
            <div className="md:hidden space-y-4 pt-8 pb-12">
                 <button onClick={handleDownload} className="w-full py-5 rounded-2xl bg-white border border-zinc-100 text-xs font-bold uppercase tracking-widest hover:bg-zinc-50 transition-all flex items-center justify-center gap-3 shadow-sm">
                     <Download size={16} /> <span>下载报告</span>
                 </button>
                 <button onClick={handleCopy} className="w-full py-5 rounded-2xl bg-white border border-zinc-100 text-xs font-bold uppercase tracking-widest hover:bg-zinc-50 transition-all flex items-center justify-center gap-3 shadow-sm">
                     {copied ? <Check size={16} /> : <Copy size={16} />} <span>复制链接</span>
                 </button>
            </div>

          </div>

          {/* Footer */}
          <footer className="pt-24 pb-12 border-t border-zinc-200/50 flex flex-col md:flex-row justify-between items-center md:items-end gap-6 text-[10px] text-zinc-400 uppercase tracking-widest">
            <div className="text-center md:text-left">
              © 2024 天赋探索.<br />保留所有权利.
            </div>
            <div className="flex gap-8">
              <a href="#" className="hover:text-zinc-800 transition-colors">隐私政策</a>
              <a href="#" className="hover:text-zinc-800 transition-colors">服务条款</a>
            </div>
          </footer>

        </motion.div>
      </div>
    </div>
  );
}
