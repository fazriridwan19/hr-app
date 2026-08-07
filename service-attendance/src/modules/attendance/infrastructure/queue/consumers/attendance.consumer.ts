import { Processor, WorkerHost, OnWorkerEvent } from "@nestjs/bullmq";
import { Logger, Inject } from "@nestjs/common";
import { Job } from "bullmq";
import {
  ATTENDANCE_QUEUE,
  AttendanceJobData,
} from "../producers/attendance.producer";
import {
  ATTENDANCE_REPOSITORY,
  AttendanceStatus,
  IAttendanceRepository,
} from "@modules/attendance/domain/entities/attendance.entity";

@Processor(ATTENDANCE_QUEUE)
export class AttendanceConsumer extends WorkerHost {
  private readonly logger = new Logger(AttendanceConsumer.name);

  constructor(
    @Inject(ATTENDANCE_REPOSITORY)
    private readonly attendanceRepository: IAttendanceRepository,
  ) {
    super();
  }

  async process(job: Job<AttendanceJobData>): Promise<void> {
    const { attendanceId, employeeId, type, filePath } = job.data;

    this.logger.log(
      `Processing job [${job.name}] #${job.id} — attendance #${attendanceId}, employee #${employeeId}`,
    );

    try {
      await this.attendanceRepository.update(attendanceId, {
        status: AttendanceStatus.COMPLETED,
        ...(filePath ? { photoUrl: filePath } : {}),
      });

      this.logger.log(
        `Completed [${type}] for attendance #${attendanceId}, employee #${employeeId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process [${type}] for attendance #${attendanceId}: ${error}`,
      );
      throw error;
    }
  }

  @OnWorkerEvent("completed")
  onCompleted(job: Job<AttendanceJobData>): void {
    this.logger.log(`Job [${job.name}] #${job.id} completed successfully`);
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job<AttendanceJobData>, error: Error): void {
    this.logger.error(
      `Job [${job.name}] #${job.id} failed after ${job.attemptsMade} attempts: ${error.message}`,
    );
  }
}
