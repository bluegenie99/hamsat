
import React from 'react';
import { ChatMessage } from '../types';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl shadow-md ${
          isUser
            ? 'bg-pink-500 text-white rounded-br-none'
            : 'bg-white text-gray-800 rounded-bl-none'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        <p className={`text-xs mt-1 ${isUser ? 'text-pink-200 text-right' : 'text-gray-400 text-left'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

export default ChatMessageBubble;
    