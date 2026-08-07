import { EmailService } from "@modules/auth/infrastructure/email/email.service";
import {
  EMAIL_QUEUE,
  EmailJobData,
} from "@modules/auth/infrastructure/queue/producers/email.producer";
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";

@Processor(EMAIL_QUEUE)
export class EmailConsumer extends WorkerHost {
  private readonly logger = new Logger(EmailConsumer.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    const { email, resetUrl } = job.data;
    this.logger.log(
      `Processing job [${job.name}] #${job.id} — email to ${email}`,
    );
    try {
      await this.emailService.sendPasswordReset(email, resetUrl);
      this.logger.log(`Sent password reset email for ${email}`);
    } catch (error) {
      this.logger.error(`Failed to process email job for ${email}: ${error}`);
      throw error;
    }
  }

  @OnWorkerEvent("completed")
  onCompleted(job: Job<EmailJobData>): void {
    this.logger.log(`Job [${job.name}] #${job.id} completed successfully`);
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job<EmailJobData>, error: Error): void {
    this.logger.error(
      `Job [${job.name}] #${job.id} failed after ${job.attemptsMade} attempts: ${error.message}`,
    );
  }
}
