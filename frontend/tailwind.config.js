/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#10151D',
        surface: '#171F2B',
        'surface-elevated': '#1D2735',
        primary: {
          DEFAULT: '#24C78B',
          hover: '#1FD69A',
          dark: '#169d6b',
        },
        ai: {
          DEFAULT: '#A78BFA',
          light: '#C4B5FD',
          dark: '#7C3AED',
        },
        main: '#F1F5F9',
        secondary: '#94A3B8',
        border: '#2B3645',
        error: '#F87171',
        warning: '#FBBF24',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Bengali', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      borderRadius: {
        card: '12px',
      },
      spacing: {
        sidebar: '256px',
        header: '64px',
      }
    },
  },
  plugins: [],
}
