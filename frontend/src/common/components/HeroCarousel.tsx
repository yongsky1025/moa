import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./HeroCarousel.css";

type HeroSlide = {
  id: number;
  label: string;
  title: string;
  description: string;
  image: string;
  position: string;
  primaryText: string;
  primaryHref: string;
  secondaryText: string;
  secondaryHref: string;
  variant: "accent" | "primary" | "outline-light";
};

const slides: HeroSlide[] = [
  {
    id: 1,
    label: "ENERGY TEST",
    title: "내 에너지에 맞는\n모임을 찾아보세요",
    description: "몇 가지 질문만으로 지금의 에너지 상태를 분석하고, \n부담 없이 편안한 모임을 추천해드려요.",
    image: "/hero/hero_test.jpg",
    position: "right center",
    primaryText: "에너지 테스트 시작하기",
    primaryHref: "/users/energy-test",
    secondaryText: "more",
    secondaryHref: "/users/energy-test/result",
    variant: "accent",
  },
  {
    id: 2,
    label: "MOA MEETUP",
    title: "오늘의 에너지로\n가볍게 만나는 모임",
    description: "소수와의 대화, 취향 기반 모임, \n 지금의 리듬에 맞는 활동을 편안하게 둘러보세요.",
    image: "/hero/hero_circle.jpg",
    position: "center center",
    primaryText: "추천 모임 둘러보기",
    primaryHref: "/circle",
    secondaryText: "more",
    secondaryHref: "/circle",
    variant: "primary",
  },
  {
    id: 3,
    label: "PLACE",
    title: "모임에 어울리는 \n 공간도 함께 찾아보세요",
    description: "대화, 클래스, 전시, 소규모 모임에 맞는 \n차분한 공간을 쉽고 빠르게 확인할 수 있어요.",
    image: "/hero/hero_place.jpg",
    position: "center center",
    primaryText: "플레이스 보기",
    primaryHref: "/place/rental",
    secondaryText: "more",
    secondaryHref: "/place/rental",
    variant: "primary",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = slides.length;
  const currentSlide = useMemo(() => slides[current], [current]);

  useEffect(() => {
    if (isPaused) return undefined;

    const timer = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, 5500);

    return () => window.clearInterval(timer);
  }, [isPaused, total]);

  const goPrev = () => {
    setCurrent((prev) => (prev - 1 + total) % total);
  };

  const goNext = () => {
    setCurrent((prev) => (prev + 1) % total);
  };

  const goTo = (index: number) => {
    setCurrent(index);
  };

  return (
    <section className="moa-hero" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} aria-label="MOA 메인 히어로">
      <div className="moa-hero__slides">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`moa-hero__slide ${index === current ? "is-active" : ""}`}
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundPosition: slide.position,
            }}
            aria-hidden={index !== current}
          />
        ))}
      </div>

      <div className="moa-hero__overlay" />

      <div className="moa-hero__inner">
        <div className="moa-hero__content">
          <p className="moa-hero__label">{currentSlide.label}</p>

          <h1 className="moa-hero__title">
            {currentSlide.title.split("\n").map((line, idx, arr) => (
              <span key={`${currentSlide.id}-${idx}`}>
                {line}
                {idx < arr.length - 1 ? <br /> : null}
              </span>
            ))}
          </h1>

          <p className="moa-hero__desc">{currentSlide.description}</p>

          <div className="moa-hero__actions">
            <Link to={currentSlide.primaryHref} className={`moa-hero__btn moa-hero__btn--${currentSlide.variant}`}>
              {currentSlide.primaryText}
            </Link>
          </div>
        </div>

        <div className="moa-hero__dots" role="tablist" aria-label="히어로 슬라이드 선택">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={`moa-hero__dot ${index === current ? "is-active" : ""}`}
              onClick={() => goTo(index)}
              aria-label={`${index + 1}번 슬라이드 보기`}
              aria-selected={index === current}
            />
          ))}
        </div>
      </div>

      <button type="button" className="moa-hero__arrow moa-hero__arrow--prev" onClick={goPrev} aria-label="이전 슬라이드">
        ‹
      </button>
      <button type="button" className="moa-hero__arrow moa-hero__arrow--next" onClick={goNext} aria-label="다음 슬라이드">
        ›
      </button>
    </section>
  );
}
