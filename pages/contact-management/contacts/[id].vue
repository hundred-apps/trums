<template>
  <TrumsWrapper>
    <!-- Header -->
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3">
          Contact - {{ contactData?.unique_code }}
        </span>
      </template>
    </el-page-header>

    <!-- Contact Detail -->
    <el-card class="my-3"
      v-loading="loading"
      element-loading-text="Loading..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      element-loading-background="rgba(122, 122, 122, 0.8)"
    >
      <template #header>
        <div class="card-header flex justify-end">
          <el-button type="danger" :icon="Delete" @click="confirmDelete">Hapus</el-button>
          <NuxtLink :href="`/contact-management/contacts/form/${contactData?.name}?mode=update&unique_id=${contactData?.unique_id}`" class="el-button el-button--primary">
            <el-icon class="me-2"><Edit /></el-icon> Edit
          </NuxtLink>
        </div>
      </template>

      <div class="flex gap-3 my-3">
        <!-- Left Side -->
        <div class="flex-1">
          <el-descriptions :column="1" size="large" border>
            <el-descriptions-item label="Nama">
              {{ contactData?.name ?? '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="Email">
              {{ contactData?.email ?? '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="Telepon">
              {{ contactData?.phone ?? '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="Website">
              {{ contactData?.website ?? '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="Tax ID">
              {{ contactData?.tax_id ?? '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- Right Side -->
        <div class="flex-1">
          <el-descriptions :column="1" size="large" border>
            <el-descriptions-item label="Tipe Contact">
              <el-tag v-if="contactData?.is_personal" type="primary">Personal</el-tag>
              <el-tag v-else-if="contactData?.is_company" type="success">Company</el-tag>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item v-if="contactData?.is_personal" label="Perusahaan">
              {{ contactData?.parent?.name ?? '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="Title">
              {{ contactData?.title ?? '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="Tags">
              <span v-if="contactData?.tags">{{ contactData.tags }}</span>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="Di Buat Pada">
              {{ contactData?.created_at != null ? formatLocalDate(contactData?.created_at) : '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <!-- Addresses -->
      <el-card shadow="never" class="mt-3">
        <template #header>
          <div class="card-header">
            <span>Alamat</span>
          </div>
        </template>
        <el-table :data="contactData?.address ?? []" border>
          <el-table-column prop="address_name" label="Nama Alamat" />
          <el-table-column prop="street" label="Jalan" />
          <el-table-column prop="city" label="Kota" />
          <el-table-column prop="province" label="Provinsi" />
          <el-table-column prop="postal_code" label="Kode Pos" />
          <el-table-column prop="country" label="Negara" />
        </el-table>
      </el-card>
    </el-card>
  </TrumsWrapper>
</template>

<script lang="ts" setup>
import { Delete, Edit } from '@element-plus/icons-vue'
import type { Contact } from '~/types/contact'
import type { BaseResponse } from '~/types/response'

definePageMeta({
  middleware: ["auth", "app"],
  name: "Contact Detail",
})

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const contactData = ref<Contact | null>(null)

// Loading animation SVG
const svg = `
  <path class="path" d="
    M 30 15
    L 28 17
    M 25.61 25.61
    A 15 15, 0, 0, 1, 15 30
    A 15 15, 0, 1, 1, 27.99 7.5
    L 15 15
  " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
`

const goBack = () => router.back()

// Fetch Contact
const fetchContact = async () => {
  loading.value = true
  try {
    const response = await useFetchApi<BaseResponse<Contact>>(`/contact-read/${route.params.id}`, 'detail-contact', 'get', null)
    if (response.status.value === 'success') {
      contactData.value = response.data.value!.data
    }
  } catch (error) {
    ElMessage.error('Gagal memuat data kontak')
    goBack()
  } finally {
    loading.value = false
  }
}

// Format date
const formatDate = (timestamp?: number | null) => {
  if (!timestamp) return '-'
  return new Date(timestamp * 1000).toLocaleDateString('id-ID')
}

// Delete Contact
const confirmDelete = () => {
  ElMessageBox.confirm(
    'Kontak ini akan dihapus permanen. Lanjutkan?',
    'Warning',
    {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  ).then(async () => {
    await deleteContact()
  }).catch(() => {})
}

const deleteContact = async () => {
  loading.value = true
  try {
    // await $fetch(`/api/contact/${contactData.value?.id}`, { method: 'DELETE' })
    ElMessage.success('Kontak berhasil dihapus')
    router.push('/contacts')
  } catch (error) {
    ElMessage.error('Gagal menghapus kontak')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchContact()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-descriptions__body) {
  background-color: transparent;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
}
</style>
