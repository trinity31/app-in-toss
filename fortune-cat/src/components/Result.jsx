import { useState } from "react";
import { saveBase64Data, Analytics } from "@apps-in-toss/web-framework";
import ReactMarkdown from "react-markdown";

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

export default function Result({ userData, onRestart }) {
  const { name, birthdate, fortuneResult, readingType, fortuneTypeTitle } =
    userData;
  const [isSavingImage, setIsSavingImage] = useState(false);

  // 신년운세 타입들인지 확인
  const isNewYearType = readingType?.startsWith("new_year_");

  // 일반 타입의 제목 처리
  const getDisplayTitle = () => {
    if (isNewYearType) {
      return `${name}님의 ${fortuneTypeTitle || "2026 신년 운세"}`;
    }

    const title = fortuneTypeTitle || "사주풀이";

    // "나만의"가 포함되면 "Trinity님의"로 치환
    if (title.includes("나만의")) {
      return title.replace("나만의", `${name}님의`);
    }

    // "내"가 포함되면 "Trinity님의"로 치환
    if (title.includes("내")) {
      return title.replace("내", `${name}님의`);
    }

    // 그 외에는 앞에 "Trinity님의" 붙임
    return `${name}님의 ${title}`;
  };
  // 이미지 저장/공유
  const handleSaveImage = async () => {
    try {
      setIsSavingImage(true);

      if (!fortuneResult?.image_base64) {
        alert("저장할 이미지가 없습니다.");
        return;
      }

      const base64Data = fortuneResult.image_base64;
      const mimeType = "image/png";
      const fileName = `saju-${Date.now()}.png`;
      // 저장/공유
      await saveBase64Data({
        data: base64Data,
        fileName: fileName,
        mimeType: mimeType,
      });
    } catch (err) {
      // 사용자 취소는 조용히 처리
      if (err.message && !err.message.toLowerCase().includes("cancel")) {
        alert(`이미지 저장 중 오류가 발생했습니다: ${err.message}`);
      }
    } finally {
      setIsSavingImage(false);
    }
  };

  // image_description 처리
  let descriptionItems = [];
  let isJsonArray = false;
  if (fortuneResult?.image_description) {
    let description = fortuneResult.image_description;

    // 마크다운 코드 블록 형식 제거 (```json ... ``` 또는 '''json ... ''')
    description = description
      .replace(/^```json\s*/i, "")
      .replace(/\s*```$/, "");
    description = description
      .replace(/^'''json\s*/i, "")
      .replace(/\s*'''$/, "");
    description = description.trim();

    try {
      // JSON 형식인 경우 파싱 시도
      const parsed = JSON.parse(description);
      descriptionItems = parsed.items || [];
      isJsonArray = true;
    } catch (e) {
      // JSON이 아닌 단순 문자열인 경우 그대로 사용
      // OOO님을 실제 이름으로 치환
      if (name) {
        description = description.replace(/OOO님/g, `${name}님`);
      }
      descriptionItems = [description];
      isJsonArray = false;
    }
  }

  return (
    <div
      style={{ minHeight: "100vh", background: "#fff", paddingBottom: "100px" }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "16px",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#191F28",
            marginBottom: "8px",
          }}
        >
          {getDisplayTitle()}
        </h1>
        {/* <p style={{
          fontSize: '14px',
          color: '#8B95A1',
          marginBottom: '24px'
        }}>
          {birthdate.year}년 {birthdate.month}월 {birthdate.day}일
        </p> */}

        {fortuneResult?.image_base64 && (
          <div style={{ marginBottom: "24px" }}>
            <img
              src={`data:image/png;base64,${fortuneResult.image_base64}`}
              alt="사주 이미지"
              style={{
                width: "100%",
                borderRadius: "12px",
                objectFit: "cover",
              }}
            />

            {/* 공유하기 버튼 (신년운세 타입은 숨김) */}
            {!isNewYearType && (
              <button
                onClick={handleSaveImage}
                disabled={isSavingImage}
                style={{
                  width: "100%",
                  marginTop: "12px",
                  padding: "16px",
                  backgroundColor: isSavingImage
                    ? "#E5E8EB"
                    : "var(--color-primary)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: isSavingImage ? "not-allowed" : "pointer",
                  opacity: isSavingImage ? 0.6 : 1,
                }}
              >
                {isSavingImage ? "저장 중..." : "공유하기"}
              </button>
            )}

            {descriptionItems.length > 0 && (
              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                {descriptionItems.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "inline-block",
                      padding: isJsonArray ? "8px 14px" : "14px 18px",
                      fontSize: "14px",
                      fontWeight: "600",
                      lineHeight: "1.5",
                      color: "#4E5968",
                      background: "#F2F4F6",
                      borderRadius: "12px",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                      maxWidth: "100%",
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {fortuneResult?.reading && (
          <div
            style={{
              background: "var(--color-primary-light)",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            {isNewYearType ? (
              <div
                style={{
                  fontSize: "16px",
                  lineHeight: "1.8",
                  color: "#4E5968",
                  fontFamily: "'Do Hyeon', sans-serif",
                  fontWeight: 400,
                }}
              >
                <ReactMarkdown
                  components={{
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
                  }}
                >
                  {normalizeMarkdown(fortuneResult.reading)}
                </ReactMarkdown>
              </div>
            ) : (
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: "1.8",
                  color: "#4E5968",
                  whiteSpace: "pre-wrap",
                  fontFamily: "'Do Hyeon', sans-serif",
                  fontWeight: 400,
                }}
              >
                {fortuneResult.reading}
              </p>
            )}
          </div>
        )}
      </div>

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
            padding: "16px",
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
    </div>
  );
}
