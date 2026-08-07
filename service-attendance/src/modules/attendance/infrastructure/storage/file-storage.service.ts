import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);
  private readonly uploadDir: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = this.configService.get<string>('app.uploadDir', 'uploads/attendance');
  }

  /**
   * Saves uploaded file to disk.
   * Returns the relative URL path: /uploads/attendance/YYYY-MM-DD/employeeId-timestamp.ext
   */
  async saveFile(file: Express.Multer.File, employeeId: number): Promise<string> {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const timestamp = Date.now();
    const fileName = `${employeeId}-${timestamp}${ext}`;
    const subDir = path.join(this.uploadDir, today);

    // Ensure directory exists
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }

    const fullPath = path.join(subDir, fileName);
    fs.writeFileSync(fullPath, file.buffer);

    this.logger.log(`Saved file: ${fullPath}`);

    // Return a web-accessible relative path
    return `/${subDir.replace(/\\/g, '/')}/${fileName}`;
  }

  deleteFile(relativePath: string): void {
    try {
      const fullPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        this.logger.debug(`Deleted file: ${fullPath}`);
      }
    } catch (err) {
      this.logger.warn(`Failed to delete file ${relativePath}: ${err}`);
    }
  }
}
