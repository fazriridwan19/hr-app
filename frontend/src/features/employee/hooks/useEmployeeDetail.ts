import { useQuery } from '@tanstack/react-query';
import { employeeApiService } from '@/api/employee.api';

export const useEmployeeDetail = (employeeId: number | null, enabled = true) =>
  useQuery({
    queryKey: ['employee-detail', employeeId],
    queryFn: () => {
      if (employeeId === null) {
        throw new Error('Employee ID is required');
      }

      return employeeApiService.getEmployeeById(employeeId);
    },
    enabled: enabled && employeeId !== null,
    staleTime: 30_000,
  });
