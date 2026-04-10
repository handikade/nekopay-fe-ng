export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phone_number: string;
}

export interface RegisterResponse {
  message: string;
}
