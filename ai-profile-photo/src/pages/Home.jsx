import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '@toss/tds-colors';
import { newYearImages, profileImages } from '../config/images';

const Spacing = ({ size }) => <div style={{ height: `${size}px` }} />;

// 이미지 슬라이더 컴포넌트
function ImageSlider({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div style={styles.sliderContainer}>
      <img
        src={images[currentIndex]}
        alt=""
        style={styles.sliderImage}
      />
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <Spacing size={40} />

      <div style={styles.heroSection}>
        <h1 style={styles.title}>
          AI 프로필 스튜디오
        </h1>
        <Spacing size={8} />
        <p style={styles.subtitle}>
          특별한 사진을 만들어보세요
        </p>
      </div>

      <Spacing size={32} />

      <div style={styles.cardContainer}>
        <div
          style={styles.card}
          onClick={() => navigate('/newyear')}
        >
          <ImageSlider images={newYearImages} />
          <div style={styles.cardContent}>
            <h2 style={styles.cardTitle}>연하장</h2>
            <Spacing size={4} />
            <p style={styles.cardDescription}>
              2026년 특별한 연하장
            </p>
            <Spacing size={8} />
            <div style={styles.badge}>🎊 신년 특집</div>
          </div>
        </div>

        <Spacing size={16} />

        <div
          style={styles.card}
          onClick={() => navigate('/profile')}
        >
          <ImageSlider images={profileImages} />
          <div style={styles.cardContent}>
            <h2 style={styles.cardTitle}>프로필 사진</h2>
            <Spacing size={4} />
            <p style={styles.cardDescription}>
              스튜디오급 프로필 사진
            </p>
            <Spacing size={8} />
            <div style={styles.badge}>✨ 인기</div>
          </div>
        </div>
      </div>

      <Spacing size={40} />
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
    background: `linear-gradient(180deg, ${colors.blue50} 0%, ${colors.purple50} 100%)`,
    boxSizing: 'border-box',
    overflow: 'auto',
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
    lineHeight: 1.3,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '16px',
    fontWeight: 500,
    color: colors.grey700,
    textAlign: 'center',
    margin: 0,
    lineHeight: 1.5,
  },
  cardContainer: {
    width: '100%',
    maxWidth: '400px',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '16px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    border: `1px solid ${colors.grey100}`,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  },
  sliderContainer: {
    width: '140px',
    minWidth: '140px',
    height: '180px',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: colors.grey50,
  },
  sliderImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'opacity 0.5s ease-in-out',
  },
  cardContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: colors.grey900,
    margin: 0,
    letterSpacing: '-0.3px',
  },
  cardDescription: {
    fontSize: '16px',
    fontWeight: 400,
    color: colors.grey600,
    margin: 0,
    lineHeight: 1.5,
  },
  badge: {
    padding: '4px 10px',
    backgroundColor: colors.blue50,
    color: colors.blue600,
    borderRadius: '16px',
    fontSize: '11px',
    fontWeight: 600,
  },
};
