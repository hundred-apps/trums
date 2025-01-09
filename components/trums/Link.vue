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
</script>

<template>
  <NuxtLinkLocale v-if="to" tag="a" :to="to" :class="`hover:text-primary-500`">
    <slot>{{ text }}</slot>
  </NuxtLinkLocale>
  <a v-else-if="!href" :class="`hover:text-primary-500`" href="#">
    <slot>{{ text }}</slot>
  </a>
  <a v-else :class="`hover:text-primary-500 `" :href="href">
    <slot>{{ text }}</slot>
  </a>
</template>
