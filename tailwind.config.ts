import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f8ff",
          100: "#d9ebff",
          200: "#b3d8ff",
          300: "#86c1ff",
          400: "#59a3ff",
          500: "#2b85ff",
          600: "#1d66db",
          700: "#144db7",
          800: "#0b378d",
          900: "#062465"
        }
      }
    }
  },
  plugins: []
};

export default config;
