import { z } from 'zod'

export const addStudentSchema = z.object({
  fullName:   z.string().min(2, 'Full name is required'),
  nationalId: z.string().length(10, 'Must be 10 digits').regex(/^\d+$/, 'Numbers only'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  difficulty: z.enum(['ADD', 'ADHD', 'IFD']).describe('Please select a difficulty'),
  gender: z.enum(['male', 'female']).describe('Please select a gender'),
})

export type AddStudentForm = z.infer<typeof addStudentSchema>