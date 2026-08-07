import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule as RedisCoreModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [
    RedisCoreModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host     = config.get<string>('REDIS_HOST', 'localhost');
        const port     = config.get<number>('REDIS_PORT', 6379);
        const password = config.get<string>('REDIS_AUTH') || config.get<string>('REDIS_PASSWORD') || '';

        return {
          type: 'single' as const,
          url: password
            ? `redis://:${password}@${host}:${port}`
            : `redis://${host}:${port}`,
        };
      },
    }),
  ],
  exports: [RedisCoreModule],
})
export class RedisModule {}
