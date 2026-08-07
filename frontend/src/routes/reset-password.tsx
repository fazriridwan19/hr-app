import { createFileRoute, redirect } from '@tanstack/react-router';
import { lazy } from 'react';
import { useAuthStore } from '@/store/auth.store';

const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));

export const Route = createFileRoute('/reset-password')({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      throw redirect({ to: '/attendance' });
    }
  },
  component: ResetPasswordPage,
});
