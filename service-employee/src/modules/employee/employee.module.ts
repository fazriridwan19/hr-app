import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeController } from './application/controllers/employee.controller';
import { EMPLOYEE_REPOSITORY } from './domain/entities/employee.entity';
import { EmployeeService } from './domain/services/employee.service';
import { EmployeeEntity } from './infrastructure/persistence/entities/employee.entity';
import { EmployeeRepository } from './infrastructure/persistence/repositories/employee.repository';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeEntity])],
  controllers: [EmployeeController],
  providers: [
    EmployeeService,
    {
      provide: EMPLOYEE_REPOSITORY,
      useClass: EmployeeRepository,
    },
  ],
  exports: [EmployeeService, EMPLOYEE_REPOSITORY],
})
export class EmployeeModule { }
