/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#053027',
        'primary-light': '#084a3c',
        'primary-pale': '#eef2f1',
        'primary-soft': '#e6eeec',
        'warm-oatmeal': '#FAF7F2',
        'warm-sunken': '#F3EFE7',
        'forest-slate': '#1A2925',
        'forest-secondary': '#5E6A63',
        'sage-muted': '#9AA29C',
        'mint-light': '#F0F4F1',
        surface: '#FFFFFF',
        'triage-red': '#E58B88',
        'triage-red-light': 'rgba(229, 139, 136, 0.15)',
        'status-red': '#DC2626',
        'status-red-bg': '#FEF2F2',
        'status-yellow': '#D97706',
        'status-yellow-bg': '#FFFBEB',
        'status-green': '#053027',
        'status-green-bg': '#E6EEEC',
        border: '#EAE5DB',
        hairline: 'rgba(20, 30, 25, 0.08)',
        'hairline-strong': 'rgba(20, 30, 25, 0.14)',
        // legacy aliases
        forest: {
          DEFAULT: '#053027',
          light: '#084a3c',
          pale: '#eef2f1',
        },
        'off-white': '#FAF7F2',
      },
      fontFamily: {
        display: ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        serif: ['Manrope', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['10px', '14px'],
      },
      borderRadius: {
        '3xl': '28px',
        '2xl': '22px',
        xl: '18px',
        lg: '14px',
        md: '10px',
        full: '9999px',
      },
      boxShadow: {
        'ios-sm': '0 1px 2px rgba(5, 48, 39, 0.05), 0 1px 3px rgba(5, 48, 39, 0.04)',
        ios: '0 1px 2px rgba(5, 48, 39, 0.04), 0 4px 16px rgba(5, 48, 39, 0.05)',
        'ios-lg': '0 1px 2px rgba(5, 48, 39, 0.04), 0 10px 32px rgba(5, 48, 39, 0.08)',
        'ios-xl': '0 2px 4px rgba(5, 48, 39, 0.05), 0 20px 48px rgba(5, 48, 39, 0.12)',
        soft: '0 8px 24px rgba(5, 48, 39, 0.08)',
        clinical: '0 2px 4px rgba(5, 48, 39, 0.06)',
        'inner-hairline': 'inset 0 -0.5px 0 rgba(20, 30, 25, 0.08)',
      },
      transitionTimingFunction: {
        ios: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
