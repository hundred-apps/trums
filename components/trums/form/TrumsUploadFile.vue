<template>
  <el-upload
    :file-list="internalFileList"
    class="upload-demo w-full"
    multiple
    :on-preview="handlePreview"
    :on-remove="handleRemove"
    :before-remove="beforeRemove"
    :on-change="handleChange"
    :on-exceed="handleExceed"
    :auto-upload="false"
  >
    <el-button type="primary" class="w-full">Upload File </el-button>
  </el-upload>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

import type { UploadProps, UploadUserFile } from "element-plus";

const props = defineProps<{
  fileList: UploadUserFile[];
}>();

const internalFileList = ref<UploadUserFile[]>(props.fileList);

const emit = defineEmits<{
  (e: "update:fileList", value: UploadUserFile[]): void;
}>();

const handleRemove: UploadProps["onRemove"] = (file, uploadFiles) => {
  console.log(file, uploadFiles);
};

const handlePreview: UploadProps["onPreview"] = (uploadFile) => {
  console.log(uploadFile);
};

const handleChange: UploadProps["onChange"] = (uploadFile, uploadFiles) => {
  internalFileList.value = uploadFiles; // Memicu watch dan emit ke parent
};

const handleExceed: UploadProps["onExceed"] = (files, uploadFiles) => {
  ElMessage.warning(
    `The limit is 3, you selected ${files.length} files this time, add up to ${
      files.length + uploadFiles.length
    } totally`
  );
};

const beforeRemove: UploadProps["beforeRemove"] = (uploadFile, uploadFiles) => {
  return ElMessageBox.confirm(
    `Cancel the transfer of ${uploadFile.name} ?`
  ).then(
    () => true,
    () => false
  );
};

watch(
  () => props.fileList,
  (newVal) => {
    console.log("Props file list changed:", newVal);
    internalFileList.value = newVal;
  },
  { deep: true }
);

watch(
  internalFileList,
  (newVal) => {
    emit("update:fileList", newVal);
  },
  { deep: true }
);
</script>
<style scoped>
:deep(.el-upload el-upload--text) {
  width: 100% !important;
}
</style>
