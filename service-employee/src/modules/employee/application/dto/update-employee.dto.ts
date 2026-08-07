import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsDateString } from 'class-validator';

export class UpdateEmployeeDto {
  @ApiPropertyOptional({ example: 'John Doe Updated', description: 'Full name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: 'Senior Engineer', description: 'Job position/title' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  position?: string;

  @ApiPropertyOptional({ example: '08129999999', description: 'Phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: '2024-01-15', description: 'Join date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  joinDate?: string;
}
