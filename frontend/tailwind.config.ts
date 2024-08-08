import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderColor: {},
      colors: {
        white: "#FBFDFD",
        customBlack: "#1F1D1D",
        appleBlack: "#161617",
      },
      gridTemplateColumns: {
        room: "grid-cols-[repeat(auto-fit,minmax(200px,1fr))]",
      },
      gridTemplateRows: {
        room: "grid-rows-[repeat(auto-fit,minmax(200px,1fr))]",
      },
      fontFamily: {
        kumbh: ['var(--font-kumbh)'],
        inter: ['var(--font-inter)']
      },
      maxWidth: {
        "desktop": "70rem"
      },
      keyframes: {
        'stagger-slide-in': {
          '0%': {
            transform: 'translateX(-6.25rem)',
            opacity: "0"
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: "1",
          },
        },
        'stagger-slide-out': {
          '0%': {
            transform: 'translateX(0)',
            opacity: "1",
          },
          '100%': {
            transform: 'translateX(-6.25rem)',
            opacity: "0"
          },
        },
        'pop-in-up': {
          '0%': {
            transform: 'translateY(2.25rem)',
            scale: "0.875",
            opacity: "0"
          },
          '100%': {
            transform: 'translateY(0)',
            scale: "1",
            opacity: "1"
          },
        },
        'slide-fade-in-up': {
          '0%': {
            transform: 'translateY(1.25rem)',
            opacity: "0"
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: "1"
          },
        }
      },
      animation: {
        'pop-in-up': 'pop-in-up 0.5s ease-out',
        'stagger-slide-in': 'stagger-slide-in 0.375s ease-out',
        'stagger-slide-out': 'stagger-slide-out 0.375s ease-out',
        'slide-fade-in-up': 'slide-fade-in-up 0.375s ease-out',
      }
    },
  },
  plugins: [],
};
export default config;
