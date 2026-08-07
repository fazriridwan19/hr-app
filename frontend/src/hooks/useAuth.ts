import { useAuthStore } from '@/store/auth.store';

export const useAuth = () => {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  const isAdmin = user?.role === 'ADMIN';

  return { user, accessToken, isAuthenticated, isAdmin, setAuth, clearAuth, setAccessToken };
};
