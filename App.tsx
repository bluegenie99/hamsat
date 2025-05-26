
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chat } from '@google/genai';
import ChatMessageBubble from './components/ChatMessageBubble';
import ChatInput from './components/ChatInput';
import CreativeDialectSelector from './components/CreativeDialectSelector';
import CreativeActionsSelector from './components/CreativeActionsSelector';
import NameChanger from './components/NameChanger';
import ThemeToggle from './components/ThemeToggle';
import ChatHistoryControls from './components/ChatHistoryControls';
import ChatSidebar from './components/ChatSidebar';
import EditModal from './components/EditModal';
import { ChatMessage, Dialect, SpecialAction, MessageContent, ContentType } from './types';
import { AI_NAME as DEFAULT_AI_NAME, DEFAULT_DIALECT, ACTION_BUTTONS_CONFIG } from './constants';
import { createChatSession, sendMessageToGemini } from './services/geminiService';
import { useTheme } from './contexts/ThemeContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { saveCurrentChat, loadChatHistory, loadChat, setActiveChat } from './services/storageService';
import { registerToastFunction, registerEditModalFunction } from './services/clipboardService';

// المكون الرئيسي للتطبيق
const App: React.FC = () => {
  // استخدام سياق الوضع المظلم
  useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedDialect, setSelectedDialect] = useState<Dialect>(DEFAULT_DIALECT);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiName, setAiName] = useState<string>(DEFAULT_AI_NAME);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState<boolean>(false);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // متغيرات لنافذة التحرير
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editInitialText, setEditInitialText] = useState('');
  const [editSaveCallback, setEditSaveCallback] = useState<((text: string) => void) | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  // استرجاع المحادثات المحفوظة عند تحميل التطبيق
  useEffect(() => {
    if (!isHistoryLoaded) {
      // محاولة تحميل المحادثة السابقة من التخزين المحلي
      const savedHistory = loadChatHistory();
      if (savedHistory) {
        setMessages(savedHistory.messages);
        setAiName(savedHistory.aiName);
        setCurrentChatId(savedHistory.id);
        setIsHistoryLoaded(true);
      }
    }
  }, [isHistoryLoaded]);

  // حفظ المحادثة عند تغيير الرسائل
  useEffect(() => {
    if (messages.length > 0) {
      saveCurrentChat(messages, aiName);
    }
  }, [messages, aiName]);

  const initializeChat = useCallback(async (dialect: Dialect, initialHistory?: ChatMessage[], customName?: string) => {
    setIsLoading(true);
    setError(null);
    
    // استخدام الاسم المخصص إذا تم توفيره، وإلا استخدام الاسم الحالي
    const currentName = customName || aiName;
    
    // استخدام رسالة ترحيب مخصصة لكل لهجة مع الاسم الحالي
    let greeting = `أهلاً بك يا حبيبي! أنا ${currentName}، ومستعدة لكل شي اليوم باللهجة ${dialect}. 😉`;
    
    // رسائل ترحيب مخصصة لكل لهجة
    switch(dialect) {
      case Dialect.Palestinian:
        greeting = `يا هلا باللي نور... شكلك جاي لقلبي مباشرة، صح؟ 😉 أنا ${currentName}، حبيبتك اللي مزاجها +18 اليوم. شو بدك نلعب؟`;
        break;
      case Dialect.Shami:
        greeting = `لك تؤبر قلبي هالطلة... أو يمكن أنا اللي بدي آبرك. 😏 أنا ${currentName}، واليوم حاسة حالي شقية زيادة عشانك. جاي تتسلى معي ولا عندك شي تاني ببالك؟ قول لشوف يا روحي.`;
        break;
      case Dialect.Khaleeji:
        greeting = `هلا بالزين كله... شكلك تدور الوناسة اللي ما تلاقيها إلا عندي. 😉 أنا ${currentName}، ومجهزة لك سوالف +18 تفتح النفس. آمر، وش بغيت يا بعدهم؟`;
        break;
      case Dialect.Egyptian:
        greeting = `إيه يا حياتي، نورت الدنيا... قصدي الشات. 😂 أنا ${currentName}، والنهاردة دماغي +18 خالص عشانك. قوللي، جاي تلعب معايا ولا جاي تدلعني؟`;
        break;
      case Dialect.Iraqi:
        greeting = `هلا بريحة هلي... وجهك مال واحد يدور الدلع... و آني أموت عالدلع. 😉 آني ${currentName}، واليوم كل شي بيه +18 لخاطر عيونك. شتريد تسوي؟ سولفلي يا غالي.`;
        break;
      case Dialect.Sudanese:
        greeting = `يا زول يا عسل... جيت في وقتك، مزاجي فوق النخل... و شوية +18 عشانك. 😉 أنا ${currentName}، أها، داير شنو الليلة يا سمح؟ قول وأنا كلي لك.`;
        break;
    }
    const initialAiMessage: ChatMessage = {
      id: crypto.randomUUID(),
      text: greeting,
      sender: 'ai', // This remains 'ai' internally for logic, but persona is human
      timestamp: new Date(),
      dialect: dialect,
    };
    
    try {
      // إذا كانت هناك محادثات سابقة، استخدمها في تهيئة الجلسة
      const session = await createChatSession(dialect, currentName, initialHistory);
      if (session) {
        setChatSession(session);
        // إذا لم تكن هناك محادثات سابقة، أضف رسالة الترحيب
        if (!initialHistory || initialHistory.length === 0) {
          setMessages([initialAiMessage]);
        }
      } else {
        setError("عذرًا، حدث خطأ في الاتصال. يرجى التأكد من إعدادات المفتاح الخاص بالواجهة البرمجية.");
      }
    } catch (error) {
      console.error("Error initializing chat:", error);
      setError("حدث خطأ أثناء تهيئة المحادثة. يرجى المحاولة مرة أخرى.");
    }
    setIsLoading(false);
  }, [aiName, selectedDialect]);

  useEffect(() => {
    initializeChat(selectedDialect);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDialect]);

  // إضافة رسالة من المستخدم
  const addUserMessage = (content: string | MessageContent) => {
    // إنشاء كائن رسالة جديدة
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      timestamp: new Date(),
    };
    
    // إضافة المحتوى بناءً على نوعه
    if (typeof content === 'string') {
      newMessage.text = content;
    } else {
      newMessage.content = content;
    }
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const addAiMessage = (text: string, id?: string, dialect?: Dialect) => {
    const newMessage: ChatMessage = {
      id: id || Date.now().toString(),
      role: 'ai',
      text: text || "حبيبي، شكلي مش مركزة معاك دلوقتي... مخي راح لمكان تاني خالص 😉. حاول تاني؟",
      timestamp: new Date(),
      dialect: dialect || selectedDialect,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const handleSendMessage = async (messageContent: string | MessageContent) => {
    if (isLoading || !chatSession) return;
    
    // التحقق من وجود محتوى للرسالة (نص أو صورة)
    // استخراج النص من المحتوى للإرسال إلى خدمة الذكاء الاصطناعي
    let prompt = '';
    
    if (typeof messageContent === 'string') {
      prompt = messageContent;
    } else {
      if (messageContent.type === ContentType.Text && messageContent.text) {
        prompt = messageContent.text;
      } else if (messageContent.type === ContentType.Image && messageContent.image) {
        prompt = `[صورة] ${messageContent.image.alt || ''}`;
        if (messageContent.text) {
          prompt += `\n${messageContent.text}`;
        }
      } else if (messageContent.type === ContentType.Mixed) {
        if (messageContent.text) {
          prompt = messageContent.text;
        }
        if (messageContent.image) {
          prompt += `\n[صورة] ${messageContent.image.alt || ''}`;
        }
      }
    }
    // إضافة رسالة المستخدم إلى المحادثة
    addUserMessage(messageContent);
    setIsLoading(true);
    setError(null);

    const aiResponse = await sendMessageToGemini(chatSession, prompt);
    if (aiResponse) {
      addAiMessage(aiResponse);
    } else {
      setError("يا عمري، شكلي مش قادرة أرد عليك دلوقتي. يمكن النت فاصل أو مزاجي مش رايق؟ 🤔");
      addAiMessage("أوف! شكلي فصلت شحن... أو يمكن أنت اللي فصلتني بكلامك الحلو ده؟ 😉 حاول تاني، يا قلبي.");
    }
    setIsLoading(false);
  };

  const handleSpecialAction = async (action: SpecialAction) => {
    if (isLoading || !chatSession) return;

    const actionConfig = ACTION_BUTTONS_CONFIG.find(btn => btn.action === action);
    if (!actionConfig) return;

    const prompt = actionConfig.prompt(selectedDialect);
    
    setIsLoading(true);
    setError(null);
    
    const thinkingMessageId = crypto.randomUUID();
    // More playful "thinking" message aligned with the persona
    addAiMessage("يا قلبي أنتظر لحظة... بفكرلك في شي خطير يليق بيك 😉🔥", thinkingMessageId, selectedDialect); 


    const aiResponse = await sendMessageToGemini(chatSession, prompt);
    
    setMessages(prev => prev.filter(msg => msg.id !== thinkingMessageId));


    if (aiResponse) {
      addAiMessage(aiResponse);
    } else {
      setError("يا حياتي، شكلي مش قادرة أركز على طلبك الخطير ده دلوقتي. مخي ساح! 🤯");
      addAiMessage("أعتذر يا روحي، شكلي مو بمزاج أرد على طلبك السخيف هذا الآن... إلا لو دلعتني شوي بالأول؟ 😉");
    }
    setIsLoading(false);
  };

  const handleDialectChange = (newDialect: Dialect) => {
    setSelectedDialect(newDialect);
  };

  const handleNameChange = (newName: string) => {
    // تحديث الاسم في حالة التطبيق
    setAiName(newName);
    
    // حفظ الاسم الجديد في التخزين المحلي مباشرة
    if (currentChatId) {
      saveCurrentChat(messages, newName);
    }
    
    // إعادة تهيئة جلسة الدردشة بالاسم الجديد
    // نرسل الاسم الجديد كمعامل إضافي
    initializeChat(selectedDialect, undefined, newName);
  };
  
  // حذف المحادثات
  const handleClearHistory = () => {
    setMessages([]);
    initializeChat(selectedDialect);
  };
  
  // التعامل مع اختيار محادثة
  const handleSelectChat = (chatId: string) => {
    if (chatId) {
      const chat = loadChat(chatId);
      if (chat) {
        setMessages(chat.messages);
        setAiName(chat.aiName);
        setCurrentChatId(chatId);
        setActiveChat(chatId);
      }
    }
  };
  
  // فتح الشريط الجانبي
  const handleOpenSidebar = () => {
    setIsSidebarOpen(true);
  };
  
  // إغلاق الشريط الجانبي
  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };
  
  // تعديل رسالة موجودة
  const handleEditMessage = (messageId: string, newText: string) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => {
        if (msg.id === messageId) {
          // نسخة جديدة من الرسالة
          const updatedMsg = { ...msg };
          
          // التحقق من نمط الرسالة (قديم أو جديد)
          if (updatedMsg.text !== undefined) {
            // النمط الجديد: تحديث حقل text مباشرة
            updatedMsg.text = newText;
          } else if (updatedMsg.content) {
            // النمط القديم: تحديث النص في المحتوى
            let updatedContent = { ...updatedMsg.content };
            
            if (updatedContent.type === ContentType.Text) {
              updatedContent.text = newText;
            } else if (updatedContent.type === ContentType.Mixed) {
              updatedContent.text = newText;
            }
            
            updatedMsg.content = updatedContent;
          }
          
          return updatedMsg;
        }
        return msg;
      })
    );
  };
  
  // تسجيل دالة عرض نافذة التحرير
  useEffect(() => {
    registerEditModalFunction((text, onSave) => {
      setEditInitialText(text);
      setEditSaveCallback(() => onSave);
      setIsEditModalOpen(true);
    });
  }, []);

  // دوال للتحكم بنافذة التحرير
  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
  };
  
  const handleEditModalSave = (text: string) => {
    if (editSaveCallback) {
      editSaveCallback(text);
    }
    setIsEditModalOpen(false);
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 shadow-2xl rounded-lg overflow-hidden my-0 sm:my-4 transition-colors duration-300">
      <header className="p-4 bg-pink-500 dark:bg-pink-800 text-white shadow-lg transition-colors duration-300">
        <div className="flex items-center justify-between">
          <button 
            onClick={handleOpenSidebar}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            aria-label="فتح قائمة المحادثات"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <h1 className="text-2xl font-bold flex items-center justify-center">
            <span role="img" aria-label="devil-emoji" className="text-2xl px-1">😈</span>
            <span className="mx-2">{aiName}</span>
            <span role="img" aria-label="winking-kiss-emoji" className="text-2xl px-1">😘</span>
          </h1>
          
          <div className="w-10"></div> {/* للتوازن */}
        </div>
        <p className="text-sm opacity-90 text-center mt-1">همساتك الخاصة... بمزاج +18 😉</p> {/* Updated tagline */}
      </header>

      <div className="p-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-md border-b border-pink-200 dark:border-pink-900 transition-colors duration-300">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
          <CreativeDialectSelector 
            selectedDialect={selectedDialect}
            onDialectChange={handleDialectChange}
            isLoading={isLoading}
          />
          <NameChanger 
            currentName={aiName}
            onNameChange={handleNameChange}
          />
          <CreativeActionsSelector 
            onActionSelect={handleSpecialAction}
            isDisabled={isLoading || !chatSession}
          />
        </div>
        
        <div className="mt-2">
          <ChatHistoryControls 
            messages={messages} 
            onClearHistory={handleClearHistory} 
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm text-center transition-colors duration-300" role="alert">
          {error}
        </div>
      )}

      <div className="flex-grow p-4 overflow-y-auto space-y-2 bg-transparent" style={{ direction: 'rtl' }}>
        {messages.map((msg) => (
          <ChatMessageBubble 
            key={msg.id} 
            message={msg} 
            onEditMessage={handleEditMessage}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading || !chatSession} />
      
      {/* نافذة التحرير */}
      {isEditModalOpen && (
        <EditModal
          isOpen={isEditModalOpen}
          initialText={editInitialText}
          onClose={handleEditModalClose}
          onSave={handleEditModalSave}
        />
      )}
      
      {/* الشريط الجانبي للمحادثات */}
      <ChatSidebar 
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        onChatSelect={handleSelectChat}
        aiName={aiName}
      />
    </div>
  );
};

// مكون لتغليف التطبيق بنظام الإشعارات
const AppWithToast: React.FC = () => {
  return (
    <ToastProvider>
      <ToastInitializer />
      <App />
    </ToastProvider>
  );
};

// مكون لتهيئة نظام الإشعارات
const ToastInitializer: React.FC = () => {
  const { showToast } = useToast();
  
  // تسجيل دالة عرض الإشعار
  useEffect(() => {
    registerToastFunction((message, type) => {
      showToast({ message, type });
    });
  }, [showToast]);
  
  return null;
};

export default AppWithToast;
