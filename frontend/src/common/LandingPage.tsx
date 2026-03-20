import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div
      data-moa-landing
      className="min-h-screen flex flex-col bg-white overflow-hidden"
    >
      {/* Hero Section */}
      <section className="moa-landing__hero-bg relative w-full h-screen flex items-center justify-center bg-cover bg-center bg-fixed">
        {/* Overlay */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
          {/* Main Tagline */}
          <div
            className={`transition-all duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}
          >
            <h1 className="moa-landing__font-pretendard text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">
              <span className="moa-landing__fade-in moa-landing__fade-delay-1 inline-block opacity-0">
                함께하는 모임
              </span>
              <br />
              <span className="moa-landing__fade-in moa-landing__fade-delay-2 inline-block opacity-0">
                더 즐거운 일상
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <div
            className={`transition-all duration-1000 delay-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
          >
            <p className="text-lg md:text-2xl text-gray-500 mb-12 font-light">
              에너지에 맞는 모임을 찾아보세요
            </p>
          </div>

          {/* Description */}
          <div
            className={`transition-all duration-1000 delay-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
          >
            <p className="text-base md:text-lg text-gray-700 mb-16 max-w-2xl leading-relaxed">
              MOA는 당신의 에너지 상태에 기반하여 가장 잘 맞는 소규모 모임을
              추천합니다.
              <br />
              내향적 성향이든 외향적 성향이든, 오늘의 에너지에 딱 맞는 모임을
              경험해보세요.
            </p>
          </div>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-700 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <Link
              to="/users/login"
              className="px-8 py-3 rounded-lg font-semibold text-white bg-[#5F6F7B] transition-all duration-300 hover:bg-[#4a5568] hover:-translate-y-0.5 hover:shadow-lg"
            >
              로그인/회원가입하기
            </Link>
            <button className="px-8 py-3 rounded-lg font-semibold text-white bg-[#E5968D] border-2 border-[#E5968D] transition-all duration-300 hover:bg-[#d4827a] hover:scale-105 hover:shadow-lg">
              에너지 테스트 측정하기
            </button>
            <Link
              to="/main"
              className="px-8 py-3 rounded-lg font-semibold border-2 border-[#5F6F7B] text-[#5F6F7B] transition-all duration-300 hover:bg-[#5F6F7B] hover:text-white hover:-translate-y-0.5 hover:shadow-lg"
            >
              메인페이지로 이동
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        >
          <div className="animate-bounce">
            <svg
              className="w-6 h-6 text-[#5F6F7B]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* About MOA Section */}
      <section className="w-full py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="moa-landing__font-serif text-4xl md:text-5xl font-light text-gray-800 mb-8 text-center">
            MOA란?
          </h2>
          <p className="text-lg text-gray-500 text-center mb-12 leading-relaxed">
            MOA는 5축 에너지 프로필을 기반으로 당신의 현재 에너지 상태에 가장 잘
            맞는 소그룹 모임을 추천하는 플랫폼입니다. 기존의 관심사 기반 매칭과
            달리, 사회적 상호작용, 활동 강도, 참여 부담 등 다양한 차원을
            고려하여 정말로 당신에게 맞는 모임을 찾아드립니다.
          </p>

          {/* Energy Dimensions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { title: "사회적 상호작용", desc: "대화량과 친목 압력" },
              { title: "상호작용 깊이", desc: "교류의 깊이와 강도" },
              { title: "활동 강도", desc: "신체 및 인지 활동" },
              { title: "참여 부담", desc: "필참, 회비, 규칙" },
              { title: "구조화 정도", desc: "진행 구조와 역할" },
            ].map((dimension, index) => (
              <div
                key={index}
                className="moa-landing__font-serif p-6 rounded-lg bg-white border border-gray-200 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-800 mb-2 text-base">
                  {dimension.title}
                </h3>
                <p className="text-sm text-gray-500">{dimension.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 px-4 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            &copy; 2026 MOA. 조용히 함께, 에너지에 맞는 모임을 찾아보세요.
          </p>
        </div>
      </footer>
    </div>
  );
}
