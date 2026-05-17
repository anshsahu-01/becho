/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        muted: "#666666",
        faint: "#666666",
        line: "#EEEEEE",
        canvas: "#FFFFFF",
        danger: "#FF4C3B",
        link: "#111111",
        verified: "#111111",
        verifiedBg: "#FFFFFF",
      },
    },
  },
  plugins: [],
};
