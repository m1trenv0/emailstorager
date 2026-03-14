import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SetupForm } from '@/components/auth/SetupForm';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function SetupPage() {
  const existingUsers = await prisma.authUser.count();

  if (existingUsers > 0) {
    redirect('/auth/login');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to Email Storage Manager</CardTitle>
        <CardDescription>
          Create your admin account to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SetupForm />
      </CardContent>
    </Card>
  );
}
