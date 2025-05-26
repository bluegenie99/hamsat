# همسات (Hamsat) - تطبيق دردشة عربي

تطبيق دردشة تفاعلي باللهجات العربية المختلفة باستخدام React وTypeScript وTailwind CSS مع واجهة مستخدم عربية. يستخدم التطبيق نموذج Gemini من Google للذكاء الاصطناعي.

## المميزات

- واجهة مستخدم عربية بالكامل
- دعم للهجات عربية متعددة
- تصميم متجاوب يعمل على جميع الأجهزة
- واجهة مستخدم جميلة باستخدام Tailwind CSS
- إمكانية إرسال رسائل واستقبال ردود من نموذج Gemini
- محرر صور متكامل مع إمكانية تعديل السطوع والتباين والتشبع
- إمكانية إضافة وصف للصور لتحسين تفاعل النموذج معها

## التشغيل محلياً

### المتطلبات الأساسية

- Node.js (الإصدار 18 أو أحدث)
- مفتاح API لـ Google Gemini

### خطوات التشغيل

1. قم بتثبيت الاعتماديات:
   ```bash
   npm install
   ```

2. قم بإنشاء ملف `.env` في المجلد الرئيسي وأضف مفتاح API الخاص بك:
   ```
   API_KEY=your_google_gemini_api_key_here
   ```

3. قم بتشغيل التطبيق:
   ```bash
   npm run dev
   ```

4. افتح المتصفح على العنوان: `http://localhost:5173`

## النشر على Vercel

1. قم بإنشاء حساب على [Vercel](https://vercel.com) إذا لم يكن لديك حساب بالفعل.

2. قم برفع المشروع على GitHub:
   - قم بإنشاء مستودع جديد على GitHub
   - قم برفع الكود باستخدام الأوامر التالية:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/yourusername/hamsat.git
     git push -u origin main
     ```

3. قم بربط المشروع بـ Vercel:
   - قم بتسجيل الدخول إلى Vercel
   - انقر على "Add New" ثم "Project"
   - اختر مستودع GitHub الخاص بك
   - في إعدادات البناء، تأكد من أن:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`

4. قم بإضافة متغير البيئة:
   - في إعدادات المشروع على Vercel، انتقل إلى تبويب "Environment Variables"
   - أضف متغير `API_KEY` وقيمته (مفتاح Google Gemini API الخاص بك)

5. انقر على "Deploy" وانتظر حتى يتم نشر التطبيق

## التقنيات المستخدمة

- React
- TypeScript
- Tailwind CSS
- Vite
- Google Gemini API
