import {
  IUserRepository,
  User,
  UserRole,
} from "@modules/user/domain/entities/user.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "../entities/user.entity";

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async findById(id: number): Promise<User | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? entity.toDomain() : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repo.findOne({ where: { email } });
    return entity ? entity.toDomain() : null;
  }

  async findByEmployeeId(employeeId: number): Promise<User | null> {
    const entity = await this.repo.findOne({ where: { employeeId } });
    return entity ? entity.toDomain() : null;
  }

  async create(user: Partial<User>): Promise<User> {
    const entity = UserEntity.fromDomain(user);
    const saved = await this.repo.save(entity);
    return saved.toDomain();
  }

  async updateRole(id: number, role: UserRole): Promise<User> {
    await this.repo.update(id, { role });
    const updated = await this.repo.findOne({ where: { id } });
    return updated!.toDomain();
  }

  async updateStatus(id: number, isActive: boolean): Promise<User> {
    await this.repo.update(id, { isActive });
    const updated = await this.repo.findOne({ where: { id } });
    return updated!.toDomain();
  }

  async updatePassword(id: number, password: string): Promise<User> {
    await this.repo.update(id, { password });
    const updated = await this.repo.findOne({ where: { id } });
    return updated!.toDomain();
  }

  async findAll(): Promise<User[]> {
    const entities = await this.repo.find({ order: { createdAt: "ASC" } });
    return entities.map((e) => e.toDomain());
  }
}
