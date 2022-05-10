const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        transparent: "transparent",
        current: "currentColor",
        brand: {
          50: "#E5CCF6",
          100: "#CFA3EF",
          200: "#BA7AE9",
          300: "#A552E2",
          400: "#9029DB",
          500: "#7B00D4",
          600: "#6700B2",
          700: "#530090",
          800: "#40006F",
          900: "#2C004C",
        },
      },
      strokeWidth: {
        5: "5px",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
