import { useRuntimeConfig, useCookie } from '#app'

export function useApiFetch<T>(
  url: string,
  options: any = {}
): Promise<T> {
  const config = useRuntimeConfig()
  const token = useCookie<string | null>('token')

  return $fetch<T>(url, {
    baseURL: config.public.baseURL,
    headers: {
      ...(options.headers || {}),
      Authorization: token.value ? `Bearer ${token.value}` : '',
    },
    ...options,
  })
}
