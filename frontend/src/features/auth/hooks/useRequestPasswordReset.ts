import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth.api';
import type { RequestPasswordResetRequest, MessageResponse } from '@/types/auth.types';

export const useRequestPasswordReset = () => {
  return useMutation<MessageResponse, unknown, RequestPasswordResetRequest>({
    mutationFn: (data) => authApi.requestPasswordReset(data),
  });
};
