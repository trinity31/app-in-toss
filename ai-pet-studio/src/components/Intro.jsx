import { useState, useEffect, useRef } from 'react';
import { Asset, ListRow } from '@toss/tds-mobile';
import { colors } from '@toss/tds-colors';
import { newYearImages, profileImages } from '../config/images';

const Spacing = ({ size }) => <div style={{ height: `${size}px` }} />;

// Horizontal Auto Scroll 컴포넌트
function HorizontalAutoScroll({ images }) {
  const scrollRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const scrollWidth = scrollContainer.scrollWidth;
    const clientWidth = scrollContainer.clientWidth;
    const maxScroll = scrollWidth - clientWidth;

    const interval = setInterval(() => {
      setScrollPosition((prev) => {
        const next = prev + 1;
        // 끝에 도달하면 처음으로
        if (next >= maxScroll) {
          return 0;
        }
        return next;
      });
    }, 30); // 30ms마다 1px씩 이동

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollPosition;
    }
  }, [scrollPosition]);

  return (
    <div
      ref={scrollRef}
      style={styles.horizontalScrollContainer}
    >
      <div style={styles.horizontalScrollContent}>
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt=""
            style={styles.horizontalScrollImage}
          />
        ))}
        {/* 무한 스크롤을 위해 이미지 복제 */}
        {images.map((image, index) => (
          <img
            key={`duplicate-${index}`}
            src={image}
            alt=""
            style={styles.horizontalScrollImage}
          />
        ))}
      </div>
    </div>
  );
}

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

  // 페이지 타입에 따라 이미지 선택
  const images = pageType === 'newyear' ? newYearImages : profileImages;

  // 페이지 타입에 따른 스텝 텍스트
  const steps = pageType === 'newyear'
    ? [
        { number: '1', text: '반려동물 사진 한장 올리고', iconSrc: 'u1F436.png' },
        { number: '2', text: '크리스마스 카드나 연하장 선택하면', iconSrc: 'u2728.png' },
        { number: '3', text: '1분 안에 특별한 카드 완성!', iconSrc: 'u1F389.png' }
      ]
    : [
        { number: '1', text: '반려동물 사진 한장 올리고', iconSrc: 'u1F436.png' },
        { number: '2', text: '변신 스타일을 선택하면', iconSrc: 'u2728.png' },
        { number: '3', text: '1분 안에 특별한 사진 완성!', iconSrc: 'u1F389.png' }
      ];

  return (
    <div style={styles.container}>
      <Spacing size={20} />

      {/* Horizontal Auto Scroll */}
      <HorizontalAutoScroll images={images} />

      <Spacing size={20} />

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
          이렇게 만들어요
        </h3>

        <div style={styles.stepList}>
          {steps.map((step) => (
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
              <p style={styles.stepText}>{step.text}</p>
            </div>
          ))}
        </div>
      </div>

      <Spacing size={80} />

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
    background: `linear-gradient(180deg, ${colors.orange50} 0%, ${colors.yellow50} 100%)`,
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
  horizontalScrollContainer: {
    width: '100%',
    overflowX: 'hidden',
    position: 'relative',
  },
  horizontalScrollContent: {
    display: 'flex',
    gap: '12px',
    paddingLeft: '20px',
  },
  horizontalScrollImage: {
    width: '200px',
    height: '260px',
    objectFit: 'cover',
    borderRadius: '12px',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
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
    backgroundColor: colors.orange50,
    borderRadius: '50%',
    flexShrink: 0,
  },
  stepText: {
    fontSize: '16px',
    fontWeight: 600,
    color: colors.grey900,
    margin: 0,
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
    backgroundColor: '#FF8C42',
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
