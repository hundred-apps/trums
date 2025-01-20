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
  loading: {
    type: Boolean,
    default: false,
  },
});
// state:styles
const defaultStyle = `
  cursor-pointer
  transition-color duration-300
  focus:outline-none focus:ring-1 focus:ring-offset-1 focus:dark:ring-offset-gray-50 focus:dark:ring-gray-400 focus:ring-gray-600/[0.6] focus:ring-offset-gray-800/[0.6]
  flex items-center font-semibold rounded
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
  lg: "text-xl",
  md: "text-lg",
  sm: "text-md",
  xs: "text-sm",
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
    :disabled="loading"
    @click="onClick"
  >
    <slot>
      <span v-if="loading"
        ><svg
          aria-hidden="true"
          :class="`text-gray-200 animate-spin dark:text-gray-600 fill-primary-600 ${selectedSize}`"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
      </span>
      <span v-else>{{ text }}</span></slot
    >
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
