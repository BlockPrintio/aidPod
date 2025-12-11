/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Core Colors */
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        border: 'var(--color-border)',
        input: 'var(--color-input)',
        ring: 'var(--color-ring)',
        
        /* Card Colors */
        card: {
          DEFAULT: 'var(--color-card)',
          foreground: 'var(--color-card-foreground)'
        },
        popover: {
          DEFAULT: 'var(--color-popover)',
          foreground: 'var(--color-popover-foreground)'
        },
        
        /* Muted Colors */
        muted: {
          DEFAULT: 'var(--color-muted)',
          foreground: 'var(--color-muted-foreground)'
        },
        
        /* Primary Colors - Cardano Blue */
        primary: {
          DEFAULT: 'var(--color-primary)',
          foreground: 'var(--color-primary-foreground)',
          light: 'var(--color-primary-light)'
        },
        
        /* Secondary Colors - Trust Teal */
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          foreground: 'var(--color-secondary-foreground)'
        },
        
        /* Accent Colors - Healthcare Violet */
        accent: {
          DEFAULT: 'var(--color-accent)',
          foreground: 'var(--color-accent-foreground)'
        },
        
        /* State Colors */
        success: {
          DEFAULT: 'var(--color-success)',
          foreground: 'var(--color-success-foreground)'
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          foreground: 'var(--color-warning-foreground)'
        },
        error: {
          DEFAULT: 'var(--color-error)',
          foreground: 'var(--color-error-foreground)'
        },
        destructive: {
          DEFAULT: 'var(--color-destructive)',
          foreground: 'var(--color-destructive-foreground)'
        },
        
        /* Surface & Blockchain */
        surface: 'var(--color-surface)',
        blockchain: {
          DEFAULT: 'var(--color-blockchain)',
          dark: 'var(--color-blockchain-dark)'
        },
        
        /* Text Colors */
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)'
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
      spacing: {
        'clinical': '1.5rem',
        'clinical-sm': '1rem',
        'clinical-lg': '2rem',
      },
      borderRadius: {
        'medical': '0.5rem',
        'medical-sm': '0.25rem',
        'medical-lg': '0.75rem',
      },
      boxShadow: {
        'medical-sm': '0 1px 3px hsla(222, 47%, 11%, 0.06), 0 1px 2px hsla(222, 47%, 11%, 0.04)',
        'medical-md': '0 4px 6px hsla(222, 47%, 11%, 0.07), 0 2px 4px hsla(222, 47%, 11%, 0.06)',
        'medical-lg': '0 10px 25px hsla(222, 47%, 11%, 0.1), 0 4px 10px hsla(222, 47%, 11%, 0.05)',
        'glow': '0 0 30px hsla(199, 89%, 48%, 0.2)',
      },
      animation: {
        'breathing': 'breathing 3s ease-in-out infinite',
        'pulse-gentle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        breathing: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(0.98)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
      },
      zIndex: {
        'navigation': '1000',
        'mobile-menu': '1100',
        'dropdown': '1200',
        'modal': '1300',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
  ],
}