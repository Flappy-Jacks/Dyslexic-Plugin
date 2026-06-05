/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./popup.html",
    "./src/**/*.{svelte,js,ts,jsx,tsx}", 
    "./*.svelte",
    "./*.js"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}