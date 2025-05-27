/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./hamsat/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class', // تفعيل الوضع المظلم باستخدام فئة CSS
  theme: {
    extend: {},
  },
  plugins: [],
}
