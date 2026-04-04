import { z } from 'zod'

export const schoolStep1Schema = z.object({
  schoolName:       z.string().min(2, 'School name is required'),
  schoolId:         z.string().min(3, 'School ID is required'),
  advisorName:      z.string().min(2, 'Advisor name is required'),
  advisorNationalId: z.string().length(10, 'National ID must be 10 digits').regex(/^\d+$/, 'Numbers only'),
})

export const schoolStep2Schema = z.object({
  advisorPhone: z
    .string()
    .min(9, 'Phone number is required')
    .regex(/^7\d{8}$/, 'Enter a valid Jordanian number'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export type SchoolStep2Form = z.infer<typeof schoolStep2Schema>
export type SchoolStep1Form = z.infer<typeof schoolStep1Schema>