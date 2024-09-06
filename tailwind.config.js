/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'primary': '#E0F7FF',  // Light blue for background and empty spaces (60%)
          'secondary': '#204B72',  // Darker blue for focused buttons, borders, and text (30%)
          'accent': '#4AB3F4',  // Bright blue for buttons, icons, and accent elements (10%)
        }
      },
    },
    plugins: [],
  }
