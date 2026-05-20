import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        racing: {
          DEFAULT: "#E10600",
          50: "#FFE5E3",
          100: "#FFCCC9",
          200: "#FF9993",
          300: "#FF665C",
          400: "#FF3326",
          500: "#E10600",
          600: "#B00500",
          700: "#800300",
          800: "#4F0200",
          900: "#1F0100",
        },
        ink: {
          DEFAULT: "#0A0A0A",
          soft: "#111111",
          muted: "#1A1A1A",
          line: "#262626",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-bebas)", "Impact", "sans-serif"],
      },
      letterSpacing: {
        wider: "0.05em",
        widest: "0.15em",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
