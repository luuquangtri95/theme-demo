module.exports = {
  content: ["./**/*.liquid", "./assets/**/*.js"],
  safelist: [
    "grid-cols-3",
    "sm:grid-cols-3",
    "md:grid-cols-3",
    "md:grid-cols-4",
    "md:grid-cols-5",
    "md:grid-cols-6",
    "lg:grid-cols-3",
    "lg:grid-cols-4",
    "lg:grid-cols-5",
    "lg:grid-cols-6",
  ],
  theme: {
    extend: {
      aspectRatio: {
        square: "1 / 1",
      },
      colors: {
        main: "#ffe9cf",
        ["main-hover"]: "#f5e6cf",
      },
    },
  },
  plugins: [],
};
