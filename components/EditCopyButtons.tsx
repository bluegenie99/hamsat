import React from 'react';
import { copyToClipboard, editText } from '../services/clipboardService';
import { ChatMessage, ContentType } from '../types';

interface EditCopyButtonsProps {
  message: ChatMessage;
  onEdit?: (messageId: string, newText: string) => void;
}

const EditCopyButtons: React.FC<EditCopyButtonsProps> = ({ message, onEdit }) => {
  // التعامل مع الرسائل القديمة التي لا تحتوي على خاصية content
  // @ts-ignore - نتجاهل خطأ TypeScript لأننا نتحقق من وجود الخاصية
  const hasLegacyFormat = message.text !== undefined && message.content === undefined;
  const handleCopy = async () => {
    // الحصول على النص من محتوى الرسالة حسب نوعها
    let textToCopy = '';
    
    // التعامل مع الرسائل القديمة
    if (hasLegacyFormat) {
      // @ts-ignore - نتجاهل خطأ TypeScript لأننا نتحقق من وجود الخاصية
      textToCopy = message.text || '';
    }
    // التعامل مع الرسائل الجديدة
    else if (message.content?.type === ContentType.Text && message.content.text) {
      textToCopy = message.content.text;
    } else if (message.content?.type === ContentType.Mixed && message.content.text) {
      textToCopy = message.content.text;
    } else if (message.content?.type === ContentType.Image && message.content.image?.alt) {
      textToCopy = `[صورة: ${message.content.image.alt}]`;
    }
    
    // استخدام خدمة النسخ التي ستقوم بعرض الإشعار المناسب
    await copyToClipboard(textToCopy);
  };

  const handleEdit = () => {
    // التحقق من صلاحية التعديل - يمكن تعديل رسائل المستخدم فقط
    const isUserMessage = message.sender === 'user' || message.role === 'user';
    if (!onEdit || !isUserMessage) return;
    
    // الحصول على النص الحالي للتعديل
    let currentText = '';
    
    // التعامل مع الرسائل بالنمط الجديد
    if (message.text !== undefined) {
      currentText = message.text;
    } 
    // التعامل مع الرسائل بالنمط القديم
    else if (message.content) {
      // لا يمكن تعديل الرسائل التي تحتوي على صور فقط
      if (message.content.type === ContentType.Image && !message.content.text) {
        return;
      }
      
      currentText = message.content.text || '';
    }
    
    // استخدام دالة التعديل من خدمة الحافظة
    // ستقوم هذه الدالة بفتح نافذة التحرير الجديدة وتمرير النص المعدل لدالة onEdit
    editText(currentText, (editedText) => {
      onEdit(message.id, editedText);
    });
  };

  return (
    <div className="flex space-x-2 rtl:space-x-reverse opacity-70 hover:opacity-100 transition-opacity">
      <button
        onClick={handleCopy}
        className="text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded px-2 py-1 transition-colors duration-200"
        title="نسخ المحتوى"
        disabled={hasLegacyFormat ? false : (message.content?.type === ContentType.Image && !message.content.image?.alt)}
      >
        <span role="img" aria-label="نسخ">📋</span>
      </button>
      
      {message.sender === 'user' && onEdit && (hasLegacyFormat || message.content?.type !== ContentType.Image) && (
        <button
          onClick={handleEdit}
          className="text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded px-2 py-1 transition-colors duration-200"
          title="تعديل الرسالة"
        >
          <span role="img" aria-label="تعديل">✏️</span>
        </button>
      )}
    </div>
  );
};

export default EditCopyButtons;
