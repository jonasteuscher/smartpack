/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", "[data-theme='dark']"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,jsx,js}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#05FF88",
          secondary: "#0000FE",
          midnight: "#111827"
        }
      },
      fontFamily: {
        headline: ["'Great Vibes'", "cursive"],
        body: ["'EB Garamond'", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"]
      },
      boxShadow: {
        elevated: "0 20px 45px -15px rgba(0,0,0,0.35)"
      }
    }
  },
  plugins: []
};
