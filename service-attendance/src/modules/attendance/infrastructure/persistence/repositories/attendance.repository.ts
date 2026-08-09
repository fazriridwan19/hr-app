import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { AttendanceEntity } from "../entities/attendance.entity";
import {
  Attendance,
  AttendanceStatus,
  AttendanceType,
  FindAttendancesOptions,
  FindMyAttendancesOptions,
  IAttendanceRepository,
  PaginatedResult,
} from "@modules/attendance/domain/entities/attendance.entity";

@Injectable()
export class AttendanceRepository implements IAttendanceRepository {
  constructor(
    @InjectRepository(AttendanceEntity)
    private readonly repo: Repository<AttendanceEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async findById(id: number): Promise<Attendance | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? entity.toDomain() : null;
  }

  async findByEmployeeIdAndDateAndType(
    employeeId: number,
    clockDate: string,
    type: AttendanceType,
  ): Promise<Attendance | null> {
    const entity = await this.repo.findOne({
      where: { employeeId, clockDate: clockDate as unknown as string, type },
    });
    return entity ? entity.toDomain() : null;
  }

  async findAll(
    options: FindAttendancesOptions,
  ): Promise<PaginatedResult<Attendance>> {
    const { page, limit, date, employeeId, status } = options;
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder("a");
    if (date) qb.andWhere("a.clockDate = :date", { date });
    if (employeeId) qb.andWhere("a.employeeId = :employeeId", { employeeId });
    if (status) qb.andWhere("a.status = :status", { status });

    qb.orderBy("a.clockDate", "DESC").addOrderBy("a.clockTime", "DESC");
    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data: data.map((e) => e.toDomain()),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findMyAttendances(
    options: FindMyAttendancesOptions,
  ): Promise<PaginatedResult<Attendance>> {
    const { employeeId, page, limit, date } = options;
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder("a")
      .where("a.employeeId = :employeeId", { employeeId });

    if (date) qb.andWhere("a.clockDate = :date", { date });

    qb.orderBy("a.clockDate", "DESC").addOrderBy("a.clockTime", "DESC");
    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data: data.map((e) => e.toDomain()),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(attendance: Partial<Attendance>): Promise<Attendance> {
    const entity = AttendanceEntity.fromDomain(attendance);
    const saved = await this.repo.save(entity);
    return saved.toDomain();
  }

  async update(
    id: number,
    attendance: Partial<Attendance>,
  ): Promise<Attendance> {
    await this.repo.update(id, AttendanceEntity.fromDomain(attendance));
    const updated = await this.repo.findOneOrFail({ where: { id } });
    return updated.toDomain();
  }

  async countByEmployeeAndDate(
    employeeId: number,
    clockDate: string,
  ): Promise<number> {
    return this.repo.count({
      where: { employeeId, clockDate: clockDate as unknown as string },
    });
  }

  async insertAutoClockOut(): Promise<Attendance[]> {
    return this.dataSource.transaction(async (manager) => {
      const attendances = await manager
        .createQueryBuilder(AttendanceEntity, "attendance")
        .setLock("pessimistic_write")
        .setOnLocked("skip_locked")
        .leftJoin(
          AttendanceEntity,
          "co",
          "co.employeeId = attendance.employeeId AND co.clockDate = attendance.clockDate AND co.type = :outType",
          { outType: AttendanceType.CLOCK_OUT },
        )
        .where("attendance.type = :type", { type: AttendanceType.CLOCK_IN })
        .andWhere("attendance.clockDate <= NOW() - INTERVAL 29 HOUR")
        .andWhere("co.id IS NULL")
        .take(5)
        .getMany();

      await manager.getRepository(AttendanceEntity).insert(
        attendances.map((attendance) => ({
          employeeId: attendance.employeeId,
          employeeCode: attendance.employeeCode,
          employeeName: attendance.employeeName,
          type: AttendanceType.CLOCK_OUT,
          clockDate: attendance.clockDate,
          clockTime: new Date().toISOString().split("T")[1].split(".")[0],
          createdAt: new Date(),
          updatedAt: new Date(),
          status: AttendanceStatus.COMPLETED,
          notes: "Clocked out by system",
        })),
      );

      return attendances.map((attendance) => attendance.toDomain());
    });
  }
}
