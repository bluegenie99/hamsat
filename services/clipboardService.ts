/**
 * خدمة النسخ والتعديل للرسائل
 */

// نوع لتعريف دالة عرض الإشعار
type ShowToastFunction = (message: string, type: 'success' | 'error' | 'info') => void;

// نوع لتعريف دالة عرض نافذة التحرير
type ShowEditModalFunction = (initialText: string, onSave: (text: string) => void) => void;

// متغيرات لتخزين دوال عرض الإشعار ونافذة التحرير
let showToastFn: ShowToastFunction | null = null;
let showEditModalFn: ShowEditModalFunction | null = null;

/**
 * تسجيل دالة عرض الإشعار
 * @param fn دالة عرض الإشعار
 */
export const registerToastFunction = (fn: ShowToastFunction) => {
  showToastFn = fn;
};

/**
 * تسجيل دالة عرض نافذة التحرير
 * @param fn دالة عرض نافذة التحرير
 */
export const registerEditModalFunction = (fn: ShowEditModalFunction) => {
  showEditModalFn = fn;
};

/**
 * نسخ نص إلى الحافظة
 * @param text النص المراد نسخه
 * @returns وعد يتم حله عند نجاح النسخ أو رفضه في حالة حدوث خطأ
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    
    // عرض إشعار نجاح النسخ باستخدام نظام الإشعارات الجديد
    if (showToastFn) {
      showToastFn('تم نسخ النص بنجاح', 'success');
    }
    
    return true;
  } catch (error) {
    console.error('خطأ في نسخ النص إلى الحافظة:', error);
    
    // محاولة استخدام طريقة بديلة للنسخ في حالة فشل واجهة Clipboard API
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // جعل عنصر textarea غير مرئي
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      
      // تحديد النص ونسخه
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      
      // إزالة العنصر من DOM
      document.body.removeChild(textArea);
      
      // عرض إشعار نجاح النسخ باستخدام نظام الإشعارات الجديد
      if (success && showToastFn) {
        showToastFn('تم نسخ النص بنجاح', 'success');
      }
      
      return success;
    } catch (fallbackError) {
      console.error('فشل النسخ بالطريقة البديلة:', fallbackError);
      
      // عرض إشعار فشل النسخ باستخدام نظام الإشعارات الجديد
      if (showToastFn) {
        showToastFn('فشل نسخ النص، يرجى المحاولة مرة أخرى', 'error');
      }
      
      return false;
    }
  }
};

/**
 * تعديل نص (فتح محرر لتعديل النص)
 * @param text النص المراد تعديله
 * @param onEdit دالة رد النداء التي تستدعى عند الانتهاء من التعديل
 */
export const editText = (text: string, onEdit: (editedText: string) => void): void => {
  // استخدام نافذة التحرير الجديدة إذا كانت متوفرة
  if (showEditModalFn) {
    showEditModalFn(text, onEdit);
  } else {
    // استخدام الطريقة البديلة إذا لم تكن نافذة التحرير متوفرة
    const editedText = window.prompt('تعديل النص:', text);
    
    if (editedText !== null) {
      onEdit(editedText);
      
      // عرض إشعار نجاح التعديل باستخدام نظام الإشعارات الجديد
      if (showToastFn) {
        showToastFn('تم تعديل الرسالة بنجاح', 'success');
      }
    }
  }
};
