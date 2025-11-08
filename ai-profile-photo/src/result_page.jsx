export default function ResultPage({ imageUrl, onClose, onSave }) {
  return (
    <div style={{
      padding: '20px',
      maxWidth: '500px',
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#191F28' }}>
          AI프로필스튜디오
        </h2>
      </div>

      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <img
          src="https://static.toss.im/appsintoss/7011/38bc18e7-84fa-4ed5-b902-4165ddc83795.png"
          alt="AI 프로필 스튜디오"
          style={{ width: '64px', height: '64px' }}
        />
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        {imageUrl ? (
          <div style={{
            width: '100%',
            maxWidth: '400px',
            aspectRatio: '3/4',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <img
              src={imageUrl}
              alt="생성된 프로필 사진"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        ) : (
          <div style={{
            width: '100%',
            maxWidth: '400px',
            aspectRatio: '3/4',
            borderRadius: '12px',
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999'
          }}>
            프로필 사진이 표시됩니다
          </div>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginTop: 'auto'
      }}>
        <button
          onClick={onClose}
          style={{
            padding: '16px',
            backgroundColor: '#f8f9fa',
            color: '#191F28',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          닫기
        </button>
        <button
          onClick={onSave}
          style={{
            padding: '16px',
            backgroundColor: '#3182F6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          저장하기
        </button>
      </div>
    </div>
  );
}