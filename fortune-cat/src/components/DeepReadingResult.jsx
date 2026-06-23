import { useState, useCallback, useRef, useEffect } from "react";

import ReactMarkdown from "react-markdown";
import * as Sentry from "@sentry/react";
import { useToast } from "../hooks/useToast";
import { useAnonymousKey } from "../hooks/useAnonymousKey.jsx";
import { useSession } from "../hooks/useSession.jsx";
import { useBlockSwipeBack } from "../hooks/useBlockSwipeBack";
import { useSafeAreaInsets } from "../hooks/useSafeAreaInsets";
import { Analytics } from "@apps-in-toss/web-framework";
import { logEvent } from "../lib/firebase";
import { trackServerEvent } from "../lib/analytics";
import { normalizeMarkdown, markdownComponents } from "../utils/markdown";
import {
  purchaseDeepReading,
  grantDeepReading,
  revealDeepReading,
  getQuota,
  saveDeepReadingPending,
  getDeepReadingPending,
  clearDeepReadingPending,
  getPendingDeepReadingOrders,
  completeDeepReadingGrant,
} from "../lib/deepReadingPurchase";

export default function DeepReadingResult({
  userData,
  onRestart,
  onCrossReading,
  restartLabel = "처음부터 다시하기",
}) {
  const { name, fortuneResult, fortuneTypeTitle } = userData;
  const crossCtas = fortuneResult.cross_reading_ctas || [];
  const { openToast } = useToast();
  const { anonymousKey } = useAnonymousKey();
  const { sessionId } = useSession();

  // 결과 화면에서 뒤로가기로 풀이가 유실되는 것을 방지 (Android는 확인 다이얼로그)
  useBlockSwipeBack(onRestart);
  const insets = useSafeAreaInsets();

  const sessionStartRef = useRef(Date.now());
  const lastQuestionAtRef = useRef(Date.now());
  const [messages, setMessages] = useState(() => {
    const initial = [
      {
        role: "assistant",
        content: fortuneResult.reading,
        followUpQuestions: fortuneResult.follow_up_questions,
      },
    ];
    // 보관함 진입 시: 저장된 이전 후속 대화를 이어붙임
    (fortuneResult.messages || []).forEach((m) => {
      initial.push(
        m.role === "assistant"
          ? {
              role: "assistant",
              content: m.content,
              followUpQuestions: m.follow_up_questions || [],
            }
          : { role: m.role, content: m.content },
      );
    });
    return initial;
  });
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState(null);
  const [bottomBarHeight, setBottomBarHeight] = useState(88);
  const bottomBarRef = useRef(null);

  // ── 990원 Paywall ──
  const readingType = userData.readingType || "";
  const isPreview = Boolean(fortuneResult.is_preview);
  const [previewActive, setPreviewActive] = useState(isPreview);
  const [revealed, setRevealed] = useState(null);
  const [followupPaywall, setFollowupPaywall] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [followupRemaining, setFollowupRemaining] = useState(null);
  // 결제 후 reveal로 받은 전체 풀이가 있으면 그것을, 없으면 기존 값을 표시
  const headline = revealed?.headline ?? fortuneResult.headline;
  const summary = revealed?.summary ?? fortuneResult.summary;

  // 결제 funnel 이벤트: Firebase + Supabase(user_events) 양쪽으로 발화
  const firePaywall = (name, params = {}) => {
    logEvent(name, { ...params, session_id: sessionId });
    trackServerEvent(name, params, anonymousKey, sessionId);
  };

  useEffect(() => {
    if (bottomBarRef.current) {
      setBottomBarHeight(bottomBarRef.current.offsetHeight);
    }
  }, []);

  // 크로스 추천 CTA 노출 1회 트래킹 (오늘의 운세 결과에만 채워짐)
  useEffect(() => {
    if (crossCtas.length === 0) return;
    logEvent("cross_cta_shown", {
      from_reading_type: userData.readingType || "",
      suggested_types: crossCtas.map((c) => c.reading_type).join(","),
      session_id: sessionId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCrossCtaClick = (cta, position) => {
    logEvent("cross_cta_clicked", {
      from_reading_type: userData.readingType || "",
      to_reading_type: cta.reading_type,
      position,
      session_id: sessionId,
    });
    Analytics.click({ button_name: "cross_cta" });
    onCrossReading?.(cta);
  };

  // 미리보기(첫 풀이 결제) 노출 1회 트래킹
  useEffect(() => {
    if (!isPreview) return;
    firePaywall("paywall_shown", {
      trigger: "reading_start",
      reading_type: readingType,
      session_id: sessionId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 메뉴에서 이미 본 풀이로 재진입(is_revisit)한 경우: 저장된 과거 후속 대화 복원.
  // (보관함 진입은 fortuneResult.messages로 이미 들어오므로 제외)
  useEffect(() => {
    if (!fortuneResult.is_revisit) return;
    if ((fortuneResult.messages || []).length > 0) return;
    if (!anonymousKey || !fortuneResult.thread_id) return;
    let cancelled = false;
    (async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const r = await fetch(
          `${baseUrl}/deep-reading/conversation?thread_id=${encodeURIComponent(
            fortuneResult.thread_id,
          )}&user_anonymous_id=${encodeURIComponent(anonymousKey)}`,
          { headers: { "X-API-Key": import.meta.env.VITE_SAJU_AI_API_KEY } },
        );
        if (!r.ok || cancelled) return;
        const data = await r.json();
        const past = data.messages || [];
        if (cancelled || past.length === 0) return;
        setMessages((prev) => {
          // 이미 새 후속질문을 보냈다면(>1) 덮어쓰지 않음. prev[0]=초기 풀이 뒤에 과거 대화 복원.
          if (prev.length > 1) return prev;
          const restored = past.map((m) =>
            m.role === "assistant"
              ? {
                  role: "assistant",
                  content: m.content,
                  followUpQuestions: m.follow_up_questions || [],
                }
              : { role: m.role, content: m.content },
          );
          return [...prev.slice(0, 1), ...restored];
        });
      } catch {
        /* 복원 실패해도 현재 풀이는 정상 표시 */
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anonymousKey]);

  // 결제 사용자: 남은 후속질문 횟수 조회 (미리보기 상태가 아니면)
  useEffect(() => {
    if (!anonymousKey || isPreview) return;
    getQuota(anonymousKey)
      .then((q) => setFollowupRemaining(q.followup_remaining))
      .catch(() => {});
  }, [anonymousKey, isPreview]);

  // 결제 성공 후 서버 지급 실패 시 복구 (토스 getPendingOrders 기반, 부적아트와 동일 패턴)
  const recoverPendingPurchase = async () => {
    if (!anonymousKey) return false;
    const pending = getDeepReadingPending();
    if (!pending) return false;

    let orders = [];
    try {
      orders = await getPendingDeepReadingOrders();
    } catch {
      return false; // SDK 없음/일시 오류 — 다음 기회에 재시도
    }
    if (!orders.length) {
      clearDeepReadingPending();
      return false;
    }

    for (const o of orders) {
      const orderId = o.orderId || o.id || o;
      try {
        const res = await grantDeepReading(orderId, anonymousKey);
        if (!res?.success) continue;
        await completeDeepReadingGrant(orderId);
        // 미리보기 중이면 현재 보고 있는 풀이를 전체 공개 (quota는 위 grant로 복구됨)
        if (previewActive) {
          try {
            const full = await revealDeepReading(
              fortuneResult.thread_id,
              anonymousKey,
            );
            if (!full.is_preview) {
              setRevealed(full);
              setMessages([
                {
                  role: "assistant",
                  content: full.reading,
                  followUpQuestions: full.follow_up_questions,
                },
              ]);
              setPreviewActive(false);
            }
          } catch {
            /* reveal 실패해도 quota는 복구됨 */
          }
        }
        setFollowupRemaining(res.followup_remaining ?? 10);
        setFollowupPaywall(false);
        clearDeepReadingPending();
        firePaywall("paywall_purchase_completed", {
          reading_type: readingType,
          trigger: "recovery",
          order_id: orderId,
          session_id: sessionId,
        });
        openToast({ message: "결제가 복구되었어요. 전체 풀이를 확인하세요." });
        return true;
      } catch {
        /* 다음 주문 시도 */
      }
    }
    return false;
  };

  // 마운트/익명키 준비 시 미완료 결제 자동 복구
  useEffect(() => {
    recoverPendingPurchase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anonymousKey]);

  // 첫 풀이 결제 → grant → reveal → 전체 풀이 공개
  const handleReadingPurchase = async () => {
    if (isPurchasing) return;
    setIsPurchasing(true);
    saveDeepReadingPending({ thread_id: fortuneResult.thread_id });
    firePaywall("paywall_purchase_started", {
      reading_type: readingType,
      trigger: "reading_start",
      session_id: sessionId,
    });
    try {
      const { orderId } = await purchaseDeepReading();
      const grantRes = await grantDeepReading(orderId, anonymousKey);
      firePaywall("paywall_purchase_completed", {
        reading_type: readingType,
        trigger: "reading_start",
        order_id: orderId,
        session_id: sessionId,
      });
      const full = await revealDeepReading(fortuneResult.thread_id, anonymousKey);
      setRevealed(full);
      setMessages([
        {
          role: "assistant",
          content: full.reading,
          followUpQuestions: full.follow_up_questions,
        },
      ]);
      setPreviewActive(false);
      setFollowupRemaining(grantRes?.followup_remaining ?? 10);
      clearDeepReadingPending();
    } catch (err) {
      firePaywall("paywall_purchase_failed", {
        reading_type: readingType,
        trigger: "reading_start",
        reason: err?.message || "cancelled",
        session_id: sessionId,
      });
      // 결제는 됐는데 서버 지급이 실패했을 수 있음 → 복구 시도
      const recovered = await recoverPendingPurchase();
      if (!recovered) {
        openToast({ message: "결제가 취소되었거나 완료되지 않았습니다." });
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  // 후속질문 결제 → grant (후속 10회 충전)
  const handleFollowupPurchase = async () => {
    if (isPurchasing) return;
    setIsPurchasing(true);
    saveDeepReadingPending({ thread_id: fortuneResult.thread_id });
    firePaywall("paywall_purchase_started", {
      reading_type: readingType,
      trigger: "followup",
      session_id: sessionId,
    });
    try {
      const { orderId } = await purchaseDeepReading();
      const grantRes = await grantDeepReading(orderId, anonymousKey);
      firePaywall("paywall_purchase_completed", {
        reading_type: readingType,
        trigger: "followup",
        order_id: orderId,
        session_id: sessionId,
      });
      setFollowupPaywall(false);
      setFollowupRemaining(grantRes?.followup_remaining ?? 10);
      clearDeepReadingPending();
      openToast({ message: "결제 완료! 후속질문 10회가 충전되었어요. 다시 전송해 주세요." });
    } catch (err) {
      firePaywall("paywall_purchase_failed", {
        reading_type: readingType,
        trigger: "followup",
        reason: err?.message || "cancelled",
        session_id: sessionId,
      });
      const recovered = await recoverPendingPurchase();
      if (!recovered) {
        openToast({ message: "결제가 취소되었거나 완료되지 않았습니다." });
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  // callback ref: 로딩 표시가 DOM에 마운트되면 스크롤
  // setTimeout으로 사용자 메시지 버블의 레이아웃 완료를 기다린 후 스크롤
  const loadingIndicatorRef = useCallback((node) => {
    if (node) {
      setTimeout(() => {
        node.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
  }, []);

  const sendMessage = async (messageText, { inputType = "free_text" } = {}) => {
    if (!messageText.trim() || isSending) return;

    const userMessage = messageText.trim();
    setInputMessage("");

    const questionIndex = messages.filter((m) => m.role === "user").length + 1;
    const now = Date.now();
    const elapsedSinceStartMs = now - sessionStartRef.current;
    const elapsedSincePrevMs = now - lastQuestionAtRef.current;
    lastQuestionAtRef.current = now;

    logEvent("follow_up_question", {
      fortune_type: userData.selectedType?.fortuneType || "",
      fortune_title: fortuneTypeTitle || "",
      question_index: questionIndex,
      input_type: inputType,
      session_id: sessionId,
      elapsed_since_start_ms: elapsedSinceStartMs,
      elapsed_since_prev_ms: elapsedSincePrevMs,
    });
    Analytics.click({ button_name: "deep_reading_chat" });

    setLastFailedMessage(null);
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsSending(true);

    try {
      const apiKey = import.meta.env.VITE_SAJU_AI_API_KEY;
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const isCompatibility = userData.isCompatibility ?? !!userData.partnerName;
      const endpoint = isCompatibility
        ? `${baseUrl}/deep-reading-match/chat`
        : `${baseUrl}/deep-reading/chat`;

      const chatBody = {
        thread_id: fortuneResult.thread_id,
        message: userMessage,
      };
      if (anonymousKey) chatBody.user_anonymous_id = anonymousKey;
      if (sessionId) chatBody.session_id = sessionId;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "X-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chatBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`채팅 API 호출 실패: ${response.status} ${errorText}`);
      }

      const result = await response.json();

      // 후속질문 quota 소진 → 결제 유도 (낙관적 사용자 메시지 롤백 + 입력 복원)
      if (result.paywall_required) {
        setMessages((prev) =>
          prev[prev.length - 1]?.role === "user" ? prev.slice(0, -1) : prev,
        );
        setInputMessage(userMessage);
        setFollowupPaywall(true);
        setFollowupRemaining(0);
        firePaywall("paywall_shown", {
          trigger: "followup",
          reading_type: readingType,
          session_id: sessionId,
        });
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.reading,
          followUpQuestions: result.follow_up_questions,
        },
      ]);
      setFollowupRemaining((n) => (typeof n === "number" ? Math.max(0, n - 1) : n));
    } catch (error) {
      console.error("채팅 메시지 전송 오류:", error);
      Sentry.captureException(error, {
        extra: {
          threadId: fortuneResult.thread_id,
          userMessage,
        },
      });

      setLastFailedMessage(userMessage);
      setMessages((prev) => [
        ...prev,
        {
          role: "error",
          content: "메시지 전송에 실패했습니다.",
        },
      ]);
      openToast({ message: "잠시 연결이 불안정합니다. 다시 시도해 주세요" });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = () => sendMessage(inputMessage);

  const handleFollowUpClick = (question) => sendMessage(question, { inputType: "follow_up_button" });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-white)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "var(--color-white)",
          borderBottom: "1px solid var(--color-gray-200)",
          padding: "20px 24px",
          zIndex: 100,
        }}
      >
        <h1
          className="result-fade-in"
          style={{
            fontSize: "22px",
            fontWeight: "bold",
            color: "var(--color-gray-700)",
            marginBottom: "0",
          }}
        >
          {name ? `${name}님의 ` : ""}{fortuneTypeTitle || "2026 신년 운세"}
        </h1>
      </div>

      {/* 메시지 목록 */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          paddingBottom: `${bottomBarHeight + 100}px`,
          overflowY: "auto",
        }}
      >
        {/* 요약 섹션 */}
        {headline && (
          <div style={{ marginBottom: "20px" }}>
            <p
              className="result-fade-in-delay-1"
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "var(--color-gray-700)",
                textAlign: "center",
                lineHeight: "1.6",
                margin: "0 0 16px 0",
              }}
            >
              {headline}
            </p>
            {summary?.length > 0 && (
              <div
                className="result-fade-in-delay-2"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "8px",
                }}
              >
                {summary.map((item, i) => {
                  const gradeStr = (item.grade || "").trim();
                  const desc = item.description || "";
                  // display_type가 "info"이거나, grade가 실제 등급(상/중/하)이 아니면 정보형으로 간주
                  // (LLM이 grade를 비우고 키워드를 description에 넣어도 안전하게 배지로 렌더)
                  const isInfo =
                    item.display_type === "info" ||
                    !["상", "중", "하"].includes(gradeStr);
                  // 배지 키워드: grade에 있으면 그것, 없으면 description을 사용 (최대 2개)
                  const keywords = (isInfo ? gradeStr || desc : "")
                    .split(",")
                    .map((kw) => kw.trim())
                    .filter(Boolean)
                    .slice(0, 2);
                  // 설명 줄: 등급형은 항상, 정보형은 grade를 배지로 쓴 경우만(설명 중복 방지)
                  const descLine = isInfo ? (gradeStr ? desc : "") : desc;
                  // 카드 개수가 홀수면 마지막 카드는 한 줄 전체로 길게 표시
                  const total = summary.length;
                  const isLastOdd = total % 2 === 1 && i === total - 1;

                  return (
                    <div
                      key={i}
                      style={{
                        background: "var(--color-primary-light)",
                        borderRadius: "12px",
                        padding: "14px 8px",
                        textAlign: "center",
                        minHeight: "118px",
                        boxSizing: "border-box",
                        gridColumn: isLastOdd ? "1 / -1" : undefined,
                      }}
                    >
                      <div style={{ fontSize: "24px", marginBottom: "6px" }}>
                        {item.icon}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--color-gray-400)",
                          marginBottom: "4px",
                        }}
                      >
                        {item.label}
                      </div>
                      {/* 정보형 → 키워드 배지, 등급형 → 상/중/하 텍스트 */}
                      {isInfo ? (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            justifyContent: "center",
                            gap: "4px",
                            marginBottom: "4px",
                            minHeight: "22px",
                          }}
                        >
                          {keywords.map((kw, ki) => (
                            <span
                              key={ki}
                              style={{
                                fontSize: "11px",
                                fontWeight: "bold",
                                color: "var(--color-primary)",
                                background: "var(--color-white)",
                                border: "1px solid var(--color-primary)",
                                borderRadius: "10px",
                                padding: "2px 8px",
                                lineHeight: "1.3",
                              }}
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div
                          style={{
                            fontSize: "15px",
                            fontWeight: "bold",
                            color: "var(--color-primary)",
                            marginBottom: "4px",
                            minHeight: "22px",
                          }}
                        >
                          {item.grade}
                        </div>
                      )}
                      {descLine && (
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: "bold",
                            color: "var(--color-gray-700)",
                            lineHeight: "1.4",
                          }}
                        >
                          {descLine}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {messages.map((message, index) => {
          const isLastAssistant =
            message.role === "assistant" && index === messages.length - 1;
          // 미리보기(미결제) 첫 메시지는 하단을 그라데이션으로 페이드
          const isPreviewMsg =
            previewActive && index === 0 && message.role === "assistant";
          return (
            <div
              key={index}
              className={index === 0 ? "result-fade-in-delay-3" : undefined}
              style={{ marginBottom: "16px" }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection:
                    message.role === "user" ? "row-reverse" : "row",
                  alignItems: "flex-start",
                }}
              >
                {/* 메시지 내용 */}
                <div
                  style={{
                    maxWidth: message.role === "user" ? "75%" : "100%",
                    padding: message.role === "user" ? "12px 16px" : "20px",
                    borderRadius: "12px",
                    background:
                      message.role === "user"
                        ? "var(--color-primary)"
                        : message.role === "error"
                          ? "#FEF2F2"
                          : "var(--color-primary-light)",
                    color: message.role === "user" ? "var(--color-white)" : "var(--color-gray-600)",
                    position: "relative",
                  }}
                >
                  {message.role === "assistant" ? (
                    <>
                      <div
                        style={{
                          fontSize: "16px",
                          lineHeight: "1.8",
                          fontFamily: "'Do Hyeon', sans-serif",
                          fontWeight: 400,
                        }}
                      >
                        <ReactMarkdown components={markdownComponents}>
                          {normalizeMarkdown(message.content)}
                        </ReactMarkdown>
                      </div>
                      {isPreviewMsg && (
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: 0,
                            height: "84px",
                            background:
                              "linear-gradient(to bottom, transparent, var(--color-primary-light))",
                            borderRadius: "0 0 12px 12px",
                            pointerEvents: "none",
                          }}
                        />
                      )}
                    </>
                  ) : (
                    <div>
                      <p
                        style={{
                          fontSize: "15px",
                          lineHeight: "1.6",
                          margin: 0,
                          whiteSpace: "pre-wrap",
                          color: message.role === "error" ? "var(--color-error)" : undefined,
                        }}
                      >
                        {message.content}
                      </p>
                      {message.role === "error" && lastFailedMessage && (
                        <button
                          onClick={() => {
                            // 에러 메시지 제거 후 광고 없이 재시도
                            setMessages((prev) => prev.filter((m) => m !== message));
                            sendMessage(lastFailedMessage);
                          }}
                          style={{
                            marginTop: "8px",
                            padding: "10px 14px",
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "var(--color-error)",
                            background: "transparent",
                            border: "1px solid var(--color-error)",
                            borderRadius: "16px",
                            cursor: "pointer",
                            minHeight: "44px",
                          }}
                        >
                          다시 시도하기
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 후속 질문 버튼 (마지막 assistant 메시지에만, 전송 중이 아닐 때) */}
              {isLastAssistant &&
                !isSending &&
                message.followUpQuestions?.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginTop: "12px",
                    }}
                  >
                    {message.followUpQuestions.map((question, qIndex) => (
                      <button
                        key={qIndex}
                        onClick={() => handleFollowUpClick(question)}
                        style={{
                          padding: "10px 14px",
                          fontSize: "13px",
                          color: "var(--color-primary)",
                          background: "var(--color-white)",
                          border: "1px solid var(--color-primary)",
                          borderRadius: "20px",
                          cursor: "pointer",
                          lineHeight: "1.4",
                          textAlign: "left",
                          minHeight: "44px",
                        }}
                      >
                        {question}
                      </button>
                    ))}
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--color-gray-400)",
                        margin: "4px 0 0 0",
                      }}
                    >
                      이 풀이는 보관함에 저장돼요. 언제든 다시 보고 남은
                      횟수만큼 후속 질문을 이어서 할 수 있어요.
                    </p>
                  </div>
                )}

              {/* 크로스 추천 CTA — 오늘의 운세 본문(첫 메시지) 바로 아래에 고정 */}
              {index === 0 && crossCtas.length > 0 && (
                <div style={{ marginTop: "24px" }}>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "var(--color-gray-700)",
                      margin: "0 0 12px 0",
                    }}
                  >
                    이 분야도 한번 들여다보세요
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {crossCtas.map((cta, ctaIndex) => (
                      <button
                        key={cta.reading_type}
                        onClick={() => handleCrossCtaClick(cta, ctaIndex)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          width: "100%",
                          padding: "14px 16px",
                          background: "var(--color-primary-light)",
                          border: "1px solid var(--color-primary)",
                          borderRadius: "12px",
                          cursor: "pointer",
                          textAlign: "left",
                          minHeight: "44px",
                        }}
                      >
                        <span style={{ fontSize: "26px", lineHeight: 1 }}>
                          {cta.emoji}
                        </span>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span
                            style={{
                              display: "block",
                              fontSize: "15px",
                              fontWeight: "bold",
                              color: "var(--color-gray-700)",
                            }}
                          >
                            {cta.title}
                          </span>
                          <span
                            style={{
                              display: "block",
                              fontSize: "13px",
                              color: "var(--color-gray-400)",
                              marginTop: "2px",
                            }}
                          >
                            {cta.subtitle}
                          </span>
                        </span>
                        <span
                          style={{
                            fontSize: "18px",
                            color: "var(--color-primary)",
                            flexShrink: 0,
                          }}
                        >
                          ›
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* 전송 중 로딩 표시 */}
        {isSending && (
          <div
            ref={loadingIndicatorRef}
            style={{
              display: "flex",
              alignItems: "flex-start",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderRadius: "12px",
                background: "var(--color-primary-light)",
                color: "var(--color-gray-400)",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", gap: "4px" }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "var(--color-primary)",
                      opacity: 0.4,
                      animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite`,
                    }}
                  />
                ))}
              </div>
              잠시만 기다려 주세요
              <style>{`
                @keyframes bounce {
                  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                  30% { transform: translateY(-6px); opacity: 1; }
                }
              `}</style>
            </div>
          </div>
        )}

        {/* 미리보기 결제 CTA — 첫 풀이 잠금 해제 */}
        {previewActive && (
          <div style={{ marginTop: "8px" }}>
            <div
              style={{
                background: "var(--color-primary-light)",
                borderRadius: "16px",
                padding: "20px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--color-gray-600)",
                  margin: "0 0 16px",
                  lineHeight: 1.5,
                }}
              >
                결제하면 전체 풀이를 볼 수 있고, 추가 질문 횟수도 10회
                추가됩니다. 나중에 보관함에서도 다시 보기 가능하며, 질문도
                언제든지 가능합니다
              </p>
              <button
                onClick={handleReadingPurchase}
                disabled={isPurchasing}
                style={{
                  width: "100%",
                  padding: "14px",
                  fontSize: "15px",
                  fontWeight: "bold",
                  color: "var(--color-white)",
                  background: isPurchasing
                    ? "var(--color-gray-200)"
                    : "var(--color-primary)",
                  border: "none",
                  borderRadius: "8px",
                  cursor: isPurchasing ? "not-allowed" : "pointer",
                  minHeight: "44px",
                }}
              >
                {isPurchasing ? "결제 진행 중..." : "990원으로 전체보기 + 후속 10회 받기"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 채팅 입력창 / 후속질문 결제 (미리보기 중에는 숨김) */}
      {!previewActive && (
      <div
        style={{
          position: "fixed",
          bottom: `${bottomBarHeight}px`,
          left: 0,
          right: 0,
          background: "var(--color-white)",
          // borderTop: '1px solid var(--color-gray-200)',
          padding: "12px 20px",
          zIndex: 100,
        }}
      >
        {followupPaywall ? (
          <div
            style={{
              background: "var(--color-primary-light)",
              borderRadius: "12px",
              padding: "14px 16px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                color: "var(--color-gray-600)",
                margin: "0 0 10px",
                lineHeight: 1.5,
              }}
            >
              더 궁금한 점이 있으신가요? 😊 지금은 이어서 여쭤볼 수 있는
              후속 질문 횟수가 없어요. 990원이면 후속 질문 10회와 유료 풀이
              1회를 받아, 마음껏 더 깊은 이야기를 나눌 수 있어요.
            </p>
            <button
              onClick={handleFollowupPurchase}
              disabled={isPurchasing}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "14px",
                fontWeight: "bold",
                color: "var(--color-white)",
                background: isPurchasing
                  ? "var(--color-gray-200)"
                  : "var(--color-primary)",
                border: "none",
                borderRadius: "8px",
                cursor: isPurchasing ? "not-allowed" : "pointer",
                minHeight: "44px",
              }}
            >
              {isPurchasing ? "결제 진행 중..." : "990원으로 후속 10회 받기"}
            </button>
          </div>
        ) : (
          <>
            {typeof followupRemaining === "number" && followupRemaining > 0 && (
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--color-gray-400)",
                  margin: "0 0 8px",
                  textAlign: "right",
                }}
              >
                남은 질문 {followupRemaining}회
              </p>
            )}
            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="더 알고 싶은 점이 있으신가요?"
              aria-label="추가 질문 입력"
              disabled={isSending}
              style={{
                flex: 1,
                padding: "12px 16px",
                fontSize: "15px",
                border: "1px solid var(--color-primary)",
                borderRadius: "8px",
                outline: "none",
                background: "var(--color-white)",
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isSending}
              style={{
                padding: "12px 20px",
                fontSize: "15px",
                fontWeight: "bold",
                color: "var(--color-white)",
                background:
                  !inputMessage.trim() || isSending
                    ? "var(--color-gray-200)"
                    : "var(--color-primary)",
                border: "none",
                borderRadius: "8px",
                cursor:
                  !inputMessage.trim() || isSending ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {isSending ? "전송 중..." : "전송"}
            </button>
            </div>
          </>
        )}
      </div>
      )}

      {/* 하단 버튼 */}
      <div
        ref={bottomBarRef}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: `16px 20px ${24 + insets.bottom}px`,
          background: "var(--color-white)",
          display: "flex",
          gap: "12px",
          zIndex: 1000,
          boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.08)",
        }}
      >
        <button
          onClick={onRestart}
          style={{
            width: "100%",
            padding: "14px",
            fontSize: "14px",
            fontWeight: "bold",
            color: "var(--color-white)",
            background: "var(--color-primary)",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          {restartLabel}
        </button>
      </div>
    </div>
  );
}
