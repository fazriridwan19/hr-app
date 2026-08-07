import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './domain/services/user.service';
import { UserController } from './application/controllers/user.controller';
import { EmployeeModule } from '../employee/employee.module';
import { USER_REPOSITORY } from './domain/entities/user.entity';
import { UserEntity } from './infrastructure/persistence/entities/user.entity';
import { UserRepository } from './infrastructure/persistence/repositories/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), EmployeeModule],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [UserService, USER_REPOSITORY],
})
export class UserModule { }
