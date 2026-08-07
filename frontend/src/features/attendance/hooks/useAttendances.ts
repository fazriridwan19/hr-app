import { useQuery } from '@tanstack/react-query';
import { attendanceApiService } from '@/api/attendance.api';
import type { GetMyAttendancesParams, GetAllAttendancesParams } from '@/types/attendance.types';

export const useMyAttendances = (params: GetMyAttendancesParams) =>
  useQuery({
    queryKey: ['attendance', 'me', params],
    queryFn: () => attendanceApiService.getMyAttendances(params),
  });

export const useAllAttendances = (params: GetAllAttendancesParams) =>
  useQuery({
    queryKey: ['attendance', 'all', params],
    queryFn: () => attendanceApiService.getAllAttendances(params),
  });
