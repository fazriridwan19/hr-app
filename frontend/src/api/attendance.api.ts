import { attendanceApi } from './axios';
import type {
  Attendance,
  PaginatedResponse,
  PaginatedMeta,
  GetMyAttendancesParams,
  GetAllAttendancesParams,
} from '@/types/attendance.types';

interface BackendResponse<T> {
  meta: { code: number; message: string | null };
  data: T;
}

interface BackendPaginatedResponse<T> {
  meta: PaginatedMeta;
  data: T[];
}

export const attendanceApiService = {
  clockIn: async (photo?: File, notes?: string): Promise<Attendance> => {
    const formData = new FormData();
    if (photo) formData.append('photo', photo);
    if (notes) formData.append('notes', notes);
    const res = await attendanceApi.post<BackendResponse<Attendance>>(
      '/attendance/clock-in',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return res.data.data;
  },

  clockOut: async (photo?: File, notes?: string): Promise<Attendance> => {
    const formData = new FormData();
    if (photo) formData.append('photo', photo);
    if (notes) formData.append('notes', notes);
    const res = await attendanceApi.post<BackendResponse<Attendance>>(
      '/attendance/clock-out',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return res.data.data;
  },

  getMyAttendances: async (
    params: GetMyAttendancesParams,
  ): Promise<PaginatedResponse<Attendance>> => {
    const res = await attendanceApi.get<BackendPaginatedResponse<Attendance>>(
      '/attendance/me',
      { params },
    );
    return { data: res.data.data, meta: res.data.meta };
  },

  getAllAttendances: async (
    params: GetAllAttendancesParams,
  ): Promise<PaginatedResponse<Attendance>> => {
    const res = await attendanceApi.get<BackendPaginatedResponse<Attendance>>(
      '/attendance',
      { params },
    );
    return { data: res.data.data, meta: res.data.meta };
  },

  getAttendanceById: async (id: number): Promise<Attendance> => {
    const res = await attendanceApi.get<BackendResponse<Attendance>>(`/attendance/${id}`);
    return res.data.data;
  },
};
