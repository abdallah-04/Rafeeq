import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Modal, View, StyleSheet, Pressable } from 'react-native';

import ErrorModal from './variants/ErrorModal';
import SuccessModal from './variants/SuccessModal';
import DayWorkModal from './variants/DayWorkModal';
import AddChildModal from './variants/AddChildModal';
import WellDoneModal from './variants/WellDoneModal';


export type ModalType =
  | 'error'
  | 'success'
  | 'daywork'
  | 'addChild'
  | 'wellDone';

export type ErrorVariant =
  | 'incompleteInfo'
  | 'invalidCode'
  | 'invalidId'
  | 'passwordMismatch'
  | 'incorrectNumber'
  | 'invalidInfo';

export type SuccessVariant =
  | 'greatJob'
  | 'reportAdded'
  | 'hwAdded'
  | 'noteAdded'
  | 'saved'
  | 'downloadDone'
  | 'passwordUpdate'
  | 'submitSuccess'
  | 'childAdded';

export type DayWorkVariant =
  | 'whatTodayOkay'
  | 'whatTodayLetsGo'
  | 'day5work'
  | 'day6work'
  | 'day7work'
  | 'todayQuiz'
  | 'todayExam'
  | 'soproud';

export interface ModalData {
  variant?: ErrorVariant | SuccessVariant | DayWorkVariant;
  taskName?: string;
  date?: string;
  score?: number;
  total?: number;
}

interface ModalState {
  type: ModalType | null;
  data: ModalData;
  visible: boolean;
}

interface ModalContextValue {
  show: (type: ModalType, data?: ModalData) => void;
  hide: () => void;
}


const ModalContext = createContext<ModalContextValue | null>(null);


export function ModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ModalState>({
    type: null,
    data: {},
    visible: false,
  });

  const show = useCallback((type: ModalType, data: ModalData = {}) => {
    setState({ type, data, visible: true });
  }, []);

  const hide = useCallback(() => {
    setState(prev => ({ ...prev, visible: false }));
  }, []);

  return (
    <ModalContext.Provider value={{ show, hide }}>
      {children}
      <Modal
        transparent
        visible={state.visible}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={hide}
      >
        <Pressable style={styles.backdrop} onPress={hide}>
          <Pressable style={styles.cardWrapper} onPress={e => e.stopPropagation()}>
            <ModalRenderer type={state.type} data={state.data} onHide={hide} />
          </Pressable>
        </Pressable>
      </Modal>
    </ModalContext.Provider>
  );
}


function ModalRenderer({
  type,
  data,
  onHide,
}: {
  type: ModalType | null;
  data: ModalData;
  onHide: () => void;
}) {
  switch (type) {
    case 'error':
      return <ErrorModal variant={data.variant as ErrorVariant} onHide={onHide} />;
    case 'success':
      return (
        <SuccessModal
          variant={data.variant as SuccessVariant}
          taskName={data.taskName}
          date={data.date}
          onHide={onHide}
        />
      );
    case 'daywork':
      return <DayWorkModal variant={data.variant as DayWorkVariant} onHide={onHide} />;
    case 'addChild':
      return <AddChildModal onHide={onHide} />;
    case 'wellDone':
      return <WellDoneModal score={data.score ?? 0} total={data.total ?? 0} onHide={onHide} />;
    default:
      return null;
  }
}


export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error('useModal must be used inside <ModalProvider>');
  }
  return ctx;
}


const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  cardWrapper: {
    width: '100%',
  },
});