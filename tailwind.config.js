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
        cyber: {
          bg: {
            DEFAULT: '#030712', // Deepest Black/Blue
            light: '#0f172a',   // Slate 900 (Panel BG)
            dark: '#020617',    // Darker depth
            glass: 'rgba(15, 23, 42, 0.6)',
          },
          primary: {
            DEFAULT: '#06b6d4', // Cyan 500 (Neon Highliht)
            hover: '#22d3ee',   // Cyan 400
            dim: 'rgba(6, 182, 212, 0.1)', // Low opacity for backgrounds
          },
          secondary: {
            DEFAULT: '#8b5cf6', // Violet 500
            hover: '#a78bfa',   // Violet 400
          },
          accent: {
            green: '#10b981', // Emerald 500 (Success)
            red: '#ef4444',   // Red 500 (Error)
            warning: '#f59e0b', // Amber 500
          },
          text: {
            primary: '#f8fafc', // Slate 50
            secondary: '#94a3b8', // Slate 400
            muted: '#64748b',   // Slate 500
            highlight: '#ccfbf1', // Teal 50
          }
        },
        health: {
          bg: {
            light: '#030712', // Main BG -> Cyber BG
            dark: '#0f172a',  // Depth -> Cyber Panel
            white: '#1e293b', // Light elements -> Slate 800
          },
          primary: {
            DEFAULT: '#06b6d4', // Highlight -> Cyan
            light: '#22d3ee',
            dark: '#0e7490',
          },
          secondary: {
            DEFAULT: '#1e293b', // Secondary -> Slate 800 (Card BG)
            hover: '#334155',
          },
          accent: {
            DEFAULT: '#06b6d4',
            gradient: '#0f172a',
          },
          text: {
            primary: '#f8fafc', // White text -> Slate 50
            secondary: '#94a3b8', // Softened -> Slate 400
            muted: '#64748b',
            dark: '#cbd5e1', // previously dark text -> now light gray for dark bg
          },
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          status: {
            active: '#10b981',
            expired: '#ef4444',
            revoked: '#64748b',
          }
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        display: ['Orbitron', 'sans-serif'], // For Headers
      },
      backgroundImage: {
        'cyber-grid': "radial-gradient(circle, rgba(6,182,212,0.1) 1px, transparent 1px)",
        'cyber-gradient': "linear-gradient(to right, #06b6d4, #8b5cf6)",
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(6, 182, 212, 0.5)',
        'glow-secondary': '0 0 20px rgba(139, 92, 246, 0.5)',
        'neon': '0 0 5px theme("colors.cyan.400"), 0 0 20px theme("colors.cyan.700")',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          'from': { backgroundPosition: '0 0' },
          'to': { backgroundPosition: '-200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(6, 182, 212, 0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
