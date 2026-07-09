<template>
  <div class="image-upload">
    <el-upload
      v-if="!preview"
      drag
      :show-file-list="false"
      :auto-upload="false"
      :limit="1"
      accept="image/*"
      :before-upload="beforeUpload"
      :on-change="handleChange"
      class="upload-box"
    >
      <el-icon :size="32">
        <Plus />
      </el-icon>

      <div class="mt-2">Klik atau Drop Gambar</div>

      <div class="text-xs text-gray-500 mt-1">
        JPG, PNG, JPEG, WEBP (Max 50 MB)
      </div>
    </el-upload>

    <div v-else class="preview-box">
      <img :src="preview" class="preview-image" />

      <el-button
        class="remove-btn"
        circle
        type="danger"
        :icon="Delete"
        @click="removeImage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Delete, Plus } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import type { UploadFile, UploadRawFile } from "element-plus";

interface Props {
  modelValue?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string | null): void;
  (e: "change", file: File): void;
  (e: "remove"): void;
}>();

const preview = ref("");

watch(
  () => props.modelValue,
  (value) => {
    // hanya update jika preview bukan blob lokal
    if (!preview.value.startsWith("blob:")) {
      preview.value = value ?? "";
    }
  },
  {
    immediate: true,
  }
);

const beforeUpload = (file: UploadRawFile) => {
  if (!file.type.startsWith("image/")) {
    ElMessage.error("File harus berupa gambar.");
    return false;
  }

  if (file.size > 50 * 1024 * 1024) {
    ElMessage.error("Ukuran maksimal 50 MB.");
    return false;
  }

  return true;
};

const handleChange = (uploadFile: UploadFile) => {
  if (!uploadFile.raw) return;

  if (preview.value.startsWith("blob:")) {
    URL.revokeObjectURL(preview.value);
  }

  preview.value = URL.createObjectURL(uploadFile.raw);

  emit("change", uploadFile.raw);
};

const removeImage = () => {
  //   emit("update:modelValue", null);
  emit("remove");
};

onBeforeUnmount(() => {
  if (preview.value.startsWith("blob:")) {
    URL.revokeObjectURL(preview.value);
  }
});
</script>

<style scoped>
.upload-box,
.preview-box {
  width: 240px;
  height: 240px;
}

.preview-box {
  position: relative;
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.remove-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}
</style>
