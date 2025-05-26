import React, { useState, useRef } from 'react';
import { ImageContent } from '../types';

interface ImageUploaderProps {
  onImageSelected: (imageContent: ImageContent) => void;
  disabled?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, disabled = false }) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح');
      return;
    }

    // التحقق من حجم الملف (5 ميجابايت كحد أقصى)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('حجم الصورة كبير جدًا. الحد الأقصى هو 5 ميجابايت');
      return;
    }

    setIsUploading(true);

    // قراءة الملف كـ Data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      
      // إنشاء عنصر صورة لقياس الأبعاد
      const img = new Image();
      img.onload = () => {
        const imageContent: ImageContent = {
          url: dataUrl,
          alt: file.name,
          width: img.width,
          height: img.height
        };
        
        onImageSelected(imageContent);
        setIsUploading(false);
        
        // إعادة تعيين حقل الملف
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      
      img.src = dataUrl;
    };
    
    reader.onerror = () => {
      alert('حدث خطأ أثناء قراءة الملف');
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isUploading}
        className={`p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        title="إرفاق صورة"
      >
        {isUploading ? (
          <div className="w-5 h-5 border-2 border-t-transparent border-pink-500 rounded-full animate-spin"></div>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  );
};

export default ImageUploader;
