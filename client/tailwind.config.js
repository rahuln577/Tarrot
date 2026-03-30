/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Identity
        gold: {
          DEFAULT: '#D4AF37',
          dark: '#C5A028',
        },
      },
      boxShadow: {
        goldGlow: '0 0 0 1px rgba(212,175,55,0.35), 0 0 24px rgba(212,175,55,0.35)',
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'ui-serif', 'Georgia', 'serif'],
        body: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

