<template>
  <el-button
    class="w-full"
    :type="type"
    :loading-icon="Eleme"
    :icon="icon"
    :disabled="disabled"
    :loading="loading"
    :circle="isCircle ?? false"
    @click="onClick"
    :size="isMobile ? 'large' : 'default'"
    ><slot
  /></el-button>
</template>
<script lang="tsx" setup>
import { Eleme } from "@element-plus/icons-vue";
import type { Component } from "vue";

const props = defineProps<{
  onClick: () => void;
  icon?: Component | undefined;
  disabled: boolean;
  loading: boolean;
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

<style scoped>
.el-button + .el-button {
  margin-left: 0px;
}
</style>
