/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}", // if you ever add app dir
  ],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")], // ✅ Add typography plugin
};
