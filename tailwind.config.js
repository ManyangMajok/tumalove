/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'shikilia-brand': '#E0AA3E', // Gold
        'shikilia-green': '#065F46', // Deep M-Pesa Green
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Ensure you have a nice font
      }
    },
  },
  plugins: [],
}