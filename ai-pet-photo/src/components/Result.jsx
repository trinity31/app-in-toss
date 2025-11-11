import { colors } from '@toss/tds-colors';

export default function ResultPage({ imageUrl, onClose, onSave }) {
  return (
    <div style={{
      padding: '20px',
      maxWidth: '500px',
      margin: '0 auto',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.white,
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
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
              backgroundColor: colors.grey100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.grey500
            }}>
              프로필 사진이 표시됩니다
            </div>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px'
        }}>
        <button
          onClick={onClose}
          style={{
            padding: '16px',
            backgroundColor: colors.grey100,
            color: colors.grey900,
            border: 'none',
            borderRadius: '12px',
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
            backgroundColor: '#FF8C42',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          공유하기
        </button>
      </div>
      </div>
    </div>
  );
}
