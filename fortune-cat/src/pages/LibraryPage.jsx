import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const { anonymousKey, loading: keyLoading } = useAnonymousKey();
  const insets = useSafeAreaInsets();
  const { storedUserInfo } = useUserInfoStorage();

  const [items, setItems] = useState([]);
  const [typeMap, setTypeMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // 상세(대화) 데이터

  // reading_type → 제목 매핑 로드
  useEffect(() => {
    async function loadTypes() {
      try {
        const [ai, ny] = await Promise.all([
          supabase.from("ai_saju_types").select("reading_type, title_ko"),
          supabase.from("new_year_fortune_types").select("reading_type, title_ko"),
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
    if (rt.startsWith("match")) return "궁합 풀이";
    return typeMap[rt] || "사주 풀이";
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
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-700)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  );

  // ===== 상세(대화) 화면 — DeepReadingResult 재사용 (이어서 채팅 가능) =====
  if (selected) {
    if (selected._loading || selected._error) {
      return (
        <div style={{ minHeight: "100vh", background: "var(--color-white)", display: "flex", flexDirection: "column" }}>
          <div style={headerStyle}>
            {backBtn(() => setSelected(null))}
            <h1 style={{ fontSize: "18px", fontWeight: "bold", color: "var(--color-gray-700)", margin: 0 }}>
              {titleFor(selected.reading_type)}
            </h1>
          </div>
          <p style={{ textAlign: "center", color: "var(--color-gray-400)", marginTop: "60px" }}>
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
    <div style={{ minHeight: "100vh", background: "var(--color-bg-soft)", display: "flex", flexDirection: "column" }}>
      <div style={headerStyle}>
        {backBtn(() => navigate("/"))}
        <h1 style={{ fontSize: "18px", fontWeight: "bold", color: "var(--color-gray-700)", margin: 0 }}>보관함</h1>
      </div>

      <div style={{ flex: 1, padding: "16px", paddingBottom: `${96 + insets.bottom}px` }}>
        {loading ? (
          <p style={{ textAlign: "center", color: "var(--color-gray-400)", marginTop: "60px" }}>불러오는 중...</p>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "80px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📖</div>
            <p style={{ fontSize: "15px", color: "var(--color-gray-500)", margin: "0 0 4px" }}>아직 결제한 풀이가 없어요</p>
            <p style={{ fontSize: "13px", color: "var(--color-gray-400)", margin: 0 }}>풀이를 결제하면 여기에서 다시 볼 수 있어요</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {items.map((item) => (
              <button
                key={item.thread_id}
                onClick={() => openDetail(item)}
                className="tap-card"
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "var(--color-white)",
                  border: "1px solid var(--color-gray-200)",
                  borderRadius: "16px",
                  padding: "16px",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: "16px", fontWeight: "600", color: "var(--color-gray-700)", marginBottom: "4px" }}>
                  {titleFor(item.reading_type)}
                </div>
                {item.headline && (
                  <div style={{ fontSize: "13px", color: "var(--color-gray-500)", marginBottom: "6px", lineHeight: 1.4 }}>
                    {item.headline}
                  </div>
                )}
                <div style={{ fontSize: "12px", color: "var(--color-gray-400)" }}>{fmtDate(item.created_at)}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
