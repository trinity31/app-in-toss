import { useEffect, useState } from "react";
import { useToast } from "../hooks/useToast";
import { useAnonymousKey } from "../hooks/useAnonymousKey.jsx";
import { useSafeAreaInsets } from "../hooks/useSafeAreaInsets";
import { useUserInfoStorage } from "../hooks/useUserInfoStorage";
import { supabase } from "../lib/supabase";
import DeepReadingResult from "../components/DeepReadingResult";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_SAJU_AI_API_KEY;

const fmtDate = (s) => {
  try {
    return new Date(s).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

export default function LibraryPage() {
  const { anonymousKey, loading: keyLoading } = useAnonymousKey();
  const insets = useSafeAreaInsets();
  const { storedUserInfo } = useUserInfoStorage();

  const { openToast } = useToast();

  const [items, setItems] = useState([]);
  const [typeMap, setTypeMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // 상세(대화) 데이터
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // reading_type → 제목 매핑 로드
  useEffect(() => {
    async function loadTypes() {
      try {
        const [ai, ny] = await Promise.all([
          supabase.from("ai_saju_types").select("reading_type, title_ko"),
          supabase
            .from("new_year_fortune_types")
            .select("reading_type, title_ko"),
        ]);
        const m = {};
        [...(ai.data || []), ...(ny.data || [])].forEach((t) => {
          if (t.reading_type) m[t.reading_type] = t.title_ko;
        });
        setTypeMap(m);
      } catch {
        /* ignore */
      }
    }
    loadTypes();
  }, []);

  // 보관함 목록 로드
  useEffect(() => {
    if (keyLoading) return;
    if (!anonymousKey) {
      setLoading(false);
      return;
    }
    fetch(
      `${API_BASE_URL}/deep-reading/history?user_anonymous_id=${encodeURIComponent(anonymousKey)}`,
      { headers: { "X-API-Key": API_KEY } },
    )
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [anonymousKey, keyLoading]);

  const titleFor = (rt) => {
    if (!rt) return "사주 풀이";
    if (rt.startsWith("deep_reading_daily")) return "오늘의 운세";
    if (rt.startsWith("match")) return "궁합 풀이";
    return typeMap[rt] || "사주 풀이";
  };

  // 무료 풀이(오늘의 운세·행운의 숫자/컬러)는 삭제해도 재진입 시 무료 재생성.
  // 그 외(유료 심화풀이·궁합)는 삭제하면 다시 보기 위해 재결제 필요.
  const isFreeReading = (rt) =>
    !rt ||
    rt.startsWith("deep_reading_daily") ||
    rt === "lucky_number" ||
    rt === "lucky_color";

  const handleDelete = async (item) => {
    setDeletingId(item.thread_id);
    try {
      const r = await fetch(
        `${API_BASE_URL}/deep-reading/history/${encodeURIComponent(item.thread_id)}?user_anonymous_id=${encodeURIComponent(anonymousKey)}`,
        { method: "DELETE", headers: { "X-API-Key": API_KEY } },
      );
      if (!r.ok) throw new Error(String(r.status));
      setItems((prev) => prev.filter((i) => i.thread_id !== item.thread_id));
    } catch {
      openToast({ message: "삭제에 실패했어요. 잠시 후 다시 시도해 주세요" });
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const openDetail = async (item) => {
    setSelected({ ...item, _loading: true });
    try {
      const r = await fetch(
        `${API_BASE_URL}/deep-reading/conversation?thread_id=${encodeURIComponent(item.thread_id)}&user_anonymous_id=${encodeURIComponent(anonymousKey)}`,
        { headers: { "X-API-Key": API_KEY } },
      );
      if (!r.ok) throw new Error(String(r.status));
      const data = await r.json();
      setSelected({ ...item, ...data, _loading: false });
    } catch {
      setSelected({ ...item, _loading: false, _error: true });
    }
  };

  const headerStyle = {
    position: "sticky",
    top: 0,
    background: "var(--color-white)",
    borderBottom: "1px solid var(--color-gray-200)",
    padding: "16px 16px 12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    zIndex: 100,
  };

  const backBtn = (onClick) => (
    <button
      onClick={onClick}
      aria-label="뒤로"
      style={{
        background: "none",
        border: "none",
        padding: "4px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--color-gray-700)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  );

  // ===== 상세(대화) 화면 — DeepReadingResult 재사용 (이어서 채팅 가능) =====
  if (selected) {
    if (selected._loading || selected._error) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: "var(--color-white)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={headerStyle}>
            {backBtn(() => setSelected(null))}
            <h1
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "var(--color-gray-700)",
                margin: 0,
              }}
            >
              {titleFor(selected.reading_type)}
            </h1>
          </div>
          <p
            style={{
              textAlign: "center",
              color: "var(--color-gray-400)",
              marginTop: "60px",
            }}
          >
            {selected._error ? "풀이를 불러오지 못했어요." : "불러오는 중..."}
          </p>
        </div>
      );
    }
    const userData = {
      name: storedUserInfo?.name || "",
      fortuneTypeTitle: titleFor(selected.reading_type),
      readingType: selected.reading_type,
      isCompatibility: (selected.reading_type || "").startsWith("match"),
      fortuneResult: {
        reading: selected.reading,
        headline: selected.headline,
        summary: selected.summary || [],
        follow_up_questions: selected.follow_up_questions || [],
        thread_id: selected.thread_id,
        is_preview: false,
        cross_reading_ctas: [],
        messages: selected.messages || [],
      },
    };
    return (
      <DeepReadingResult
        userData={userData}
        onRestart={() => setSelected(null)}
        restartLabel="보관함으로 돌아가기"
      />
    );
  }

  // ===== 목록 화면 =====
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg-soft)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          flex: 1,
          padding: `16px 16px ${96 + insets.bottom}px`,
        }}
      >
        {loading ? (
          <p
            style={{
              textAlign: "center",
              color: "var(--color-gray-400)",
              marginTop: "60px",
            }}
          >
            불러오는 중...
          </p>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "80px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📖</div>
            <p
              style={{
                fontSize: "15px",
                color: "var(--color-gray-500)",
                margin: "0 0 4px",
              }}
            >
              아직 본 풀이가 없어요
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "var(--color-gray-400)",
                margin: 0,
              }}
            >
              풀이를 보면 여기에서 다시 볼 수 있어요
            </p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {items.map((item) => {
              const confirming = confirmDeleteId === item.thread_id;
              return (
                <div
                  key={item.thread_id}
                  style={{
                    background: "var(--color-white)",
                    border: "1px solid var(--color-gray-200)",
                    borderRadius: "16px",
                    padding: "16px",
                  }}
                >
                  <div
                    onClick={() => openDetail(item)}
                    className="tap-card"
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "var(--color-gray-700)",
                          marginBottom: "4px",
                        }}
                      >
                        {titleFor(item.reading_type)}
                      </div>
                      {item.headline && (
                        <div
                          style={{
                            fontSize: "13px",
                            color: "var(--color-gray-500)",
                            marginBottom: "6px",
                            lineHeight: 1.4,
                          }}
                        >
                          {item.headline}
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--color-gray-400)",
                        }}
                      >
                        {fmtDate(item.created_at)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(item.thread_id);
                      }}
                      aria-label="삭제"
                      style={{
                        background: "none",
                        border: "none",
                        padding: "4px",
                        cursor: "pointer",
                        color: "var(--color-gray-400)",
                        flexShrink: 0,
                      }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </div>

                  {confirming && (
                    <div
                      style={{
                        marginTop: "12px",
                        paddingTop: "12px",
                        borderTop: "1px solid var(--color-gray-200)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          flex: 1,
                          fontSize: "13px",
                          color: isFreeReading(item.reading_type)
                            ? "var(--color-gray-600)"
                            : "var(--color-error)",
                        }}
                      >
                        {isFreeReading(item.reading_type)
                          ? "삭제하면 대화도 함께 사라져요."
                          : "이 풀이는 삭제 후 다시 보려면 재결제가 필요합니다."}
                      </span>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        style={{
                          padding: "8px 14px",
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "var(--color-gray-600)",
                          background: "var(--color-gray-100)",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                        }}
                      >
                        취소
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        disabled={deletingId === item.thread_id}
                        style={{
                          padding: "8px 14px",
                          fontSize: "13px",
                          fontWeight: "bold",
                          color: "var(--color-white)",
                          background: "var(--color-error)",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                        }}
                      >
                        {deletingId === item.thread_id ? "삭제 중" : "삭제"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
