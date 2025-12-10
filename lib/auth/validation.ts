import { z } from 'zod';

/**
 * Setup request validation schema
 */
export const setupSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, underscores, and hyphens'
    ),
  password: z.string().min(12, 'Password must be at least 12 characters'),
});

/**
 * Login request validation schema
 */
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export type SetupRequest = z.infer<typeof setupSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
