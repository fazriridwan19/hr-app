import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { Queue } from "bullmq";

export const EMAIL_QUEUE = "email-events";

export interface EmailJobData {
  email: string;
  resetUrl: string;
}

@Injectable()
export class EmailProducer {
  private readonly logger = new Logger(EmailProducer.name);

  constructor(
    @InjectQueue(EMAIL_QUEUE)
    private readonly emailQueue: Queue<EmailJobData>,
  ) {}

  private readonly retryOptions = {
    attempts: 3,
    backoff: {
      type: "exponential" as const,
      delay: 5000,
    },
  };

  async addPasswordResetJob(data: EmailJobData): Promise<void> {
    await this.emailQueue.add("password-reset", data, this.retryOptions);
    this.logger.log(`Queued password reset job for user #${data.email}`);
  }
}
