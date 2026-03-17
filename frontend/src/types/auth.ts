export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  publicId: string;
  nickname: string;
  userRole: string;
  userStatus: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}
