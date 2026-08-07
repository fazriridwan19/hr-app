import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AttendanceController } from "./application/controllers/attendance.controller";
import { ATTENDANCE_REPOSITORY } from "./domain/entities/attendance.entity";
import { AttendanceService } from "./domain/services/attendance.service";
import {
  AttendanceCacheService
} from "./infrastructure/cache/attendance-cache.service";
import { AttendanceEntity } from "./infrastructure/persistence/entities/attendance.entity";
import { AttendanceRepository } from "./infrastructure/persistence/repositories/attendance.repository";
import { AttendanceConsumer } from "./infrastructure/queue/consumers/attendance.consumer";
import {
  ATTENDANCE_QUEUE,
  AttendanceProducer,
} from "./infrastructure/queue/producers/attendance.producer";
import { FileStorageService } from "./infrastructure/storage/file-storage.service";
import { JwtStrategy } from "./infrastructure/strategies/jwt.strategy";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    TypeOrmModule.forFeature([AttendanceEntity]),
    BullModule.registerQueue({
      name: ATTENDANCE_QUEUE,
    }),
  ],
  controllers: [AttendanceController],
  providers: [
    JwtStrategy,
    AttendanceService,
    AttendanceCacheService,
    FileStorageService,
    AttendanceProducer,
    AttendanceConsumer,
    {
      provide: ATTENDANCE_REPOSITORY,
      useClass: AttendanceRepository,
    },
  ],
  exports: [AttendanceService],
})
export class AttendanceModule {}
