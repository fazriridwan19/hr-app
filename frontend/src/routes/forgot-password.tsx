import { createFileRoute, redirect } from '@tanstack/react-router';
import { lazy } from 'react';
import { useAuthStore } from '@/store/auth.store';

const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));

export const Route = createFileRoute('/forgot-password')({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      throw redirect({ to: '/attendance' });
    }
  },
  component: ForgotPasswordPage,
});
