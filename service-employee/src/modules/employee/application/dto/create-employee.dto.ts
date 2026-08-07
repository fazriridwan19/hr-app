import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsDateString,
} from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the employee' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'Software Engineer', description: 'Job position/title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  position: string;

  @ApiPropertyOptional({ example: '08123456789', description: 'Phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: '2024-01-15', description: 'Join date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  joinDate?: string;
}
