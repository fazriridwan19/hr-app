import { registerAs } from "@nestjs/config";

export const jwtConfig = registerAs("jwt", () => ({
  refreshTtlSeconds: 7 * 24 * 60 * 60, // 7 days in seconds
}));
