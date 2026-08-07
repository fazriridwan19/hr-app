import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Roles } from "@common/decorators/roles.decorator";
import {
  AttendanceResponseDto,
  PaginatedAttendanceResponseDto,
} from "@modules/attendance/application/dto/attendance-response.dto";
import { JwtPayload } from "@modules/attendance/domain/entities/jwt-payload.interface";
import { AttendanceService } from "@modules/attendance/domain/services/attendance.service";
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { memoryStorage } from "multer";
import {
  GetAttendancesQueryDto,
  GetMyAttendancesQueryDto,
} from "../dto/get-attendances-query.dto";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import { RolesGuard } from "@common/guards/roles.guard";

const photoUploadInterceptor = FileInterceptor("photo", {
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|jpg|png)$/i.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only jpg/jpeg/png files are allowed"), false);
    }
  },
});

@ApiTags("Attendance")
@ApiBearerAuth("access-token")
@Controller({ path: "attendance", version: "1" })
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post("clock-in")
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(photoUploadInterceptor)
  @ApiOperation({ summary: "Clock in with optional photo" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        photo: {
          type: "string",
          format: "binary",
          description: "Attendance photo (jpg/png, max 5MB)",
        },
      },
    },
  })
  @ApiCreatedResponse({ type: AttendanceResponseDto })
  @ApiConflictResponse({ description: "Already clocked in today" })
  async clockIn(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<AttendanceResponseDto> {
    return this.attendanceService.clockIn(
      user.employeeId!,
      user.name, // employeeCode from JWT name field (fallback)
      user.name,
      file,
    );
  }

  @Post("clock-out")
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(photoUploadInterceptor)
  @ApiOperation({ summary: "Clock out with optional photo" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        photo: {
          type: "string",
          format: "binary",
          description: "Attendance photo (jpg/png, max 5MB)",
        },
      },
    },
  })
  @ApiCreatedResponse({ type: AttendanceResponseDto })
  @ApiConflictResponse({ description: "Already clocked out today" })
  @ApiBadRequestResponse({ description: "Must clock in before clocking out" })
  async clockOut(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<AttendanceResponseDto> {
    return this.attendanceService.clockOut(
      user.employeeId!,
      user.name,
      user.name,
      file,
    );
  }

  @Get("me")
  @ApiOperation({ summary: "Get own attendance history" })
  @ApiOkResponse({ type: PaginatedAttendanceResponseDto })
  async getMyAttendances(
    @CurrentUser() user: JwtPayload,
    @Query() query: GetMyAttendancesQueryDto,
  ): Promise<PaginatedAttendanceResponseDto> {
    return this.attendanceService.findMyAttendances(user.employeeId!, query);
  }

  @Get()
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get all attendance records (ADMIN only)" })
  @ApiOkResponse({ type: PaginatedAttendanceResponseDto })
  async findAll(
    @Query() query: GetAttendancesQueryDto,
  ): Promise<PaginatedAttendanceResponseDto> {
    return this.attendanceService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get attendance by ID (ADMIN or owner)" })
  @ApiParam({ name: "id", type: Number })
  @ApiOkResponse({ type: AttendanceResponseDto })
  async findById(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<AttendanceResponseDto> {
    return this.attendanceService.findById(
      id,
      user.employeeId ?? undefined,
      user.role,
    );
  }
}
