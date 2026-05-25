import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary brand
        "brand-green":        "#059669",  // emerald-600
        "brand-green-light":  "#10b981",  // emerald-500
        "brand-green-dark":   "#34d399",  // emerald-400 (on dark bg)
        "brand-blue":         "#0891b2",  // cyan-600
        "brand-blue-light":   "#06b6d4",  // cyan-500
        // Gold accent
        "brand-gold":         "#d97706",  // amber-600
        "brand-gold-light":   "#f59e0b",  // amber-500
        // High Contrast Backgrounds
        "brand-bg-light":     "#ffffff",  // pure white for maximum light mode contrast
        "brand-bg-dark":      "#0a0a0a",  // deep true black for maximum dark mode contrast
        "brand-card-dark":    "#171717",  // slightly lighter black for dark mode cards
        "brand-sidebar-dark": "#171717",
        // Navy tones (kept for accents)
        "brand-navy":         "#0f172a",
        "brand-navy-mid":     "#1e293b",
      },
      fontFamily: {
        sans: ["'Inter'", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["'Playfair Display'", "Georgia", "serif"],
      },
      backgroundImage: {
        "gradient-brand":  "linear-gradient(135deg, #059669 0%, #0891b2 100%)",
        "gradient-gold":   "linear-gradient(90deg, #d97706, #f59e0b, #d97706)",
        "gradient-hero":   "linear-gradient(160deg, #0f172a 0%, #064e3b 60%, #0f172a 100%)",
        "gradient-card":   "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))",
      },
      boxShadow: {
        "card":    "0 4px 24px rgba(0,0,0,0.08)",
        "card-lg": "0 8px 40px rgba(0,0,0,0.14)",
        "emerald": "0 4px 20px rgba(5,150,105,0.28)",
        "gold":    "0 4px 20px rgba(217,119,6,0.30)",
        "glow":    "0 0 40px rgba(5,150,105,0.15)",
      },
      keyframes: {
        "typing-bubble": {
          "0%, 80%, 100%": { transform: "scale(0)", opacity: "0.35" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition:  "200% center" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.6" },
        },
      },
      animation: {
        "typing-bubble": "typing-bubble 1.4s infinite ease-in-out both",
        "fade-in-up":    "fade-in-up 0.45s ease both",
        "shimmer":       "shimmer 1.6s infinite",
        "pulse-soft":    "pulse-soft 2s ease-in-out infinite",
      },
      borderRadius: {
        "xl":  "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
