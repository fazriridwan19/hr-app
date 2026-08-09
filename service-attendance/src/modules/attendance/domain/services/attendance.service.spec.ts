import { Logger } from "@nestjs/common";
import { AttendanceService } from "./attendance.service";
import { FileStorageService } from "@modules/attendance/infrastructure/storage/file-storage.service";
import {
  AttendanceStatus,
  AttendanceType,
  IAttendanceRepository,
} from "@modules/attendance/domain/entities/attendance.entity";
import { AttendanceResponseDto } from "@modules/attendance/application/dto/attendance-response.dto";
import {
  GetAttendancesQueryDto,
  GetMyAttendancesQueryDto,
} from "@modules/attendance/application/dto/get-attendances-query.dto";

describe("AttendanceService", () => {
  let service: AttendanceService;
  let attendanceRepository: IAttendanceRepository;
  let storageService: FileStorageService;

  const mockFile = {
    fieldname: "photo",
    originalname: "photo.jpg",
    mimetype: "image/jpeg",
    size: 1024,
    buffer: Buffer.from("test"),
  } as Express.Multer.File;

  const mockDomainAttendance = {
    id: 1,
    employeeId: 10,
    employeeCode: "EMP001",
    employeeName: "John Doe",
    type: AttendanceType.CLOCK_IN,
    photoUrl: null,
    notes: null,
    clockDate: "2026-08-09",
    clockTime: "08:00:00",
    status: AttendanceStatus.COMPLETED,
  };

  const mockResponseDto = { id: 1 } as AttendanceResponseDto;

  beforeEach(() => {
    attendanceRepository = {
      findByEmployeeIdAndDateAndType: jest.fn(),
      create: jest.fn(),
      findMyAttendances: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
    } as unknown as IAttendanceRepository;

    storageService = {
      saveFile: jest.fn(),
    } as unknown as FileStorageService;

    service = new AttendanceService(attendanceRepository, storageService);

    jest.spyOn(Logger.prototype, "log").mockImplementation(() => undefined);
    jest
      .spyOn(AttendanceResponseDto, "fromDomain")
      .mockReturnValue(mockResponseDto);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("clockIn", () => {
    it("should throw ConflictException when already clocked in today", async () => {
      jest
        .spyOn(attendanceRepository, "findByEmployeeIdAndDateAndType")
        .mockResolvedValue(mockDomainAttendance as any);

      await expect(
        service.clockIn(10, "EMP001", "John Doe", mockFile, "notes"),
      ).rejects.toThrow("You have already clocked in today");
      expect(attendanceRepository.create).not.toHaveBeenCalled();
    });

    it("should clock in with photo and notes", async () => {
      jest
        .spyOn(attendanceRepository, "findByEmployeeIdAndDateAndType")
        .mockResolvedValue(null);
      jest
        .spyOn(storageService, "saveFile")
        .mockResolvedValue("uploads/photo.jpg");
      jest
        .spyOn(attendanceRepository, "create")
        .mockResolvedValue(mockDomainAttendance as any);

      const result = await service.clockIn(
        10,
        "EMP001",
        "John Doe",
        mockFile,
        "On time",
      );

      expect(storageService.saveFile).toHaveBeenCalledWith(mockFile, 10);
      expect(attendanceRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          employeeId: 10,
          employeeCode: "EMP001",
          employeeName: "John Doe",
          type: AttendanceType.CLOCK_IN,
          photoUrl: "uploads/photo.jpg",
          notes: "On time",
          status: AttendanceStatus.COMPLETED,
        }),
      );
      expect(result).toEqual(mockResponseDto);
    });

    it("should clock in without photo and without notes (defaults to null)", async () => {
      jest
        .spyOn(attendanceRepository, "findByEmployeeIdAndDateAndType")
        .mockResolvedValue(null);
      jest
        .spyOn(attendanceRepository, "create")
        .mockResolvedValue(mockDomainAttendance as any);

      const result = await service.clockIn(10, "EMP001", "John Doe");

      expect(storageService.saveFile).not.toHaveBeenCalled();
      expect(attendanceRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          photoUrl: null,
          notes: null,
        }),
      );
      expect(result).toEqual(mockResponseDto);
    });
  });

  describe("clockOut", () => {
    it("should throw BadRequestException when not clocked in yet", async () => {
      jest
        .spyOn(attendanceRepository, "findByEmployeeIdAndDateAndType")
        .mockResolvedValue(null);

      await expect(
        service.clockOut(10, "EMP001", "John Doe", mockFile, "notes"),
      ).rejects.toThrow("You must clock in before clocking out");
      expect(attendanceRepository.create).not.toHaveBeenCalled();
    });

    it("should throw ConflictException when already clocked out today", async () => {
      jest
        .spyOn(attendanceRepository, "findByEmployeeIdAndDateAndType")
        .mockResolvedValueOnce(mockDomainAttendance as any) // clock-in exists
        .mockResolvedValueOnce(mockDomainAttendance as any); // clock-out exists

      await expect(
        service.clockOut(10, "EMP001", "John Doe", mockFile, "notes"),
      ).rejects.toThrow("You have already clocked out today");
      expect(attendanceRepository.create).not.toHaveBeenCalled();
    });

    it("should clock out with photo and notes", async () => {
      jest
        .spyOn(attendanceRepository, "findByEmployeeIdAndDateAndType")
        .mockResolvedValueOnce(mockDomainAttendance as any) // clock-in exists
        .mockResolvedValueOnce(null); // no clock-out yet
      jest
        .spyOn(storageService, "saveFile")
        .mockResolvedValue("uploads/photo.jpg");
      jest
        .spyOn(attendanceRepository, "create")
        .mockResolvedValue(mockDomainAttendance as any);

      const result = await service.clockOut(
        10,
        "EMP001",
        "John Doe",
        mockFile,
        "Leaving now",
      );

      expect(storageService.saveFile).toHaveBeenCalledWith(mockFile, 10);
      expect(attendanceRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: AttendanceType.CLOCK_OUT,
          photoUrl: "uploads/photo.jpg",
          notes: "Leaving now",
          status: AttendanceStatus.COMPLETED,
        }),
      );
      expect(result).toEqual(mockResponseDto);
    });

    it("should clock out without photo and without notes (defaults to null)", async () => {
      jest
        .spyOn(attendanceRepository, "findByEmployeeIdAndDateAndType")
        .mockResolvedValueOnce(mockDomainAttendance as any)
        .mockResolvedValueOnce(null);
      jest
        .spyOn(attendanceRepository, "create")
        .mockResolvedValue(mockDomainAttendance as any);

      const result = await service.clockOut(10, "EMP001", "John Doe");

      expect(storageService.saveFile).not.toHaveBeenCalled();
      expect(attendanceRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          photoUrl: null,
          notes: null,
        }),
      );
      expect(result).toEqual(mockResponseDto);
    });
  });

  describe("findMyAttendances", () => {
    it("should use provided page and limit", async () => {
      const query = {
        page: 2,
        limit: 5,
        date: "2026-08-01",
      } as GetMyAttendancesQueryDto;
      jest.spyOn(attendanceRepository, "findMyAttendances").mockResolvedValue({
        data: [mockDomainAttendance as any],
        total: 11,
        totalPages: 3,
      } as any);

      const result = await service.findMyAttendances(10, query);

      expect(attendanceRepository.findMyAttendances).toHaveBeenCalledWith({
        employeeId: 10,
        page: 2,
        limit: 5,
        date: "2026-08-01",
      });
      expect(result).toEqual({
        data: [mockResponseDto],
        pagination: {
          totalData: 11,
          totalPage: 3,
          limit: 5,
          offset: 5,
        },
      });
    });

    it("should default page to 1 and limit to 10 when not provided", async () => {
      const query = {} as GetMyAttendancesQueryDto;
      jest.spyOn(attendanceRepository, "findMyAttendances").mockResolvedValue({
        data: [],
        total: 0,
        totalPages: 0,
      } as any);

      const result = await service.findMyAttendances(10, query);

      expect(attendanceRepository.findMyAttendances).toHaveBeenCalledWith({
        employeeId: 10,
        page: 1,
        limit: 10,
        date: undefined,
      });
      expect(result.pagination).toEqual({
        totalData: 0,
        totalPage: 0,
        limit: 10,
        offset: 0,
      });
    });
  });

  describe("findAll", () => {
    it("should use provided page, limit, and filters", async () => {
      const query = {
        page: 3,
        limit: 20,
        date: "2026-08-01",
        employeeId: 10,
        status: AttendanceStatus.COMPLETED,
      } as GetAttendancesQueryDto;
      jest.spyOn(attendanceRepository, "findAll").mockResolvedValue({
        data: [mockDomainAttendance as any],
        total: 41,
        totalPages: 3,
      } as any);

      const result = await service.findAll(query);

      expect(attendanceRepository.findAll).toHaveBeenCalledWith({
        page: 3,
        limit: 20,
        date: "2026-08-01",
        employeeId: 10,
        status: AttendanceStatus.COMPLETED,
      });
      expect(result).toEqual({
        data: [mockResponseDto],
        pagination: {
          totalData: 41,
          totalPage: 3,
          limit: 20,
          offset: 40,
        },
      });
    });

    it("should default page to 1 and limit to 10 when not provided", async () => {
      const query = {} as GetAttendancesQueryDto;
      jest.spyOn(attendanceRepository, "findAll").mockResolvedValue({
        data: [],
        total: 0,
        totalPages: 0,
      } as any);

      const result = await service.findAll(query);

      expect(attendanceRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        date: undefined,
        employeeId: undefined,
        status: undefined,
      });
      expect(result.pagination).toEqual({
        totalData: 0,
        totalPage: 0,
        limit: 10,
        offset: 0,
      });
    });
  });

  describe("findById", () => {
    it("should throw NotFoundException when record does not exist", async () => {
      jest.spyOn(attendanceRepository, "findById").mockResolvedValue(null);

      await expect(service.findById(99, 10, "EMPLOYEE")).rejects.toThrow(
        "Attendance record #99 not found",
      );
    });

    it("should throw ForbiddenException when non-admin requests another employee's record", async () => {
      jest
        .spyOn(attendanceRepository, "findById")
        .mockResolvedValue({ ...mockDomainAttendance, employeeId: 10 } as any);

      await expect(service.findById(1, 99, "EMPLOYEE")).rejects.toThrow(
        "You do not have permission to view this record",
      );
    });

    it("should return the record when non-admin requests their own record", async () => {
      jest
        .spyOn(attendanceRepository, "findById")
        .mockResolvedValue({ ...mockDomainAttendance, employeeId: 10 } as any);

      const result = await service.findById(1, 10, "EMPLOYEE");

      expect(result).toEqual(mockResponseDto);
    });

    it("should return the record when role is ADMIN regardless of ownership", async () => {
      jest
        .spyOn(attendanceRepository, "findById")
        .mockResolvedValue({ ...mockDomainAttendance, employeeId: 10 } as any);

      const result = await service.findById(1, 99, "ADMIN");

      expect(result).toEqual(mockResponseDto);
    });
  });
});
