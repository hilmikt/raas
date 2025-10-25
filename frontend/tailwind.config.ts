import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './providers/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', ...defaultTheme.fontFamily.sans],
        heading: ['var(--font-heading)', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        border: 'rgb(var(--border) / <alpha-value>)',
        input: 'rgb(var(--border) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        muted: {
          DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
        },
        info: {
          DEFAULT: 'rgb(var(--info) / <alpha-value>)',
          foreground: 'rgb(var(--info-foreground) / <alpha-value>)',
        },
        success: {
          DEFAULT: 'rgb(var(--success) / <alpha-value>)',
          foreground: 'rgb(var(--success-foreground) / <alpha-value>)',
        },
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      keyframes: {
        'fade-slide': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'press-in': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0.98)' },
        },
        'pulse-attention': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.15)', opacity: '0.6' },
        },
        'icon-rotate': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(180deg)' },
        },
      },
      animation: {
        'fade-slide': 'fade-slide 0.45s ease-out both',
        'press-in': 'press-in 150ms ease-out forwards',
        'pulse-attention': 'pulse-attention 2.4s ease-in-out infinite',
      },
      boxShadow: {
        card: '0 20px 40px -24px rgb(15 23 42 / 0.22)',
        'card-hover': '0 24px 48px -20px rgb(37 99 235 / 0.25)',
        'card-dark': '0 20px 50px -30px rgb(8 145 178 / 0.45)',
      },
    },
  },
  plugins: [],
};

export default config;
