import { z } from 'zod';

// Password must have ≥8 chars, uppercase, lowercase, digit
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one digit');

export const loginSchema = z.object({
  email: z.string().email('Invalid email').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required').max(128),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email').trim().toLowerCase(),
  password: passwordSchema,
});

export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email').trim().toLowerCase(),
  password: passwordSchema,
  role: z.enum(['student', 'teacher'], { message: 'Role must be student or teacher' }),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().email('Invalid email').trim().toLowerCase().optional(),
  role: z.enum(['student', 'teacher']).optional(),
  isActive: z.boolean().optional(),
});
