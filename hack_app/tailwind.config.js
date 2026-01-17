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
        // Medical / Privacy themed colors
        // Privacy-First Health Palette (Teal + Mint)
        health: {
          bg: {
            light: '#F0FDFA', // App Background Light
            dark: '#042F2E',  // App Background Dark
          },
          section: {
            light: '#ECFEFF', // Section Background Light
            dark: '#022C22',  // Section Background Dark
          },
          card: {
            light: '#FFFFFF', // Card Background Light
            dark: '#064E3B',  // Card Background Dark
          },
          primary: {
            light: '#5EEAD4', // Primary Action (User Request)
            hover: '#2DD4BF', // Primary Hover (User Request)
            dark: '#5EEAD4',
          },
          accent: '#99F6E4',  // Accent / Toggle
          text: {
            primary: {
              light: '#134E4A', // Text Primary Light
              dark: '#ECFEFF',  // Text Primary Dark
            },
            secondary: {
              light: '#0F766E', // Text Secondary Light
              dark: '#99F6E4',  // Text Secondary Dark
            }
          },
          border: {
            light: '#CCFBF1', // Border Light
            dark: '#115E59',  // Border Dark
          },
          danger: '#FECACA', // Danger (Soft Red)
          dangerText: '#991B1B', // Darker text for readability on soft red
          success: '#86EFAC', // Success
          warning: '#FDE68A', // Warning
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
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
      }
    },
  },
  plugins: [],
}
