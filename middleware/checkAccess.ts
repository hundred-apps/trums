export default defineNuxtRouteMiddleware(async (to, from) => {
  const meta = to.meta
  
  // Support berbagai format permission requirement
  const permissionReq: string = meta.requiredPermission as string;
  console.log('permission ', meta);
  console.log('to path', to.path);
  if (!permissionReq) {
    return // No permission requirement
  }
  
  const hasAccess = await checkPermission(permissionReq)
  
  if (!hasAccess) {
    // Optional: redirect ke fallback route
    const fallback = meta.permissionFallback || '/error/403'
    return navigateTo(fallback)
  }
})