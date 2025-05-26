
import { GoogleGenAI, Chat, Content, GenerateContentResponse } from "@google/genai";
import { Dialect, ChatMessage, MessageContent, ContentType } from '../types';
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

export const createChatSession = async (dialect: Dialect, aiName: string, initialHistory?: ChatMessage[]): Promise<Chat | null> => {
  if (!API_KEY) {
    console.error("Cannot create chat session: API_KEY is missing.");
    return null;
  }
  try {
    const systemInstruction = getSystemInstruction(dialect, aiName);
    const history: Content[] = initialHistory 
      ? initialHistory.map(msg => {
          return {
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text || '' }]
          };
        })
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

export const sendMessageToGemini = async (chatSession: Chat, messageContent: MessageContent): Promise<string | null> => {
  if (!API_KEY) {
    console.error("Cannot send message: API_KEY is missing.");
    return "عذرًا، حدث خطأ في الاتصال. يرجى التأكد من إعدادات المفتاح الخاص بالواجهة البرمجية.";
  }
  try {
    // تحضير نص الرسالة
    let messageText = messageContent.text || "";
    
    // إذا كانت الرسالة تحتوي على صورة، نضيف وصفًا للصورة
    if (messageContent.image && (messageContent.type === ContentType.Image || messageContent.type === ContentType.Mixed)) {
      // استخراج وصف الصورة من الخاصية alt
      const imageDescription = messageContent.image.alt || "";
      
      // إذا كان هناك وصف للصورة، نضيفه إلى الرسالة
      if (imageDescription) {
        if (!messageText) {
          messageText = `أرسلت لك صورة، وهذا وصفها: ${imageDescription}\n\nأرجو التفاعل مع هذه الصورة بناءً على وصفها.`;
        } else {
          messageText = `${messageText}\n\nأرسلت لك أيضًا صورة، وهذا وصفها: ${imageDescription}`;
        }
      } else {
        // إذا لم يكن هناك وصف للصورة
        if (!messageText) {
          messageText = "أرسلت لك صورة بدون وصف. هل يمكنك التفاعل معها؟";
        } else {
          messageText += "\n\nأرسلت لك أيضًا صورة مع هذه الرسالة.";
        }
      }
    }
    
    // إرسال الرسالة كنص فقط
    // إضافة إرشادات للنموذج للتفاعل بشكل أفضل مع الصور
    if (messageContent.image && messageContent.image.alt) {
      messageText += "\n\n[إرشادات للنموذج: يرجى التفاعل مع وصف الصورة بشكل طبيعي كما لو كنت ترى الصورة فعليًا. يمكنك التعليق على محتوى الصورة، طرح أسئلة حولها، أو مشاركة معلومات ذات صلة بموضوعها.]";
    }
    
    const response: GenerateContentResponse = await chatSession.sendMessage({ message: messageText });
    return response.text || null;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    // Check for specific error types if needed
    if (error instanceof Error && error.message.includes('API_KEY_INVALID')) {
      return "مفتاح الواجهة البرمجية (API Key) غير صالح. يرجى التحقق منه.";
    }
    return "عذرًا، لم أستطع معالجة طلبك في الوقت الحالي. حاول مرة أخرى بعد قليل.";
  }
};
