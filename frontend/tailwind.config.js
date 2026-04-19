export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: { bg: '#0f0f11', surface: '#18181b', card: '#1e1e24', border: '#2a2a35' },
        accent: { DEFAULT: '#6ee7b7', dark: '#059669' }
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'serif'],
        sans: ['Geist', 'sans-serif']
      }
    }
  },
  plugins: []
}