/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // All colors reference CSS variables so :root / .dark variables
      // handle light ↔ dark switching automatically.
      // Using rgb(var(...) / <alpha-value>) syntax enables opacity modifiers
      // like bg-primary/20, ring-primary/10, etc.
      colors: {
        background:    'rgb(var(--color-background)   / <alpha-value>)',
        surface:       'rgb(var(--color-surface)       / <alpha-value>)',
        surfaceMuted:  'rgb(var(--color-surface-muted) / <alpha-value>)',
        border:        'rgb(var(--color-border)        / <alpha-value>)',
        borderHover:   'rgb(var(--color-border-hover)  / <alpha-value>)',
        primary:       'rgb(var(--color-primary)       / <alpha-value>)',
        primaryLight:  'rgb(var(--color-primary-light) / <alpha-value>)',
        primaryHover:  'rgb(var(--color-primary-hover) / <alpha-value>)',
        textMain:      'rgb(var(--color-text-main)     / <alpha-value>)',
        textSecondary: 'rgb(var(--color-text-secondary)/ <alpha-value>)',
        textMuted:     'rgb(var(--color-text-muted)    / <alpha-value>)',
        success:       'rgb(var(--color-success)       / <alpha-value>)',
        successLight:  'rgb(var(--color-success-light) / <alpha-value>)',
        danger:        'rgb(var(--color-danger)        / <alpha-value>)',
        dangerLight:   'rgb(var(--color-danger-light)  / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'xs':         '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'sm':         '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'glass':      '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        'card-hover': '0 20px 40px -8px rgba(37, 99, 235, 0.12), 0 8px 16px -4px rgb(0 0 0 / 0.06)',
      },
      animation: {
        'fade-in':  'fadeIn 0.2s ease-out',
        'slide-in': 'slideIn 0.25s ease-out',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideIn: { '0%': { opacity: '0', transform: 'translateY(-8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
