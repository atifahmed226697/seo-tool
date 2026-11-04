import type { Config } from "tailwindcss";

const mint = {
  50: "#EFF7F6",
  100: "#DBEEEC",
  200: "#BDDEDA",
  300: "#9CC9C3",
  400: "#679C94",
  500: "#3C7269",
  600: "#305C55",
  700: "#244943",
  800: "#193632",
  900: "#162522",
  950: "#101A17",
};

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "Arial", "sans-serif"],
        serif: ["var(--font-manrope)", "system-ui", "Arial", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        indigo: mint,
        violet: mint,
        purple: mint,
        accent: {
          50: "#F8F4FF",
          100: "#ECE9FC",
          200: "#E1D1FB",
          300: "#C090FE",
          400: "#9161C8",
          500: "#7445A4",
          600: "#62358F",
          700: "#502878",
          800: "#3D205B",
          900: "#2E1746",
        },
      },
    },
  },
  plugins: [],
};
export default config;