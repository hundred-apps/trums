// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  const auth = useAuth();
  // Check jika user authenticated dan token masih valid
  if (!auth.isAuthenticated) {
    return navigateTo(`/`);
  }
});
