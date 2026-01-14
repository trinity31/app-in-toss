-- amulet_types 테이블 생성
CREATE TABLE IF NOT EXISTS amulet_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  title_ko VARCHAR(100) NOT NULL,
  description_ko TEXT,
  theme_type VARCHAR(50) NOT NULL,
  icon VARCHAR(10),
  image_url VARCHAR(255),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_amulet_types_is_active ON amulet_types(is_active);
CREATE INDEX IF NOT EXISTS idx_amulet_types_display_order ON amulet_types(display_order);

-- RLS 정책 설정
ALTER TABLE amulet_types ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "amulet_types_select_policy" ON amulet_types
  FOR SELECT USING (true);
