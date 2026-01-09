<template>
  <div class="photo-wall-upload">
    <el-upload
      v-model:file-list="internalFileList"
      :action="action"
      :multiple="multiple"
      :limit="limit"
      :on-exceed="handleExceed"
      list-type="picture-card"
      :on-preview="handlePictureCardPreview"
      :on-remove="handleRemove"
      :before-upload="beforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :disabled="disabled"
      :auto-upload="false"
    >
      <el-icon><Plus /></el-icon>
    </el-upload>

    <el-dialog v-model="dialogVisible" title="Preview Image" width="70%">
      <img 
        class="preview-image" 
        :src="dialogImageUrl" 
        alt="Preview Image" 
      />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import type { UploadProps, UploadUserFile, UploadFile } from 'element-plus'
import { ElMessage } from 'element-plus'

interface Props {
  modelValue?: UploadUserFile[]
  action?: string
  multiple?: boolean
  limit?: number
  disabled?: boolean
  accept?: string
  maxSize?: number // in MB
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  action: '',
  multiple: true,
  limit: 8,
  disabled: false,
  accept: 'image/*',
  maxSize: 5
})

const emit = defineEmits<{
  'update:modelValue': [files: UploadUserFile[]]
  'change': [files: UploadUserFile[]]
  'remove': [file: UploadUserFile, fileList: UploadUserFile[]]
  'exceed': [files: File[], fileList: UploadUserFile[]]
}>()

const internalFileList = ref<UploadUserFile[]>([...props.modelValue])
const dialogImageUrl = ref('')
const dialogVisible = ref(false)

// Sync external modelValue changes
watch(() => props.modelValue, (newVal) => {
  internalFileList.value = [...newVal]
}, { deep: true })

// Emit changes when internal list changes
watch(internalFileList, (newVal) => {
  emit('update:modelValue', [...newVal])
  emit('change', [...newVal])
}, { deep: true })

const handleRemove: UploadProps['onRemove'] = (uploadFile, uploadFiles) => {
  emit('remove', uploadFile, uploadFiles)
}

const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url || URL.createObjectURL(uploadFile.raw!)
  dialogVisible.value = true
}

const handleExceed: UploadProps['onExceed'] = (files, fileList) => {
  emit('exceed', files, fileList)
  ElMessage.warning(`Maksimal ${props.limit} file yang diizinkan`)
}

const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  // Check file type
  if (props.accept && !rawFile.type.match(new RegExp(props.accept.replace('*', '.*')))) {
    ElMessage.error(`Format file tidak didukung. Hanya file ${props.accept} yang diizinkan`)
    return false
  }

  // Check file size
  if (props.maxSize && rawFile.size / 1024 / 1024 > props.maxSize) {
    ElMessage.error(`Ukuran file tidak boleh lebih dari ${props.maxSize}MB`)
    return false
  }

  return true
}

const handleSuccess: UploadProps['onSuccess'] = (response, uploadFile, fileList) => {
  ElMessage.success('File berhasil diupload')
}

const handleError: UploadProps['onError'] = (error, uploadFile, fileList) => {
  ElMessage.error('Upload file gagal')
}

// Public method to get file list
const getFileList = () => [...internalFileList.value]

// Public method to clear all files
const clearFiles = () => {
  internalFileList.value = []
}

// Public method to add files programmatically
const addFiles = (files: UploadUserFile[]) => {
  internalFileList.value.push(...files)
}

// Expose public methods
defineExpose({
  getFileList,
  clearFiles,
  addFiles
})
</script>

<style scoped>
:deep(.photo-wall-upload) 
:deep(.el-upload-list__item) {
  width: 100px;
  height: 100px;
}

:deep(.photo-wall-upload)
:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
  line-height: 100px;
}

:deep(.preview-image) {
  width: 100%;
  height: auto;
  max-height: 70vh;
  object-fit: contain;
}
</style>