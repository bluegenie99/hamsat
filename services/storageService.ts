import { ChatMessage, ContentType } from '../types';

// مفاتيح التخزين
const CHATS_LIST_KEY = 'hamsat-chats-list';
const CHAT_PREFIX = 'hamsat-chat-';
const ACTIVE_CHAT_KEY = 'hamsat-active-chat';
const IMAGE_STORAGE_KEY = 'hamsat-image-storage';

// حد أقصى لحجم التخزين المحلي (بالبايت) - 5 ميجابايت
const MAX_STORAGE_SIZE = 5 * 1024 * 1024;

/**
 * واجهة لتخزين معلومات المحادثة
 */
export interface ChatInfo {
  id: string;           // معرف المحادثة
  title: string;        // عنوان المحادثة
  aiName: string;       // اسم الذكاء الاصطناعي في هذه المحادثة
  lastUpdated: number;  // طابع زمني لآخر تحديث
  previewText: string;  // نص معاينة (آخر رسالة)
}

/**
 * واجهة لتخزين محتوى المحادثة
 */
export interface ChatStorage {
  id: string;           // معرف المحادثة
  messages: ChatMessage[];
  aiName: string;
  lastUpdated: number;  // طابع زمني
}

/**
 * إنشاء محادثة جديدة
 * @param title عنوان المحادثة
 * @param aiName اسم الذكاء الاصطناعي
 * @returns معرف المحادثة الجديدة
 */
export const createNewChat = (title: string, aiName: string): string => {
  try {
    // إنشاء معرف فريد للمحادثة
    const chatId = `chat_${Date.now()}`;
    
    // إنشاء معلومات المحادثة
    const chatInfo: ChatInfo = {
      id: chatId,
      title,
      aiName,
      lastUpdated: Date.now(),
      previewText: 'محادثة جديدة'
    };
    
    // إنشاء محتوى المحادثة
    const chatStorage: ChatStorage = {
      id: chatId,
      messages: [],
      aiName,
      lastUpdated: Date.now()
    };
    
    // حفظ محتوى المحادثة
    localStorage.setItem(`${CHAT_PREFIX}${chatId}`, JSON.stringify(chatStorage));
    
    // إضافة المحادثة إلى قائمة المحادثات
    const chatsList = getChatsList();
    chatsList.push(chatInfo);
    localStorage.setItem(CHATS_LIST_KEY, JSON.stringify(chatsList));
    
    // تعيين المحادثة الجديدة كمحادثة نشطة
    setActiveChat(chatId);
    
    return chatId;
  } catch (error) {
    console.error('خطأ في إنشاء محادثة جديدة:', error);
    return '';
  }
};

/**
 * حفظ محادثة في التخزين المحلي
 * @param chatId معرف المحادثة
 * @param messages رسائل المحادثة
 * @param aiName اسم الذكاء الاصطناعي
 * @returns نجاح أو فشل العملية
 */
export const saveChatHistory = (chatId: string, messages: ChatMessage[], aiName: string): boolean => {
  try {
    if (!chatId || !messages.length) return false;
    
    // الحصول على آخر رسالة للمعاينة
    const lastMessage = messages[messages.length - 1];
    let previewText = '';
    
    // استخراج نص المعاينة من الرسالة الأخيرة
    if (lastMessage.text) {
      previewText = lastMessage.text.substring(0, 50) + (lastMessage.text.length > 50 ? '...' : '');
    } else if (lastMessage.content?.text) {
      previewText = lastMessage.content.text.substring(0, 50) + (lastMessage.content.text.length > 50 ? '...' : '');
    } else if (lastMessage.content?.type === ContentType.Image) {
      previewText = '[صورة]';
    }
    
    // تحديث محتوى المحادثة
    const timestamp = Date.now();
    const chatStorage: ChatStorage = {
      id: chatId,
      messages,
      aiName,
      lastUpdated: timestamp
    };
    
    localStorage.setItem(`${CHAT_PREFIX}${chatId}`, JSON.stringify(chatStorage));
    
    // تحديث معلومات المحادثة في قائمة المحادثات
    const chatsList = getChatsList();
    const chatIndex = chatsList.findIndex(chat => chat.id === chatId);
    
    if (chatIndex !== -1) {
      chatsList[chatIndex] = {
        ...chatsList[chatIndex],
        aiName,
        lastUpdated: timestamp,
        previewText
      };
      
      localStorage.setItem(CHATS_LIST_KEY, JSON.stringify(chatsList));
    }
    
    return true;
  } catch (error) {
    console.error('Error saving chat history:', error);
    return false;
  }
};

/**
 * حفظ المحادثة الحالية (للتوافق مع النسخة القديمة)
 * @param messages رسائل المحادثة
 * @param aiName اسم الذكاء الاصطناعي
 */
export const saveCurrentChat = (messages: ChatMessage[], aiName: string): void => {
  const activeChatId = getActiveChat();
  
  if (activeChatId) {
    saveChatHistory(activeChatId, messages, aiName);
  } else if (messages.length > 0) {
    // إنشاء محادثة جديدة إذا لم تكن هناك محادثة نشطة
    const chatId = createNewChat('محادثة جديدة', aiName);
    saveChatHistory(chatId, messages, aiName);
  }
};

/**
 * الحصول على قائمة المحادثات
 * @returns قائمة معلومات المحادثات
 */
export const getChatsList = (): ChatInfo[] => {
  try {
    const storedData = localStorage.getItem(CHATS_LIST_KEY);
    if (!storedData) return [];
    
    return JSON.parse(storedData) as ChatInfo[];
  } catch (error) {
    console.error('خطأ في الحصول على قائمة المحادثات:', error);
    return [];
  }
};

/**
 * الحصول على معرف المحادثة النشطة
 * @returns معرف المحادثة النشطة أو فارغ إذا لم تكن هناك محادثة نشطة
 */
export const getActiveChat = (): string => {
  try {
    return localStorage.getItem(ACTIVE_CHAT_KEY) || '';
  } catch (error) {
    console.error('خطأ في الحصول على المحادثة النشطة:', error);
    return '';
  }
};

/**
 * تعيين محادثة نشطة
 * @param chatId معرف المحادثة
 */
export const setActiveChat = (chatId: string): void => {
  try {
    localStorage.setItem(ACTIVE_CHAT_KEY, chatId);
  } catch (error) {
    console.error('خطأ في تعيين المحادثة النشطة:', error);
  }
};

/**
 * تحميل محادثة محددة
 * @param chatId معرف المحادثة
 * @returns محتوى المحادثة أو null في حالة عدم وجودها
 */
export const loadChat = (chatId: string): ChatStorage | null => {
  try {
    const storedData = localStorage.getItem(`${CHAT_PREFIX}${chatId}`);
    if (!storedData) return null;
    
    const parsedData = JSON.parse(storedData) as ChatStorage;
    
    // تحويل التواريخ إلى كائنات Date
    const messagesWithDates = parsedData.messages.map(msg => {
      // تحويل التاريخ إلى كائن Date إذا كان نصًا
      if (typeof msg.timestamp === 'string') {
        return {
          ...msg,
          timestamp: new Date(msg.timestamp)
        };
      }
      return msg;
    });
    
    return {
      ...parsedData,
      messages: messagesWithDates
    };
  } catch (error) {
    console.error('خطأ في تحميل المحادثة:', error);
    return null;
  }
};

/**
 * تحميل المحادثة النشطة
 * @returns محتوى المحادثة النشطة أو null في حالة عدم وجودها
 */
export const loadActiveChat = (): ChatStorage | null => {
  const activeChatId = getActiveChat();
  if (!activeChatId) return null;
  
  return loadChat(activeChatId);
};

/**
 * تحميل المحادثة (للتوافق مع النسخة القديمة)
 * @returns محتوى المحادثة أو null في حالة عدم وجودها
 */
export const loadChatHistory = (): ChatStorage | null => {
  // محاولة تحميل المحادثة النشطة أولاً
  const activeChat = loadActiveChat();
  if (activeChat) return activeChat;
  
  // إذا لم تكن هناك محادثة نشطة، نحاول تحميل أول محادثة في القائمة
  const chatsList = getChatsList();
  if (chatsList.length > 0) {
    // ترتيب المحادثات حسب آخر تحديث
    chatsList.sort((a, b) => b.lastUpdated - a.lastUpdated);
    const latestChat = loadChat(chatsList[0].id);
    
    if (latestChat) {
      // تعيين المحادثة كنشطة
      setActiveChat(chatsList[0].id);
      return latestChat;
    }
  }
  
  // إذا لم نجد أي محادثة، نعيد null
  return null;
};

/**
 * حذف محادثة محددة
 * @param chatId معرف المحادثة
 * @returns نجاح أو فشل العملية
 */
export const deleteChat = (chatId: string): boolean => {
  try {
    // حذف محتوى المحادثة
    localStorage.removeItem(`${CHAT_PREFIX}${chatId}`);
    
    // حذف المحادثة من قائمة المحادثات
    const chatsList = getChatsList();
    const updatedList = chatsList.filter(chat => chat.id !== chatId);
    localStorage.setItem(CHATS_LIST_KEY, JSON.stringify(updatedList));
    
    // إذا كانت المحادثة المحذوفة هي النشطة، نقوم بتعيين محادثة أخرى كنشطة
    const activeChat = getActiveChat();
    if (activeChat === chatId && updatedList.length > 0) {
      setActiveChat(updatedList[0].id);
    } else if (activeChat === chatId) {
      localStorage.removeItem(ACTIVE_CHAT_KEY);
    }
    
    return true;
  } catch (error) {
    console.error('خطأ في حذف المحادثة:', error);
    return false;
  }
};

/**
 * حذف جميع المحادثات
 */
export const clearChatHistory = (): void => {
  try {
    // الحصول على قائمة المحادثات
    const chatsList = getChatsList();
    
    // حذف كل محادثة
    chatsList.forEach(chat => {
      localStorage.removeItem(`${CHAT_PREFIX}${chat.id}`);
    });
    
    // حذف قائمة المحادثات والمحادثة النشطة
    localStorage.removeItem(CHATS_LIST_KEY);
    localStorage.removeItem(ACTIVE_CHAT_KEY);
    
    // حذف الصور المرتبطة بالمحادثات
    clearAllImages();
  } catch (error) {
    console.error('خطأ في حذف جميع المحادثات:', error);
  }
};

/**
 * التحقق من وجود محادثات محفوظة
 */
export const hasChatHistory = (): boolean => {
  return getChatsList().length > 0;
};

/**
 * تصدير محادثة إلى ملف JSON
 * @param chatId معرف المحادثة
 * @returns سلسلة JSON للمحادثة
 */
export const exportChat = (chatId: string): string => {
  try {
    const chat = loadChat(chatId);
    if (!chat) return '';
    
    return JSON.stringify(chat, null, 2);
  } catch (error) {
    console.error('خطأ في تصدير المحادثة:', error);
    return '';
  }
};

/**
 * استيراد محادثة من ملف JSON
 * @param jsonData بيانات JSON للمحادثة
 * @returns معرف المحادثة الجديدة أو فارغ في حالة الفشل
 */
export const importChat = (jsonData: string): string => {
  try {
    const chatData = JSON.parse(jsonData) as ChatStorage;
    
    // التحقق من صحة البيانات
    if (!chatData.id || !chatData.messages || !chatData.aiName) {
      throw new Error('بيانات المحادثة غير صالحة');
    }
    
    // إنشاء معرف جديد للمحادثة المستوردة
    const newChatId = `chat_${Date.now()}`;
    
    // إنشاء معلومات المحادثة
    const lastMessage = chatData.messages[chatData.messages.length - 1];
    let previewText = '';
    
    if (lastMessage) {
      if (lastMessage.text) {
        previewText = lastMessage.text.substring(0, 50) + (lastMessage.text.length > 50 ? '...' : '');
      } else if (lastMessage.content?.text) {
        previewText = lastMessage.content.text.substring(0, 50) + (lastMessage.content.text.length > 50 ? '...' : '');
      } else if (lastMessage.content?.type === ContentType.Image) {
        previewText = '[صورة]';
      }
    }
    
    const chatInfo: ChatInfo = {
      id: newChatId,
      title: `محادثة مستوردة (${new Date().toLocaleDateString()})`,
      aiName: chatData.aiName,
      lastUpdated: Date.now(),
      previewText: previewText || 'محادثة مستوردة'
    };
    
    // إنشاء محتوى المحادثة
    const chatStorage: ChatStorage = {
      id: newChatId,
      messages: chatData.messages,
      aiName: chatData.aiName,
      lastUpdated: Date.now()
    };
    
    // حفظ محتوى المحادثة
    localStorage.setItem(`${CHAT_PREFIX}${newChatId}`, JSON.stringify(chatStorage));
    
    // إضافة المحادثة إلى قائمة المحادثات
    const chatsList = getChatsList();
    chatsList.push(chatInfo);
    localStorage.setItem(CHATS_LIST_KEY, JSON.stringify(chatsList));
    
    return newChatId;
  } catch (error) {
    console.error('خطأ في استيراد المحادثة:', error);
    return '';
  }
};

/**
 * تخزين صورة في التخزين المحلي
 * @param imageId معرف الصورة
 * @param imageData بيانات الصورة بتنسيق Data URL
 * @returns نجاح أو فشل العملية
 */
export const saveImage = (imageId: string, imageData: string): boolean => {
  try {
    // التحقق من حجم الصورة
    if (imageData.length > MAX_STORAGE_SIZE) {
      console.error('حجم الصورة كبير جدًا');
      return false;
    }
    
    // الحصول على الصور المخزنة الحالية
    const storedImagesStr = localStorage.getItem(IMAGE_STORAGE_KEY) || '{}';
    const storedImages = JSON.parse(storedImagesStr) as Record<string, string>;
    
    // تخزين الصورة الجديدة
    storedImages[imageId] = imageData;
    
    // حفظ الصور المحدثة
    localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(storedImages));
    return true;
  } catch (error) {
    console.error('خطأ في حفظ الصورة:', error);
    return false;
  }
};

/**
 * استرجاع صورة من التخزين المحلي
 * @param imageId معرف الصورة
 * @returns بيانات الصورة أو null في حالة عدم وجودها
 */
export const loadImage = (imageId: string): string | null => {
  try {
    const storedImagesStr = localStorage.getItem(IMAGE_STORAGE_KEY) || '{}';
    const storedImages = JSON.parse(storedImagesStr) as Record<string, string>;
    
    return storedImages[imageId] || null;
  } catch (error) {
    console.error('خطأ في استرجاع الصورة:', error);
    return null;
  }
};

/**
 * حذف صورة من التخزين المحلي
 * @param imageId معرف الصورة
 */
export const deleteImage = (imageId: string): void => {
  try {
    const storedImagesStr = localStorage.getItem(IMAGE_STORAGE_KEY) || '{}';
    const storedImages = JSON.parse(storedImagesStr) as Record<string, string>;
    
    if (storedImages[imageId]) {
      delete storedImages[imageId];
      localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(storedImages));
    }
  } catch (error) {
    console.error('خطأ في حذف الصورة:', error);
  }
};

/**
 * حذف جميع الصور من التخزين المحلي
 */
export const clearAllImages = (): void => {
  try {
    localStorage.removeItem(IMAGE_STORAGE_KEY);
  } catch (error) {
    console.error('خطأ في حذف جميع الصور:', error);
  }
};
