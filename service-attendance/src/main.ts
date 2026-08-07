import { NestFactory, Reflector } from "@nestjs/core";
import {
  ValidationPipe,
  ClassSerializerInterceptor,
  Logger,
  VersioningType,
} from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import * as cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const configService = app.get(ConfigService);
  const port = configService.get<number>("app.port", 3001);
  const appName = configService.get<string>("app.name", "service-attendance");
  const corsOrigin = configService.get<string>(
    "app.corsOrigin",
    "http://localhost:5173",
  );
  const appEnv = configService.get<string>("app.env", "development");

  app.use(cookieParser());

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  app.setGlobalPrefix("api");

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(
    new ResponseInterceptor(reflector),
    new ClassSerializerInterceptor(reflector),
  );
  app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));

  if (appEnv !== "production") {
    const config = new DocumentBuilder()
      .setTitle("HR System - Attendance Service")
      .setDescription(
        "API documentation for the Attendance Service of the HR System",
      )
      .setVersion("1.0.0")
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT Access Token",
        },
        "access-token",
      )
      .addServer(`http://localhost:${port}`, "Local Development")
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
    Logger.log(`Swagger docs: http://localhost:${port}/api/docs`, "Bootstrap");
  }

  await app.listen(port);
  Logger.log(
    `${appName} running on http://localhost:${port} [${appEnv}]`,
    "Bootstrap",
  );
}

bootstrap().catch((err) => {
  Logger.error("Failed to start", err, "Bootstrap");
  process.exit(1);
});
