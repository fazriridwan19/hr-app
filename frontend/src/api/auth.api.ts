import { employeeApi } from './axios';
import type {
  LoginRequest,
  LoginResponse,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
  MessageResponse,
} from '@/types/auth.types';

interface BackendResponse<T> {
  meta: { code: number; message: string | null };
  data: T;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await employeeApi.post<BackendResponse<LoginResponse>>('/auth/login', data);
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    await employeeApi.post('/auth/logout');
  },

  refresh: async (): Promise<{ accessToken: string }> => {
    const res = await employeeApi.post<BackendResponse<{ accessToken: string }>>('/auth/refresh');
    return res.data.data;
  },

  requestPasswordReset: async (
    data: RequestPasswordResetRequest,
  ): Promise<MessageResponse> => {
    const res = await employeeApi.post<BackendResponse<MessageResponse>>(
      '/auth/request-password-reset',
      data,
    );
    return res.data.data;
  },

  resetPassword: async (
    token: string,
    data: ResetPasswordRequest,
  ): Promise<MessageResponse> => {
    const res = await employeeApi.post<BackendResponse<MessageResponse>>(
      '/auth/reset-password',
      data,
      { params: { token } },
    );
    return res.data.data;
  },
};
