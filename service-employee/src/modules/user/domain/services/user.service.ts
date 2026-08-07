import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  Logger,
  NotAcceptableException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import {
  EMPLOYEE_REPOSITORY,
  IEmployeeRepository,
} from "@modules/employee/domain/entities/employee.entity";
import { CreateUserDto } from "@modules/user/application/dto/create-user.dto";
import { UpdateRoleDto } from "@modules/user/application/dto/update-role.dto";
import { UpdateStatusDto } from "@modules/user/application/dto/update-status.dto";
import {
  UserRole,
  User,
  USER_REPOSITORY,
  IUserRepository,
} from "../entities/user.entity";
import { UpdatePasswordDto } from "@modules/user/application/dto/update-password.dto";

export class UserResponseDto {
  id: number;
  email: string;
  role: UserRole;
  employeeId: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  static fromDomain(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.role = user.role;
    dto.employeeId = user.employeeId;
    dto.isActive = user.isActive;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly SALT_ROUNDS = 12;

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: IEmployeeRepository,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(`Email ${dto.email} is already registered`);
    }

    if (dto.employeeId) {
      const employee = await this.employeeRepository.findById(dto.employeeId);
      if (!employee) {
        throw new NotFoundException(
          `Employee with id ${dto.employeeId} not found`,
        );
      }

      const existingUserForEmployee =
        await this.userRepository.findByEmployeeId(dto.employeeId);
      if (existingUserForEmployee) {
        throw new ConflictException(
          `Employee ${dto.employeeId} already has a user account`,
        );
      }
    }

    const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    const user = await this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      role: dto.role ?? UserRole.USER,
      employeeId: dto.employeeId ?? null,
      isActive: true,
    });

    this.logger.log(`Created user: ${user.email} with role: ${user.role}`);
    return UserResponseDto.fromDomain(user);
  }

  async updateRole(id: number, dto: UpdateRoleDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const updated = await this.userRepository.updateRole(id, dto.role);
    this.logger.log(`Updated role for user ${id} to ${dto.role}`);
    return UserResponseDto.fromDomain(updated);
  }

  async updateStatus(
    id: number,
    dto: UpdateStatusDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const updated = await this.userRepository.updateStatus(id, dto.isActive);
    this.logger.log(`Updated status for user ${id} to ${dto.isActive}`);
    return UserResponseDto.fromDomain(updated);
  }

  async updatePassword(
    id: number,
    dto: UpdatePasswordDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const { oldPassword, newPassword } = dto;
    if (oldPassword === newPassword) {
      throw new NotAcceptableException(
        `New password cannot be same as old password`,
      );
    }
    if (!user.isActive) {
      throw new NotAcceptableException(`User is inactive`);
    }
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new NotAcceptableException(`Old password is invalid`);
    }
    const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
    const updated = await this.userRepository.updatePassword(
      id,
      hashedPassword,
    );
    this.logger.log(`Updated password for user ${id}`);
    return UserResponseDto.fromDomain(updated);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    return users.map(UserResponseDto.fromDomain);
  }
}
