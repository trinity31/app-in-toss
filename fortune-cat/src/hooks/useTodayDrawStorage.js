import { Storage } from '@apps-in-toss/web-framework';
import { useState, useCallback, useEffect } from 'react';
import * as Sentry from '@sentry/react';

const TODAY_DRAW_STORAGE_KEY = 'FORTUNE_CAT_TAROT_TODAY_DRAW';

// CONTEXT D-05: 손상된 데이터 정리 — JSON 파싱 실패 / date 누락 / card_id 누락 / date 형식 오류 → null 반환 + removeItem.
function isValidTodayDraw(draw) {
  if (!draw || typeof draw !== 'object') return false;
  const { date, card_id } = draw;
  if (typeof date !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  if (typeof card_id !== 'number') return false;
  if (!Number.isInteger(card_id)) return false;
  if (card_id < 0 || card_id > 21) return false; // 메이저 아르카나 22장 (Phase 3 D-08)
  return true;
}

/**
 * Phase 4 (CONTEXT D-04): todayDraw `{ date, card_id }` 를 Toss Storage 에 영속 저장한다.
 *
 * v1.0 useUserInfoStorage 패턴 미러:
 *   - mount 시 자동 load (loading=true → 결과 → false)
 *   - 손상 데이터는 removeItem 후 null 반환 (D-05)
 *   - Storage 미지원 환경(일반 브라우저, dev 미러)에서는 graceful degradation — todayDraw=null + 차단 없음 (D-15)
 *   - 저장 실패 시 Sentry 보고 + UI 차단 안 함 (D-16, D-17)
 *
 * @returns {{ loading: boolean, todayDraw: object|null, saveTodayDraw: function, clearTodayDraw: function }}
 */
export function useTodayDrawStorage() {
  const [todayDraw, setTodayDraw] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadTodayDraw = useCallback(async () => {
    setLoading(true);
    try {
      const jsonString = await Storage.getItem(TODAY_DRAW_STORAGE_KEY);
      console.log('[TarotStorage] 불러온 데이터:', jsonString);

      if (!jsonString) {
        setTodayDraw(null);
        return null;
      }

      let parsed;
      try {
        parsed = JSON.parse(jsonString);
      } catch (parseErr) {
        console.warn('[TarotStorage] JSON 파싱 실패, 손상 데이터 정리:', parseErr);
        try { await Storage.removeItem(TODAY_DRAW_STORAGE_KEY); } catch (e) { console.error('[TarotStorage] 손상 데이터 삭제 실패:', e); }
        setTodayDraw(null);
        return null;
      }

      if (!isValidTodayDraw(parsed)) {
        console.warn('[TarotStorage] 저장된 데이터가 유효하지 않습니다:', parsed);
        try { await Storage.removeItem(TODAY_DRAW_STORAGE_KEY); } catch (e) { console.error('[TarotStorage] 손상 데이터 삭제 실패:', e); }
        setTodayDraw(null);
        return null;
      }

      console.log('[TarotStorage] 유효한 데이터 로드 성공:', parsed);
      setTodayDraw(parsed);
      return parsed;
    } catch (error) {
      // D-15: Storage 미지원 환경 — graceful degradation. throw 하지 않고 null 반환.
      console.warn('[TarotStorage] todayDraw 로드 실패 (Storage 미지원 가능):', error);
      setTodayDraw(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveTodayDraw = useCallback(async (draw) => {
    try {
      console.log('[TarotStorage] 저장 시도:', draw);

      if (!isValidTodayDraw(draw)) {
        console.error('[TarotStorage] 유효하지 않은 데이터:', draw);
        throw new Error('유효하지 않은 todayDraw 입니다.');
      }

      const jsonString = JSON.stringify(draw);
      await Storage.setItem(TODAY_DRAW_STORAGE_KEY, jsonString);
      console.log('[TarotStorage] 저장 완료');
      setTodayDraw(draw);
      return true;
    } catch (error) {
      console.error('[TarotStorage] todayDraw 저장 실패:', error);
      // D-16/D-17: production 에서 Sentry 보고. UI 는 차단하지 않음 — 호출자가 false 반환을 무시할 수 있음.
      Sentry.captureException(error, { extra: { phase: 'tarot_storage_save' } });
      return false;
    }
  }, []);

  const clearTodayDraw = useCallback(async () => {
    try {
      await Storage.removeItem(TODAY_DRAW_STORAGE_KEY);
      setTodayDraw(null);
      return true;
    } catch (error) {
      console.error('[TarotStorage] todayDraw 삭제 실패:', error);
      Sentry.captureException(error, { extra: { phase: 'tarot_storage_clear' } });
      return false;
    }
  }, []);

  useEffect(() => {
    loadTodayDraw();
  }, [loadTodayDraw]);

  return {
    loading,
    todayDraw,
    saveTodayDraw,
    clearTodayDraw,
  };
}
