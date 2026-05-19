export const useDevice = () => {
  const isMobile = ref(false);

  const checkDevice = () => {
    if (process.client) {
      isMobile.value = window.innerWidth < 768;
    }
  };

  onMounted(() => {
    checkDevice();

    window.addEventListener("resize", checkDevice);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", checkDevice);
  });

  return {
    isMobile,
  };
};
