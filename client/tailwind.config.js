/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#0f172a',
        lavender: '#c7d2fe',
        blush: '#fef3f2'
      }
    }
  },
  plugins: []
};
