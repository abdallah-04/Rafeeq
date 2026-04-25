import { create } from 'zustand';
import i18n from '@/i18n';
import { apiSendChatMessage } from '@/services/api';
import { useActiveChildStore } from '@/store/activeChildStore';

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
  sendMessage: (text: string, attachment?: ChatMessage['attachment']) => Promise<void>;
  clearChat: () => void;
}

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

  sendMessage: async (text, attachment) => {
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

    try {
      const activeChildId = useActiveChildStore.getState().activeChild?.id ?? null;
      const response = await apiSendChatMessage(text, activeChildId);

      const assistantMsg: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: 'rafeeq',
        text: response.assistantResponse,
        timestamp: formatTimestamp(),
      };

      set((state) => ({
        messages: [...state.messages, assistantMsg],
        isTyping: false,
      }));
    } catch (error) {
      const fallback =
        i18n.language === 'ar'
          ? 'تعذر الوصول إلى المساعد الآن. يرجى المحاولة مرة أخرى بعد قليل.'
          : 'I could not reach the assistant right now. Please try again in a moment.';

      const errorMessage: ChatMessage = {
        id: `${Date.now()}-error`,
        role: 'rafeeq',
        text: error instanceof Error && error.message ? error.message : fallback,
        timestamp: formatTimestamp(),
      };

      set((state) => ({
        messages: [...state.messages, errorMessage],
        isTyping: false,
      }));
    }
  },

  clearChat: () => set({ messages: [], isTyping: false }),
}));
