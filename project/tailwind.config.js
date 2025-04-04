/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FFA500', // Orange from logo
          light: '#FFB733',
          dark: '#CC8400',
        },
        secondary: {
          DEFAULT: '#F5F0E6', // Soft cream
          light: '#FAF7F2',
          dark: '#E5D9C3',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Montserrat', 'sans-serif'],
      },
      keyframes: {
        bounceRight: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(25%)' },
        }
      },
      animation: {
        'bounce-right': 'bounceRight 1s infinite',
      },
      width: {
        'dashboard-card': '200px',
      },
      height: {
        'dashboard-card': '345px',
      }
    },
  },
  plugins: [],
};