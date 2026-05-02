/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        surface: '#F9FAFB',
        border: '#E5E7EB',
        primary: {
          DEFAULT: '#111827',
          muted: '#6B7280',
        },
        accent: {
          DEFAULT: '#F97316',
          hover: '#EA580C',
        },
        warning: '#FB923C',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

