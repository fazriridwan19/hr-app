import { LoginResponseDto } from "@modules/auth/application/dto/login-response.dto";
import { LoginDto } from "@modules/auth/application/dto/login.dto";
import {
  JwtPayload,
  RefreshTokenPayload,
} from "@modules/auth/domain/entities/token.entity";
import { EmailService } from "@modules/auth/infrastructure/email/email.service";
import { UpdatePasswordDto } from "@modules/employee/application/dto/update-password.dto";
import {
  EMPLOYEE_REPOSITORY,
  IEmployeeRepository,
} from "@modules/employee/domain/entities/employee.entity";
import {
  IUserRepository,
  USER_REPOSITORY,
} from "@modules/employee/domain/entities/user.entity";
import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly tokenTTL = 60 * 60;
  private readonly SALT_ROUNDS = 12;

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: IEmployeeRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async login(
    loginDto: LoginDto,
  ): Promise<{ loginResponse: LoginResponseDto; refreshToken: string }> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (!user.isActive) {
      throw new UnauthorizedException("Your account has been deactivated");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    let employeeName = email.split("@")[0];
    if (user.employeeId) {
      const employee = await this.employeeRepository.findById(user.employeeId);
      if (employee) {
        employeeName = employee.name;
      }
    }

    const jti = uuidv4();
    const payload: JwtPayload = {
      userId: user.id,
      employeeId: user.employeeId,
      role: user.role,
      name: employeeName,
      jti,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_SECRET"),
      expiresIn: this.configService.get<string>("JWT_ACCESS_EXPIRATION", "15m"),
    });

    const refreshPayload: RefreshTokenPayload = { ...payload, type: "refresh" };
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      expiresIn: this.configService.get<string>("JWT_REFRESH_EXPIRATION", "7d"),
    });

    this.logger.log(`User ${user.email} logged in successfully`);

    const loginResponse: LoginResponseDto = {
      accessToken,
      tokenType: "Bearer",
      expiresIn: 900,
      user: {
        userId: user.id,
        email: user.email,
        role: user.role,
        name: employeeName,
        employeeId: user.employeeId,
      },
    };

    return { loginResponse, refreshToken };
  }

  async refresh(refreshToken: string): Promise<{
    accessToken: string;
    newRefreshToken: string;
    newJti: string;
    oldJti: string;
    userId: number;
  }> {
    let payload: RefreshTokenPayload;

    try {
      payload = this.jwtService.verify<RefreshTokenPayload>(refreshToken, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      });
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    if (payload.type !== "refresh") {
      throw new UnauthorizedException("Invalid token type");
    }

    const user = await this.userRepository.findById(payload.userId);
    if (!user?.isActive) {
      throw new UnauthorizedException("User not found or inactive");
    }

    const newJti = uuidv4();
    const newPayload: JwtPayload = {
      userId: payload.userId,
      employeeId: payload.employeeId,
      role: payload.role,
      name: payload.name,
      jti: newJti,
    };

    const accessToken = this.jwtService.sign(newPayload, {
      secret: this.configService.get<string>("JWT_SECRET"),
      expiresIn: this.configService.get<string>("JWT_ACCESS_EXPIRATION", "15m"),
    });

    const newRefreshPayload: RefreshTokenPayload = {
      ...newPayload,
      type: "refresh",
    };
    const newRefreshToken = this.jwtService.sign(newRefreshPayload, {
      secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      expiresIn: this.configService.get<string>("JWT_REFRESH_EXPIRATION", "7d"),
    });

    this.logger.log(`Refreshed tokens for user ${payload.userId}`);

    return {
      accessToken,
      newRefreshToken,
      newJti,
      oldJti: payload.jti,
      userId: payload.userId,
    };
  }

  async requestReset(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user?.isActive) {
      this.logger.warn(
        `Password reset requested for missing or inactive email: ${email}`,
      );
      return;
    }

    const token = this.jwtService.sign(
      { userId: user.id, email: user.email, purpose: "password-reset" },
      {
        secret: this.configService.get<string>("JWT_PASSWORD_RESET_SECRET"),
        expiresIn: `${this.tokenTTL}s`,
      },
    );

    const frontendUrl = this.configService.get<string>(
      "APP_FRONTEND_URL",
      "http://localhost:5173",
    );
    const resetPath = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;

    this.emailService.sendPasswordReset(email, resetPath);
    this.logger.log(`Password reset requested for user ${user.email}`);
  }

  async resetPassword(token: string, dto: UpdatePasswordDto): Promise<void> {
    let payload: { userId: number; email: string; purpose: string };
    try {
      payload = this.jwtService.verify<{
        userId: number;
        email: string;
        purpose: string;
      }>(token, {
        secret: this.configService.get<string>("JWT_PASSWORD_RESET_SECRET"),
      });
    } catch {
      throw new NotFoundException("Invalid or expired password reset token");
    }

    if (payload.purpose !== "password-reset") {
      throw new NotFoundException("Invalid password reset token");
    }

    const user = await this.userRepository.findById(payload.userId);
    if (!user?.isActive) {
      throw new NotFoundException("User not found or inactive");
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, this.SALT_ROUNDS);
    await this.userRepository.updatePassword(user.id, hashedPassword);

    this.logger.log(`Password reset completed for user ${user.email}`);
  }
}
