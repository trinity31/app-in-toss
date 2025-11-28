import { Asset, Loader } from '@toss/tds-mobile';
import { colors } from '@toss/tds-colors';

export default function Loading({ error, onRetry, title, description }) {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {error ? (
          <>
            <div style={styles.iconWrapper}>
              <Asset.Image
                frameShape={Asset.frameShape.CleanW24}
                backgroundColor="transparent"
                src="https://static.toss.im/2d-emojis/png/4x/u26A0.png"
                aria-hidden={true}
                style={{ aspectRatio: '1/1', width: '48px', height: '48px' }}
              />
            </div>
            <h2 style={styles.title}>광고 로드 실패</h2>
            <p style={styles.description}>
              광고를 불러오는데 실패했습니다.<br />
              다시 시도해주세요.
            </p>
            <button style={styles.retryButton} onClick={onRetry}>
              다시 시도
            </button>
          </>
        ) : (
          <>
            <div style={styles.loaderWrapper}>
              <Loader size="large" />
            </div>
            <h2 style={styles.title}>{title || 'AI 펫 프로필 생성 중...'}</h2>
            <p style={styles.description}>
              {description || (
                <>
                  잠시만 기다려주세요.<br />
                  멋진 펫 프로필을 만들고 있어요.
                </>
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: colors.white,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '20px',
  },
  loaderWrapper: {
    marginBottom: '24px',
  },
  iconWrapper: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 700,
    color: colors.grey900,
    margin: '0 0 12px 0',
  },
  description: {
    fontSize: '15px',
    fontWeight: 400,
    color: colors.grey600,
    margin: 0,
    lineHeight: 1.5,
  },
  retryButton: {
    marginTop: '24px',
    padding: '12px 24px',
    backgroundColor: colors.blue500,
    color: colors.white,
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
