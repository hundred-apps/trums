<template>
  <div class="item-image-cell" @click="emitOpenModal">
    <el-tooltip content="Klik untuk melihat gambar" placement="top">
      <div class="image-preview-container">
        <img
          v-if="previewImageUrl"
          :src="previewImageUrl"
          class="item-image"
          alt="Item Image"
        />
        <div v-else class="empty-state">
          <el-icon class="upload-icon"><Plus /></el-icon>
          <span class="empty-text" v-if="showText">Add Image</span>
        </div>

        <!-- Badge untuk menunjukkan jumlah gambar -->
        <div v-if="imageCount > 0" class="image-count-badge">
          {{ imageCount }}
        </div>
      </div>
    </el-tooltip>
  </div>
</template>

<script lang="ts" setup>
import { computed, type StyleValue } from "vue";
import { Plus } from "@element-plus/icons-vue";
import type { UploadUserFile } from "element-plus";

interface Props {
  modelValue?: UploadUserFile[];
  imageUrl?: string;
  showText?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  imageUrl: "",
  showText: false,
});

const emit = defineEmits<{
  "open-modal": [index: number];
}>();

const previewImageUrl = computed(() => {
  // Prioritaskan imageUrl dari props
  if (props.imageUrl) return props.imageUrl;

  // Ambil gambar pertama dari modelValue untuk preview
  if (props.modelValue && props.modelValue.length > 0) {
    const firstFile = props.modelValue[0];
    if (firstFile.url) return firstFile.url;
    if (firstFile.raw) return URL.createObjectURL(firstFile.raw);
  }

  return "";
});

const imageCount = computed(() => {
  return props.modelValue?.length || 0;
});

const emitOpenModal = () => {
  emit("open-modal", 0);
};
</script>

<style scoped>
:deep(.item-image-cell) {
  cursor: pointer;
}

:deep(.image-preview-container) {
  width: 25px;
  height: 25px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  background-color: #fafafa;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

:deep(.image-preview-container:hover) {
  border-color: #409eff;
  background-color: #f0f7ff;
}

:deep(.item-image) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

:deep(.empty-state) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 4px;
}

:deep(.upload-icon) {
  font-size: 20px;
  color: #8c939d;
}

:deep(.empty-text) {
  font-size: 10px;
  color: #8c939d;
  text-align: center;
}

:deep(.image-count-badge) {
  position: absolute;
  top: 10px;
  right: 2px;
  background: #f56c6c;
  color: white;
  font-size: 10px;
  min-width: 10px;
  height: 10px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}
</style>
