import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../../domain/entities/user.entity';

export class UpdateRoleDto {
  @ApiProperty({ enum: UserRole, description: 'New user role' })
  @IsEnum(UserRole, { message: 'Role must be either ADMIN or USER' })
  @IsNotEmpty()
  role: UserRole;
}
