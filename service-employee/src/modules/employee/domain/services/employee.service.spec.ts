import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EMPLOYEE_REPOSITORY } from '../../domain/repositories/employee.repository.interface';
import { Employee } from '../../domain/entities/employee.entity';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let employeeRepository: jest.Mocked<any>;

  const mockEmployee: Employee = new Employee({
    id: 1,
    employeeCode: 'EMP-0001',
    name: 'John Doe',
    position: 'Software Engineer',
    phone: '08123456789',
    joinDate: new Date('2024-01-15'),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        {
          provide: EMPLOYEE_REPOSITORY,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByEmployeeCode: jest.fn(),
            countAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            restore: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
    employeeRepository = module.get(EMPLOYEE_REPOSITORY);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated employees', async () => {
      const mockResult = {
        data: [mockEmployee],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      employeeRepository.findAll.mockResolvedValue(mockResult);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(employeeRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
      });
    });
  });

  describe('findById', () => {
    it('should return employee when found', async () => {
      employeeRepository.findById.mockResolvedValue(mockEmployee);

      const result = await service.findById(1);

      expect(result.id).toBe(1);
      expect(result.name).toBe('John Doe');
      expect(result.employeeCode).toBe('EMP-0001');
    });

    it('should throw NotFoundException when employee not found', async () => {
      employeeRepository.findById.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new employee with auto-generated code', async () => {
      const createDto = {
        name: 'Jane Smith',
        position: 'Product Manager',
        phone: '08987654321',
        joinDate: '2024-02-01',
      };

      employeeRepository.countAll.mockResolvedValue(0);
      employeeRepository.findByEmployeeCode.mockResolvedValue(null);
      employeeRepository.create.mockResolvedValue(
        new Employee({
          ...mockEmployee,
          id: 2,
          employeeCode: 'EMP-0001',
          name: 'Jane Smith',
          position: 'Product Manager',
        }),
      );

      const result = await service.create(createDto);

      expect(result.name).toBe('Jane Smith');
      expect(employeeRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Jane Smith',
          position: 'Product Manager',
        }),
      );
    });

    it('should generate unique employee code with EMP-XXXX format', () => {
      expect(Employee.generateCode(1)).toBe('EMP-0001');
      expect(Employee.generateCode(10)).toBe('EMP-0010');
      expect(Employee.generateCode(100)).toBe('EMP-0100');
      expect(Employee.generateCode(1000)).toBe('EMP-1000');
    });
  });

  describe('update', () => {
    it('should update employee successfully', async () => {
      const updateDto = { name: 'John Doe Updated', position: 'Senior Engineer' };
      const updatedEmployee = new Employee({
        ...mockEmployee,
        name: 'John Doe Updated',
        position: 'Senior Engineer',
      });

      employeeRepository.findById.mockResolvedValue(mockEmployee);
      employeeRepository.update.mockResolvedValue(updatedEmployee);

      const result = await service.update(1, updateDto);

      expect(result.name).toBe('John Doe Updated');
      expect(result.position).toBe('Senior Engineer');
    });

    it('should throw NotFoundException when updating non-existent employee', async () => {
      employeeRepository.findById.mockResolvedValue(null);

      await expect(
        service.update(999, { name: 'Ghost' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete employee successfully', async () => {
      employeeRepository.findById.mockResolvedValue(mockEmployee);
      employeeRepository.softDelete.mockResolvedValue(undefined);

      await service.remove(1);

      expect(employeeRepository.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when deleting non-existent employee', async () => {
      employeeRepository.findById.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
