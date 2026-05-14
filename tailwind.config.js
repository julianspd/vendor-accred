/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'asianow-red': '#E31E24',
        'asianow-blue': '#1A5FA8',
        'asianow-dark': '#0D3B73',
        'asianow-light': '#F5F7FA',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}
