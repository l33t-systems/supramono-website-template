import { useEffect, useState } from "react";
import { supramono, Brand } from "../lib/supramono";

let cached: Brand | null = null;

/** Fetch brand once, apply colors as CSS variables, share across components. */
export function useBrand(): Brand | null {
  const [brand, setBrand] = useState<Brand | null>(cached);

  useEffect(() => {
    if (cached) return;
    supramono
      .getBrand()
      .then((b) => {
        cached = b;
        const root = document.documentElement;
        if (b.theme.accent_color) root.style.setProperty("--brand-primary", b.theme.accent_color);
        if (b.theme.accent_bg) root.style.setProperty("--brand-bg", b.theme.accent_bg);
        if (b.theme.accent_text) root.style.setProperty("--brand-text", b.theme.accent_text);
        if (b.product.name) document.title = b.product.name;
        setBrand(b);
      })
      .catch(() => setBrand(null));
  }, []);

  return brand;
}
