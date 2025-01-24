import axios from "axios";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const token = useCookie('token')
  const api = axios.create({
    baseURL: config.public.baseURL || 'http://192.168.1.96:9008/api/',
    timeout: 10000,
    headers: {
      'Authorization': 'Bearer ' + token.value,
    }
  });

  return {
    provide: {
      api,
    },
  };
});
