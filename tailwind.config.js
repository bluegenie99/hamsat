/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // تفعيل الوضع المظلم باستخدام فئة CSS
  theme: {
    extend: {},
  },
  plugins: [],
}
