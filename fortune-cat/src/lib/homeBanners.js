export const HOME_BANNER_TIMEOUT_MS = 15000;
export const HOME_BANNER_COLUMNS =
  "id,key,is_active,display_order,surfaces,icon,eyebrow,title,description,cta,color_start,color_end,action_type,menu_source,menu_code";
const MENU_COLUMNS = "code,theme_type,reading_type,title_ko,is_active";
const SURFACES = new Set(["web", "android", "toss"]);
const COLOR = /^#[0-9a-fA-F]{6}$/;
const text = (value, max = Infinity) =>
  typeof value === "string" && value.trim().length > 0 && value.length <= max;

function bannerId(value) {
  if (typeof value === "number" && Number.isSafeInteger(value) && value > 0) {
    return BigInt(value);
  }
  if (typeof value === "string" && /^[1-9]\d{0,18}$/.test(value)) {
    const id = BigInt(value);
    if (id <= 9223372036854775807n) return id;
  }
  return null;
}

export function resolveHomeBannerAction(row, menus) {
  if (row.action_type === "tarot_deep") {
    return row.menu_source === null && row.menu_code === null
      ? { to: "/tarot?mode=deep" }
      : null;
  }
  if (row.action_type !== "menu" ||
      !["ai_saju", "new_year"].includes(row.menu_source) ||
      !text(row.menu_code, 100)) return null;
  const sourceMenus = menus[row.menu_source];
  const menu = (Array.isArray(sourceMenus) ? sourceMenus : []).find((item) =>
    item?.is_active === true && item.code === row.menu_code &&
    text(item.theme_type) && text(item.reading_type) && text(item.title_ko));
  if (!menu) return null;
  return {
    selectedType: {
      fortuneType: menu.code,
      themeType: menu.theme_type,
      readingType: menu.reading_type,
      fortuneTypeTitle: menu.title_ko,
    },
  };
}

export function validateHomeBanners(rows, menus = {}, surface = "toss") {
  if (!Array.isArray(rows) || !SURFACES.has(surface)) return [];
  const valid = [];
  for (const row of rows) {
    if (!row || bannerId(row.id) === null || !text(row.key, 100) ||
        row.is_active !== true || !Number.isInteger(row.display_order) ||
        row.display_order < -2147483648 || row.display_order > 2147483647 ||
        !Array.isArray(row.surfaces) || !row.surfaces.includes(surface) ||
        !row.surfaces.every((value) => SURFACES.has(value)) ||
        (row.action_type === "tarot_deep" && row.surfaces.includes("android")) ||
        !text(row.icon, 50) || !text(row.eyebrow, 200) || !text(row.title, 200) ||
        !text(row.description) || !text(row.cta, 200) ||
        typeof row.color_start !== "string" || !COLOR.test(row.color_start) ||
        typeof row.color_end !== "string" || !COLOR.test(row.color_end)) continue;
    const action = resolveHomeBannerAction(row, menus);
    if (action) valid.push({
      id: row.id, key: row.key, display_order: row.display_order,
      icon: row.icon, eyebrow: row.eyebrow, title: row.title,
      description: row.description, cta: row.cta,
      bg: `linear-gradient(135deg, ${row.color_start} 0%, ${row.color_end} 100%)`,
      ...action,
    });
  }
  valid.sort((a, b) => {
    if (a.display_order !== b.display_order) return a.display_order - b.display_order;
    const left = bannerId(a.id), right = bannerId(b.id);
    return left < right ? -1 : left > right ? 1 : 0;
  });
  const keys = new Set();
  return valid.filter((row) => {
    if (keys.has(row.key)) return false;
    keys.add(row.key);
    return true;
  });
}

// A deadline still settles the UI if a transport ignores AbortSignal.
export async function fetchHomeBanners(client, { signal, timeoutMs = HOME_BANNER_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  if (signal?.aborted) controller.abort();
  let rejectAbort;
  const aborted = new Promise((_, reject) => { rejectAbort = reject; });
  const onAbort = () => rejectAbort(new Error("Banner fetch aborted"));
  controller.signal.addEventListener("abort", onAbort, { once: true });
  const timer = setTimeout(abort, Math.min(timeoutMs, HOME_BANNER_TIMEOUT_MS));
  try {
    if (controller.signal.aborted) return [];
    const queries = Promise.all([
      client.from("home_banners").select(HOME_BANNER_COLUMNS)
        .eq("is_active", true).contains("surfaces", ["toss"])
        .order("display_order", { ascending: true }).order("id", { ascending: true })
        .abortSignal(controller.signal),
      ...["ai_saju_types", "new_year_fortune_types"].map((table) =>
        client.from(table).select(MENU_COLUMNS).eq("is_active", true)
          .abortSignal(controller.signal)),
    ]);
    const [banners, aiSaju, newYear] = await Promise.race([queries, aborted]);
    if (controller.signal.aborted || banners.error) return [];
    return validateHomeBanners(banners.data, {
      ai_saju: aiSaju.error ? [] : aiSaju.data,
      new_year: newYear.error ? [] : newYear.data,
    });
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
    controller.signal.removeEventListener("abort", onAbort);
  }
}

export function navigateHomeBanner(slide, { navigate, trackClick, trackTarot }) {
  trackClick("hero_banner_click", { menu: slide.key }, slide.eyebrow);
  if (slide.to === "/tarot?mode=deep") {
    trackTarot("tarot_deep_entry_click", { from: "home_banner" });
    navigate(slide.to);
  } else {
    navigate("/newyear", { state: { selectedType: slide.selectedType } });
  }
}
