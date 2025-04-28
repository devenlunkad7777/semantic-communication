/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Custom colors for our application
        primary: {
          light: '#3B82F6', // blue-500
          dark: '#60A5FA',  // blue-400
        },
        background: {
          light: '#F3F4F6', // gray-100
          dark: '#1F2937',  // gray-800
        },
        card: {
          light: '#FFFFFF', // white
          dark: '#374151',  // gray-700
        }
      }
    },
  },
  plugins: [],
}