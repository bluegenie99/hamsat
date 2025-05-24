
import { GoogleGenAI, Chat, GenerateContentResponse, Content } from "@google/genai";
import { Dialect, ChatMessage } from '../types';
import { getSystemInstruction } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable is not set. Please provide a valid API key.");
  // Potentially throw an error or handle this scenario in the UI
  // For this example, we'll allow the app to load but API calls will fail.
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "MISSING_API_KEY" }); // Fallback for type safety if not set

// Removed incorrect model initialization:
// const model = ai.models.geminiModel({
//   model: "gemini-2.5-flash-preview-04-17", // Recommended model
// });

export const createChatSession = async (dialect: Dialect, initialHistory?: ChatMessage[]): Promise<Chat | null> => {
  if (!API_KEY) {
    console.error("Cannot create chat session: API_KEY is missing.");
    return null;
  }
  try {
    const systemInstruction = getSystemInstruction(dialect);
    const history: Content[] = initialHistory 
      ? initialHistory.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }))
      : [];

    const chat = ai.chats.create({
      model: "gemini-2.5-flash-preview-04-17",
      config: {
        systemInstruction: systemInstruction,
        // thinkingConfig: { thinkingBudget: 0 } // Uncomment for lower latency if needed for game AI like responses
      },
      history: history
    });
    return chat;
  } catch (error) {
    console.error("Error creating chat session:", error);
    return null;
  }
};

export const sendMessageToGemini = async (
  chat: Chat,
  message: string
): Promise<string | null> => {
  if (!API_KEY) {
    console.error("Cannot send message: API_KEY is missing.");
    return "عذرًا، حدث خطأ في الاتصال. يرجى التأكد من إعدادات المفتاح الخاص بالواجهة البرمجية.";
  }
  try {
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    // Check for specific error types if needed
    if (error instanceof Error && error.message.includes('API_KEY_INVALID')) {
        return "مفتاح الواجهة البرمجية (API Key) غير صالح. يرجى التحقق منه.";
    }
    return "عذرًا، لم أستطع معالجة طلبك في الوقت الحالي. حاول مرة أخرى بعد قليل.";
  }
};
