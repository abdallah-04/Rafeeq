import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import i18n from '@/i18n';


export type Language = 'en' | 'ar';
export type UserRole = 'parent' | 'teacher' | 'school' | null;

export interface User {
    id: string;
    name: string;
    role: UserRole;
    nationalId?: string;
    phone?: string;
}

export interface Child {
    id: string;
    name: string;
    age: number;
    difficulty: string;
    level: number;
    progress: number;
    schoolName: string;
    gender: 'male' | 'female';
    avatarUrl?: string;
}

interface AppState {
    language: Language;
    isRTL: boolean;
    hasSeenOnboarding: boolean;
    hasSelectedLanguage: boolean;
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    selectedChild: Child | null;
    children: Child[];
    setLanguage: (lang: Language) => void;
    setHasSeenOnboarding: (val: boolean) => void;
    setUser: (user: User, token: string) => void;
    logout: () => void;
    setSelectedChild: (child: Child) => void;
    addChild: (child: Child) => void;
    updateChild: (id: string, updates: Partial<Child>) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            language: 'en',
            isRTL: false,
            hasSeenOnboarding: false,
            hasSelectedLanguage: false,
            user: null,
            token: null,
            isAuthenticated: false,
            selectedChild: null,
            children: [],
            setLanguage: (lang: Language) => {
                const isRTL = lang === 'ar';
                i18n.changeLanguage(lang);
                I18nManager.forceRTL(isRTL);
                set({ language: lang, isRTL, hasSelectedLanguage: true }); },
            setHasSeenOnboarding: (val: boolean) => {
                set({ hasSeenOnboarding: val });},
            setUser: (user: User, token: string) => {
                set({ user, token, isAuthenticated: true });},
            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    selectedChild: null,
                    children: [],
                });},
            setSelectedChild: (child: Child) => {
                set({ selectedChild: child });
            },
            addChild: (child: Child) => {
                set((state) => ({
                children: [...state.children, child],
                selectedChild: state.selectedChild ?? child,
                }));},
            updateChild: (id: string, updates: Partial<Child>) => {
                set((state) => ({
                children: state.children.map((c) =>
                    c.id === id ? { ...c, ...updates } : c
                ),
                selectedChild:
                    state.selectedChild?.id === id
                    ? { ...state.selectedChild, ...updates }
                    : state.selectedChild,
                }));},}),
        {
            name: 'rafeeq-app-store',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                language: state.language,
                isRTL: state.isRTL,
                hasSeenOnboarding: state.hasSeenOnboarding,
                hasSelectedLanguage: state.hasSelectedLanguage,
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                children: state.children,
                selectedChild: state.selectedChild,}),
        }));