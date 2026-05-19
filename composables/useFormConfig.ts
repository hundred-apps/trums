import type { ComponentSize, FormProps } from "element-plus";

export const useFormConfig = () => {
  const { isMobile } = useDevice();

  const labelPosition = computed<FormProps["labelPosition"]>(() => {
    return isMobile ? "top" : "right";
  });

  const formSize = ref<ComponentSize>("default");
  return {
    labelPosition,
    formSize,
  };
};
