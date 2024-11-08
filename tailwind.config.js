/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#C4A484',
          dark: '#a07b31',
        },
        gray: {
          900: '#1C2833',
        }
      },
      fontFamily: {
        sans: ['Cinzel', 'serif'],
        cinzel: ['Cinzel', 'serif'],
      }
    },
  },
  plugins: [],
};