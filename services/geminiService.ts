import { GoogleGenAI } from "@google/genai";
import { BrewLog, Bean, Equipment, BeanCategory, BrewMethod } from "../types";

const apiKey = process.env.API_KEY || '';

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeBrew = async (log: BrewLog, bean: Bean, grinder?: Equipment, brewer?: Equipment): Promise<string> => {
  if (!ai) return "缺少 API 密钥。请检查环境配置。";

  // Construct Bean Description
  let beanDesc = `${bean.name} (${bean.roaster}, ${bean.roastLevel})`;
  if (bean.category === BeanCategory.BLEND && bean.blendParts && bean.blendParts.length > 0) {
    const parts = bean.blendParts.map(p => `${p.origin}[${p.process},${p.roastLevel}]`).join(' + ');
    beanDesc += ` - 拼配配方: ${parts}`;
  } else {
    beanDesc += ` - ${bean.origin}, ${bean.process}`;
  }

  const grinderName = grinder ? `${grinder.brand || ''} ${grinder.name}` : '未指定磨豆机';
  const brewerName = brewer ? `${brewer.brand || ''} ${brewer.name}` : log.method;
  
  const isEspresso = log.method === BrewMethod.ESPRESSO;
  const ratioLabel = isEspresso ? "粉液比" : "粉水比";
  const outputLabel = isEspresso ? "液重" : "注水量";

  const prompt = `
    你是一位专业的咖啡师和感官评审。
    我刚刚冲煮了一杯咖啡，需要你的建议来改进它。
    
    冲煮数据:
    - 咖啡豆: ${beanDesc}
    - 豆仓状态: 剩余 ${bean.remainingWeight}g / 初始 ${bean.weight}g
    - 冲煮设备: ${brewerName} (方式: ${log.method})
    - 磨豆机: ${grinderName} (刻度: ${log.grinderSetting})
    - ${ratioLabel}: ${log.doseIn}g 粉, ${log.yieldOut}g ${outputLabel} (比例 1:${(log.yieldOut / log.doseIn).toFixed(1)})
    - 时间: ${log.timeSeconds} 秒
    - 水温: ${log.temperature}°C
    
    我的感官反馈:
    - 评分: ${log.rating}/5
    - 风味/口感描述: "${log.notes}"
    
    请根据我的描述和数据，提供一段简短的分析（最多3句话），解释为什么会呈现这种风味（例如：萃取过度、萃取不足、通道效应等）。
    特别注意：如果我知道磨豆机型号，请根据该磨豆机的特性（如细粉多少、径向分布）给出针对性的调整建议（如调整刻度或水温）。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "无法生成分析。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "抱歉，暂时无法分析您的冲煮记录。";
  }
};

export const suggestBeanNotes = async (origin: string, process: string, roast: string): Promise<string> => {
  if (!ai) return "";

  const prompt = `针对一款产自 ${origin}，处理方式为 ${process}，烘焙度为 ${roast} 的咖啡豆，请列出 3-5 个可能的风味描述词（仅列出形容词，用逗号分隔，使用中文）。`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error(error);
    return "";
  }
};