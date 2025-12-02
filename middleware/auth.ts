// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  const auth = useAuthStore()
  // Check jika user authenticated dan token masih valid
  if (!auth.isAuthenticated) {
    // Coba load dari storage
    auth.loadFromStorage()
    
    if (!auth.isAuthenticated) {
      return navigateTo(`/`)
    }
  }

  // Check token expiry
  const isTokenValid = await auth.checkTokenExpiry()

  
  
  if (!isTokenValid) {
    // Token expired dan refresh gagal
    return navigateTo(`/`)
  }

  
})