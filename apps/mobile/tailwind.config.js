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
        ink: "#1A1A1A",
        muted: "#666666",
        faint: "#999999",
        line: "#E5E5E5",
        canvas: "#F7F7F7",
        danger: "#D93025",
        link: "#2563EB",
        verified: "#2E7D32",
        verifiedBg: "#E8F5E9",
      },
    },
  },
  plugins: [],
};
