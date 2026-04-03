import { useState, useEffect } from "react";
import { Loader } from "@toss/tds-mobile";
import { supabase, getAmuletStyleImageUrl } from "../lib/supabase";
import { logEvent } from "../lib/firebase";

export default function AmuletTypeSelect({ onNext, onBack }) {
  const [selectedType, setSelectedType] = useState(null);
  const [amuletTypes, setAmuletTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAmuletTypes() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("amulet_types")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (error) throw error;
        setAmuletTypes(data || []);
      } catch (err) {
        console.error("[AmuletTypeSelect] 조회 실패:", err);
        setError("부적 스타일을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchAmuletTypes();
  }, []);

  const handleTypeSelect = (type) => {
    setSelectedType(type.id);
  };

  const handleNext = () => {
    const selectedTypeData = amuletTypes.find((t) => t.id === selectedType);
    if (selectedTypeData) {
      logEvent("amulet_style_selected", {
        amulet_type: selectedTypeData.code,
        amulet_title: selectedTypeData.title_ko,
      });
      onNext({
        amuletType: selectedTypeData.code,
        amuletTypeTitle: selectedTypeData.title_ko,
      });
    }
  };

  return (
    <>
      <div style={{ padding: "20px 20px 100px" }}>
        <h1
          style={{
            fontSize: "22px",
            lineHeight: "1.4",
            fontWeight: "bold",
            color: "var(--color-gray-700)",
            margin: "0 0 12px 0",
          }}
        >
          원하는 부적 스타일을 선택해 주세요
        </h1>

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
              부적 스타일을 불러오는 중...
            </p>
          </div>
        ) : error ? (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "16px",
                color: "var(--color-error)",
                marginBottom: "16px",
              }}
            >
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "12px 24px",
                fontSize: "14px",
                fontWeight: "bold",
                color: "#fff",
                background: "var(--color-primary)",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              다시 시도
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {amuletTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleTypeSelect(type)}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: selectedType === type.id ? "#F7F8FA" : "var(--color-white)",
                  border:
                    selectedType === type.id
                      ? "2px solid var(--color-primary)"
                      : "1px solid var(--color-gray-200)",
                  borderRadius: "12px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginBottom: "8px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "var(--color-gray-700)",
                      marginBottom: "4px",
                      transition: "color 0.2s ease",
                    }}
                  >
                    {type.title_ko}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: selectedType === type.id ? "var(--color-gray-600)" : "var(--color-gray-400)",
                      transition: "color 0.2s ease",
                    }}
                  >
                    {type.description_ko}
                  </div>
                </div>
                <img
                  src={getAmuletStyleImageUrl(type.code)}
                  alt={type.title_ko}
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "8px",
                    objectFit: "cover",
                    border:
                      selectedType === type.id
                        ? "2px solid var(--color-primary)"
                        : "none",
                    transition: "border 0.2s ease",
                  }}
                />
              </button>
            ))}
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
          background: "var(--color-white)",
          display: "flex",
          gap: "12px",
          zIndex: 1000,
          boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.08)",
        }}
      >
        <button
          onClick={onBack}
          style={{
            flex: selectedType ? 1 : "100%",
            padding: "16px",
            fontSize: "16px",
            fontWeight: "bold",
            color: "var(--color-gray-700)",
            background: "var(--color-gray-100)",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          이전
        </button>
        {selectedType && (
          <button
            onClick={handleNext}
            style={{
              flex: 1,
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
            다음
          </button>
        )}
      </div>
    </>
  );
}
