import { UserManager } from "oidc-client-ts"

// composables/useOIDC.ts
export const useOIDC = () => {
  const config = useRuntimeConfig()
  
  const userManager = new UserManager({
    authority: config.public.baseOIDCIssuer,
    client_id: config.public.baseOIDCICID,
    client_secret: config.public.baseOIDCICSecret,
    redirect_uri: config.public.baseOIDCICBURL,
    response_type: 'code',
    scope: 'openid profile email',
    automaticSilentRenew: false, // Matikan dulu untuk debugging
  })

  return userManager
}