import { Logger, NotFoundException } from "@nestjs/common";
import { EmployeeService } from "./employee.service";
import {
  Employee,
  IEmployeeRepository,
} from "@modules/employee/domain/entities/employee.entity";
import { IUserRepository } from "@modules/employee/domain/entities/user.entity";
import { CreateEmployeeDto } from "@modules/employee/application/dto/create-employee.dto";
import { UpdateEmployeeDto } from "@modules/employee/application/dto/update-employee.dto";
import { FindEmployeesQueryDto } from "@modules/employee/application/dto/find-employees-query.dto";
import { EmployeeResponseDto } from "@modules/employee/application/dto/employee-response.dto";
import { EmployeeDetailResponseDto } from "@modules/employee/application/dto/employee-detail-response.dto";

describe("EmployeeService", () => {
  let service: EmployeeService;
  let employeeRepository: IEmployeeRepository;
  let userRepository: IUserRepository;

  const mockEmployee = {
    id: 1,
    employeeCode: "EMP0001",
    name: "John Doe",
    position: "Engineer",
    phone: "08123456789",
    joinDate: new Date("2026-01-01"),
  } as unknown as Employee;

  const mockUser = { id: 5, employeeId: 1, email: "john@example.com" };

  const mockEmployeeResponse = { id: 1 } as EmployeeResponseDto;
  const mockEmployeeDetailResponse = { id: 1 } as EmployeeDetailResponseDto;

  beforeEach(() => {
    employeeRepository = {
      countAll: jest.fn(),
      findByEmployeeCode: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    } as unknown as IEmployeeRepository;

    userRepository = {
      findByEmployeeIds: jest.fn().mockResolvedValue([]),
      findByEmployeeId: jest.fn(),
    } as unknown as IUserRepository;

    service = new EmployeeService(employeeRepository, userRepository);

    jest.spyOn(Logger.prototype, "log").mockImplementation(() => undefined);
    jest
      .spyOn(EmployeeResponseDto, "fromDomain")
      .mockReturnValue(mockEmployeeResponse);
    jest
      .spyOn(EmployeeDetailResponseDto, "fromDomain")
      .mockReturnValue(mockEmployeeDetailResponse);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("findAll", () => {
    it("should use provided page and limit, and mark employees that have a user account", async () => {
      const employeeWithUser = { ...mockEmployee, id: 1 };
      const employeeWithoutUser = { ...mockEmployee, id: 2 };
      jest.spyOn(employeeRepository, "findAll").mockResolvedValue({
        data: [employeeWithUser, employeeWithoutUser] as unknown as Employee[],
        total: 2,
        page: 2,
        limit: 5,
        totalPages: 1,
      });
      jest
        .spyOn(userRepository, "findByEmployeeIds")
        .mockResolvedValue([{ id: 5, employeeId: 1 }] as any);

      const query = {
        page: 2,
        limit: 5,
        search: "John",
      } as FindEmployeesQueryDto;
      const result = await service.findAll(query);

      expect(employeeRepository.findAll).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        search: "John",
      });
      expect(userRepository.findByEmployeeIds).toHaveBeenCalledWith([1, 2]);
      expect(EmployeeResponseDto.fromDomain).toHaveBeenCalledWith(
        employeeWithUser,
        true,
      );
      expect(EmployeeResponseDto.fromDomain).toHaveBeenCalledWith(
        employeeWithoutUser,
        false,
      );
      expect(result.pagination).toEqual({
        totalData: 2,
        totalPage: 1,
        limit: 5,
        offset: 5,
      });
    });

    it("should default page to 1 and limit to 10 when not provided", async () => {
      jest.spyOn(employeeRepository, "findAll").mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      const query = {} as FindEmployeesQueryDto;
      const result = await service.findAll(query);

      expect(employeeRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
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
    it("should throw NotFoundException when the employee does not exist", async () => {
      jest.spyOn(employeeRepository, "findById").mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(
        "Employee with id 99 not found",
      );
    });

    it("should throw NotFoundException when the employee has no user account", async () => {
      jest
        .spyOn(employeeRepository, "findById")
        .mockResolvedValue(mockEmployee);
      jest.spyOn(userRepository, "findByEmployeeId").mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toThrow(
        `User account for employee ${mockEmployee.name} not found`,
      );
    });

    it("should return employee details when both employee and user exist", async () => {
      jest
        .spyOn(employeeRepository, "findById")
        .mockResolvedValue(mockEmployee);
      jest
        .spyOn(userRepository, "findByEmployeeId")
        .mockResolvedValue(mockUser as any);

      const result = await service.findById(1);

      expect(EmployeeDetailResponseDto.fromDomain).toHaveBeenCalledWith(
        mockEmployee,
        mockUser,
      );
      expect(result).toEqual(mockEmployeeDetailResponse);
    });
  });

  describe("create", () => {
    it("should generate a code on the first attempt when it does not collide", async () => {
      jest.spyOn(employeeRepository, "countAll").mockResolvedValue(0);
      jest
        .spyOn(employeeRepository, "findByEmployeeCode")
        .mockResolvedValueOnce(null);
      jest.spyOn(employeeRepository, "create").mockResolvedValue(mockEmployee);

      const dto = {
        name: "John Doe",
        position: "Engineer",
        phone: "08123456789",
        joinDate: "2026-01-01",
      } as CreateEmployeeDto;

      const result = await service.create(dto);

      expect(employeeRepository.findByEmployeeCode).toHaveBeenCalledTimes(1);
      expect(employeeRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "John Doe",
          position: "Engineer",
          phone: "08123456789",
          joinDate: new Date("2026-01-01"),
        }),
      );
      expect(result).toEqual(mockEmployeeResponse);
    });

    it("should retry generating a code when the first one already exists", async () => {
      jest.spyOn(employeeRepository, "countAll").mockResolvedValue(0);
      jest
        .spyOn(employeeRepository, "findByEmployeeCode")
        .mockResolvedValueOnce(mockEmployee)
        .mockResolvedValueOnce(null);
      jest.spyOn(employeeRepository, "create").mockResolvedValue(mockEmployee);

      const dto = {
        name: "John Doe",
        position: "Engineer",
      } as CreateEmployeeDto;

      await service.create(dto);

      expect(employeeRepository.findByEmployeeCode).toHaveBeenCalledTimes(2);
    });

    it("should default phone to null and joinDate to null when not provided", async () => {
      jest.spyOn(employeeRepository, "countAll").mockResolvedValue(0);
      jest
        .spyOn(employeeRepository, "findByEmployeeCode")
        .mockResolvedValueOnce(null);
      jest.spyOn(employeeRepository, "create").mockResolvedValue(mockEmployee);

      const dto = {
        name: "John Doe",
        position: "Engineer",
      } as CreateEmployeeDto;

      await service.create(dto);

      expect(employeeRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ phone: null, joinDate: null }),
      );
    });
  });

  describe("update", () => {
    it("should throw NotFoundException when the employee does not exist", async () => {
      jest.spyOn(employeeRepository, "findById").mockResolvedValue(null);

      await expect(service.update(99, {} as UpdateEmployeeDto)).rejects.toThrow(
        "Employee with id 99 not found",
      );
    });

    it("should include only the fields that are provided", async () => {
      jest
        .spyOn(employeeRepository, "findById")
        .mockResolvedValue(mockEmployee);
      jest.spyOn(employeeRepository, "update").mockResolvedValue(mockEmployee);

      const dto = {
        name: "Jane Doe",
        position: "Senior Engineer",
        phone: "08987654321",
        joinDate: "2026-02-01",
      } as UpdateEmployeeDto;

      await service.update(1, dto);

      expect(employeeRepository.update).toHaveBeenCalledWith(1, {
        name: "Jane Doe",
        position: "Senior Engineer",
        phone: "08987654321",
        joinDate: new Date("2026-02-01"),
      });
    });

    it("should send an empty patch when no fields are provided", async () => {
      jest
        .spyOn(employeeRepository, "findById")
        .mockResolvedValue(mockEmployee);
      jest.spyOn(employeeRepository, "update").mockResolvedValue(mockEmployee);

      const result = await service.update(1, {} as UpdateEmployeeDto);

      expect(employeeRepository.update).toHaveBeenCalledWith(1, {});
      expect(result).toEqual(mockEmployeeResponse);
    });
  });

  describe("remove", () => {
    it("should throw NotFoundException when the employee does not exist", async () => {
      jest.spyOn(employeeRepository, "findById").mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(
        "Employee with id 99 not found",
      );
      expect(employeeRepository.softDelete).not.toHaveBeenCalled();
    });

    it("should soft delete the employee when it exists", async () => {
      jest
        .spyOn(employeeRepository, "findById")
        .mockResolvedValue(mockEmployee);
      jest.spyOn(employeeRepository, "softDelete").mockResolvedValue(undefined);

      await service.remove(1);

      expect(employeeRepository.softDelete).toHaveBeenCalledWith(1);
    });
  });
});
