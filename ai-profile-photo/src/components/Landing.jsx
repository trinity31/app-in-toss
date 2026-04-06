import { useState } from "react";
import { Asset, ListRow } from "@toss/tds-mobile";
import { theme, primaryButton, secondaryButton } from "../styles/theme";
import { STYLE_SAMPLES } from "../config/styleSamples";

// professional, dating, sns 샘플에서 랜덤 9개 선택 (Fisher-Yates 셔플)
const allSamples = [
  ...STYLE_SAMPLES.professional,
  ...STYLE_SAMPLES.dating,
  ...STYLE_SAMPLES.sns,
];
const shuffled = [...allSamples];
for (let i = shuffled.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
}
const galleryImages = shuffled.slice(0, 9);

export default function Landing({ onUpload }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleCamera = () => {
    setIsSheetOpen(false);
    onUpload("camera");
  };

  const handleAlbum = () => {
    setIsSheetOpen(false);
    onUpload("album");
  };

  return (
    <div style={styles.container}>
      {/* 히어로 영역 */}
      <div style={styles.hero}>
        <p style={styles.badge}>AI 프로필 사진</p>
        <h1 style={styles.title}>
          나만의 특별한
          <br />
          프로필 사진
        </h1>
        <p style={styles.subtitle}>
          사진 한 장이면 충분해요.
          <br />
          다양한 스타일로 변신한 나를 만나보세요.
        </p>
      </div>

      {/* 샘플 갤러리 */}
      <div style={styles.gallery}>
        {galleryImages.map((item, i) => (
          <div
            key={item.id}
            style={{
              ...styles.galleryItem,
              animationDelay: `${i * 120}ms`,
            }}
          >
            <img
              src={item.sampleUrl}
              alt=""
              style={styles.galleryImage}
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* 안내 문구 */}
      <div style={styles.infoRow}>
        <div style={styles.infoDot} />
        <p style={styles.infoText}>얼굴이 잘 보이는 사진일수록 결과가 좋아요</p>
      </div>

      {/* CTA */}
      <div style={styles.ctaArea}>
        <button style={styles.ctaButton} onClick={() => setIsSheetOpen(true)}>
          사진 올리기
        </button>
        <p style={styles.ctaCaption}>첫 체험은 무료</p>
      </div>

      {/* 바텀 시트 — 사진 선택 */}
      {isSheetOpen && (
        <>
          <div style={styles.overlay} onClick={() => setIsSheetOpen(false)} />
          <div style={styles.sheet}>
            <div style={styles.sheetHandle} />
            <h3 style={styles.sheetTitle}>사진 선택</h3>

            <div style={styles.sheetList}>
              <ListRow
                onClick={handleCamera}
                left={
                  <div style={styles.sheetIcon}>
                    <Asset.Image
                      frameShape={Asset.frameShape.CleanW24}
                      backgroundColor="transparent"
                      src="https://static.toss.im/2d-emojis/png/4x/u1F4F8.png"
                      aria-hidden={true}
                      style={{ aspectRatio: "1/1" }}
                    />
                  </div>
                }
                contents={<span style={styles.sheetLabel}>사진 촬영</span>}
                withTouchEffect
              />
              <div style={styles.sheetDivider} />
              <ListRow
                onClick={handleAlbum}
                left={
                  <div style={styles.sheetIcon}>
                    <Asset.Image
                      frameShape={Asset.frameShape.CleanW24}
                      backgroundColor="transparent"
                      src="https://static.toss.im/2d-emojis/png/4x/u1F5BC.png"
                      aria-hidden={true}
                      style={{ aspectRatio: "1/1" }}
                    />
                  </div>
                }
                contents={<span style={styles.sheetLabel}>앨범에서 선택</span>}
                withTouchEffect
              />
            </div>

            <button
              style={styles.sheetCancel}
              onClick={() => setIsSheetOpen(false)}
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
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "100dvh",
    width: "100%",
    padding: "0 20px",
    paddingTop: "48px",
    paddingBottom: "120px",
    background: `linear-gradient(180deg, ${theme.color.primaryLight} 0%, ${theme.color.bg} 50%)`,
    boxSizing: "border-box",
  },

  /* ── 히어로 ���─ */
  hero: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    animation: "fadeUp 600ms cubic-bezier(0.16, 1, 0.3, 1) both",
  },
  badge: {
    display: "inline-block",
    padding: "6px 14px",
    backgroundColor: theme.color.primary,
    color: theme.color.textOnPrimary,
    borderRadius: theme.radius.full,
    fontSize: theme.font.size.caption,
    fontWeight: theme.font.weight.semibold,
    marginBottom: "16px",
    letterSpacing: "-0.2px",
  },
  title: {
    fontSize: theme.font.size.hero,
    fontWeight: theme.font.weight.bold,
    color: theme.color.textPrimary,
    lineHeight: theme.font.lineHeight.tight,
    letterSpacing: "-0.5px",
    margin: 0,
  },
  subtitle: {
    fontSize: theme.font.size.body,
    fontWeight: theme.font.weight.regular,
    color: theme.color.textSecondary,
    lineHeight: theme.font.lineHeight.normal,
    margin: "12px 0 0 0",
  },

  /* ── 갤러리 ── */
  gallery: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "8px",
    width: "100%",
    maxWidth: "360px",
    marginTop: "32px",
  },
  galleryItem: {
    aspectRatio: "3/4",
    borderRadius: theme.radius.md,
    overflow: "hidden",
    animation: "fadeUp 500ms cubic-bezier(0.16, 1, 0.3, 1) both",
  },
  galleryImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  /* ── 안내 ── */
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "20px",
    animation: "fadeIn 500ms 400ms cubic-bezier(0.16, 1, 0.3, 1) both",
  },
  infoDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: theme.color.primary,
    flexShrink: 0,
  },
  infoText: {
    fontSize: theme.font.size.caption,
    color: theme.color.textSecondary,
    margin: 0,
  },

  /* ── CTA ── */
  ctaArea: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "12px 20px",
    paddingBottom: "max(20px, env(safe-area-inset-bottom))",
    backgroundColor: "rgba(253, 251, 250, 0.9)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  ctaButton: {
    ...primaryButton,
    width: "100%",
    maxWidth: "400px",
    padding: "16px",
    fontSize: theme.font.size.body,
    borderRadius: theme.radius.md,
  },
  ctaCaption: {
    fontSize: theme.font.size.small,
    color: theme.color.textTertiary,
    margin: "8px 0 0 0",
  },

  /* ── 바텀 시트 ── */
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: theme.color.overlay,
    zIndex: 1000,
  },
  sheet: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    margin: "0 auto",
    width: "100%",
    maxWidth: "480px",
    backgroundColor: theme.color.surface,
    borderRadius: `${theme.radius.xl} ${theme.radius.xl} 0 0`,
    padding: "12px 20px",
    paddingBottom: "max(32px, env(safe-area-inset-bottom))",
    zIndex: 1001,
    animation: "fadeUp 300ms cubic-bezier(0.16, 1, 0.3, 1) both",
  },
  sheetHandle: {
    width: "36px",
    height: "4px",
    borderRadius: "2px",
    backgroundColor: theme.color.border,
    margin: "0 auto 16px",
  },
  sheetTitle: {
    fontSize: theme.font.size.heading,
    fontWeight: theme.font.weight.bold,
    color: theme.color.textPrimary,
    textAlign: "center",
    margin: "0 0 16px 0",
    letterSpacing: "-0.3px",
  },
  sheetList: {
    borderRadius: theme.radius.md,
    overflow: "hidden",
  },
  sheetIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    height: "24px",
  },
  sheetLabel: {
    fontSize: theme.font.size.body,
    fontWeight: theme.font.weight.semibold,
    color: theme.color.textPrimary,
    letterSpacing: "-0.2px",
  },
  sheetDivider: {
    height: "1px",
    backgroundColor: theme.color.divider,
    margin: "0 16px",
  },
  sheetCancel: {
    ...secondaryButton,
    width: "100%",
    marginTop: "12px",
  },
};
