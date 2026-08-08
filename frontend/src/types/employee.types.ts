export type UserRole = 'ADMIN' | 'USER';

export interface Employee {
  id: number;
  employeeCode: string;
  name: string;
  position: string;
  phone: string | null;
  joinDate: string | null;
  hasAccount: boolean;
  createdAt: string;
}

export interface EmployeeDetail extends Employee {
  userId: number;
  email: string;
  role: UserRole;
  isActive: boolean;
  updatedAt: string;
}

export interface UserAccount {
  id: number;
  email: string;
  role: UserRole;
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
  role?: UserRole;
}

export interface GetEmployeesParams {
  page?: number;
  limit?: number;
  search?: string;
}
