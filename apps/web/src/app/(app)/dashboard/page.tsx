import type { Metadata } from 'next';

import { PersonalDashboardView } from '@/features/dashboard';

export const metadata: Metadata = {
  title: 'Dashboard | SprintHub',
  description: 'Your personalized overview, assigned tasks, and active projects.',
};

export default function DashboardPage() {
  return <PersonalDashboardView />;
}
