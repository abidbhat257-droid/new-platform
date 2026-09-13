import type { Config } from "tailwindcss";
export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rose: { 50: "#fff7f8", 100: "#ffe9ed", 600: "#db2777", 700: "#be185d" },
      },
    },
  },
  plugins: [],
} satisfies Config;
