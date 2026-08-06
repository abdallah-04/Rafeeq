import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'  // ← ADDED
import AsyncStorage from '@react-native-async-storage/async-storage' // ← ADDED
import { I18nManager } from 'react-native'
import type { AuthState, User, Language, UserRole } from '../types'
import type { ChildResponse } from '../services/api'
import i18n from '@/i18n'

// ─────────────────────────────────────────────
//  STORE SHAPE
//  We extend AuthState (the data) with Actions
//  (the functions that change the data)
// ─────────────────────────────────────────────

interface AuthStore extends AuthState {
  // ── Actions ──────────────────────────────
  login:               (user: User, token: string) => void
  logout:              () => void
  setAccessToken:      (token: string) => void
  setSelectedChild:    (child: ChildResponse | null) => void
  setLanguage:         (lang: Language) => void
  setRole:             (role: UserRole) => void
  setLanguageSelected: (value: boolean) => void  // ← ADDED
  setLoading:          (value: boolean) => void  // ← ADDED
  setError:            (msg: string | null) => void // ← ADDED
}

// ─────────────────────────────────────────────
//  INITIAL STATE
//  This is what the store looks like when the
//  app opens fresh — nobody is logged in yet
// ─────────────────────────────────────────────

const initialState: AuthState = {
  role:             null,
  user:             null,
  token:            null,
  selectedChild:    null,
  language:         'en',
  isRTL:            false,
  isAuthenticated:  false,
  languageSelected: false, // ← ADDED: false = language screen not shown yet
  isLoading:        false, // ← ADDED: true while an API call is running
  error:            null,  // ← ADDED: holds the last error message if any
}

// ─────────────────────────────────────────────
//  THE STORE
//  Wrapped with persist() so everything survives
//  the app being closed and reopened
// ─────────────────────────────────────────────

export const useAuthStore = create<AuthStore>()(

  // ← ADDED: persist wraps the entire store
  persist(
    (set) => ({

      // Spread the initial state so all fields exist
      // from the start
      ...initialState,

      // ── login ─────────────────────────────────
      // Called after a successful API login.
      // Sets the user, token, role, and flips
      // isAuthenticated to true.
      // The role comes from the user object itself.
      login: (user, token) => {
        set({
          user,
          token,
          role:            user.role,
          language:        user.language,
          isRTL:           user.language === 'ar',
          isAuthenticated: true,
          isLoading:       false, // ← clear loading when login completes
          error:           null,  // ← clear any previous error
        })

        // Tell React Native to flip the layout direction
        // if the user's language is Arabic
        I18nManager.forceRTL(user.language === 'ar')
      },

      // ── logout ────────────────────────────────
      // Wipes everything back to the initial state.
      // Called when user taps "Log out" or token expires.
      // NOTE: we keep languageSelected true so the language
      // screen doesn't show again after logout
      logout: () => {
        set((state) => ({
          ...initialState,
          language: state.language,
          isRTL: state.isRTL,
          languageSelected: state.languageSelected,
        }))
      },

      // Replace only the access token after a successful refresh.
      setAccessToken: (token) => {
        set({ token, isAuthenticated: true })
      },

      // ── setSelectedChild ──────────────────────
      // A parent might have multiple children.
      // This tracks WHICH child we are currently
      // viewing across all screens.
      // Pass null to deselect (e.g. back to child list)
      setSelectedChild: (child) => {
        set({ selectedChild: child })
      },

      // ── setLanguage ───────────────────────────
      // Called from the Language Selection screen
      // and from Settings.
      // Also updates isRTL and forces layout flip.
      setLanguage: (lang) => {
        const isRTL = lang === 'ar'
        i18n.changeLanguage(lang)
        I18nManager.forceRTL(isRTL)
        set({ language: lang, isRTL })
      },

      // ── setRole ───────────────────────────────
      // Called from the Role Selection screen
      // BEFORE the user registers.
      // The _layout.tsx reads this to decide which
      // registration flow to show.
      setRole: (role) => {
        set({ role })
      },

      // ── setLanguageSelected ───────────────────
      // Called once when the user picks a language
      // on first launch. After this is true, the
      // language screen never shows again.
      setLanguageSelected: (value) => {   // ← ADDED
        set({ languageSelected: value })
      },

      // ── setLoading ────────────────────────────
      // Call this before an API request starts
      // and after it finishes so screens can show
      // a spinner and disable buttons.
      setLoading: (value) => {            // ← ADDED
        set({ isLoading: value })
      },

      // ── setError ──────────────────────────────
      // Call this when an API request fails.
      // Pass null to clear the error.
      setError: (msg) => {               // ← ADDED
        set({ error: msg })
      },

    }),

    // ── persist config ────────────────────────
    {
      name: 'rafeeq-auth-storage', // key used in AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),

      // Only persist these fields — the rest reset on every launch
      // isLoading and error are never persisted (they're transient)
      partialize: (state) => ({
        token:            state.token,
        user:             state.user,
        role:             state.role,
        language:         state.language,
        isRTL:            state.isRTL,
        isAuthenticated:  state.isAuthenticated,
        languageSelected: state.languageSelected,
        // selectedChild is NOT persisted — always re-select on open
      }),
    }
  )
)

// ─────────────────────────────────────────────
//  SELECTORS
//  Pre-built selector functions so you don't
//  repeat the same (s => s.something) everywhere
//
//  Usage:
//  const user = useAuthStore(selectUser)
//  const isRTL = useAuthStore(selectIsRTL)
// ─────────────────────────────────────────────

export const selectUser             = (s: AuthStore) => s.user
export const selectRole             = (s: AuthStore) => s.role
export const selectToken            = (s: AuthStore) => s.token
export const selectSelectedChild    = (s: AuthStore) => s.selectedChild
export const selectLanguage         = (s: AuthStore) => s.language
export const selectIsRTL            = (s: AuthStore) => s.isRTL
export const selectIsAuthenticated  = (s: AuthStore) => s.isAuthenticated
export const selectLanguageSelected = (s: AuthStore) => s.languageSelected // ← ADDED
export const selectIsLoading        = (s: AuthStore) => s.isLoading        // ← ADDED
export const selectError            = (s: AuthStore) => s.error            // ← ADDED
