import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UserInfoInput from "../components/UserInfoInput";
import TossLogin from "../components/TossLogin";
import ContactInput from "../components/ContactInput";
import AmuletPayment from "../components/AmuletPayment";
import AmuletResult from "../components/AmuletResult";
import { useUserInfoStorage } from "../hooks/useUserInfoStorage";
import {
  usePendingOrderStorage,
  shouldSkipAutoRestore,
} from "../hooks/usePendingOrderStorage";
import { Loader } from "@toss/tds-mobile";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AmuletPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedType = location.state?.selectedType;

  const [currentPage, setCurrentPage] = useState("userInfo");
  const [userData, setUserData] = useState({});
  const [isInitializing, setIsInitializing] = useState(true);
  const [isRestoringOrder, setIsRestoringOrder] = useState(false);
  const [pendingOrders, setPendingOrders] = useState([]);

  const { loading, storedUserInfo, saveUserInfo } = useUserInfoStorage();
  const {
    loading: pendingLoading,
    pendingOrderData,
    clearPendingOrderData,
  } = usePendingOrderStorage();

  // 타입이 전달되지 않은 경우 홈으로 redirect
  useEffect(() => {
    if (!selectedType) {
      navigate("/", { replace: true });
    }
  }, [selectedType, navigate]);

  // 백엔드 API 호출하여 상품 지급 처리
  const grantProduct = async (orderId, orderData) => {
    const bd = orderData.birthdate;
    const birthdayType = bd?.birthdayType || "solar";

    const formattedBirthdate = {
      year: parseInt(bd?.year) || 0,
      month: parseInt(bd?.month) || 0,
      day: parseInt(bd?.day) || 0,
      hour: bd?.hour ? parseInt(bd.hour) : null,
      minute: bd?.minute ? parseInt(bd.minute) : null,
      isLunar: birthdayType === "lunar",
    };

    const requestBody = {
      orderId,
      userKey: orderData.tossUserInfo?.userKey,
      tossName: orderData.tossUserInfo?.name,
      phone: orderData.phone,
      email: orderData.email,
      name: orderData.name,
      birthdate: formattedBirthdate,
      birthday_type: birthdayType,
      gender: orderData.gender,
      amuletType: orderData.amuletType,
      amuletTypeTitle: orderData.amuletTypeTitle,
      productSku: orderData.productSku,
    };

    const endpoint = `${API_BASE_URL}/amulet-order`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        console.error("[AmuletPage] 주문 복원 실패:", response.status);
        return false;
      }

      await response.json();
      return true;
    } catch (err) {
      console.error("[AmuletPage] 주문 복원 에러:", err.message);
      return false;
    }
  };

  // 앱 시작 시 미완료 주문 확인 + 초기화
  useEffect(() => {
    async function initialize() {
      if (loading || pendingLoading) return;

      const initialData = storedUserInfo ? { ...storedUserInfo } : {};
      if (selectedType) {
        Object.assign(initialData, selectedType);
      }
      setUserData(initialData);

      // 테스트 모드에서는 미완료 주문 확인 건너뛰기
      if (shouldSkipAutoRestore()) {
        setIsInitializing(false);
        return;
      }

      // 미완료 주문 확인
      if (pendingOrderData) {
        try {
          const { IAP } = await import("@apps-in-toss/web-framework");
          const response = await IAP.getPendingOrders();
          const orders = Array.isArray(response)
            ? response
            : response?.orders || response?.pendingOrders || [];

          if (orders?.length > 0) {
            setPendingOrders(orders);
          } else {
            clearPendingOrderData();
          }
        } catch (err) {
          console.error("[AmuletPage] 미완료 주문 확인 실패:", err);
        }
      }

      setIsInitializing(false);
    }

    initialize();
  }, [loading, pendingLoading]);

  // 복구 버튼 클릭 시 실행
  const handleRestoreOrder = async () => {
    if (!pendingOrderData || pendingOrders.length === 0) return;

    setIsRestoringOrder(true);
    try {
      const { IAP } = await import("@apps-in-toss/web-framework");

      for (let i = 0; i < pendingOrders.length; i++) {
        const order = pendingOrders[i];
        const orderId = order.orderId || order;

        const success = await grantProduct(orderId, pendingOrderData);

        if (success) {
          try {
            await IAP.completeProductGrant({ params: { orderId } });
          } catch (completeErr) {
            console.error(
              "[AmuletPage] completeProductGrant 에러:",
              completeErr,
            );
          }

          setUserData({ ...pendingOrderData, orderId });
          clearPendingOrderData();
          setPendingOrders([]);
          setCurrentPage("result");
          setIsRestoringOrder(false);
          return;
        }
      }

      alert("주문 복원에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } catch (err) {
      console.error("[AmuletPage] 주문 복원 실패:", err);
      alert("주문 복원 중 오류가 발생했습니다.");
    }

    setIsRestoringOrder(false);
  };

  const handleNext = (data) => {
    const updatedData = { ...userData, ...data };
    setUserData(updatedData);

    if (data.name || data.birthdate || data.gender || data.email || data.phone) {
      const dataToSave = {
        name: updatedData.name,
        birthdate: updatedData.birthdate,
        gender: updatedData.gender,
        email: updatedData.email,
        phone: updatedData.phone,
      };
      saveUserInfo(dataToSave);
    }

    if (currentPage === "userInfo") {
      setCurrentPage("tossLogin");
    } else if (currentPage === "tossLogin") {
      setCurrentPage("contactInput");
    } else if (currentPage === "contactInput") {
      setCurrentPage("payment");
    } else if (currentPage === "payment") {
      setCurrentPage("result");
    }
  };

  const handleBack = () => {
    if (currentPage === "userInfo") {
      navigate("/");
    } else if (currentPage === "tossLogin") {
      setCurrentPage("userInfo");
    } else if (currentPage === "contactInput") {
      setCurrentPage("tossLogin");
    } else if (currentPage === "payment") {
      setCurrentPage("contactInput");
    }
  };

  const handleRestart = () => {
    navigate("/");
  };

  if (!selectedType) return null;

  if (isInitializing) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          gap: "16px",
        }}
      >
        <Loader />
        <p style={{ fontSize: "16px", color: "var(--color-gray-400)", margin: 0 }}>
          로딩 중...
        </p>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case "userInfo":
        return (
          <UserInfoInput
            onNext={handleNext}
            onBack={handleBack}
            initialUserInfo={userData}
          />
        );
      case "tossLogin":
        return (
          <TossLogin
            onNext={handleNext}
            onBack={handleBack}
            userData={userData}
          />
        );
      case "contactInput":
        return (
          <ContactInput
            onNext={handleNext}
            onBack={handleBack}
            userData={userData}
          />
        );
      case "payment":
        return (
          <AmuletPayment
            onNext={handleNext}
            onBack={handleBack}
            userData={userData}
          />
        );
      case "result":
        return (
          <AmuletResult
            userData={userData}
            onRestart={handleRestart}
          />
        );
      default:
        return (
          <UserInfoInput
            onNext={handleNext}
            onBack={handleBack}
            initialUserInfo={userData}
          />
        );
    }
  };

  // 복구할 주문이 있으면 배너 표시
  if (
    pendingOrders.length > 0 &&
    pendingOrderData &&
    currentPage === "userInfo"
  ) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-white)" }}>
        <div
          style={{
            background: "#FFF8E6",
            padding: "16px 20px",
            borderBottom: "1px solid #FFE4B5",
          }}
        >
          <p
            style={{
              fontSize: "15px",
              fontWeight: "600",
              color: "#B86E00",
              margin: "0 0 8px 0",
            }}
          >
            이전에 완료되지 않은 결제가 있습니다
          </p>
          <p
            style={{
              fontSize: "13px",
              color: "#8B7355",
              margin: "0 0 12px 0",
              lineHeight: "1.5",
            }}
          >
            {pendingOrderData.amuletTypeTitle} 부적 ({pendingOrderData.name}님)
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleRestoreOrder}
              disabled={isRestoringOrder}
              style={{
                flex: 1,
                padding: "12px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#fff",
                background: isRestoringOrder ? "#ccc" : "#B86E00",
                border: "none",
                borderRadius: "8px",
                cursor: isRestoringOrder ? "not-allowed" : "pointer",
              }}
            >
              {isRestoringOrder ? "복원 중..." : "주문 복원하기"}
            </button>
            <button
              onClick={() => {
                clearPendingOrderData();
                setPendingOrders([]);
              }}
              disabled={isRestoringOrder}
              style={{
                padding: "12px 16px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#8B7355",
                background: "var(--color-white)",
                border: "1px solid #E5D9C3",
                borderRadius: "8px",
                cursor: isRestoringOrder ? "not-allowed" : "pointer",
              }}
            >
              무시
            </button>
          </div>
          <p
            style={{
              fontSize: "12px",
              color: "#8B7355",
              margin: "12px 0 0 0",
              lineHeight: "1.5",
            }}
          >
            복원이 안 되는 경우{" "}
            <a
              href="mailto:admin@davinci-apps.online"
              style={{ color: "#B86E00" }}
            >
              admin@davinci-apps.online
            </a>
            으로 문의해 주세요
          </p>
        </div>

        {renderPage()}
      </div>
    );
  }

  return renderPage();
}
