import {
  AttendanceResponseDto,
  PaginatedAttendanceResponseDto,
} from "@modules/attendance/application/dto/attendance-response.dto";
import {
  GetAttendancesQueryDto,
  GetMyAttendancesQueryDto,
} from "@modules/attendance/application/dto/get-attendances-query.dto";
import {
  ATTENDANCE_REPOSITORY,
  AttendanceStatus,
  AttendanceType,
  IAttendanceRepository,
} from "@modules/attendance/domain/entities/attendance.entity";
import { AttendanceCacheService } from "@modules/attendance/infrastructure/cache/attendance-cache.service";
import { AttendanceProducer } from "@modules/attendance/infrastructure/queue/producers/attendance.producer";
import { FileStorageService } from "@modules/attendance/infrastructure/storage/file-storage.service";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    @Inject(ATTENDANCE_REPOSITORY)
    private readonly attendanceRepository: IAttendanceRepository,
    private readonly cacheService: AttendanceCacheService,
    private readonly storageService: FileStorageService,
    private readonly producer: AttendanceProducer,
  ) {}

  private getTodayString(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private getCurrentTimeString(): string {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }

  async clockIn(
    employeeId: number,
    employeeCode: string,
    employeeName: string,
    file?: Express.Multer.File,
  ): Promise<AttendanceResponseDto> {
    const today = this.getTodayString();

    // Check idempotency via Redis cache first (fast path)
    const cached = await this.cacheService.getTodayStatus(employeeId);
    if (cached?.clockIn) {
      throw new ConflictException("You have already clocked in today");
    }

    // Also verify from DB to be safe
    const existing =
      await this.attendanceRepository.findByEmployeeIdAndDateAndType(
        employeeId,
        today,
        AttendanceType.CLOCK_IN,
      );
    if (existing) {
      throw new ConflictException("You have already clocked in today");
    }

    // Save photo file (if provided)
    let filePath: string | null = null;
    if (file) {
      filePath = await this.storageService.saveFile(file, employeeId);
    }

    // Insert record with PENDING status
    const attendance = await this.attendanceRepository.create({
      employeeId,
      employeeCode,
      employeeName,
      type: AttendanceType.CLOCK_IN,
      photoUrl: filePath,
      clockDate: today as unknown as Date,
      clockTime: this.getCurrentTimeString(),
      status: AttendanceStatus.PENDING,
    });

    // Update Redis cache
    await this.cacheService.setTodayStatus(employeeId, {
      clockIn: true,
      clockOut: cached?.clockOut ?? false,
      clockInId: attendance.id,
      clockOutId: cached?.clockOutId,
    });

    // Push async job
    await this.producer.addClockInJob({
      attendanceId: attendance.id,
      employeeId,
      type: AttendanceType.CLOCK_IN,
      filePath,
    });

    this.logger.log(
      `Clock-in initiated for employee ${employeeId} (${employeeCode})`,
    );
    return AttendanceResponseDto.fromDomain(attendance);
  }

  async clockOut(
    employeeId: number,
    employeeCode: string,
    employeeName: string,
    file?: Express.Multer.File,
  ): Promise<AttendanceResponseDto> {
    const today = this.getTodayString();

    // Check idempotency via Redis cache
    const cached = await this.cacheService.getTodayStatus(employeeId);

    if (cached?.clockOut) {
      throw new ConflictException("You have already clocked out today");
    }

    if (!cached?.clockIn) {
      // Fallback: check DB
      const clockInRecord =
        await this.attendanceRepository.findByEmployeeIdAndDateAndType(
          employeeId,
          today,
          AttendanceType.CLOCK_IN,
        );
      if (!clockInRecord) {
        throw new BadRequestException("You must clock in before clocking out");
      }
    }

    // Check existing clock out in DB
    const existing =
      await this.attendanceRepository.findByEmployeeIdAndDateAndType(
        employeeId,
        today,
        AttendanceType.CLOCK_OUT,
      );
    if (existing) {
      throw new ConflictException("You have already clocked out today");
    }

    let filePath: string | null = null;
    if (file) {
      filePath = await this.storageService.saveFile(file, employeeId);
    }

    const attendance = await this.attendanceRepository.create({
      employeeId,
      employeeCode,
      employeeName,
      type: AttendanceType.CLOCK_OUT,
      photoUrl: filePath,
      clockDate: today as unknown as Date,
      clockTime: this.getCurrentTimeString(),
      status: AttendanceStatus.PENDING,
    });

    await this.cacheService.setTodayStatus(employeeId, {
      clockIn: cached?.clockIn ?? true,
      clockOut: true,
      clockInId: cached?.clockInId,
      clockOutId: attendance.id,
    });

    await this.producer.addClockOutJob({
      attendanceId: attendance.id,
      employeeId,
      type: AttendanceType.CLOCK_OUT,
      filePath,
    });

    this.logger.log(
      `Clock-out initiated for employee ${employeeId} (${employeeCode})`,
    );
    return AttendanceResponseDto.fromDomain(attendance);
  }

  async findMyAttendances(
    employeeId: number,
    query: GetMyAttendancesQueryDto,
  ): Promise<PaginatedAttendanceResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const result = await this.attendanceRepository.findMyAttendances({
      employeeId,
      page,
      limit,
      date: query.date,
    });
    return {
      data: result.data.map(AttendanceResponseDto.fromDomain),
      pagination: {
        totalData: result.total,
        totalPage: result.totalPages,
        limit,
        offset: (page - 1) * limit,
      },
    };
  }

  async findAll(
    query: GetAttendancesQueryDto,
  ): Promise<PaginatedAttendanceResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const result = await this.attendanceRepository.findAll({
      page,
      limit,
      date: query.date,
      employeeId: query.employeeId,
      status: query.status,
    });
    return {
      data: result.data.map(AttendanceResponseDto.fromDomain),
      pagination: {
        totalData: result.total,
        totalPage: result.totalPages,
        limit,
        offset: (page - 1) * limit,
      },
    };
  }

  async findById(
    id: number,
    requestingEmployeeId?: number,
    role?: string,
  ): Promise<AttendanceResponseDto> {
    const attendance = await this.attendanceRepository.findById(id);
    if (!attendance) {
      throw new NotFoundException(`Attendance record #${id} not found`);
    }

    // ADMIN can view all; USER can only view their own
    if (role !== "ADMIN" && attendance.employeeId !== requestingEmployeeId) {
      throw new ForbiddenException(
        "You do not have permission to view this record",
      );
    }

    return AttendanceResponseDto.fromDomain(attendance);
  }
}
