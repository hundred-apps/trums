import { UserManager, WebStorageStateStore } from "oidc-client-ts"



export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig();

    const issuer = config.public.baseOIDCIssuer;
    const client_id = config.public.baseOIDCICID;
    const client_secret = config.public.baseOIDCICSecret;
    const redirect_uri = config.public.baseOIDCICBURL;
    const response_type = 'code';
    const scope = 'openid profile email';


  const userManager = new UserManager({
    authority: issuer, // base URL OIDC provider kamu
    client_id: client_id,
    client_secret: client_secret,
    redirect_uri: redirect_uri,
    post_logout_redirect_uri: window.location.origin,
    response_type: response_type,
    scope: scope,
    automaticSilentRenew: true,
    
    userStore: new WebStorageStateStore({ store: window.localStorage }),
  })

  return {
    provide: {
      oidc: userManager,
    },
  }
})
