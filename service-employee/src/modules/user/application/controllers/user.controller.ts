import { Roles } from "@common/decorators/roles.decorator";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import { RolesGuard } from "@common/guards/roles.guard";
import { UserRole } from "@modules/user/domain/entities/user.entity";
import { UserService } from "@modules/user/domain/services/user.service";
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  Version,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateRoleDto } from "../dto/update-role.dto";
import { UpdateStatusDto } from "../dto/update-status.dto";
import { UpdatePasswordDto } from "../dto/update-password.dto";
import { JwtPayload } from "@modules/auth/domain/entities/token.entity";

@ApiTags("Users")
@ApiBearerAuth("access-token")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Version("1")
  @Get()
  @ApiOperation({ summary: "Get all users (ADMIN only)" })
  @ApiResponse({ status: 200, description: "List of users" })
  async findAll() {
    return this.userService.findAll();
  }

  @Version("1")
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create a new user account for an employee (ADMIN only)",
  })
  @ApiResponse({ status: 201, description: "User created successfully" })
  @ApiResponse({ status: 400, description: "Validation error" })
  @ApiResponse({ status: 409, description: "Email already registered" })
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Version("1")
  @Patch(":id/role")
  @ApiOperation({ summary: "Update user role (ADMIN only)" })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "Role updated successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  async updateRole(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.userService.updateRole(id, dto);
  }

  @Version("1")
  @Patch(":id/status")
  @ApiOperation({ summary: "Activate or deactivate user (ADMIN only)" })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "Status updated successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  async updateStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.userService.updateStatus(id, dto);
  }

  /**
   * ADMIN  → bisa update password siapa saja
   * USER   → hanya bisa update password milik dirinya sendiri
   */
  @Version("1")
  @Patch(":id/password")
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: "Update user password (ADMIN: any user, USER: own only)" })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "Password updated successfully" })
  @ApiResponse({ status: 403, description: "Cannot update another user's password" })
  @ApiResponse({ status: 404, description: "User not found" })
  async updatePassword(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdatePasswordDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    if (
      currentUser.role !== UserRole.ADMIN &&
      currentUser.userId !== id
    ) {
      throw new ForbiddenException("You can only update your own password");
    }

    return this.userService.updatePassword(id, dto);
  }
}
