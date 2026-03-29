import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as Localization from 'expo-localization'

import en from '@/locales/en.json'
import ar from '@/locales/ar.json'


const resources = {
  en: { translation: en },
  ar: { translation: ar },
}


const deviceLang = Localization.getLocales()[0]?.languageCode ?? 'en'
const defaultLang = deviceLang === 'ar' ? 'ar' : 'en'


i18n
  .use(initReactI18next)  
  .init({
    resources,

    lng:          defaultLang,
    fallbackLng:  'en',


    interpolation: {
      escapeValue: false,  
    },

    ns:            ['translation'],
    defaultNS:     'translation',
  })

export default i18n

// ─────────────────────────────────────────────
//  CHANGE LANGUAGE HELPER
//  Call this from the auth store's setLanguage
//  action so both i18next and Zustand stay in sync
//
//  Usage:
//  import { changeLanguage } from '@/i18n'
//  changeLanguage('ar')
// ─────────────────────────────────────────────

export const changeLanguage = (lang: 'en' | 'ar') => {
  i18n.changeLanguage(lang)
}