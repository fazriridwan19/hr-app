import { UnauthorizedException } from "@nestjs/common";
import { Request, Response } from "express";
import { LoginResponseDto } from "../dto/login-response.dto";
import { LoginDto } from "../dto/login.dto";
import { AuthController } from "./auth.controller";
import { AuthService } from "@modules/auth/domain/services/auth.service";
import { RequestPasswordResetDto } from "@modules/auth/application/dto/request-password-reset.dto";
import { ResetPasswordDto } from "@modules/auth/application/dto/reset-password.dto";
import { JwtPayload } from "@modules/auth/domain/entities/token.entity";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: AuthService;
  let mockResponse: Response;
  const originalAppEnv = process.env.APP_ENV;

  const mockUser: JwtPayload = {
    employeeId: 1,
    name: "John Doe",
    role: "EMPLOYEE",
  } as JwtPayload;

  const mockLoginResponse = { accessToken: "access-token" } as LoginResponseDto;

  beforeEach(() => {
    authService = {
      login: jest.fn(),
      refresh: jest.fn(),
      requestReset: jest.fn(),
      resetPassword: jest.fn(),
    } as unknown as AuthService;

    mockResponse = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    } as unknown as Response;

    controller = new AuthController(authService);
  });

  afterEach(() => {
    process.env.APP_ENV = originalAppEnv;
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("should login and set a non-secure cookie when not in production", async () => {
      process.env.APP_ENV = "development";
      const loginDto = { email: "a@b.com", password: "secret" } as LoginDto;
      jest.spyOn(authService, "login").mockResolvedValue({
        loginResponse: mockLoginResponse,
        refreshToken: "refresh-token-value",
      });

      const result = await controller.login(loginDto, mockResponse);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        "refresh_token",
        "refresh-token-value",
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/api/v1/auth",
        }),
      );
      expect(result).toEqual(mockLoginResponse);
    });

    it("should set a secure cookie when in production", async () => {
      process.env.APP_ENV = "production";
      const loginDto = { email: "a@b.com", password: "secret" } as LoginDto;
      jest.spyOn(authService, "login").mockResolvedValue({
        loginResponse: mockLoginResponse,
        refreshToken: "refresh-token-value",
      });

      await controller.login(loginDto, mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        "refresh_token",
        "refresh-token-value",
        expect.objectContaining({ secure: true }),
      );
    });
  });

  describe("refresh", () => {
    it("should throw UnauthorizedException when the refresh token cookie is missing entirely", async () => {
      const mockRequest = {} as Request;

      await expect(
        controller.refresh(mockRequest, mockResponse),
      ).rejects.toThrow(UnauthorizedException);
      expect(authService.refresh).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedException when the refresh token cookie is not present", async () => {
      const mockRequest = { cookies: {} } as unknown as Request;

      await expect(
        controller.refresh(mockRequest, mockResponse),
      ).rejects.toThrow("Refresh token not found");
      expect(authService.refresh).not.toHaveBeenCalled();
    });

    it("should refresh the token and set a non-secure cookie when not in production", async () => {
      process.env.APP_ENV = "development";
      const mockRequest = {
        cookies: { refresh_token: "old-refresh-token" },
      } as unknown as Request;
      jest.spyOn(authService, "refresh").mockResolvedValue({
        accessToken: "new-access-token",
        newRefreshToken: "new-refresh-token",
      } as any);

      const result = await controller.refresh(mockRequest, mockResponse);

      expect(authService.refresh).toHaveBeenCalledWith("old-refresh-token");
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        "refresh_token",
        "new-refresh-token",
        expect.objectContaining({ secure: false }),
      );
      expect(result).toEqual({
        accessToken: "new-access-token",
        tokenType: "Bearer",
        expiresIn: 900,
      });
    });

    it("should set a secure cookie when in production", async () => {
      process.env.APP_ENV = "production";
      const mockRequest = {
        cookies: { refresh_token: "old-refresh-token" },
      } as unknown as Request;
      jest.spyOn(authService, "refresh").mockResolvedValue({
        accessToken: "new-access-token",
        newRefreshToken: "new-refresh-token",
      } as any);

      await controller.refresh(mockRequest, mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        "refresh_token",
        "new-refresh-token",
        expect.objectContaining({ secure: true }),
      );
    });
  });

  describe("logout", () => {
    it("should clear the refresh token cookie and return a success message", async () => {
      const result = await controller.logout(mockUser, mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith("refresh_token", {
        path: "/api/v1/auth",
      });
      expect(result).toEqual({ message: "Logged out successfully" });
    });
  });

  describe("requestPasswordReset", () => {
    it("should request a password reset and return a generic message", async () => {
      const dto = { email: "a@b.com" } as RequestPasswordResetDto;
      jest.spyOn(authService, "requestReset").mockResolvedValue(undefined);

      const result = await controller.requestPasswordReset(dto);

      expect(authService.requestReset).toHaveBeenCalledWith(dto.email);
      expect(result).toEqual({
        message: "If the email exists, a password reset link has been sent.",
      });
    });
  });

  describe("resetPassword", () => {
    it("should reset the password using the token and dto", async () => {
      const dto = { password: "newPassword123" } as any;
      jest.spyOn(authService, "resetPassword").mockResolvedValue(undefined);

      const result = await controller.resetPassword("reset-token", dto);

      expect(authService.resetPassword).toHaveBeenCalledWith(
        "reset-token",
        dto,
      );
      expect(result).toEqual({
        message: "Password has been reset successfully.",
      });
    });
  });
});
