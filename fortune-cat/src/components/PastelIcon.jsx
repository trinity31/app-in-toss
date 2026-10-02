// 파스텔 아이콘 — 웹 fortunecat/app/core/components/pastel-icon.tsx 이식.
// 이모지 대신 파스텔 원형 배경 + 선 아이콘. 글리프 path 는 웹과 같은 값이다.

const TONES = {
  peach: ['var(--color-tone-peach)', 'var(--color-tone-peach-ink)'],
  lavender: ['var(--color-tone-lavender)', 'var(--color-tone-lavender-ink)'],
  butter: ['var(--color-tone-butter)', 'var(--color-tone-butter-ink)'],
  pink: ['var(--color-tone-pink)', 'var(--color-tone-pink-ink)'],
  sky: ['var(--color-tone-sky)', 'var(--color-tone-sky-ink)'],
  mint: ['var(--color-tone-mint)', 'var(--color-tone-mint-ink)'],
  leaf: ['var(--color-tone-leaf)', 'var(--color-tone-leaf-ink)'],
}

const GLYPHS = {
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  mirror: <><ellipse cx="12" cy="10" rx="5" ry="7" /><path d="M12 17v4M9 21h6M10 7.5a2.5 2.5 0 0 1 2-1.5" /></>,
  coin: <><circle cx="12" cy="12" r="9" /><path d="M12 7v10M9.5 9.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4" /></>,
  hearts: <><path d="M9 19s-6-3.8-6-8.6A3.4 3.4 0 0 1 9 8.2a3.4 3.4 0 0 1 6 2.2" /><path d="M15 21s-6-3.8-6-8.6a3.4 3.4 0 0 1 6-2.2 3.4 3.4 0 0 1 6 2.2C21 17.2 15 21 15 21z" /></>,
  people: <><circle cx="9" cy="8" r="3.5" /><circle cx="17" cy="9" r="2.5" /><path d="M2.5 20c1-3.5 3.5-5 6.5-5s5.5 1.5 6.5 5M15.5 14.5c2.5 0 4.5 1.5 5.5 4.5" /></>,
  sunrise: <path d="M3 18h18M6 18a6 6 0 0 1 12 0M12 6v3M5 11l1.5 1.5M19 11l-1.5 1.5M8 21h8" />,
  pulse: <><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /><path d="M7 12h3l1-2 2 4 1-2h3" /></>,
  leaf: <><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14z" /><path d="M5 19l7-7" /></>,
  palette: <><path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5S14 15 15 15h2a4 4 0 0 0 4-4c0-4.4-4-8-9-8z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7" r="1" /><circle cx="15" cy="7.5" r="1" /></>,
  number: <path d="M5 9h14M5 15h14M10 4l-2 16M16 4l-2 16" />,
  cards: <><rect x="4" y="5" width="11" height="15" rx="2" /><path d="M9 3h9a2 2 0 0 1 2 2v13" /></>,
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
  star: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />,
}

/** 카탈로그 code → 아이콘/톤 */
const BY_CODE = {
  daily_fortune: ['sun', 'peach'],
  ai_saju_personality: ['mirror', 'lavender'],
  ai_saju_wealth: ['coin', 'butter'],
  ai_saju_compatibility: ['hearts', 'pink'],
  ai_saju_relation: ['people', 'sky'],
  ai_saju_lateyear: ['sunrise', 'peach'],
  ai_saju_health: ['pulse', 'mint'],
  ai_saju_seasonal: ['leaf', 'leaf'],
  lucky_color: ['palette', 'lavender'],
  lucky_number: ['number', 'sky'],
}

/** DB 이모지 → 아이콘/톤 (code 매핑이 없을 때) */
const BY_EMOJI = {
  '🌞': ['sun', 'peach'], '☀️': ['sun', 'peach'], '🪞': ['mirror', 'lavender'],
  '💰': ['coin', 'butter'], '👩‍❤️‍👨': ['hearts', 'pink'], '💕': ['hearts', 'pink'],
  '❤️': ['hearts', 'pink'], '🎭': ['people', 'sky'], '🌅': ['sunrise', 'peach'],
  '🎯': ['pulse', 'mint'], '🍃': ['leaf', 'leaf'], '🍂': ['leaf', 'peach'],
  '🎨': ['palette', 'lavender'], '🔢': ['number', 'sky'], '🔮': ['cards', 'lavender'],
  '🌙': ['moon', 'lavender'], '⭐️': ['star', 'butter'], '✨': ['star', 'butter'],
}

const FALLBACK_TONES = ['peach', 'lavender', 'butter', 'pink', 'sky', 'mint']

export default function PastelIcon({ code, emoji, index = 0, size = 56, glyphSize = 28, style }) {
  const match = (code && BY_CODE[code]) || (emoji && BY_EMOJI[emoji.trim()])
  const tone = match ? match[1] : FALLBACK_TONES[index % FALLBACK_TONES.length]
  const [background, color] = TONES[tone]
  return (
    <span
      aria-hidden
      style={{
        width: size, height: size, flexShrink: 0, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background, color, ...style,
      }}
    >
      {match ? (
        <svg viewBox="0 0 24 24" width={glyphSize} height={glyphSize} fill="none"
          stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          {GLYPHS[match[0]]}
        </svg>
      ) : (
        <span style={{ fontSize: glyphSize * 0.85, lineHeight: 1 }}>{emoji || '🔮'}</span>
      )}
    </span>
  )
}
