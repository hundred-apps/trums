import axios from "axios";

export default defineNuxtPlugin(() => {
  const api = axios.create({
    baseURL: "http://192.168.1.238:9006/api",
    timeout: 10000,
  });

  return {
    provide: {
      api,
    },
  };
});
