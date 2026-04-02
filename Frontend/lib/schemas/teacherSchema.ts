import { z } from 'zod'

export const addTeacherSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  nationalId: z.string().length(10, 'National ID must be 10 digits').regex(/^\d+$/, 'Numbers only'),
  phone: z.string().min(9, 'Phone is required').regex(/^7\d{8}$/, 'Enter a valid Jordanian number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export type AddTeacherForm = z.infer<typeof addTeacherSchema>
