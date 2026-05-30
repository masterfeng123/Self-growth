/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Surface hierarchy (research-backed: slight blue-tint near-black)
        surface: {
          900: '#0c0c0e',   // page background
          800: '#111113',   // sidebar, panels
          700: '#161618',   // cards, inputs
          600: '#242729',   // borders (hard)
          500: '#2e3033',   // hover states
        },
        // Gold accent — wealth theme, slightly refined
        gold: {
          300: '#fde68a',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      fontFamily: {
        sans: ['"Inter"', '"Noto Sans TC"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        sm:  '6px',
        DEFAULT: '8px',
        md:  '8px',
        lg:  '10px',
        xl:  '16px',
        '2xl': '20px',
      },
      transitionTimingFunction: {
        'spring':   'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'snappy':   'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '80':  '80ms',
        '150': '150ms',
        '250': '250ms',
      },
      letterSpacing: {
        tighter: '-0.03em',
        tight:   '-0.015em',
        snug:    '-0.008em',
        normal:  '0',
        wide:    '0.01em',
        wider:   '0.04em',
        widest:  '0.08em',
      },
    },
  },
  plugins: [],
}
