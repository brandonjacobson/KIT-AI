/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emergency: '#dc2626',
        accent: '#2563eb',
      },
    },
  },
  plugins: [],
}
