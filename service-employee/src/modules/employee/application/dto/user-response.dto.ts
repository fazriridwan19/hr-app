import { UserRole, User } from "@modules/employee/domain/entities/user.entity";

export class UserResponseDto {
  id: number;
  email: string;
  role: UserRole;
  employeeId: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  static fromDomain(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.role = user.role;
    dto.employeeId = user.employeeId;
    dto.isActive = user.isActive;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}
