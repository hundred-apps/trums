// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  ssr: false,
  modules: [
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "@nuxtjs/tailwindcss",
    "nuxt-headlessui",
    "@nuxtjs/color-mode",
    "@nuxt/icon",
    "@nuxtjs/i18n",
    "@nuxtjs/device",
    "nuxt-openid-connect",
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
      { code: "en", iso: "en-US", file: "en.json", name: "English" },
      { code: "id", iso: "id-ID", file: "id.json", name: "Bahasa Indonesia" },
    ],
    strategy: "prefix_and_default",
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
    customRoutes: "config",
    pages: {
      login: {
        en: "/login",
        id: "/masuk",
      },
      feature: {
        en: "/feature",
        id: "/fitur",
      },
      about: {
        en: "/about",
        id: "/tentang",
      },
    },
  },

  openidConnect: {
    addPlugin: true,
    op: {
      issuer: process.env.NUXT_OPENID_CONNECT_OP_ISSUER || '',
      clientId: process.env.NUXT_OPENID_CONNECT_OP_CLIENT_ID || '',
      clientSecret: process.env.NUXT_OPENID_CONNECT_OP_CLIENT_SECRET || '',
      callbackUrl: process.env.NUXT_OPENID_CONNECT_OP_CALLBACK_URL || '',   // deprecated from 0.8.0
      scope: [
        'email',
        'profile',
        'address'
      ]
    },
    config: {
      debug: false, // optional, default is false
      response_type: 'code', // or 'code'
      secret: 'oidc._sessionid',
      cookie: { loginName: '' },
      cookiePrefix: 'oidc._',
      cookieEncrypt: true,
      cookieEncryptKey: 'bfnuxt9c2470cb477d907b1e0917oidc', // 32
      cookieEncryptIV: 'ab83667c72eec9e4', // 16
      cookieEncryptALGO: 'aes-256-cbc',
      cookieMaxAge: 24 * 60 * 60, //  default one day
      cookieFlags: { // default is empty 
        access_token: { 
          httpOnly: true,
          secure: false,
        }
      }
    }
  }
});