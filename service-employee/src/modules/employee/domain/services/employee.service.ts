import { CreateEmployeeDto } from "@modules/employee/application/dto/create-employee.dto";
import { EmployeeDetailResponseDto } from "@modules/employee/application/dto/employee-detail-response.dto";
import {
  EmployeeResponseDto,
  PaginatedEmployeeResponseDto,
} from "@modules/employee/application/dto/employee-response.dto";
import { FindEmployeesQueryDto } from "@modules/employee/application/dto/find-employees-query.dto";
import { UpdateEmployeeDto } from "@modules/employee/application/dto/update-employee.dto";
import {
  Employee,
  EMPLOYEE_REPOSITORY,
  FindEmployeesOptions,
  IEmployeeRepository,
  PaginatedResult,
} from "@modules/employee/domain/entities/employee.entity";
import {
  IUserRepository,
  USER_REPOSITORY,
} from "@modules/employee/domain/entities/user.entity";
import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";

@Injectable()
export class EmployeeService {
  private readonly logger = new Logger(EmployeeService.name);

  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: IEmployeeRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  private async generateEmployeeCode(): Promise<string> {
    const count = await this.employeeRepository.countAll();
    let sequence = count + 1;
    let code: string;
    let existing: Employee | null;
    do {
      code = Employee.generateCode(sequence);
      existing = await this.employeeRepository.findByEmployeeCode(code);
      if (existing) sequence++;
    } while (existing);
    return code;
  }

  async findAll(
    query: FindEmployeesQueryDto,
  ): Promise<PaginatedEmployeeResponseDto> {
    const options: FindEmployeesOptions = {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      search: query.search,
    };

    const result: PaginatedResult<Employee> =
      await this.employeeRepository.findAll(options);

    const offset = (options.page - 1) * options.limit;

    const employeeIds = result.data.map((employee) => employee.id);
    const users = await this.userRepository.findByEmployeeIds(employeeIds);
    const employeeWithUserMap = new Map<number, boolean>();
    for (const employee of result.data) {
      const hasUser = users.some((u) => u.employeeId === employee.id);
      employeeWithUserMap.set(employee.id, hasUser);
    }

    return {
      data: result.data.map((element) =>
        EmployeeResponseDto.fromDomain(
          element,
          employeeWithUserMap.get(element.id) ?? false,
        ),
      ),
      pagination: {
        totalData: result.total,
        totalPage: result.totalPages,
        limit: options.limit,
        offset,
      },
    };
  }

  async findById(id: number): Promise<EmployeeDetailResponseDto> {
    const employee = await this.employeeRepository.findById(id);
    if (!employee) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }
    const user = await this.userRepository.findByEmployeeId(id);
    if (!user) {
      throw new NotFoundException(
        `User account for employee ${employee.name} not found`,
      );
    }
    return EmployeeDetailResponseDto.fromDomain(employee, user);
  }

  async create(dto: CreateEmployeeDto): Promise<EmployeeResponseDto> {
    const employeeCode = await this.generateEmployeeCode();

    const employee = await this.employeeRepository.create({
      employeeCode,
      name: dto.name,
      position: dto.position,
      phone: dto.phone ?? null,
      joinDate: dto.joinDate ? new Date(dto.joinDate) : null,
    });

    this.logger.log(
      `Created employee: ${employee.employeeCode} - ${employee.name}`,
    );
    return EmployeeResponseDto.fromDomain(employee);
  }

  async update(
    id: number,
    dto: UpdateEmployeeDto,
  ): Promise<EmployeeResponseDto> {
    const existing = await this.employeeRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }

    const updated = await this.employeeRepository.update(id, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.position !== undefined && { position: dto.position }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.joinDate !== undefined && { joinDate: new Date(dto.joinDate) }),
    });

    this.logger.log(`Updated employee: ${updated.employeeCode}`);
    return EmployeeResponseDto.fromDomain(updated);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.employeeRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }

    await this.employeeRepository.softDelete(id);
    this.logger.log(`Soft deleted employee id: ${id}`);
  }
}
