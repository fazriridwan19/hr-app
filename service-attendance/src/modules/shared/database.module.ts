import { AttendanceEntity } from "@modules/attendance/infrastructure/persistence/entities/attendance.entity";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "mysql" as const,
        host: configService.get<string>("MYSQL_HOST", "localhost"),
        port: configService.get<number>("MYSQL_PORT", 3306),
        username: configService.get<string>("MYSQL_USERNAME"),
        password: configService.get<string>("MYSQL_PASSWORD"),
        database: configService.get<string>("MYSQL_DATABASE"),
        entities: [AttendanceEntity],
        migrations: [__dirname + "/../../database/migrations/*{.ts,.js}"],
        migrationsTableName: "migrations",
        synchronize: configService.get<string>("MYSQL_SYNCHRONIZE") === "true",
        logging: configService.get<string>("MYSQL_LOGGING") === "true",
        dateStrings: true,
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
