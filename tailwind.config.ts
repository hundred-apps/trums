import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        primary: colors.amber,
      },
      boxShadow: {
        up: "0px -2px 5px 1px rgba(0,0,0,0.12)",
        down: "0px 2px 5px 1px rgba(0,0,0,0.12)",
        primaryUp: "0px -2px 5px 1px rgba(34, 197, 94,0.22)",
        primaryDown: "0px 2px 5px 1px rgba(34, 197, 94,0.22)",
      },
    },
  },
  plugins: [
    require("flowbite/plugin")({
      charts: true,
    }),
  ],
  content: [
    `./components/**/*.{vue,js,ts}`,
    `./layouts/**/*.vue`,
    `./pages/**/*.vue`,
    `./composables/**/*.{js,ts}`,
    `./plugins/**/*.{js,ts}`,
    `./utils/**/*.{js,ts}`,
    `./node_modules/flowbite/**/*.{js,ts}`,
    `./App.{js,ts,vue}`,
    `./app.{js,ts,vue}`,
    `./Error.{js,ts,vue}`,
    `./error.{js,ts,vue}`,
    `./app.config.{js,ts}`,
  ],
  // safelist: [
  //   "w-64",
  //   "w-1/2",
  //   "rounded-l-lg",
  //   "rounded-r-lg",
  //   "bg-gray-200",
  //   "grid-cols-4",
  //   "grid-cols-7",
  //   "h-6",
  //   "leading-6",
  //   "h-9",
  //   "leading-9",
  //   "shadow-lg",
  // ],
  // presets: [require("@acmecorp/base-tailwind-config")],

  // content flowbite
  //  "./node_modules/flowbite/**/*.{js,ts}",
  //   "./layouts/**/*.html",
  //   "./content/**/*.md",
  //   "./content/**/*.html",
  //   "./src/**/*.js",

  // plugins flowbite
  // require("flowbite/plugin")
};
