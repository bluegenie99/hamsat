import React, { createContext, useState, useContext, ReactNode } from 'react';

interface SpeechSettings {
  rate: number;
  pitch: number;
}

interface SpeechContextType {
  settings: SpeechSettings;
  updateSettings: (newSettings: SpeechSettings) => void;
}

const defaultSettings: SpeechSettings = {
  rate: 1,
  pitch: 1
};

const SpeechContext = createContext<SpeechContextType | undefined>(undefined);

export const SpeechProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SpeechSettings>(defaultSettings);

  const updateSettings = (newSettings: SpeechSettings) => {
    setSettings(newSettings);
    // يمكن حفظ الإعدادات في التخزين المحلي إذا أردنا الاحتفاظ بها بين الجلسات
    localStorage.setItem('hamsat-speech-settings', JSON.stringify(newSettings));
  };

  // استرجاع الإعدادات المحفوظة عند تحميل المكون
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('hamsat-speech-settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings) as SpeechSettings;
        setSettings(parsedSettings);
      } catch (error) {
        console.error('خطأ في استرجاع إعدادات الصوت:', error);
      }
    }
  }, []);

  return (
    <SpeechContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SpeechContext.Provider>
  );
};

// هوك مخصص لاستخدام سياق الإعدادات الصوتية
export const useSpeech = (): SpeechContextType => {
  const context = useContext(SpeechContext);
  if (context === undefined) {
    throw new Error('useSpeech must be used within a SpeechProvider');
  }
  return context;
};
