import { JwtPayload } from "@modules/auth/domain/entities/token.entity";
import { UpdateUserAccessDto } from "@modules/employee/application/dto/update-user-access.dto";
import { UserRole } from "@modules/employee/domain/entities/user.entity";
import { UserService } from "@modules/employee/domain/services/user.service";
import { ForbiddenException } from "@nestjs/common";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdatePasswordDto } from "../dto/update-password.dto";
import { UpdateRoleDto } from "../dto/update-role.dto";
import { UpdateStatusDto } from "../dto/update-status.dto";
import { UserController } from "./user.controller";

describe("UserController", () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserList = [{ id: 1, email: "john@example.com" }] as any[];
  const mockUserResult = { id: 1, email: "john@example.com" } as any;

  beforeEach(() => {
    userService = {
      findAll: jest.fn(),
      create: jest.fn(),
      updateAccess: jest.fn(),
      updateRole: jest.fn(),
      updateStatus: jest.fn(),
      updatePassword: jest.fn(),
    } as unknown as UserService;

    controller = new UserController(userService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return the list of users", async () => {
      jest.spyOn(userService, "findAll").mockResolvedValue(mockUserList);

      const result = await controller.findAll();

      expect(userService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUserList);
    });
  });

  describe("create", () => {
    it("should create a new user account", async () => {
      const dto = {
        employeeId: 1,
        email: "john@example.com",
        password: "secret123",
      } as CreateUserDto;
      jest.spyOn(userService, "create").mockResolvedValue(mockUserResult);

      const result = await controller.create(dto);

      expect(userService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockUserResult);
    });
  });

  describe("updateAccess", () => {
    it("should update user access", async () => {
      const dto = { role: UserRole.ADMIN } as UpdateUserAccessDto;
      jest.spyOn(userService, "updateAccess").mockResolvedValue(mockUserResult);

      const result = await controller.updateAccess(1, dto);

      expect(userService.updateAccess).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(mockUserResult);
    });
  });

  describe("updateRole", () => {
    it("should update user role", async () => {
      const dto = { role: UserRole.ADMIN } as UpdateRoleDto;
      jest.spyOn(userService, "updateRole").mockResolvedValue(mockUserResult);

      const result = await controller.updateRole(1, dto);

      expect(userService.updateRole).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(mockUserResult);
    });
  });

  describe("updateStatus", () => {
    it("should update user status", async () => {
      const dto = { isActive: false } as UpdateStatusDto;
      jest.spyOn(userService, "updateStatus").mockResolvedValue(mockUserResult);

      const result = await controller.updateStatus(1, dto);

      expect(userService.updateStatus).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(mockUserResult);
    });
  });

  describe("updatePassword", () => {
    const dto = { newPassword: "newSecret123" } as UpdatePasswordDto;

    it("should allow an ADMIN to update another user's password", async () => {
      const currentUser = { userId: 99, role: UserRole.ADMIN } as JwtPayload;
      jest
        .spyOn(userService, "updatePassword")
        .mockResolvedValue(mockUserResult);

      const result = await controller.updatePassword(1, dto, currentUser);

      expect(userService.updatePassword).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(mockUserResult);
    });

    it("should allow a USER to update their own password", async () => {
      const currentUser = { userId: 1, role: UserRole.USER } as JwtPayload;
      jest
        .spyOn(userService, "updatePassword")
        .mockResolvedValue(mockUserResult);

      const result = await controller.updatePassword(1, dto, currentUser);

      expect(userService.updatePassword).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(mockUserResult);
    });

    it("should throw ForbiddenException when a USER tries to update another user's password", async () => {
      const currentUser = { userId: 2, role: UserRole.USER } as JwtPayload;

      await expect(
        controller.updatePassword(1, dto, currentUser),
      ).rejects.toThrow(ForbiddenException);
      expect(userService.updatePassword).not.toHaveBeenCalled();
    });
  });
});
