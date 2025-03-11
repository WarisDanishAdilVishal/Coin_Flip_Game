/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-pink': '#ff0080',
        'neon-blue': '#40e0d0',
        'neon-orange': '#ff8c00',
      }
    },
  },
  plugins: [],
}