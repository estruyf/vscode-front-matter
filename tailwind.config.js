const colors = require('tailwindcss/colors');

module.exports = {
  mode: 'jit',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: ['class', '.vscode-dark'],
  theme: {
    extend: {
      animation: {
        'reverse-spin': 'reverse-spin 1s linear infinite'
      },
      keyframes: {
        'reverse-spin': {
          from: {
            transform: 'rotate(360deg)'
          },
        },
        'vscode-loader': {
          '0%': { left: '0', width: '30px' },
          '25%': { width: '50px' },
          '50%': { width: '20px' },
          '75%': { width: '50px' },
          '100%': { width: '20px', left: '100%' }
        }
      },
      colors: {
        white: colors.white,
        gray: colors.neutral,
        "red": {
          "50": "#ff7c7b",
          "100": "#ff7271",
          "200": "#ff6867",
          "300": "#ff5e5d",
          "400": "#ff5453",
          "500": "#fe4a49",
          "600": "#f4403f",
          "700": "#ea3635",
          "800": "#e02c2b",
          "900": "#d62221"
        },
        "blue": {
          "50": "#90dfff",
          "100": "#86d5ff",
          "200": "#7ccbff",
          "300": "#72c1ff",
          "400": "#68b7fc",
          "500": "#5eadf2",
          "600": "#54a3e8",
          "700": "#4a99de",
          "800": "#408fd4",
          "900": "#3685ca"
        },
        "teal": {
          "50": "#47f4fd",
          "100": "#3deaf3",
          "200": "#33e0e9",
          "300": "#29d6df",
          "400": "#1fccd5",
          "500": "#15c2cb",
          "600": "#0bb8c1",
          "700": "#01aeb7",
          "800": "#00a4ad",
          "900": "#009aa3"
        },
        "aqua": {
          "50": "#76ffff",
          "100": "#6cfffa",
          "200": "#62fff0",
          "300": "#58ffe6",
          "400": "#4effdc",
          "500": "#44ffd2",
          "600": "#3af5c8",
          "700": "#30ebbe",
          "800": "#26e1b4",
          "900": "#1cd7aa"
        },
        "yellow": {
          "50": "#ffff90",
          "100": "#ffff86",
          "200": "#ffff7c",
          "300": "#fff872",
          "400": "#ffee68",
          "500": "#ffe45e",
          "600": "#f5da54",
          "700": "#ebd04a",
          "800": "#e1c640",
          "900": "#d7bc36"
        },
        "whisper": {
          "50": "#ffffff",
          "100": "#ffffff",
          "200": "#ffffff",
          "300": "#ffffff",
          "400": "#fdf9ff",
          "500": "#f3eff5",
          "600": "#e9e5eb",
          "700": "#dfdbe1",
          "800": "#d5d1d7",
          "900": "#cbc7cd"
        },
        "vulcan": {
          "50": "#404551",
          "100": "#363b47",
          "200": "#2c313d",
          "300": "#222733",
          "400": "#181d29",
          "500": "#0e131f",
          "600": "#040915",
          "700": "#00000b",
          "800": "#000001",
          "900": "#000000"
        },
        "rose": {
          "50": "#ff73da",
          "100": "#ff69d0",
          "200": "#ff5fc6",
          "300": "#ff55bc",
          "400": "#fb4bb2",
          "500": "#f141a8",
          "600": "#e7379e",
          "700": "#dd2d94",
          "800": "#d3238a",
          "900": "#c91980"
        }
      }
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
  ],
}
