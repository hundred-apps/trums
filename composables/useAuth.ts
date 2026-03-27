// composables/useAuth.ts
export const useAuth = () => {
  const userdata = useCookie<string | null>("userdata");
  const expiredAt = useCookie<string | null>("expired_at");
  const accessToken = useCookie<string | null>("token");
  const refreshToken = useCookie<string | null>("refresh_token");

  const isRefreshing = useState<boolean>("isRefreshing", () => false);
  const requestQueue = useState<(() => void)[]>("requestQueue", () => []);

  const setToken = (token: string) => {
    accessToken.value = token;
  };
  const setExpiredAt = (expired: number) => {
    expiredAt.value = `${expired}`;
  };

  const clearAuth = () => {
    accessToken.value = null;
    refreshToken.value = null;
  };

  return {
    accessToken,
    refreshToken,
    isRefreshing,
    requestQueue,
    setToken,
    clearAuth,
    setExpiredAt,
  };
};
