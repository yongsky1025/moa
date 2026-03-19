// 백엔드 DTO와 매칭되는 타입 정의

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  name: string;
  nickname: string;
  password: string;
  birthDate: string; // "yyyy-MM-dd"
  userGender: "MALE" | "FEMALE" | "UNSPECIFIED";
  age: number;
  privacyAgreed: boolean;
}

// AuthUserResponseDTO
export interface AuthUser {
  publicId: string;
  nickname: string;
  userRole: "USER" | "ADMIN";
  userStatus: "ACTIVE" | "WITHDRAWN" | "SUSPENDED" | "BANNED";
  onboardingCompleted: boolean;
}

// AuthResponseDTO
export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface SocialSignUpCompleteRequest {
  birthDate: string; // "yyyy-MM-dd"
  userGender: "MALE" | "FEMALE" | "UNSPECIFIED";
  privacyAgreed: boolean;
}
