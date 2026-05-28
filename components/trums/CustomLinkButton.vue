<template>
  <NuxtLink
    :href="url"
    :class="`el-button el-button--${type} el-button--${
      isMobile ? 'large' : 'default'
    } w-full ${isCircle ? 'is-circle' : ''}`"
    ><slot
  /></NuxtLink>
</template>
<script lang="tsx" setup>
import { Eleme } from "@element-plus/icons-vue";

const props = defineProps<{
  url: string;
  isCircle?: boolean;
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
