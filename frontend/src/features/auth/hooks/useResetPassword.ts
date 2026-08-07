import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth.api';
import type { ResetPasswordRequest, MessageResponse } from '@/types/auth.types';

interface ResetPasswordPayload {
  token: string;
  data: ResetPasswordRequest;
}

export const useResetPassword = () => {
  return useMutation<MessageResponse, unknown, ResetPasswordPayload>({
    mutationFn: (payload) => authApi.resetPassword(payload.token, payload.data),
  });
};
