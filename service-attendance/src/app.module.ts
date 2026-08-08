import { JwtStrategy } from "@common/strategies/jwt.strategy";
import { appConfig } from "@config/app.config";
import { databaseConfig } from "@config/database.config";
import { jwtConfig } from "@config/jwt.config";
import { redisConfig } from "@config/redis.config";
import { AttendanceModule } from "@modules/attendance/attendance.module";
import { HealthModule } from "@modules/health/health.module";
import { DatabaseModule } from "@modules/shared/database.module";
import { LoggingModule } from "@modules/shared/logging.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import * as path from "node:path";

@Module({
  imports: [
    // Config — load semua config termasuk appConfig
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, jwtConfig],
      envFilePath: ".env",
    }),

    // Static files — serve uploaded photos
    ServeStaticModule.forRoot({
      rootPath: path.join(process.cwd(), "uploads"),
      serveRoot: "/uploads",
      serveStaticOptions: { index: false },
    }),

    // Logger
    LoggingModule,

    // Database
    DatabaseModule,

    // Feature modules
    AttendanceModule,
    HealthModule,
  ],
  providers: [JwtStrategy],
})
export class AppModule {}
