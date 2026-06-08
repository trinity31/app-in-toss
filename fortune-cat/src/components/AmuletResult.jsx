import { useToast } from "../hooks/useToast";
import { useBlockSwipeBack } from "../hooks/useBlockSwipeBack";

export default function AmuletResult({
  userData,
  onRestart,
}) {
  const { name, birthdate, amuletTypeTitle, email, phone } = userData;
  const { openToast } = useToast();

  // 결과 화면에서 뒤로가기로 신청 결과가 유실되는 것을 방지 (Android는 확인 다이얼로그)
  useBlockSwipeBack(onRestart);

  return (
    <div
      style={{ minHeight: "100vh", background: "var(--color-white)", paddingBottom: "140px" }}
    >
      <div
        style={{
          background: "var(--color-white)",
          padding: "24px",
          marginBottom: "16px",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "var(--color-gray-700)",
            marginBottom: "8px",
          }}
        >
          부적 아트 이미지 신청 완료
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "var(--color-gray-400)",
            marginBottom: "32px",
          }}
        >
          {birthdate.year}년 {birthdate.month}월 {birthdate.day}일 | {name}님
        </p>

        <div
          style={{
            background: "#F7F8FA",
            borderRadius: "16px",
            padding: "32px 24px",
            textAlign: "center",
            marginBottom: "24px",
          }}
        >
          {/* <div
            style={{
              fontSize: "64px",
              marginBottom: "20px",
            }}
          >
            📱
          </div> */}
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "var(--color-gray-700)",
              marginBottom: "12px",
            }}
          >
            24시간 이내에 이메일로 전송돼요
          </h2>
          <p
            style={{
              fontSize: "15px",
              color: "var(--color-gray-500)",
              lineHeight: "1.6",
              marginBottom: "20px",
            }}
          >
            정성을 담아 {name}님만을 위한
            <br />
            <strong style={{ color: "var(--color-gray-700)" }}>{amuletTypeTitle}</strong>{" "}
            부적을 제작해 드려요.
          </p>
          <div
            style={{
              borderTop: "1px solid var(--color-gray-200)",
              paddingTop: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              textAlign: "left",
            }}
          >
            <div>
              <p style={{ fontSize: "13px", color: "var(--color-gray-400)", marginBottom: "2px" }}>
                발송 예정 이메일
              </p>
              <p style={{ fontSize: "15px", fontWeight: "600", color: "var(--color-gray-700)", margin: 0 }}>
                {email}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "13px", color: "var(--color-gray-400)", marginBottom: "2px" }}>
                휴대폰 번호
              </p>
              <p style={{ fontSize: "15px", fontWeight: "600", color: "var(--color-gray-700)", margin: 0 }}>
                {phone}
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "var(--color-primary-light)",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h3
            style={{
              fontSize: "15px",
              fontWeight: "bold",
              color: "var(--color-gray-700)",
              marginBottom: "12px",
            }}
          >
            안내 사항
          </h3>
          <ul
            style={{
              fontSize: "14px",
              color: "var(--color-gray-600)",
              lineHeight: "1.8",
              paddingLeft: "20px",
              margin: 0,
            }}
          >
            <li>이미지는 고화질 이미지 4장으로 보내드려요.</li>
            <li>24시간후 미수신시 아래의 이메일로 문의해 주세요.</li>
            <li>스팸 메일함도 꼭 확인해 주세요.</li>
          </ul>
        </div>

        <div
          style={{
            marginTop: "16px",
            padding: "12px 16px",
            background: "#F7F8FA",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              color: "var(--color-gray-500)",
            }}
          >
            문의:
          </span>
          <a
            href="mailto:admin@davinci-apps.online"
            style={{
              fontSize: "14px",
              color: "#4CAF50",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            admin@davinci-apps.online
          </a>
          <button
            onClick={() => {
              navigator.clipboard.writeText("admin@davinci-apps.online");
              openToast({ message: "이메일 주소가 복사되었습니다" });
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="이메일 복사"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="5"
                y="5"
                width="9"
                height="9"
                rx="1.5"
                stroke="var(--color-gray-500)"
                strokeWidth="1.5"
              />
              <path
                d="M3 10.5V3.5C3 2.67157 3.67157 2 4.5 2H10.5"
                stroke="var(--color-gray-500)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
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
          처음으로
        </button>
      </div>
    </div>
  );
}
