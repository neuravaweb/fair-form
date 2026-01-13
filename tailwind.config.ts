import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'luxury-black': '#010101',
        'luxury-gold': '#C9A24D',
        'luxury-gold-light': '#D4AF37',
        'luxury-text': '#F5F5F5',
        'luxury-text-secondary': '#A0A0A0',
      },
      fontFamily: {
        'luxury-heading': ['Playfair Display', 'serif'],
        'luxury-body': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'gold-glow': 'goldGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        goldGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(201, 162, 77, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(201, 162, 77, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
