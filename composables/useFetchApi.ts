type RequestMethod = "post" | "put" | "get" | "delete";

export async function useFetchApi<T>(
  endpoint: string,
  key: string,
  request_method: RequestMethod,
  body: any | null
): Promise<{
  status: any;
  data: Ref<T | null>;
  pending: Ref<boolean>;
  error: Ref<any>;
  code: number | undefined;
}> {
  const config = useRuntimeConfig();
  const token = useCookie("token");

  console.log("url", config.public.baseURL);
  console.log("endpoint", endpoint);

  const response = await useFetch<T>(`${config.public.baseURL}${endpoint}`, {
    key: key,
    body: body,
    method: request_method,
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
  });

  if (response.error.value?.statusCode == 403) {
    ElMessage.error(
      response.error.value?.data?.message ?? "Action Not Permited"
    );
  }

  return {
    data: response.data as Ref<T>,
    error: response.error,
    code: response.error.value?.statusCode,
    pending: response.pending,
    status: response.status,
  };
}
