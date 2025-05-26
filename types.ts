
// نوع المحتوى في الرسالة
export enum ContentType {
  Text = 'text',
  Image = 'image',
  Mixed = 'mixed' // نص مع صورة
}

// محتوى الصورة
export interface ImageContent {
  url: string;       // رابط الصورة (قد يكون Data URL أو رابط خارجي)
  alt?: string;      // نص بديل للصورة
  width?: number;    // العرض
  height?: number;   // الارتفاع
}

// محتوى الرسالة
export interface MessageContent {
  type: ContentType;           // نوع المحتوى
  text?: string;               // النص (إذا كان النوع نص أو مختلط)
  image?: ImageContent;        // الصورة (إذا كان النوع صورة أو مختلط)
}

// رسالة المحادثة
export interface ChatMessage {
  id: string;                  // معرف فريد للرسالة
  
  // دعم النمط الجديد
  content?: MessageContent;    // محتوى الرسالة بالنمط الجديد
  sender?: 'user' | 'ai';      // مرسل الرسالة بالنمط القديم
  
  // دعم النمط الجديد
  role?: 'user' | 'ai';        // مرسل الرسالة بالنمط الجديد
  text?: string;               // نص الرسالة بالنمط الجديد
  
  // مشترك بين النمطين
  timestamp: Date | string;    // وقت الإرسال
  dialect?: Dialect;           // اللهجة (للرسائل من الذكاء الاصطناعي)
}

export enum Dialect {
  Palestinian = "فلسطينية",
  Shami = "شامية",
  Lebanese = "لبنانية",
  Khaleeji = "خليجية",
  Egyptian = "مصرية",
  Iraqi = "عراقية",
  Maghrebi = "مغربية",
  Sudanese = "سودانية",
}

export const DIALECT_OPTIONS = [
  { value: Dialect.Palestinian, label: "فلسطيني" },
  { value: Dialect.Shami, label: "شامي" },
  { value: Dialect.Lebanese, label: "لبناني" },
  { value: Dialect.Khaleeji, label: "خليجي" },
  { value: Dialect.Egyptian, label: "مصري" },
  { value: Dialect.Iraqi, label: "عراقي" },
  { value: Dialect.Maghrebi, label: "مغربي" },
  { value: Dialect.Sudanese, label: "سوداني" },
];

export enum SpecialAction {
  MorningLove = "MorningLove",
  SurpriseLove = "SurpriseLove",
  ComfortMe = "ComfortMe",
  FlirtWithMe = "FlirtWithMe",
}
