import { useNuxtApp } from "#app";
import type { AxiosInstance } from "axios";

export const useApi = (): AxiosInstance => {
  const { $api } = useNuxtApp();
  return $api;
};
