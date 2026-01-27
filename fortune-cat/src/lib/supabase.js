import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
