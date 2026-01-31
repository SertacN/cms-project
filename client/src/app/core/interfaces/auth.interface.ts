export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: number;
  message: string;
}
