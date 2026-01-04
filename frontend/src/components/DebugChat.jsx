import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Activity, Server } from 'lucide-react';
import axios from 'axios';

export default function DebugChat({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'DeepSeek 连接测试窗口已就绪。' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Trigger System Prompt init on open
  useEffect(() => {
    if (isOpen) {
      handleInitDebug();
    }
  }, [isOpen]);

  const handleInitDebug = async () => {
    setMessages(prev => [...prev, { role: 'system', content: '正在初始化 System Prompt...' }]);
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/debug/start');
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'error', content: `初始化失败: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePing = async () => {
    setMessages(prev => [...prev, { role: 'system', content: '正在测试后端连接...' }]);
    try {
      const response = await axios.get('http://localhost:8000/health');
      setMessages(prev => [...prev, { role: 'success', content: `后端连接成功! 状态: ${response.data.status}, 模型: ${response.data.model}` }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'error', content: `后端连接失败: ${error.message}` }]);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      console.log("Sending message to backend:", userMsg);
      const response = await axios.post('http://localhost:8000/chat', { message: userMsg });
      console.log("Backend response:", response.data);
      
      if (response.data && response.data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'error', content: '收到空响应，请检查后端日志' }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'error', content: `请求失败: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-24 right-8 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden z-[100]"
        >
          {/* Header */}
          <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              DeepSeek Debugger
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePing}
                title="测试服务器连接"
                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Activity size={16} />
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-gray-900 text-white rounded-br-none' 
                    : msg.role === 'error'
                    ? 'bg-red-50 text-red-600 border border-red-100'
                    : msg.role === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-100'
                    : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="发送测试消息..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-gray-400 focus:bg-white transition-all"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-gray-900 text-white p-2 rounded-xl hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
