import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { authApi } from '@/api/auth.api';
import { useAuth } from '@/hooks/useAuth';
import { queryClient } from '@/lib/queryClient';
import type { LoginRequest, LoginResponse } from '@/types/auth.types';
import { getErrorMessage } from '@/lib/utils';

export const useLogin = () => {
  const { setAuth } = useAuth();
  const router = useRouter();

  return useMutation<LoginResponse, unknown, LoginRequest>({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (res) => {
      void queryClient.removeQueries({ queryKey: ['attendance'] });
      setAuth(res.user, res.accessToken);
      void router.navigate({ to: '/attendance' });
    },
    onError: (error) => {
      console.error('Login failed:', getErrorMessage(error));
    },
  });
};
