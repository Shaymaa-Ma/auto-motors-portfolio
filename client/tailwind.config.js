/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#0878D1",
          electric: "#19A7FF",
          "blue-dark": "#055DA5",
          "navy-deep": "#071A2B",
          navy: "#0D263D",
          "navy-soft": "#123550",
          bg: "#F4F8FC",
          "bg-soft": "#EDF4FA",
          text: "#16202A",
          "text-secondary": "#526476",
          "text-muted": "#7D91A5",
          border: "#DCE6EF",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 2px 8px rgba(7, 26, 43, 0.04)",
        card: "0 6px 20px rgba(7, 26, 43, 0.06)",
        hover: "0 14px 35px rgba(7, 26, 43, 0.12)",
        glow: "0 0 25px rgba(25, 167, 255, 0.25)",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "24px",
      },
    },
  },
  plugins: [],
};
