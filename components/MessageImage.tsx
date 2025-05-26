import React, { useState } from 'react';
import { ImageContent } from '../types';

interface MessageImageProps {
  image: ImageContent;
  className?: string;
}

const MessageImage: React.FC<MessageImageProps> = ({ image, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  // حساب النسبة المئوية للعرض والارتفاع
  const aspectRatio = image.width && image.height 
    ? (image.width / image.height) 
    : 1.5; // نسبة افتراضية إذا لم تكن الأبعاد متوفرة

  // تحديد الحد الأقصى للعرض والارتفاع في المحادثة
  const maxWidth = 250;
  const maxHeight = 200;

  // حساب الأبعاد المناسبة
  let width = maxWidth;
  let height = width / aspectRatio;
  
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  const handleImageClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleImageError = () => {
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className={`bg-gray-200 dark:bg-gray-700 rounded-lg p-2 text-center text-sm text-gray-500 dark:text-gray-400 ${className}`}>
        تعذر تحميل الصورة
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="w-8 h-8 border-4 border-t-transparent border-pink-500 rounded-full animate-spin"></div>
        </div>
      )}
      
      <img
        src={image.url}
        alt={image.alt || 'صورة في المحادثة'}
        style={{ width: isExpanded ? 'auto' : width, height: isExpanded ? 'auto' : height, maxHeight: isExpanded ? '80vh' : height }}
        className={`message-image rounded-lg cursor-pointer transition-all duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${isExpanded ? 'max-w-full' : ''}`}
        onClick={handleImageClick}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 backdrop-blur-sm transition-all duration-300 ease-in-out"
          onClick={handleImageClick}
        >
          <div className="relative max-w-5xl max-h-screen p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white flex justify-between items-center">
                <h3 className="text-lg font-semibold px-2">{image.alt || 'صورة في المحادثة'}</h3>
                <button
                  className="rounded-full p-1 hover:bg-white/20 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-gray-700 flex justify-center">
                <img
                  src={image.url}
                  alt={image.alt || 'صورة في المحادثة'}
                  className="max-w-full max-h-[70vh] object-contain rounded shadow-md"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="p-3 flex justify-end space-x-2 rtl:space-x-reverse bg-white dark:bg-gray-800">
                <button 
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    // فتح الصورة في نافذة جديدة
                    window.open(image.url, '_blank');
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  فتح الصورة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageImage;
