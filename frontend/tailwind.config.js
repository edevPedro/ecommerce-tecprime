/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#f8f9fa",
        primary: "#000000",
        "brand-orange": "#FF0000",
        "brand-black": "#1A1A1A",
        "brand-gray": "#E5E5E5",
        "brand-white": "#FFFFFF",
        "brand-yellow": "#FFD700",
        "brand-green": "#4CAF50",
        "brand-blue": "#0E1563",
        "brand-red": "#f12121ff",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        neu: "4px 4px 0px 0px #000000",
        "neu-sm": "2px 2px 0px 0px #000000",
        "neu-lg": "6px 6px 0px 0px #000000",
      },
      borderWidth: {
        3: "3px",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
    },
  },
  plugins: [],
};
