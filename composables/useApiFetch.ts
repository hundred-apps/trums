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
    ...options,
  });
}
