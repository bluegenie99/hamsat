import React, { useState } from 'react';
import { speakText, stopSpeaking, isSpeechSupported } from '../services/speechService';
import { useSpeech } from '../contexts/SpeechContext';

interface SpeechButtonProps {
  text: string;
}

const SpeechButton: React.FC<SpeechButtonProps> = ({ text }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSupported = isSpeechSupported();
  const { settings } = useSpeech();
  
  if (!speechSupported) {
    return null; // لا تعرض الزر إذا كان تحويل النص إلى كلام غير مدعوم
  }
  
  const handleSpeech = async () => {
    if (isSpeaking) {
      // إيقاف الكلام إذا كان يتحدث بالفعل
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      // بدء الكلام
      setIsSpeaking(true);
      try {
        await speakText(text, settings.rate, settings.pitch);
        // تم الانتهاء من الكلام بنجاح
        setIsSpeaking(false);
      } catch (error) {
        console.error('خطأ في تشغيل الصوت:', error);
        setIsSpeaking(false);
      }
    }
  };
  
  return (
    <button
      onClick={handleSpeech}
      className={`
        p-1.5 rounded-full
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-pink-400
        transform hover:scale-105
        ${isSpeaking 
          ? 'bg-pink-600 text-white' 
          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-pink-100 dark:hover:bg-pink-900'}
      `}
      title={isSpeaking ? 'إيقاف الصوت' : 'تشغيل الصوت'}
      aria-label={isSpeaking ? 'إيقاف الصوت' : 'تشغيل الصوت'}
    >
      {isSpeaking ? (
        // أيقونة إيقاف الصوت
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
        </svg>
      ) : (
        // أيقونة تشغيل الصوت
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      )}
    </button>
  );
};

export default SpeechButton;
