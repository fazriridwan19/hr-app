import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

@Injectable()
export class RedisTokenService {
  private readonly logger = new Logger(RedisTokenService.name);
  private readonly keyPrefix: string;
  private readonly refreshTtl: number;

  constructor(
    @InjectRedis() private readonly redisClient: Redis,
    private readonly configService: ConfigService,
  ) {
    this.keyPrefix = this.configService.get<string>('redis.keyPrefix', 'hr:');
    this.refreshTtl = this.configService.get<number>(
      'jwt.refreshTtlSeconds',
      7 * 24 * 60 * 60,
    );
  }

  private buildKey(userId: number, jti: string): string {
    return `${this.keyPrefix}refresh-token:${userId}:${jti}`;
  }

  async saveRefreshToken(
    userId: number,
    jti: string,
    token: string,
  ): Promise<void> {
    const key = this.buildKey(userId, jti);
    await this.redisClient.setex(key, this.refreshTtl, token);
    this.logger.debug(`Saved refresh token for user ${userId}, jti: ${jti}`);
  }

  async getRefreshToken(
    userId: number,
    jti: string,
  ): Promise<string | null> {
    const key = this.buildKey(userId, jti);
    const token = await this.redisClient.get(key);
    return token;
  }

  async deleteRefreshToken(userId: number, jti: string): Promise<void> {
    const key = this.buildKey(userId, jti);
    await this.redisClient.del(key);
    this.logger.debug(`Deleted refresh token for user ${userId}, jti: ${jti}`);
  }

  async deleteAllRefreshTokens(userId: number): Promise<void> {
    const pattern = `${this.keyPrefix}refresh-token:${userId}:*`;
    const keys = await this.redisClient.keys(pattern);
    if (keys.length > 0) {
      await this.redisClient.del(...keys);
    }
    this.logger.debug(
      `Deleted ${keys.length} refresh tokens for user ${userId}`,
    );
  }

  async isRefreshTokenValid(userId: number, jti: string): Promise<boolean> {
    const token = await this.getRefreshToken(userId, jti);
    return token !== null;
  }
}
