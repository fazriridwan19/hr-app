import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { EmployeeModule } from "../employee/employee.module";
import { UserModule } from "../user/user.module";
import { AuthController } from "./application/controllers/auth.controller";
import { AuthService } from "./domain/services/auth.service";
import { RedisTokenService } from "./infrastructure/cache/redis-token.service";
import { JwtStrategy } from "./infrastructure/strategies/jwt.strategy";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: configService.get<string>("JWT_ACCESS_EXPIRATION", "15m"),
        },
      }),
    }),
    UserModule,
    EmployeeModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RedisTokenService],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
