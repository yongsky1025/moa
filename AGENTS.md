# MOA Project — Agent Reference

## Project Overview

MOA는 커뮤니티 소셜 플랫폼으로, 서클(그룹)/게시판/게시글/댓글/실시간 채팅/일정/장소/알림/관리자 대시보드 기능을 제공한다.

- **Backend:** `backend/` — Spring Boot REST API
- **Frontend:** `frontend/` — React SPA (Vite)

---

## Tech Stack

### Backend

| 항목         | 내용                                                      |
| ------------ | --------------------------------------------------------- |
| Language     | Java 17                                                   |
| Framework    | Spring Boot 3.5.9                                         |
| Build        | Gradle                                                    |
| Security     | Spring Security + JWT (JJWT 0.12.6) + OAuth2 Client       |
| ORM          | Spring Data JPA + QueryDSL 5.1.0                          |
| DB           | MySQL (운영/개발), H2 (테스트)                            |
| Cache/Broker | Redis (채팅 pub/sub 메시지 브로커)                        |
| Real-time    | WebSocket + STOMP + SockJS                                |
| API Docs     | SpringDoc OpenAPI 2.8.15 (Swagger UI: `/swagger-ui.html`) |
| Utilities    | Lombok, ModelMapper, Thumbnailator                        |

### Frontend

| 항목      | 내용                                                   |
| --------- | ------------------------------------------------------ |
| Framework | React 19 + TypeScript                                  |
| Build     | Vite 7 (SWC plugin)                                    |
| CSS       | TailwindCSS 4                                          |
| State     | Zustand (인증 + 경량 로컬 상태)                        |
| HTTP      | Axios (axiosInstance에 인터셉터 설정)                  |
| Routing   | React Router DOM 7                                     |
| Real-time | SockJS + @stomp/stompjs                                |
| Editor    | CKEditor 5                                             |
| 기타      | DOMPurify (XSS 방어), badwords-ko (한국어 비속어 필터) |

### Design System (`frontend/src/index.css`)

**글꼴:** Arial, sans-serif | **배경:** #ddd | **텍스트:** #333

**TailwindCSS @theme 색상** — `bg-moa-primary`, `text-moa-text` 등으로 사용:

| 토큰                   | 값        | 용도                    |
| ---------------------- | --------- | ----------------------- |
| `moa-primary`          | `#5F8F7B` | 주요 버튼, 링크, 강조   |
| `moa-hover`            | `#4E7C69` | primary hover 상태      |
| `moa-secondary`        | `#3D5F52` | 보조 강조, 진한 녹색    |
| `moa-light`            | `#EAF4F0` | 밝은 배경, 카드 배경    |
| `moa-muted`            | `#A9C8BB` | 비활성, 보조 텍스트     |
| `moa-border`           | `#E5E7EB` | 구분선, 테두리          |
| `moa-text`             | `#1F2937` | 본문 텍스트             |
| `moa-subtle`           | `#6B7280` | 부가 설명, placeholder  |
| `moa-accent`           | `#E3886D` | 알림, 경고, CTA 포인트  |
| `moa-accent-light`     | `#FDF1EC` | accent 밝은 배경        |

---

## Build & Run

### 사전 요구사항

- MySQL 8.x (DB: `moa`, user: `team_moa` / pw: `12345`)
- Redis (localhost:6379)
- Java 17+, Node.js 18+

### Backend

```bash
cd backend
./gradlew bootRun
# → http://localhost:8080
```

프로파일 지정:

```bash
./gradlew bootRun --args='--spring.profiles.active=local'
```

빌드만:

```bash
./gradlew build
java -jar build/libs/moa-*.jar
```

### Frontend

```bash
cd frontend
npm install
npm run dev    # → http://localhost:5173
npm run build  # 프로덕션 빌드
```

> Vite dev server가 `/api`, `/circles`, `/images`, `/uploads`, `/oauth2`, `/ws` 등을 `localhost:8080`으로 프록시한다 (`vite.config.ts`).

---

## Configuration Profiles

| 파일                                         | 역할                                               |
| -------------------------------------------- | -------------------------------------------------- |
| `backend/src/main/resources/application.yml` | 기본 설정 (JWT, MySQL, Redis, 파일 업로드)         |
| `application-local.yml`                      | 로컬 개발 (root/12345, DDL: create, 시드 데이터)   |
| `application-oauth2.yml`                     | OAuth2 클라이언트 ID/시크릿 (Google, Kakao, Naver) |
| `application-prod.yml`                       | 운영 (DDL: validate)                               |

주요 설정값 (`application.yml`):

- JWT access token 만료: 1,800,000 ms (30분)
- JWT refresh token 만료: 2주
- 파일 업로드 경로: `${FILE_UPLOAD_DIR}` (기본: `${user.dir}/uploads`)
- CORS 허용 origin: `http://localhost:5173`

---

## Backend Package Structure

`com.soldesk.moa` 하위:

```
auth/          # 로그인, 회원가입, JWT 재발급, 로그아웃
users/         # 유저 프로필, 계정 설정, 비밀번호 변경
security/      # SecurityConfig, JwtTokenProvider, JwtAuthenticationFilter
  oauth2/      # CustomOAuth2UserService, OAuth2LoginSuccessHandler
circle/        # 서클(그룹) CRUD
board/         # 게시판 CRUD + 스케줄러
post/          # 게시글 CRUD
reply/         # 댓글 CRUD
chat/          # 실시간 채팅 (WebSocket + Redis pub/sub)
  config/      # WebSocketConfig
schedule/      # 일정/캘린더
place/         # 장소 + 주기적 스케줄러
notification/  # 실시간 알림
admin/
  dashboard/   # 통계 대시보드
  log/         # AOP 기반 활동 로그
  report/      # 신고/제재
common/        # 공통 설정, 예외, 파일 스토리지
MoaApplication.java  # @EnableJpaAuditing, @EnableScheduling
```

각 도메인은 `controller / service / repository / dto / entity` 구조를 따른다.

---

## Frontend Package Structure

`frontend/src/` 하위:

```
api/           # 도메인별 API 함수 (authApi, usersApi, circleApi 등)
               # axiosInstance.ts — 인터셉터, 토큰 자동 갱신
users/
  pages/       # SocialSignUpPage 등
  types/       # auth 타입 정의
store/         # authStore.ts (Zustand 인증 상태 관리)
routes/        # rootRouters.ts + 도메인별 라우터
board/         # 게시판 pages & components
circle/        # 서클 pages & components
post/          # 게시글 pages & components
reply/         # 댓글 components
chat/          # 채팅 pages & WebSocket hooks
schedule/      # 일정 components
admin/         # 관리자 대시보드
common/        # 공통 컴포넌트, 레이아웃, 훅
types/         # 전역 TypeScript 타입
main.tsx       # 진입점: useAuthStore.getState().restoreAuth() → Router render
```

---

## Key Architectural Decisions

### 인증 (Auth)

- **Stateless JWT**: SessionCreationPolicy.STATELESS, CSRF 비활성화
- **Access / Refresh Token**: 쿠키 + Redis에 refresh token 저장
- **JwtAuthenticationFilter** → `UsernamePasswordAuthenticationFilter` 앞에 등록
- **앱 초기화 시 세션 복원**: `main.tsx`에서 `useAuthStore.getState().restoreAuth()` 호출 → F5 새로고침 자동 로그아웃 방지

### OAuth2 소셜 로그인

- 지원: Google, Kakao, Naver
- 흐름: `CustomOAuth2UserService` (회원 조회/생성) → `OAuth2LoginSuccessHandler` (JWT 발급 + 프론트로 리다이렉트)
- 신규 소셜 가입자는 온보딩 완료 전까지 `SocialSignUpPage`로 이동

### 실시간 기능

- **채팅**: WebSocket (STOMP over SockJS) + Redis pub/sub (다중 서버 인스턴스 지원)
- **알림**: WebSocket 기반 실시간 푸시

### 쿼리

- 단순 CRUD: Spring Data JPA Repository
- 복잡한 조회 (대시보드 통계 등): QueryDSL

### 파일 업로드

- 업로드 경로: `uploads/` (환경변수 `FILE_UPLOAD_DIR`)
- 썸네일 생성: Thumbnailator
- 정적 리소스 서빙: `/images/**`, `/uploads/**`

### 관리자

- AOP(`@Around`)로 관리자 활동 자동 로깅

---

## Critical Files

| 파일                                                                 | 역할                                  |
| -------------------------------------------------------------------- | ------------------------------------- |
| `backend/.../security/SecurityConfig.java`                           | 전체 보안 규칙, 퍼블릭/인증 필요 경로 |
| `backend/.../security/JwtTokenProvider.java`                         | JWT 생성/검증                         |
| `backend/.../security/JwtAuthenticationFilter.java`                  | 요청별 JWT 인증 처리                  |
| `backend/.../security/oauth2/service/CustomOAuth2UserService.java`   | OAuth2 사용자 로드/저장               |
| `backend/.../security/oauth2/handler/OAuth2LoginSuccessHandler.java` | OAuth2 성공 후 JWT 발급               |
| `backend/src/main/resources/application.yml`                         | 핵심 설정 (JWT, DB, Redis)            |
| `frontend/src/main.tsx`                                              | 앱 진입점, restoreAuth 디스패치       |
| `frontend/src/store/authStore.ts`                                    | Zustand 인증 상태 관리, restoreAuth   |
| `frontend/src/api/axiosInstance.ts`                                  | HTTP 클라이언트, 토큰 인터셉터        |
| `frontend/vite.config.ts`                                            | 개발 프록시 설정                      |
