export default function ({ app, route, redirect }) {
  const locale = app.i18n.locale; // Locale saat ini
  const availableLocales = app.i18n.locales.map((l) => l.code);

  if (!availableLocales.includes(locale)) {
    redirect(`/${app.i18n.defaultLocale}${route.fullPath}`);
  }
}
