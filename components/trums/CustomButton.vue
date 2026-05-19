<template>
  <el-button
    class="w-full"
    :type="type"
    :loading-icon="Eleme"
    :icon="icon"
    :disabled="loading"
    :loading="loading"
    @click="onClick"
    :size="isMobile ? 'small' : 'default'"
    >{{ text }}</el-button
  >
</template>
<script lang="tsx" setup>
import { Eleme } from "@element-plus/icons-vue";
import type { Component } from "vue";

const props = defineProps<{
  onClick: () => void;
  icon?: Component | undefined;
  disabled: boolean;
  loading: boolean;
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

<style scoped>
.el-button + .el-button {
  margin-left: 0px;
}
</style>
