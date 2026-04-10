/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#085041',
        'primary-light': '#0a6b55',
        'primary-pale': '#f0f4f3',
        'warm-oatmeal': '#FAF7F2',
        'forest-slate': '#3D4035',
        'sage-muted': '#9CA39A',
        'mint-light': '#F0F4F1',
        surface: '#FFFFFF',
        'triage-red': '#E58B88',
        'triage-red-light': 'rgba(229, 139, 136, 0.15)',
        'status-red': '#DC2626',
        'status-red-bg': '#FEF2F2',
        'status-yellow': '#D97706',
        'status-yellow-bg': '#FFFBEB',
        'status-green': '#085041',
        'status-green-bg': '#E6F0EE',
        border: '#EAE5DB',
        // legacy aliases kept for compatibility
        forest: {
          DEFAULT: '#085041',
          light: '#0a6b55',
          pale: '#f0f4f3',
        },
        'off-white': '#FAF7F2',
      },
      fontFamily: {
        display: ['Manrope', 'sans-serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        serif: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '24px',
        'xl': '16px',
        lg: '12px',
        md: '8px',
        full: '9999px',
      },
      boxShadow: {
        soft: '0 8px 24px rgba(8, 80, 65, 0.08)',
        clinical: '0 2px 4px rgba(8, 80, 65, 0.06)',
      },
    },
  },
  plugins: [],
};
