import { useState, useEffect, useRef } from "react";
import * as Sentry from "@sentry/react";
import { formatBirthdate } from "../utils/dataTransform";
import { useAnonymousKey } from "../hooks/useAnonymousKey.jsx";
import { useSession } from "../hooks/useSession.jsx";
import { resolveAdGroupId } from "../config/ads";
import loadingGif from "../assets/images/cat_greeting.gif";

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
  const { anonymousKey, loading: anonymousKeyLoading } = useAnonymousKey();
  const { startNewSession } = useSession();

  // 유료 풀이(심화·궁합)는 광고 없이 바로 생성. 무료 풀이(오늘의 운세·행운의 숫자/컬러)만 광고.
  const FREE_READING_TYPES = ["deep_reading_daily", "lucky_number", "lucky_color"];
  const isPaidReading =
    !!userData.partnerName ||
    !FREE_READING_TYPES.includes(userData.readingType || "");

  const [loadingMessage, setLoadingMessage] = useState(
    isPaidReading ? "운세를 풀이하고 있어요..." : "광고를 준비하고 있습니다...",
  );
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

  // 광고 로드 (anonymousKey 해석 이후 실행)
  useEffect(() => {
    if (anonymousKeyLoading) return;

    // 유료 풀이는 광고를 건너뛰고 바로 생성 (결제로 수익화 → 광고 미노출)
    if (isPaidReading) {
      setAdRewarded(true);
      callDeepReadingApi();
      return;
    }

    const adGroupId = resolveAdGroupId(anonymousKey);
    console.log("[DeepReadingLoading] adGroupId:", adGroupId);

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
            adGroupId,
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
  }, [anonymousKeyLoading, anonymousKey]);

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
          adGroupId: resolveAdGroupId(anonymousKey),
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

      const isCompatibility = !!userData.partnerName;
      const apiKey = import.meta.env.VITE_SAJU_AI_API_KEY;
      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      // 새 리딩 세션 시작 (이후 /chat 요청은 이 session_id 를 유지)
      const newSessionId = startNewSession();

      const buildBirthTime = (birthdate) => {
        if (birthdate?.period && birthdate.period !== "unknown" && birthdate?.hour) {
          const h = String(birthdate.hour).padStart(2, "0");
          const m = birthdate?.minute || "00";
          return `${h}:${m}`;
        }
        return null;
      };

      let endpoint;
      let fetchOptions;

      if (isCompatibility) {
        endpoint = `${baseUrl}/deep-reading-match/start`;

        const body = {
          person1: {
            name: userData.name || "사용자",
            gender: userData.gender,
            birthday: formatBirthdate(userData.birthdate),
            birthday_type: userData.birthdate?.birthdayType || "solar",
            is_leap_month: Boolean(userData.birthdate?.isLeapMonth),
          },
          person2: {
            name: userData.partnerName,
            gender: userData.partnerGender,
            birthday: formatBirthdate(userData.partnerBirthdate),
            birthday_type: userData.partnerBirthdate?.birthdayType || "solar",
            is_leap_month: Boolean(userData.partnerBirthdate?.isLeapMonth),
          },
          language: "ko",
        };

        const person1Time = buildBirthTime(userData.birthdate);
        if (person1Time) body.person1.birth_time = person1Time;

        const person2Time = buildBirthTime(userData.partnerBirthdate);
        if (person2Time) body.person2.birth_time = person2Time;

        if (userData.fortuneTypeTitle) {
          body.concerns = userData.fortuneTypeTitle;
        }

        if (anonymousKey) {
          body.user_anonymous_id = anonymousKey;
        }
        if (newSessionId) {
          body.session_id = newSessionId;
        }

        fetchOptions = {
          method: "POST",
          headers: {
            "X-API-Key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          signal: abortControllerRef.current.signal,
        };
      } else {
        endpoint = `${baseUrl}/deep-reading/start`;

        const formData = new FormData();
        formData.append("name", userData.name || "사용자");
        formData.append("datetime", formatBirthdate(userData.birthdate));
        formData.append("gender", userData.gender);

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

        formData.append("birthday_type", userData.birthdate?.birthdayType || "solar");
        formData.append("is_leap_month", String(Boolean(userData.birthdate?.isLeapMonth)));

        if (userData.readingType) {
          formData.append("reading_type", userData.readingType);
        }
        if (userData.fortuneTypeTitle) {
          formData.append("concerns", userData.fortuneTypeTitle);
        }
        formData.append("language", "ko");

        if (anonymousKey) {
          formData.append("user_anonymous_id", anonymousKey);
        }
        if (newSessionId) {
          formData.append("session_id", newSessionId);
        }

        fetchOptions = {
          method: "POST",
          headers: {
            "X-API-Key": apiKey,
          },
          body: formData,
          signal: abortControllerRef.current.signal,
        };
      }

      console.log("Deep Reading API 호출 시작:", { endpoint, isCompatibility, userData });

      const response = await fetch(endpoint, fetchOptions);

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
          cross_reading_ctas: result.cross_reading_ctas || [],
          is_preview: result.is_preview || false,
          paywall_required: result.paywall_required || null,
          is_revisit: result.is_revisit || false,
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
        setApiError(
          `${userData?.fortuneTypeTitle || "풀이"}를 생성하는데 실패했습니다. 다시 시도해 주세요.`,
        );
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const retryApiOnly = () => {
    setApiError(null);
    apiCalledRef.current = false;
    setCurrentStep(-1);
    callDeepReadingApi();
  };

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
          background: "var(--color-white)",
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
          onClick={retryApiOnly}
          style={{
            marginTop: "24px",
            padding: "16px 32px",
            fontSize: "16px",
            fontWeight: "bold",
            color: "var(--color-white)",
            background: "var(--color-primary)",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          다시 시도하기
        </button>

        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: "12px",
            padding: "12px 32px",
            fontSize: "14px",
            fontWeight: "500",
            color: "var(--color-primary)",
            background: "transparent",
            border: "none",
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
        background: "var(--color-white)",
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
