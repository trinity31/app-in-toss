export default function LoadingPage() {
  return (
    <div style={{
      padding: '20px',
      maxWidth: '500px',
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#191F28' }}>
          AI프로필스튜디오
        </h2>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <img
          src="https://static.toss.im/appsintoss/7011/38bc18e7-84fa-4ed5-b902-4165ddc83795.png"
          alt="AI 프로필 스튜디오"
          style={{ width: '64px', height: '64px' }}
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#191F28', marginBottom: '10px' }}>
          프로필 사진을<br />만들고 있어요
        </h1>
        <p style={{ fontSize: '16px', color: '#6B7684', margin: 0 }}>
          잠시만 기다려주세요.
        </p>
      </div>

      <div style={{
        width: '60px',
        height: '60px',
        margin: '40px auto',
        border: '4px solid #f0f0f0',
        borderTop: '4px solid #3182F6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
}