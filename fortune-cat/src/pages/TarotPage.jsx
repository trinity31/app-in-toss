// Phase 2: /tarot 라우트의 빈 컨테이너 (Phase 3에서 currentPage 상태 머신으로 확장).
//          상태 단계 = 'intro' → 'shuffle' → 'result' (D-04). 본 페이즈는 'intro' placeholder만.
import { useState } from 'react'

export default function TarotPage() {
  // Phase 3 확장 포인트: setCurrentPage('shuffle' | 'result')로 단계 전환.
  // 본 페이즈는 'intro' 단계 placeholder만 노출하고 분기 로직은 두지 않는다.
  const [currentPage] = useState('intro')

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        // 탭바(높이 ~56px + safe-area)가 화면 하단에 fixed로 떠 있으므로
        // 컨테이너 하단 padding으로 컨텐츠가 가려지지 않게 buffer 확보 (D-06: TDS 기본 패턴 + safe-area는 TabBar가 처리)
        paddingBottom: 96,
      }}
      data-current-page={currentPage}
    >
      <p style={{ fontSize: 16, color: '#666' }}>타로 준비 중</p>
    </div>
  )
}
