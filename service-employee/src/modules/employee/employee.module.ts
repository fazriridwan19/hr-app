import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmployeeController } from "./application/controllers/employee.controller";
import { EMPLOYEE_REPOSITORY } from "./domain/entities/employee.entity";
import { EmployeeService } from "./domain/services/employee.service";
import { EmployeeEntity } from "./infrastructure/persistence/entities/employee.entity";
import { EmployeeRepository } from "./infrastructure/persistence/repositories/employee.repository";
import { USER_REPOSITORY } from "@modules/employee/domain/entities/user.entity";
import { UserRepository } from "@modules/employee/infrastructure/persistence/repositories/user.repository";
import { UserEntity } from "@modules/employee/infrastructure/persistence/entities/user.entity";
import { UserController } from "@modules/employee/application/controllers/user.controller";
import { UserService } from "@modules/employee/domain/services/user.service";

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeEntity, UserEntity])],
  controllers: [EmployeeController, UserController],
  providers: [
    EmployeeService,
    UserService,
    {
      provide: EMPLOYEE_REPOSITORY,
      useClass: EmployeeRepository,
    },
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [EmployeeService, EMPLOYEE_REPOSITORY, USER_REPOSITORY],
})
export class EmployeeModule {}
