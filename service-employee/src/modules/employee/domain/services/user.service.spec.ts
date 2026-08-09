import {
  ConflictException,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { UserService } from "./user.service";
import {
  IUserRepository,
  UserRole,
} from "../entities/user.entity";
import { IEmployeeRepository } from "@modules/employee/domain/entities/employee.entity";
import { CreateUserDto } from "@modules/employee/application/dto/create-user.dto";
import { UpdateUserAccessDto } from "@modules/employee/application/dto/update-user-access.dto";
import { UpdateRoleDto } from "@modules/employee/application/dto/update-role.dto";
import { UpdateStatusDto } from "@modules/employee/application/dto/update-status.dto";
import { UpdatePasswordDto } from "@modules/employee/application/dto/update-password.dto";
import { UserResponseDto } from "@modules/employee/application/dto/user-response.dto";

describe("UserService", () => {
  let service: UserService;
  let userRepository: IUserRepository;
  let employeeRepository: IEmployeeRepository;

  const mockUser = {
    id: 1,
    email: "john@example.com",
    password: "hashed-password",
    role: UserRole.USER,
    employeeId: 10,
    isActive: true,
  };

  const mockEmployee = { id: 10, name: "John Doe" };
  const mockUserResponse = { id: 1 } as UserResponseDto;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      findByEmployeeId: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateRole: jest.fn(),
      updateStatus: jest.fn(),
      updatePassword: jest.fn(),
      findAll: jest.fn(),
    } as unknown as IUserRepository;

    employeeRepository = {
      findById: jest.fn(),
    } as unknown as IEmployeeRepository;

    service = new UserService(userRepository, employeeRepository);

    jest.spyOn(Logger.prototype, "log").mockImplementation(() => undefined);
    jest
      .spyOn(UserResponseDto, "fromDomain")
      .mockReturnValue(mockUserResponse);
    jest.spyOn(bcrypt, "hash").mockResolvedValue("hashed-value" as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("create", () => {
    const dto: CreateUserDto = {
      email: "john@example.com",
      password: "plain-password",
    } as CreateUserDto;

    it("should throw ConflictException when the email is already registered", async () => {
      jest.spyOn(userRepository, "findByEmail").mockResolvedValue(mockUser as any);

      await expect(service.create(dto)).rejects.toThrow(
        `Email ${dto.email} is already registered`,
      );
    });

    it("should throw NotFoundException when employeeId is provided but the employee does not exist", async () => {
      jest.spyOn(userRepository, "findByEmail").mockResolvedValue(null);
      jest.spyOn(employeeRepository, "findById").mockResolvedValue(null);

      const dtoWithEmployee = { ...dto, employeeId: 10 } as CreateUserDto;

      await expect(service.create(dtoWithEmployee)).rejects.toThrow(
        "Employee with id 10 not found",
      );
    });

    it("should throw ConflictException when the employee already has a user account", async () => {
      jest.spyOn(userRepository, "findByEmail").mockResolvedValue(null);
      jest
        .spyOn(employeeRepository, "findById")
        .mockResolvedValue(mockEmployee as any);
      jest
        .spyOn(userRepository, "findByEmployeeId")
        .mockResolvedValue(mockUser as any);

      const dtoWithEmployee = { ...dto, employeeId: 10 } as CreateUserDto;

      await expect(service.create(dtoWithEmployee)).rejects.toThrow(
        "Employee 10 already has a user account",
      );
    });

    it("should create a user linked to an employee with the provided role", async () => {
      jest.spyOn(userRepository, "findByEmail").mockResolvedValue(null);
      jest
        .spyOn(employeeRepository, "findById")
        .mockResolvedValue(mockEmployee as any);
      jest.spyOn(userRepository, "findByEmployeeId").mockResolvedValue(null);
      jest.spyOn(userRepository, "create").mockResolvedValue(mockUser as any);

      const dtoWithEmployee = {
        ...dto,
        employeeId: 10,
        role: UserRole.ADMIN,
      } as CreateUserDto;

      const result = await service.create(dtoWithEmployee);

      expect(userRepository.create).toHaveBeenCalledWith({
        email: dto.email,
        password: "hashed-value",
        role: UserRole.ADMIN,
        employeeId: 10,
        isActive: true,
      });
      expect(result).toEqual(mockUserResponse);
    });

    it("should default role to USER and employeeId to null when not provided", async () => {
      jest.spyOn(userRepository, "findByEmail").mockResolvedValue(null);
      jest.spyOn(userRepository, "create").mockResolvedValue(mockUser as any);

      await service.create(dto);

      expect(employeeRepository.findById).not.toHaveBeenCalled();
      expect(userRepository.create).toHaveBeenCalledWith({
        email: dto.email,
        password: "hashed-value",
        role: UserRole.USER,
        employeeId: null,
        isActive: true,
      });
    });
  });

  describe("updateAccess", () => {
    it("should throw NotFoundException when the user does not exist", async () => {
      jest.spyOn(userRepository, "findById").mockResolvedValue(null);

      await expect(
        service.updateAccess(99, {} as UpdateUserAccessDto),
      ).rejects.toThrow("User with id 99 not found");
    });

    it("should update the user's role and active status", async () => {
      jest.spyOn(userRepository, "findById").mockResolvedValue(mockUser as any);
      jest.spyOn(userRepository, "update").mockResolvedValue(mockUser as any);

      const dto = { role: UserRole.ADMIN, isActive: false } as UpdateUserAccessDto;
      const result = await service.updateAccess(1, dto);

      expect(userRepository.update).toHaveBeenCalledWith(1, {
        role: UserRole.ADMIN,
        isActive: false,
      });
      expect(result).toEqual(mockUserResponse);
    });
  });

  describe("updateRole", () => {
    it("should throw NotFoundException when the user does not exist", async () => {
      jest.spyOn(userRepository, "findById").mockResolvedValue(null);

      await expect(
        service.updateRole(99, { role: UserRole.ADMIN } as UpdateRoleDto),
      ).rejects.toThrow("User with id 99 not found");
    });

    it("should update the user's role", async () => {
      jest.spyOn(userRepository, "findById").mockResolvedValue(mockUser as any);
      jest.spyOn(userRepository, "updateRole").mockResolvedValue(mockUser as any);

      const result = await service.updateRole(1, {
        role: UserRole.ADMIN,
      } as UpdateRoleDto);

      expect(userRepository.updateRole).toHaveBeenCalledWith(1, UserRole.ADMIN);
      expect(result).toEqual(mockUserResponse);
    });
  });

  describe("updateStatus", () => {
    it("should throw NotFoundException when the user does not exist", async () => {
      jest.spyOn(userRepository, "findById").mockResolvedValue(null);

      await expect(
        service.updateStatus(99, { isActive: false } as UpdateStatusDto),
      ).rejects.toThrow("User with id 99 not found");
    });

    it("should update the user's active status", async () => {
      jest.spyOn(userRepository, "findById").mockResolvedValue(mockUser as any);
      jest
        .spyOn(userRepository, "updateStatus")
        .mockResolvedValue(mockUser as any);

      const result = await service.updateStatus(1, {
        isActive: false,
      } as UpdateStatusDto);

      expect(userRepository.updateStatus).toHaveBeenCalledWith(1, false);
      expect(result).toEqual(mockUserResponse);
    });
  });

  describe("updatePassword", () => {
    const dto: UpdatePasswordDto = { newPassword: "newSecret123" } as UpdatePasswordDto;

    it("should throw NotFoundException when the user does not exist", async () => {
      jest.spyOn(userRepository, "findById").mockResolvedValue(null);

      await expect(service.updatePassword(99, dto)).rejects.toThrow(
        "User with id 99 not found",
      );
    });

    it("should throw NotAcceptableException when the user is inactive", async () => {
      jest
        .spyOn(userRepository, "findById")
        .mockResolvedValue({ ...mockUser, isActive: false } as any);

      await expect(service.updatePassword(1, dto)).rejects.toThrow(
        "User is inactive",
      );
    });

    it("should hash and update the password when the user is active", async () => {
      jest.spyOn(userRepository, "findById").mockResolvedValue(mockUser as any);
      jest
        .spyOn(userRepository, "updatePassword")
        .mockResolvedValue(mockUser as any);

      const result = await service.updatePassword(1, dto);

      expect(bcrypt.hash).toHaveBeenCalledWith("newSecret123", 12);
      expect(userRepository.updatePassword).toHaveBeenCalledWith(
        1,
        "hashed-value",
      );
      expect(result).toEqual(mockUserResponse);
    });
  });

  describe("findAll", () => {
    it("should return all users mapped to response dtos", async () => {
      jest
        .spyOn(userRepository, "findAll")
        .mockResolvedValue([mockUser] as any);

      const result = await service.findAll();

      expect(UserResponseDto.fromDomain).toHaveBeenCalledWith(
        mockUser,
        0,
        [mockUser],
      );
      expect(result).toEqual([mockUserResponse]);
    });
  });
});