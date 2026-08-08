import { jwtConfig } from "@config/jwt.config";
import { redisConfig } from "@config/redis.config";
import { AuthModule } from "@modules/auth/auth.module";
import { EmployeeModule } from "@modules/employee/employee.module";
import { HealthModule } from "@modules/health/health.module";
import { DatabaseModule } from "@modules/shared/database.module";
import { LoggingModule } from "@modules/shared/logging.module";
import { QueueModule } from "@modules/shared/queue.module";
import { RedisModule } from "@modules/shared/redis.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [redisConfig, jwtConfig],
      envFilePath: ".env",
    }),

    // Logger
    LoggingModule,

    // Database
    DatabaseModule,

    // BullMQ
    QueueModule,

    // Redis
    RedisModule,

    // Feature modules
    AuthModule,
    EmployeeModule,
    HealthModule,
  ],
})
export class AppModule {}
