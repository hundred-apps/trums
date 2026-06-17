// composables/useRefreshToken.ts
export const useRefreshToken = async () => {
  const config = useRuntimeConfig();
  const { refreshToken, setToken, clearAuth, accessToken, setExpiredAt } =
    useAuth();
  try {
    const res: any = await $fetch(`${config.public.baseURL}/people-refresh`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken.value}`, // 🔥 pakai token lama
      },
    });
    const response = res.refresh_token;
    setToken(response.token);
    setExpiredAt(response.expired_at);
    return response.token;
  } catch (err) {
    // clearAuth();
    return null;
  }
};
