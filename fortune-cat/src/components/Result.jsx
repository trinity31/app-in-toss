export default function Result({ userData, onRestart, onBackToTypeSelect }) {
  const { name, birthdate, fortuneResult } = userData

  // image_description 처리
  let descriptionItems = []
  let isJsonArray = false
  if (fortuneResult?.image_description) {
    let description = fortuneResult.image_description

    // 마크다운 코드 블록 형식 제거 (```json ... ``` 또는 '''json ... ''')
    description = description.replace(/^```json\s*/i, '').replace(/\s*```$/, '')
    description = description.replace(/^'''json\s*/i, '').replace(/\s*'''$/, '')
    description = description.trim()

    try {
      // JSON 형식인 경우 파싱 시도
      const parsed = JSON.parse(description)
      descriptionItems = parsed.items || []
      isJsonArray = true
    } catch (e) {
      // JSON이 아닌 단순 문자열인 경우 그대로 사용
      // OOO님을 실제 이름으로 치환
      if (name) {
        description = description.replace(/OOO님/g, `${name}님`)
      }
      descriptionItems = [description]
      isJsonArray = false
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
                  <div
                    key={index}
                    style={{
                      display: 'inline-block',
                      padding: isJsonArray ? '8px 14px' : '14px 18px',
                      fontSize: '14px',
                      fontWeight: '600',
                      lineHeight: '1.5',
                      color: '#4E5968',
                      background: '#F2F4F6',
                      borderRadius: '12px',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      maxWidth: '100%'
                    }}
                  >
                    {item}
                  </div>
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
