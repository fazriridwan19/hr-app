import { JwtPayload } from "@modules/auth/domain/entities/token.entity";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET", "jwt-secret"),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (!payload.userId || !payload.role) {
      throw new UnauthorizedException("Invalid token payload");
    }
    return payload;
  }
}
