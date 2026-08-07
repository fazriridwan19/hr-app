import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  // Harus sama persis dengan JWT_SECRET di service-employee
  secret: process.env.JWT_SECRET ?? 'jwt-secret-change-in-production',
}));
