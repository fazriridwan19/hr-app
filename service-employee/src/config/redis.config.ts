import { registerAs } from "@nestjs/config";

export const redisConfig = registerAs("redis", () => ({
  keyPrefix: "service-employee:",
}));
