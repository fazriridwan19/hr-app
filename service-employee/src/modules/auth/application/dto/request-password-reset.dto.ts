import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestPasswordResetDto {
  @ApiProperty({ example: 'john@example.com', description: 'Email account for password reset' })
  @IsEmail({}, { message: 'Email must be valid' })
  @IsNotEmpty()
  email: string;
}
