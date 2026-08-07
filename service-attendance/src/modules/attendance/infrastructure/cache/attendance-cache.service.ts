import { InjectRedis } from "@nestjs-modules/ioredis";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

export const ATTENDANCE_REDIS_CLIENT = Symbol("ATTENDANCE_REDIS_CLIENT");

export interface TodayAttendanceStatus {
  clockIn: boolean;
  clockOut: boolean;
  clockInId?: number;
  clockOutId?: number;
}

@Injectable()
export class AttendanceCacheService {
  private readonly logger = new Logger(AttendanceCacheService.name);
  private readonly keyPrefix: string;

  constructor(
    @InjectRedis() private readonly redisClient: Redis,
    private readonly configService: ConfigService,
  ) {
    this.keyPrefix = this.configService.get<string>("redis.keyPrefix", "hr:");
  }

  private buildKey(employeeId: number): string {
    return `${this.keyPrefix}attendance:today:${employeeId}`;
  }

  /** Calculate seconds until midnight (end of current day) */
  private secondsUntilMidnight(): number {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return Math.floor((midnight.getTime() - now.getTime()) / 1000);
  }

  async getTodayStatus(
    employeeId: number,
  ): Promise<TodayAttendanceStatus | null> {
    const key = this.buildKey(employeeId);
    const value = await this.redisClient.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as TodayAttendanceStatus;
    } catch {
      return null;
    }
  }

  async setTodayStatus(
    employeeId: number,
    status: TodayAttendanceStatus,
  ): Promise<void> {
    const key = this.buildKey(employeeId);
    const ttl = this.secondsUntilMidnight();
    if (ttl <= 0) return;
    await this.redisClient.setex(key, ttl, JSON.stringify(status));
    this.logger.debug(
      `Cached today status for employee ${employeeId}, TTL: ${ttl}s`,
    );
  }

  async invalidateTodayStatus(employeeId: number): Promise<void> {
    const key = this.buildKey(employeeId);
    await this.redisClient.del(key);
    this.logger.debug(
      `Invalidated today status cache for employee ${employeeId}`,
    );
  }
}
