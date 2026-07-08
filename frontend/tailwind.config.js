/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Thème sombre + vert principal
        brand: {
          50: '#e9fbef',
          100: '#c9f5d8',
          200: '#95ecb5',
          300: '#5ade8e',
          400: '#28c96a',
          500: '#10b04f',
          600: '#059140',
          700: '#067336',
          800: '#0a5a2e',
          900: '#0b4a28',
        },
        surface: {
          950: '#070b09',
          900: '#0b1210',
          850: '#0f1815',
          800: '#131f1b',
          700: '#1a2a24',
          600: '#24382f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px -6px rgba(40, 201, 106, 0.45)',
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
