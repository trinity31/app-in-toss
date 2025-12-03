export default function Result({ userData, onRestart, onBackToTypeSelect }) {
  const { name, birthdate, fortuneResult } = userData

  return (
    <div style={{ padding: '20px 20px 120px', minHeight: '100vh', background: '#F9FAFB' }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#191F28',
          marginBottom: '8px'
        }}>
          {name}님의 사주풀이
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#8B95A1',
          marginBottom: '24px'
        }}>
          {birthdate.year}년 {birthdate.month}월 {birthdate.day}일
        </p>

        {fortuneResult?.image_url && (
          <div style={{ marginBottom: '24px' }}>
            <img
              src={fortuneResult.image_url}
              alt="사주 이미지"
              style={{
                width: '100%',
                borderRadius: '12px',
                objectFit: 'cover'
              }}
            />
            {fortuneResult.image_description && (
              <p style={{
                fontSize: '13px',
                color: '#8B95A1',
                marginTop: '8px',
                fontStyle: 'italic'
              }}>
                {fortuneResult.image_description}
              </p>
            )}
          </div>
        )}

        {fortuneResult?.reading && (
          <div style={{
            background: 'var(--color-primary-light)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'var(--color-primary)',
              marginBottom: '12px'
            }}>
              사주 풀이
            </h2>
            <p style={{
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#4E5968',
              whiteSpace: 'pre-wrap'
            }}>
              {fortuneResult.reading}
            </p>
          </div>
        )}
      </div>

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px 20px calc(16px + env(safe-area-inset-bottom))',
        background: '#fff',
        display: 'flex',
        gap: '12px',
        zIndex: 1000,
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.08)'
      }}>
        <button
          onClick={onBackToTypeSelect}
          style={{
            flex: 1,
            padding: '16px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#191F28',
            background: '#F2F4F6',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          타입 선택으로
        </button>
        <button
          onClick={onRestart}
          style={{
            flex: 1,
            padding: '16px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#fff',
            background: 'var(--color-primary)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          처음부터 다시하기
        </button>
      </div>
    </div>
  )
}
