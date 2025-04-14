import { createI18n } from "vue-i18n";
import en from "../i18n/locales/en.json";
import id from "../i18n/locales/id.json";
const numberFormats = {
  'en-US': {
    currency: {
      style: 'currency', currency: 'USD', notation: 'standard'
    },
    decimal: {
      style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2
    },
    percent: {
      style: 'percent', useGrouping: false
    }
  },
  'ja-JP': {
    currency: {
      style: 'currency', currency: 'JPY', useGrouping: true, currencyDisplay: 'symbol'
    },
    decimal: {
      style: 'decimal', minimumSignificantDigits: 3, maximumSignificantDigits: 5
    },
    percent: {
      style: 'percent', useGrouping: false
    }
  }
}
const i18n = createI18n({
  ...numberFormats,
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
