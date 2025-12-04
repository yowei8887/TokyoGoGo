import { GoogleGenAI } from "@google/genai";
import { ItineraryItem, Activity } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getFoodSuggestions = async (item: ItineraryItem): Promise<string> => {
  if (!apiKey) return "請設定 API Key";

  try {
    const prompt = `
      我正在規劃日本行程。
      日期: ${item.date}
      地點/活動: ${item.location}
      
      請推薦 3 個這個地點附近適合的餐廳或美食類型。
      請用繁體中文回答，簡潔條列式。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || "無建議";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "無法取得建議";
  }
};

export const getWeatherPrediction = async (date: string, location: string): Promise<string> => {
  if (!apiKey) return "API Key missing";

  try {
    // Simplified prompt for better stability
    const prompt = `
      Predict the weather for: ${location}, Date: ${date}.
      Return ONLY a short string in Traditional Chinese like: "Condition, High°C / Low°C".
      Example: "☁️ 多雲, 8°C / 2°C"
      Do not add any explanation.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text?.trim();
    // Basic validation to check if it looks like weather data
    if (text && (text.includes("°C") || text.includes("晴") || text.includes("雨") || text.includes("雪") || text.includes("雲"))) {
      return text;
    }
    return "☁️ 資料更新中";
  } catch (error) {
    console.error("Weather Fetch Error", error);
    return "☁️ 無法取得";
  }
};

export const generateTourGuideInfo = async (item: ItineraryItem): Promise<string> => {
  if (!apiKey) return "API Key missing";

  try {
    const prompt = `
      你是一位專業的日本導遊。請根據以下行程提供詳細的攻略資訊：
      
      地點/活動: ${item.location}
      備註: ${item.notes}

      請提供以下格式的資訊（請使用 HTML 標籤格式化重點）：
      1. <span class="text-blue-600 font-bold">【景點故事】</span>：簡短介紹 1-2 個地點的趣聞或歷史。
      2. <span class="text-orange-600 font-bold">【必吃美食】</span>：推薦必吃餐點或必點菜單。
      3. <span class="text-pink-600 font-bold">【必買伴手禮】</span>：推薦值得買的東西。
      4. <span class="text-red-600 font-bold">【貼心提醒】</span>：如果有預約代號、交通注意點等。

      請保持語氣輕鬆有趣，總字數控制在 300 字以內。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error(error);
    return "導遊正在忙線中...";
  }
};

export const generateActivityGuide = async (activity: Activity, date: string): Promise<string> => {
  if (!apiKey) return "API Key missing";

  try {
    const prompt = `
      你是一個日本旅遊達人。
      時間: ${date} ${activity.time}
      地點/活動: ${activity.title}
      備註: ${activity.description}
      類型: ${activity.type}

      請給我關於這個具體活動的「一句話攻略」或「冷知識」或「必做事項」。
      如果是餐廳，推薦一道菜。
      如果是景點，推薦一個拍照角度。
      如果是購物，推薦一個品牌或商品。
      
      請直接給我內容，不要有標題，繁體中文，50字以內，語氣輕鬆活潑。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || "";
  } catch (error) {
    return "連線不穩，請稍後再試";
  }
};