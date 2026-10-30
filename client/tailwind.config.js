/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'deep-teal': {
          DEFAULT: '#224248',
          50: '#f0f5f6',
          100: '#dae6e8',
          200: '#b8ced2',
          300: '#8baeb5',
          400: '#5e8d97',
          500: '#43727c',
          600: '#355c65',
          700: '#2d4b53',
          800: '#224248', // Exact Deep Teal
          900: '#1a3338',
          950: '#102024'
        },
        'teal-mid': {
          DEFAULT: '#325E6A',
          50: '#f1f7f8',
          100: '#dcebf0',
          200: '#bcd9e2',
          300: '#90bfce',
          400: '#5d9eb4',
          500: '#325E6A', // Exact Teal
          600: '#2d535f',
          700: '#284651',
          800: '#243b44',
          900: '#20333b'
        },
        'aqua': {
          DEFAULT: '#44A1A4',
          50: '#eff9f9',
          100: '#d5f0f1',
          200: '#b0e3e5',
          300: '#7dd0d3',
          400: '#44A1A4', // Exact Aqua
          500: '#328588',
          600: '#286a6d',
          700: '#245659',
          800: '#224648',
          900: '#1f3b3d'
        },
        'orange-accent': {
          DEFAULT: '#FF9A00',
          50: '#fff9ed',
          100: '#fff1d4',
          200: '#ffe0a8',
          300: '#ffcb71',
          400: '#FF9A00', // Exact Orange Accent
          500: '#f28300',
          600: '#cc6200',
          700: '#a34502',
          800: '#833708',
          900: '#6c2f0a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(34, 66, 72, 0.08)',
        'card': '0 6px 24px -4px rgba(34, 66, 72, 0.12)',
        'floating': '0 12px 36px -6px rgba(34, 66, 72, 0.18)',
      }
    },
  },
  plugins: [],
}
