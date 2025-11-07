<template>
  <TrumsWrapper>
    <!-- Header dengan Breadcrumb -->
    <el-page-header @back="goBack" class="mb-6">
      <template #content>
        <div class="flex items-center">
          <el-avatar :size="60" :src="peopleData.file_id!" class="mr-4">
            {{ peopleData.name?.charAt(0) || 'U' }}
          </el-avatar>
          <div>
            <h1 class="text-2xl font-bold">{{ peopleData.name || 'No Name' }}</h1>
            <p class="text-gray-500">{{ peopleData.unique_code }}</p>
          </div>
        </div>
      </template>
      <template #extra>
        <div class="flex gap-2">
          <el-button type="primary" @click="editPeople">
            Edit Profile
          </el-button>
          <el-button @click="goBack">
            Kembali
          </el-button>
        </div>
      </template>
    </el-page-header>

    <el-row :gutter="24">
      <!-- Kolom Kiri: Informasi Personal & Pekerjaan -->
      <el-col :span="12">
        <!-- Informasi Personal -->
        <el-card class="mb-6">
          <template #header>
            <div class="flex items-center">
              <el-icon class="mr-2"><User /></el-icon>
              <span>Informasi Personal</span>
            </div>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="Kode Unik">{{ peopleData.unique_code }}</el-descriptions-item>
            <el-descriptions-item label="Nama">{{ peopleData.name || '-' }}</el-descriptions-item>
            <el-descriptions-item label="Email">{{ peopleData.email || '-' }}</el-descriptions-item>
            <el-descriptions-item label="Telepon">{{ peopleData.phone || '-' }}</el-descriptions-item>
            <el-descriptions-item label="Jenis Kelamin">
              <el-tag :type="getGenderTagType(peopleData.gender)">
                {{ getGenderDisplay(peopleData.gender) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="Tanggal Bergabung">
              {{ formatDate(peopleData.join_date) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- Informasi Pekerjaan -->
        
      </el-col>
      <el-col :span="12">
          <el-card>
            <template #header>
              <div class="flex items-center">
                <el-icon class="mr-2"><Briefcase /></el-icon>
                <span>Informasi Pekerjaan</span>
              </div>
            </template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="Departemen">
                <el-tag v-if="peopleData.departement" type="primary">
                  {{ peopleData.departement }}
                </el-tag>
                <span v-else>-</span>
              </el-descriptions-item>
              <el-descriptions-item label="Posisi">
                <el-tag v-if="peopleData.position" type="success">
                  {{ peopleData.position }}
                </el-tag>
                <span v-else>-</span>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
      </el-col>
      
    </el-row>

    <el-card class="my-3" v-if="!loading">
      <template #header>
        Setting Permission
      </template>
      <PermissionTreeManager 
        :people-id="peopleId"
        :current-permissions="peopleData.user_permissions ?? []"
        @permissions-updated="handlePermissionsUpdated"
        @cancel="showPermissionDialog = false"
      />
    </el-card>
  </TrumsWrapper>
    
</template>

<script lang="ts" setup>
import { 
  User, Briefcase, Lock, Plus, Delete, Check,
  Unlock, Folder, FolderOpened, Key
} from '@element-plus/icons-vue'
import type { Menu, Permission } from '~/types/menu'
import type { People, UserPermission } from '~/types/people'
import PermissionTreeManager from '~/components/trums/PermissionTreeManager.vue'


interface PermissionTreeNode {
  unique_id: string
  name: string
  type: 'menu' | 'submenu' | 'permission'
  code?: string
  is_granted?: boolean
  children?: PermissionTreeNode[]
}

const router = useRouter()
const route = useRoute()
const peopleId = computed(() => route.params.id as string)

// State
const peopleData = ref<People>({} as People)
const userPermissions = ref<UserPermission[]>([]);
const permissionTree = ref<PermissionTreeNode[]>([])
const showPermissionDialog = ref(false)
const loading = ref<boolean>(true);

// Tree configuration
const treeProps = {
  children: 'children',
  label: 'name'
}

// Computed
const totalMenus = computed(() => {
  return peopleData.value.menu?.length || 0;
})

const totalPermissions = computed(() => {
  return peopleData.value.user_permissions?.length || 0;
})


// Methods
const goBack = () => router.push('/people')

const fetchPeopleDetail = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<{ data: People }>(
      `/people-read/${peopleId.value}`, 
      'get-people-detail', 
      'get',
      null
    )
    
    if (response.status.value === 'success') {
      peopleData.value = response.data.value?.data || {} as People
    }
  } catch (error) {
    ElMessage.error('Gagal memuat detail people')
  } finally {
    loading.value = false;
  }
}

const buildPermissionTree = async () => {
  try {
    // Fetch semua menu dengan struktur hierarchy
    const response = await useFetchApi<{ data: Menu[] }>(
      '/menus-with-permissions', 
      'get-menus-with-permissions', 
      'get',
      null,
    )
    
    if (response.status.value === 'success') {
      const menus = response.data.value?.data || []
      permissionTree.value = transformMenusToTree(menus)
    }
  } catch (error) {
    ElMessage.error('Gagal membangun tree permissions')
  }
}

const transformMenusToTree = (menus: Menu[]): PermissionTreeNode[] => {
  return menus.map(menu => {
    const node: PermissionTreeNode = {
      unique_id: menu.unique_id,
      name: menu.name,
      type: 'menu'
    }

    // Jika menu memiliki submenus
    if (menu.menus && menu.menus.length > 0) {
      node.children = menu.menus.map((submenu: any) => ({
        unique_id: submenu.unique_id,
        name: submenu.name,
        type: 'submenu',
        children: transformPermissions(submenu.permissions || [])
      }))
    } else {
      // Jika menu tidak memiliki submenu, langsung attach permissions
      node.children = transformPermissions(menu.permissions || [])
    }

    return node
  })
}

const transformPermissions = (permissions: Permission[]): PermissionTreeNode[] => {
  return permissions.map(permission => ({
    unique_id: permission.unique_id,
    name: permission.permission_name,
    type: 'permission',
    code: permission.slug,
    // is_granted: userPermissions.value.some((up: { unique_id: any }) => up.unique_id === permission.unique_id)
    is_granted: false,
  }))
}

const removePermission = async (permissionId: string) => {
  try {
    await ElMessageBox.confirm(
      'Apakah Anda yakin ingin mencabut permission ini?',
      'Konfirmasi Cabut Permission',
      {
        confirmButtonText: 'Ya, Cabut',
        cancelButtonText: 'Batal',
        type: 'warning',
      }
    )

    const response = await useFetchApi(
      `/people/${peopleId.value}/permissions/${permissionId}`, 
      'remove-permission', 
      'delete',
      null,
    )

    if (response.status.value === 'success') {
      ElMessage.success('Permission berhasil dicabut')
      
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Gagal mencabut permission')
    }
  }
}

const grantPermission = async (permissionId: string) => {
  try {
    const response = await useFetchApi(
      `/people/${peopleId.value}/permissions`, 
      'grant-permission', 
      'post',
      { permissions: [permissionId] }
    )

    if (response.status.value === 'success') {
      ElMessage.success('Permission berhasil diberikan')
      
    }
  } catch (error) {
    ElMessage.error('Gagal memberikan permission')
  }
}

const handlePermissionsUpdated = () => {
  showPermissionDialog.value = false
  ElMessage.success('Permissions berhasil di-update')
  fetchPeopleDetail();
}

const editPeople = () => {
  router.push(`/people/edit/${peopleId.value}`)
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getGenderDisplay = (gender: string | null) => {
  if (!gender) return 'Tidak Diketahui'
  const genderMap: { [key: string]: string } = {
    'male': 'Laki-laki', 'female': 'Perempuan',
    'M': 'Laki-laki', 'F': 'Perempuan'
  }
  return genderMap[gender.toLowerCase()] || gender
}

const getGenderTagType = (gender: string | null): "success" | "warning" | "info" | "primary" | "danger" => {
  if (!gender) return 'info'
  const genderMap: { [key: string]: string } = {
    'male': 'primary', 'female': 'danger',
    'M': 'primary', 'F': 'danger'
  }
  return (genderMap[gender.toLowerCase()] || 'info') as "success" | "warning" | "info" | "primary" | "danger";
}

// Lifecycle
onMounted(async () => {
  await Promise.all([fetchPeopleDetail()])
})
</script>

<style scoped>
.permission-tree-container {
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 16px;
  max-height: 500px;
  overflow-y: auto;
}

.permission-tree {
  background: transparent;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 4px 0;
}

.node-label {
  font-weight: 500;
}

.permission-code {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  padding: 2px 6px;
  border-radius: 4px;
}

.node-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.custom-tree-node:hover .node-actions {
  opacity: 1;
}

:deep(.el-tree-node__content) {
  height: 40px;
  border-radius: 4px;
  margin: 2px 0;
}

:deep(.el-tree-node__content:hover) {
  background-color: var(--el-fill-color-light);
}
</style>