/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        condensed: ['"Roboto Condensed"', 'sans-serif'],
      },
      colors: {
        pragmatika: {
          DEFAULT: '#8cc63f',
          dark: '#76aa34',
          light: '#a4d95b',
          gray: '#81869a',
        },
      },
    },
  },
  plugins: [],
};