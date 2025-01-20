<script lang="ts" setup>
const props = defineProps({
  text: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "primary",
  },
  size: {
    type: String,
    default: "md",
  },
  padding: {
    type: String,
    default: "md",
  },
  position: {
    type: String,
    default: "center",
  },
  to: {
    type: [String, Object],
    default: undefined,
  },
  href: {
    type: String,
    default: undefined,
  },
  isButton: {
    type: Boolean,
    default: false,
  },
  buttonType: {
    type: String,
    default: "button",
  },
});
// state:styles
const defaultStyle = `
  cursor-pointer
  transition-color duration-300
  focus:outline-none focus:ring-1 focus:ring-offset-1 focus:dark:ring-offset-gray-50 focus:dark:ring-gray-400 focus:ring-gray-600/[0.6] focus:ring-offset-gray-800/[0.6]
  flex items-center font-semibold
`;
const styles = reactive<{
  [key: string]: string;
}>({
  none: "",
  primary: "text-white bg-primary-500 hover:bg-primary-400 border-primary-500",
  secondary:
    "text-gray-800 bg-gray-200 border-gray-200 hover:bg-gray-300 dark:text-white dark:border-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700",
  opposite:
    "text-white bg-gray-800 hover:bg-white hover:text-gray-800 hover:border-gray-900 dark:text-gray-800 dark:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:border-white",
  danger: "text-white bg-red-500 hover:bg-red-400 border-red-500",
  sidebar:
    "text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 hover:text-primary-500",
});
const sizes = reactive<{
  [key: string]: string;
}>({
  lg: "text-xl rounded-lg",
  md: "text-lg rounded",
  sm: "text-md rounded",
  xs: "text-sm rounded",
});
const padding = reactive<{
  [key: string]: string;
}>({
  lg: "py-4 px-8",
  md: "py-3 px-6",
  sm: "py-2 px-4",
  xs: "py-1 px-3",
  xxs: "py-1 px-2",
  xxxs: "py-1 px-1",
  none: "pa-0",
});
const positions = reactive<{
  [key: string]: string;
}>({
  left: "justify-start",
  right: "justify-end",
  center: "justify-center",
});
// state
const selectedStyle = computed(() =>
  props.type in styles ? styles[props.type] : styles.primary
);
const selectedSize = computed(() => sizes[props.size] || sizes.lg);
const selectedPadding = computed(() => padding[props.padding] || padding.none);
const selectedPosition = computed(
  () => positions[props.position] || positions.center
);
// methods
const onClick = (event: MouseEvent) => {
  const router = useRouter();

  if (props.to) {
    router.push(props.to);
  }

  if (!props.href && props.buttonType !== "submit") {
    event.preventDefault();
  }
};
</script>

<template>
  <button
    v-if="isButton"
    :buttonType="buttonType"
    :class="`${defaultStyle} ${selectedStyle} ${selectedSize} ${selectedPadding} ${selectedPosition}`"
    @click="onClick"
  >
    <slot>{{ text }}</slot>
  </button>

  <!-- Jika to ada, gunakan NuxtLinkLocale -->
  <NuxtLinkLocale
    v-else-if="to"
    tag="a"
    :to="to"
    :class="`${defaultStyle} ${selectedStyle} ${selectedSize} ${selectedPadding} ${selectedPosition}`"
  >
    <slot>{{ text }}</slot>
  </NuxtLinkLocale>

  <!-- Jika href ada, gunakan a -->
  <a
    v-else
    :class="`${defaultStyle} ${selectedStyle} ${selectedSize} ${selectedPadding} ${selectedPosition}`"
    :href="href"
    @click="onClick"
  >
    <slot>{{ text }}</slot>
  </a>
</template>
