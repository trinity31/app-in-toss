import { Asset } from '@toss/tds-mobile';
import { colors } from '@toss/tds-colors';

export default function LoadingPage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100%',
      padding: '20px',
      backgroundColor: colors.white,
      boxSizing: 'border-box',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{
          fontSize: '22px',
          fontWeight: '700',
          color: colors.grey900,
          margin: '0 0 12px 0',
          lineHeight: 1.4
        }}>
          프로필 사진을 만들고 있어요
        </h1>
        <p style={{
          fontSize: '16px',
          color: colors.grey500,
          margin: 0,
          lineHeight: 1.5
        }}>
          잠시만 기다려주세요.
        </p>
      </div>

      <div style={{
        width: '100%',
        maxWidth: '375px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Asset.Lottie
          frameShape={{ width: 375 }}
          src="https://static.toss.im/lotties/loading/load-ripple.json"
          loop={true}
          speed={1}
          aria-hidden={true}
        />
      </div>
    </div>
  );
}
