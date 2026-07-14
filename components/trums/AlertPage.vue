<template>
  <el-alert :title="text" :type="type ?? 'info'" effect="dark" />
</template>

<script lang="tsx" setup>
const props = defineProps<{
  text: string;
  type: "info" | "warning" | "error" | "success";
}>();
</script>
