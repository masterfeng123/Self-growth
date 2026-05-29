/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        surface: {
          900: '#0d1117',
          800: '#161b22',
          700: '#21262d',
          600: '#30363d',
        },
      },
      fontFamily: {
        sans: ['"Inter"', '"Noto Sans TC"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
