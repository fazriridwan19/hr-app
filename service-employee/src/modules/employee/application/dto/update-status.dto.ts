import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateStatusDto {
  @ApiProperty({ example: true, description: 'User active status' })
  @IsBoolean({ message: 'isActive must be a boolean value' })
  @IsNotEmpty()
  isActive: boolean;
}
