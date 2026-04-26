/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0f172a',
          900: '#1e293b',
          800: '#334155',
          700: '#475569',
          600: '#64748b',
        },
        accent: {
          DEFAULT: '#7c3aed',
          light: '#a78bfa',
          dark: '#6d28d9',
        },
        success: { DEFAULT: '#22c55e', dark: '#16a34a', light: '#4ade80' },
        danger: { DEFAULT: '#ef4444', dark: '#dc2626', light: '#f87171' },
        warning: { DEFAULT: '#f59e0b', dark: '#d97706', light: '#fbbf24' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'gauge-fill': 'gaugeFill 1.2s ease-out forwards',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(20px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        slideInRight: { '0%': { opacity: 0, transform: 'translateX(20px)' }, '100%': { opacity: 1, transform: 'translateX(0)' } },
        gaugeFill: { '0%': { strokeDashoffset: 283 }, '100%': { strokeDashoffset: 'var(--gauge-offset)' } },
      },
      boxShadow: {
        glow: '0 0 20px rgba(124, 58, 237, 0.3)',
        'glow-lg': '0 0 40px rgba(124, 58, 237, 0.2)',
      },
    },
  },
  plugins: [],
}