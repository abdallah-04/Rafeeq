import { create } from 'zustand'
import { I18nManager } from 'react-native'
import type { AuthState, User, Child, Language, UserRole } from '../types'
 
// ─────────────────────────────────────────────
//  STORE SHAPE
//  We extend AuthState (the data) with Actions
//  (the functions that change the data)
// ─────────────────────────────────────────────
 
interface AuthStore extends AuthState {
  // ── Actions ──────────────────────────────
  login:           (user: User, token: string) => void
  logout:          () => void
  setSelectedChild:(child: Child | null) => void
  setLanguage:     (lang: Language) => void
  setRole:         (role: UserRole) => void
}
 
// ─────────────────────────────────────────────
//  INITIAL STATE
//  This is what the store looks like when the
//  app opens fresh — nobody is logged in yet
// ─────────────────────────────────────────────
 
const initialState: AuthState = {
  role:            null,
  user:            null,
  token:           null,
  selectedChild:   null,
  language:        'en',
  isRTL:           false,
  isAuthenticated: false,
}
 
// ─────────────────────────────────────────────
//  THE STORE
// ─────────────────────────────────────────────
 
export const useAuthStore = create<AuthStore>((set) => ({
 
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
    })
 
    // Tell React Native to flip the layout direction
    // if the user's language is Arabic
    I18nManager.forceRTL(user.language === 'ar')
  },
 
  // ── logout ────────────────────────────────
  // Wipes everything back to the initial state.
  // Called when user taps "Log out" or token expires.
  logout: () => {
    set(initialState)
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
 
}))
 
// ─────────────────────────────────────────────
//  SELECTORS
//  Pre-built selector functions so you don't
//  repeat the same (s => s.something) everywhere
//
//  Usage:
//  const user = useAuthStore(selectUser)
//  const isRTL = useAuthStore(selectIsRTL)
// ─────────────────────────────────────────────
 
export const selectUser            = (s: AuthStore) => s.user
export const selectRole            = (s: AuthStore) => s.role
export const selectToken           = (s: AuthStore) => s.token
export const selectSelectedChild   = (s: AuthStore) => s.selectedChild
export const selectLanguage        = (s: AuthStore) => s.language
export const selectIsRTL           = (s: AuthStore) => s.isRTL
export const selectIsAuthenticated = (s: AuthStore) => s.isAuthenticated
 