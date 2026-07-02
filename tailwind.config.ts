import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Professional emerald + slate system. Primary accent = emerald,
        // gradient partner = teal, amber = warning, rose = alert/sold-out.
        hub: {
          blue: "#059669", // emerald-600 — primary accent / CTA
          "blue-light": "#ecfdf5", // emerald-50
          teal: "#047857", // emerald-700 — headings / links
          "teal-light": "#d1fae5", // emerald-100
          coral: "#e11d48", // rose-600 — alert / sold-out / hot
          "coral-light": "#fff1f2", // rose-50
          amber: "#b45309", // amber-700 — few-left / warning
          "amber-light": "#fffbeb", // amber-50
          purple: "#0d9488", // teal-600 — gradient partner / accents
          "purple-light": "#f0fdfa", // teal-50
          green: "#065f46", // emerald-800 — deep / available
          "green-light": "#d1fae5", // emerald-100
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(5, 150, 105, 0.3)",
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 6px 20px rgba(15, 23, 42, 0.07)",
        "card-hover":
          "0 6px 16px rgba(15, 23, 42, 0.08), 0 20px 48px rgba(5, 150, 105, 0.14)",
      },
      animation: {
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
