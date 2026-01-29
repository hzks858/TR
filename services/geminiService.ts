
import { GoogleGenAI } from "@google/genai";

// Initialize the GoogleGenAI client using the environment variable directly as required.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getComplianceAdvice = async (riskData: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `基于以下医药合规风险数据：${JSON.stringify(riskData)}，请为质量保证主管提供 3 条简洁、可操作的审计就绪建议。请使用专业且符合行业标准的中文简体。`,
    });
    // Correctly accessing the text property from the response object.
    return response.text;
  } catch (error) {
    console.error("Gemini Compliance Error:", error);
    return "生成合规洞察时出错。请确保 API 密钥有效。";
  }
};
