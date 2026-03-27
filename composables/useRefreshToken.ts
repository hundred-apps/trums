// composables/useRefreshToken.ts
export const useRefreshToken = async () => {
  const config = useRuntimeConfig();
  const { refreshToken, setToken, clearAuth, accessToken, setExpiredAt } =
    useAuth();
  console.log("token", accessToken.value);
  try {
    const res: any = await $fetch(`${config.public.baseURL}/people-refresh`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken.value}`, // 🔥 pakai token lama
      },
    });
    console.log("res", res);
    // setToken(res.token);
    // setExpiredAt(res.expired_at);
    return res.token;
  } catch (err) {
    // clearAuth();
    return null;
  }
};
