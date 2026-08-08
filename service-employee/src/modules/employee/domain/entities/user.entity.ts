export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export class User {
  id: number;
  email: string;
  password: string;
  role: UserRole;
  employeeId: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }
}

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");

export interface IUserRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByEmployeeId(employeeId: number): Promise<User | null>;
  findByEmployeeIds(employeeIds: number[]): Promise<User[]>;
  create(user: Partial<User>): Promise<User>;
  update(id: number, user: Partial<User>): Promise<User>;
  updateRole(id: number, role: UserRole): Promise<User>;
  updateStatus(id: number, isActive: boolean): Promise<User>;
  updatePassword(id: number, password: string): Promise<User>;
  findAll(): Promise<User[]>;
}
