import { z } from 'zod'
import { TFunction } from 'i18next'

export const createAddTeacherSchema = (t: TFunction) =>
  z
    .object({
      fullName:        z.string().min(2, t('validation.fullNameRequired')),
      nationalId:      z
        .string()
        .length(10, t('validation.nationalId10Digits'))
        .regex(/^\d+$/, t('validation.numbersOnly')),
      phone:           z
        .string()
        .min(9, t('validation.phoneRequired'))
        .regex(/^7\d{8}$/, t('validation.validJordanianNumber')),
      password:        z.string().min(8, t('validation.passwordMin8')),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('validation.passwordsNoMatch'),
      path: ['confirmPassword'],
    })

// Static schema kept for backward-compat (English fallback)
export const addTeacherSchema = z
  .object({
    fullName:        z.string().min(2, 'Full name is required'),
    nationalId:      z.string().length(10, 'National ID must be 10 digits').regex(/^\d+$/, 'Numbers only'),
    phone:           z.string().min(9, 'Phone is required').regex(/^7\d{8}$/, 'Enter a valid Jordanian number'),
    password:        z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type AddTeacherForm = z.infer<typeof addTeacherSchema>
