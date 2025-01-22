export default defineNuxtRouteMiddleware((to, from) => {
    if (import.meta.server) { return }
    const appUserData = useCookie('userdata')
    const userToken = useCookie('token')
    if (!appUserData && !userToken) {
      window.location.href = '/';
    }
})