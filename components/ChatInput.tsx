
import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import ImageUploader from './ImageUploader';
import ImageEditorNew from './ImageEditorNew';
import { ContentType, ImageContent, MessageContent } from '../types';

interface ChatInputProps {
  onSendMessage: (content: MessageContent) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  // استدعاء useTheme للتأكد من أن المكون يستجيب للتغييرات في الوضع المظلم
  useTheme();
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<ImageContent | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من وجود نص أو صورة للإرسال
    const hasText = input.trim().length > 0;
    const hasImage = selectedImage !== null;
    
    if ((hasText || hasImage) && !isLoading) {
      // إنشاء محتوى الرسالة حسب ما هو متوفر
      let messageContent: MessageContent;
      
      if (hasText && hasImage) {
        // رسالة تحتوي على نص وصورة
        messageContent = {
          type: ContentType.Mixed,
          text: input.trim(),
          image: selectedImage
        };
      } else if (hasImage) {
        // رسالة تحتوي على صورة فقط
        messageContent = {
          type: ContentType.Image,
          image: selectedImage
        };
      } else {
        // رسالة تحتوي على نص فقط
        messageContent = {
          type: ContentType.Text,
          text: input.trim()
        };
      }
      
      // إرسال الرسالة
      onSendMessage(messageContent);
      
      // إعادة تعيين الحقول
      setInput('');
      setSelectedImage(null);
    }
  };
  
  // معالج اختيار الصورة
  const handleImageSelected = (imageContent: ImageContent) => {
    // عند اختيار صورة، نفتح محرر الصور مباشرة
    setSelectedImage(imageContent);
    setIsEditing(true);
  };
  
  // معالج حفظ الصورة بعد التعديل
  const handleImageSave = (editedImage: ImageContent) => {
    setSelectedImage(editedImage);
    setIsEditing(false);
  };
  
  // معالج إلغاء تعديل الصورة
  const handleEditCancel = () => {
    setIsEditing(false);
  };
  
  // معالج فتح محرر الصور
  const handleEditImage = () => {
    if (selectedImage) {
      setIsEditing(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="input-container p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg transition-colors duration-300">
      <div className="flex flex-col space-y-2">
        {/* عرض الصورة المختارة إذا وجدت */}
        {selectedImage && (
          <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg p-2 mx-auto">
            <div className="flex flex-col">
              <img 
                src={selectedImage.url} 
                alt={selectedImage.alt || 'صورة مرفقة'} 
                className="max-h-32 rounded-lg mx-auto"
              />
              
              {/* عرض وصف الصورة إذا وجد */}
              {selectedImage.alt && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  <strong>الوصف:</strong> {selectedImage.alt}
                </div>
              )}
            </div>
            
            <div className="absolute top-1 right-1 flex space-x-1 rtl:space-x-reverse">
              {/* زر تعديل الصورة */}
              <button
                type="button"
                onClick={handleEditImage}
                className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 transition-colors"
                title="تعديل الصورة"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              
              {/* زر إزالة الصورة */}
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                title="إزالة الصورة"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* محرر الصور */}
        {isEditing && selectedImage && (
          <ImageEditorNew 
            image={selectedImage}
            onSave={handleImageSave}
            onCancel={handleEditCancel}
          />
        )}
        
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اكتب رسالتك هنا..."
          className="input-box flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none transition-all duration-300 placeholder-pink-400 dark:placeholder-pink-300 text-pink-700 dark:text-pink-300 bg-white dark:bg-gray-700 font-medium"
          disabled={isLoading}
          dir="rtl"
        />
        <ImageUploader 
          onImageSelected={handleImageSelected} 
          disabled={isLoading} 
        />
        
        <button
          type="submit"
          className={`send-button p-3 rounded-full text-white transition-colors duration-200 ease-in-out
            ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-pink-500 hover:bg-pink-600 focus:ring-2 focus:ring-pink-400 focus:ring-offset-2'}`}
          disabled={isLoading || (!input.trim() && !selectedImage)}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          )}
        </button>
        </div>
      </div>
    </form>
  );
};

export default ChatInput;
    