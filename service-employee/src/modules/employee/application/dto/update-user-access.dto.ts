import { UserRole } from "@modules/employee/domain/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNotEmpty } from "class-validator";

export class UpdateUserAccessDto {
  @ApiProperty({ enum: UserRole, description: "New user role" })
  @IsEnum(UserRole, { message: "Role must be either ADMIN or USER" })
  @IsNotEmpty()
  role: UserRole;

  @ApiProperty({ example: true, description: "User active status" })
  @IsBoolean({ message: "isActive must be a boolean value" })
  @IsNotEmpty()
  isActive: boolean;
}
