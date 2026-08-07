import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AttendanceEntity } from "../entities/attendance.entity";
import {
  Attendance,
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
}
