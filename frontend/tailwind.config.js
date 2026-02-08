/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Nunito', 'Varela Round', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Kit.ai Medical Theme - Pastel & Soft
        kit: {
          red: '#FF8A8A',           // Pastel coral red
          'red-hover': '#FF7A7A',
          'red-light': '#FFE8E8',   // Very light pink for buttons
          'red-dark': '#CC6E6E',    // Darker red for dark mode
          teal: '#5CBFB3',          // Turquoise
          'teal-hover': '#4AAFA3',
          'teal-light': '#E0F5F3',  // Light turquoise for buttons
          'teal-dark': '#4A9F93',   // Darker teal for dark mode
          mint: '#F0F5F8',          // Soft background
          'mint-dark': '#E0EAF0',   // Slightly darker for hover

          // Dark mode colors
          dark: {
            bg: '#1A1D23',          // Deep charcoal background
            'bg-light': '#23272F',  // Lighter charcoal
            'bg-lighter': '#2C3139', // Even lighter charcoal
            text: '#E8EAED',        // Soft white text
            'text-muted': '#A0A4AB', // Muted text
          },
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'wave': 'wave 1.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'blink': 'blink 4s ease-in-out infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(15deg)' },
          '75%': { transform: 'rotate(-15deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        blink: {
          '0%, 90%, 100%': { transform: 'scaleY(1)' },
          '95%': { transform: 'scaleY(0.1)' },
        },
      },
    },
  },
  plugins: [],
}
