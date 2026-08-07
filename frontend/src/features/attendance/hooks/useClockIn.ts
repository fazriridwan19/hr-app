import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApiService } from '@/api/attendance.api';

export const useClockIn = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (photo?: File) => attendanceApiService.clockIn(photo),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['attendance', 'me'] });
      void qc.invalidateQueries({ queryKey: ['attendance', 'today'] });
    },
  });
};
