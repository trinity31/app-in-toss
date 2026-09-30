import { useEffect, useState } from "react";
import { fetchHomeBanners } from "../lib/homeBanners";

export function useHomeBanners(client, entryKey) {
  const [banners, setBanners] = useState([]);
  useEffect(() => {
    let sequence = 0;
    let pending;
    const refresh = async () => {
      const request = ++sequence;
      pending?.abort();
      pending = new AbortController();
      setBanners([]);
      const next = await fetchHomeBanners(client, { signal: pending.signal });
      if (request === sequence) setBanners(next);
    };
    const onForeground = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const onPageShow = (event) => {
      if (event.persisted) refresh();
    };
    refresh();
    document.addEventListener("visibilitychange", onForeground);
    window.addEventListener("focus", onForeground);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      ++sequence;
      pending?.abort();
      document.removeEventListener("visibilitychange", onForeground);
      window.removeEventListener("focus", onForeground);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [client, entryKey]);
  return banners;
}
