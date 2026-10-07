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
        'pragmatika-green': '#8cc63f',
        'pragmatika-dark': '#425766',
        'pragmatika-light': '#87a5b6',
        'pragmatika-black': '#000000',
        pragmatika: {
          DEFAULT: '#8cc63f',
          green: '#8cc63f',
          dark: '#425766',
          light: '#87a5b6',
          black: '#000000',
          gray: '#81869a',
        },
      },
    },
  },
  plugins: [],
};