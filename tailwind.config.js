/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Logo colors
        'fl-red': '#FF5252',
        'fl-salmon': {
          light: '#FFA07A',
          DEFAULT: '#FF8C66',
        },
        'fl-yellow': {
          light: '#FFEB3B',
          DEFAULT: '#E6D335',
        },
        'fl-white': '#FFFFFF',
        'fl-gray': '#EDEDED',
      },
    },
  },
  plugins: [],
} 