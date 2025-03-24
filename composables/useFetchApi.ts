

type RequestMethod = 'post' | 'put' | 'get' | 'delete';

export async function useFetchApi<T>(endpoint: string,key: string, request_method: RequestMethod, body: any | null): Promise<{
  status: any; data: Ref<T | null>; pending: Ref<boolean>; error: Ref<any> 
}>{
    const config = useRuntimeConfig();
    const token = useCookie('token');


    const response = await useFetch<T>(`${config.public.baseURL}${endpoint}`, {
        key: key,
        body: body,
        method: request_method,
        headers: {
            Authorization: `Bearer ${token.value}`, 
        },
    });

    

  return response!;  
    
}