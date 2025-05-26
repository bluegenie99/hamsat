
import React from 'react';
import { ChatMessage, ContentType } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import EditCopyButtons from './EditCopyButtons';
import MessageImage from './MessageImage';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  onEditMessage?: (messageId: string, newText: string) => void;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message, onEditMessage }) => {
  // استدعاء useTheme للتأكد من أن المكون يستجيب للتغييرات في الوضع المظلم
  useTheme();
  const isUser = message.sender === 'user';
  
  // التعامل مع الرسائل القديمة التي لا تحتوي على خاصية content
  // @ts-ignore - نتجاهل خطأ TypeScript لأننا نتحقق من وجود الخاصية
  const hasLegacyFormat = message.text !== undefined && message.content === undefined;

  return (
    <div className={`flex mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`message-bubble max-w-xs lg:max-w-md px-4 py-3 rounded-xl shadow-md transition-colors duration-300 ${
          isUser
            ? 'user-message bg-pink-500 dark:bg-pink-700 text-white rounded-br-none'
            : 'ai-message bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none'
        }`}
      >
        {/* عرض الرسائل بالتنسيق القديم */}
        {hasLegacyFormat && (
          // @ts-ignore - نتجاهل خطأ TypeScript لأننا نتحقق من وجود الخاصية
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        )}
        
        {/* عرض الرسائل بالتنسيق الجديد */}
        {!hasLegacyFormat && message.content?.type === ContentType.Text && (
          <p className="text-sm whitespace-pre-wrap">{message.content.text}</p>
        )}
        
        {!hasLegacyFormat && message.content?.type === ContentType.Image && message.content.image && (
          <MessageImage image={message.content.image} className="my-2" />
        )}
        
        {!hasLegacyFormat && message.content?.type === ContentType.Mixed && (
          <>
            {message.content.image && (
              <MessageImage image={message.content.image} className="mb-2" />
            )}
            {message.content.text && (
              <p className="text-sm whitespace-pre-wrap">{message.content.text}</p>
            )}
          </>
        )}
        <div className="flex items-center justify-between mt-1">
          <p className={`text-xs ${isUser ? 'text-pink-200 text-right' : 'text-gray-400 dark:text-gray-500 text-left'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <EditCopyButtons message={message} onEdit={onEditMessage} />
        </div>
      </div>
    </div>
  );
};

export default ChatMessageBubble;
    