/**
 * store/activeChildStore.ts
 *
 * Lightweight store that tracks which child is currently "in focus" for the
 * parent app.  Intentionally not persisted — the parent re-selects their child
 * each session (matches the pattern in authStore where selectedChild is also
 * excluded from the persist partialize list).
 */

import { create } from 'zustand';
import type { Child } from '@/store/Appstore';

interface ActiveChildState {
  /** The child the parent is currently viewing across all screens. */
  activeChild: Child | null;
  /** Select a child and make it the active one. */
  setActiveChild: (child: Child) => void;
  /** Deselect (e.g. parent navigates back to the child list). */
  clearActiveChild: () => void;
}

export const useActiveChildStore = create<ActiveChildState>()((set) => ({
  activeChild: null,

  setActiveChild: (child) => set({ activeChild: child }),

  clearActiveChild: () => set({ activeChild: null }),
}));

// Selectors
export const selectActiveChild = (s: ActiveChildState) => s.activeChild;
