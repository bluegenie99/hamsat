
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chat } from '@google/genai';
import ChatMessageBubble from './components/ChatMessageBubble';
import ChatInput from './components/ChatInput';
import ActionButton from './components/ActionButton';
// import DialectSelector from './components/DialectSelector'; // Removed
import { ChatMessage, Dialect, SpecialAction, DIALECT_OPTIONS } from './types';
import { AI_NAME, DEFAULT_DIALECT, ACTION_BUTTONS_CONFIG, GREETING_MESSAGE } from './constants';
import { createChatSession, sendMessageToGemini } from './services/geminiService';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentInput, setCurrentInput] = useState<string>('');
  const [selectedDialect, setSelectedDialect] = useState<Dialect>(DEFAULT_DIALECT);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const initializeChat = useCallback(async (dialect: Dialect) => {
    setIsLoading(true);
    setError(null);
    const greeting = GREETING_MESSAGE[dialect] || `أهلاً بك يا حبيبي! أنا ${AI_NAME}، ومستعدة لكل شي اليوم باللهجة ${dialect}. 😉`;
    const initialAiMessage: ChatMessage = {
      id: crypto.randomUUID(),
      text: greeting,
      sender: 'ai', // This remains 'ai' internally for logic, but persona is human
      timestamp: new Date(),
      dialect: dialect,
    };
    
    setMessages([initialAiMessage]);
    // Pass an empty history initially for the AI to establish its persona based on system instruction
    const session = await createChatSession(dialect, []); 
    setChatSession(session);
    if (!session) {
      setError("فشل في تهيئة جلسة المحادثة. قلبي حاسس إن في مشكلة بالنت أو يمكن مفتاح الـAPI زعلان مننا. 😟");
    }
    setIsLoading(false);
  }, []); 

  useEffect(() => {
    initializeChat(selectedDialect);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDialect]);

  const addUserMessage = (text: string) => {
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    return newMessage;
  };

  const addAiMessage = (text: string, id?: string, dialect?: Dialect) => {
    const newMessage: ChatMessage = {
      id: id || crypto.randomUUID(),
      text: text || "حبيبي، شكلي مش مركزة معاك دلوقتي... مخي راح لمكان تاني خالص 😉. حاول تاني؟",
      sender: 'ai', // This remains 'ai' internally for logic
      timestamp: new Date(),
      dialect: dialect || selectedDialect,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading || !chatSession) return;

    addUserMessage(messageText);
    setIsLoading(true);
    setError(null);

    const aiResponse = await sendMessageToGemini(chatSession, messageText);
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
  
  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-200 shadow-2xl rounded-lg overflow-hidden my-0 sm:my-4">
      <header className="p-4 bg-pink-500 text-white text-center shadow-lg">
        <h1 className="text-2xl font-bold flex items-center justify-center">
          <span role="img" aria-label="devil-emoji" className="text-2xl px-1">😈</span>
          <span className="mx-2">{AI_NAME}</span> {/* AI_NAME is now "همسات" */}
          <span role="img" aria-label="winking-kiss-emoji" className="text-2xl px-1">😘</span>
        </h1>
        <p className="text-sm opacity-90">همساتك الخاصة... بمزاج +18 😉</p> {/* Updated tagline */}
      </header>

      <div className="p-3 bg-white/70 backdrop-blur-sm shadow-md border-b border-pink-200">
        <p className="block text-sm font-medium text-gray-700 mb-2 text-right">
            اختر لهجتي (عشان أدلعك صح بجرأة +18 😉):
        </p>
        <div className="flex flex-wrap justify-center items-center gap-2">
            {DIALECT_OPTIONS.map((option) => (
            <button
                key={option.value}
                onClick={() => handleDialectChange(option.value)}
                disabled={isLoading}
                className={`
                px-3 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm rounded-lg
                transition-all duration-150 ease-in-out
                border
                focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-1
                ${selectedDialect === option.value
                    ? 'bg-pink-500 text-white border-pink-600 shadow-md'
                    : 'bg-white text-pink-600 border-pink-300 hover:bg-pink-50 hover:border-pink-400'
                }
                disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300
                `}
            >
                {option.label}
            </button>
            ))}
        </div>
      </div>
      
      <div className="p-2 bg-white/60 backdrop-blur-sm border-b border-pink-200">
        <div className="flex flex-wrap justify-center sm:justify-start rtl:space-x-reverse">
          {ACTION_BUTTONS_CONFIG.map(btnConfig => (
            <ActionButton
              key={btnConfig.action}
              label={btnConfig.label}
              onClick={() => handleSpecialAction(btnConfig.action)}
              disabled={isLoading || !chatSession}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 text-sm text-center" role="alert">
          {error}
        </div>
      )}

      <div className="flex-grow p-4 overflow-y-auto space-y-2 bg-transparent" style={{ direction: 'rtl' }}>
        {messages.map((msg) => (
          <ChatMessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading || !chatSession} />
    </div>
  );
};

export default App;
