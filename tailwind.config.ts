import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#191919",
        secondary: "#3076FF",
      },
      fontFamily: {
        mono: ["FS Mono", "sans-serif"],
      },
      backdropBlur: {
        "22": "22px",
      },
      backgroundImage: {
        "gradient-blue": "linear-gradient(180deg, #3076FF 0%, #1D49E5 100%)"
      },
    },
  },
  plugins: [],
};
export default config;
