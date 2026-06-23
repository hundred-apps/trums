// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  const auth = useAuth();

  console.log("is authenticate", !auth.isAuthenticated);

  // Check jika user authenticated dan token masih valid
  if (!auth.isAuthenticated) {
    // return navigateTo(`/`);
  }
});
