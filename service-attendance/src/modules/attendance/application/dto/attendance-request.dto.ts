import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class AttendanceRequestDto {
  @ApiPropertyOptional({
    type: "string",
    description: "Optional notes for the attendance record",
    example: "Arrived late due to traffic",
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  notes?: string;
}
