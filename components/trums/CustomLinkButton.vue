<template>
  <NuxtLink
    :href="url"
    :class="`el-button el-button--${type} el-button--${
      isMobile ? 'small' : 'default'
    } w-full`"
    >{{ text }}</NuxtLink
  >
</template>
<script lang="tsx" setup>
import { Eleme } from "@element-plus/icons-vue";

const props = defineProps<{
  url: string;
  text: string;
  type:
    | "text"
    | "default"
    | "success"
    | "warning"
    | "info"
    | "primary"
    | "danger";
}>();

const { isMobile } = useDevice();
</script>
