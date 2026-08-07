import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('EMAIL_HOST');
    const port = this.configService.get<number>('EMAIL_PORT');
    const secure = this.configService.get<string>('EMAIL_SECURE', 'false') === 'true';
    const user = this.configService.get<string>('EMAIL_USER');
    const pass = this.configService.get<string>('EMAIL_PASS');
    this.fromAddress = this.configService.get<string>('EMAIL_FROM', 'no-reply@example.com');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  async sendPasswordReset(email: string, resetUrl: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.fromAddress,
      to: email,
      subject: 'Reset Password Anda',
      html: `
        <p>Halo,</p>
        <p>Kami menerima permintaan untuk mengubah password akun Anda.</p>
        <p>Silakan klik link berikut untuk mengatur ulang password Anda:</p>
        <p><a href="${resetUrl}">Reset Password</a></p>
        <p>Link ini berlaku selama 1 jam.</p>
        <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
      `,
    });

    this.logger.log(`Sent password reset email to ${email}`);
  }
}
