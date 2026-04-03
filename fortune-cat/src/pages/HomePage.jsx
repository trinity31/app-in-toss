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
import heroBackground from "../assets/images/hero.png";
import { logEvent } from "../lib/firebase";

const Spacing = ({ size }) => <div style={{ height: `${size}px` }} />;

export default function HomePage() {
  const navigate = useNavigate();
  const { openToast } = useToast();
  const [aiSajuTypes, setAiSajuTypes] = useState([]);
  const [newYearTypes, setNewYearTypes] = useState([]);
  const [sajuTypes, setSajuTypes] = useState([]);
  const [amuletTypes, setAmuletTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (key) =>
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const scrollToSection = (sectionId) => {
    document.getElementById(`section-${sectionId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const quickMenuItems = [
    {
      emoji: "🔮",
      label: "사주분석",
      onTap: () => {
        logEvent("quick_menu_click", { menu: "사주분석" });
        scrollToSection("ai_saju");
      },
    },
    {
      emoji: "🧧",
      label: "신년운세",
      onTap: () => {
        logEvent("quick_menu_click", { menu: "신년운세" });
        scrollToSection("new_year");
      },
    },
    {
      emoji: "💕",
      label: "궁합풀이",
      onTap: () => {
        logEvent("quick_menu_click", { menu: "궁합풀이" });
        navigate("/newyear", {
          state: {
            selectedType: {
              fortuneType: "ai_saju_compatibility",
              themeType: "ai_saju",
              readingType: "ai_saju",
              fortuneTypeTitle: "궁합풀이",
            },
          },
        });
      },
    },
    {
      emoji: "🧿",
      label: "부적아트",
      onTap: () => {
        logEvent("quick_menu_click", { menu: "부적아트" });
        scrollToSection("amulet");
      },
    },
  ];

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
    logEvent("menu_click", {
      section,
      menu_code: type.code,
      menu_title: type.title_ko,
    });
    navigate("/newyear", {
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

  const handleSajuTypeClick = (type) => {
    logEvent("menu_click", {
      section: "image_saju",
      menu_code: type.code,
      menu_title: type.title_ko,
    });
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
    logEvent("menu_click", {
      section: "amulet",
      menu_code: type.code,
      menu_title: type.title_ko,
    });
    navigate("/amulet", {
      state: {
        selectedType: {
          amuletType: type.code,
          amuletTypeTitle: type.title_ko,
        },
      },
    });
  };

  const handleShare = async () => {
    logEvent("share_click");
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

  return (
    <div style={styles.container}>
      {/* 히어로 영역 */}
      <div
        style={{
          position: "relative",
          width: "calc(100% + 40px)",
          margin: "0 -20px",
          backgroundImage: `url(${heroBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "48px 20px 32px",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.2))",
          }}
        />
        <h1
          style={{
            position: "relative",
            fontSize: "36px",
            fontWeight: "800",
            color: "#fff",
            margin: "0 0 0px 0",
            textShadow: "0 1px 4px rgba(0,0,0,0.3)",
          }}
        >
          복냥사주
        </h1>
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p
            style={{
              fontSize: "24px",
              color: "#fff",
              margin: 0,
              textShadow:
                "-1px -1px 0 rgba(0,0,0,0.5), 1px -1px 0 rgba(0,0,0,0.5), -1px 1px 0 rgba(0,0,0,0.5), 1px 1px 0 rgba(0,0,0,0.5)",
            }}
          >
            AI가 알려주는 당신의 운명
          </p>
          <button
            onClick={handleShare}
            style={{
              background: "rgba(255,255,255,0.8)",
              border: "none",
              borderRadius: "50%",
              width: "44px",
              height: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#191F28"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
        </div>
      </div>

      {/* Quick Menu */}
      <div style={styles.quickMenuContainer}>
        {quickMenuItems.map((item) => (
          <button
            key={item.label}
            onClick={item.onTap}
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
          <p style={{ fontSize: "14px", color: "#6B7684", margin: 0 }}>
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
          <p style={{ fontSize: "15px", color: "#6B7684", margin: 0 }}>
            메뉴를 불러오지 못했습니다
          </p>
          <button
            onClick={fetchAllTypes}
            style={{
              padding: "12px 24px",
              fontSize: "15px",
              fontWeight: "600",
              color: "#fff",
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
                  style={styles.typeCard}
                >
                  <div style={styles.typeIconWrapper}>
                    <span style={{ fontSize: "32px" }}>{type.icon}</span>
                  </div>
                  <div style={styles.typeCardContent}>
                    <div style={styles.typeCardTitle}>{type.title_ko}</div>
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
                  style={styles.moreButton}
                >
                  {expandedSections["new_year"] ? "접기" : "더보기"}
                </button>
              )}
            </div>
            <p style={styles.sectionDescription}>
              운세 보고 질문도 무제한으로 하기
            </p>
            <div style={styles.typeGrid}>
              {getDisplayItems(newYearTypes, "new_year").map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleNewYearTypeClick(type, "new_year")}
                  style={styles.typeCard}
                >
                  <div style={styles.typeIconWrapper}>
                    <span style={{ fontSize: "32px" }}>{type.icon}</span>
                  </div>
                  <div style={styles.typeCardContent}>
                    <div style={styles.typeCardTitle}>{type.title_ko}</div>
                    <div style={styles.typeCardDesc}>{type.description_ko}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>

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
                  style={styles.typeCard}
                >
                  <img
                    src={getMenuImageUrl(type.image_url)}
                    alt={type.title_ko}
                    style={styles.typeImage}
                  />
                  <div style={styles.typeCardContent}>
                    <div style={styles.typeCardTitle}>{type.title_ko}</div>
                    <div style={styles.typeCardDesc}>{type.description_ko}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>

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
                  style={styles.amuletCard}
                >
                  <div style={styles.amuletImageWrapper}>
                    <img
                      src={getAmuletStyleImageUrl(type.code)}
                      alt={type.title_ko}
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
    padding: "0 20px 20px",
    backgroundColor: "#fff",
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
    backgroundColor: "var(--color-primary-light)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  quickMenuLabel: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#191F28",
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
    color: "#191F28",
    margin: 0,
  },
  badge: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#fff",
    padding: "2px 6px",
    borderRadius: "4px",
  },
  moreButton: {
    padding: "6px 14px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#fff",
    backgroundColor: "var(--color-primary)",
    border: "none",
    borderRadius: "16px",
    cursor: "pointer",
    flexShrink: 0,
  },
  sectionDescription: {
    fontSize: "14px",
    color: "#6B7684",
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
    background: "#F9FAFB",
    border: "1px solid #E5E8EB",
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
    backgroundColor: "#fff",
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
    color: "#191F28",
    marginBottom: "2px",
  },
  typeCardDesc: {
    fontSize: "13px",
    color: "#6B7684",
    lineHeight: "1.4",
  },
  divider: {
    height: "1px",
    backgroundColor: "#E5E8EB",
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
    backgroundColor: "#F9FAFB",
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
    color: "#191F28",
    marginTop: "8px",
  },
  amuletCardDesc: {
    fontSize: "12px",
    color: "#6B7684",
    lineHeight: "1.4",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
};
