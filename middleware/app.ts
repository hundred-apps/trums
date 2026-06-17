export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.server) {
    return;
  }
  // const auth = useAuth();

  // console.log("user data", auth.accessToken);

  // if (!auth.accessToken && !auth.getUserData()) {
  //   window.location.href = "/";
  // }
});
