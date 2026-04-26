import { z } from 'zod'
import { TFunction } from 'i18next'

export const createAddStudentSchema = (t: TFunction) =>
  z.object({
    fullNameAr:  z.string().min(2, t('validation.fullNameRequired')),
    fullNameEn:  z.string().min(2, t('validation.fullNameRequired')),
    nationalId:  z
      .string()
      .length(10, t('validation.nationalId10Digits'))
      .regex(/^\d+$/, t('validation.numbersOnly')),
    dateOfBirth: z.string().min(1, t('validation.dobRequired')),
    difficulty:  z.string().min(1, t('validation.selectDifficulty')),
    gender:      z.string().min(1, t('validation.selectGender')),
  })

// Static schema kept for backward-compat (English fallback)
export const addStudentSchema = z.object({
  fullNameAr:  z.string().min(2, 'Full name is required'),
  fullNameEn:  z.string().min(2, 'Full name is required'),
  nationalId:  z.string().length(10, 'Must be 10 digits').regex(/^\d+$/, 'Numbers only'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  difficulty:  z.string().min(1, 'Please select a difficulty'),
  gender:      z.string().min(1, 'Please select a gender'),
})

export type AddStudentForm = z.infer<typeof addStudentSchema>
