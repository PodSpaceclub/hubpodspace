const path = require("path");

// On Windows, Tailwind's fast-glob needs forward slashes
const root = __dirname.replace(/\\/g, "/");

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ["class"],
  content: [
    `${root}/src/pages/**/*.{js,ts,jsx,tsx,mdx}`,
    `${root}/src/components/**/*.{js,ts,jsx,tsx,mdx}`,
    `${root}/src/app/**/*.{js,ts,jsx,tsx,mdx}`,
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3B3BFF",
          50: "#EBEBFF",
          100: "#D1D1FF",
          200: "#A3A3FF",
          300: "#7575FF",
          400: "#5555FF",
          500: "#3B3BFF",
          600: "#2525DD",
          700: "#1A1ABB",
          800: "#111199",
          900: "#080877",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#E85A00",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#E85A00",
          green: "#55FF33",
          pink: "#FF33CC",
          foreground: "#FFFFFF",
        },
        background: "#FFFFFF",
        surface: "#F5F5F5",
        "surface-2": "#EFEFEF",
        foreground: "#1A1A1A",
        muted: {
          DEFAULT: "#F5F5F5",
          foreground: "#666666",
        },
        border: "#E8E8E8",
        input: "#F5F5F5",
        ring: "#3B3BFF",
        success: "#10B981",
        warning: "#F59E0B",
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1A1A1A",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#1A1A1A",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Barlow Condensed", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-purple": "linear-gradient(135deg, #3B3BFF 0%, #2525DD 100%)",
        "gradient-blue": "linear-gradient(135deg, #3B3BFF 0%, #2020CC 100%)",
        "gradient-orange": "linear-gradient(135deg, #E85A00 0%, #CC4500 100%)",
        "gradient-brand": "linear-gradient(135deg, #3B3BFF 0%, #E85A00 100%)",
        "gradient-dark": "linear-gradient(135deg, #1A1A1A 0%, #333333 100%)",
      },
      boxShadow: {
        glow: "0 4px 16px rgba(59, 59, 255, 0.25)",
        "glow-lg": "0 8px 32px rgba(59, 59, 255, 0.3)",
        card: "0 2px 12px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 24px rgba(59, 59, 255, 0.12)",
        blue: "0 4px 16px rgba(59, 59, 255, 0.25)",
        orange: "0 4px 16px rgba(232, 90, 0, 0.25)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".5" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

module.exports = config;
