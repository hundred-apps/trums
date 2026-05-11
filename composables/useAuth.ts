// composables/useAuth.ts
export const useAuth = () => {
  const userdata = useCookie<string | null>("userdata");
  const expiredAt = useCookie<string | null>("expired_at");
  const accessToken = useCookie<string | null>("token");
  const refreshToken = useCookie<string | null>("refresh_token");
  const userData = ref<string | null>(localStorage.getItem("user_data"));
  const isRefreshing = useState<boolean>("isRefreshing", () => false);
  const requestQueue = useState<(() => void)[]>("requestQueue", () => []);

  const setToken = (token: string) => {
    accessToken.value = token;
  };
  const setExpiredAt = (expired: number) => {
    expiredAt.value = `${expired}`;
  };

  const isAuthenticated = computed(() => {
    if (accessToken.value && isTokenValid.value) {
      return true;
    } else {
      return false;
    }
  });

  const isTokenValid = computed(() => {
    if (expiredAt.value) {
      const now = Math.floor(Date.now() / 1000);
      if (Number(expiredAt.value) < now) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  });

  const clearAuth = () => {
    accessToken.value = null;
    refreshToken.value = null;
  };

  const getUserData = () => {
    const data = JSON.parse(localStorage.getItem("user_data") ?? "");
    return data;
  };
  return {
    accessToken,
    refreshToken,
    isRefreshing,
    requestQueue,
    isAuthenticated,
    setToken,
    clearAuth,
    setExpiredAt,
    getUserData,
  };
};
