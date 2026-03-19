import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">MOA</h1>
      <p className="text-gray-600">모임을 만들고 일정을 관리하세요</p>
      <div className="flex gap-3">
        <Link to="/users/login" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          로그인
        </Link>
        <Link to="/users/signup" className="rounded border border-blue-600 bg-white px-4 py-2 text-blue-600 hover:bg-blue-50">
          회원가입
        </Link>
        <Link to="/circle" className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700">
          서클 둘러보기
        </Link>
      </div>
    </div>
  );
}

export default LandingPage;
