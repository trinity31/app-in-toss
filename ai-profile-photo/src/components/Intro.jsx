import { useState } from 'react';
import { Asset, ListRow } from '@toss/tds-mobile';
import { colors } from '@toss/tds-colors';

const Spacing = ({ size }) => <div style={{ height: `${size}px` }} />;

export default function IntroPage({ onNext, error, pageType = 'profile' }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCameraClick = () => {
    setIsOpen(false);
    onNext('camera');
  };

  const handleAlbumClick = () => {
    setIsOpen(false);
    onNext('album');
  };

  // 페이지 타입에 따른 문구 설정
  const content = pageType === 'newyear' ? {
    title: '2026년 특별한\n연하장 만들기',
    description: '구글 최신 이미지 모델 나노바나나 프로🍌',
    steps: [
      { number: '1', text: '사진을 최대 3장까지 올리고', subText: '가족이나 친구, 반려동물과 함께 만들 수 있어요', iconSrc: 'u1F4F8.png' },
      { number: '2', text: '원하는 스타일 선택하면', iconSrc: 'u2728.png' },
      { number: '3', text: '1분 안에 특별한 연하장 완성!', iconSrc: 'u1F389.png' }
    ]
  } : {
    title: '스튜디오 안 부러운\n프로필 사진 만들기',
    description: '구글 최신 이미지 모델 나노바나나🍌 로,\n퀄리티 높은 이미지를 생성합니다',
    steps: [
      { number: '1', text: '얼굴 사진 한장 올리고', iconSrc: 'u1F4F8.png' },
      { number: '2', text: '원하는 스타일을 선택하면', iconSrc: 'u23F3.png' },
      { number: '3', text: '1분 안에 프로필 사진 완성!', iconSrc: 'u1F5BC.png' }
    ]
  };

  return (
    <div style={styles.container}>
      <Spacing size={40} />

      <div style={styles.heroSection}>
        <h1 style={styles.title}>
          {content.title.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < content.title.split('\n').length - 1 && <br />}
            </span>
          ))}
        </h1>

        <Spacing size={12} />

        <Spacing size={8} />

        <p style={styles.description}>
          {content.description.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < content.description.split('\n').length - 1 && <br />}
            </span>
          ))}
        </p>
      </div>

      <Spacing size={48} />

      {error && (
        <>
          <div style={styles.errorMessage}>
            {error}
          </div>
          <Spacing size={20} />
        </>
      )}

      <div style={styles.stepContainer}>
        <h3 style={styles.sectionTitle}>
          이렇게 사용해요
        </h3>

        <div style={styles.stepList}>
          {content.steps.map((step) => (
            <div key={step.number} style={styles.stepCard}>
              <div style={styles.stepIconWrapper}>
                <Asset.Image
                  frameShape={Asset.frameShape.CleanW24}
                  backgroundColor="transparent"
                  src={`https://static.toss.im/2d-emojis/png/4x/${step.iconSrc}`}
                  aria-hidden={true}
                  style={{ aspectRatio: '1/1' }}
                />
              </div>
              <div style={styles.stepContent}>
                <p style={styles.stepText}>{step.text}</p>
                {step.subText && (
                  <p style={styles.stepSubText}>{step.subText}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Spacing size={100} />

      <div style={styles.buttonContainer}>
        <button
          style={styles.button}
          onClick={() => setIsOpen(true)}
        >
          시작하기
        </button>
      </div>

      {isOpen && (
        <>
          <div style={styles.overlay} onClick={() => setIsOpen(false)} />
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>사진 선택</h3>
            <Spacing size={20} />

            <div style={styles.listContainer}>
              <ListRow
                onClick={handleCameraClick}
                left={
                  <div style={styles.modalIconWrapper}>
                    <Asset.Image
                      frameShape={Asset.frameShape.CleanW24}
                      backgroundColor="transparent"
                      src="https://static.toss.im/2d-emojis/png/4x/u1F4F8.png"
                      aria-hidden={true}
                      style={{ aspectRatio: '1/1' }}
                    />
                  </div>
                }
                contents={
                  <div style={styles.listRowText}>사진 촬영</div>
                }
                withTouchEffect
              />
              <div style={styles.divider} />
              <ListRow
                onClick={handleAlbumClick}
                left={
                  <div style={styles.modalIconWrapper}>
                    <Asset.Image
                      frameShape={Asset.frameShape.CleanW24}
                      backgroundColor="transparent"
                      src="https://static.toss.im/2d-emojis/png/4x/u1F5BC.png"
                      aria-hidden={true}
                      style={{ aspectRatio: '1/1' }}
                    />
                  </div>
                }
                contents={
                  <div style={styles.listRowText}>앨범에서 선택</div>
                }
                withTouchEffect
              />
            </div>

            <Spacing size={20} />

            <button
              style={styles.cancelButton}
              onClick={() => setIsOpen(false)}
            >
              취소
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100%',
    padding: '20px',
    background: `linear-gradient(180deg, ${colors.blue50} 0%, ${colors.grey50} 100%)`,
    paddingBottom: '120px',
    boxSizing: 'border-box',
  },
  heroSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: colors.grey900,
    textAlign: 'center',
    margin: 0,
    lineHeight: 1.4,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '16px',
    fontWeight: 400,
    color: colors.grey700,
    textAlign: 'center',
    margin: 0,
    lineHeight: 1.5,
  },
  description: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#FF1493', // Hot Pink (DeepPink for readability)
    textAlign: 'center',
    margin: 0,
    lineHeight: 1.5,
    backgroundColor: 'rgba(255, 20, 147, 0.1)', // Transparent Hot Pink
    padding: '12px 20px',
    borderRadius: '16px',
  },
  stepContainer: {
    width: '100%',
    maxWidth: '400px',
    padding: '0 4px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: colors.grey900,
    margin: '0 0 20px 0',
    letterSpacing: '-0.3px',
  },
  stepList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  stepCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: colors.white,
    borderRadius: '16px',
    transition: 'transform 0.2s ease',
    border: `1px solid ${colors.grey100}`,
    gap: '16px',
  },
  stepIconWrapper: {
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue50,
    borderRadius: '50%',
    flexShrink: 0,
  },
  stepContent: {
    flex: 1,
  },
  stepText: {
    fontSize: '16px',
    fontWeight: 600,
    color: colors.grey900,
    margin: 0,
  },
  stepSubText: {
    fontSize: '13px',
    fontWeight: 400,
    color: colors.grey600,
    margin: '6px 0 0 0',
    lineHeight: 1.4,
  },
  buttonContainer: {
    width: 'calc(100% - 40px)',
    maxWidth: '400px',
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  button: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#db5c7f',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  modal: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '480px',
    backgroundColor: colors.white,
    borderTopLeftRadius: '24px',
    borderTopRightRadius: '24px',
    padding: '28px 20px',
    paddingBottom: 'max(32px, env(safe-area-inset-bottom))',
    zIndex: 1001,
    borderTop: `1px solid ${colors.grey100}`,
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: colors.grey900,
    margin: 0,
    letterSpacing: '-0.4px',
    textAlign: 'center',
  },
  listContainer: {
    borderRadius: '12px',
    overflow: 'hidden',
  },
  listRowText: {
    fontSize: '16px',
    fontWeight: 600,
    color: colors.grey900,
    letterSpacing: '-0.2px',
  },
  divider: {
    height: '1px',
    backgroundColor: colors.grey100,
    margin: '0 16px',
  },
  modalIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
  },
  cancelButton: {
    width: '100%',
    padding: '16px',
    backgroundColor: colors.grey100,
    color: colors.grey900,
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  errorMessage: {
    width: '100%',
    maxWidth: '400px',
    padding: '16px',
    backgroundColor: colors.red50,
    color: colors.red600,
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'center',
    border: `1px solid ${colors.red100}`,
  },
};
