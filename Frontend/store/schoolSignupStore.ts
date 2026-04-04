import { create } from 'zustand'
import { SchoolStep1Form, SchoolStep2Form } from '@/lib/schemas/schoolSignup'

type SchoolSignupStore = {
  step1: Partial<SchoolStep1Form>
  step2: Partial<SchoolStep2Form>
  setStep1: (data: SchoolStep1Form) => void
  setStep2: (data: SchoolStep2Form) => void
  clearSignup: () => void
}

export const useSchoolSignupStore = create<SchoolSignupStore>((set) => ({
  step1: {},
  step2: {},
  setStep1: (data) => set({ step1: data }),
  setStep2: (data) => set({ step2: data }),
  clearSignup: () => set({ step1: {}, step2: {} }),
}))