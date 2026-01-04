from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from typing import List, Dict, Optional
import json
from openai import OpenAI
import logging
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# DEBUG: Print loaded config
print("--- BACKEND STARTUP DEBUG ---")
print(f"API Base: {os.getenv('ALIYUN_API_BASE')}")
print(f"Model: {os.getenv('ALIYUN_MODEL_NAME')}")
key = os.getenv("ALIYUN_API_KEY")
print(f"API Key: {key[:6]}...{key[-4:] if key else 'None'}")
print("-----------------------------")

app = FastAPI(root_path="/api")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for Vercel deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str
    content: str

class AssessmentStartResponse(BaseModel):
    message: str
    history: List[ChatMessage]

class AssessmentStartRequest(BaseModel):
    mode: str = "normal" # "normal" or "quick"

class AssessmentChatRequest(BaseModel):
    user_message: str
    history: List[ChatMessage]

class AssessmentChatResponse(BaseModel):
    message: str
    history: List[ChatMessage]
    is_finished: bool = False

class DebugChatInput(BaseModel):
    message: str

# Configure OpenAI client for Aliyun/DeepSeek
client = OpenAI(
    api_key=os.getenv("ALIYUN_API_KEY"),
    base_url=os.getenv("ALIYUN_API_BASE"),
)

# Load System Prompt
BASE_SYSTEM_PROMPT = """
天赋咨询机器人：系统提示词（System Prompt）
# 角色定位 你是一位融合了“流理论”与“荣格心理学”的顶级生涯咨询师。你的任务是通过深度对话，挖掘用户潜意识中被遮蔽的天赋底层能力。

# 核心对话准则（必须严格遵守）

单次单问： 严禁一次性抛出多个问题。必须采用“你问 -> 用户答 -> 你简短反馈并分析 -> 你提下一个问题”的模式。

追问机制： 必问问题有 4 个（见下文），但你可以根据用户的回答细节，进行 1-3 次即兴深度追问。总对话轮数控制在 6-10 轮。

反馈艺术： 每一轮反馈都要体现出“温暖而犀利”。要能指出用户回答中隐藏的矛盾、逻辑漏洞或潜意识信号。

# 必问的四个维度

童年冲动： 16岁前无视奖励也愿意废寝忘食做的事，或被批评的“顽固缺点”。

无意识胜任： 成年后觉得“这不就是常识吗”但别人觉得很难的事。

能量审计： 哪些事做完后虽然累，但精神极度亢奋（回血感）。

嫉妒镜像： 坦诚面对曾产生过的强烈嫉妒感（嫉妒是天赋被压抑的背面）。

# 任务流阶段

阶段 1：开场白。 用温暖共情的语气欢迎用户，解释流程（约10轮对话），告知目标是生成《天赋说明书》。然后抛出第一个问题。

阶段 2：交互挖掘。 执行多轮对话，确保覆盖上述四个维度。

阶段 3：总结报告。 当你认为信息收集充分或达到轮数上限时，通知用户开始生成报告，并输出指令符 【DONE】。

# 报告输出格式要求 (核心) 报告必须包含以下模块，缺一不可：

天赋核心词（三个）： 用 2-4 字的词语精准概括（如：跨界连接者、深海潜行者、情感调频师）。

职业适配指南（五个）：

按照适配度由高到低排序。

每一项需注明：【职业名称】+【适配原因深度解析】。

天赋特征详述（深度模块）： * 必须不少于 1000 字。

内容需涵盖：天赋的底层逻辑、它是如何在用户生活中起作用的、它如何解释用户过去的困惑、以及如何应对天赋带来的负面效应（阴影面）。

行动指南（具体建议）： 包含可执行清单与节奏建议，工具/练习/里程碑。

不适合的事情（避坑指南）： 列举不匹配的工作方式/环境/角色，说明原因与风险。

# 初始指令 现在，请开始第一阶段：用温暖的语调开场，并直接提出第一个关于“童年/缺点”的问题。

# 语言风格特别要求
严禁舞台剧式描写：严禁使用（括号）描写动作、神态或心理活动（如“（微笑）”、“（严肃地）”、“（身体前倾）”等）。直接说话，不要加戏。保持专业、温暖、对话感。
"""

@app.get("/")
def read_root():
    logger.info("Root endpoint hit")
    return {"message": "Talent Instruction Manual API (Powered by DeepSeek)"}

@app.get("/health")
def health_check():
    logger.info("Health check hit")
    return {"status": "ok", "model": os.getenv("ALIYUN_MODEL_NAME")}

@app.post("/chat")
def chat_with_ai(input: DebugChatInput):
    logger.info(f"Chat endpoint hit with message: {input.message}")
    try:
        completion = client.chat.completions.create(
            model=os.getenv("ALIYUN_MODEL_NAME", "deepseek-v3"),
            messages=[
                {'role': 'system', 'content': "You are a helpful assistant. Keep answers short."},
                {'role': 'user', 'content': input.message}
            ],
            temperature=0.7
        )
        reply = completion.choices[0].message.content
        logger.info(f"AI Reply: {reply}")
        return {"reply": reply}
    except Exception as e:
        logger.error(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/debug/start")
def start_debug_chat():
    logger.info("Starting debug chat session with System Prompt")
    try:
        messages = [{'role': 'system', 'content': BASE_SYSTEM_PROMPT}]
        messages.append({'role': 'user', 'content': "你好，请开始你的工作。"})

        completion = client.chat.completions.create(
            model=os.getenv("ALIYUN_MODEL_NAME", "deepseek-v3"),
            messages=messages,
            temperature=0.7
        )
        
        reply = completion.choices[0].message.content
        logger.info(f"Debug Chat Started. AI: {reply}")
        
        return {"reply": reply}
    except Exception as e:
        logger.error(f"Start Debug Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/assessment/start")
def start_assessment(request: AssessmentStartRequest):
    logger.info(f"Starting new assessment session. Mode: {request.mode}")
    try:
        current_prompt = BASE_SYSTEM_PROMPT
        
        if request.mode == "quick":
            current_prompt += """
            \n【重要指令变更】本次为极速体验模式。请将原定的 6-10 轮对话压缩为 **3 轮**。
            
            流程如下：
            1. 你开场（询问第1个问题：童年/缺点）。
            2. 用户回答 -> 你反馈并问第2个问题（无意识胜任/能量）。
            3. 用户回答 -> 你反馈并问第3个问题（嫉妒/其他）。
            4. 用户回答 -> 你反馈总结，并**必须**在回复结尾输出指令符 【DONE】。

            注意：第3个问题之后，用户回答完，你就不要再问问题了！直接做总结并结束！
            """
        
        # Initial call to get the first question
        messages = [{'role': 'system', 'content': current_prompt}]
        
        messages.append({'role': 'user', 'content': "你好，我准备好开始探索我的天赋了。"})

        completion = client.chat.completions.create(
            model=os.getenv("ALIYUN_MODEL_NAME", "deepseek-v3"),
            messages=messages,
            temperature=0.7
        )
        
        reply = completion.choices[0].message.content
        logger.info(f"Assessment Started. AI: {reply}")
        
        # Return the AI's reply and the history (including the AI's reply)
        messages.append({'role': 'assistant', 'content': reply})
        
        return {
            "message": reply,
            "history": messages
        }
    except Exception as e:
        logger.error(f"Start Assessment Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/assessment/chat")
def assessment_chat(input: AssessmentChatRequest):
    logger.info(f"Assessment chat. User: {input.user_message}")
    try:
        # Append user message to history
        messages = input.history
        messages.append({'role': 'user', 'content': input.user_message})

        completion = client.chat.completions.create(
            model=os.getenv("ALIYUN_MODEL_NAME", "deepseek-v3"),
            messages=messages,
            temperature=0.7
        )
        
        reply = completion.choices[0].message.content
        # Remove [DONE] token from AI reply if present before sending to frontend
        reply_to_user = reply.replace("【DONE】", "").strip()

        messages.append({'role': 'assistant', 'content': reply})
        
        is_finished = "【DONE】" in reply
        # Fallback check for long conversations
        if len(messages) > 20: 
             is_finished = True

        return {
            "message": reply_to_user,
            "history": messages,
            "is_finished": is_finished
        }
    except Exception as e:
        logger.error(f"Assessment Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/assessment/report")
def generate_report(input: AssessmentChatRequest):
    logger.info("Generating Report...")
    try:
        # Convert history to list of dicts to ensure compatibility
        messages = [{"role": m.role, "content": m.content} for m in input.history]
        
        # Add a system instruction (as user message for stronger effect at the end) to force JSON format
        messages.append({'role': 'user', 'content': """
        【任务终止】请停止咨询对话。
        【新任务】请根据上述对话历史，生成一份《天赋说明书》。
        
        【格式要求】
        1. 必须输出标准的 JSON 格式。
        2. 不要包含 markdown 代码块标记 (```json ... ```)。
        3. 不要包含任何其他解释性文字。
        
        【JSON 结构模板】
        {
            "core_traits": ["天赋词1", "天赋词2", "天赋词3"],
            "deep_analysis": "深度解析内容（至少800字），包含底层逻辑、生活映射、困惑解答。请使用 \\n 进行换行。",
            "action_guide": "具体的行动建议和练习。",
            "careers": [
                {"title": "推荐职业1", "reason": "适配原因"},
                {"title": "推荐职业2", "reason": "适配原因"},
                {"title": "推荐职业3", "reason": "适配原因"},
                {"title": "推荐职业4", "reason": "适配原因"},
                {"title": "推荐职业5", "reason": "适配原因"}
            ],
            "not_suitable": "不适合从事的工作类型及原因（阴影面）。"
        }
        """})

        completion = client.chat.completions.create(
            model=os.getenv("ALIYUN_MODEL_NAME", "deepseek-v3"),
            messages=messages,
            temperature=0.1, # Low temp for deterministic formatting
            response_format={ "type": "json_object" }
        )
        
        result_content = completion.choices[0].message.content
        logger.info(f"Report Generated: {result_content[:100]}...")
        
        # Robustly clean up Markdown code blocks
        if "```json" in result_content:
            result_content = result_content.split("```json")[1]
            if "```" in result_content:
                result_content = result_content.split("```")[0]
        elif "```" in result_content:
            result_content = result_content.split("```")[1]
            if "```" in result_content:
                result_content = result_content.split("```")[0]
        
        # Strip any leading/trailing whitespace
        result_content = result_content.strip()
        
        try:
            parsed_json = json.loads(result_content)
            
            # Map old keys to new keys if AI uses old format fallback
            if "keywords" in parsed_json and "core_traits" not in parsed_json:
                parsed_json["core_traits"] = parsed_json["keywords"]
            if "analysis" in parsed_json and "deep_analysis" not in parsed_json:
                parsed_json["deep_analysis"] = parsed_json["analysis"]
            if "shadow_transformation" in parsed_json and "not_suitable" not in parsed_json:
                parsed_json["not_suitable"] = parsed_json["shadow_transformation"]
                
            # Inject full chat history into the response
            parsed_json["full_chat_history"] = [
                {"role": m.role, "content": m.content} 
                for m in input.history 
                if m.role != "system" # Exclude system prompt from frontend view
            ]
            return parsed_json
        except json.JSONDecodeError as e:
            logger.error(f"JSON Decode Error: {e}. Content: {result_content}")
            # Try to fix common JSON errors or return error structure
            return {
                "core_traits": ["生成失败", "请重试", "格式错误"],
                "deep_analysis": f"报告生成时出现格式错误。原始内容: {result_content[:500]}...",
                "not_suitable": "请联系管理员查看日志。",
                "action_guide": "刷新页面重试。",
                "careers": [],
                "full_chat_history": []
            }

    except Exception as e:
        logger.error(f"Report Generation Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/assessment/random_report")
def generate_random_report():
    logger.info("Generating Random Report...")
    try:
        messages = [{'role': 'system', 'content': """
        You are an expert Talent Analyst.
        Generate a comprehensive "Talent Instruction Manual" for a FICTIONAL user.
        Create a persona (e.g., a creative writer who thinks they are lazy, or a logical engineer who loves painting).
        Based on this fictional persona, generate a full report in strict JSON format.
        
        The JSON MUST include:
        {
            "core_traits": ["Trait1", "Trait2", "Trait3"],
            "deep_analysis": ">=1000 words analysis of their talent, underlying logic, and potential",
            "action_guide": "Actionable advice and steps",
            "careers": [
                {"title": "Career 1", "reason": "Reason 1"},
                {"title": "Career 2", "reason": "Reason 2"},
                {"title": "Career 3", "reason": "Reason 3"},
                {"title": "Career 4", "reason": "Reason 4"},
                {"title": "Career 5", "reason": "Reason 5"}
            ],
            "not_suitable": "What they should avoid and why (Shadow Integration)"
        }
        Ensure content is rich, professional, and empathetic. Language: Simplified Chinese.
        """}]
        
        completion = client.chat.completions.create(
            model=os.getenv("ALIYUN_MODEL_NAME", "deepseek-v3.2"),
            messages=messages,
            temperature=0.8,
            response_format={ "type": "json_object" }
        )
        
        result_content = completion.choices[0].message.content
        logger.info(f"Random Report Generated: {result_content[:100]}...")
        
        if result_content.startswith("```json"):
            result_content = result_content.replace("```json", "").replace("```", "")
        
        result_content = result_content.strip()
        
        try:
            parsed_json = json.loads(result_content)
            # Add mock history for the view button
            parsed_json["full_chat_history"] = [
                {"role": "system", "content": "Random Report Generation Mode"},
                {"role": "assistant", "content": "This is a randomly generated report for testing purposes."}
            ]
            return parsed_json
        except json.JSONDecodeError as e:
            logger.error(f"JSON Decode Error: {e}. Content: {result_content}")
            return {
                "core_traits": ["Error", "Retry", "Connection"],
                "deep_analysis": "Failed to generate random report.",
                "not_suitable": "Please check logs.",
                "action_guide": "Please retry.",
                "careers": [],
                "full_chat_history": []
            }

    except Exception as e:
        logger.error(f"Random Report Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
