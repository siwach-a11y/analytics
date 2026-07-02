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
        // Violet + fuchsia system on a deep indigo canvas. Primary = violet,
        // gradient partner = fuchsia, amber = warning, rose = alert/sold-out.
        hub: {
          blue: "#7c3aed", // violet-600 — primary accent / CTA
          "blue-light": "#2e1065", // violet-950
          teal: "#a855f7", // purple-500 — links / accents
          "teal-light": "#3b0764", // purple-950
          coral: "#f43f5e", // rose-500 — alert / sold-out / hot
          "coral-light": "#4c0519", // rose-950
          amber: "#f59e0b", // amber-500 — few-left / warning
          "amber-light": "#451a03", // amber-950
          purple: "#d946ef", // fuchsia-500 — gradient partner / glow
          "purple-light": "#4a044e", // fuchsia-950
          green: "#22c55e", // green-500 — available / success
          "green-light": "#052e16", // green-950
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 44px -8px rgba(139, 92, 246, 0.5)",
        card: "0 1px 2px rgba(0, 0, 0, 0.3), 0 8px 28px rgba(0, 0, 0, 0.35)",
        "card-hover":
          "0 10px 30px rgba(0, 0, 0, 0.4), 0 24px 60px rgba(139, 92, 246, 0.3)",
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
