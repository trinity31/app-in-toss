// Supabase Storage 업로드 API
// POST /api/images/upload
// Body: { imageBase64, userId, cardType }

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'pet-newyear-images';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageBase64, userId, cardType } = req.body;

  if (!imageBase64 || !userId) {
    return res.status(400).json({ error: 'imageBase64와 userId는 필수입니다' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[images/upload] Supabase 환경변수가 설정되지 않았습니다');
    return res.status(500).json({ error: '서버 설정 오류' });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Base64를 Buffer로 변환
    const imageBuffer = Buffer.from(imageBase64, 'base64');

    // 파일명 생성: userId/timestamp_cardType.png
    const timestamp = Date.now();
    const fileName = `${userId}/${timestamp}_${cardType || 'unknown'}.png`;

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: false,
      });

    if (error) {
      console.error('[images/upload] Supabase 업로드 실패:', error);
      return res.status(500).json({ error: '이미지 업로드 실패' });
    }

    // Public URL 생성
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return res.status(200).json({
      success: true,
      imageId: fileName,
      url: urlData.publicUrl,
    });
  } catch (err) {
    console.error('[images/upload] 에러:', err);
    return res.status(500).json({ error: '이미지 업로드 중 오류 발생' });
  }
}
