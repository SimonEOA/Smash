import type { Config } from "tailwindcss";

const plugin = require("tailwindcss/plugin");

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        wiggle: {
          "0%, 30%, 70%, 100%": { transform: "rotate(-5deg)" },
          "15%, 50%, 85%": { transform: "rotate(5deg)" },
        },
      },
      animation: {
        wiggle: "wiggle 0.7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
