import { Employee } from "@modules/employee/domain/entities/employee.entity";
import { Like, Repository } from "typeorm";
import { EmployeeEntity } from "../entities/employee.entity";
import { EmployeeRepository } from "./employee.repository";

describe("EmployeeRepository", () => {
  let repository: EmployeeRepository;
  let repo: Repository<EmployeeEntity>;

  const mockDomainEmployee = {
    id: 1,
    employeeCode: "EMP0001",
    name: "John Doe",
    position: "Engineer",
    phone: "08123456789",
    joinDate: new Date("2026-01-01"),
  } as unknown as Employee;

  const mockEntity = {
    toDomain: jest.fn().mockReturnValue(mockDomainEmployee),
  } as unknown as EmployeeEntity;

  beforeEach(() => {
    repo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
    } as unknown as Repository<EmployeeEntity>;

    repository = new EmployeeRepository(repo);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("findAll", () => {
    it("should search across name, employeeCode, and position when search is provided", async () => {
      jest.spyOn(repo, "findAndCount").mockResolvedValue([[mockEntity], 21]);

      const result = await repository.findAll({
        page: 2,
        limit: 10,
        search: "John",
      });

      expect(repo.findAndCount).toHaveBeenCalledWith({
        where: [
          { name: Like("%John%") },
          { employeeCode: Like("%John%") },
          { position: Like("%John%") },
        ],
        skip: 10,
        take: 10,
        order: { createdAt: "DESC" },
      });
      expect(result).toEqual({
        data: [mockDomainEmployee],
        total: 21,
        page: 2,
        limit: 10,
        totalPages: 3,
      });
    });

    it("should not filter by search when it is not provided", async () => {
      jest.spyOn(repo, "findAndCount").mockResolvedValue([[], 0]);

      const result = await repository.findAll({ page: 1, limit: 10 });

      expect(repo.findAndCount).toHaveBeenCalledWith({
        where: undefined,
        skip: 0,
        take: 10,
        order: { createdAt: "DESC" },
      });
      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });
  });

  describe("findById", () => {
    it("should return the domain entity when found", async () => {
      jest.spyOn(repo, "findOne").mockResolvedValue(mockEntity);

      const result = await repository.findById(1);

      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockDomainEmployee);
    });

    it("should return null when not found", async () => {
      jest.spyOn(repo, "findOne").mockResolvedValue(null);

      const result = await repository.findById(99);

      expect(result).toBeNull();
    });
  });

  describe("findByEmployeeCode", () => {
    it("should return the domain entity when found", async () => {
      jest.spyOn(repo, "findOne").mockResolvedValue(mockEntity);

      const result = await repository.findByEmployeeCode("EMP0001");

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { employeeCode: "EMP0001" },
      });
      expect(result).toEqual(mockDomainEmployee);
    });

    it("should return null when not found", async () => {
      jest.spyOn(repo, "findOne").mockResolvedValue(null);

      const result = await repository.findByEmployeeCode("MISSING");

      expect(result).toBeNull();
    });
  });

  describe("countAll", () => {
    it("should return the total count", async () => {
      jest.spyOn(repo, "count").mockResolvedValue(42);

      const result = await repository.countAll();

      expect(result).toBe(42);
    });
  });

  describe("create", () => {
    it("should build the entity from domain, save it, and return the domain result", async () => {
      const partial: Partial<Employee> = { name: "John Doe" };
      jest.spyOn(EmployeeEntity, "fromDomain").mockReturnValue(mockEntity);
      jest.spyOn(repo, "save").mockResolvedValue(mockEntity);

      const result = await repository.create(partial);

      expect(EmployeeEntity.fromDomain).toHaveBeenCalledWith(partial);
      expect(repo.save).toHaveBeenCalledWith(mockEntity);
      expect(result).toEqual(mockDomainEmployee);
    });
  });

  describe("update", () => {
    it("should include only the fields that are provided", async () => {
      jest.spyOn(repo, "update").mockResolvedValue(undefined as any);
      jest.spyOn(repo, "findOne").mockResolvedValue(mockEntity);

      const partial: Partial<Employee> = {
        name: "Jane Doe",
        position: "Senior Engineer",
        phone: "08987654321",
        joinDate: new Date("2026-02-01"),
      };

      const result = await repository.update(1, partial);

      expect(repo.update).toHaveBeenCalledWith(1, {
        name: "Jane Doe",
        position: "Senior Engineer",
        phone: "08987654321",
        joinDate: new Date("2026-02-01"),
      });
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockDomainEmployee);
    });

    it("should send an empty patch when no fields are provided", async () => {
      jest.spyOn(repo, "update").mockResolvedValue(undefined as any);
      jest.spyOn(repo, "findOne").mockResolvedValue(mockEntity);

      await repository.update(1, {});

      expect(repo.update).toHaveBeenCalledWith(1, {});
    });
  });

  describe("softDelete", () => {
    it("should soft delete the employee by id", async () => {
      jest.spyOn(repo, "softDelete").mockResolvedValue(undefined as any);

      await repository.softDelete(1);

      expect(repo.softDelete).toHaveBeenCalledWith(1);
    });
  });

  describe("restore", () => {
    it("should restore the employee by id", async () => {
      jest.spyOn(repo, "restore").mockResolvedValue(undefined as any);

      await repository.restore(1);

      expect(repo.restore).toHaveBeenCalledWith(1);
    });
  });
});
