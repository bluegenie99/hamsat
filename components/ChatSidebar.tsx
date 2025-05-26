import React, { useState, useEffect } from 'react';
import { 
  getChatsList, 
  getActiveChat, 
  setActiveChat, 
  deleteChat, 
  createNewChat,
  exportChat,
  importChat,
  ChatInfo
} from '../services/storageService';

interface ChatSidebarProps {
  onChatSelect: (chatId: string) => void;
  aiName: string;
  isOpen: boolean;
  onClose: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  onChatSelect, 
  aiName, 
  isOpen,
  onClose
}) => {
  const [chats, setChats] = useState<ChatInfo[]>([]);
  const [activeChat, setActiveChatId] = useState<string>('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importData, setImportData] = useState('');

  // تحميل قائمة المحادثات
  const loadChats = () => {
    const chatsList = getChatsList();
    // ترتيب المحادثات حسب آخر تحديث (الأحدث أولاً)
    chatsList.sort((a, b) => b.lastUpdated - a.lastUpdated);
    setChats(chatsList);
    setActiveChatId(getActiveChat());
  };

  // تحميل المحادثات عند تهيئة المكون
  useEffect(() => {
    loadChats();
  }, []);

  // إنشاء محادثة جديدة
  const handleNewChat = () => {
    const title = `محادثة جديدة (${new Date().toLocaleDateString()})`;
    const chatId = createNewChat(title, aiName);
    loadChats();
    onChatSelect(chatId);
  };

  // تحديد محادثة نشطة
  const handleSelectChat = (chatId: string) => {
    setActiveChat(chatId);
    setActiveChatId(chatId);
    onChatSelect(chatId);
    if (window.innerWidth < 768) {
      onClose(); // إغلاق الشريط الجانبي في الشاشات الصغيرة
    }
  };

  // حذف محادثة
  const handleDeleteChat = (chatId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm('هل أنت متأكد من حذف هذه المحادثة؟')) {
      deleteChat(chatId);
      loadChats();
    }
  };

  // تصدير محادثة
  const handleExportChat = (chatId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const chatData = exportChat(chatId);
    if (chatData) {
      const blob = new Blob([chatData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hamsat-chat-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // استيراد محادثة
  const handleImport = () => {
    setIsImportModalOpen(true);
  };

  // معالجة استيراد ملف
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setImportData(content);
      };
      reader.readAsText(file);
    }
  };

  // تأكيد استيراد المحادثة
  const confirmImport = () => {
    if (importData) {
      const chatId = importChat(importData);
      if (chatId) {
        loadChats();
        onChatSelect(chatId);
        setIsImportModalOpen(false);
        setImportData('');
      } else {
        alert('فشل استيراد المحادثة. تأكد من صحة ملف البيانات.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* خلفية معتمة */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
        onClick={onClose}
      ></div>
      
      {/* الشريط الجانبي */}
      <div className="relative flex flex-col w-72 max-w-xs h-full bg-white dark:bg-gray-800 shadow-xl overflow-y-auto transition-transform duration-300 ease-in-out">
        <div className="p-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white">
          <h2 className="text-lg font-bold flex items-center justify-between">
            <span>المحادثات</span>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </h2>
        </div>
        
        {/* أزرار الإجراءات */}
        <div className="p-2 flex space-x-2 rtl:space-x-reverse border-b border-gray-200 dark:border-gray-700">
          <button 
            onClick={handleNewChat}
            className="flex-1 px-3 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 rtl:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            محادثة جديدة
          </button>
          <button 
            onClick={handleImport}
            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </button>
        </div>
        
        {/* قائمة المحادثات */}
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              لا توجد محادثات محفوظة
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {chats.map(chat => (
                <li 
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  className={`p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                    activeChat === chat.id ? 'bg-pink-50 dark:bg-pink-900/30' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {chat.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                        {chat.previewText || 'محادثة جديدة'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(chat.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-1 rtl:space-x-reverse">
                      <button 
                        onClick={(e) => handleExportChat(chat.id, e)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                      <button 
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {/* نافذة استيراد المحادثة */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden w-full max-w-md">
            <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white flex justify-between items-center">
              <h3 className="text-lg font-semibold">استيراد محادثة</h3>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="rounded-full p-1 hover:bg-white/20 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">اختر ملف JSON للمحادثة</label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none transition-all duration-300"
                />
              </div>
              
              {importData && (
                <div className="mb-4">
                  <p className="text-green-600 dark:text-green-400">تم تحميل الملف بنجاح</p>
                </div>
              )}
            </div>
            
            <div className="p-3 bg-gray-100 dark:bg-gray-700 flex justify-end space-x-2 rtl:space-x-reverse">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={confirmImport}
                className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
                disabled={!importData}
              >
                استيراد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSidebar;
