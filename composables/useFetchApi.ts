type RequestMethod = "post" | "put" | "get" | "delete";

export async function useFetchApi<T>(
  endpoint: string,
  key: string,
  request_method: RequestMethod,
  body: any | null,
  retry = true
): Promise<{
  status: any;
  data: Ref<T | null>;
  pending: Ref<boolean>;
  error: Ref<any>;
  code: number | undefined;
}> {
  const config = useRuntimeConfig();
  const { accessToken, isRefreshing, requestQueue } = useAuth();
  console.log("access token", accessToken.value);
  const response = await useFetch<T>(`${config.public.baseURL}${endpoint}`, {
    key,
    method: request_method,
    body,
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
    },
  });

  const statusCode = response.error.value?.statusCode;
  // console.log('status code')
  // ✅ HANDLE 401
  if (statusCode === 401 && retry) {
    return await handle401<T>(endpoint, key, request_method, body);
  }

  // ❌ HANDLE 403
  if (statusCode === 403) {
    ElMessage.error(
      response.error.value?.data?.message ?? "Action Not Permitted"
    );
  }

  return {
    data: response.data as Ref<T>,
    error: response.error,
    code: statusCode,
    pending: response.pending,
    status: response.status,
  };
}

async function handle401<T>(
  endpoint: string,
  key: string,
  method: RequestMethod,
  body: any
): Promise<any> {
  const { isRefreshing, requestQueue } = useAuth();

  // 🔥 kalau sedang refresh → tunggu
  if (isRefreshing.value) {
    return new Promise((resolve) => {
      requestQueue.value.push(async () => {
        resolve(await useFetchApi<T>(endpoint, key, method, body, false));
      });
    });
  }

  isRefreshing.value = true;

  const newToken = await useRefreshToken();

  // ❌ kalau refresh gagal → logout
  if (!newToken) {
    isRefreshing.value = false;

    navigateTo("/login");
    return Promise.reject("Unauthorized");
  }

  // ✅ jalankan semua queue
  requestQueue.value.forEach((cb) => cb());
  requestQueue.value = [];

  isRefreshing.value = false;

  // 🔁 retry request pertama
  return await useFetchApi<T>(endpoint, key, method, body, false);
}
