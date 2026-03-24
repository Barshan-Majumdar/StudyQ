import { z } from 'zod';

export const RegisterSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role:     z.enum(['student', 'teacher', 'admin']).default('student'),
});

export const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export const CreateUserSchema = z.object({
  name:     z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email:    z.string().email('Invalid email').trim().toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role:     z.enum(['student', 'teacher'], { message: 'Role must be student or teacher' }),
});

export const UpdateUserSchema = z.object({
  name:     z.string().min(2).optional(),
  email:    z.string().email().optional(),
  role:     z.enum(['student', 'teacher', 'admin']).optional(),
  isActive: z.boolean().optional(),
});

export type RegisterDto   = z.infer<typeof RegisterSchema>;
export type LoginDto      = z.infer<typeof LoginSchema>;
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
