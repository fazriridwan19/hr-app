export interface JwtPayload {
  userId: number;
  employeeId: number | null;
  role: "ADMIN" | "USER";
  name: string;
  jti: string;
}
