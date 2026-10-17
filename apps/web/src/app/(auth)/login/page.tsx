import type { Metadata } from 'next';

import { LoginForm } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Log in | SprintHub',
  description: 'Sign in to your SprintHub account to manage workspaces, projects, and tasks.',
};

interface LoginPageProps {
  searchParams: Promise<{ registered?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const registeredSuccess = resolvedSearchParams.registered === 'true';

  return <LoginForm registeredSuccess={registeredSuccess} />;
}

