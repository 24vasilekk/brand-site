import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        charcoal: "#8A72B1",
        ivory: "#F3F0E7"
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        }
      },
      animation: {
        marquee: "marquee 16s linear infinite"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(138, 114, 177, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
