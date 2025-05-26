import React from 'react';
import { ChatMessage } from '../types';
import { clearChatHistory } from '../services/storageService';

interface ChatHistoryControlsProps {
  messages: ChatMessage[];
  onClearHistory: () => void;
}

const ChatHistoryControls: React.FC<ChatHistoryControlsProps> = ({ messages, onClearHistory }) => {
  // التحقق من وجود محادثات
  const hasMessages = messages.length > 0;
  
  // حذف المحادثات
  const handleClearHistory = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف جميع المحادثات؟')) {
      clearChatHistory();
      onClearHistory();
    }
  };
  
  // مشاركة المحادثات
  const handleShareHistory = () => {
    // تحويل المحادثات إلى نص قابل للمشاركة
    const shareText = messages.map(msg => {
      const sender = msg.sender === 'user' ? 'أنت' : 'همسات';
      const time = msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `${sender} (${time}):\n${msg.text}\n`;
    }).join('\n');
    
    // نسخ النص إلى الحافظة
    navigator.clipboard.writeText(shareText)
      .then(() => {
        alert('تم نسخ المحادثة إلى الحافظة! يمكنك الآن لصقها في أي مكان ترغب به.');
      })
      .catch(err => {
        console.error('فشل في نسخ المحادثة:', err);
        alert('حدث خطأ أثناء محاولة نسخ المحادثة.');
      });
  };
  
  return (
    <div className="flex gap-2 justify-center">
      <button
        onClick={handleClearHistory}
        disabled={!hasMessages}
        className={`
          p-2 rounded-lg text-sm flex items-center gap-1
          transition-all duration-200 ease-in-out
          ${hasMessages 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'}
        `}
        title="حذف المحادثة"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span>حذف المحادثة</span>
      </button>
      
      <button
        onClick={handleShareHistory}
        disabled={!hasMessages}
        className={`
          p-2 rounded-lg text-sm flex items-center gap-1
          transition-all duration-200 ease-in-out
          ${hasMessages 
            ? 'bg-blue-500 hover:bg-blue-600 text-white' 
            : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'}
        `}
        title="مشاركة المحادثة"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span>مشاركة المحادثة</span>
      </button>
    </div>
  );
};

export default ChatHistoryControls;
