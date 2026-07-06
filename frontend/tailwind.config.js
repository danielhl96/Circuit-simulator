/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'circuit-primary': '#0ea5e9',
        'circuit-secondary': '#6366f1',
        'circuit-accent': '#10b981',
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark", "cupcake", "cyberpunk", "synthwave"],
    defaultTheme: "light",
    darkTheme: "dark",
    logs: false,
  },
};
