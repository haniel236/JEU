/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Thème clair + vert principal
        brand: {
          50: '#ecfdf3',
          100: '#d1fadf',
          200: '#a6f4c5',
          300: '#6ce9a6',
          400: '#32d583',
          500: '#12b76a',
          600: '#039855',
          700: '#027a48',
          800: '#05603a',
          900: '#054f31',
        },
        // Neutres clairs (du plus clair au plus soutenu)
        surface: {
          950: '#f4f8f6',
          900: '#ffffff',
          850: '#f9fbfa',
          800: '#eef3f0',
          700: '#e4ebe7',
          600: '#d3ddd7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 12px 32px -12px rgba(3, 152, 85, 0.35)',
        card: '0 1px 2px rgba(16, 24, 40, 0.04), 0 12px 28px -16px rgba(16, 24, 40, 0.18)',
        'card-hover': '0 8px 24px -8px rgba(3, 152, 85, 0.22)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'scale-in': 'scale-in 0.25s ease-out',
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
};
