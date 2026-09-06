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
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // Teal primary
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        indigo: {
          500: '#6366f1',
          600: '#4f46e5',
        },
        risk: {
          stable: '#10b981',   // Emerald
          watch: '#f59e0b',    // Amber
          elevated: '#f97316', // Orange
          review: '#ef4444',   // Rose / Red
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
        'glass-hover': '0 12px 40px 0 rgba(0, 0, 0, 0.12)',
        'glow-teal': '0 0 25px -5px rgba(20, 184, 166, 0.3)',
      },
    },
  },
  plugins: [],
}
