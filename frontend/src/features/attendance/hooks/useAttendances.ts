import { useQuery } from '@tanstack/react-query';
import { attendanceApiService } from '@/api/attendance.api';
import { useAuth } from '@/hooks/useAuth';
import type { GetMyAttendancesParams, GetAllAttendancesParams } from '@/types/attendance.types';

export const useMyAttendances = (params: GetMyAttendancesParams) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['attendance', 'me', user?.userId ?? 'anonymous', params],
    queryFn: () => attendanceApiService.getMyAttendances(params),
    enabled: !!user?.userId,
  });
};

export const useAllAttendances = (params: GetAllAttendancesParams) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['attendance', 'all', user?.userId ?? 'anonymous', params],
    queryFn: () => attendanceApiService.getAllAttendances(params),
    enabled: !!user?.userId,
  });
};
