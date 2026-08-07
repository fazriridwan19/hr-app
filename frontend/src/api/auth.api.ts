import { employeeApi } from './axios';
import type { LoginRequest, LoginResponse } from '@/types/auth.types';

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
};
