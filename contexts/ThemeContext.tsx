import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // استرجاع الوضع المحفوظ من التخزين المحلي أو استخدام الوضع الفاتح كافتراضي
  const [theme, setTheme] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem('hamsat-theme');
    return (savedTheme as ThemeType) || 'light';
  });

  // تحديث الوضع في التخزين المحلي عند تغييره
  useEffect(() => {
    localStorage.setItem('hamsat-theme', theme);
    
    // إضافة أو إزالة الفئة 'dark' من عنصر html
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // تبديل الوضع بين الفاتح والمظلم
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// هوك مخصص لاستخدام سياق الوضع
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
