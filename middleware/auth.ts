// export default defineNuxtRouteMiddleware((to, from) => {
//   if (import.meta.server) {
//     return;
//   }
//   const { $oidc } = useNuxtApp();
//   if (!$oidc.isLoggedIn) {
//     window.location.href = "/";
//   }
// });

export default defineNuxtRouteMiddleware((to, from) => {
    if (import.meta.server) { return }
    const { $oidc } = useNuxtApp()
    if (!$oidc.isLoggedIn) {
      window.location.href = '/landing';
    }
  })
