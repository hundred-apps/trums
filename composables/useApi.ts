import { useNuxtApp } from "#app";
import type { AxiosInstance } from "axios";

export const useApi = (): AxiosInstance => {
  const { $api } = useNuxtApp();
  
  const token = useCookie("token"); 
  console.log(token);
  $api.interceptors.request.use((config) => {
    if (token.value) {
      config.headers.Authorization = `Bearer ${token.value}`;
    }
    return config;
  });
  return $api;
};
