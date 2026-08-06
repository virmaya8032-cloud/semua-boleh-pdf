/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        merah: {
          DEFAULT: "#E23B3B",
          600: "#D12C2C",
          700: "#B71F1F",
          50: "#FDECEC",
        },
        arang: {
          DEFAULT: "#1F2430",
          700: "#2B3040",
          500: "#4B5162",
        },
        kabus: "#F7F8FA",
      },
      fontFamily: {
        papar: ['"Sora"', "system-ui", "sans-serif"],
        badan: ['"Inter"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        kad: "0 1px 2px rgba(16,24,40,.04), 0 8px 24px -12px rgba(16,24,40,.18)",
        naik: "0 12px 32px -12px rgba(16,24,40,.28)",
      },
      keyframes: {
        naikLembut: { "0%": { opacity: 0, transform: "translateY(8px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        pusar: { to: { transform: "rotate(360deg)" } },
        denyut: { "0%,100%": { opacity: 1 }, "50%": { opacity: .4 } },
      },
      animation: {
        naik: "naikLembut .4s ease both",
        pusar: "pusar .8s linear infinite",
        denyut: "denyut 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
