import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApiService } from '@/api/attendance.api';

interface ClockMutationPayload {
  photo?: File;
  notes?: string;
}

export const useClockOut = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ClockMutationPayload) =>
      attendanceApiService.clockOut(payload.photo, payload.notes),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['attendance', 'me'] });
      void qc.invalidateQueries({ queryKey: ['attendance', 'today'] });
    },
  });
};
