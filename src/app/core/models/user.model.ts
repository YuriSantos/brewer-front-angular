export interface User {
  codigo: number;
  nome: string;
  email: string;
  roles: string[];
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}
