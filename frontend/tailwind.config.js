/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0284c7',
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
        },
        slate: {
          850: '#111827',
          950: '#030712',
        }
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
        'glass-dark': 'linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(30, 41, 59, 0.4) 100%)',
        'hero-radial': 'radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.15) 0%, rgba(15, 23, 42, 0) 70%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.25)',
        'glow-valid': '0 0 25px -5px rgba(34, 197, 94, 0.4)',
        'glow-invalid': '0 0 25px -5px rgba(239, 68, 68, 0.4)',
        'glow-warning': '0 0 25px -5px rgba(234, 179, 8, 0.4)',
      }
    },
  },
  plugins: [],
}
