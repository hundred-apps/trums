<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3">
          Account - {{ accountData?.code }}
        </span>
      </template>
    </el-page-header>
    
    <el-card class="my-3" 
      v-loading="loading"
      element-loading-text="Loading..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      element-loading-background="rgba(122, 122, 122, 0.8)"
    >
      <template #header>
        <div class="card-header flex justify-end">
          <el-button type="danger" :icon="Delete" @click="confirmDelete">
            Hapus
          </el-button>
          <NuxtLink 
            :href="`/finance-management/accounts/add`" 
            class="el-button el-button--primary"
            @click="() => {
              const unique_id = useCookie('unique_id');
              unique_id.value = accountData?.unique_id;
            }"
          >
            <el-icon class="me-2"><Edit /></el-icon> Edit
          </NuxtLink>
        </div>
      </template>
      
      <div class="flex gap-3 my-3">
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            <el-descriptions-item label="Kode Account">
              {{ accountData?.code || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="Nama Account">
              {{ accountData?.name || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="Parent Account">
              {{ accountData?.parent?.name || 'Tidak ada parent' }}
              <span v-if="accountData?.parent">
                ({{ accountData?.parent?.code }})
              </span>
            </el-descriptions-item>
          </el-descriptions>
        </div>
        
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            <el-descriptions-item label="Tipe Account">
              <el-tag 
                v-if="accountData?.type === 'asset'" 
                type="success"
              >
                {{ accountData?.type.toUpperCase() }}
              </el-tag>
              <el-tag 
                v-else-if="accountData?.type === 'liability'" 
                type="danger"
              >
                {{ accountData?.type.toUpperCase() }}
              </el-tag>
              <el-tag 
                v-else-if="accountData?.type === 'revenue'" 
                type="warning"
              >
                {{ accountData?.type.toUpperCase() }}
              </el-tag>
              <el-tag 
                v-else-if="accountData?.type === 'expense'" 
                type="info"
              >
                {{ accountData?.type.toUpperCase() }}
              </el-tag>
              <el-tag v-else type="primary">
                {{ accountData?.type.toUpperCase() }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="Dibuat Pada">
              {{ accountData != null ? formatLocalDate(accountData!.created_at!) : '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="Dibuat Oleh">
              {{ accountData?.created_by || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      
    </el-card>
    
    <el-card class="mb-3" 
      v-loading="loading"
      element-loading-text="Loading..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      element-loading-background="rgba(122, 122, 122, 0.8)"
    >
      <template #header>
        <div class="card-header">
          <span>Sub Accounts</span>
        </div>
      </template>
      
      <el-table :data="accountData?.children ?? []" empty-text="Tidak ada sub account">
        <el-table-column prop="code" label="Kode" width="120">
          <template #default="scope">
            <NuxtLink 
              :href="`/accounts/${scope.row.unique_id}`" 
              class="text-blue-500"
            >
              {{ scope.row.code }}
            </NuxtLink>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="Nama Account" />
        <el-table-column prop="type" label="Tipe" width="120">
          <template #default="scope">
            <el-tag 
              v-if="scope.row.type === 'asset'" 
              type="success" 
              size="small"
            >
              {{ scope.row.type.toUpperCase() }}
            </el-tag>
            <el-tag 
              v-else-if="scope.row.type === 'liability'" 
              type="danger" 
              size="small"
            >
              {{ scope.row.type.toUpperCase() }}
            </el-tag>
            <el-tag 
              v-else-if="scope.row.type === 'revenue'" 
              type="warning" 
              size="small"
            >
              {{ scope.row.type.toUpperCase() }}
            </el-tag>
            <el-tag 
              v-else-if="scope.row.type === 'expense'" 
              type="info" 
              size="small"
            >
              {{ scope.row.type.toUpperCase() }}
            </el-tag>
            <el-tag v-else type="primary" size="small">
              {{ scope.row.type.toUpperCase() }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="Dibuat Pada" width="180">
          <template #default="scope">
            {{ formatLocalDate(scope?.row?.created_at) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </TrumsWrapper>
</template>

<script lang="ts" setup>
import { Delete, Edit } from '@element-plus/icons-vue'
import { unique } from 'element-plus/es/utils/arrays.mjs'
import { sampleAccount, type Account } from '~/types/finance/account'
import type { BaseResponse } from '~/types/response'

definePageMeta({
  middleware: ["auth", "app"],
  name: "Account Detail",
})

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const accountData = ref<Account | null>(null)
const subAccounts = ref<Account[]>([])

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

// Format tanggal
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Kembali ke halaman sebelumnya
const goBack = () => router.back()

// Konfirmasi hapus
const confirmDelete = () => {
  ElMessageBox.confirm(
    'Apakah Anda yakin ingin menghapus account ini?',
    'Peringatan',
    {
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      type: 'warning',
    }
  ).then(async () => {
    await deleteAccount()
  }).catch(() => {
    // Cancel
  })
}

// Hapus account
const deleteAccount = async () => {
  try {
    loading.value = true
    const response = await useApi().delete(`/accounts/${accountData.value?.unique_id}`)
    
    if (response.status === 200) {
      ElMessage.success('Account berhasil dihapus')
      router.push('/accounts')
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || 'Gagal menghapus account')
  } finally {
    loading.value = false
  }
}

// Ambil data account
const fetchAccountData = async () => {
  try {
    loading.value = true
    const accountId = route.params.id as string
    
    const response = await useFetchApi<BaseResponse<Account>>(`/account-read/${accountId}`, 'fetch-detail', 'get', null);
    if(response.status.value == 'success'){
      const account: Account|null = response.data.value?.data as Account;
      if(account != null){
        accountData.value = account;
      }else{
        ElMessage.error('Gagal memuat data account')
        goBack();
      }
    }
    
    // // Ambil sub accounts
    // const subAccountsResponse = await useApi().get('/accounts', {
    //   params: { parent_id: accountId }
    // })
    // if (subAccountsResponse.status === 200) {
    //   subAccounts.value = subAccountsResponse.data.data.query
    // }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || 'Gagal memuat data account')
    goBack();
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAccountData()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-descriptions {
  margin-top: 20px;
}

.el-tag {
  margin-right: 10px;
}
</style>