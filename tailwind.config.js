/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber': {
          dark: '#0f0f1c',
          darker: '#1a1a2e',
          neon: '#00f6ff',
          pink: '#ff4ecd',
        },
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],
        'rajdhani': ['Rajdhani', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { 'box-shadow': '0 0 5px #00f6ff, 0 0 10px #00f6ff, 0 0 15px #00f6ff' },
          '100%': { 'box-shadow': '0 0 10px #00f6ff, 0 0 20px #00f6ff, 0 0 30px #00f6ff' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1c 100%)',
        'cyber-diagonal': 'linear-gradient(45deg, #00f6ff 0%, #ff4ecd 100%)',
      },
    },
  },
  plugins: [],
}
