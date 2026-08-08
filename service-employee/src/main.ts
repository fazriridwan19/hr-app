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
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>("APP_PORT", 3000);
  const appName = configService.get<string>("APP_NAME", "service-employee");
  const corsOrigin = configService.get<string>("CORS_ORIGIN", "*");
  const appEnv = configService.get<string>("APP_ENV", "development");

  // Cookie parser
  app.use(cookieParser(configService.get<string>("COOKIE_SECRET")));

  // CORS
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  });

  // Global prefix
  app.setGlobalPrefix("api");

  // URI Versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(
    new ResponseInterceptor(reflector),
    new ClassSerializerInterceptor(reflector),
  );

  // Global guards
  app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));

  // Swagger — only in non-production
  if (appEnv !== "production") {
    const config = new DocumentBuilder()
      .setTitle("HR System - Employee Service")
      .setDescription(
        "API documentation for the Employee Service of the HR System",
      )
      .setVersion("1.0.0")
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT access token",
        },
        "access-token",
      )
      .addCookieAuth("refresh_token", {
        type: "apiKey",
        in: "cookie",
        name: "refresh_token",
      })
      .addServer(`http://localhost:${port}`, "Local Development")
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: "alpha",
        operationsSorter: "alpha",
      },
    });

    Logger.log(
      `Swagger docs available at http://localhost:${port}/api/docs`,
      "Bootstrap",
    );
  }

  await app.listen(port);
  Logger.log(
    `${appName} is running on http://localhost:${port} [${appEnv}]`,
    "Bootstrap",
  );
}

bootstrap().catch((err) => {
  Logger.error("Failed to start application", err, "Bootstrap");
  process.exit(1);
});
