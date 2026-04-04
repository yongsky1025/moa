import api from "./axiosInstance";
import type {
  AuthResponse,
  AuthUser,
  LoginRequest,
  SignUpRequest,
  SocialSignUpCompleteRequest,
} from "../users/types/auth";

export const authApi = {
  login: (req: LoginRequest) =>
    api.post<AuthResponse>("/api/auth/login", req),

  signup: (req: SignUpRequest) =>
    api.post("/api/auth/signup", req),

  logout: () =>
    api.post("/api/auth/logout"),

  refresh: () =>
    api.post<AuthResponse>("/api/auth/refresh"),

  /** accessToken만으로 현재 유저 정보 조회 (refresh 쿠키 불필요) */
  getMe: () =>
    api.get<AuthUser>("/api/auth/me"),

  agreePrivacyConsent: () =>
    api.post("/api/auth/privacy-consent"),

  socialSignUpComplete: (req: SocialSignUpCompleteRequest) =>
    api.post("/api/auth/social-complete", req),
};
