import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 디버그 로그를 Supabase에 저장 (fire-and-forget, await 하지 않음)
export function logDebug(stage, orderId, data = {}) {
  supabase
    .from("debug_logs")
    .insert({ stage, order_id: orderId, data })
    .then(({ error }) => {
      if (error) console.warn("[logDebug] 저장 실패:", error);
    });
}

export function getMenuImageUrl(imagePath) {
  // "/images/food-fortune.png" -> "food-fortune.png"
  const fileName = imagePath.replace("/images/", "");
  const { data } = supabase.storage.from("menu_images").getPublicUrl(fileName);
  return data.publicUrl;
}

export function getAmuletStyleImageUrl(themeType) {
  const fileName = `${themeType}_1.png`;
  const { data } = supabase.storage.from("amulet-menu").getPublicUrl(fileName);
  return data.publicUrl;
}

export function getAmuletIntroImageUrl() {
  const { data } = supabase.storage.from("amulet-menu").getPublicUrl("amulet_images.png");
  return data.publicUrl;
}

export function getOgImageUrl() {
  const { data } = supabase.storage.from("menu_images").getPublicUrl("og_image.png");
  return data.publicUrl;
}

// 부적 주문 제한 설정 (기본값, Supabase에서 가져오지 못할 경우 사용)
export const DEFAULT_DAILY_ORDER_LIMIT = 50;
export const DEFAULT_LOW_STOCK_THRESHOLD = 10;

// Supabase에서 부적 주문 설정 가져오기
export async function getAmuletConfig() {
  try {
    const { data, error } = await supabase
      .from("app_config")
      .select("key, value")
      .in("key", ["amulet_daily_order_limit", "amulet_low_stock_threshold"]);

    if (error) {
      console.error("[supabase] app_config 조회 실패:", error);
      return {
        dailyOrderLimit: DEFAULT_DAILY_ORDER_LIMIT,
        lowStockThreshold: DEFAULT_LOW_STOCK_THRESHOLD,
      };
    }

    const config = {
      dailyOrderLimit: DEFAULT_DAILY_ORDER_LIMIT,
      lowStockThreshold: DEFAULT_LOW_STOCK_THRESHOLD,
    };

    (data || []).forEach((row) => {
      if (row.key === "amulet_daily_order_limit") {
        config.dailyOrderLimit =
          parseInt(row.value) || DEFAULT_DAILY_ORDER_LIMIT;
      } else if (row.key === "amulet_low_stock_threshold") {
        config.lowStockThreshold =
          parseInt(row.value) || DEFAULT_LOW_STOCK_THRESHOLD;
      }
    });

    return config;
  } catch (err) {
    console.error("[supabase] app_config 조회 에러:", err);
    return {
      dailyOrderLimit: DEFAULT_DAILY_ORDER_LIMIT,
      lowStockThreshold: DEFAULT_LOW_STOCK_THRESHOLD,
    };
  }
}

/**
 * tarot_cards 테이블에서 22장 메이저 아르카나 카드 데이터를 id 오름차순으로 select.
 *
 * Phase 3 D-08: 7컬럼 (id/name_ko/name_en/emoji/image_path/keywords/message) 스키마.
 * Phase 3 D-09: TarotPage intro 단계 진입 시 1회 호출 → cardsData state에 캐시 → shuffle/result 0 latency.
 *
 * @returns {Promise<Array<{id: number, name_ko: string, name_en: string, emoji: string, image_path: string, keywords: string[], message: string}>>}
 *   22장 카드 객체 배열 (id 오름차순). 0행이면 빈 배열 반환 (RLS 정책 누락 시 — Pitfall 3 회피용 호출 측 검증 필요).
 * @throws {Error} Supabase 네트워크/권한 에러. 호출 측에서 try/catch + Sentry.captureException 처리.
 */
export async function fetchTarotCards() {
  const { data, error } = await supabase
    .from('tarot_cards')
    .select('id, name_ko, name_en, emoji, image_path, keywords, message')
    .order('id', { ascending: true });
  if (error) {
    console.error('[supabase] fetchTarotCards 실패:', error);
    throw error;
  }
  return data || [];
}

export async function getTodayOrderCount() {
  // 한국 시간 기준 오늘 00:00:00 (UTC로 변환)
  const now = new Date();
  const koreaOffsetMs = 9 * 60 * 60 * 1000; // 9시간 (밀리초)

  // 현재 UTC 시간에 9시간을 더해서 한국 시간 계산
  const koreaTimeNow = new Date(now.getTime() + koreaOffsetMs);

  // 한국 날짜의 연/월/일 추출 (UTC 메서드 사용)
  const year = koreaTimeNow.getUTCFullYear();
  const month = koreaTimeNow.getUTCMonth();
  const day = koreaTimeNow.getUTCDate();

  // 한국 시간 해당 날짜 00:00:00을 UTC로 변환
  const todayStartUTC = new Date(Date.UTC(year, month, day) - koreaOffsetMs);

  console.log("[supabase] getTodayOrderCount 기준 시간:", {
    now: now.toISOString(),
    koreaDate: `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    todayStartUTC: todayStartUTC.toISOString(),
  });

  const { count, error } = await supabase
    .from("amulet_orders")
    .select("*", { count: "exact", head: true })
    .gte("created_at", todayStartUTC.toISOString());

  console.log("[supabase] getTodayOrderCount 결과:", { count, error });

  if (error) throw error;
  return count || 0;
}
