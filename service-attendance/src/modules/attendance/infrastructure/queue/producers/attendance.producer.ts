import { Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { AttendanceType } from "@modules/attendance/domain/entities/attendance.entity";

export const ATTENDANCE_QUEUE = "attendance-events";

export interface AttendanceJobData {
  attendanceId: number;
  employeeId: number;
  type: AttendanceType;
  filePath: string | null;
}

@Injectable()
export class AttendanceProducer {
  private readonly logger = new Logger(AttendanceProducer.name);

  constructor(
    @InjectQueue(ATTENDANCE_QUEUE)
    private readonly attendanceQueue: Queue<AttendanceJobData>,
  ) {}

  private readonly retryOptions = {
    attempts: 3,
    backoff: {
      type: "exponential" as const,
      delay: 5000,
    },
  };

  async addClockInJob(data: AttendanceJobData): Promise<void> {
    await this.attendanceQueue.add("clock-in", data, this.retryOptions);
    this.logger.log(`Queued clock-in job for attendance #${data.attendanceId}`);
  }

  async addClockOutJob(data: AttendanceJobData): Promise<void> {
    await this.attendanceQueue.add("clock-out", data, this.retryOptions);
    this.logger.log(
      `Queued clock-out job for attendance #${data.attendanceId}`,
    );
  }
}
