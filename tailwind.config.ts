import type { Config } from "tailwindcss";

// Brand colors sampled from the approved homepage mockup.
const brand = {
  blue: "#DDEDEC",
  lavender: "#ECE9FC",
  ink: "#181D16",
  forest: "#244943",
};

const brandScale = {
  50: brand.blue,
  100: brand.blue,
  200: brand.lavender,
  300: brand.lavender,
  400: brand.lavender,
  500: brand.ink,
  600: brand.ink,
  700: brand.ink,
  800: brand.ink,
  900: brand.ink,
  950: brand.ink,
};

// Neutral text, borders and backgrounds are tints of the brand ink.
const neutrals = {
  50: "#FAFAFA",
  100: "#F2F4F2",
  200: "#E6E7E6",
  300: "#C7C8C6",
  400: "#A2A4A1",
  500: "#666A65",
  600: "#525650",
  700: "#3D413B",
  800: "#2A2E28",
  900: brand.ink,
  950: brand.ink,
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
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        brand,
        slate: neutrals,
        indigo: brandScale,
        accent: { ...brandScale, 50: brand.lavender, 100: brand.lavender, 600: neutrals[700] },
      },
    },
  },
  plugins: [],
};
export default config;
