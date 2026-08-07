/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary — Indigo (sesuai requirement)
        primary: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        // Semantic
        success: {
          50:  '#F0FDF4',
          100: '#DCFCE7',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
        },
        warning: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        danger: {
          50:  '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        info: {
          50:  '#F0F9FF',
          100: '#E0F2FE',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ],
      },
      fontSize: {
        // Typography scale sesuai requirement-ui.md
        'display':  ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'page':     ['24px', { lineHeight: '32px', fontWeight: '700' }],
        'section':  ['18px', { lineHeight: '28px', fontWeight: '600' }],
        'card':     ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'body-lg':  ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body':     ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-md':  ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'label':    ['13px', { lineHeight: '18px', fontWeight: '500' }],
        'caption':  ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'small':    ['11px', { lineHeight: '16px', fontWeight: '500' }],
        // Tailwind defaults overridden
        'xs':       ['12px', { lineHeight: '16px' }],
        'sm':       ['14px', { lineHeight: '20px' }],
        'base':     ['16px', { lineHeight: '24px' }],
        'lg':       ['18px', { lineHeight: '28px' }],
        'xl':       ['20px', { lineHeight: '28px' }],
        '2xl':      ['24px', { lineHeight: '32px' }],
      },
      borderRadius: {
        // Button/Input: 8px, Card/Modal: 12px, Badge/Avatar: 9999px
        'sm':   '4px',
        'DEFAULT': '8px',
        'md':   '8px',
        'lg':   '12px',
        'xl':   '16px',
        '2xl':  '20px',
        'full': '9999px',
      },
      boxShadow: {
        // Minimal shadow sesuai requirement
        'sm':     '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'md':     '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        'lg':     '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
        'none':   'none',
      },
      animation: {
        'fade-in':  'fadeIn 0.15s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'fade-out': 'fadeOut 0.15s ease-in',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeOut: { from: { opacity: '1' }, to: { opacity: '0' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      spacing: {
        // 4px grid
        '0.5': '2px',
        '1':   '4px',
        '2':   '8px',
        '3':   '12px',
        '4':   '16px',
        '5':   '20px',
        '6':   '24px',
        '8':   '32px',
        '10':  '40px',
        '12':  '48px',
        '16':  '64px',
      },
    },
  },
  plugins: [],
};
