import { Employee, FindEmployeesOptions, IEmployeeRepository, PaginatedResult } from '@modules/employee/domain/entities/employee.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { EmployeeEntity } from '../entities/employee.entity';

@Injectable()
export class EmployeeRepository implements IEmployeeRepository {
  constructor(
    @InjectRepository(EmployeeEntity)
    private readonly repo: Repository<EmployeeEntity>,
  ) { }

  async findAll(options: FindEmployeesOptions): Promise<PaginatedResult<Employee>> {
    const { page, limit, search } = options;
    const skip = (page - 1) * limit;

    const whereConditions: any[] = [];

    if (search) {
      whereConditions.push(
        { name: Like(`%${search}%`) },
        { employeeCode: Like(`%${search}%`) },
        { position: Like(`%${search}%`) },
      );
    }

    const [entities, total] = await this.repo.findAndCount({
      where: whereConditions.length > 0 ? whereConditions : undefined,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: entities.map((e) => e.toDomain()),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<Employee | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? entity.toDomain() : null;
  }

  async findByEmployeeCode(code: string): Promise<Employee | null> {
    const entity = await this.repo.findOne({ where: { employeeCode: code } });
    return entity ? entity.toDomain() : null;
  }

  async countAll(): Promise<number> {
    return this.repo.count();
  }

  async create(employee: Partial<Employee>): Promise<Employee> {
    const entity = EmployeeEntity.fromDomain(employee);
    const saved = await this.repo.save(entity);
    return saved.toDomain();
  }

  async update(id: number, employee: Partial<Employee>): Promise<Employee> {
    await this.repo.update(id, {
      ...(employee.name !== undefined && { name: employee.name }),
      ...(employee.position !== undefined && { position: employee.position }),
      ...(employee.phone !== undefined && { phone: employee.phone }),
      ...(employee.joinDate !== undefined && { joinDate: employee.joinDate }),
    });
    const updated = await this.repo.findOne({ where: { id } });
    return updated!.toDomain();
  }

  async softDelete(id: number): Promise<void> {
    await this.repo.softDelete(id);
  }

  async restore(id: number): Promise<void> {
    await this.repo.restore(id);
  }
}
