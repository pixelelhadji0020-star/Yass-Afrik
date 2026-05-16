/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          light: '#F3E5AB',
          DEFAULT: '#C5A059',
          dark: '#9A7B3E',
       },
        brandBlack: '#0A0A0A',
      }
    },
  },
  plugins: [],
}