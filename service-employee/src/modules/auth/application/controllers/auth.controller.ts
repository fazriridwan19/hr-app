import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Public } from "@common/decorators/public.decorator";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import { RequestPasswordResetDto } from "@modules/auth/application/dto/request-password-reset.dto";
import { ResetPasswordDto } from "@modules/auth/application/dto/reset-password.dto";
import { JwtPayload } from "@modules/auth/domain/entities/token.entity";
import { AuthService } from "@modules/auth/domain/services/auth.service";
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  Version,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Request, Response } from "express";
import { LoginResponseDto } from "../dto/login-response.dto";
import { LoginDto } from "../dto/login.dto";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  private readonly REFRESH_TOKEN_COOKIE = "refresh_token";
  private readonly COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

  constructor(private readonly authService: AuthService) {}

  @Version("1")
  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login with email and password" })
  @ApiResponse({
    status: 200,
    description: "Login successful",
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    const { loginResponse, refreshToken } =
      await this.authService.login(loginDto);

    response.cookie(this.REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: process.env.APP_ENV === "production",
      sameSite: "strict",
      maxAge: this.COOKIE_MAX_AGE,
      path: "/api/v1/auth",
    });

    return loginResponse;
  }

  @Version("1")
  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access token using refresh token cookie" })
  @ApiCookieAuth("refresh_token")
  @ApiResponse({ status: 200, description: "Token refreshed successfully" })
  @ApiResponse({ status: 401, description: "Invalid or expired refresh token" })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string; tokenType: string; expiresIn: number }> {
    const refreshToken = request.cookies?.[this.REFRESH_TOKEN_COOKIE];
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token not found");
    }

    const { accessToken, newRefreshToken } =
      await this.authService.refresh(refreshToken);

    response.cookie(this.REFRESH_TOKEN_COOKIE, newRefreshToken, {
      httpOnly: true,
      secure: process.env.APP_ENV === "production",
      sameSite: "strict",
      maxAge: this.COOKIE_MAX_AGE,
      path: "/api/v1/auth",
    });

    return {
      accessToken,
      tokenType: "Bearer",
      expiresIn: 900,
    };
  }

  @Version("1")
  @UseGuards(JwtAuthGuard)
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Logout and revoke refresh token" })
  @ApiResponse({ status: 200, description: "Logged out successfully" })
  async logout(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    response.clearCookie(this.REFRESH_TOKEN_COOKIE, { path: "/api/v1/auth" });

    return { message: "Logged out successfully" };
  }

  @Version("1")
  @Public()
  @Post("request-password-reset")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Request a password reset link via email" })
  @ApiResponse({
    status: 200,
    description: "Password reset email sent if the account exists",
  })
  async requestPasswordReset(
    @Body() dto: RequestPasswordResetDto,
  ): Promise<{ message: string }> {
    await this.authService.requestReset(dto.email);
    return {
      message: "If the email exists, a password reset link has been sent.",
    };
  }

  @Version("1")
  @Public()
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reset password using a password reset token" })
  @ApiResponse({ status: 200, description: "Password reset successfully" })
  async resetPassword(
    @Query("token") token: string,
    @Body() dto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.resetPassword(token, dto);
    return { message: "Password has been reset successfully." };
  }
}
