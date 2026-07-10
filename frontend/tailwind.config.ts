import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: 'class',
  theme: {
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Base Background - Deep Navy
        base: "#080C14",
        
        // Brand/Accent - Teal (Aliased as both brand and accent)
        brand: {
          DEFAULT: "#37D7AC",
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#5fe3bf",
          500: "#37d7ac",
          600: "#2cb38f",
          700: "#059669",
          800: "#047857",
          900: "#065f46",
          950: "#022c22",
        },
        accent: {
          DEFAULT: "#37D7AC",
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#5fe3bf",
          500: "#37d7ac",
          600: "#2cb38f",
          700: "#059669",
          800: "#047857",
          900: "#065f46",
        },
        
        // Surface - Glassmorphic dark
        surface: {
          DEFAULT: "rgba(18, 24, 38, 0.4)",
          card: "#0D1220",
          hover: "rgba(18, 24, 38, 0.6)",
        },
        
        // Border colors
        border: {
          DEFAULT: "rgba(255, 255, 255, 0.08)",
          light: "rgba(255, 255, 255, 0.05)",
          glow: "rgba(55, 215, 172, 0.3)",
        },
        
        // Text colors - White/slate only
        text: {
          primary: "#FFFFFF",
          secondary: "#CBD5E1",
          muted: "#94A3B8",
        },
        
        // Theme modes
        theme: {
          normal: "#37D7AC",
          ramadan: "#F59E0B",
          eid: "#10B981",
          christmas: "#EF4444",
        }
      },
      
      fontFamily: {
        readex: ["Readex Pro", "sans-serif"],
      },
      
      borderRadius: {
        'glass': '16px',
        'pill': '9999px',
      },
      
      backdropBlur: {
        'glass': '16px',
      },
      
      boxShadow: {
        'glow-sm': '0 0 20px rgba(55, 215, 172, 0.25), 0 0 40px rgba(55, 215, 172, 0.1)',
        'glow-md': '0 0 30px rgba(55, 215, 172, 0.35), 0 0 60px rgba(55, 215, 172, 0.15)',
        'glow-lg': '0 0 40px rgba(55, 215, 172, 0.45), 0 0 80px rgba(55, 215, 172, 0.2)',
        'btn': '0 4px 14px 0 rgba(55, 215, 172, 0.15)',
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'input-focus': '0 0 0 3px rgba(55, 215, 172, 0.1)',
      },
      
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'grid-pulse': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.6' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'slide-up': 'slide-up 0.3s ease-out forwards',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'grid-pulse': 'grid-pulse 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
      },
      
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
};

export default config;
