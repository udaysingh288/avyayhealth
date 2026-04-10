import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: "#085041",
        teal: "#0D6B56",
        offwhite: "#FFF8E7",
        charcoal: "#1A1A1A",
        muted: "#6B7280",
        redalert: "#C0392B",
        amber: "#D97706",
      },
      fontFamily: {
        serif: ["var(--font-dm-serif)", "serif"],
        sans: ["var(--font-dm-sans)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
