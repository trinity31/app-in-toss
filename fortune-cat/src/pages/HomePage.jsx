import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { colors } from "@toss/tds-colors";
import { Loader } from "@toss/tds-mobile";
import { useToast } from "../hooks/useToast";
import {
  getTossShareLink,
  share,
  getOperationalEnvironment,
  env,
} from "@apps-in-toss/web-framework";
import {
  supabase,
  getMenuImageUrl,
  getAmuletStyleImageUrl,
  getOgImageUrl,
} from "../lib/supabase";
import { trackClick } from "../lib/analytics";
import { useSafeAreaInsets } from "../hooks/useSafeAreaInsets";
import HomeHeroCarousel from "../components/HomeHeroCarousel";
import { useTarotTrack } from "../hooks/useTarotTrack";

const Spacing = ({ size }) => <div style={{ height: `${size}px` }} />;

// 수요가 적어 우선 메뉴에서 숨김 (재노출 시 true로 변경)
const SHOW_IMAGE_SAJU = false;
const SHOW_AMULET = false;

// 궁합풀이 selectedType — 퀵메뉴·Hero 배너가 동일 값을 공유 (DRY)
const COMPATIBILITY_SELECTED_TYPE = {
  fortuneType: "ai_saju_compatibility",
  themeType: "ai_saju",
  readingType: "ai_saju",
  fortuneTypeTitle: "궁합풀이",
};

// 애정운 selectedType — Supabase new_year_fortune_types 검증값
const LOVE_SELECTED_TYPE = {
  fortuneType: "new_year_2026_love",
  themeType: "new_year_2026_love",
  readingType: "new_year_2026_love",
  fortuneTypeTitle: "2026년 애정운",
};

// 4분기 운세 selectedType — Supabase new_year_fortune_types 검증값 (scripts/add_q4_menu.py)
const Q4_SELECTED_TYPE = {
  fortuneType: "new_year_2026_q4",
  themeType: "new_year_2026_q4",
  readingType: "new_year_2026_q4",
  fortuneTypeTitle: "2026년 4분기 운세",
};

// 홈 상단 슬라이딩 배너 — 1번: 심화 타로상담, 2번: 4분기 운세(시즌), 3·4번: 연애상담 모드가 붙는 애정운·궁합
// to 가 있으면 해당 경로로, 없으면 selectedType 으로 신년운세 흐름에 진입한다.
const HERO_SLIDES = [
  {
    key: "tarot_deep",
    to: "/tarot?mode=deep",
    icon: "🔮",
    eyebrow: "심화 타로상담",
    title: "마음에 걸리는 고민 있나요?",
    description: "고민을 들려주면 복냥이가 카드를 뽑아 깊이 풀이해 드려요. 첫 상담은 무료예요",
    bg: "linear-gradient(135deg, #efe4fb 0%, #c9a8ef 100%)",
    cta: "심화 타로상담 · 무료로 시작",
  },
  {
    key: "new_year_2026_q4",
    icon: "🍂",
    eyebrow: "2026 4분기 운세",
    title: "남은 3개월 운세는?",
    description: "올해도 3개월 밖에 안 남았어요. 어떻게 하면 알차게 마무리 할 수 있을까요?",
    bg: "linear-gradient(135deg, #fdeedd 0%, #f2c48d 100%)",
    cta: "4분기 운세 · 바로 보기",
    selectedType: Q4_SELECTED_TYPE,
  },
  {
    key: "new_year_2026_love",
    icon: "❤️",
    eyebrow: "2026 애정운",
    title: "올해 내 연애운은?",
    description: "풀이를 보고 나면 복냥이와 연애상담까지 이어져요",
    bg: "linear-gradient(135deg, #fde4ec 0%, #f7b6cd 100%)",
    cta: "연애상담 모드 · 바로 보기",
    selectedType: LOVE_SELECTED_TYPE,
  },
  {
    key: "ai_saju_compatibility",
    icon: "💕",
    eyebrow: "궁합 풀이",
    title: "우리, 찰떡일까 상극일까?",
    description: "두 사람 궁합을 보고 실제 고민을 연애상담으로 물어보세요",
    bg: "linear-gradient(135deg, #ece3f8 0%, #c4ade8 100%)",
    cta: "연애상담 모드 · 바로 보기",
    selectedType: COMPATIBILITY_SELECTED_TYPE,
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const trackTarot = useTarotTrack();
  const { openToast } = useToast();
  const [aiSajuTypes, setAiSajuTypes] = useState([]);
  const [newYearTypes, setNewYearTypes] = useState([]);
  const [sajuTypes, setSajuTypes] = useState([]);
  const [amuletTypes, setAmuletTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  // AI 사주 분석·2026 신년운세는 기본적으로 펼친 상태로 노출
  const [expandedSections, setExpandedSections] = useState({
    ai_saju: true,
    new_year: true,
  });

  // CSS env(safe-area-inset-bottom)는 이 WebView에서 부정확(과대) → 프레임워크 인셋 사용
  const insets = useSafeAreaInsets();

  const toggleSection = (key) =>
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const scrollToSection = (sectionId) => {
    document.getElementById(`section-${sectionId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const goToNewYear = (selectedType) =>
    navigate("/newyear", { state: { selectedType } });

  const quickMenuItems = [
    {
      emoji: "🔮",
      label: "사주분석",
      onTap: () => {
        trackClick("quick_menu_click", { menu: "사주분석" }, "사주분석");
        scrollToSection("ai_saju");
      },
    },
    {
      emoji: "🧧",
      label: "신년운세",
      onTap: () => {
        trackClick("quick_menu_click", { menu: "신년운세" }, "신년운세");
        scrollToSection("new_year");
      },
    },
    {
      emoji: "💕",
      label: "궁합풀이",
      onTap: () => {
        trackClick("quick_menu_click", { menu: "궁합풀이" }, "궁합풀이");
        goToNewYear(COMPATIBILITY_SELECTED_TYPE);
      },
    },
    SHOW_AMULET && {
      emoji: "🧿",
      label: "부적아트",
      onTap: () => {
        trackClick("quick_menu_click", { menu: "부적아트" }, "부적아트");
        scrollToSection("amulet");
      },
    },
  ].filter(Boolean);

  const fetchAllTypes = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      const [aiSajuRes, newYearRes, sajuRes, amuletRes] = await Promise.all([
        supabase
          .from("ai_saju_types")
          .select("*")
          // .eq("is_active", true) // TODO: 테스트 후 복원
          .order("display_order", { ascending: true }),
        supabase
          .from("new_year_fortune_types")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true }),
        supabase
          .from("saju_reading_types")
          .select("*")
          .order("id", { ascending: true }),
        supabase
          .from("amulet_types")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true }),
      ]);

      if (aiSajuRes.data) setAiSajuTypes(aiSajuRes.data);
      if (newYearRes.data) setNewYearTypes(newYearRes.data);
      if (sajuRes.data) setSajuTypes(sajuRes.data);
      if (amuletRes.data) setAmuletTypes(amuletRes.data);
    } catch (err) {
      console.error("[HomePage] 데이터 로드 실패:", err);
      setHasError(true);
      openToast({ message: "메뉴를 불러오지 못했습니다" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTypes();
  }, []);

  const handleNewYearTypeClick = (type, section) => {
    trackClick(
      "menu_click",
      {
        section,
        menu_code: type.code,
        menu_title: type.title_ko,
      },
      type.title_ko,
    );
    goToNewYear({
      fortuneType: type.code,
      themeType: type.theme_type,
      readingType: type.reading_type,
      fortuneTypeTitle: type.title_ko,
    });
  };

  const handleSajuTypeClick = (type) => {
    trackClick(
      "menu_click",
      {
        section: "image_saju",
        menu_code: type.code,
        menu_title: type.title_ko,
      },
      type.title_ko,
    );
    navigate("/saju", {
      state: {
        selectedType: {
          fortuneType: type.code,
          themeType: type.theme_type,
          readingType: type.reading_type,
          fortuneTypeTitle: type.title_ko,
        },
      },
    });
  };

  const handleAmuletTypeClick = (type) => {
    trackClick(
      "menu_click",
      {
        section: "amulet",
        menu_code: type.code,
        menu_title: type.title_ko,
      },
      type.title_ko,
    );
    navigate("/amulet", {
      state: {
        selectedType: {
          amuletType: type.code,
          amuletTypeTitle: type.title_ko,
        },
      },
    });
  };

  const handleHeroSlideClick = (slide) => {
    trackClick("hero_banner_click", { menu: slide.key }, slide.eyebrow);
    if (slide.to) {
      // 타로 퍼널의 '심화 상담 진입'에 배너 유입도 포함되도록 같은 이벤트를 남긴다.
      trackTarot("tarot_deep_entry_click", { from: "home_banner" });
      navigate(slide.to);
      return;
    }
    goToNewYear(slide.selectedType);
  };

  const handleShare = async () => {
    trackClick("share_click", {}, "home_share");
    try {
      const isSandbox = getOperationalEnvironment() === "sandbox";
      const deepLink = isSandbox
        ? `intoss-private://appsintoss?_deploymentId=${env.getDeploymentId()}`
        : "intoss://fortune-cat";

      const tossLink = await getTossShareLink(deepLink, getOgImageUrl());
      await share({ message: tossLink });
    } catch (error) {
      console.error("[HomePage] 공유 실패:", error);
    }
  };

  const getDisplayItems = (items, sectionKey, limit = 3) =>
    expandedSections[sectionKey] ? items : items.slice(0, limit);

  // 무료 풀이(오늘의 운세·행운의 숫자/컬러) — 메뉴에 '무료' 배지 표시
  const isFreeReading = (rt) =>
    rt === "deep_reading_daily" || rt === "lucky_number" || rt === "lucky_color";

  return (
    <div style={{ ...styles.container, paddingBottom: `${96 + insets.bottom}px` }}>
      {/* 히어로: 심화 타로상담·4분기 운세·연애상담 바로가기 배너 */}
      <HomeHeroCarousel
        slides={HERO_SLIDES}
        onSlideClick={handleHeroSlideClick}
        onShare={handleShare}
      />

      {/* Quick Menu */}
      <div style={styles.quickMenuContainer}>
        {quickMenuItems.map((item) => (
          <button
            key={item.label}
            onClick={item.onTap}
            className="tap-circle"
            style={styles.quickMenuItem}
          >
            <div style={styles.quickMenuCircle}>
              <span style={{ fontSize: "24px" }}>{item.emoji}</span>
            </div>
            <span style={styles.quickMenuLabel}>{item.label}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 20px",
            gap: "16px",
          }}
        >
          <Loader />
          <p style={{ fontSize: "14px", color: "var(--color-gray-500)", margin: 0 }}>
            메뉴를 불러오는 중...
          </p>
        </div>
      ) : hasError ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 20px",
            gap: "16px",
          }}
        >
          <p style={{ fontSize: "15px", color: "var(--color-gray-500)", margin: 0 }}>
            메뉴를 불러오지 못했습니다
          </p>
          <button
            onClick={fetchAllTypes}
            style={{
              padding: "12px 24px",
              fontSize: "15px",
              fontWeight: "600",
              color: "var(--color-white)",
              background: "var(--color-primary)",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            다시 불러오기
          </button>
        </div>
      ) : (
        <div style={styles.sectionsContainer}>
          {/* 섹션: AI 사주 분석 */}
          <section id="section-ai_saju">
            <div style={styles.sectionHeaderRow}>
              <div style={styles.sectionHeaderLeft}>
                <span style={styles.sectionIcon}>🔮</span>
                <h2 style={styles.sectionTitle}>AI 사주 분석</h2>
                <span
                  style={{ ...styles.badge, backgroundColor: colors.blue500 }}
                >
                  NEW
                </span>
              </div>
              {aiSajuTypes.length > 3 && (
                <button
                  onClick={() => toggleSection("ai_saju")}
                  className="tap-pill"
                  style={styles.moreButton}
                >
                  {expandedSections["ai_saju"] ? "접기" : "더보기"}
                </button>
              )}
            </div>
            <p style={styles.sectionDescription}>
              사주팔자로 깊이 있는 분석을 받아보세요
            </p>
            <div style={styles.typeGrid}>
              {getDisplayItems(aiSajuTypes, "ai_saju").map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleNewYearTypeClick(type, "ai_saju")}
                  className="tap-card"
                  style={styles.typeCard}
                >
                  <div style={styles.typeIconWrapper}>
                    <span style={{ fontSize: "32px" }}>{type.icon}</span>
                  </div>
                  <div style={styles.typeCardContent}>
                    <div style={styles.typeCardTitle}>
                      {type.title_ko}
                      {isFreeReading(type.reading_type) && (
                        <span
                          style={{
                            ...styles.badge,
                            backgroundColor: colors.green500,
                            marginLeft: "6px",
                            verticalAlign: "middle",
                          }}
                        >
                          무료
                        </span>
                      )}
                    </div>
                    <div style={styles.typeCardDesc}>{type.description_ko}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <div style={styles.divider} />

          {/* 섹션: 신년운세 */}
          <section id="section-new_year">
            <div style={styles.sectionHeaderRow}>
              <div style={styles.sectionHeaderLeft}>
                <span style={styles.sectionIcon}>🧧</span>
                <h2 style={styles.sectionTitle}>2026 신년운세</h2>
                <span
                  style={{ ...styles.badge, backgroundColor: colors.red500 }}
                >
                  NEW
                </span>
              </div>
              {newYearTypes.length > 3 && (
                <button
                  onClick={() => toggleSection("new_year")}
                  className="tap-pill"
                  style={styles.moreButton}
                >
                  {expandedSections["new_year"] ? "접기" : "더보기"}
                </button>
              )}
            </div>
            <p style={styles.sectionDescription}>
              다가오는 한 해의 흐름을 미리 살펴보세요
            </p>
            <div style={styles.typeGrid}>
              {getDisplayItems(newYearTypes, "new_year").map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleNewYearTypeClick(type, "new_year")}
                  className="tap-card"
                  style={styles.typeCard}
                >
                  <div style={styles.typeIconWrapper}>
                    <span style={{ fontSize: "32px" }}>{type.icon}</span>
                  </div>
                  <div style={styles.typeCardContent}>
                    <div style={styles.typeCardTitle}>
                      {type.title_ko}
                      {isFreeReading(type.reading_type) && (
                        <span
                          style={{
                            ...styles.badge,
                            backgroundColor: colors.green500,
                            marginLeft: "6px",
                            verticalAlign: "middle",
                          }}
                        >
                          무료
                        </span>
                      )}
                    </div>
                    <div style={styles.typeCardDesc}>{type.description_ko}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {SHOW_IMAGE_SAJU && (
            <>
          <div style={styles.divider} />

          {/* 섹션: 이미지 사주 */}
          <section id="section-image_saju">
            <div style={styles.sectionHeaderRow}>
              <div style={styles.sectionHeaderLeft}>
                <h2 style={styles.sectionTitle}>이미지 사주</h2>
              </div>
              {sajuTypes.length > 3 && (
                <button
                  onClick={() => toggleSection("image_saju")}
                  className="tap-pill"
                  style={styles.moreButton}
                >
                  {expandedSections["image_saju"] ? "접기" : "더보기"}
                </button>
              )}
            </div>
            <p style={styles.sectionDescription}>
              이미지와 함께 운세를 읽어드려요
            </p>
            <div style={styles.typeGrid}>
              {getDisplayItems(sajuTypes, "image_saju").map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleSajuTypeClick(type)}
                  className="tap-card"
                  style={styles.typeCard}
                >
                  <img
                    src={getMenuImageUrl(type.image_url)}
                    alt={type.title_ko}
                    loading="lazy"
                    style={styles.typeImage}
                  />
                  <div style={styles.typeCardContent}>
                    <div style={styles.typeCardTitle}>
                      {type.title_ko}
                      {isFreeReading(type.reading_type) && (
                        <span
                          style={{
                            ...styles.badge,
                            backgroundColor: colors.green500,
                            marginLeft: "6px",
                            verticalAlign: "middle",
                          }}
                        >
                          무료
                        </span>
                      )}
                    </div>
                    <div style={styles.typeCardDesc}>{type.description_ko}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>
            </>
          )}

          {SHOW_AMULET && (
            <>
          <div style={styles.divider} />

          {/* 섹션: 부적 아트 이미지 */}
          <section id="section-amulet">
            <div style={styles.sectionHeaderRow}>
              <div style={styles.sectionHeaderLeft}>
                <span style={styles.sectionIcon}>🧿</span>
                <h2 style={styles.sectionTitle}>부적 아트 이미지</h2>
                <span
                  style={{ ...styles.badge, backgroundColor: colors.purple500 }}
                >
                  NEW
                </span>
              </div>
              {amuletTypes.length > 4 && (
                <button
                  onClick={() => toggleSection("amulet")}
                  className="tap-pill"
                  style={styles.moreButton}
                >
                  {expandedSections["amulet"] ? "접기" : "전체보기"}
                </button>
              )}
            </div>
            <p style={styles.sectionDescription}>
              나만을 위한 특별한 부적 이미지
            </p>
            <div style={styles.amuletGrid}>
              {getDisplayItems(amuletTypes, "amulet", 4).map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleAmuletTypeClick(type)}
                  className="tap-card"
                  style={styles.amuletCard}
                >
                  <div style={styles.amuletImageWrapper}>
                    <img
                      src={getAmuletStyleImageUrl(type.code)}
                      alt={type.title_ko}
                      loading="lazy"
                      style={styles.amuletImage}
                    />
                  </div>
                  <div style={styles.amuletCardTitle}>{type.title_ko}</div>
                  {type.description_ko && (
                    <div style={styles.amuletCardDesc}>
                      {type.description_ko}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
            </>
          )}

          <Spacing size={40} />
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    padding: "0 20px calc(96px + env(safe-area-inset-bottom))",
    backgroundColor: "var(--color-bg-soft)",
    boxSizing: "border-box",
  },
  quickMenuContainer: {
    display: "flex",
    justifyContent: "space-around",
    padding: "20px 0 8px",
  },
  quickMenuItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  quickMenuCircle: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    // 파스텔 body(#F7F0FE) 위에서 구분되도록 primary-light보다 한 톤 진하게
    backgroundColor: "#EBDCFA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  quickMenuLabel: {
    fontSize: "13px",
    fontWeight: "500",
    color: "var(--color-gray-700)",
  },
  sectionsContainer: {
    width: "100%",
    maxWidth: "400px",
    alignSelf: "center",
    marginTop: "24px",
  },
  sectionHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "4px",
  },
  sectionHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  sectionIcon: {
    fontSize: "24px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "var(--color-gray-700)",
    margin: 0,
  },
  badge: {
    fontSize: "10px",
    fontWeight: "700",
    color: "var(--color-white)",
    padding: "2px 6px",
    borderRadius: "4px",
  },
  moreButton: {
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--color-white)",
    backgroundColor: "var(--color-primary)",
    border: "none",
    borderRadius: "16px",
    cursor: "pointer",
    flexShrink: 0,
  },
  sectionDescription: {
    fontSize: "14px",
    color: "var(--color-gray-500)",
    margin: "0 0 16px 0",
  },
  typeGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  typeCard: {
    width: "100%",
    padding: "16px",
    background: "var(--color-gray-50)",
    border: "1px solid var(--color-gray-200)",
    borderRadius: "16px",
    cursor: "pointer",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
  },
  typeIconWrapper: {
    width: "56px",
    height: "56px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--color-white)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    flexShrink: 0,
  },
  typeImage: {
    width: "56px",
    height: "56px",
    borderRadius: "12px",
    objectFit: "cover",
    flexShrink: 0,
  },
  typeCardContent: {
    flex: 1,
    minWidth: 0,
  },
  typeCardTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "var(--color-gray-700)",
    marginBottom: "2px",
  },
  typeCardDesc: {
    fontSize: "13px",
    color: "var(--color-gray-500)",
    lineHeight: "1.4",
  },
  divider: {
    height: "1px",
    backgroundColor: "var(--color-gray-200)",
    margin: "28px 0",
  },
  amuletGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  amuletCard: {
    display: "flex",
    flexDirection: "column",
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    padding: 0,
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
  },
  amuletImageWrapper: {
    width: "100%",
    position: "relative",
    paddingTop: "133%",
    borderRadius: "16px",
    overflow: "hidden",
    backgroundColor: "var(--color-gray-50)",
  },
  amuletImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  amuletCardTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--color-gray-700)",
    marginTop: "8px",
  },
  amuletCardDesc: {
    fontSize: "12px",
    color: "var(--color-gray-500)",
    lineHeight: "1.4",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
};
