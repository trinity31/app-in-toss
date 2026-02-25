import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { colors } from "@toss/tds-colors";
import { Loader } from "@toss/tds-mobile";
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

const Spacing = ({ size }) => <div style={{ height: `${size}px` }} />;

export default function HomePage() {
  const navigate = useNavigate();
  const [newYearTypes, setNewYearTypes] = useState([]);
  const [sajuTypes, setSajuTypes] = useState([]);
  const [amuletTypes, setAmuletTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleError = (event) => {
      alert(
        `에러 발생: ${event.message || event.reason?.message || "알 수 없는 오류"}`,
      );
      console.error("[HomePage] 에러:", event);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleError);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleError);
    };
  }, []);

  useEffect(() => {
    async function fetchAllTypes() {
      try {
        setIsLoading(true);
        const [newYearRes, sajuRes, amuletRes] = await Promise.all([
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

        if (newYearRes.data) setNewYearTypes(newYearRes.data);
        if (sajuRes.data) setSajuTypes(sajuRes.data);
        if (amuletRes.data) setAmuletTypes(amuletRes.data);
      } catch (err) {
        console.error("[HomePage] 데이터 로드 실패:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAllTypes();
  }, []);

  const handleNewYearTypeClick = (type) => {
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
      ) : (
        <div style={styles.sectionsContainer}>
          {/* 섹션 1: 신년운세 */}
          <section>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionIcon}>🧧</span>
              <h2 style={styles.sectionTitle}>2026 신년운세</h2>
              <span style={{ ...styles.badge, backgroundColor: colors.red500 }}>
                NEW
              </span>
            </div>
            <p style={styles.sectionDescription}>
              운세 보고 질문도 무제한으로 하기
            </p>
            <div style={styles.typeGrid}>
              {newYearTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleNewYearTypeClick(type)}
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

          {/* 섹션 2: 이미지 사주 */}
          <section>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>이미지 사주</h2>
            </div>
            <p style={styles.sectionDescription}>
              이미지와 함께 운세를 읽어드려요
            </p>
            <div style={styles.typeGrid}>
              {sajuTypes.map((type) => (
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

          {/* 섹션 3: 부적 아트 이미지 */}
          <section>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionIcon}>🧿</span>
              <h2 style={styles.sectionTitle}>부적 아트 이미지</h2>
              <span
                style={{ ...styles.badge, backgroundColor: colors.purple500 }}
              >
                NEW
              </span>
            </div>
            <p style={styles.sectionDescription}>
              나만을 위한 특별한 부적 이미지
            </p>
            <div style={styles.typeGrid}>
              {amuletTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleAmuletTypeClick(type)}
                  style={styles.typeCard}
                >
                  <img
                    src={getAmuletStyleImageUrl(type.code)}
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
  sectionsContainer: {
    width: "100%",
    maxWidth: "400px",
    alignSelf: "center",
    marginTop: "24px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "4px",
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
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  divider: {
    height: "1px",
    backgroundColor: "#E5E8EB",
    margin: "28px 0",
  },
};
