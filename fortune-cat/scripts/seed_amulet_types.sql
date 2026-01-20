-- amulet_types 시드 데이터
INSERT INTO amulet_types (code, title_ko, description_ko, icon, image_url, display_order, is_active) VALUES
  ('traditional_ink', '전통 부적 수묵 스타일', '먹선, 한지 질감, 고대 도형 중심', '🖌️', '/images/amulet-traditional-ink.png', 1, true),
  ('minimal_symbol', '미니멀 심볼 스타일', '오행 핵심 기호만 사용, 여백 강조', '⭕', '/images/amulet-minimal-symbol.png', 2, true),
  ('mandala', '만다라 구조 스타일', '중심 용신 + 반복 패턴, 명상·치유용', '🔮', '/images/amulet-mandala.png', 3, true),
  ('gold_ritual', '금박 의식(儀式) 스타일', '검정 배경 + 금색 문양, 재물·권위 강조', '✨', '/images/amulet-gold-ritual.png', 4, true),
  ('abstract_geometric', '추상 기하학 스타일', '삼각·원·격자 등 오행 기하로 구성', '🔷', '/images/amulet-abstract-geometric.png', 5, true),
  ('taoist', '도교·방술 스타일', '부호화된 문자, 봉인·결계 이미지', '☯️', '/images/amulet-taoist.png', 6, true),
  ('natural_element', '자연 원소 아트 스타일', '불·물·나무·돌 등 자연 질감 강조', '🌿', '/images/amulet-natural-element.png', 7, true),
  ('cyber_occult', '사이버 오컬트 스타일', '네온, 디지털 문양, 현대적 부적', '💜', '/images/amulet-cyber-occult.png', 8, true),
  ('totem_emblem', '토템·수호 문장 스타일', '방패형 구도, 보호·액막이 특화', '🛡️', '/images/amulet-totem-emblem.png', 9, true),
  ('daily_signature', '일주 시그니처 스타일', '특정 일주 전용 패턴 고정(컬렉션화)', '📜', '/images/amulet-daily-signature.png', 10, true)
ON CONFLICT (code) DO UPDATE SET
  title_ko = EXCLUDED.title_ko,
  description_ko = EXCLUDED.description_ko,
  icon = EXCLUDED.icon,
  image_url = EXCLUDED.image_url,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
