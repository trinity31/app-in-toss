// D-07 분기: TDS Tab은 상단 세그먼트 탭(size 옵션·indicator 스타일)이라 하단 탭바 의미·시각과 부적합 → Emotion 폴백 채택. 기존 코드베이스 관행(inline style)에 맞춰 React inline style로 구현. (TDS 카탈로그 grep 2026-04-30)
// D-05 라우트별 표시 정책: /, /tarot에서만 렌더, /saju·/newyear·/amulet에서는 null 반환.
// D-08 신규 의존성 금지: 아이콘 라이브러리·CSS-in-JS 헬퍼·애니메이션 라이브러리 추가 금지. 아이콘은 SVG path 자체 정의.
// D-09 active 강조: TDS 컬러 토큰 + 아이콘 fill(active) vs stroke-only(inactive). 레이블 굵기 동일 유지.
// D-10 즉시 전환: CSS 전환 효과 미사용, 애니메이션 라이브러리 미사용.
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { colors } from '@toss/tds-colors'

const TABS = [
  { to: '/', label: '사주' },
  { to: '/tarot', label: '타로' },
]

// D-05: 탭바는 /, /tarot에서만 렌더. /saju·/newyear·/amulet에서는 null 반환.
const VISIBLE_PATHS = new Set(['/', '/tarot'])

// D-09 active = 컬러 + fill, inactive = grey + stroke
const ACTIVE_COLOR = colors.blue500
const INACTIVE_COLOR = colors.grey500

// 타로 첫 발견 유도용 NEW 배지 — 한 번이라도 누른 적 있으면 숨김
const TAROT_VISITED_KEY = 'fortunecat.tarot_visited'

function readTarotVisited() {
  try {
    return window.localStorage.getItem(TAROT_VISITED_KEY) === '1'
  } catch {
    return false
  }
}

function writeTarotVisited() {
  try {
    window.localStorage.setItem(TAROT_VISITED_KEY, '1')
  } catch {
    // 무시 — 배지가 계속 보여도 critical 이슈 아님
  }
}

// 아이콘 SVG path: 사주(별 계열) + 타로(카드 계열) — TDS에 적합한 export 없어 자체 정의 (D-08 폴백).
function SajuIcon({ active }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 2.5l2.76 6.18 6.74.62-5.1 4.55 1.5 6.65L12 17.27l-5.9 3.23 1.5-6.65L2.5 9.3l6.74-.62L12 2.5z"
        fill={active ? ACTIVE_COLOR : 'none'}
        stroke={active ? ACTIVE_COLOR : INACTIVE_COLOR}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TarotIcon({ active }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="6"
        y="3"
        width="12"
        height="18"
        rx="2"
        fill={active ? ACTIVE_COLOR : 'none'}
        stroke={active ? ACTIVE_COLOR : INACTIVE_COLOR}
        strokeWidth="1.6"
      />
      <path
        d="M12 7l3 5-3 5-3-5 3-5z"
        fill={active ? '#ffffff' : 'none'}
        stroke={active ? '#ffffff' : INACTIVE_COLOR}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function getIcon(to, active) {
  if (to === '/') return <SajuIcon active={active} />
  if (to === '/tarot') return <TarotIcon active={active} />
  return null
}

const navStyle = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 20,
  background: '#ffffff',
  // 발견성 강화: 더 진한 분리선 + 부드러운 elevation
  borderTop: `1px solid ${colors.grey300}`,
  boxShadow: '0 -2px 12px rgba(0, 0, 0, 0.06)',
  // D-06: TDS 기본 패턴 + safe-area 한 줄 (Mobile-AIT SafeAreaInsets 보강)
  paddingBottom: 'env(safe-area-inset-bottom)',
}

const listStyle = {
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'stretch',
  margin: 0,
  padding: 0,
  listStyle: 'none',
}

const itemStyle = {
  flex: 1,
  display: 'flex',
}

const buttonBaseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
  // 4050 사용자 hit area 충족
  minHeight: 56,
  padding: '8px 12px',
  background: 'transparent',
  border: 0,
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 500,
  // NEW 배지를 아이콘 우상단에 절대 배치하기 위한 컨테이너
  position: 'relative',
  // D-10: CSS transition 의도적으로 두지 않음
}

const iconWrapperStyle = {
  position: 'relative',
  display: 'inline-flex',
}

const newBadgeStyle = {
  position: 'absolute',
  top: -4,
  right: -10,
  background: colors.red500,
  color: '#ffffff',
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: 0.2,
  borderRadius: 8,
  padding: '1px 5px',
  lineHeight: 1.3,
  pointerEvents: 'none',
}

export default function TabBar() {
  const location = useLocation()
  const navigate = useNavigate()

  // 타로 첫 발견 유도 — localStorage에 방문 기록 남기면 NEW 배지 숨김
  const [tarotVisited, setTarotVisited] = useState(true)
  useEffect(() => {
    setTarotVisited(readTarotVisited())
  }, [])

  // D-05: 라우트별 숨김 — /saju, /newyear, /amulet에서는 null 반환
  if (!VISIBLE_PATHS.has(location.pathname)) {
    return null
  }

  // D-09: active 판정. /(HomePage)와 /tarot이 분리되어 있어 단순 매칭 충분.
  const isActive = (to) => location.pathname === to

  // D-03: 탭 클릭 시 각 탭의 처음 화면으로 이동 (사주=/, 타로=/tarot)
  const handleTabClick = (to) => {
    if (to === '/tarot' && !tarotVisited) {
      writeTarotVisited()
      setTarotVisited(true)
    }
    navigate(to)
  }

  return (
    <nav style={navStyle} aria-label="주요 메뉴">
      <ul style={listStyle}>
        {TABS.map(({ to, label }) => {
          const active = isActive(to)
          const showNewBadge = to === '/tarot' && !tarotVisited
          return (
            <li key={to} style={itemStyle}>
              <button
                type="button"
                onClick={() => handleTabClick(to)}
                style={{
                  ...buttonBaseStyle,
                  color: active ? ACTIVE_COLOR : INACTIVE_COLOR,
                }}
                aria-current={active ? 'page' : undefined}
                aria-label={showNewBadge ? `${label} (새 기능)` : label}
              >
                <span style={iconWrapperStyle}>
                  {getIcon(to, active)}
                  {showNewBadge && <span style={newBadgeStyle}>NEW</span>}
                </span>
                <span>{label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
