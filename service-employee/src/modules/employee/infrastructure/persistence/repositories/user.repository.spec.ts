import { User, UserRole } from "@modules/employee/domain/entities/user.entity";
import { In, Repository } from "typeorm";
import { UserEntity } from "../entities/user.entity";
import { UserRepository } from "./user.repository";

describe("UserRepository", () => {
  let repository: UserRepository;
  let repo: Repository<UserEntity>;

  const mockDomainUser = {
    id: 1,
    email: "john@example.com",
    password: "hashed-password",
    role: UserRole.USER,
    employeeId: 10,
    isActive: true,
  } as unknown as User;

  const mockEntity = {
    toDomain: jest.fn().mockReturnValue(mockDomainUser),
  } as unknown as UserEntity;

  beforeEach(() => {
    repo = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    } as unknown as Repository<UserEntity>;

    repository = new UserRepository(repo);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("findById", () => {
    it("should return the domain entity when found", async () => {
      jest.spyOn(repo, "findOne").mockResolvedValue(mockEntity);

      const result = await repository.findById(1);

      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockDomainUser);
    });

    it("should return null when not found", async () => {
      jest.spyOn(repo, "findOne").mockResolvedValue(null);

      const result = await repository.findById(99);

      expect(result).toBeNull();
    });
  });

  describe("findByEmail", () => {
    it("should return the domain entity when found", async () => {
      jest.spyOn(repo, "findOne").mockResolvedValue(mockEntity);

      const result = await repository.findByEmail("john@example.com");

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { email: "john@example.com" },
      });
      expect(result).toEqual(mockDomainUser);
    });

    it("should return null when not found", async () => {
      jest.spyOn(repo, "findOne").mockResolvedValue(null);

      const result = await repository.findByEmail("missing@example.com");

      expect(result).toBeNull();
    });
  });

  describe("findByEmployeeId", () => {
    it("should return the domain entity when found", async () => {
      jest.spyOn(repo, "findOne").mockResolvedValue(mockEntity);

      const result = await repository.findByEmployeeId(10);

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { employeeId: 10 },
      });
      expect(result).toEqual(mockDomainUser);
    });

    it("should return null when not found", async () => {
      jest.spyOn(repo, "findOne").mockResolvedValue(null);

      const result = await repository.findByEmployeeId(99);

      expect(result).toBeNull();
    });
  });

  describe("findByEmployeeIds", () => {
    it("should return the domain entities for the given employee ids", async () => {
      jest.spyOn(repo, "find").mockResolvedValue([mockEntity]);

      const result = await repository.findByEmployeeIds([10, 20]);

      expect(repo.find).toHaveBeenCalledWith({
        select: ["id", "employeeId"],
        where: { employeeId: In([10, 20]) },
      });
      expect(result).toEqual([mockDomainUser]);
    });

    it("should return an empty array when no entities match", async () => {
      jest.spyOn(repo, "find").mockResolvedValue([]);

      const result = await repository.findByEmployeeIds([]);

      expect(result).toEqual([]);
    });
  });

  describe("create", () => {
    it("should build the entity from domain, save it, and return the domain result", async () => {
      const partial: Partial<User> = { email: "john@example.com" };
      jest.spyOn(UserEntity, "fromDomain").mockReturnValue(mockEntity);
      jest.spyOn(repo, "save").mockResolvedValue(mockEntity);

      const result = await repository.create(partial);

      expect(UserEntity.fromDomain).toHaveBeenCalledWith(partial);
      expect(repo.save).toHaveBeenCalledWith(mockEntity);
      expect(result).toEqual(mockDomainUser);
    });
  });

  describe("update", () => {
    it("should update the user and return the refreshed domain result", async () => {
      const partial: Partial<User> = { email: "new@example.com" };
      jest.spyOn(repo, "update").mockResolvedValue(undefined as any);
      jest.spyOn(repo, "findOne").mockResolvedValue(mockEntity);

      const result = await repository.update(1, partial);

      expect(repo.update).toHaveBeenCalledWith(1, partial);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockDomainUser);
    });
  });

  describe("updateRole", () => {
    it("should update the user's role and return the refreshed domain result", async () => {
      jest.spyOn(repo, "update").mockResolvedValue(undefined as any);
      jest.spyOn(repo, "findOne").mockResolvedValue(mockEntity);

      const result = await repository.updateRole(1, UserRole.ADMIN);

      expect(repo.update).toHaveBeenCalledWith(1, { role: UserRole.ADMIN });
      expect(result).toEqual(mockDomainUser);
    });
  });

  describe("updateStatus", () => {
    it("should update the user's active status and return the refreshed domain result", async () => {
      jest.spyOn(repo, "update").mockResolvedValue(undefined as any);
      jest.spyOn(repo, "findOne").mockResolvedValue(mockEntity);

      const result = await repository.updateStatus(1, false);

      expect(repo.update).toHaveBeenCalledWith(1, { isActive: false });
      expect(result).toEqual(mockDomainUser);
    });
  });

  describe("updatePassword", () => {
    it("should update the user's password and return the refreshed domain result", async () => {
      jest.spyOn(repo, "update").mockResolvedValue(undefined as any);
      jest.spyOn(repo, "findOne").mockResolvedValue(mockEntity);

      const result = await repository.updatePassword(1, "hashed-new-password");

      expect(repo.update).toHaveBeenCalledWith(1, {
        password: "hashed-new-password",
      });
      expect(result).toEqual(mockDomainUser);
    });
  });

  describe("findAll", () => {
    it("should return all users ordered by createdAt ascending", async () => {
      jest.spyOn(repo, "find").mockResolvedValue([mockEntity]);

      const result = await repository.findAll();

      expect(repo.find).toHaveBeenCalledWith({
        order: { createdAt: "ASC" },
      });
      expect(result).toEqual([mockDomainUser]);
    });
  });
});
