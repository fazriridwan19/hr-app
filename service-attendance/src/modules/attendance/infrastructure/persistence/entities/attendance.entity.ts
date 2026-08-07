import {
  Attendance,
  AttendanceStatus,
  AttendanceType,
} from "@modules/attendance/domain/entities/attendance.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
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

  @Column({ type: "text", nullable: true })
  notes: string;

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
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }

  static fromDomain(attendance: Partial<Attendance>): AttendanceEntity {
    const entity = new AttendanceEntity();
    if (attendance.id) entity.id = attendance.id;
    if (attendance.employeeId) entity.employeeId = attendance.employeeId;
    if (attendance.employeeCode) entity.employeeCode = attendance.employeeCode;
    if (attendance.employeeName) entity.employeeName = attendance.employeeName;
    if (attendance.type) entity.type = attendance.type;
    if (attendance.photoUrl) entity.photoUrl = attendance.photoUrl;
    if (attendance.clockDate)
      entity.clockDate = attendance.clockDate as unknown as string;
    if (attendance.clockTime) entity.clockTime = attendance.clockTime;
    if (attendance.status) entity.status = attendance.status;
    if (attendance.notes) entity.notes = attendance.notes;
    return entity;
  }
}
