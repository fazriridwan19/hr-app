import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";
import { Employee } from "../../../domain/entities/employee.entity";

@Entity({ name: "employees", synchronize: false })
export class EmployeeEntity {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Column({ name: "employee_code", type: "varchar", length: 20, unique: true })
  employeeCode: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 255 })
  position: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  phone: string | null;

  @Column({ name: "join_date", type: "date", nullable: true })
  joinDate: Date | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt: Date | null;

  toDomain(): Employee {
    return new Employee({
      id: Number(this.id),
      employeeCode: this.employeeCode,
      name: this.name,
      position: this.position,
      phone: this.phone,
      joinDate: this.joinDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    });
  }

  static fromDomain(employee: Partial<Employee>): EmployeeEntity {
    const entity = new EmployeeEntity();
    if (employee.employeeCode) entity.employeeCode = employee.employeeCode;
    if (employee.name) entity.name = employee.name;
    if (employee.position) entity.position = employee.position;
    if (employee.phone) entity.phone = employee.phone;
    if (employee.joinDate) entity.joinDate = employee.joinDate;
    return entity;
  }
}
