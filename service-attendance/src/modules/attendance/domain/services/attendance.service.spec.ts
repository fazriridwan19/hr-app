import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { ATTENDANCE_REPOSITORY } from '../../domain/repositories/attendance.repository.interface';
import { AttendanceCacheService } from '../../infrastructure/cache/attendance-cache.service';
import { FileStorageService } from '../../infrastructure/storage/file-storage.service';
import { AttendanceProducer } from '../../infrastructure/queue/producers/attendance.producer';
import { AttendanceStatus, AttendanceType } from '../../domain/entities/attendance.entity';

const mockRepository = {
  findByEmployeeIdAndDateAndType: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findMyAttendances: jest.fn(),
  countByEmployeeAndDate: jest.fn(),
};

const mockCacheService = {
  getTodayStatus: jest.fn(),
  setTodayStatus: jest.fn(),
  invalidateTodayStatus: jest.fn(),
};

const mockStorageService = {
  saveFile: jest.fn(),
};

const mockProducer = {
  addClockInJob: jest.fn(),
  addClockOutJob: jest.fn(),
};

describe('AttendanceService', () => {
  let service: AttendanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        { provide: ATTENDANCE_REPOSITORY, useValue: mockRepository },
        { provide: AttendanceCacheService, useValue: mockCacheService },
        { provide: FileStorageService, useValue: mockStorageService },
        { provide: AttendanceProducer, useValue: mockProducer },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('clockIn', () => {
    it('should create a clock-in record successfully', async () => {
      mockCacheService.getTodayStatus.mockResolvedValue(null);
      mockRepository.findByEmployeeIdAndDateAndType.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue({
        id: 1,
        employeeId: 10,
        employeeCode: 'EMP-0010',
        employeeName: 'Test User',
        type: AttendanceType.CLOCK_IN,
        photoUrl: null,
        clockDate: new Date('2024-01-15'),
        clockTime: '08:30:00',
        status: AttendanceStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockCacheService.setTodayStatus.mockResolvedValue(undefined);
      mockProducer.addClockInJob.mockResolvedValue(undefined);

      const result = await service.clockIn(10, 'EMP-0010', 'Test User', undefined);

      expect(result.type).toBe(AttendanceType.CLOCK_IN);
      expect(result.status).toBe(AttendanceStatus.PENDING);
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(mockProducer.addClockInJob).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException if already clocked in (from cache)', async () => {
      mockCacheService.getTodayStatus.mockResolvedValue({ clockIn: true, clockOut: false });

      await expect(service.clockIn(10, 'EMP-0010', 'Test User', undefined)).rejects.toThrow(
        ConflictException,
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if already clocked in (from DB)', async () => {
      mockCacheService.getTodayStatus.mockResolvedValue(null);
      mockRepository.findByEmployeeIdAndDateAndType.mockResolvedValue({
        id: 1,
        type: AttendanceType.CLOCK_IN,
      });

      await expect(service.clockIn(10, 'EMP-0010', 'Test User', undefined)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('clockOut', () => {
    it('should throw BadRequestException if no clock-in exists', async () => {
      mockCacheService.getTodayStatus.mockResolvedValue({ clockIn: false, clockOut: false });
      mockRepository.findByEmployeeIdAndDateAndType.mockResolvedValue(null);

      await expect(service.clockOut(10, 'EMP-0010', 'Test User', undefined)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException if already clocked out', async () => {
      mockCacheService.getTodayStatus.mockResolvedValue({ clockIn: true, clockOut: true });

      await expect(service.clockOut(10, 'EMP-0010', 'Test User', undefined)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create a clock-out record when clock-in exists', async () => {
      mockCacheService.getTodayStatus.mockResolvedValue({ clockIn: true, clockOut: false, clockInId: 1 });
      mockRepository.findByEmployeeIdAndDateAndType
        .mockResolvedValueOnce(null); // no existing clock-out
      mockRepository.create.mockResolvedValue({
        id: 2,
        employeeId: 10,
        employeeCode: 'EMP-0010',
        employeeName: 'Test User',
        type: AttendanceType.CLOCK_OUT,
        photoUrl: null,
        clockDate: new Date('2024-01-15'),
        clockTime: '17:00:00',
        status: AttendanceStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockCacheService.setTodayStatus.mockResolvedValue(undefined);
      mockProducer.addClockOutJob.mockResolvedValue(undefined);

      const result = await service.clockOut(10, 'EMP-0010', 'Test User', undefined);

      expect(result.type).toBe(AttendanceType.CLOCK_OUT);
      expect(result.status).toBe(AttendanceStatus.PENDING);
      expect(mockProducer.addClockOutJob).toHaveBeenCalledTimes(1);
    });
  });
});
