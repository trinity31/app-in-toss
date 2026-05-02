// 복냥이 마스코트 — boknyang-tarot 프로토타입에서 SVG 포팅.
// 원본의 framer-motion 흔들기 애니메이션을 CSS @keyframes 로 대체 (UI-SPEC: framer-motion 도입 금지).

export default function Boknyang({ size = 200, waving = true }) {
  return (
    <div style={{ display: 'inline-block', lineHeight: 0 }}>
      <style>{`
        @keyframes boknyang-paw-wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-14deg); }
          50% { transform: rotate(0deg); }
          75% { transform: rotate(14deg); }
        }
        .boknyang-paw {
          transform-box: fill-box;
          transform-origin: 50% 100%;
          animation: boknyang-paw-wave 2.4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .boknyang-paw { animation: none; }
        }
      `}</style>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="복냥이 마스코트"
        role="img"
      >
        {/* 후광 */}
        <circle cx="100" cy="100" r="92" fill="oklch(0.92 0.06 80 / 0.55)" />
        <circle cx="100" cy="100" r="78" fill="oklch(0.94 0.04 350)" />

        {/* 몸통 */}
        <ellipse cx="100" cy="140" rx="48" ry="36" fill="white" />
        {/* 다리 */}
        <ellipse cx="82" cy="170" rx="10" ry="8" fill="white" />
        <ellipse cx="118" cy="170" rx="10" ry="8" fill="white" />

        {/* 머리 */}
        <circle cx="100" cy="92" r="46" fill="white" />
        {/* 귀 */}
        <path d="M62 70 L72 40 L86 66 Z" fill="white" />
        <path d="M138 70 L128 40 L114 66 Z" fill="white" />
        <path d="M68 64 L74 50 L82 64 Z" fill="oklch(0.88 0.08 20)" />
        <path d="M132 64 L126 50 L118 64 Z" fill="oklch(0.88 0.08 20)" />

        {/* 볼 */}
        <circle cx="74" cy="100" r="7" fill="oklch(0.86 0.09 20 / 0.7)" />
        <circle cx="126" cy="100" r="7" fill="oklch(0.86 0.09 20 / 0.7)" />

        {/* 눈 */}
        <g fill="oklch(0.32 0.05 295)">
          <ellipse cx="84" cy="88" rx="3.5" ry="5" />
          <ellipse cx="116" cy="88" rx="3.5" ry="5" />
        </g>
        <circle cx="85.2" cy="86" r="1.2" fill="white" />
        <circle cx="117.2" cy="86" r="1.2" fill="white" />

        {/* 코 + 입 */}
        <path d="M98 98 L102 98 L100 101 Z" fill="oklch(0.78 0.09 295)" />
        <path d="M100 101 Q96 106 92 103" stroke="oklch(0.32 0.05 295)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <path d="M100 101 Q104 106 108 103" stroke="oklch(0.32 0.05 295)" strokeWidth="1.6" strokeLinecap="round" fill="none" />

        {/* 이마 별 */}
        <text x="100" y="62" textAnchor="middle" fontSize="14">✨</text>

        {/* 든 발 (CSS keyframe wobble) */}
        <g className={waving ? 'boknyang-paw' : undefined}>
          <ellipse cx="58" cy="118" rx="12" ry="10" fill="white" />
          <circle cx="54" cy="114" r="2" fill="oklch(0.88 0.08 20 / 0.8)" />
          <circle cx="60" cy="112" r="2" fill="oklch(0.88 0.08 20 / 0.8)" />
        </g>

        {/* 다른 쪽 발 (앞에 모음) */}
        <ellipse cx="138" cy="138" rx="11" ry="9" fill="white" />

        {/* 목에 방울 */}
        <circle cx="100" cy="128" r="6" fill="oklch(0.92 0.12 85)" />
        <circle cx="100" cy="128" r="2" fill="oklch(0.6 0.12 60)" />
      </svg>
    </div>
  );
}
