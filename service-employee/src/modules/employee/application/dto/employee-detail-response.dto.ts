import { Employee } from "@modules/employee/domain/entities/employee.entity";
import { UserRole, User } from "@modules/employee/domain/entities/user.entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class EmployeeDetailResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: "EMP-0001" })
  employeeCode: string;

  @ApiProperty({ example: "John Doe" })
  name: string;

  @ApiProperty({ example: "Software Engineer" })
  position: string;

  @ApiPropertyOptional({ example: "08123456789" })
  phone: string | null;

  @ApiPropertyOptional({ example: "2024-01-15" })
  joinDate: Date | null;

  @ApiProperty({ example: "johndoe@example.com" })
  email: string;

  @ApiProperty({ example: UserRole.USER })
  role: UserRole;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromDomain(employee: Employee, user: User): EmployeeDetailResponseDto {
    const dto = new EmployeeDetailResponseDto();
    dto.id = employee.id;
    dto.userId = user.id;
    dto.employeeCode = employee.employeeCode;
    dto.name = employee.name;
    dto.position = employee.position;
    dto.phone = employee.phone;
    dto.joinDate = employee.joinDate;
    dto.email = user.email;
    dto.role = user.role;
    dto.isActive = user.isActive;
    dto.createdAt = employee.createdAt;
    dto.updatedAt = employee.updatedAt;
    return dto;
  }
}
