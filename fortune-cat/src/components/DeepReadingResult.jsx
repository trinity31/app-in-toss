import { useState, useCallback } from "react";

import ReactMarkdown from "react-markdown";
import * as Sentry from "@sentry/react";
import { Analytics } from "@apps-in-toss/web-framework";
import { logEvent } from "../lib/firebase";

const AD_GROUP_ID =
  import.meta.env.VITE_AD_GROUP_ID || "ait-ad-test-rewarded-id";

// 광고 로드 → 표시 → 완료까지 Promise로 래핑
const showRewardedAd = () => {
  return new Promise(async (resolve) => {
    try {
      const { GoogleAdMob } = await import("@apps-in-toss/web-framework");

      if (GoogleAdMob.loadAppsInTossAdMob.isSupported?.() === false) {
        resolve();
        return;
      }

      GoogleAdMob.loadAppsInTossAdMob({
        options: { adGroupId: AD_GROUP_ID },
        onEvent: (event) => {
          if (event.type === "loaded") {
            GoogleAdMob.showAppsInTossAdMob({
              options: { adGroupId: AD_GROUP_ID },
              onEvent: (event) => {
                if (
                  ["userEarnedReward", "dismissed", "failedToShow"].includes(
                    event.type,
                  )
                ) {
                  resolve();
                }
              },
              onError: () => resolve(),
            });
          }
        },
        onError: () => resolve(),
      });
    } catch {
      resolve();
    }
  });
};

// CommonMark에서 **text** 뒤에 바로 한글이 오면 bold 파싱 실패
// **'문서'**가 → **'문서'** 가 (공백 추가)
const normalizeMarkdown = (text) => {
  if (!text) return "";
  return (
    text
      // ** text** → **text** (여는 ** 뒤 공백 제거)
      .replace(/\*\*\s+(.+?)\*\*/g, "**$1**")
      // **text**가 → **text** 가 (닫는 ** 뒤 비공백 앞에 공백 추가)
      .replace(/\*\*(.+?)\*\*(?=\S)/g, "**$1** ")
  );
};

export default function DeepReadingResult({ userData, onRestart }) {
  const { name, fortuneResult, fortuneTypeTitle } = userData;
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: fortuneResult.reading,
      followUpQuestions: fortuneResult.follow_up_questions,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState(null);

  // callback ref: 로딩 표시가 DOM에 마운트되면 스크롤
  // setTimeout으로 사용자 메시지 버블의 레이아웃 완료를 기다린 후 스크롤
  const loadingIndicatorRef = useCallback((node) => {
    if (node) {
      setTimeout(() => {
        node.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
  }, []);

  const sendMessage = async (messageText, { skipAd = false, inputType = "free_text" } = {}) => {
    if (!messageText.trim() || isSending) return;

    const userMessage = messageText.trim();
    setInputMessage("");

    const questionIndex = messages.filter((m) => m.role === "user").length + 1;
    logEvent("follow_up_question", {
      fortune_type: userData.selectedType?.fortuneType || "",
      fortune_title: fortuneTypeTitle || "",
      question_index: questionIndex,
      input_type: inputType,
    });
    Analytics.click({ button_name: "deep_reading_chat" });

    setLastFailedMessage(null);
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsSending(true);

    try {
      const apiKey = import.meta.env.VITE_SAJU_AI_API_KEY;
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const isCompatibility = !!userData.partnerName;
      const endpoint = isCompatibility
        ? `${baseUrl}/deep-reading-match/chat`
        : `${baseUrl}/deep-reading/chat`;

      const apiCall = fetch(endpoint, {
        method: "POST",
        headers: {
          "X-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          thread_id: fortuneResult.thread_id,
          message: userMessage,
        }),
      });

      // 재시도 시 광고 스킵
      const [response] = await Promise.all([
        apiCall,
        skipAd ? Promise.resolve() : showRewardedAd(),
      ]);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`채팅 API 호출 실패: ${response.status} ${errorText}`);
      }

      const result = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.reading,
          followUpQuestions: result.follow_up_questions,
        },
      ]);
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
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = () => sendMessage(inputMessage);

  const handleFollowUpClick = (question) => sendMessage(question, { inputType: "follow_up_button" });

  const markdownComponents = {
    h2: ({ node, ...props }) => (
      <h2
        style={{
          fontSize: "17px",
          fontWeight: "bold",
          color: "var(--color-primary)",
          marginTop: "20px",
          marginBottom: "10px",
          lineHeight: "1.4",
        }}
        {...props}
      />
    ),
    h3: ({ node, ...props }) => (
      <h3
        style={{
          fontSize: "16px",
          fontWeight: "600",
          color: "#191F28",
          marginTop: "16px",
          marginBottom: "8px",
          lineHeight: "1.4",
        }}
        {...props}
      />
    ),
    p: ({ node, ...props }) => (
      <p
        style={{
          marginBottom: "12px",
          lineHeight: "1.8",
        }}
        {...props}
      />
    ),
    ul: ({ node, ...props }) => (
      <ul
        style={{
          paddingLeft: "20px",
          marginBottom: "12px",
        }}
        {...props}
      />
    ),
    ol: ({ node, ...props }) => (
      <ol
        style={{
          paddingLeft: "20px",
          marginBottom: "12px",
        }}
        {...props}
      />
    ),
    li: ({ node, ...props }) => (
      <li
        style={{
          marginBottom: "6px",
          lineHeight: "1.7",
        }}
        {...props}
      />
    ),
    strong: ({ node, ...props }) => (
      <strong
        style={{
          fontWeight: "700",
          color: "#191F28",
        }}
        {...props}
      />
    ),
    em: ({ node, ...props }) => (
      <em
        style={{
          fontStyle: "italic",
          color: "var(--color-primary)",
        }}
        {...props}
      />
    ),
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "#fff",
          borderBottom: "1px solid #E5E8EB",
          padding: "20px 24px",
          zIndex: 100,
        }}
      >
        <h1
          style={{
            fontSize: "22px",
            fontWeight: "bold",
            color: "#191F28",
            marginBottom: "0",
          }}
        >
          {name}님의 {fortuneTypeTitle || "2026 신년 운세"}
        </h1>
      </div>

      {/* 메시지 목록 */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          paddingBottom: "180px",
          overflowY: "auto",
        }}
      >
        {/* 요약 섹션 */}
        {fortuneResult.headline && (
          <div style={{ marginBottom: "20px" }}>
            <p
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#191F28",
                textAlign: "center",
                lineHeight: "1.6",
                margin: "0 0 16px 0",
              }}
            >
              {fortuneResult.headline}
            </p>
            {fortuneResult.summary?.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${fortuneResult.summary.length}, 1fr)`,
                  gap: "8px",
                }}
              >
                {fortuneResult.summary.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      background: "var(--color-primary-light)",
                      borderRadius: "12px",
                      padding: "14px 8px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "24px", marginBottom: "6px" }}>
                      {item.icon}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "bold",
                        color: "#191F28",
                        marginBottom: "4px",
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: "bold",
                        color: "var(--color-primary)",
                        marginBottom: "4px",
                      }}
                    >
                      {item.grade}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#8B95A1",
                        lineHeight: "1.4",
                      }}
                    >
                      {item.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((message, index) => {
          const isLastAssistant =
            message.role === "assistant" && index === messages.length - 1;
          return (
            <div key={index} style={{ marginBottom: "16px" }}>
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
                    color: message.role === "user" ? "#fff" : "#4E5968",
                  }}
                >
                  {message.role === "assistant" ? (
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
                  ) : (
                    <div>
                      <p
                        style={{
                          fontSize: "15px",
                          lineHeight: "1.6",
                          margin: 0,
                          whiteSpace: "pre-wrap",
                          color: message.role === "error" ? "#F04452" : undefined,
                        }}
                      >
                        {message.content}
                      </p>
                      {message.role === "error" && lastFailedMessage && (
                        <button
                          onClick={() => {
                            // 에러 메시지 제거 후 광고 없이 재시도
                            setMessages((prev) => prev.filter((m) => m !== message));
                            sendMessage(lastFailedMessage, { skipAd: true });
                          }}
                          style={{
                            marginTop: "8px",
                            padding: "6px 14px",
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "#F04452",
                            background: "transparent",
                            border: "1px solid #F04452",
                            borderRadius: "16px",
                            cursor: "pointer",
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
                          padding: "8px 14px",
                          fontSize: "13px",
                          color: "var(--color-primary)",
                          background: "#fff",
                          border: "1px solid var(--color-primary)",
                          borderRadius: "20px",
                          cursor: "pointer",
                          lineHeight: "1.4",
                          textAlign: "left",
                        }}
                      >
                        {question}
                      </button>
                    ))}
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#8B95A1",
                        margin: "4px 0 0 0",
                      }}
                    >
                      추가 질문 시 광고가 표시됩니다
                    </p>
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
                color: "#8B95A1",
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
      </div>

      {/* 채팅 입력창 */}
      <div
        style={{
          position: "fixed",
          bottom: "88px",
          left: 0,
          right: 0,
          background: "#fff",
          // borderTop: '1px solid #E5E8EB',
          padding: "12px 20px",
          zIndex: 100,
        }}
      >
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
            disabled={isSending}
            style={{
              flex: 1,
              padding: "12px 16px",
              fontSize: "15px",
              border: "1px solid var(--color-primary)",
              borderRadius: "8px",
              outline: "none",
              background: "#fff",
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isSending}
            style={{
              padding: "12px 20px",
              fontSize: "15px",
              fontWeight: "bold",
              color: "#fff",
              background:
                !inputMessage.trim() || isSending
                  ? "#E5E8EB"
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
      </div>

      {/* 하단 버튼 */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px 20px calc(24px + env(safe-area-inset-bottom))",
          background: "#fff",
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
    </div>
  );
}
