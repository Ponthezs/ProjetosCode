/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        spotify: {
          green: '#1DB954',
          dark: '#121212',
          card: '#181818',
          hover: '#282828',
          text: '#B3B3B3'
        },
        obsidian: {
          900: '#07090E',
          800: '#0D111A',
          700: '#141A26',
          600: '#1F293D'
        },
        neon: {
          emerald: '#10B981',
          violet: '#8B5CF6',
          cyan: '#06B6D4',
          pink: '#EC4899'
        }
      },
      boxShadow: {
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.3)',
        'spotify-card': '0 8px 24px rgba(0, 0, 0, 0.5)'
      }
    },
  },
  plugins: [],
}
