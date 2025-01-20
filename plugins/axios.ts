import axios from "axios";

export default defineNuxtPlugin(() => {
  const api = axios.create({
    baseURL: "http://192.168.1.228:9008/api",
    // baseURL: "http://192.168.1.96:9008/api",
    timeout: 10000,
  });

  return {
    provide: {
      api,
    },
  };
});
