import { AttendanceController } from "./attendance.controller";
import { AttendanceService } from "@modules/attendance/domain/services/attendance.service";
import { JwtPayload } from "@modules/attendance/domain/entities/jwt-payload.interface";
import { AttendanceRequestDto } from "@modules/attendance/application/dto/attendance-request.dto";
import {
  GetAttendancesQueryDto,
  GetMyAttendancesQueryDto,
} from "../dto/get-attendances-query.dto";
import {
  AttendanceResponseDto,
  PaginatedAttendanceResponseDto,
} from "@modules/attendance/application/dto/attendance-response.dto";

describe("AttendanceController", () => {
  let controller: AttendanceController;
  let attendanceService: AttendanceService;

  const mockUser: JwtPayload = {
    employeeId: 1,
    name: "John Doe",
    role: "EMPLOYEE",
  } as any;

  const mockFile: Express.Multer.File = {
    fieldname: "photo",
    originalname: "photo.jpg",
    encoding: "7bit",
    mimetype: "image/jpeg",
    size: 1024,
    buffer: Buffer.from("test"),
  } as Express.Multer.File;

  const mockAttendanceResponse = { id: 1 } as AttendanceResponseDto;

  const mockPaginatedResponse = {
    data: [],
    total: 0,
  } as unknown as PaginatedAttendanceResponseDto;

  beforeEach(() => {
    attendanceService = {
      clockIn: jest.fn(),
      clockOut: jest.fn(),
      findMyAttendances: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
    } as unknown as AttendanceService;

    controller = new AttendanceController(attendanceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("clockIn", () => {
    it("should clock in with photo and notes", async () => {
      const body = { notes: "On time" } as AttendanceRequestDto;
      jest
        .spyOn(attendanceService, "clockIn")
        .mockResolvedValue(mockAttendanceResponse);

      const result = await controller.clockIn(mockUser, body, mockFile);

      expect(attendanceService.clockIn).toHaveBeenCalledWith(
        mockUser.employeeId,
        mockUser.name,
        mockUser.name,
        mockFile,
        body.notes,
      );
      expect(result).toEqual(mockAttendanceResponse);
    });

    it("should clock in without photo (file undefined)", async () => {
      const body = {} as AttendanceRequestDto;
      jest
        .spyOn(attendanceService, "clockIn")
        .mockResolvedValue(mockAttendanceResponse);

      const result = await controller.clockIn(mockUser, body, undefined);

      expect(attendanceService.clockIn).toHaveBeenCalledWith(
        mockUser.employeeId,
        mockUser.name,
        mockUser.name,
        undefined,
        body.notes,
      );
      expect(result).toEqual(mockAttendanceResponse);
    });
  });

  describe("clockOut", () => {
    it("should clock out with photo and notes", async () => {
      const body = { notes: "Done for today" } as AttendanceRequestDto;
      jest
        .spyOn(attendanceService, "clockOut")
        .mockResolvedValue(mockAttendanceResponse);

      const result = await controller.clockOut(mockUser, body, mockFile);

      expect(attendanceService.clockOut).toHaveBeenCalledWith(
        mockUser.employeeId,
        mockUser.name,
        mockUser.name,
        mockFile,
        body.notes,
      );
      expect(result).toEqual(mockAttendanceResponse);
    });

    it("should clock out without photo (file undefined)", async () => {
      const body = {} as AttendanceRequestDto;
      jest
        .spyOn(attendanceService, "clockOut")
        .mockResolvedValue(mockAttendanceResponse);

      const result = await controller.clockOut(mockUser, body, undefined);

      expect(attendanceService.clockOut).toHaveBeenCalledWith(
        mockUser.employeeId,
        mockUser.name,
        mockUser.name,
        undefined,
        body.notes,
      );
      expect(result).toEqual(mockAttendanceResponse);
    });
  });

  describe("getMyAttendances", () => {
    it("should return paginated attendance history for the current user", async () => {
      const query = { page: 1, limit: 10 } as GetMyAttendancesQueryDto;
      jest
        .spyOn(attendanceService, "findMyAttendances")
        .mockResolvedValue(mockPaginatedResponse);

      const result = await controller.getMyAttendances(mockUser, query);

      expect(attendanceService.findMyAttendances).toHaveBeenCalledWith(
        mockUser.employeeId,
        query,
      );
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe("findAll", () => {
    it("should return all attendance records (ADMIN)", async () => {
      const query = { page: 1, limit: 10 } as GetAttendancesQueryDto;
      jest
        .spyOn(attendanceService, "findAll")
        .mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll(query);

      expect(attendanceService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe("findById", () => {
    it("should return attendance by id when employeeId exists (owner)", async () => {
      jest
        .spyOn(attendanceService, "findById")
        .mockResolvedValue(mockAttendanceResponse);

      const result = await controller.findById(1, mockUser);

      expect(attendanceService.findById).toHaveBeenCalledWith(
        1,
        mockUser.employeeId,
        mockUser.role,
      );
      expect(result).toEqual(mockAttendanceResponse);
    });

    it("should fall back to undefined when employeeId is null/undefined (ADMIN)", async () => {
      const adminUser = {
        employeeId: null,
        name: "Admin User",
        role: "ADMIN",
      } as unknown as JwtPayload;
      jest
        .spyOn(attendanceService, "findById")
        .mockResolvedValue(mockAttendanceResponse);

      const result = await controller.findById(5, adminUser);

      expect(attendanceService.findById).toHaveBeenCalledWith(
        5,
        undefined,
        adminUser.role,
      );
      expect(result).toEqual(mockAttendanceResponse);
    });
  });
});
