import { createI18n } from "vue-i18n";
import en from "../i18n/locales/en.json";
import id from "../i18n/locales/id.json";

const i18n = createI18n({
  locale: "en", // default locale
  fallbackLocale: "en", // fallback jika terjemahan tidak ditemukan
  messages: {
    en,
    id,
  },
});

const app = createApp(App);
app.use(i18n);
app.mount("#app");
