import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ErrorExamplePage() {
  const navigate = useNavigate();
  const [crash, setCrash] = useState(false);

  if (crash) {
    throw new Error("강제 에러 예시: 500 페이지 테스트");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f8] px-4">
      <div className="w-full max-w-md rounded-2xl border border-moa-border bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-extrabold text-moa-text">오류 페이지 프리뷰</h1>
        <p className="mt-3 text-sm leading-6 text-moa-subtle">
          아래 버튼으로 오류 페이지를 바로 확인할 수 있습니다.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <div className="rounded-xl border border-moa-border bg-white p-3 text-left">
            <p className="text-xs font-semibold text-moa-subtle">PAYMENT_FAIL (결제 실패)</p>
            <p className="mt-1 text-xs text-moa-subtle">결제 취소/승인 실패/결제사 오류로 결제가 완료되지 않은 경우</p>
            <button
              type="button"
              onClick={() =>
                navigate("/payment/fail?code=PAY_PROCESS_CANCELED&message=사용자가 결제를 취소했습니다.")
              }
              className="mt-2 w-full rounded-xl bg-moa-accent px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#cf735a]"
            >
              결제 실패 페이지 보기
            </button>
          </div>

          <div className="rounded-xl border border-moa-border bg-white p-3 text-left">
            <p className="text-xs font-semibold text-moa-subtle">ACCOUNT_STATUS (계정 상태)</p>
            <p className="mt-1 text-xs text-moa-subtle">정지/탈퇴/영구정지 계정으로 로그인하거나 접근할 때</p>
            <button
              type="button"
              onClick={() => navigate("/users/account-status?code=ACCOUNT_SUSPENDED")}
              className="mt-2 w-full rounded-xl border border-moa-border bg-white px-4 py-2.5 text-sm font-semibold text-moa-text transition-colors hover:bg-gray-50"
            >
              계정 상태 페이지 보기
            </button>
          </div>

          <div className="rounded-xl border border-moa-border bg-white p-3 text-left">
            <p className="text-xs font-semibold text-moa-subtle">404 NOT_FOUND</p>
            <p className="mt-1 text-xs text-moa-subtle">존재하지 않는 URL로 접근했을 때</p>
            <button
              type="button"
              onClick={() => navigate("/없는경로-404-테스트")}
              className="mt-2 w-full rounded-xl border border-moa-border bg-white px-4 py-2.5 text-sm font-semibold text-moa-text transition-colors hover:bg-gray-50"
            >
              404 페이지 보기
            </button>
          </div>

          <div className="rounded-xl border border-moa-border bg-white p-3 text-left">
            <p className="text-xs font-semibold text-moa-subtle">POST_DELETED</p>
            <p className="mt-1 text-xs text-moa-subtle">소프트 삭제된 게시글 URL로 접근했을 때</p>
            <button
              type="button"
              onClick={() => navigate("/error/post-deleted")}
              className="mt-2 w-full rounded-xl border border-moa-border bg-white px-4 py-2.5 text-sm font-semibold text-moa-text transition-colors hover:bg-gray-50"
            >
              삭제 게시글 페이지 보기
            </button>
          </div>

          <div className="rounded-xl border border-moa-border bg-white p-3 text-left">
            <p className="text-xs font-semibold text-moa-subtle">401 UNAUTHORIZED</p>
            <p className="mt-1 text-xs text-moa-subtle">로그인하지 않은 사용자가 인증이 필요한 API/페이지에 접근할 때</p>
            <button
              type="button"
              onClick={() => navigate("/error/401")}
              className="mt-2 w-full rounded-xl border border-moa-border bg-white px-4 py-2.5 text-sm font-semibold text-moa-text transition-colors hover:bg-gray-50"
            >
              401 페이지 보기
            </button>
          </div>

          <div className="rounded-xl border border-moa-border bg-white p-3 text-left">
            <p className="text-xs font-semibold text-moa-subtle">403 FORBIDDEN</p>
            <p className="mt-1 text-xs text-moa-subtle">로그인은 했지만 권한(역할/리더 권한 등)이 부족할 때</p>
            <button
              type="button"
              onClick={() => navigate("/error/403")}
              className="mt-2 w-full rounded-xl border border-moa-border bg-white px-4 py-2.5 text-sm font-semibold text-moa-text transition-colors hover:bg-gray-50"
            >
              403 페이지 보기
            </button>
          </div>

          <div className="rounded-xl border border-moa-border bg-white p-3 text-left">
            <p className="text-xs font-semibold text-moa-subtle">500 INTERNAL_SERVER_ERROR</p>
            <p className="mt-1 text-xs text-moa-subtle">서버/런타임에서 예기치 못한 예외가 발생했을 때</p>
            <button
              type="button"
              onClick={() => setCrash(true)}
              className="mt-2 w-full rounded-xl bg-moa-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-moa-hover"
            >
              500 페이지 보기(강제 에러)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
