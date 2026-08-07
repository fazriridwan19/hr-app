import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'Token type', example: 'Bearer' })
  tokenType: string;

  @ApiProperty({ description: 'Access token expiration in seconds', example: 900 })
  expiresIn: number;

  @ApiProperty({
    description: 'Logged in user info',
    example: {
      userId: 1,
      email: 'admin@example.com',
      role: 'ADMIN',
      name: 'Admin User',
    },
  })
  user: {
    userId: number;
    email: string;
    role: string;
    name: string;
    employeeId: number | null;
  };
}
