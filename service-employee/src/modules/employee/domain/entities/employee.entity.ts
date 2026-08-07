export class Employee {
  id: number;
  employeeCode: string;
  name: string;
  position: string;
  phone: string | null;
  joinDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(partial: Partial<Employee>) {
    Object.assign(this, partial);
  }

  static generateCode(sequence: number): string {
    const padded = String(sequence).padStart(4, '0');
    return `EMP-${padded}`;
  }

  isDeleted(): boolean {
    return this.deletedAt !== null && this.deletedAt !== undefined;
  }
}

export interface FindEmployeesOptions {
  page: number;
  limit: number;
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const EMPLOYEE_REPOSITORY = Symbol('EMPLOYEE_REPOSITORY');

export interface IEmployeeRepository {
  findAll(options: FindEmployeesOptions): Promise<PaginatedResult<Employee>>;
  findById(id: number): Promise<Employee | null>;
  findByEmployeeCode(code: string): Promise<Employee | null>;
  countAll(): Promise<number>;
  create(employee: Partial<Employee>): Promise<Employee>;
  update(id: number, employee: Partial<Employee>): Promise<Employee>;
  softDelete(id: number): Promise<void>;
  restore(id: number): Promise<void>;
}
