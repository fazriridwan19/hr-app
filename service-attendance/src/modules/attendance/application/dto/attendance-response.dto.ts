import {
  Attendance,
  AttendanceStatus,
  AttendanceType,
} from "@modules/attendance/domain/entities/attendance.entity";
import { ApiProperty } from "@nestjs/swagger";

export class AttendanceResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 10 })
  employeeId: number;

  @ApiProperty({ example: "EMP-0001" })
  employeeCode: string;

  @ApiProperty({ example: "John Doe" })
  employeeName: string;

  @ApiProperty({ enum: AttendanceType })
  type: AttendanceType;

  @ApiProperty({
    example: "/uploads/attendance/2024-01-15/10-1705300000000.jpg",
    nullable: true,
  })
  photoUrl: string | null;

  @ApiProperty({ example: "2024-01-15" })
  clockDate: string;

  @ApiProperty({ example: "08:30:00" })
  clockTime: string;

  @ApiProperty({ enum: AttendanceStatus })
  status: AttendanceStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromDomain(attendance: Attendance): AttendanceResponseDto {
    const dto = new AttendanceResponseDto();
    dto.id = attendance.id;
    dto.employeeId = attendance.employeeId;
    dto.employeeCode = attendance.employeeCode;
    dto.employeeName = attendance.employeeName;
    dto.type = attendance.type;
    dto.photoUrl = attendance.photoUrl;
    dto.clockDate =
      attendance.clockDate instanceof Date
        ? attendance.clockDate.toISOString().slice(0, 10)
        : String(attendance.clockDate);
    dto.clockTime = attendance.clockTime;
    dto.status = attendance.status;
    dto.createdAt = attendance.createdAt;
    dto.updatedAt = attendance.updatedAt;
    return dto;
  }
}

export class PaginatedAttendanceResponseDto {
  @ApiProperty({ type: [AttendanceResponseDto] })
  data: AttendanceResponseDto[];

  @ApiProperty({
    example: { totalData: 50, totalPage: 5, limit: 10, offset: 0 },
  })
  pagination: {
    totalData: number;
    totalPage: number;
    limit: number;
    offset: number;
  };
}
