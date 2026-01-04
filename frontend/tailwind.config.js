/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'spa-bg': '#F9FAFB',
        'spa-surface': '#FFFFFF',
        'spa-accent': '#18181B',
        'spa-text-primary': '#18181B',
        'spa-text-secondary': '#52525B',
        'spa-text-muted': '#A1A1AA',
        'glass-border': 'rgba(255, 255, 255, 0.5)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gradient-soft': 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
        'gradient-fade': 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 100%)',
        'gradient-card': 'linear-gradient(145deg, #ffffff, #f0f0f0)',
        'gradient-dark': 'linear-gradient(145deg, #1a1a1a, #0a0a0a)',
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(0,0,0,0.05)',
        'card': '20px 20px 60px #d1d1d1, -20px -20px 60px #ffffff',
        'float': '0 20px 40px -5px rgba(0,0,0,0.08)',
        'glow': '0 0 20px rgba(24, 24, 27, 0.1)',
      },
      letterSpacing: {
        'tightest': '-0.05em',
        'tighter': '-0.025em',
        'wide': '0.025em',
        'wider': '0.05em',
        'widest': '0.1em',
        'luxury': '0.2em',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'slide-up': 'slideUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'breathe': 'breathe 6s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.5' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
