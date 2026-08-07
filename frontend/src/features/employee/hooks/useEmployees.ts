import { useQuery } from '@tanstack/react-query';
import { employeeApiService } from '@/api/employee.api';
import type { GetEmployeesParams } from '@/types/employee.types';

export const useEmployees = (params: GetEmployeesParams) =>
  useQuery({
    queryKey: ['employees', params],
    queryFn: () => employeeApiService.getEmployees(params),
  });
