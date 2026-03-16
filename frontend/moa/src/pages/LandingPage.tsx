import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <>
      <div className="">
        <span>
          <Link to={"/users/login"}>로그인/회원가입</Link>
        </span>
      </div>
      <div className="div">
        <span>
          <Link to={"/main"}>메인페이지로 이동</Link>
        </span>
      </div>
    </>
  );
}

export default LandingPage;
