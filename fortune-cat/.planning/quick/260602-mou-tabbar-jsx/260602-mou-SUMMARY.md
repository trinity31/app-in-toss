---
quick_id: 260602-mou
title: 탭바를 토스 미니앱 브랜딩 가이드의 플로팅 형태로 전환
date: 2026-06-02
status: complete
---

# Quick Task 260602-mou — Summary

## 목표
토스 앱인토스 미니앱 브랜딩 가이드(§3 탭바)는 탭바 사용 시 "토스가 제공하는 플로팅 형태"를 직접 구현하도록 요구한다. 기존 `TabBar.jsx`는 풀폭 엣지-투-엣지 하단 고정 바라 토스 기본 하단 탭과 형태가 겹쳐 가이드 위반 상태였다. 이를 플로팅 알약(pill) 형태로 전환하고, 사용자 피드백을 반영해 시각 디테일을 다듬었다.

## 최종 결과 (사용자 UAT 승인 — 폰 실기기 확인)
- **플로팅 알약 탭바**: 좌우 inset 16px, 하단 `calc(env(safe-area-inset-bottom) + 24px)`(앱 CTA 컨벤션과 정렬), `borderRadius: 24`, 사방 elevation 그림자, `borderTop` 제거
- **pill 높이 70px**: navPadding 6 + 버튼 minHeight 52 / padding `8px 12px` / gap 3 (과대 86px ↔ 과소 58px 반복 조정 후 확정)
- **탭바 배경 흰색(#ffffff)** + **탭 화면 body 라벤더(`--color-bg-soft: #F7F0FE`)** — 흰 pill이 파스텔 body 위에 떠 보이도록. HomePage·TarotPage 컨테이너에 신규 토큰 적용(DRY)
- **퀵메뉴 칩 배경 #EBDCFA**: 파스텔 body 위 구분을 위해 `--color-primary-light`(#F4E6FF)보다 한 톤 진하게
- **탭 클릭 회색 하이라이트 제거**: 버튼에 `WebkitTapHighlightColor: transparent`(다른 `.tap-*` 요소와 동일 처리)
- **HomePage 하단 패딩 보정**: `0 20px 20px` → `0 20px calc(96px + env(safe-area-inset-bottom))` (플로팅 바 가림 방지)

## 보존된 기능 (회귀 없음)
- 사주/타로 2탭 구성, SajuIcon/TarotIcon, active 보라(#64119F)/inactive 회색
- NEW 배지, 코치마크 툴팁(좁아진 pill에서도 타로 탭 정확 지시), D-05 라우트별 표시(/, /tarot), D-10 즉시 전환(애니메이션 없음)
- 신규 의존성 0, inline style 유지 (D-08)

## 변경 파일
- `src/components/TabBar.jsx` — navStyle 플로팅화, 버튼 패딩/탭 하이라이트
- `src/index.css` — `--color-bg-soft` 토큰 신설
- `src/pages/HomePage.jsx` — 컨테이너 배경(라벤더) + 하단 패딩 + 퀵메뉴 칩 색
- `src/pages/TarotPage.jsx` — 컨테이너 배경(라벤더)

## 검증
- 오케스트레이터가 dev 서버 + headless browse로 모바일 뷰포트(390×844) 스크린샷 검증 (플로팅 형태·computed 스타일·콘텐츠 가림·active 컬러·NEW 배지·코치마크 위치·라우트 가드)
- 사용자가 토스 인앱 실기기에서 단계별 UAT 후 승인

## 커밋 (worktree → main `--no-ff` 병합)
- `a7d2f56` TabBar navStyle 플로팅 전환
- `0ad8a7b` HomePage 하단 패딩 보정
- `9229161` 내부 패딩 축소 / `b29dc3d` 하단 offset 12→24 / `bbc2c1a` 패딩 중간값(70px)
- `4dcf6b4` (중간) 탭바 라벤더 → `e8176fb` body 라벤더 + 탭바 흰색 복귀
- `e48093d` 퀵메뉴 칩 #EBDCFA
- `5d0045e` 탭 클릭 회색 하이라이트 제거
- merge `4f4a7a6`

## 후속 가능 항목 (이번 범위 밖)
- TarotPage 고양이 일러스트가 자체 흰 배경 에셋이라 라벤더 body 위에서 흰 사각으로 보임 — 필요 시 투명 배경 에셋으로 교체
- TarotShuffle/TarotResult 등 /tarot 하위 상태 화면 배경은 미변경(흰색 유지)
