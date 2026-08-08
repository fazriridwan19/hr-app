import { User, UserRole } from "@modules/employee/domain/entities/user.entity";
import { EmployeeEntity } from "@modules/employee/infrastructure/persistence/entities/employee.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "users", synchronize: false })
export class UserEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255 })
  password: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ name: "employee_id", type: "bigint", nullable: true, unique: true })
  employeeId: number | null;

  @ManyToOne(() => EmployeeEntity, { nullable: true, eager: false })
  @JoinColumn({ name: "employee_id" })
  employee?: EmployeeEntity;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  toDomain(): User {
    return new User({
      id: Number(this.id),
      email: this.email,
      password: this.password,
      role: this.role,
      employeeId: this.employeeId ? Number(this.employeeId) : null,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }

  static fromDomain(user: Partial<User>): UserEntity {
    const entity = new UserEntity();
    if (user.email) entity.email = user.email;
    if (user.password) entity.password = user.password;
    if (user.role) entity.role = user.role;
    if (user.employeeId) entity.employeeId = user.employeeId;
    if (user.isActive) entity.isActive = user.isActive;
    return entity;
  }
}
