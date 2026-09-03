export interface AuthUser {
  id: number;
  userName: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  currencyCode: string;
}

export interface AuthTokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
  firstName: string;
  lastName?: string | null;
  currencyCode: string;
}
