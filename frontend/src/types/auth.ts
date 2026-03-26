export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  publicId: string;
  nickname: string;
  userRole: string;
  userStatus: string;
  onboardingCompleted?: boolean;
  privacyAgreed?: boolean;
  profileImageUrl?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}
