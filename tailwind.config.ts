import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: '#2D3142',
        'parchment-dim': '#4A4F63',
        'parchment-muted': '#6B7086',
        gold: {
          DEFAULT: '#E8A317',
          light: '#F5C842',
          dark: '#B87C10',
          subtle: 'rgba(232,163,23,0.12)',
        },
        sapphire: {
          DEFAULT: '#0A369D',
          light: '#1A50C8',
          dark: '#072580',
          subtle: 'rgba(10,54,157,0.10)',
        },
        emerald: {
          DEFAULT: '#2a9d6b',
          light: '#3dbf82',
          dark: '#1e7250',
          subtle: 'rgba(42,157,107,0.12)',
        },
        slate: {
          evidence: '#5a7ab8',
          'evidence-subtle': 'rgba(90,122,184,0.12)',
        },
        canvas: {
          DEFAULT: '#FDFBF7',
          surface: '#FFFFFF',
          elevated: '#F5F2EA',
          border: '#E2DDD0',
          'border-light': '#C8BFA8',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', '"Noto Serif SC"', 'Georgia', 'serif'],
        serif: ['"Playfair Display"', '"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Inter"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #E8A317 0%, #F5C842 50%, #E8A317 100%)',
        'parchment-gradient': 'linear-gradient(180deg, #FDFBF7 0%, #F5F2EA 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
        'glass-hover': '0 16px 48px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.7)',
        'glass-heavy': '0 24px 80px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.7)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'scale-in': 'scaleIn 0.3s ease forwards',
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
