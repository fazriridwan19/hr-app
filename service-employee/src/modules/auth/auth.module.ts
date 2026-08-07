import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { EmployeeModule } from "../employee/employee.module";
import { UserModule } from "../user/user.module";
import { AuthController } from "./application/controllers/auth.controller";
import { AuthService } from "./domain/services/auth.service";
import { EmailService } from "./infrastructure/email/email.service";
import { RedisTokenService } from "./infrastructure/cache/redis-token.service";
import { JwtStrategy } from "./infrastructure/strategies/jwt.strategy";
import {
  EMAIL_QUEUE,
  EmailProducer,
} from "@modules/auth/infrastructure/queue/producers/email.producer";
import { EmailConsumer } from "./infrastructure/queue/consumers/email.consumer";
import { BullModule } from "@nestjs/bullmq";

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
    BullModule.registerQueue({
      name: EMAIL_QUEUE,
    }),
    UserModule,
    EmployeeModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailService,
    JwtStrategy,
    RedisTokenService,
    EmailProducer,
    EmailConsumer,
  ],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
