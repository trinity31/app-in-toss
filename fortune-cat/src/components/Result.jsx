export default function Result({ userData, onRestart, onBackToTypeSelect }) {
  const { name, birthdate, fortuneResult } = userData

  // image_description JSON 파싱
  let descriptionItems = []
  if (fortuneResult?.image_description) {
    try {
      const parsed = JSON.parse(fortuneResult.image_description)
      descriptionItems = parsed.items || []
    } catch (e) {
      console.error('image_description 파싱 실패:', e)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', paddingBottom: '100px' }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '16px',
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
            {descriptionItems.length > 0 && (
              <div style={{
                marginTop: '12px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                {descriptionItems.map((item, index) => (
                  <span
                    key={index}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '6px 12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#191F28',
                      background: '#fff',
                      border: '1px solid #E5E8EB',
                      borderRadius: '16px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
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
        padding: '16px 20px calc(24px + env(safe-area-inset-bottom))',
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
