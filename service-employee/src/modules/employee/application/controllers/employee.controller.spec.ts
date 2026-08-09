import { EmployeeDetailResponseDto } from "@modules/employee/application/dto/employee-detail-response.dto";
import { EmployeeService } from "@modules/employee/domain/services/employee.service";
import {
    EmployeeResponseDto,
    PaginatedEmployeeResponseDto,
} from "../dto/employee-response.dto";
import { FindEmployeesQueryDto } from "../dto/find-employees-query.dto";
import { UpdateEmployeeDto } from "../dto/update-employee.dto";
import { EmployeeController } from "./employee.controller";

describe("EmployeeController", () => {
  let controller: EmployeeController;
  let employeeService: EmployeeService;

  const mockEmployeeResponse = {
    id: 1,
    name: "John Doe",
  } as EmployeeResponseDto;
  const mockEmployeeDetailResponse = {
    id: 1,
    name: "John Doe",
  } as EmployeeDetailResponseDto;
  const mockPaginatedResponse = {
    data: [mockEmployeeResponse],
    pagination: { totalData: 1, totalPage: 1, limit: 10, offset: 0 },
  } as PaginatedEmployeeResponseDto;

  beforeEach(() => {
    employeeService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as unknown as EmployeeService;

    controller = new EmployeeController(employeeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return a paginated list of employees", async () => {
      const query = {
        page: 1,
        limit: 10,
        search: "John",
      } as FindEmployeesQueryDto;
      jest
        .spyOn(employeeService, "findAll")
        .mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll(query);

      expect(employeeService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe("findOne", () => {
    it("should return employee details by id", async () => {
      jest
        .spyOn(employeeService, "findById")
        .mockResolvedValue(mockEmployeeDetailResponse);

      const result = await controller.findOne(1);

      expect(employeeService.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockEmployeeDetailResponse);
    });
  });

  describe("create", () => {
    it("should create a new employee", async () => {
      const dto = { name: "John Doe", email: "john@example.com" } as any;
      jest
        .spyOn(employeeService, "create")
        .mockResolvedValue(mockEmployeeResponse);

      const result = await controller.create(dto);

      expect(employeeService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockEmployeeResponse);
    });
  });

  describe("update", () => {
    it("should update an employee by id", async () => {
      const dto = { name: "John Updated" } as UpdateEmployeeDto;
      jest
        .spyOn(employeeService, "update")
        .mockResolvedValue(mockEmployeeResponse);

      const result = await controller.update(1, dto);

      expect(employeeService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(mockEmployeeResponse);
    });
  });

  describe("remove", () => {
    it("should soft delete an employee by id", async () => {
      jest.spyOn(employeeService, "remove").mockResolvedValue(undefined);

      const result = await controller.remove(1);

      expect(employeeService.remove).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });
  });
});
