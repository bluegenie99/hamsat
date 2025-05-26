/**
 * خدمة تحويل النص إلى كلام باستخدام واجهة Web Speech API
 */
import { addDiacritics } from './diacriticsService';

// التحقق من دعم المتصفح لـ Web Speech API
const isSpeechSynthesisSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

// الصوت المفضل للغة العربية (أنثوي)
let arabicFemaleVoice: SpeechSynthesisVoice | null = null;

// تهيئة الصوت العربي الأنثوي
const initArabicVoice = (): boolean => {
  if (!isSpeechSynthesisSupported) return false;
  
  // الحصول على قائمة الأصوات المتاحة
  const voices = window.speechSynthesis.getVoices();
  
  // قائمة بالأصوات الأنثوية المعروفة
  const knownFemaleVoices = [
    'Microsoft Hala', 'Microsoft Hala Online', 'Microsoft Alia', 'Google العربية Female',
    'Samantha', 'Victoria', 'Tessa', 'Ava', 'Allison', 'Susan', 'Zira', 'Fiona', 'Karen', 'Moira', 'Veena',
    'Tessa', 'Samantha', 'Nora', 'Zosia', 'Luciana', 'Joana', 'Ioana', 'Milena', 'Liv', 'Alva'
  ];
  
  // البحث عن صوت أنثوي عربي معروف
  arabicFemaleVoice = voices.find(voice => 
    knownFemaleVoices.some(name => voice.name.includes(name)) && 
    (voice.lang.includes('ar') || voice.name.includes('Arabic'))
  ) || null;
  
  // إذا لم نجد، ابحث عن أي صوت أنثوي معروف
  if (!arabicFemaleVoice) {
    arabicFemaleVoice = voices.find(voice => 
      knownFemaleVoices.some(name => voice.name.includes(name))
    ) || null;
  }
  
  // البحث عن صوت عربي أنثوي باستخدام الكلمات الدالة
  if (!arabicFemaleVoice) {
    arabicFemaleVoice = voices.find(voice => 
      (voice.lang.includes('ar') || voice.lang.includes('AR') || voice.name.includes('Arabic')) &&
      (voice.name.includes('Female') || voice.name.includes('أنثى') || 
       voice.name.toLowerCase().includes('female') || voice.name.includes('f'))
    ) || null;
  }
  
  // إذا لم نجد صوتًا أنثويًا عربيًا، نبحث عن أي صوت عربي
  if (!arabicFemaleVoice) {
    arabicFemaleVoice = voices.find(voice => 
      voice.lang.includes('ar') || voice.lang.includes('AR') || voice.name.includes('Arabic')
    ) || null;
  }
  
  // إذا لم نجد صوتًا عربيًا، نبحث عن أي صوت أنثوي
  if (!arabicFemaleVoice) {
    arabicFemaleVoice = voices.find(voice => 
      voice.name.includes('Female') || voice.name.toLowerCase().includes('female') ||
      voice.name.includes('f') || /\bF\b/.test(voice.name)
    ) || null;
  }
  
  // إذا لم نجد أي صوت مناسب، نستخدم الصوت الافتراضي
  if (!arabicFemaleVoice && voices.length > 0) {
    arabicFemaleVoice = voices[0];
  }
  
  return !!arabicFemaleVoice;
};

// الاستماع لحدث تحميل الأصوات
if (isSpeechSynthesisSupported) {
  if (window.speechSynthesis.getVoices().length > 0) {
    initArabicVoice();
  }
  
  window.speechSynthesis.onvoiceschanged = () => {
    initArabicVoice();
    
    // طباعة الأصوات المتاحة في وحدة التحكم للتشخيص
    console.log('الأصوات المتاحة:');
    const voices = window.speechSynthesis.getVoices();
    voices.forEach(voice => {
      console.log(`${voice.name} (${voice.lang}) - ${voice.localService ? 'محلي' : 'سحابي'}`);
    });
    console.log('الصوت المختار:', arabicFemaleVoice?.name || 'لا يوجد');
  };
}

/**
 * تحويل النص إلى كلام مع تشكيل النص أولاً
 * @param text النص المراد تحويله إلى كلام
 * @param rate سرعة الكلام (0.1 إلى 10)
 * @param pitch طبقة الصوت (0 إلى 2)
 * @returns وعد يتم حله عند انتهاء الكلام أو رفضه في حالة حدوث خطأ
 */
export const speakText = async (text: string, rate: number = 1, pitch: number = 1): Promise<void> => {
  if (!isSpeechSynthesisSupported) {
    console.error('المتصفح لا يدعم تحويل النص إلى كلام');
    return;
  }
  
  try {
    // إعادة تهيئة الأصوات للتأكد من تحميلها
    if (!arabicFemaleVoice) {
      // محاولة إعادة تهيئة الأصوات
      initArabicVoice();
      
      // إذا لم نجد صوتًا بعد المحاولة، نستخدم الصوت الافتراضي
      if (!arabicFemaleVoice) {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          arabicFemaleVoice = voices[0];
          console.warn('لم يتم العثور على صوت عربي أنثوي، استخدام الصوت الافتراضي');
        } else {
          console.error('لا توجد أصوات متاحة');
          return;
        }
      }
    }
    
    // محاولة إضافة تشكيل للنص لتحسين النطق
    const diacritizedText = await addDiacritics(text);
    
    // إنشاء كائن الكلام
    const utterance = new SpeechSynthesisUtterance(diacritizedText);
    
    // تعيين الصوت العربي الأنثوي
    utterance.voice = arabicFemaleVoice;
    utterance.lang = arabicFemaleVoice.lang || 'ar-SA'; // استخدام العربية السعودية لتحسين النطق
    
    // ضبط معدل ونبرة الصوت
    utterance.rate = rate;
    utterance.pitch = pitch;
    
    // إضافة مستمع للأخطاء
    utterance.onerror = (event) => {
      console.error('خطأ في النطق:', event);
    };
    
    // إيقاف أي كلام حالي
    window.speechSynthesis.cancel();
    
    // بدء الكلام
    window.speechSynthesis.speak(utterance);
    
    // إضافة مؤقت للتأكد من استمرار الكلام في بعض المتصفحات
    const resumeTimer = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        clearInterval(resumeTimer);
        return;
      }
      
      // إعادة تشغيل الكلام لمنع توقفه في بعض المتصفحات
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }, 5000);
  } catch (error) {
    console.error('خطأ في تحويل النص إلى كلام:', error);
  }
};

/**
 * إيقاف الكلام الحالي
 */
export const stopSpeaking = (): void => {
  if (isSpeechSynthesisSupported) {
    window.speechSynthesis.cancel();
  }
};

/**
 * التحقق من دعم تحويل النص إلى كلام
 */
export const isSpeechSupported = (): boolean => {
  return isSpeechSynthesisSupported;
};
