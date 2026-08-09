import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from "node:fs";
import * as path from "node:path";
import { FileStorageService } from "./file-storage.service";

describe("FileStorageService", () => {
  let service: FileStorageService;
  let configService: ConfigService;

  const mockFile = (originalname: string): Express.Multer.File =>
    ({
      originalname,
      buffer: Buffer.from("test-content"),
    }) as Express.Multer.File;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-08-09T10:00:00.000Z"));

    configService = {
      get: jest.fn().mockReturnValue("uploads/attendance"),
    } as unknown as ConfigService;

    jest.spyOn(Logger.prototype, "log").mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, "debug").mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, "warn").mockImplementation(() => undefined);

    service = new FileStorageService(configService);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should read uploadDir from config with the default fallback", () => {
      expect(configService.get).toHaveBeenCalledWith(
        "app.uploadDir",
        "uploads/attendance",
      );
    });

    it("should use the value returned by ConfigService when provided", async () => {
      const customConfigService = {
        get: jest.fn().mockReturnValue("custom/upload/path"),
      } as unknown as ConfigService;
      jest.spyOn(fs, "existsSync").mockReturnValue(true);
      jest.spyOn(fs, "writeFileSync").mockImplementation(() => undefined);

      const customService = new FileStorageService(customConfigService);
      const result = await customService.saveFile(mockFile("photo.jpg"), 1);

      expect(result).toContain("custom/upload/path");
    });
  });

  describe("saveFile", () => {
    it("should lowercase the extension and create the directory when it does not exist", async () => {
      jest.spyOn(fs, "existsSync").mockReturnValue(false);
      jest.spyOn(fs, "mkdirSync").mockImplementation(() => undefined);
      jest.spyOn(fs, "writeFileSync").mockImplementation(() => undefined);

      const file = mockFile("photo.PNG");
      const result = await service.saveFile(file, 10);

      const expectedSubDir = path.join("uploads/attendance", "2026-08-09");
      const expectedFileName = `10-${Date.now()}.png`;
      const expectedFullPath = path.join(expectedSubDir, expectedFileName);

      expect(fs.mkdirSync).toHaveBeenCalledWith(expectedSubDir, {
        recursive: true,
      });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expectedFullPath,
        file.buffer,
      );
      expect(result).toBe(
        `/${expectedSubDir.replace(/\\/g, "/")}/${expectedFileName}`,
      );
    });

    it("should default to .jpg when the file has no extension", async () => {
      jest.spyOn(fs, "existsSync").mockReturnValue(false);
      jest.spyOn(fs, "mkdirSync").mockImplementation(() => undefined);
      jest.spyOn(fs, "writeFileSync").mockImplementation(() => undefined);

      const result = await service.saveFile(mockFile("photo"), 10);

      expect(result).toMatch(/\.jpg$/);
    });

    it("should skip directory creation when it already exists", async () => {
      jest.spyOn(fs, "existsSync").mockReturnValue(true);
      jest.spyOn(fs, "mkdirSync").mockImplementation(() => undefined);
      jest.spyOn(fs, "writeFileSync").mockImplementation(() => undefined);

      await service.saveFile(mockFile("photo.jpg"), 10);

      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe("deleteFile", () => {
    it("should strip the leading slash and delete the file when it exists", () => {
      jest.spyOn(fs, "existsSync").mockReturnValue(true);
      jest.spyOn(fs, "unlinkSync").mockImplementation(() => undefined);

      service.deleteFile("/uploads/attendance/2026-08-09/10-123.jpg");

      expect(fs.existsSync).toHaveBeenCalledWith(
        "uploads/attendance/2026-08-09/10-123.jpg",
      );
      expect(fs.unlinkSync).toHaveBeenCalledWith(
        "uploads/attendance/2026-08-09/10-123.jpg",
      );
    });

    it("should use the path as-is when it has no leading slash", () => {
      jest.spyOn(fs, "existsSync").mockReturnValue(true);
      jest.spyOn(fs, "unlinkSync").mockImplementation(() => undefined);

      service.deleteFile("uploads/attendance/2026-08-09/10-123.jpg");

      expect(fs.existsSync).toHaveBeenCalledWith(
        "uploads/attendance/2026-08-09/10-123.jpg",
      );
      expect(fs.unlinkSync).toHaveBeenCalledWith(
        "uploads/attendance/2026-08-09/10-123.jpg",
      );
    });

    it("should do nothing when the file does not exist", () => {
      jest.spyOn(fs, "existsSync").mockReturnValue(false);
      jest.spyOn(fs, "unlinkSync").mockImplementation(() => undefined);

      service.deleteFile("/uploads/attendance/2026-08-09/missing.jpg");

      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });

    it("should swallow errors and log a warning when deletion fails", () => {
      jest.spyOn(fs, "existsSync").mockImplementation(() => {
        throw new Error("disk error");
      });

      expect(() =>
        service.deleteFile("/uploads/attendance/2026-08-09/10-123.jpg"),
      ).not.toThrow();
      expect(Logger.prototype.warn).toHaveBeenCalledWith(
        expect.stringContaining("Failed to delete file"),
      );
    });
  });
});
