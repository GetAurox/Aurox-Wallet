module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx,svg}"],
  variants: {
    extend: {
      backgroundColor: ["active"],
    },
  },
  darkMode: "class",
  theme: {
    minHeight: theme => ({
      ...theme("spacing"),
    }),
    minWidth: theme => ({
      ...theme("spacing"),
    }),
    extend: {
      colors: {
        "white-rgba-2": "rgba(255, 255, 255, 0.2)",
      },
    },
  },

  plugins: [],
};
