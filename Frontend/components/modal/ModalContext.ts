import { createContext, useContext } from 'react';

export type ModalType =
  | 'error'
  | 'success'
  | 'daywork'
  | 'addChild'
  | 'wellDone';

export interface ModalData {
  variant?: string;
  taskName?: string;
  date?: string;
  score?: number;
  total?: number;
}

export interface ModalContextValue {
  show: (type: ModalType, data?: ModalData) => void;
  hide: () => void;
}

export const ModalContext = createContext<ModalContextValue | null>(null);

export function useModal(): ModalContextValue {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used inside <ModalProvider>');
  }
  return context;
}
