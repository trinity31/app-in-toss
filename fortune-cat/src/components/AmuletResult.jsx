export default function AmuletResult({ userData, onRestart, onBackToTypeSelect }) {
  const { name, birthdate, amuletTypeTitle, email, phone } = userData

  return (
    <div style={{ minHeight: '100vh', background: '#fff', paddingBottom: '100px' }}>
      <div style={{
        background: '#fff',
        padding: '24px',
        marginBottom: '16px',
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#191F28',
          marginBottom: '8px'
        }}>
          부적 이미지 신청 완료
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#8B95A1',
          marginBottom: '32px'
        }}>
          {birthdate.year}년 {birthdate.month}월 {birthdate.day}일 | {name}님
        </p>

        <div style={{
          background: '#F7F8FA',
          borderRadius: '16px',
          padding: '32px 24px',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '20px'
          }}>
            📱
          </div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#191F28',
            marginBottom: '12px'
          }}>
            24시간 이내에 문자로 전송됩니다
          </h2>
          <p style={{
            fontSize: '15px',
            color: '#6B7684',
            lineHeight: '1.6',
            marginBottom: '20px'
          }}>
            정성을 담아 {name}님만을 위한<br />
            <strong style={{ color: '#191F28' }}>{amuletTypeTitle}</strong> 부적을 제작 중입니다
          </p>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #E5E8EB'
          }}>
            <div style={{ marginBottom: '12px' }}>
              <p style={{
                fontSize: '13px',
                color: '#8B95A1',
                marginBottom: '4px'
              }}>
                발송 예정 이메일
              </p>
              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#191F28',
                margin: 0
              }}>
                {email}
              </p>
            </div>
            <div>
              <p style={{
                fontSize: '13px',
                color: '#8B95A1',
                marginBottom: '4px'
              }}>
                휴대폰 번호
              </p>
              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#191F28',
                margin: 0
              }}>
                {phone}
              </p>
            </div>
          </div>
        </div>

        <div style={{
          background: 'var(--color-primary-light)',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h3 style={{
            fontSize: '15px',
            fontWeight: 'bold',
            color: '#191F28',
            marginBottom: '12px'
          }}>
            안내 사항
          </h3>
          <ul style={{
            fontSize: '14px',
            color: '#4E5968',
            lineHeight: '1.8',
            paddingLeft: '20px',
            margin: 0
          }}>
            <li>부적 이미지는 고화질 이미지 링크로 제공됩니다</li>
            <li>24시간 이후에도 미수신 시 고객센터로 문의해 주세요</li>
          </ul>
        </div>
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
          다른 부적 신청
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
          처음으로
        </button>
      </div>
    </div>
  )
}
