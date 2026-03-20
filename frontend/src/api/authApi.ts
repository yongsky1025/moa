import api from "../users/utils/jwtUtil";
import type {
  AuthResponse,
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

  socialSignUpComplete: (req: SocialSignUpCompleteRequest) =>
    api.post("/api/auth/social-complete", req),
};
