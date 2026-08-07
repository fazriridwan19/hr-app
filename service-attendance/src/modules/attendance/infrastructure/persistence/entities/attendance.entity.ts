import {
  AttendanceType,
  AttendanceStatus,
  Attendance,
} from "@modules/attendance/domain/entities/attendance.entity";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity("attendances")
@Index(["employeeId", "clockDate", "type"], { unique: true })
export class AttendanceEntity {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id: number;

  @Column({ name: "employee_id", type: "bigint" })
  employeeId: number;

  @Column({ name: "employee_code", type: "varchar", length: 20 })
  employeeCode: string;

  @Column({ name: "employee_name", type: "varchar", length: 255 })
  employeeName: string;

  @Column({ type: "enum", enum: AttendanceType })
  type: AttendanceType;

  @Column({ name: "photo_url", type: "varchar", length: 500, nullable: true })
  photoUrl: string | null;

  @Column({ name: "clock_date", type: "date" })
  clockDate: string;

  @Column({ name: "clock_time", type: "time" })
  clockTime: string;

  @Column({
    type: "enum",
    enum: AttendanceStatus,
    default: AttendanceStatus.PENDING,
  })
  status: AttendanceStatus;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  toDomain(): Attendance {
    return new Attendance({
      id: Number(this.id),
      employeeId: Number(this.employeeId),
      employeeCode: this.employeeCode,
      employeeName: this.employeeName,
      type: this.type,
      photoUrl: this.photoUrl,
      clockDate: this.clockDate as unknown as Date,
      clockTime: this.clockTime,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }

  static fromDomain(attendance: Partial<Attendance>): AttendanceEntity {
    const entity = new AttendanceEntity();
    if (attendance.id !== undefined) entity.id = attendance.id;
    if (attendance.employeeId !== undefined)
      entity.employeeId = attendance.employeeId;
    if (attendance.employeeCode !== undefined)
      entity.employeeCode = attendance.employeeCode;
    if (attendance.employeeName !== undefined)
      entity.employeeName = attendance.employeeName;
    if (attendance.type !== undefined) entity.type = attendance.type;
    if (attendance.photoUrl !== undefined)
      entity.photoUrl = attendance.photoUrl;
    if (attendance.clockDate !== undefined)
      entity.clockDate = attendance.clockDate as unknown as string;
    if (attendance.clockTime !== undefined)
      entity.clockTime = attendance.clockTime;
    if (attendance.status !== undefined) entity.status = attendance.status;
    return entity;
  }
}
