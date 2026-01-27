import { useState, useEffect, useRef } from "react";
import { ListHeader, StepperRow } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import animalFortune from "../assets/images/animal-fortune.png";
import basicFortune from "../assets/images/basic-fortune.png";
import foodFortune from "../assets/images/food-fortune.png";
import hobbyFortune from "../assets/images/hobby-fortune.png";
import jobFortune from "../assets/images/job-fortune.png";
import lookbookFortune from "../assets/images/lookbook-fortune.png";
import natureFortune from "../assets/images/nature-fortune.png";
import travelFortune from "../assets/images/travel-fortune.png";
import travelLookbookFortune from "../assets/images/travel-lookbook-fortune.png";

const defaultImages = [
  animalFortune,
  basicFortune,
  foodFortune,
  hobbyFortune,
  jobFortune,
  lookbookFortune,
  natureFortune,
  travelFortune,
  travelLookbookFortune,
];

// Horizontal Auto Scroll 컴포넌트
function HorizontalAutoScroll({ images }) {
  const scrollRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const scrollWidth = scrollContainer.scrollWidth;
    const clientWidth = scrollContainer.clientWidth;
    const maxScroll = scrollWidth - clientWidth;

    const interval = setInterval(() => {
      setScrollPosition((prev) => {
        const next = prev + 1;
        if (next >= maxScroll) {
          return 0;
        }
        return next;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollPosition;
    }
  }, [scrollPosition]);

  return (
    <div
      ref={scrollRef}
      style={{
        width: "100%",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "12px",
          paddingLeft: "20px",
        }}
      >
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt=""
            style={{
              width: "200px",
              height: "260px",
              objectFit: "cover",
              borderRadius: "12px",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          />
        ))}
        {/* 무한 스크롤을 위해 이미지 복제 */}
        {images.map((image, index) => (
          <img
            key={`duplicate-${index}`}
            src={image}
            alt=""
            style={{
              width: "200px",
              height: "260px",
              objectFit: "cover",
              borderRadius: "12px",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Intro({
  onNext,
  title,
  subtitle,
  heroImages = defaultImages,
  steps,
  useHorizontalScroll = false,
  remainingCount = null,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (useHorizontalScroll || heroImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [heroImages.length, useHorizontalScroll]);

  return (
    <>
      <div style={{ padding: "20px 20px 0" }}>
        <h1
          style={{
            fontSize: "22px",
            lineHeight: "1.4",
            fontWeight: "bold",
            color: "#191F28",
            margin: "0 0 8px 0",
          }}
        >
          {title || "AI 로 만드는 사주 이미지"}
        </h1>
        <p
          style={{
            fontSize: "15px",
            lineHeight: "1.5",
            color: "#4E5968",
            fontWeight: "500",
            margin: 0,
          }}
        >
          {subtitle || "나만의 특별한 사주 이미지와 개운 아이템을 찾아보세요"}
        </p>
      </div>

      {remainingCount !== null && remainingCount <= 0 && (
        <div
          style={{
            background: "#FEE2E2",
            padding: "12px 16px",
            margin: "16px 20px 0",
            borderRadius: "8px",
            fontSize: "14px",
            color: "#991B1B",
            fontWeight: "500",
          }}
        >
          오늘 주문이 마감되었습니다. 내일 다시 방문해 주세요.
        </div>
      )}
      {remainingCount !== null && remainingCount > 0 && (
        <div
          style={{
            background: "#FFF8E6",
            padding: "12px 16px",
            margin: "16px 20px 0",
            borderRadius: "8px",
            fontSize: "14px",
            color: "#92400E",
            fontWeight: "500",
          }}
        >
          오늘 남은 수량: {remainingCount}개
        </div>
      )}

      {useHorizontalScroll ? (
        <div style={{ padding: "20px 0" }}>
          <HorizontalAutoScroll images={heroImages} />
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            gap: "16px",
          }}
        >
          {heroImages.length > 1 && (
            <button
              onClick={() =>
                setCurrentIndex(
                  (prevIndex) =>
                    (prevIndex - 1 + heroImages.length) % heroImages.length,
                )
              }
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="이전"
            >
              <svg
                width="16"
                height="48"
                viewBox="0 0 16 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 6L4 24L12 42"
                  stroke="#B0B8C1"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}

          <img
            src={heroImages[currentIndex]}
            alt=""
            style={{
              width: "240px",
              height: "240px",
              objectFit: "cover",
              borderRadius: "16px",
              transition: "opacity 0.5s ease-in-out",
            }}
          />

          {heroImages.length > 1 && (
            <button
              onClick={() =>
                setCurrentIndex(
                  (prevIndex) => (prevIndex + 1) % heroImages.length,
                )
              }
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="다음"
            >
              <svg
                width="16"
                height="48"
                viewBox="0 0 16 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 6L12 24L4 42"
                  stroke="#B0B8C1"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      )}

      <div style={{ height: "24px" }} />

      {/* <ListHeader
        title={
          <ListHeader.TitleParagraph
            color={adaptive.grey800}
            fontWeight="bold"
            typography="t5"
          >
            이렇게 사용해요
          </ListHeader.TitleParagraph>
        }
        descriptionPosition="bottom"
      /> */}

      {steps ? (
        steps
      ) : (
        <>
          <StepperRow
            left={<StepperRow.NumberIcon number={1} />}
            center={
              <StepperRow.Texts
                type="A"
                title="생년월일과 태어난 시간을 입력하고"
                description=""
              />
            }
          />
          <StepperRow
            left={<StepperRow.NumberIcon number={2} />}
            center={
              <StepperRow.Texts
                type="A"
                title="원하는 풀이 타입 선택 하면"
                description=""
              />
            }
          />
          <StepperRow
            left={<StepperRow.NumberIcon number={3} />}
            center={
              <StepperRow.Texts
                type="A"
                title="나만의 멋진 사주 이미지 완성!"
                description=""
              />
            }
            hideLine={true}
          />
        </>
      )}

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px 20px calc(24px + env(safe-area-inset-bottom))",
          background: "#fff",
        }}
      >
        <button
          onClick={() => {
            if (remainingCount !== null && remainingCount <= 0) {
              alert("오늘 주문이 마감되었습니다. 내일 다시 방문해 주세요.");
              return;
            }
            onNext({});
          }}
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "16px",
            fontWeight: "bold",
            color: "#fff",
            background:
              remainingCount !== null && remainingCount <= 0
                ? "#B0B8C1"
                : "var(--color-primary)",
            border: "none",
            borderRadius: "8px",
            cursor:
              remainingCount !== null && remainingCount <= 0
                ? "not-allowed"
                : "pointer",
          }}
        >
          다음
        </button>
      </div>
    </>
  );
}
