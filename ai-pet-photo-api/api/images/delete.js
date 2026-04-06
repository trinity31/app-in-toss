// Supabase Storage 이미지 삭제 API
// DELETE /api/images/delete?userId=xxx&filePath=xxx

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEFAULT_BUCKET = 'pet-newyear-images';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, filePath, bucket } = req.query;
  const BUCKET_NAME = bucket || DEFAULT_BUCKET;

  if (!userId || !filePath) {
    return res.status(400).json({ error: 'userId와 filePath는 필수입니다' });
  }

  // 보안: filePath가 userId로 시작하는지 확인 (다른 사용자 파일 삭제 방지)
  if (!filePath.startsWith(`${userId}/`)) {
    return res.status(403).json({ error: '권한이 없습니다' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[images/delete] Supabase 환경변수가 설정되지 않았습니다');
    return res.status(500).json({ error: '서버 설정 오류' });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('[images/delete] Supabase 삭제 실패:', error);
      return res.status(500).json({ error: '이미지 삭제 실패' });
    }

    return res.status(200).json({
      success: true,
      message: '이미지가 삭제되었습니다',
    });
  } catch (err) {
    console.error('[images/delete] 에러:', err);
    return res.status(500).json({ error: '이미지 삭제 중 오류 발생' });
  }
}
