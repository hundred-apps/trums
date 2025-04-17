// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  ssr: false,
  pages: true,
  runtimeConfig: {
    public: {
      baseURL: process.env.NUXT_API_URL, // Base URL untuk API
      baseImageURL: process.env.NUXT_API_IMAGE_URL, // Base URL untuk image
      baseBE: process.env.NUXT_API_BASE,
    },
  },
  app: {
    head: {
      script: [
        {
          src: "https://cdn.jsdelivr.net/npm/apexcharts",
          defer: true,
        },
      ],
    },
  },
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
    "nuxt-openid-connect",
    "@element-plus/nuxt",
  ],

  build: {
    // babel: {
    //   plugins: ['@vue/babel-plugin-jsx'],
    // },
  },

  css: ["element-plus/theme-chalk/dark/css-vars.css"],

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
      { code: "en", iso: "en-US", file: "en.json", name: "English" },
      {
        code: "id",
        iso: "id-ID",
        file: "id.json",
        name: "Bahasa Indonesia",
      },
    ],
    strategy: "prefix_except_default",
    lazy: true,
    langDir: "i18n/locales/",
    defaultLocale: "en",
    skipSettingLocaleOnNavigate: false,
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
    classSuffix: "",
    storage: "cookie", // or 'sessionStorage' or 'cookie' or 'localStorage'
    storageKey: "color-mode",
  },
  twemoji: {
    expiresIn: 3.154e7, // SVG cache expiration time in seconds (1 year)
  },

  openidConnect: {
    addPlugin: true,
    op: {
      issuer: process.env.NUXT_OPENID_CONNECT_OP_ISSUER || "",
      clientId: process.env.NUXT_OPENID_CONNECT_OP_CLIENT_ID || "",
      clientSecret: process.env.NUXT_OPENID_CONNECT_OP_CLIENT_SECRET || "",
      callbackUrl: process.env.NUXT_OPENID_CONNECT_OP_CALLBACK_URL || "", // deprecated from 0.8.0
      scope: ["email", "profile", "address"],
    },
    config: {
      debug: false, // optional, default is false
      response_type: "code", // or 'code'
      secret: "oidc._sessionid",
      cookie: { loginName: "" },
      cookiePrefix: "oidc._",
      cookieEncrypt: true,
      cookieEncryptKey: "bfnuxt9c2470cb477d907b1e0917oidc", // 32
      cookieEncryptIV: "ab83667c72eec9e4", // 16
      cookieEncryptALGO: "aes-256-cbc",
      cookieMaxAge: 24 * 60 * 60, //  default one day
      cookieFlags: {
        // default is empty
        access_token: {
          httpOnly: false,
          secure: false,
        },
      },
    },
  },
});
