/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface:   '#050508',
        'surface-1': '#0a0a12',
        'surface-2': '#0f0e1a',
        'surface-3': '#141228',
        accent:    '#7c3aed',
        'accent-2': '#6366f1',
        'accent-light': '#a78bfa',
        neon:      '#06b6d4',
        success:   '#10b981',
        warning:   '#f59e0b',
        danger:    '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow-sm':  '0 0 15px rgba(124,58,237,0.2)',
        'glow':     '0 0 30px rgba(124,58,237,0.25)',
        'glow-lg':  '0 0 60px rgba(124,58,237,0.3)',
        'glow-cyan':'0 0 30px rgba(6,182,212,0.2)',
        'inner-glow':'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
    },
  },
  plugins: [],
};
