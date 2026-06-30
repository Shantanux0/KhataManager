/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#C0392B',
          hover: '#A93226',
          light: '#FDECEA',
        },
        surface: '#FFFFFF',
        bg: '#FAFAFA',
        border: '#E4E4E7',
        text: {
          primary: '#0A0A0A',
          secondary: '#71717A',
          muted: '#A1A1AA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
