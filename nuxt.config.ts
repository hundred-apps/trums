// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  ssr: false,
  pages: true,
  modules: [
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "@nuxtjs/tailwindcss",
    "nuxt-headlessui",
    "@nuxtjs/color-mode",
    "@nuxt/icon",
    "@nuxtjs/i18n",
    "@nuxtjs/device",
    "nuxt-twemoji",
  ],

  tailwindcss: {
    cssPath: ["~/assets/css/input.css", { injectPosition: "first" }],
    configPath: "tailwind.config",
    exposeConfig: {
      level: 2,
    },
    config: {},
    viewer: true,
  },
  headlessui: {
    prefix: "Headless",
  },
  i18n: {
    locales: [
      { code: "en", language: "en-US", file: "en.json", name: "English" },
      {
        code: "id",
        language: "id-ID",
        file: "id.json",
        name: "Bahasa Indonesia",
      },
    ],
    strategy: "prefix_except_default",
    lazy: true,
    langDir: "locales/",
    defaultLocale: "en",
    skipSettingLocaleOnNavigate: true,
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "language",
      redirectOn: "root",
      alwaysRedirect: true,
    },
    // customRoutes: "config",
    // pages: {
    //   setting: {
    //     en: "/setting",
    //   },
    // },
  },
  colorMode: {
    preference: "system", // default value of $colorMode.preference
    fallback: "light", // fallback value if not system preference found
    hid: "nuxt-color-mode-script",
    globalName: "__NUXT_COLOR_MODE__",
    componentName: "ColorScheme",
    classPrefix: "",
    classSuffix: "-mode",
    storage: "cookie", // or 'sessionStorage' or 'cookie' or 'localStorage'
    storageKey: "color-mode",
  },
  twemoji: {
    expiresIn: 3.154e7, // SVG cache expiration time in seconds (1 year)
  },
});
