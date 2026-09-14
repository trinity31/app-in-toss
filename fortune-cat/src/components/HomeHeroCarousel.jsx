import { useEffect, useRef, useState } from "react";

const HERO_AUTOPLAY_MS = 4500;

const visuallyHidden = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

export default function HomeHeroCarousel({ slides, onSlideClick, onShare }) {
  const scrollerRef = useRef(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = (index) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  };

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el || el.clientWidth === 0) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  // 자동 슬라이드 — 사용자가 만지는 동안·동작 줄이기 설정 시 멈춤
  useEffect(() => {
    if (paused || slides.length <= 1) return;
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const timer = window.setInterval(() => {
      const el = scrollerRef.current;
      if (!el) return;
      const nextIndex = (active + 1) % slides.length;
      el.scrollTo({ left: nextIndex * el.clientWidth, behavior: "smooth" });
    }, HERO_AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [active, paused, slides.length]);

  return (
    <section
      style={{
        position: "relative",
        width: "calc(100% + 40px)",
        margin: "0 -20px",
      }}
      aria-roledescription="carousel"
      aria-label="연애상담 풀이 바로가기"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <style>{`.home-hero-scroller::-webkit-scrollbar { display: none; }`}</style>

      <h1 style={visuallyHidden}>복냥사주·타로</h1>

      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="home-hero-scroller"
        style={{
          display: "flex",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
        }}
      >
        {slides.map((slide, i) => (
          <button
            key={slide.key}
            type="button"
            onClick={() => onSlideClick(slide)}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${slides.length}: ${slide.title}`}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              flex: "0 0 100%",
              width: "100%",
              minHeight: "176px",
              scrollSnapAlign: "center",
              padding: "36px 20px 40px",
              boxSizing: "border-box",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              color: "#2a1f36",
              background: slide.bg,
              fontFamily: "inherit",
            }}
          >
            <div style={{ flex: 1, minWidth: 0, paddingRight: "64px" }}>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#b33a6a",
                  margin: 0,
                }}
              >
                {slide.eyebrow}
              </p>
              <p
                style={{
                  marginTop: "4px",
                  marginRight: 0,
                  marginBottom: 0,
                  marginLeft: 0,
                  fontSize: "26px",
                  fontWeight: 800,
                  lineHeight: 1.25,
                }}
              >
                {slide.title}
              </p>
              <p
                style={{
                  marginTop: "8px",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  color: "rgba(42,31,54,0.8)",
                }}
              >
                {slide.description}
              </p>
              <span
                style={{
                  marginTop: "12px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  borderRadius: "999px",
                  background: "#2a1f36",
                  padding: "6px 12px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#fff",
                }}
              >
                연애상담 모드 · 바로 보기 →
              </span>
            </div>
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                right: "16px",
                bottom: "32px",
                fontSize: "56px",
                lineHeight: 1,
                filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.15))",
              }}
            >
              {slide.icon}
            </span>
          </button>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "12px",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: "6px",
        }}
      >
        {slides.map((slide, i) => (
          <button
            key={slide.key}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`${i + 1}번째 배너 보기`}
            aria-current={active === i}
            style={{
              height: "6px",
              width: active === i ? "20px" : "6px",
              borderRadius: "999px",
              border: "none",
              padding: 0,
              cursor: "pointer",
              background: active === i ? "#2a1f36" : "rgba(42,31,54,0.3)",
              transition: "all 0.2s ease",
            }}
          />
        ))}
      </div>

      <div style={{ position: "absolute", top: "16px", right: "20px" }}>
        <button
          onClick={onShare}
          aria-label="공유"
          style={{
            background: "rgba(255,255,255,0.8)",
            border: "none",
            borderRadius: "50%",
            width: "44px",
            height: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#191F28"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
      </div>
    </section>
  );
}
