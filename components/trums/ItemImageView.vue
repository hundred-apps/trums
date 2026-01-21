<template>
  <div class="item-image-cell" @click="() => previewImage = true">
    <el-tooltip content="Klik untuk upload/tambah gambar" placement="top">
      <div class="image-preview-container">
        <img
          v-if="imgUrls.length > 0"
          :src="imgUrls[0]"
          class="item-image"
          alt="Item Image"
        />
        
        <!-- Badge untuk menunjukkan jumlah gambar -->
        <div v-if="imageCount > 0" class="image-count-badge">
          {{ imageCount }}
        </div>

        <div 
            v-else
            class="flex items-center h-full justify-center w-full text-gray-400"
        >
            <el-icon><Picture /></el-icon>
        </div>
      </div>
    </el-tooltip>
  </div>

  <el-image-viewer
    v-if="previewImage"
    show-progress
    :url-list="imgUrls"
    @close="previewImage = false"
  >
    <template #viewer-error="{ activeIndex, src }">
      <div class="image-slot viewer-error">
        <el-icon><icon-picture /></el-icon>
        <span>
          this is viewer-error slot. current index: {{ activeIndex }}. src:
          {{ src }}
        </span>
      </div>
    </template>
  </el-image-viewer>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { Picture } from '@element-plus/icons-vue'




const props = defineProps<{
    imgUrls: string[],
}>();


const previewImage = ref<boolean>(false);
const initialIndexImage = ref<number>(0);

const imageCount = computed(() => {
  return props.imgUrls.length || 0
})


</script>

<style scoped>
:deep(.item-image-cell) {
  cursor: pointer;
}

:deep(.image-preview-container) {
  width: 50px;
  height: 50px;
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
  top: 4px;
  right: 4px;
  background: #f56c6c;
  color: white;
  font-size: 10px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}
</style>