'use server';

import { redirect } from 'next/navigation';
import { auth, getServerHeaders } from '@/lib/auth/betterAuth';
import { loginSchema, setupSchema } from '@/lib/auth/validation';
import { validatePasswordStrength } from '@/lib/auth/password';
import { prisma } from '@/lib/prisma';

type ActionState = {
  success: boolean;
  error?: string;
};

export async function setupAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = setupSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });
  const confirmPassword = formData.get('confirmPassword');

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  if (parsed.data.password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match' };
  }

  const existingUsers = await prisma.authUser.count();
  if (existingUsers > 0) {
    return { success: false, error: 'Setup has already been completed.' };
  }

  const { password, email, name } = parsed.data;
  const strength = validatePasswordStrength(password);
  if (!strength.valid) {
    const [reason] = strength.errors;
    return { success: false, error: reason ?? 'Password is too weak' };
  }

  try {
    await auth.api.signUpEmail({
      body: { email, password, name, rememberMe: true },
      headers: getServerHeaders(),
      context: { skipCSRFCheck: true },
    });
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create account';
    return { success: false, error: message };
  }
}

export async function loginAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    rememberMe: formData.get('rememberMe') === 'on',
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  try {
    await auth.api.signInEmail({
      body: parsed.data,
      headers: getServerHeaders(),
      context: { skipCSRFCheck: true },
    });
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to log in right now';
    return { success: false, error: message };
  }
}

export async function logoutAction() {
  try {
    await auth.api.signOut({
      headers: getServerHeaders(),
    });
  } finally {
    redirect('/auth/login');
  }
}

export async function getSession() {
  try {
    return await auth.api.getSession({
      headers: getServerHeaders(),
      context: { skipCSRFCheck: true },
    });
  } catch {
    return null;
  }
}
