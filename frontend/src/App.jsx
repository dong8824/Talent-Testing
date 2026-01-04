import { useState, useEffect } from 'react';
import axios from 'axios';
import Landing from './components/Landing';
import Assessment from './components/Assessment';
import Loading from './components/Loading';
import Report from './components/Report';
import DebugChat from './components/DebugChat';

function App() {
  const [step, setStep] = useState('landing');
  const [reportData, setReportData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showDebugChat, setShowDebugChat] = useState(false);

  const [mode, setMode] = useState("normal");

  useEffect(() => {
    const handleOpenDebugChat = () => setShowDebugChat(true);
    window.addEventListener('openDebugChat', handleOpenDebugChat);
    return () => window.removeEventListener('openDebugChat', handleOpenDebugChat);
  }, []);

  const handleStart = async (selectedMode = "normal") => {
    if (selectedMode === "test_report") {
      setReportData({
        keywords: ["直觉敏锐", "共情者", "战略家"],
        analysis: "这是一个测试报告。如果能看到这个，说明报告组件(Report.jsx)工作正常，问题出在 DeepSeek 返回的数据格式或后端处理上。",
        shadow_transformation: "测试阴影：如果看不到报告，说明是前端组件崩溃了。",
        action_guide: "请检查后端日志，确认 DeepSeek 返回的 JSON 是否符合要求。"
      });
      setStep('report');
      return;
    }

    if (selectedMode === "quick") {
      setProgress(30);
      setStep('loading');
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/assessment/random_report`);
        console.log("Random Report Data Received:", response.data);
        
        // Ensure robust data handling
        const finalData = response.data;
        // Fallback checks
        if (!finalData.core_traits && finalData.keywords) finalData.core_traits = finalData.keywords;
        if (!finalData.deep_analysis && finalData.analysis) finalData.deep_analysis = finalData.analysis;
        if (!finalData.not_suitable && finalData.shadow_transformation) finalData.not_suitable = finalData.shadow_transformation;

        setReportData(finalData);
        setProgress(100);
        setStep('report');
      } catch (error) {
        console.error("Error generating random report:", error);
        setReportData({
          core_traits: ["错误", "重试", "连接"],
          deep_analysis: "生成随机报告时发生错误。",
          not_suitable: "请检查后端日志。",
          action_guide: "请刷新页面重试。",
          careers: []
        });
        setProgress(100);
        setStep('report');
      }
      return;
    }

    setProgress(10);
    setMode(selectedMode);
    setStep('assessment');
  };

  const updateProgress = (val) => setProgress(val);

  const handleComplete = async (chatHistory) => {
    setProgress(90);
    setStep('loading');
    try {
      // Call backend API to generate report based on full chat history
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/assessment/report`, { 
        user_message: "", // Not needed for report generation
        history: chatHistory 
      });
      console.log("Report Data Received:", response.data);
      
      const finalData = response.data;
      // Fallback checks
      if (!finalData.core_traits && finalData.keywords) finalData.core_traits = finalData.keywords;
      if (!finalData.deep_analysis && finalData.analysis) finalData.deep_analysis = finalData.analysis;
      if (!finalData.not_suitable && finalData.shadow_transformation) finalData.not_suitable = finalData.shadow_transformation;

      if (finalData) {
        setReportData(finalData);
      } else {
        throw new Error("Invalid report data structure");
      }
      
      // Simulate loading time for effect
      setTimeout(() => {
        setProgress(100);
        setStep('report');
      }, 1000); 
    } catch (error) {
      console.error("Error fetching analysis:", error);
      // Fallback mock data if backend fails
      setReportData({
        core_traits: ["错误", "重试", "连接"],
        deep_analysis: "生成报告时发生错误，请检查网络连接或重试。",
        not_suitable: "技术故障也是一种提醒，让我们停下来深呼吸。",
        action_guide: "请刷新页面重新开始。",
        full_chat_history: chatHistory // Pass chat history even on error so user can inspect it
      });
      setTimeout(() => {
        setProgress(100);
        setStep('report');
      }, 3000);
    }
  };

  return (
    <div className="text-spa-text-primary font-sans bg-spa-bg min-h-screen">
       {/* Debug Chat Modal */}
       <DebugChat isOpen={showDebugChat} onClose={() => setShowDebugChat(false)} />

       {/* Light Beam Progress Bar - Dark on Light */}
        {step !== 'landing' && (
          <div className="fixed top-0 left-0 w-full h-[2px] bg-spa-text-primary/5 z-50">
            <div 
              className="h-full bg-spa-text-primary light-beam transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

      {step === 'landing' && <Landing onStart={handleStart} />}
      {step === 'assessment' && <Assessment mode={mode} onComplete={handleComplete} onProgress={updateProgress} />}
      {step === 'loading' && <Loading />}
      {step === 'report' && <Report data={reportData} />}
    </div>
  );
}

export default App;
