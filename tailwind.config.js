/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#dfe8ff',
          200: '#c0d1ff',
          300: '#99b3ff',
          400: '#6f8efb',
          500: '#4b67f2',
          600: '#364bd0',
          700: '#2b3aa9',
          800: '#253186',
          900: '#222d6d',
        },
        secondary: '#14b8a6',
        muted: '#64748b',
        surface: '#0f172a',
      },
    },
  },
  plugins: [],
}
