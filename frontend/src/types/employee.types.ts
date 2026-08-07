export interface Employee {
  id: number;
  employeeCode: string;
  name: string;
  position: string;
  phone: string | null;
  joinDate: string | null;
  createdAt: string;
}

export interface UserAccount {
  id: number;
  email: string;
  role: 'ADMIN' | 'USER';
  isActive: boolean;
  employeeId: number | null;
}

export interface CreateEmployeeDto {
  name: string;
  position: string;
  phone?: string;
  joinDate?: string;
}

export interface UpdateEmployeeDto {
  name?: string;
  position?: string;
  phone?: string;
  joinDate?: string;
}

export interface CreateUserAccountDto {
  email: string;
  password: string;
  employeeId: number;
  role?: 'ADMIN' | 'USER';
}

export interface GetEmployeesParams {
  page?: number;
  limit?: number;
  search?: string;
}
