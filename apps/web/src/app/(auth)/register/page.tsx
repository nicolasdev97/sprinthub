import type { Metadata } from 'next';

import { RegisterForm } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Create Account | SprintHub',
  description: 'Create a new SprintHub account to collaborate on workspaces, projects, and tasks.',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
