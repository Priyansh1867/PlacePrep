/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lilac: {
          DEFAULT: '#F8F8F9',
          50: '#FFFFFF',
          100: '#F8F8F9',
          200: '#ECECEF',
          300: '#DFE0E5',
          400: '#C5C6D1',
          500: '#9B9EB3',
        },
        darkblue: {
          DEFAULT: '#111439',
          950: '#0A0C24',
          900: '#111439',
          800: '#1A1E4F',
          700: '#232867',
          600: '#2F3685',
          500: '#3D45A6',
          400: '#545DC4',
        },
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5', // Primary
          700: '#4338CA',
          800: '#3730A3', // Primary Dark
          900: '#111439', // Dark Blue
        },
        surface: {
          bg: '#F8F8F9',
          card: '#FFFFFF',
          text: '#111439',
          subtext: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"IBM Plex Sans"', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
