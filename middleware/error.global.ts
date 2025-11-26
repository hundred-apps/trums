// middleware/error.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  // Check jika route tidak ada
  if (!to.matched.length) {
    console.warn(`Route not found: ${to.path}`)
    
    // Redirect ke custom 404 page
    return navigateTo('/error/404')
  }

  
})