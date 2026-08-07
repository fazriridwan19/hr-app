export enum AttendanceType {
  CLOCK_IN = "CLOCK_IN",
  CLOCK_OUT = "CLOCK_OUT",
}

export enum AttendanceStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export class Attendance {
  id: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  type: AttendanceType;
  photoUrl: string | null;
  clockDate: Date;
  clockTime: string;
  status: AttendanceStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Attendance>) {
    Object.assign(this, partial);
  }
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FindAttendancesOptions {
  page: number;
  limit: number;
  date?: string;
  employeeId?: number;
  status?: AttendanceStatus;
}

export interface FindMyAttendancesOptions {
  employeeId: number;
  page: number;
  limit: number;
  date?: string;
}

export const ATTENDANCE_REPOSITORY = Symbol("ATTENDANCE_REPOSITORY");

export interface IAttendanceRepository {
  findById(id: number): Promise<Attendance | null>;

  findByEmployeeIdAndDateAndType(
    employeeId: number,
    clockDate: string,
    type: AttendanceType,
  ): Promise<Attendance | null>;

  findAll(
    options: FindAttendancesOptions,
  ): Promise<PaginatedResult<Attendance>>;

  findMyAttendances(
    options: FindMyAttendancesOptions,
  ): Promise<PaginatedResult<Attendance>>;

  create(attendance: Partial<Attendance>): Promise<Attendance>;

  update(id: number, attendance: Partial<Attendance>): Promise<Attendance>;

  countByEmployeeAndDate(
    employeeId: number,
    clockDate: string,
  ): Promise<number>;
}
