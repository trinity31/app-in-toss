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
// active는 앱 primary 컬러(보라 #64119F, index.css --color-primary와 동일)와 일치
const ACTIVE_COLOR = '#64119F'
const INACTIVE_COLOR = colors.grey500

// 타로 첫 발견 유도용 NEW 배지 — 첫 진입 시각을 기록하고 이후 3일간 노출
const TAROT_FIRST_SEEN_KEY = 'fortunecat.tarot_first_seen_at'
const NEW_BADGE_DURATION_MS = 3 * 24 * 60 * 60 * 1000 // 3일

// 코치마크 툴팁: 사용자가 탭/풍선을 누른 적 있으면 영구 숨김
const COACHMARK_DISMISSED_KEY = 'fortunecat.tarot_coachmark_dismissed'

function getOrCreateFirstSeenAt() {
  try {
    const existing = window.localStorage.getItem(TAROT_FIRST_SEEN_KEY)
    if (existing) {
      const ts = Number.parseInt(existing, 10)
      if (Number.isFinite(ts) && ts > 0) return ts
    }
    const now = Date.now()
    window.localStorage.setItem(TAROT_FIRST_SEEN_KEY, String(now))
    return now
  } catch {
    // localStorage 실패 시 null — 배지 영구 노출 (정보 손실만, 동작은 정상)
    return null
  }
}

function isWithinNewWindow(firstSeenAt) {
  if (firstSeenAt === null) return true
  return Date.now() - firstSeenAt < NEW_BADGE_DURATION_MS
}

function readCoachmarkDismissed() {
  try {
    return window.localStorage.getItem(COACHMARK_DISMISSED_KEY) === '1'
  } catch {
    return false
  }
}

function writeCoachmarkDismissed() {
  try {
    window.localStorage.setItem(COACHMARK_DISMISSED_KEY, '1')
  } catch {
    // 무시
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
  // 플로팅 알약 형태: 좌우 inset 여백으로 엣지-투-엣지 제거, 바닥에서 띄움
  // safe-area는 pill 내부가 아닌 bottom offset에서 흡수 (D-06 변형)
  // base 24px — 앱 하단 고정 CTA 컨벤션과 일치, pill을 바닥에서 충분히 띄움
  bottom: 'calc(env(safe-area-inset-bottom) + 24px)',
  left: 16,
  right: 16,
  zIndex: 20,
  // 흰 pill — 파스텔 body(--color-bg-soft) 위에서 떠 보이도록 순백 유지
  background: '#ffffff',
  // 사방 elevation — 상단 분리선 제거 후 그림자로 분리
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
  // 알약(pill) 형태
  borderRadius: 24,
  // pill 내부 상하 패딩 — 너무 작지 않게 숨통 확보(safe-area는 bottom offset이 흡수)
  paddingTop: 6,
  paddingBottom: 6,
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
  gap: 3,
  // 4050 사용자 hit area 충족 + 플로팅 알약 — 상하 숨통 확보한 중간 높이
  minHeight: 52,
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

// 코치마크 툴팁: 타로 탭 위에 떠있는 안내 풍선 + 아래쪽 화살표
// 2개 균등 탭 가정 — 타로 탭 중심 = 좌측에서 75% 지점
const COACHMARK_BG = '#191F28'

const coachmarkContainerStyle = {
  position: 'absolute',
  bottom: '100%',
  left: '75%',
  transform: 'translateX(-50%)',
  marginBottom: 12,
  zIndex: 21,
}

const coachmarkBubbleStyle = {
  background: COACHMARK_BG,
  color: '#ffffff',
  fontSize: 13,
  fontWeight: 600,
  padding: '10px 14px',
  borderRadius: 12,
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.18)',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  border: 0,
  letterSpacing: -0.2,
  fontFamily: 'inherit',
}

const coachmarkArrowStyle = {
  position: 'absolute',
  bottom: -5,
  left: '50%',
  transform: 'translateX(-50%)',
  width: 0,
  height: 0,
  borderLeft: '6px solid transparent',
  borderRight: '6px solid transparent',
  borderTop: `6px solid ${COACHMARK_BG}`,
  pointerEvents: 'none',
}

export default function TabBar() {
  const location = useLocation()
  const navigate = useNavigate()

  // 타로 첫 발견 유도 — 첫 진입 시각으로부터 3일간 NEW 배지 + 코치마크 노출
  const [tarotIsNew, setTarotIsNew] = useState(false)
  const [coachmarkDismissed, setCoachmarkDismissed] = useState(true)
  useEffect(() => {
    const firstSeenAt = getOrCreateFirstSeenAt()
    setTarotIsNew(isWithinNewWindow(firstSeenAt))
    setCoachmarkDismissed(readCoachmarkDismissed())
  }, [])

  // D-05: 라우트별 숨김 — /saju, /newyear, /amulet에서는 null 반환
  if (!VISIBLE_PATHS.has(location.pathname)) {
    return null
  }

  // D-09: active 판정. /(HomePage)와 /tarot이 분리되어 있어 단순 매칭 충분.
  const isActive = (to) => location.pathname === to

  const dismissCoachmark = () => {
    writeCoachmarkDismissed()
    setCoachmarkDismissed(true)
  }

  // D-03: 탭 클릭 시 각 탭의 처음 화면으로 이동 (사주=/, 타로=/tarot)
  const handleTabClick = (to) => {
    if (to === '/tarot' && !coachmarkDismissed) {
      dismissCoachmark()
    }
    navigate(to)
  }

  // 코치마크는 사주 탭(/)에 머물 때 + NEW 윈도우 안 + 미해제 상태일 때만 노출
  const showCoachmark =
    tarotIsNew && !coachmarkDismissed && location.pathname === '/'

  return (
    <nav style={navStyle} aria-label="주요 메뉴">
      {showCoachmark && (
        <div style={coachmarkContainerStyle}>
          <button
            type="button"
            onClick={dismissCoachmark}
            style={coachmarkBubbleStyle}
            aria-label="새로 추가된 타로 안내 닫기"
          >
            ✨ 새로 추가된 타로!
          </button>
          <div style={coachmarkArrowStyle} />
        </div>
      )}
      <ul style={listStyle}>
        {TABS.map(({ to, label }) => {
          const active = isActive(to)
          const showNewBadge = to === '/tarot' && tarotIsNew
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
