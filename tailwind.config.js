/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'Plus Jakarta Sans'", "sans-serif"],
      },
      colors: {
        brand: {
          50:  '#FFF4F1',
          100: '#FFE4DC',
          200: '#FFC5B0',
          300: '#FF9C7D',
          400: '#FF6D47',
          500: '#E84723',
          600: '#CC3A18',
          700: '#A82D12',
          800: '#8A230D',
          900: '#6E1C0A',
        },
        warm: {
          50:  '#FFFBF5',
          100: '#FFF5E8',
          200: '#F5EDD8',
          300: '#EAE0C8',
          400: '#D4C4A4',
          500: '#B8A482',
          600: '#9A845E',
          700: '#7A6240',
          800: '#5C4628',
          900: '#3A2C14',
        },
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'fade-down': {
          from: { opacity: '0', transform: 'translateY(-12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-right': {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to:   { transform: 'translateX(0)' },
        },
        'slide-out-right': {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(100%)' },
        },
        'slide-up': {
          from: { transform: 'translateY(100%)' },
          to:   { transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        'marquee': {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'ping-slow': {
          '75%, 100%': { transform: 'scale(2)', opacity: '0' },
        },
        'count-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up':        'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in':        'fade-in 0.4s ease-out forwards',
        'fade-down':      'fade-down 0.4s ease-out forwards',
        'slide-right':    'slide-right 0.4s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.35s cubic-bezier(0.32,0.72,0,1)',
        'slide-out-right':'slide-out-right 0.3s ease-in forwards',
        'slide-up':       'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in':       'scale-in 0.3s ease-out forwards',
        'float':          'float 4s ease-in-out infinite',
        'float-delay':    'float 4s ease-in-out 1s infinite',
        'spin-slow':      'spin-slow 8s linear infinite',
        'marquee':        'marquee 30s linear infinite',
        'bounce-subtle':  'bounce-subtle 2s ease-in-out infinite',
        'shimmer':        'shimmer 2s linear infinite',
        'count-up':       'count-up 0.5s ease-out forwards',
      },
      boxShadow: {
        'brand-sm': '0 2px 8px -1px rgba(232,71,35,0.15)',
        'brand':    '0 4px 20px -2px rgba(232,71,35,0.25)',
        'brand-lg': '0 8px 40px -4px rgba(232,71,35,0.35)',
        'warm':     '0 4px 24px -2px rgba(90,60,20,0.1)',
        'warm-lg':  '0 8px 40px -4px rgba(90,60,20,0.15)',
        'card':     '0 1px 3px rgba(60,40,10,0.06), 0 4px 16px rgba(60,40,10,0.06)',
        'card-hover':'0 8px 32px rgba(60,40,10,0.12)',
        'float':    '0 20px 60px -12px rgba(60,30,10,0.2)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255,255,255,0.5)',
      },
      backgroundImage: {
        'hero-grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
