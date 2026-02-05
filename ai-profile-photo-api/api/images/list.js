// Supabase Storage 목록 조회 API
// GET /api/images/list?userId=xxx

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'newyear-images';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'userId는 필수입니다' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[images/list] Supabase 환경변수가 설정되지 않았습니다');
    return res.status(500).json({ error: '서버 설정 오류' });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // userId 폴더 내의 파일 목록 조회
    const { data: files, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(userId, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('[images/list] Supabase 목록 조회 실패:', error);
      return res.status(500).json({ error: '이미지 목록 조회 실패' });
    }

    // 파일 정보를 URL과 함께 반환
    const images = (files || [])
      .filter(file => file.name.endsWith('.png'))
      .map(file => {
        const filePath = `${userId}/${file.name}`;
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(filePath);

        // 파일명에서 cardType 추출: timestamp_cardType.png
        const nameParts = file.name.replace('.png', '').split('_');
        const cardType = nameParts.length > 1 ? nameParts.slice(1).join('_') : 'unknown';

        return {
          id: filePath,
          url: urlData.publicUrl,
          cardType,
          createdAt: file.created_at,
        };
      });

    return res.status(200).json({
      success: true,
      images,
    });
  } catch (err) {
    console.error('[images/list] 에러:', err);
    return res.status(500).json({ error: '이미지 목록 조회 중 오류 발생' });
  }
}
