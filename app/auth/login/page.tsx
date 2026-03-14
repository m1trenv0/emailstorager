import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoginForm } from '@/components/auth/LoginForm';
import { getSession } from '@/lib/auth/actions';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const session = await getSession();

  if (session?.session) {
    redirect('/');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials to access Email Storage Manager
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
