import type { Config } from "tailwindcss";

// Brand colors arrive at runtime as CSS variables (src/hooks/useBrand.ts
// sets --brand-primary / --brand-bg / --brand-text from GET /brand/).
// Use the `brand-*` utilities anywhere and they follow your Supramono brand.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "brand-primary": "var(--brand-primary, #4f46e5)",
        "brand-bg": "var(--brand-bg, #eef2ff)",
        "brand-text": "var(--brand-text, #111827)",
      },
    },
  },
  plugins: [],
} satisfies Config;
