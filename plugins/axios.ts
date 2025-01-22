import axios from "axios";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const api = axios.create({
    baseURL: config.public.baseURL || 'http://192.168.1.96:9008/api/',
    timeout: 10000,
  });

  return {
    provide: {
      api,
    },
  };
});
