import { JwtPayload } from "@modules/attendance/domain/entities/jwt-payload.interface";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>("jwt.secret") ??
        configService.get<string>("JWT_SECRET") ??
        "fallback-secret",
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    if (!payload.userId) {
      throw new UnauthorizedException("Invalid token payload");
    }
    return payload;
  }
}
