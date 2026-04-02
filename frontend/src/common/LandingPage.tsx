import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div data-moa-landing className="min-h-screen flex flex-col overflow-hidden bg-white">
      <section className="moa-landing__hero-bg relative flex h-screen w-full items-center justify-center bg-cover bg-center bg-fixed">
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.28)]" />

        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center justify-center px-4 text-center">
          <div className={`transition-all duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
            <h1 className="moa-landing__f ont-pretendard mb-7 text-[34px] font-semibold leading-[1.04] tracking-[-0.035em] text-white md:text-[54px]">
              <span className="moa-landing__fade-in moa-landing__fade-delay-1 inline-block opacity-0">같은 에너지,</span>
              <br />
              <span className="moa-landing__fade-in moa-landing__fade-delay-2 mt-2 inline-block opacity-0 md:mt-3">같은 속도의 모임</span>
            </h1>
          </div>

          <div className={`transition-all duration-1000 delay-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
            <p className="mb-10 max-w-2xl text-base font-medium leading-7 tracking-[-0.01em] text-white/88 drop-shadow-[0_2px_10px_rgba(0,0,0,0.28)] md:mb-12 md:text-xl md:leading-9">
              <span className="block">나의 에너지를 알아보고, 어울리는 모임을 만나보세요.</span>
            </p>
          </div>

          <div
            className={`mt-1 flex flex-col justify-center gap-4 transition-all duration-1000 delay-700 sm:flex-row ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
          >
            <Link
              to="/users/login"
              className="rounded-lg border-2 border-[rgba(255,255,255,0.6)] bg-transparent px-8 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#4a5568] hover:shadow-lg md:text-base"
            >
              시작하기
            </Link>
            <Link
              to="/users/energy-test"
              className="rounded-lg border-2 border-[#E5968D] bg-[#E5968D] px-8 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-[#d4827a] hover:shadow-lg md:text-base"
            >
              에너지 테스트 측정하기
            </Link>
            <Link
              to="/main"
              className="rounded-lg bg-[#5F6F7B] px-8 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:text-white hover:shadow-lg md:text-base"
            >
              메인페이지
            </Link>
          </div>
        </div>

        <div
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        >
          <div className="animate-bounce">
            <svg className="h-6 w-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      <section className="w-full bg-white px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="moa-landing__font-serif mb-6 text-center text-3xl font-semibold tracking-[-0.03em] text-gray-800 md:text-5xl">MOA란?</h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-base leading-8 text-gray-500 md:text-lg">
            MOA는 5축 에너지 프로필을 기반으로 당신의 현재 에너지 상태와 가장 잘 맞는 소규모 모임을 추천하는 플랫폼입니다. 기존의 관심사 기반 매칭과
            달리, 사회적 상호작용, 상호작용 깊이, 활동 강도, 참여 부담, 구조화 정도 등 다양한 차원을 고려하여 진짜로 당신에게 맞는 모임을
            찾아드립니다.
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
            {[
              { title: "사회적 상호작용", desc: "대화량과 친목 압력" },
              { title: "상호작용 깊이", desc: "교류의 깊이와 강도" },
              { title: "활동 강도", desc: "신체 및 인지 활동" },
              { title: "참여 부담", desc: "필참, 회비, 규칙" },
              { title: "구조화 정도", desc: "진행 구조와 역할" },
            ].map((dimension, index) => (
              <div key={index} className="moa-landing__font-serif rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
                <h3 className="mb-2 text-base font-semibold text-gray-800">{dimension.title}</h3>
                <p className="text-sm text-gray-500">{dimension.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="w-full border-t border-gray-200 bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm text-gray-500">&copy; 2026 MOA. 조용한 교류, 에너지에 맞는 모임을 찾아보세요.</p>
        </div>
      </footer>
    </div>
  );
}
