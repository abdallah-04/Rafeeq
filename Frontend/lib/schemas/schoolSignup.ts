import { z } from 'zod'
import { TFunction } from 'i18next'

export const createSchoolStep1Schema = (t: TFunction) =>
  z.object({
    schoolNameAr:      z.string().min(2, t('validation.schoolNameRequired')),
    schoolNameEn:      z.string().min(2, t('validation.schoolNameRequired')),
    schoolId:          z.string().min(3, t('validation.schoolIdRequired')),
    advisorName:       z.string().min(2, t('validation.advisorNameRequired')),
    advisorNationalId: z
      .string()
      .length(10, t('validation.nationalId10Digits'))
      .regex(/^\d+$/, t('validation.numbersOnly')),
  })

export const createSchoolStep2Schema = (t: TFunction) =>
  z
    .object({
      advisorPhone: z
        .string()
        .min(9, t('validation.phoneRequired'))
        .regex(/^7\d{8}$/, t('validation.validJordanianNumber')),
      password: z.string().min(8, t('validation.passwordMin8')),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('validation.passwordsNoMatch'),
      path: ['confirmPassword'],
    })

// Static schemas kept for backward-compat (English fallback)
export const schoolStep1Schema = z.object({
  schoolNameAr:      z.string().min(2, 'School name is required'),
  schoolNameEn:      z.string().min(2, 'School name is required'),
  schoolId:          z.string().min(3, 'School ID is required'),
  advisorName:       z.string().min(2, 'Advisor name is required'),
  advisorNationalId: z
    .string()
    .length(10, 'National ID must be 10 digits')
    .regex(/^\d+$/, 'Numbers only'),
})

export const schoolStep2Schema = z
  .object({
    advisorPhone: z
      .string()
      .min(9, 'Phone number is required')
      .regex(/^7\d{8}$/, 'Enter a valid Jordanian number'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type SchoolStep1Form = z.infer<typeof schoolStep1Schema>
export type SchoolStep2Form = z.infer<typeof schoolStep2Schema>
