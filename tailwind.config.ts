import type { Config } from "tailwindcss";

const navy = {
  50: "#EEF3FA",
  100: "#D9E4F3",
  200: "#B3C8E6",
  300: "#7FA0CF",
  400: "#4A74B3",
  500: "#264F8C",
  600: "#163A6E",
  700: "#0B2545",
  800: "#081C35",
  900: "#061526",
  950: "#040E1A",
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
        sans: ["var(--font-sans)", "system-ui", "Arial", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "Times New Roman", "serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Purane indigo/violet/purple classes ab navy ban jayengi
        indigo: navy,
        violet: navy,
        purple: navy,
        // Orange accent: bg-accent-500, text-accent-600 waghera
        accent: {
          50: "#FFF4EA",
          100: "#FFE6D0",
          200: "#FFCBA0",
          300: "#FDAB6B",
          400: "#FB923C",
          500: "#F97316",
          600: "#EA580C",
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12",
        },
      },
    },
  },
  plugins: [],
};
export default config;