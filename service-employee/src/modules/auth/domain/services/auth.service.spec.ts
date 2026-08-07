import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { USER_REPOSITORY } from '../../../user/domain/repositories/user.repository.interface';
import { EMPLOYEE_REPOSITORY } from '../../../employee/domain/repositories/employee.repository.interface';
import { RedisTokenService } from '../../infrastructure/cache/redis-token.service';
import { User, UserRole } from '../../../user/domain/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<any>;
  let employeeRepository: jest.Mocked<any>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let redisTokenService: jest.Mocked<RedisTokenService>;

  const mockUser: User = new User({
    id: 1,
    email: 'admin@example.com',
    password: '$2b$12$hashedpassword',
    role: UserRole.ADMIN,
    employeeId: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: USER_REPOSITORY,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: EMPLOYEE_REPOSITORY,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              const config: Record<string, any> = {
                'jwt.secret': 'test-secret',
                'jwt.accessExpiration': '15m',
                'jwt.refreshSecret': 'test-refresh-secret',
                'jwt.refreshExpiration': '7d',
              };
              return config[key] ?? defaultValue;
            }),
          },
        },
        {
          provide: RedisTokenService,
          useValue: {
            saveRefreshToken: jest.fn(),
            getRefreshToken: jest.fn(),
            deleteRefreshToken: jest.fn(),
            deleteAllRefreshTokens: jest.fn(),
            isRefreshTokenValid: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(USER_REPOSITORY);
    employeeRepository = module.get(EMPLOYEE_REPOSITORY);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    redisTokenService = module.get(RedisTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginDto = { email: 'admin@example.com', password: 'password123' };
      const hashedPassword = await bcrypt.hash('password123', 12);
      const userWithHash = new User({ ...mockUser, password: hashedPassword });

      userRepository.findByEmail.mockResolvedValue(userWithHash);
      jwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');
      redisTokenService.saveRefreshToken.mockResolvedValue(undefined);

      const result = await service.login(loginDto);

      expect(result.loginResponse.accessToken).toBe('access-token');
      expect(result.loginResponse.tokenType).toBe('Bearer');
      expect(result.loginResponse.expiresIn).toBe(900);
      expect(result.refreshToken).toBe('refresh-token');
      expect(redisTokenService.saveRefreshToken).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'notfound@example.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      const inactiveUser = new User({ ...mockUser, isActive: false });
      userRepository.findByEmail.mockResolvedValue(inactiveUser);

      await expect(
        service.login({ email: 'admin@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.login({ email: 'admin@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should refresh tokens successfully', async () => {
      const mockPayload = {
        userId: 1,
        employeeId: null,
        role: 'ADMIN',
        name: 'Admin',
        jti: 'old-jti',
        type: 'refresh',
      };

      jwtService.verify = jest.fn().mockReturnValue(mockPayload);
      redisTokenService.isRefreshTokenValid.mockResolvedValue(true);
      userRepository.findById.mockResolvedValue(mockUser);
      redisTokenService.deleteRefreshToken.mockResolvedValue(undefined);
      jwtService.sign
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');
      redisTokenService.saveRefreshToken.mockResolvedValue(undefined);

      const result = await service.refresh('valid-refresh-token');

      expect(result.accessToken).toBe('new-access-token');
      expect(result.newRefreshToken).toBe('new-refresh-token');
      expect(redisTokenService.deleteRefreshToken).toHaveBeenCalledWith(1, 'old-jti');
    });

    it('should throw UnauthorizedException when refresh token is revoked', async () => {
      const mockPayload = {
        userId: 1,
        employeeId: null,
        role: 'ADMIN',
        name: 'Admin',
        jti: 'revoked-jti',
        type: 'refresh',
      };

      jwtService.verify = jest.fn().mockReturnValue(mockPayload);
      redisTokenService.isRefreshTokenValid.mockResolvedValue(false);

      await expect(service.refresh('revoked-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      redisTokenService.deleteRefreshToken.mockResolvedValue(undefined);

      await service.logout(1, 'some-jti');

      expect(redisTokenService.deleteRefreshToken).toHaveBeenCalledWith(1, 'some-jti');
    });
  });
});
