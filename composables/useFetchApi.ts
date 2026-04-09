type RequestMethod = "post" | "put" | "get" | "delete";
type RequestStatus = "idle" | "pending" | "success" | "error";
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

  const data = ref<T | null>(null);
  const error = ref<any>(null);
  const pending = ref<boolean>(true);
  const status = ref<string>("pending");
  let code: number | undefined = undefined;

  try {
    const res = await $fetch<T>(`${config.public.baseURL}${endpoint}`, {
      method: request_method,
      body,
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
    });

    data.value = res;
    status.value = "success";
    code = 200;
  } catch (err: any) {
    error.value = err;
    status.value = "error";
    code = err?.statusCode;

    // HANDLE 401
    if (code === 401 && retry) {
      return await handle401<T>(endpoint, key, request_method, body);
    }

    // HANDLE 403
    if (code === 403) {
      window.location.href = "/error/403";
    }
  } finally {
    pending.value = false;
  }

  // const response = await $fetch<T>(`${config.public.baseURL}${endpoint}`, {
  //   method: request_method,
  //   body,
  //   headers: {
  //     Authorization: `Bearer ${accessToken.value}`,
  //   },
  // });

  // console.log("status code", response);

  // const statusCode = response.error.value?.statusCode;

  // // ✅ HANDLE 401
  // if (statusCode === 401 && retry) {
  //   return await handle401<T>(endpoint, key, request_method, body);
  // }

  // // ❌ HANDLE 403
  // if (statusCode === 403) {
  //   window.location.href = "/error/403";
  // }

  // return {
  //   data: response.data as Ref<T>,
  //   error: response.error,
  //   code: statusCode,
  //   pending: response.pending,
  //   status: response.status,
  // };

  return {
    data,
    error,
    pending,
    status,
    code,
  };
}

export async function handle401<T>(
  endpoint: string,
  key: string,
  method: RequestMethod,
  body: any
): Promise<any> {
  const { isRefreshing, requestQueue } = useAuth();
  console.log("is referesh 401", isRefreshing.value);
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

  console.log("handle 401 check token", newToken);

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
