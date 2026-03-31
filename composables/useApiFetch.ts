import { useRuntimeConfig, useCookie } from "#app";

export function useApiFetch<T>(url: string, options: any = {}): Promise<T> {
  const config = useRuntimeConfig();
  const { accessToken, isRefreshing, requestQueue } = useAuth();
  console.log("akses token", accessToken.value);
  return $fetch<T>(url, {
    baseURL: config.public.baseURL,
    headers: {
      ...(options.headers || {}),
      Authorization: accessToken.value ? `Bearer ${accessToken.value}` : "",
    },
    async onResponseError({ request, response, options }) {
      if (response.status === 401) {
        console.log("token expired, try refresh", isRefreshing.value);

        try {
          // 🚨 Hindari multiple refresh
          if (!isRefreshing.value) {
            isRefreshing.value = true;

            const newToken = await useRefreshToken();

            if (!newToken) {
              isRefreshing.value = false;

              navigateTo("/login");

              requestQueue.value = [];

              return Promise.reject("Unauthorized");
            }
          }

          requestQueue.value.forEach((q: any) => {
            q.resolve(
              $fetch(q.request, {
                ...q.options,
                headers: {
                  ...(q.options?.headers || {}),
                  Authorization: `Bearer ${accessToken.value}`,
                },
              })
            );
          });

          requestQueue.value = [];
        } catch (err) {
          requestQueue.value.forEach((q: any) => q.reject(err));
          requestQueue.value = [];
        } finally {
          isRefreshing.value = false;
        }
      }

      // lempar error biar tetap bisa ditangkap di page kalau perlu
      throw response;
    },
    ...options,
  });
}
// composables/useFetchApi.ts
