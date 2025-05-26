import React, { useState, useRef, useEffect } from 'react';
import { ImageContent } from '../types';

interface ImageEditorProps {
  image: ImageContent;
  onSave: (editedImage: ImageContent) => void;
  onCancel: () => void;
}

const ImageEditorNew: React.FC<ImageEditorProps> = ({ image, onSave, onCancel }) => {
  const [description, setDescription] = useState<string>(image.alt || '');
  const [previewImage, setPreviewImage] = useState<string>(image.url);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);

  // تحميل الصورة عند بدء التحرير
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      if (imageRef.current) {
        imageRef.current.src = image.url;
      }
      applyFilters();
    };
    img.src = image.url;
  }, [image.url]);

  // تطبيق الفلاتر على الصورة
  const applyFilters = () => {
    if (!canvasRef.current || !imageRef.current || !imageRef.current.complete) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = imageRef.current;
    
    // ضبط أبعاد الكانفاس
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    // رسم الصورة على الكانفاس
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // تحديث معاينة الصورة
    setPreviewImage(canvas.toDataURL('image/jpeg', 0.9));
  };

  // تطبيق الفلاتر عند تغيير القيم
  useEffect(() => {
    applyFilters();
  }, [brightness, contrast, saturation]);

  // حفظ الصورة المعدلة
  const handleSave = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const editedImage: ImageContent = {
        ...image,
        url: previewImage,
        alt: description
      };
      
      onSave(editedImage);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 overflow-auto flex justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-5xl m-4 md:m-8 flex flex-col min-h-[80vh] max-h-[95vh]">
        {/* رأس المحرر */}
        <div className="p-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-t-lg">
          <h2 className="text-xl font-bold">تعديل الصورة</h2>
        </div>
        
        {/* محتوى المحرر */}
        <div className="p-6 overflow-auto flex-grow" style={{ minHeight: '600px' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* معاينة الصورة */}
            <div className="flex flex-col items-center">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 mb-4 w-full">
                <img 
                  src={previewImage} 
                  alt="معاينة" 
                  className="max-w-full max-h-[300px] mx-auto rounded"
                />
              </div>
              
              {/* عناصر التحكم بالفلاتر */}
              <div className="w-full space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    السطوع ({brightness}%)
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="200" 
                    value={brightness} 
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    التباين ({contrast}%)
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="200" 
                    value={contrast} 
                    onChange={(e) => setContrast(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    التشبع ({saturation}%)
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="200" 
                    value={saturation} 
                    onChange={(e) => setSaturation(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                </div>
              </div>
            </div>
            
            {/* وصف الصورة */}
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  وصف الصورة
                </label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-pink-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={8}
                  placeholder="أضف وصفاً للصورة هنا..."
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  سيساعد هذا الوصف الصديقة على فهم محتوى الصورة والتفاعل معها بشكل أفضل.
                </p>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 p-3 rounded-md">
                <h3 className="text-yellow-800 dark:text-yellow-500 font-medium text-sm">ملاحظة هامة</h3>
                <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-1">
                  نظراً للقيود التقنية، لا تستطيع الصديقة رؤية الصورة فعلياً، لكنها ستتفاعل مع الوصف الذي تكتبه. كلما كان الوصف دقيقاً، كان التفاعل أفضل.
                </p>
              </div>
            </div>
          </div>
          
          {/* كانفاس مخفي لمعالجة الصورة */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <img ref={imageRef} style={{ display: 'none' }} alt="source" />
        </div>
        
        {/* أزرار الحفظ والإلغاء */}
        <div className="p-4 bg-gray-100 dark:bg-gray-700 flex justify-end space-x-2 rtl:space-x-reverse border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            disabled={isLoading}
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2 rtl:ml-2 rtl:mr-0"></span>
                جاري الحفظ...
              </>
            ) : 'حفظ التغييرات'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditorNew;
