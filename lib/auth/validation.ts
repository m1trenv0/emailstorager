import { z } from 'zod';

/**
 * Setup request validation schema
 */
export const setupSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(12, 'Password must be at least 12 characters'),
});

/**
 * Login request validation schema
 */
export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export type SetupRequest = z.infer<typeof setupSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
