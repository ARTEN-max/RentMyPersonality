/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
      colors: {
        cyber: {
          darker: '#0a0a0f',
          dark: '#12121f',
          neon: '#00ff9f',
          pink: '#ff00ff',
          blue: '#00f0ff',
        },
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { 'box-shadow': '0 0 5px theme(colors.cyber.neon)' },
          '100%': { 'box-shadow': '0 0 20px theme(colors.cyber.neon)' },
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
