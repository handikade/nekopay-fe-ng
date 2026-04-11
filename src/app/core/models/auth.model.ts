export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
  };
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phone_number: string;
}

export interface RegisterResponse {
  statusCode: number;
  message: string;
  data: {
    message: string;
  };
}
