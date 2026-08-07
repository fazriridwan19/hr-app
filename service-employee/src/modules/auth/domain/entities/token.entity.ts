export class Token {
  jti: string;
  userId: number;
  employeeId: number | null;
  role: string;
  name: string;
  expiresAt: Date;

  constructor(partial: Partial<Token>) {
    Object.assign(this, partial);
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}

export interface JwtPayload {
  userId: number;
  employeeId: number | null;
  role: string;
  name: string;
  jti: string;
}

export interface RefreshTokenPayload extends JwtPayload {
  type: 'refresh';
}
