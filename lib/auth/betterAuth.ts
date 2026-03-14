import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { cookies, headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

const authSecret =
  process.env.BETTER_AUTH_SECRET ??
  'development-secret-please-set-BETTER_AUTH_SECRET';

export const auth = betterAuth({
  appName: 'emailstorager',
  secret: authSecret,
  database: prismaAdapter(prisma, { provider: 'mongodb' }),
  plugins: [nextCookies()],
  user: { modelName: 'AuthUser' },
  account: { modelName: 'AuthAccount' },
  session: { modelName: 'AuthSession' },
  verification: { modelName: 'AuthVerification' },
  rateLimit: { modelName: 'AuthRateLimit', storage: 'database' },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    autoSignIn: true,
  },
});

export const getServerHeaders = () => {
  const headerList = headers();
  return Object.fromEntries(headerList.entries());
};

export const getServerCookies = async () => {
  try {
    const store = await cookies();
    return Object.fromEntries(store.getAll().map((cookie) => [cookie.name, cookie.value]));
  } catch {
    return {};
  }
};
