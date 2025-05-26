import React, { useState, useEffect } from 'react';

interface EditModalProps {
  initialText: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
}

const EditModal: React.FC<EditModalProps> = ({ initialText, isOpen, onClose, onSave }) => {
  const [text, setText] = useState(initialText);
  
  // تحديث النص عند تغيير النص الأولي
  useEffect(() => {
    setText(initialText);
  }, [initialText]);
  
  // إغلاق النافذة عند الضغط على Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  const handleSave = () => {
    onSave(text);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm transition-all duration-300 ease-in-out">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden w-full max-w-md animate-fadeIn">
        <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white flex justify-between items-center">
          <h3 className="text-lg font-semibold">تعديل الرسالة</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-white/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none transition-all duration-300 placeholder-gray-400 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 resize-none"
            placeholder="اكتب رسالتك هنا..."
            dir="rtl"
            autoFocus
          />
        </div>
        
        <div className="p-3 bg-gray-100 dark:bg-gray-700 flex justify-end space-x-2 rtl:space-x-reverse">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
            disabled={!text.trim()}
          >
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
