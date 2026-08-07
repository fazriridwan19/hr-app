import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Employee } from '../../domain/entities/employee.entity';

export class EmployeeResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'EMP-0001' })
  employeeCode: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'Software Engineer' })
  position: string;

  @ApiPropertyOptional({ example: '08123456789' })
  phone: string | null;

  @ApiPropertyOptional({ example: '2024-01-15' })
  joinDate: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromDomain(employee: Employee): EmployeeResponseDto {
    const dto = new EmployeeResponseDto();
    dto.id = employee.id;
    dto.employeeCode = employee.employeeCode;
    dto.name = employee.name;
    dto.position = employee.position;
    dto.phone = employee.phone;
    dto.joinDate = employee.joinDate;
    dto.createdAt = employee.createdAt;
    dto.updatedAt = employee.updatedAt;
    return dto;
  }
}

export class PaginatedEmployeeResponseDto {
  @ApiProperty({ type: [EmployeeResponseDto] })
  data: EmployeeResponseDto[];

  @ApiProperty({
    example: { totalData: 100, totalPage: 10, limit: 10, offset: 0 },
  })
  pagination: {
    totalData: number;
    totalPage: number;
    limit: number;
    offset: number;
  };
}
