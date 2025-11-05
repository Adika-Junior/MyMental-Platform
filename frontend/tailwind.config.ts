import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        'gradient-start': '#b121f3',
        'gradient-mid1': '#08b1ff',
        'gradient-mid2': '#6e23cf',
        'gradient-end': '#44eee0',
      },
    },
  },
  plugins: [],
};

export default config;
