/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Habilita modo escuro se necessário, usaremos uma paleta dark premium nativa
  theme: {
    extend: {
      colors: {
        // Paleta customizada de cores ultra-premium baseada em tons escuros e violeta/indigo
        slate: {
          950: '#0b0f19',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        },
        violet: {
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
