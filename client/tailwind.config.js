/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0edff', 100: '#e0dbfe', 200: '#c4b5fd', 300: '#a78bfa',
          400: '#8b6cf7', 500: '#6c5ce7', 600: '#5a4bd1', 700: '#4c3fb8',
          800: '#3e33a0', 900: '#2e2478',
        },
      },
      fontFamily: {
        heading: ['Outfit', 'Inter', 'sans-serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
    },
  },
  plugins: [],
}
