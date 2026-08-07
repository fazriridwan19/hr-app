import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('BULLMQ_REDIS_HOST', 'localhost'),
          port: configService.get<number>('BULLMQ_REDIS_PORT', 6379),
          password: configService.get<string>('BULLMQ_REDIS_PASSWORD') || undefined,
        },
      }),
    })
  ]
})
export class QueueModule { }