export type AttendanceType = "CLOCK_IN" | "CLOCK_OUT";
export type AttendanceStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface Attendance {
  id: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  type: AttendanceType;
  photoUrl: string | null;
  clockDate: string; // YYYY-MM-DD
  clockTime: string; // HH:MM:SS
  status: AttendanceStatus;
  notes: string | null;
  createdAt: string;
}

export interface PaginatedMeta {
  code: number;
  message: string | null;
  totalData: number;
  totalPage: number;
  limit: number;
  offset: number;
}

export interface ResponseMeta {
  code: number;
  message: string | null;
}

export interface ApiResponse<T> {
  meta: ResponseMeta | PaginatedMeta;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface GetMyAttendancesParams {
  page?: number;
  limit?: number;
  date?: string;
}

export interface GetAllAttendancesParams {
  page?: number;
  limit?: number;
  date?: string;
  employeeId?: number;
  status?: AttendanceStatus;
}
