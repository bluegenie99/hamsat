
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  dialect?: Dialect; 
}

export enum Dialect {
  Palestinian = "فلسطينية",
  Shami = "شامية (سورية/لبنانية)",
  Khaleeji = "خليجية",
  Egyptian = "مصرية",
  Iraqi = "عراقية",
  Maghrebi = "مغربية",
  Sudanese = "سودانية",
}

export const DIALECT_OPTIONS = [
  { value: Dialect.Palestinian, label: "فلسطيني" },
  { value: Dialect.Shami, label: "شامي" },
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
