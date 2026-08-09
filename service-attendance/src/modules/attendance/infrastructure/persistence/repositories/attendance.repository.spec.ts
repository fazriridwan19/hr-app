import { DataSource, EntityManager, Repository } from "typeorm";
import { AttendanceRepository } from "./attendance.repository";
import { AttendanceEntity } from "../entities/attendance.entity";
import {
  Attendance,
  AttendanceStatus,
  AttendanceType,
} from "@modules/attendance/domain/entities/attendance.entity";

describe("AttendanceRepository", () => {
  let repository: AttendanceRepository;
  let repo: Repository<AttendanceEntity>;
  let dataSource: DataSource;
  let mockQueryBuilder: {
    where: jest.Mock;
    andWhere: jest.Mock;
    orderBy: jest.Mock;
    addOrderBy: jest.Mock;
    skip: jest.Mock;
    take: jest.Mock;
    getManyAndCount: jest.Mock;
  };

  const mockDomainAttendance: Attendance = {
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
  } as unknown as Attendance;

  const mockEntity = {
    toDomain: jest.fn().mockReturnValue(mockDomainAttendance),
  } as unknown as AttendanceEntity;

  beforeEach(() => {
    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    };

    repo = {
      findOne: jest.fn(),
      findOneOrFail: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      save: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    } as unknown as Repository<AttendanceEntity>;

    dataSource = {
      transaction: jest.fn(),
    } as unknown as DataSource;

    repository = new AttendanceRepository(repo, dataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("findById", () => {
    it("should return domain entity when found", async () => {
      jest.spyOn(repo, "findOne").mockResolvedValue(mockEntity);

      const result = await repository.findById(1);

      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockDomainAttendance);
    });

    it("should return null when not found", async () => {
      jest.spyOn(repo, "findOne").mockResolvedValue(null);

      const result = await repository.findById(99);

      expect(result).toBeNull();
    });
  });

  describe("findByEmployeeIdAndDateAndType", () => {
    it("should return domain entity when found", async () => {
      jest.spyOn(repo, "findOne").mockResolvedValue(mockEntity);

      const result = await repository.findByEmployeeIdAndDateAndType(
        10,
        "2026-08-09",
        AttendanceType.CLOCK_IN,
      );

      expect(repo.findOne).toHaveBeenCalledWith({
        where: {
          employeeId: 10,
          clockDate: "2026-08-09",
          type: AttendanceType.CLOCK_IN,
        },
      });
      expect(result).toEqual(mockDomainAttendance);
    });

    it("should return null when not found", async () => {
      jest.spyOn(repo, "findOne").mockResolvedValue(null);

      const result = await repository.findByEmployeeIdAndDateAndType(
        10,
        "2026-08-09",
        AttendanceType.CLOCK_OUT,
      );

      expect(result).toBeNull();
    });
  });

  describe("findAll", () => {
    it("should apply date, employeeId, and status filters when provided", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockEntity], 21]);

      const result = await repository.findAll({
        page: 2,
        limit: 10,
        date: "2026-08-09",
        employeeId: 10,
        status: AttendanceStatus.COMPLETED,
      });

      expect(repo.createQueryBuilder).toHaveBeenCalledWith("a");
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "a.clockDate = :date",
        { date: "2026-08-09" },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "a.employeeId = :employeeId",
        { employeeId: 10 },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "a.status = :status",
        { status: AttendanceStatus.COMPLETED },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        "a.clockDate",
        "DESC",
      );
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith(
        "a.clockTime",
        "DESC",
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        data: [mockDomainAttendance],
        total: 21,
        page: 2,
        limit: 10,
        totalPages: 3,
      });
    });

    it("should skip all optional filters when not provided", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const result = await repository.findAll({
        page: 1,
        limit: 10,
        date: undefined,
        employeeId: undefined,
        status: undefined,
      });

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });
  });

  describe("findMyAttendances", () => {
    it("should apply the date filter when provided", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockEntity], 5]);

      const result = await repository.findMyAttendances({
        employeeId: 10,
        page: 1,
        limit: 10,
        date: "2026-08-09",
      });

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        "a.employeeId = :employeeId",
        { employeeId: 10 },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "a.clockDate = :date",
        { date: "2026-08-09" },
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        data: [mockDomainAttendance],
        total: 5,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it("should skip the date filter when not provided", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const result = await repository.findMyAttendances({
        employeeId: 10,
        page: 1,
        limit: 10,
        date: undefined,
      });

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });
  });

  describe("create", () => {
    it("should build entity from domain, save it, and return the domain result", async () => {
      const partial: Partial<Attendance> = { employeeId: 10 };
      jest.spyOn(AttendanceEntity, "fromDomain").mockReturnValue(mockEntity);
      jest.spyOn(repo, "save").mockResolvedValue(mockEntity);

      const result = await repository.create(partial);

      expect(AttendanceEntity.fromDomain).toHaveBeenCalledWith(partial);
      expect(repo.save).toHaveBeenCalledWith(mockEntity);
      expect(result).toEqual(mockDomainAttendance);
    });
  });

  describe("update", () => {
    it("should update the entity and return the refreshed domain result", async () => {
      const partial: Partial<Attendance> = { notes: "updated" };
      jest.spyOn(AttendanceEntity, "fromDomain").mockReturnValue(mockEntity);
      jest.spyOn(repo, "update").mockResolvedValue(undefined as any);
      jest.spyOn(repo, "findOneOrFail").mockResolvedValue(mockEntity);

      const result = await repository.update(1, partial);

      expect(AttendanceEntity.fromDomain).toHaveBeenCalledWith(partial);
      expect(repo.update).toHaveBeenCalledWith(1, mockEntity);
      expect(repo.findOneOrFail).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockDomainAttendance);
    });
  });

  describe("countByEmployeeAndDate", () => {
    it("should return the count from the repository", async () => {
      jest.spyOn(repo, "count").mockResolvedValue(3);

      const result = await repository.countByEmployeeAndDate(10, "2026-08-09");

      expect(repo.count).toHaveBeenCalledWith({
        where: { employeeId: 10, clockDate: "2026-08-09" },
      });
      expect(result).toBe(3);
    });
  });

  describe("insertAutoClockOut", () => {
    let mockManagerQueryBuilder: {
      setLock: jest.Mock;
      setOnLocked: jest.Mock;
      leftJoin: jest.Mock;
      where: jest.Mock;
      andWhere: jest.Mock;
      take: jest.Mock;
      getMany: jest.Mock;
    };
    let mockInsert: jest.Mock;
    let manager: EntityManager;

    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date("2026-08-09T10:00:00.000Z"));

      mockManagerQueryBuilder = {
        setLock: jest.fn().mockReturnThis(),
        setOnLocked: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      };

      mockInsert = jest.fn();

      manager = {
        createQueryBuilder: jest.fn().mockReturnValue(mockManagerQueryBuilder),
        getRepository: jest.fn().mockReturnValue({ insert: mockInsert }),
      } as unknown as EntityManager;

      jest
        .spyOn(dataSource, "transaction")
        .mockImplementation(async (cb: any) => cb(manager));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should insert nothing and return an empty array when there is nothing to auto clock-out", async () => {
      mockManagerQueryBuilder.getMany.mockResolvedValue([]);

      const result = await repository.insertAutoClockOut();

      expect(manager.createQueryBuilder).toHaveBeenCalledWith(
        AttendanceEntity,
        "attendance",
      );
      expect(mockManagerQueryBuilder.setLock).toHaveBeenCalledWith(
        "pessimistic_write",
      );
      expect(mockManagerQueryBuilder.setOnLocked).toHaveBeenCalledWith(
        "skip_locked",
      );
      expect(mockManagerQueryBuilder.where).toHaveBeenCalledWith(
        "attendance.type = :type",
        { type: AttendanceType.CLOCK_IN },
      );
      expect(mockManagerQueryBuilder.take).toHaveBeenCalledWith(5);
      expect(mockInsert).toHaveBeenCalledWith([]);
      expect(result).toEqual([]);
    });

    it("should insert an auto clock-out record for each pending attendance and return the domain results", async () => {
      const pendingAttendance = {
        employeeId: 10,
        employeeCode: "EMP001",
        employeeName: "John Doe",
        clockDate: "2026-08-08",
        toDomain: jest.fn().mockReturnValue(mockDomainAttendance),
      };
      mockManagerQueryBuilder.getMany.mockResolvedValue([pendingAttendance]);

      const result = await repository.insertAutoClockOut();

      expect(mockInsert).toHaveBeenCalledWith([
        expect.objectContaining({
          employeeId: 10,
          employeeCode: "EMP001",
          employeeName: "John Doe",
          type: AttendanceType.CLOCK_OUT,
          clockDate: "2026-08-08",
          clockTime: "10:00:00",
          status: AttendanceStatus.COMPLETED,
          notes: "Clocked out by system",
        }),
      ]);
      expect(pendingAttendance.toDomain).toHaveBeenCalled();
      expect(result).toEqual([mockDomainAttendance]);
    });
  });
});
