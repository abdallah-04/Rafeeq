import { create } from 'zustand';
import i18n from '@/i18n';

export interface ChatMessage {
  id: string;
  role: 'user' | 'rafeeq';
  text: string;
  timestamp: string;
  attachment?: { type: 'image' | 'file' | 'voice'; name: string };
}

interface ChatStore {
  messages: ChatMessage[];
  isTyping: boolean;
  sendMessage: (text: string, attachment?: ChatMessage['attachment']) => void;
  clearChat: () => void;
}

const MOCK_REPLIES_EN = [
  "That's a great question! Children with special needs often thrive with consistent routines and patient, encouraging adults around them.",
  "I understand your concern. It's important to celebrate small milestones — every step forward matters in your child's journey.",
  "Early intervention is key. If you're noticing delays, reaching out to a specialist early can make a significant difference.",
  "Communication between home and school is essential. Keep an open dialogue with your child's teacher about what's working.",
  "Remember to take care of yourself too. Supporting a child with special needs is a marathon, not a sprint. You're doing great!",
  "Visual schedules can be very helpful for children who need extra support with transitions and daily routines.",
  "Positive reinforcement builds confidence. Celebrate the effort, not just the outcome, and watch your child flourish.",
];

const MOCK_REPLIES_AR = [
  'هذا سؤال رائع! كثيراً ما يزدهر الأطفال ذوو الاحتياجات الخاصة مع الروتين المتسق والبالغين الصبورين والمشجّعين من حولهم.',
  'أفهم قلقك. من المهم الاحتفال بالإنجازات الصغيرة — كل خطوة إلى الأمام مهمة في رحلة طفلك.',
  'التدخل المبكر أساسي. إذا لاحظت تأخراً، فإن التواصل مع متخصص مبكراً يمكن أن يُحدث فارقاً كبيراً.',
  'التواصل بين المنزل والمدرسة ضروري. حافظ على حوار مفتوح مع معلم طفلك حول ما يجدي نفعاً.',
  'تذكر الاعتناء بنفسك أيضاً. دعم طفل ذي احتياجات خاصة رحلة طويلة وليست سباقاً. أنت تبلي حسناً!',
  'الجداول المرئية مفيدة جداً للأطفال الذين يحتاجون إلى دعم إضافي في الانتقالات والروتين اليومي.',
  'التعزيز الإيجابي يبني الثقة. احتفل بالجهد وليس بالنتيجة فحسب، وستشاهد طفلك يتألق.',
];

function formatTimestamp(): string {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isTyping: false,

  sendMessage: (text, attachment) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: formatTimestamp(),
      attachment,
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isTyping: true,
    }));

    setTimeout(() => {
      const lang = i18n.language;
      const replies = lang === 'ar' ? MOCK_REPLIES_AR : MOCK_REPLIES_EN;
      const reply = replies[Math.floor(Math.random() * replies.length)];

      const rafeeqMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'rafeeq',
        text: reply,
        timestamp: formatTimestamp(),
      };

      set((state) => ({
        messages: [...state.messages, rafeeqMsg],
        isTyping: false,
      }));
    }, 1500);
  },

  clearChat: () => set({ messages: [], isTyping: false }),
}));
