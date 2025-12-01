export default function Result({ userData }) {
  const { name, birthdate, gender, fortuneType, photo } = userData

  return (
    <div style={{ padding: '20px', minHeight: '100vh', background: '#F9FAFB' }}>
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
          {birthdate.hour && ` ${birthdate.hour}시`}
          {birthdate.minute && ` ${birthdate.minute}분`}
        </p>

        {photo && (
          <div style={{ marginBottom: '24px' }}>
            <img
              src={photo.previewUri}
              alt="업로드된 사진"
              style={{
                width: '100%',
                borderRadius: '12px',
                maxHeight: '300px',
                objectFit: 'cover'
              }}
            />
          </div>
        )}

        <div style={{
          background: 'var(--color-primary-light)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: 'var(--color-primary)',
            marginBottom: '12px'
          }}>
            사주로 보는 내 모습
          </h2>
          <p style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: '#4E5968'
          }}>
            {name}님은 따뜻한 봄날의 햇살처럼 주변 사람들에게 밝은 에너지를 전달하는 분이십니다.
            타고난 리더십과 섬세한 배려심을 동시에 갖추고 계시며, 어려운 상황에서도 긍정적인
            마인드로 해결책을 찾아내는 능력이 뛰어나십니다.
          </p>
        </div>

        <div style={{
          background: '#FFF4ED',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#FF6B00',
            marginBottom: '12px'
          }}>
            행운의 방향
          </h2>
          <p style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: '#4E5968'
          }}>
            동쪽 방향이 {name}님께 좋은 기운을 가져다 줍니다. 중요한 결정을 내릴 때는
            동쪽을 향해 앉거나, 동쪽 지역으로의 여행을 추천드립니다.
          </p>
        </div>

        <div style={{
          background: '#F0FDF4',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#10B981',
            marginBottom: '12px'
          }}>
            행운의 색상
          </h2>
          <p style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: '#4E5968',
            marginBottom: '12px'
          }}>
            파란색과 초록색이 {name}님의 운을 상승시켜 줍니다.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '8px',
              background: 'var(--color-primary)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }} />
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '8px',
              background: '#10B981',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }} />
          </div>
        </div>
      </div>

      <button
        onClick={() => window.location.reload()}
        style={{
          width: '100%',
          padding: '16px',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#fff',
          background: 'var(--color-primary)',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        처음으로 돌아가기
      </button>
    </div>
  )
}
