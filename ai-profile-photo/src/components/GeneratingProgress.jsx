import { useState, useEffect } from 'react';
import { theme } from '../styles/theme';

const STEPS = [
  { label: '얼굴을 분석하고 있어요',       icon: '🔍', duration: 3000 },
  { label: '다양한 스타일을 입히는 중',     icon: '🎨', duration: 4000 },
  { label: '디테일을 다듬고 있어요',        icon: '✨', duration: 3000 },
  { label: '거의 완성됐어요!',             icon: '🖼️', duration: 2000 },
];

export default function GeneratingProgress({ onTimeout }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  // 단계 진행
  useEffect(() => {
    if (currentStep >= STEPS.length) return;

    const timer = setTimeout(() => {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }, STEPS[currentStep].duration);

    return () => clearTimeout(timer);
  }, [currentStep]);

  // 프로그레스 바 애니메이션
  useEffect(() => {
    const totalDuration = STEPS.reduce((sum, s) => sum + s.duration, 0);
    const startTime = Date.now();

    const frame = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / totalDuration) * 95, 95); // 95%까지만 (완료는 외부에서)
      setProgress(pct);
      if (elapsed < totalDuration) {
        requestAnimationFrame(frame);
      }
    };

    const raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const step = STEPS[Math.min(currentStep, STEPS.length - 1)];

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* 아이콘 */}
        <div style={styles.iconArea}>
          <span
            key={currentStep}
            style={styles.icon}
          >
            {step.icon}
          </span>
        </div>

        {/* 텍스트 */}
        <h2
          key={`label-${currentStep}`}
          style={styles.label}
        >
          {step.label}
        </h2>

        {/* 프로그레스 바 */}
        <div style={styles.progressTrack}>
          <div
            style={{
              ...styles.progressFill,
              width: `${progress}%`,
            }}
          />
        </div>

        {/* 팁 */}
        <p style={styles.tip}>
          사진 한 장으로 여러 스타일을 만들어 드려요
        </p>
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
    minHeight: '100dvh',
    width: '100%',
    backgroundColor: theme.color.bg,
    padding: '40px 20px',
    boxSizing: 'border-box',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    width: '100%',
    maxWidth: '300px',
    animation: 'fadeIn 400ms cubic-bezier(0.16, 1, 0.3, 1) both',
  },
  iconArea: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: theme.color.primaryLight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  icon: {
    fontSize: '32px',
    animation: 'scaleIn 400ms cubic-bezier(0.16, 1, 0.3, 1) both',
  },
  label: {
    fontSize: theme.font.size.title,
    fontWeight: theme.font.weight.bold,
    color: theme.color.textPrimary,
    margin: '0 0 24px 0',
    letterSpacing: '-0.3px',
    lineHeight: theme.font.lineHeight.tight,
    animation: 'fadeIn 300ms cubic-bezier(0.16, 1, 0.3, 1) both',
  },
  progressTrack: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    backgroundColor: theme.color.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '3px',
    background: theme.color.primaryGrad,
    transition: 'width 300ms ease-out',
  },
  tip: {
    fontSize: theme.font.size.caption,
    color: theme.color.textTertiary,
    margin: '16px 0 0 0',
    lineHeight: theme.font.lineHeight.normal,
  },
};
