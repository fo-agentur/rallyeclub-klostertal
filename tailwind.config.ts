import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Restrained club / corporate palette — aligns with hero (deep red, warm neutrals)
        rally: {
          bg: '#0B0B10',
          card: '#12121A',
          accent: '#B91C1C',
          orange: '#C2410C',
          muted: '#A1A1AA',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-orbitron)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
