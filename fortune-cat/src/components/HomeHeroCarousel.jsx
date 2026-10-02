import { useEffect, useLayoutEffect, useRef, useState } from "react";

import PastelIcon from "./PastelIcon";

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

export default function HomeHeroCarousel({ slides, onSlideClick }) {
  const scrollerRef = useRef(null);
  const [active, setActive] = useState(0);
  const [pointerPaused, setPointerPaused] = useState(false);
  const [touchPaused, setTouchPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
  const paused = pointerPaused || touchPaused || focusPaused;

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!media) return;
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  // Reordered or shrinking campaigns must start at a valid page before paint.
  useLayoutEffect(() => {
    setActive(0);
    scrollerRef.current?.scrollTo({ left: 0, behavior: "auto" });
  }, [slides]);

  const goTo = (index) => {
    const el = scrollerRef.current;
    if (!el || slides.length === 0) return;
    const target = Math.max(0, Math.min(index, slides.length - 1));
    el.scrollTo({ left: target * el.clientWidth, behavior: reducedMotion ? "auto" : "smooth" });
  };

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el || el.clientWidth === 0) return;
    setActive(Math.max(0, Math.min(slides.length - 1, Math.round(el.scrollLeft / el.clientWidth))));
  };

  // 자동 슬라이드 — 사용자가 만지는 동안·동작 줄이기 설정 시 멈춤
  useEffect(() => {
    if (paused || reducedMotion || slides.length <= 1) return;
    const timer = window.setInterval(() => {
      const el = scrollerRef.current;
      if (!el) return;
      const nextIndex = (active + 1) % slides.length;
      el.scrollTo({ left: nextIndex * el.clientWidth, behavior: "smooth" });
    }, HERO_AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [active, paused, reducedMotion, slides.length]);

  if (slides.length === 0) return <h1 style={visuallyHidden}>복냥사주·타로</h1>;

  return (
    <section
      style={{
        position: "relative",
        width: "calc(100% + 40px)",
        margin: "0 -20px",
      }}
      aria-roledescription="carousel"
      aria-label="추천 풀이 바로가기"
      onPointerEnter={() => setPointerPaused(true)}
      onPointerLeave={() => setPointerPaused(false)}
      onTouchStart={() => setTouchPaused(true)}
      onTouchEnd={() => setTouchPaused(false)}
      onTouchCancel={() => setTouchPaused(false)}
      onFocusCapture={() => setFocusPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocusPaused(false);
      }}
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
                {slide.cta || "바로 보기"} →
              </span>
            </div>
            <PastelIcon
              code={slide.selectedType?.fortuneType}
              emoji={slide.icon}
              size={80}
              glyphSize={40}
              style={{
                position: "absolute",
                right: "16px",
                bottom: "24px",
                background: "rgba(255,255,255,0.8)",
                boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
              }}
            />
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
              transition: reducedMotion ? "none" : "all 0.2s ease",
            }}
          />
        ))}
      </div>

    </section>
  );
}
