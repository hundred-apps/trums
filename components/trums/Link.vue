<script lang="ts" setup>
// micro compiler
const props = defineProps({
  text: {
    type: String,
    default: "",
  },
  to: {
    type: [String, Object],
    default: undefined,
  },
  href: {
    type: String,
    default: "",
  },
});
// state
const href = toRef(props, "href");
const to = toRef(props, "to");

const onClick = (event: MouseEvent) => {
  const router = useRouter();

  if (props.to) {
    router.push(props.to);
  }

  if (!props.href) {
    event.preventDefault();
  }
};
</script>

<template>
  <NuxtLinkLocale v-if="to" tag="a" :to="to" :class="`hover:text-blue-500`">
    <slot>{{ text }}</slot>
  </NuxtLinkLocale>
  <a v-else-if="!href" :class="`hover:text-blue-500`" href="#" @click="onClick">
    <slot>{{ text }}</slot>
  </a>
  <a v-else :class="`hover:text-blue-500 `" :href="href" @click="onClick">
    <slot>{{ text }}</slot>
  </a>
</template>
