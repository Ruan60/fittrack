/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#0a0b0d',
          900: '#111317',
          850: '#16191e',
          800: '#1c2026',
          700: '#2a2f37',
          600: '#3b414b',
          500: '#5b626e',
          400: '#8a919c',
          300: '#b4bac3',
          200: '#d9dde2',
          100: '#eef0f2',
        },
        lime: {
          300: '#dcfc7a',
          400: '#cbf94a',
          500: '#b6e82c',
          600: '#93bf1b',
        },
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
