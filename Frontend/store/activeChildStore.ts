import { create } from 'zustand';
import type { ChildResponse } from '@/services/api';

interface ActiveChildState {
  activeChild: ChildResponse | null;
  setActiveChild: (child: ChildResponse) => void;
  clearActiveChild: () => void;
}

export const useActiveChildStore = create<ActiveChildState>()((set) => ({
  activeChild: null,
  setActiveChild: (child) => set({ activeChild: child }),
  clearActiveChild: () => set({ activeChild: null }),
}));

export const selectActiveChild = (s: ActiveChildState) => s.activeChild;