import { useState, useEffect, useRef } from "react";
import * as Sentry from "@sentry/react";
import { formatBirthdate } from "../utils/dataTransform";
import loadingGif from "../assets/images/cat_greeting.gif";

const AD_GROUP_ID =
  import.meta.env.VITE_AD_GROUP_ID || "ait-ad-test-rewarded-id";

const ANALYSIS_STEPS = [
  "사주 명식을 계산하고 있어요",
  "오행의 비율을 계산하고 있어요",
  "일주를 분석중이에요",
  "십성을 분석하고 있어요",
  "일간의 세기를 파악하고 있어요",
  "용신을 분석하고 있어요",
  "대운과 세운을 분석하고 있어요",
  "최종 사주 풀이를 하고 있어요",
];

export default function DeepReadingLoading({ userData, onNext }) {
  const [loadingMessage, setLoadingMessage] =
    useState("광고를 준비하고 있습니다...");
  const [adLoaded, setAdLoaded] = useState(false);
  const [adRewarded, setAdRewarded] = useState(false);
  const [apiCompleted, setApiCompleted] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const cleanupRef = useRef(null);
  const abortControllerRef = useRef(null);
  const apiCalledRef = useRef(false);

  // 단계별 진행 표시
  useEffect(() => {
    if (!adRewarded || apiCompleted || apiError) return;
    setCurrentStep(0);
    const interval = setInterval(() => {
      setCurrentStep((prev) =>
        prev < ANALYSIS_STEPS.length - 1 ? prev + 1 : prev,
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [adRewarded, apiCompleted, apiError]);

  // 광고 로드
  useEffect(() => {
    const loadAd = async () => {
      try {
        const { GoogleAdMob } = await import("@apps-in-toss/web-framework");

        const isAdUnsupported =
          GoogleAdMob.loadAppsInTossAdMob.isSupported?.() === false;

        if (isAdUnsupported) {
          console.warn("광고가 지원되지 않습니다.");
          setAdLoaded(true);
          setAdRewarded(true);
          setLoadingMessage("신년운세를 풀이하고 있습니다...");
          callDeepReadingApi();
          return;
        }

        cleanupRef.current?.();
        cleanupRef.current = null;

        const cleanup = GoogleAdMob.loadAppsInTossAdMob({
          options: {
            adGroupId: AD_GROUP_ID,
          },
          onEvent: (event) => {
            if (event.type === "loaded") {
              console.log("광고 로드 완료");
              setAdLoaded(true);
              setLoadingMessage("광고를 재생합니다");
            }
          },
          onError: (error) => {
            console.error("광고 로드 실패", error);
            setAdLoaded(true);
            setAdRewarded(true);
            setLoadingMessage("신년운세를 풀이하고 있습니다...");
            callDeepReadingApi();
          },
        });

        cleanupRef.current = cleanup;
      } catch (error) {
        console.error("광고 모듈 로드 실패:", error);
        setAdLoaded(true);
        setAdRewarded(true);
        setLoadingMessage("신년운세를 풀이하고 있습니다...");
        callDeepReadingApi();
      }
    };

    loadAd();

    return () => {
      cleanupRef.current?.();
    };
  }, []);

  // 광고가 로드되면 자동 재생
  useEffect(() => {
    if (adLoaded && !adRewarded) {
      showAd();
    }
  }, [adLoaded, adRewarded]);

  const showAd = async () => {
    try {
      const { GoogleAdMob } = await import("@apps-in-toss/web-framework");

      const isAdUnsupported =
        GoogleAdMob.showAppsInTossAdMob.isSupported?.() === false;

      if (isAdUnsupported) {
        console.warn("광고 재생이 지원되지 않습니다.");
        setAdRewarded(true);
        setLoadingMessage("신년운세를 풀이하고 있습니다...");
        callDeepReadingApi();
        return;
      }

      GoogleAdMob.showAppsInTossAdMob({
        options: {
          adGroupId: AD_GROUP_ID,
        },
        onEvent: (event) => {
          switch (event.type) {
            case "show":
              console.log("광고 재생 시작");
              callDeepReadingApi();
              break;

            case "userEarnedReward":
              console.log("광고 시청 보상 획득");
              setAdRewarded(true);
              setLoadingMessage("신년운세를 풀이하고 있습니다...");
              break;

            case "dismissed":
              console.log("광고 종료");
              if (!adRewarded) {
                setAdRewarded(true);
                setLoadingMessage("신년운세를 풀이하고 있습니다...");
              }
              break;

            case "failedToShow":
              console.log("광고 재생 실패");
              setAdRewarded(true);
              setLoadingMessage("신년운세를 풀이하고 있습니다...");
              break;
          }
        },
        onError: (error) => {
          console.error("광고 재생 실패", error);
          setAdRewarded(true);
          setLoadingMessage("신년운세를 풀이하고 있습니다...");
        },
      });
    } catch (error) {
      console.error("광고 재생 중 오류:", error);
      setAdRewarded(true);
      setLoadingMessage("신년운세를 풀이하고 있습니다...");
      callDeepReadingApi();
    }
  };

  // Deep Reading API 호출
  const callDeepReadingApi = async () => {
    if (apiCalledRef.current) {
      console.log("API 이미 호출됨, 중복 호출 방지");
      return;
    }
    apiCalledRef.current = true;

    try {
      setLoadingMessage(
        "2026년 신년운세를 풀이하고 있어요.\n10~30초 정도 걸려요...",
      );

      abortControllerRef.current = new AbortController();
      const timeoutId = setTimeout(
        () => abortControllerRef.current?.abort(),
        180000,
      );

      const formData = new FormData();

      // name
      formData.append("name", userData.name || "사용자");

      // datetime (YYYY-MM-DD)
      formData.append("datetime", formatBirthdate(userData.birthdate));

      // gender: male/female 그대로 전송
      formData.append("gender", userData.gender);

      // hour, minute, am_pm (선택적)
      if (
        userData.birthdate?.period &&
        userData.birthdate.period !== "unknown"
      ) {
        if (userData.birthdate?.hour12) {
          formData.append("hour", userData.birthdate.hour12);
        }
        if (userData.birthdate?.minuteRange) {
          const minute =
            userData.birthdate.minuteRange === "0-29" ? "00" : "30";
          formData.append("minute", minute);
        }
        formData.append("am_pm", userData.birthdate.period.toUpperCase());
      }

      // birthday_type
      formData.append("birthday_type", "solar");

      // reading_type
      if (userData.readingType) {
        formData.append("reading_type", userData.readingType);
      }

      // concerns: 선택된 운세 타입 제목
      if (userData.fortuneTypeTitle) {
        formData.append("concerns", userData.fortuneTypeTitle);
      }

      // language
      formData.append("language", "ko");

      const apiKey = import.meta.env.VITE_SAJU_AI_API_KEY;
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const endpoint = `${baseUrl}/deep-reading/start`;

      console.log("Deep Reading API 호출 시작:", { endpoint, userData });

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "X-API-Key": apiKey,
        },
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API 호출 실패: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log("Deep Reading API 호출 성공:", result);

      setApiCompleted(true);

      onNext({
        fortuneResult: {
          reading: result.reading,
          thread_id: result.thread_id,
          follow_up_questions: result.follow_up_questions,
          headline: result.headline,
          summary: result.summary,
        },
      });
    } catch (error) {
      console.error("Deep Reading API 호출 오류:", error);

      Sentry.captureException(error, {
        extra: {
          userName: userData?.name,
          readingType: userData?.readingType,
        },
      });

      if (error.name === "AbortError") {
        setApiError("요청 시간이 초과되었습니다. 다시 시도해 주세요.");
      } else {
        setApiError("신년운세를 생성하는데 실패했습니다. 다시 시도해 주세요.");
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  if (apiError) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          padding: "20px",
          background: "#ffffff",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "24px" }}>😢</div>

        <h2
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            color: "var(--color-primary-dark)",
            marginBottom: "12px",
            textAlign: "center",
          }}
        >
          {apiError}
        </h2>

        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: "24px",
            padding: "16px 32px",
            fontSize: "16px",
            fontWeight: "bold",
            color: "#fff",
            background: "var(--color-primary)",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          처음부터 다시하기
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        padding: "20px",
        background: "#ffffff",
      }}
    >
      <img
        src={loadingGif}
        alt=""
        style={{
          width: "220px",
          height: "220px",
          objectFit: "contain",
          marginBottom: "24px",
        }}
      />

      {currentStep >= 0 ? (
        <div style={{ width: "100%", maxWidth: "280px" }}>
          {ANALYSIS_STEPS.map((step, i) => {
            const isDone = i < currentStep;
            const isCurrent = i === currentStep;
            if (i > currentStep) return null;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                  opacity: isDone ? 0.5 : 1,
                  animation: isCurrent ? "fadeIn 0.4s ease-out" : undefined,
                }}
              >
                {isDone ? (
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "var(--color-primary-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      color: "var(--color-primary)",
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </div>
                ) : (
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      flexShrink: 0,
                      border: "3px solid var(--color-primary-light)",
                      borderTop: "3px solid var(--color-primary)",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                )}
                <span
                  style={{
                    fontSize: "15px",
                    color: "var(--color-primary-dark)",
                    fontWeight: isCurrent ? "600" : "400",
                  }}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <div style={{ width: "80px", height: "80px", marginBottom: "24px" }}>
            <div
              style={{
                width: "100%",
                height: "100%",
                border: "4px solid var(--color-primary-light)",
                borderTop: "4px solid var(--color-primary)",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
          </div>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "var(--color-primary-dark)",
              marginBottom: "12px",
              textAlign: "center",
              whiteSpace: "pre-line",
            }}
          >
            {loadingMessage}
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "var(--color-primary)",
              textAlign: "center",
              lineHeight: "1.6",
            }}
          >
            광고를 시청하면서 결과를 기다려 주세요.
          </p>
        </>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
