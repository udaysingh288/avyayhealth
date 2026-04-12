/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#053027',
          light: '#084a3c',
          50: '#E6EEEC',
          100: '#D0DEDB',
        },
        'off-white': '#F9F7F2',
        sunken: '#F3EFE7',
        orange: {
          accent: '#E85D27',
        },
        success: '#16A34A',
        warn: '#D97706',
        danger: '#DC2626',
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(5,48,39,0.04), 0 4px 16px rgba(5,48,39,0.05)',
      },
    },
  },
  plugins: [],
};
