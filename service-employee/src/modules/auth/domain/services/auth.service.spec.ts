import {
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { AuthService } from "./auth.service";
import { EmailService } from "@modules/auth/infrastructure/email/email.service";
import { IEmployeeRepository } from "@modules/employee/domain/entities/employee.entity";
import { IUserRepository } from "@modules/employee/domain/entities/user.entity";
import { LoginDto } from "@modules/auth/application/dto/login.dto";
import { UpdatePasswordDto } from "@modules/employee/application/dto/update-password.dto";

jest.mock("uuid", () => ({
  v4: jest.fn(),
}));

describe("AuthService", () => {
  let service: AuthService;
  let userRepository: IUserRepository;
  let employeeRepository: IEmployeeRepository;
  let jwtService: JwtService;
  let configService: ConfigService;
  let emailService: EmailService;

  const mockUser = {
    id: 1,
    email: "john@example.com",
    password: "hashed-password",
    isActive: true,
    employeeId: 10,
    role: "EMPLOYEE",
  };

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      updatePassword: jest.fn(),
    } as unknown as IUserRepository;

    employeeRepository = {
      findById: jest.fn(),
    } as unknown as IEmployeeRepository;

    jwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    } as unknown as JwtService;

    configService = {
      get: jest.fn((_key: string, defaultValue?: unknown) => defaultValue),
    } as unknown as ConfigService;

    emailService = {
      sendPasswordReset: jest.fn(),
    } as unknown as EmailService;

    service = new AuthService(
      userRepository,
      employeeRepository,
      jwtService,
      configService,
      emailService,
    );

    jest.spyOn(Logger.prototype, "log").mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, "warn").mockImplementation(() => undefined);
    (uuidv4 as jest.Mock).mockReturnValue("generated-uuid");
    jest
      .spyOn(jwtService, "sign")
      .mockReturnValueOnce("access-token")
      .mockReturnValueOnce("refresh-token");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("login", () => {
    const loginDto: LoginDto = {
      email: "john@example.com",
      password: "plain-password",
    } as LoginDto;

    it("should throw UnauthorizedException when user is not found", async () => {
      jest.spyOn(userRepository, "findByEmail").mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        "Invalid email or password",
      );
    });

    it("should throw UnauthorizedException when the account is deactivated", async () => {
      jest
        .spyOn(userRepository, "findByEmail")
        .mockResolvedValue({ ...mockUser, isActive: false } as any);

      await expect(service.login(loginDto)).rejects.toThrow(
        "Your account has been deactivated",
      );
    });

    it("should throw UnauthorizedException when the password is invalid", async () => {
      jest
        .spyOn(userRepository, "findByEmail")
        .mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow(
        "Invalid email or password",
      );
    });

    it("should use the employee's name when employeeId exists and employee is found", async () => {
      jest
        .spyOn(userRepository, "findByEmail")
        .mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true as never);
      jest
        .spyOn(employeeRepository, "findById")
        .mockResolvedValue({ id: 10, name: "Jane Employee" } as any);

      const result = await service.login(loginDto);

      expect(employeeRepository.findById).toHaveBeenCalledWith(10);
      expect(result.loginResponse.user.name).toBe("Jane Employee");
      expect(result.loginResponse.accessToken).toBe("access-token");
      expect(result.refreshToken).toBe("refresh-token");
    });

    it("should fall back to the email prefix when employeeId exists but employee is not found", async () => {
      jest
        .spyOn(userRepository, "findByEmail")
        .mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true as never);
      jest.spyOn(employeeRepository, "findById").mockResolvedValue(null);

      const result = await service.login(loginDto);

      expect(result.loginResponse.user.name).toBe("john");
    });

    it("should fall back to the email prefix when employeeId is not set", async () => {
      jest
        .spyOn(userRepository, "findByEmail")
        .mockResolvedValue({ ...mockUser, employeeId: undefined } as any);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true as never);

      const result = await service.login(loginDto);

      expect(employeeRepository.findById).not.toHaveBeenCalled();
      expect(result.loginResponse.user.name).toBe("john");
    });
  });

  describe("refresh", () => {
    it("should throw UnauthorizedException when the token cannot be verified", async () => {
      jest.spyOn(jwtService, "verify").mockImplementation(() => {
        throw new Error("jwt malformed");
      });

      await expect(service.refresh("bad-token")).rejects.toThrow(
        "Invalid or expired refresh token",
      );
    });

    it("should throw UnauthorizedException when the token type is not 'refresh'", async () => {
      jest.spyOn(jwtService, "verify").mockReturnValue({
        userId: 1,
        type: "access",
        jti: "jti-1",
      } as any);

      await expect(service.refresh("token")).rejects.toThrow(
        "Invalid token type",
      );
    });

    it("should throw UnauthorizedException when the user is not found", async () => {
      jest.spyOn(jwtService, "verify").mockReturnValue({
        userId: 1,
        type: "refresh",
        jti: "jti-1",
      } as any);
      jest.spyOn(userRepository, "findById").mockResolvedValue(null);

      await expect(service.refresh("token")).rejects.toThrow(
        "User not found or inactive",
      );
    });

    it("should throw UnauthorizedException when the user is inactive", async () => {
      jest.spyOn(jwtService, "verify").mockReturnValue({
        userId: 1,
        type: "refresh",
        jti: "jti-1",
      } as any);
      jest
        .spyOn(userRepository, "findById")
        .mockResolvedValue({ ...mockUser, isActive: false } as any);

      await expect(service.refresh("token")).rejects.toThrow(
        "User not found or inactive",
      );
    });

    it("should issue new tokens on success", async () => {
      jest.spyOn(jwtService, "verify").mockReturnValue({
        userId: 1,
        employeeId: 10,
        role: "EMPLOYEE",
        name: "John Doe",
        type: "refresh",
        jti: "old-jti",
      } as any);
      jest.spyOn(userRepository, "findById").mockResolvedValue(mockUser as any);

      const result = await service.refresh("valid-token");

      expect(result).toEqual({
        accessToken: "access-token",
        newRefreshToken: "refresh-token",
        newJti: "generated-uuid",
        oldJti: "old-jti",
        userId: 1,
      });
    });
  });

  describe("requestReset", () => {
    it("should do nothing and log a warning when the user is not found", async () => {
      jest.spyOn(userRepository, "findByEmail").mockResolvedValue(null);

      await service.requestReset("missing@example.com");

      expect(Logger.prototype.warn).toHaveBeenCalled();
      expect(emailService.sendPasswordReset).not.toHaveBeenCalled();
    });

    it("should do nothing and log a warning when the user is inactive", async () => {
      jest
        .spyOn(userRepository, "findByEmail")
        .mockResolvedValue({ ...mockUser, isActive: false } as any);

      await service.requestReset(mockUser.email);

      expect(Logger.prototype.warn).toHaveBeenCalled();
      expect(emailService.sendPasswordReset).not.toHaveBeenCalled();
    });

    it("should generate a reset token and send the reset email", async () => {
      jest
        .spyOn(userRepository, "findByEmail")
        .mockResolvedValue(mockUser as any);
      jest.spyOn(jwtService, "sign").mockReset().mockReturnValue("reset-jwt");

      await service.requestReset(mockUser.email);

      expect(emailService.sendPasswordReset).toHaveBeenCalledWith(
        mockUser.email,
        expect.stringContaining("http://localhost:5173/reset-password?token="),
      );
    });
  });

  describe("resetPassword", () => {
    const dto: UpdatePasswordDto = {
      newPassword: "newSecret123",
    } as UpdatePasswordDto;

    it("should throw NotFoundException when the token cannot be verified", async () => {
      jest.spyOn(jwtService, "verify").mockImplementation(() => {
        throw new Error("jwt malformed");
      });

      await expect(service.resetPassword("bad-token", dto)).rejects.toThrow(
        "Invalid or expired password reset token",
      );
    });

    it("should throw NotFoundException when the token purpose is wrong", async () => {
      jest.spyOn(jwtService, "verify").mockReturnValue({
        userId: 1,
        email: mockUser.email,
        purpose: "something-else",
      } as any);

      await expect(service.resetPassword("token", dto)).rejects.toThrow(
        "Invalid password reset token",
      );
    });

    it("should throw NotFoundException when the user is not found", async () => {
      jest.spyOn(jwtService, "verify").mockReturnValue({
        userId: 1,
        email: mockUser.email,
        purpose: "password-reset",
      } as any);
      jest.spyOn(userRepository, "findById").mockResolvedValue(null);

      await expect(service.resetPassword("token", dto)).rejects.toThrow(
        "User not found or inactive",
      );
    });

    it("should throw NotFoundException when the user is inactive", async () => {
      jest.spyOn(jwtService, "verify").mockReturnValue({
        userId: 1,
        email: mockUser.email,
        purpose: "password-reset",
      } as any);
      jest
        .spyOn(userRepository, "findById")
        .mockResolvedValue({ ...mockUser, isActive: false } as any);

      await expect(service.resetPassword("token", dto)).rejects.toThrow(
        "User not found or inactive",
      );
    });

    it("should hash the new password and update the user on success", async () => {
      jest.spyOn(jwtService, "verify").mockReturnValue({
        userId: 1,
        email: mockUser.email,
        purpose: "password-reset",
      } as any);
      jest.spyOn(userRepository, "findById").mockResolvedValue(mockUser as any);
      jest
        .spyOn(bcrypt, "hash")
        .mockResolvedValue("hashed-new-password" as never);

      await service.resetPassword("token", dto);

      expect(bcrypt.hash).toHaveBeenCalledWith("newSecret123", 12);
      expect(userRepository.updatePassword).toHaveBeenCalledWith(
        mockUser.id,
        "hashed-new-password",
      );
    });
  });
});
