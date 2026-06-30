import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ground: 'var(--ground)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        border: 'var(--border)',
        'border-s': 'var(--border-strong)',
        tx: 'var(--tx)',
        'tx-2': 'var(--tx-2)',
        'tx-m': 'var(--tx-muted)',
        accent: 'var(--accent)',
        'accent-fg': 'var(--accent-fg)',
        'accent-tint': 'var(--accent-tint)',
        ok: 'var(--ok)',
        err: 'var(--err)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: 'var(--radius-sm)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      transitionDuration: {
        DEFAULT: '180ms',
      },
      keyframes: {
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        toastIn: {
          from: { opacity: '0', transform: 'translateY(12px) scale(0.94)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        toastOut: {
          to: { opacity: '0', transform: 'translateY(12px) scale(0.94)' },
        },
        strikeThrough: {
          from: { width: '0%' },
          to: { width: '100%' },
        },
      },
      animation: {
        'slide-down': 'slideDown 0.16s ease',
        'toast-in': 'toastIn 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        'toast-out': 'toastOut 0.18s ease forwards',
        'strike': 'strikeThrough 0.3s ease forwards',
      },
    },
  },
  plugins: [],
}

export default config
