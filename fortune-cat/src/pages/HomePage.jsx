import { useNavigate } from 'react-router-dom'
import { colors } from '@toss/tds-colors'
import basicFortune from '../assets/images/basic-fortune.png'
import animalFortune from '../assets/images/animal-fortune.png'
import jobFortune from '../assets/images/job-fortune.png'
import loveFortune from '../assets/images/lookbook-fortune.png'

const Spacing = ({ size }) => <div style={{ height: `${size}px` }} />

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div style={styles.container}>
      <Spacing size={40} />

      <div style={styles.header}>
        <h1 style={styles.title}>복냥사주</h1>
        <p style={styles.subtitle}>
          AI가 알려주는 당신의 운명
        </p>
      </div>

      <Spacing size={32} />

      <div style={styles.cardContainer}>
        {/* 신년운세 카드 */}
        <div
          style={{ ...styles.card, border: `2px solid ${colors.red400}`, background: colors.red50 }}
          onClick={() => navigate('/newyear')}
        >
          <div style={styles.cardIcon}>🧧</div>
          <div style={styles.cardContent}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>2026 신년운세</h2>
              <span style={styles.newBadge}>NEW</span>
            </div>
            <p style={styles.cardDescription}>
              미리 보는 2026년 나의 운세는?
            </p>
          </div>
          <div style={styles.arrowIcon}>›</div>
        </div>

        <Spacing size={16} />

        {/* 이미지 사주 카드 */}
        <div
          style={styles.card}
          onClick={() => navigate('/saju')}
        >
          <div style={styles.cardImageWrapper}>
            <img src={basicFortune} alt="" style={styles.cardImage} />
            <img src={animalFortune} alt="" style={styles.cardImage} />
            <img src={jobFortune} alt="" style={styles.cardImage} />
          </div>
          <div style={styles.cardContent}>
            <h2 style={styles.cardTitle}>이미지 사주</h2>
            <p style={styles.cardDescription}>
              사주풀이와 함께 나만의 그림을 그려드려요
            </p>
          </div>
          <div style={styles.arrowIcon}>›</div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: '#fff',
    boxSizing: 'border-box',
  },
  header: {
    width: '100%',
    maxWidth: '400px',
    textAlign: 'left',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#191F28',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#8B95A1',
    margin: 0,
  },
  cardContainer: {
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
  },
  card: {
    width: '100%',
    padding: '24px 20px',
    borderRadius: '24px',
    backgroundColor: '#F9FAFB',
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    position: 'relative',
    overflow: 'hidden',
  },
  cardIcon: {
    fontSize: '40px',
    marginRight: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '60px',
    height: '60px',
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  cardImageWrapper: {
    marginRight: '16px',
    width: '60px',
    height: '60px',
    position: 'relative',
  },
  cardImage: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    position: 'absolute',
    border: '2px solid #fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    objectFit: 'cover',
    '&:nth-child(1)': { top: 0, left: 0, zIndex: 1 },
    '&:nth-child(2)': { top: '10px', left: '10px', zIndex: 2 },
    '&:nth-child(3)': { top: '20px', left: '20px', zIndex: 3 },
  },
  cardContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '4px',
    gap: '6px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#333D4B',
    margin: 0,
  },
  newBadge: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#fff',
    backgroundColor: colors.red500,
    padding: '2px 6px',
    borderRadius: '4px',
  },
  cardDescription: {
    fontSize: '14px',
    color: '#6B7684',
    margin: 0,
    lineHeight: '1.4',
  },
  arrowIcon: {
    fontSize: '24px',
    color: '#B0B8C1',
    fontWeight: '300',
    marginLeft: '8px',
  },
}
