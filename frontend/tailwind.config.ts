/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        moa: {
          primary: '#D07856',
          hover: '#B8643D',
          light: '#FDF0E8',
          border: '#F2E8E0',
          muted: '#F2935C',
          text: '#262626',
          secondary: '#6B4F3A',
          subtle: '#9B7B6A',
        },
      },
    },
  },
  plugins: [],
};
