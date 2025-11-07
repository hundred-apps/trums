<!-- components/PermissionTreeManager.vue -->
<template>
  <div class="permission-tree-manager">
    <!-- Search & Filter -->
    <div class="filter-section mb-4">
      <el-input
        v-model="searchQuery"
        placeholder="Cari menu atau permission..."
        clearable
        class="mb-3"
        :prefix-icon="Search"
      />
      
      <div class="flex gap-2">
        <el-button 
          size="small" 
          :type="filterGranted === null ? 'primary' : ''"
          @click="filterGranted = null"
        >
          Semua
        </el-button>
        <el-button 
          size="small" 
          :type="filterGranted === true ? 'primary' : ''"
          @click="filterGranted = true"
        >
          Granted Only
        </el-button>
        <el-button 
          size="small" 
          :type="filterGranted === false ? 'primary' : ''"
          @click="filterGranted = false"
        >
          Not Granted
        </el-button>
      </div>
    </div>

    <!-- Tree dengan Checkbox -->
    <div class="tree-section">
      <el-tree
        ref="treeRef"
        :data="filteredTree"
        node-key="unique_id"
        :props="treeProps"
        :expand-on-click-node="false"
        show-checkbox
        :default-expand-all="true"
        :check-strictly="false"
        @check="handleCheck"
        class="permission-tree"
      >
        <template #default="{ node, data }">
          <div class="custom-tree-node">
            <!-- Icon berdasarkan tipe -->
            <el-icon v-if="data.type === 'menu'" class="mr-2 text-blue-500">
              <Folder />
            </el-icon>
            <el-icon v-else-if="data.type === 'submenu'" class="mr-2 text-green-500">
              <FolderOpened />
            </el-icon>
            <el-icon v-else class="mr-2 text-orange-500">
              <Key />
            </el-icon>

            <!-- Label -->
            <span class="node-label">{{ data.name }}</span>

            <!-- Permission Code -->
            <span v-if="data.code" class="permission-code ml-2">
              {{ data.code }}
            </span>

            <!-- Approval Badge untuk permission bertipe approval -->
            <div v-if="data.type === 'permission' && data.permission_type === 'approval'" class="approval-info ml-2">
              <el-tooltip 
                :content="`Approval Chain: ${data.approval_length} level${data.approval_length > 1 ? 's' : ''}`"
                placement="top"
              >
                <el-tag 
                  v-if="data.approval_length > 0" 
                  type="warning" 
                  size="small"
                  class="approval-tag"
                >
                  <el-icon class="mr-1"><Warning /></el-icon>
                  Approval ({{ data.approval_length }})
                </el-tag>
              </el-tooltip>
            </div>

            <!-- Status tag -->
            <el-tag 
              v-if="data.type === 'permission' && data.is_granted" 
              type="success" 
              size="small"
              class="ml-2"
            >
              Granted
            </el-tag>
          </div>
        </template>
      </el-tree>
    </div>

    <!-- Form Input Posisi Approval untuk permission yang dipilih -->
    <div v-if="approvalSelections.length > 0" class="approval-position-section mt-4 p-4 bg-orange-50 rounded border">
      <h4 class="text-orange-800 font-medium mb-3">
        <el-icon class="mr-1"><Warning /></el-icon>
        Set Posisi Approval
      </h4>
      
      <div v-for="selection in approvalSelections" :key="selection.unique_id" class="approval-item mb-3 last:mb-0">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <span class="font-medium text-sm">{{ selection.name }}</span>
            <span class="text-xs text-gray-500 ml-2">(Approval Chain: {{ selection.approval_length }} level)</span>
          </div>
          
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-600">Posisi:</span>
            <el-select 
              v-model="selection.user_approval_position" 
              size="small" 
              style="width: 100px;"
              placeholder="Pilih"
              @change="onApprovalPositionChange(selection)"
            >
              <el-option 
                v-for="position in generatePositionOptions(selection.approval_length)" 
                :key="position"
                :label="`Ke-${position}`"
                :value="position"
              />
            </el-select>
            
            <el-button 
              type="danger" 
              text 
              size="small"
              @click="unselectApprovalPermission(selection.unique_id)"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </div>
        
        <!-- Warning jika posisi belum dipilih -->
        <div v-if="!selection.user_approval_position" class="text-red-500 text-xs mt-1 flex items-center">
          <el-icon class="mr-1"><InfoFilled /></el-icon>
          Pilih posisi approval untuk permission ini
        </div>
      </div>
    </div>

    <!-- Selected Summary -->
    <div v-if="selectedCount > 0" class="selected-summary mt-4 p-3 bg-blue-50 rounded">
      <div class="flex justify-between items-center">
        <span class="text-sm text-blue-700">
          {{ selectedCount }} permission dipilih untuk di-update
          <span v-if="approvalSelections.length > 0" class="text-orange-600">
            ({{ approvalSelections.length }} approval permissions)
          </span>
        </span>
        <el-button type="primary" size="small" @click="showSelectedDetails = !showSelectedDetails">
          {{ showSelectedDetails ? 'Sembunyikan' : 'Detail' }}
        </el-button>
      </div>

      <div v-if="showSelectedDetails" class="mt-2">
        <el-tag
          v-for="permission in selectedPermissions"
          :key="permission.unique_id"
          :type="permission.permission_type === 'approval' ? 'warning' : 'success'"
          size="small"
          class="mr-2 mb-2"
          closable
          @close="unselectPermission(permission.unique_id)"
        >
          {{ permission.name }}
          <span v-if="permission.permission_type === 'approval' && permission.user_approval_position" class="ml-1">
            [Posisi: {{ permission.user_approval_position }}]
          </span>
        </el-tag>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-between items-center mt-6">
      <div class="text-sm text-gray-500">
        Total: {{ totalPermissions }} permissions
        <span v-if="approvalPermissionsCount > 0" class="ml-2 text-orange-500">
          ({{ approvalPermissionsCount }} approval permissions)
        </span>
      </div>
      <div class="flex gap-2">
        <el-button @click="$emit('cancel')">
          Batal
        </el-button>
        <el-button 
          type="primary" 
          :loading="loading"
          :disabled="!canSubmit"
          @click="updatePermissions"
        >
          Update Permissions ({{ selectedCount }})
        </el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Search, Folder, FolderOpened, Key, Warning, Close, InfoFilled } from '@element-plus/icons-vue'
import type { Menu, Permission } from '~/types/menu'
import type { UserPermission } from '~/types/people'
import type { RequestSearch } from '~/types/request_search'
import type { ResponsePagination } from '~/types/response_pagination'

interface PermissionTreeNode {
  unique_id: string
  name: string
  type: 'menu' | 'submenu' | 'permission'
  code?: string
  is_granted?: boolean
  permission_type?: 'basic' | 'approval'
  approval_type?: 'parallel' | 'sequential'
  approval_length?: number
  user_approval_position?: number // Posisi user dalam chain approval (1-based)
  children?: PermissionTreeNode[]
}

interface ApprovalSelection {
  unique_id: string
  name: string
  approval_length: number
  user_approval_position?: number
}

interface Props {
  peopleId: string
  currentPermissions: UserPermission[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  permissionsUpdated: []
  cancel: []
}>()

const treeRef = ref()
const loading = ref(false)

// State
const permissionTree = ref<PermissionTreeNode[]>([])
const searchQuery = ref('')
const filterGranted = ref<boolean | null>(null)
const showSelectedDetails = ref(false)
const approvalSelections = ref<ApprovalSelection[]>([]) // Menyimpan permission approval yang dipilih

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      parent_id: ['null']
    }
  ],
  sort: null,
  limit: `50`,
  offset: `1`,
  table: "menus",
});

// Computed
const filteredTree = computed(() => {
  if (!searchQuery.value && filterGranted.value === null) {
    return permissionTree.value
  }

  const filterNodes = (nodes: PermissionTreeNode[]): PermissionTreeNode[] => {
    return nodes
      .map(node => {
        const newNode = { ...node }
        
        if (newNode.children) {
          newNode.children = filterNodes(newNode.children)
        }

        const matchesSearch = !searchQuery.value || 
          newNode.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          (newNode.code && newNode.code.toLowerCase().includes(searchQuery.value.toLowerCase()))

        const matchesGrantFilter = filterGranted.value === null ||
          (newNode.type === 'permission' && newNode.is_granted === filterGranted.value)

        return matchesSearch && matchesGrantFilter ? newNode : null
      })
      .filter(Boolean) as PermissionTreeNode[]
  }

  return filterNodes(permissionTree.value)
})

const selectedPermissions = computed(() => {
  const checkedKeys = treeRef.value?.getCheckedKeys() || []
  const halfCheckedKeys = treeRef.value?.getHalfCheckedKeys() || []
  const allCheckedKeys = [...checkedKeys, ...halfCheckedKeys]
  
  return allCheckedKeys
    .map(key => {
      const permission = findPermissionByKey(key)
      if (permission && permission.type === 'permission' && permission.permission_type === 'approval') {
        // Untuk approval permissions, tambahkan data dari approvalSelections
        const approvalSelection = approvalSelections.value.find(s => s.unique_id === permission.unique_id)
        if (approvalSelection) {
          return {
            ...permission,
            user_approval_position: approvalSelection.user_approval_position
          }
        }
      }
      return permission
    })
    .filter(Boolean) as PermissionTreeNode[]
})

const selectedCount = computed(() => selectedPermissions.value.length)

const totalPermissions = computed(() => {
  let count = 0
  const countPermissions = (nodes: PermissionTreeNode[]) => {
    nodes.forEach(node => {
      if (node.type === 'permission') count++
      if (node.children) countPermissions(node.children)
    })
  }
  countPermissions(permissionTree.value)
  return count
})

const approvalPermissionsCount = computed(() => {
  let count = 0
  const countApprovalPermissions = (nodes: PermissionTreeNode[]) => {
    nodes.forEach(node => {
      if (node.type === 'permission' && node.permission_type === 'approval') count++
      if (node.children) countApprovalPermissions(node.children)
    })
  }
  countApprovalPermissions(permissionTree.value)
  return count
})

const canSubmit = computed(() => {
  if (selectedCount.value === 0) return false
  
  // Cek apakah semua approval permissions sudah dipilih posisinya
  const approvalPermissionsWithoutPosition = approvalSelections.value.filter(
    selection => !selection.user_approval_position
  )
  
  return approvalPermissionsWithoutPosition.length === 0
})

// Methods
const generatePositionOptions = (approvalLength: number): number[] => {
  return Array.from({ length: approvalLength }, (_, i) => i + 1)
}

const handleCheck = (node: PermissionTreeNode, checked: any) => {
  if (node.type === 'permission' && node.permission_type === 'approval') {
    const isChecked = checked.checkedKeys.includes(node.unique_id)
    
    if (isChecked) {
      // Permission approval dicentang - tambahkan ke approvalSelections
      if (!approvalSelections.value.find(s => s.unique_id === node.unique_id)) {
        approvalSelections.value.push({
          unique_id: node.unique_id,
          name: node.name,
          approval_length: node.approval_length || 1,
          user_approval_position: undefined
        })
      }
    } else {
      // Permission approval diuncentang - hapus dari approvalSelections
      const index = approvalSelections.value.findIndex(s => s.unique_id === node.unique_id)
      if (index !== -1) {
        approvalSelections.value.splice(index, 1)
      }
    }
  }
}

const onApprovalPositionChange = (selection: ApprovalSelection) => {
  console.log(`Posisi approval untuk ${selection.name}: ${selection.user_approval_position}`)
  // Anda bisa tambahkan logic tambahan di sini
}

const unselectApprovalPermission = (permissionId: string) => {
  // Uncheck permission di tree
  treeRef.value?.setChecked(permissionId, false)
  
  // Hapus dari approvalSelections
  const index = approvalSelections.value.findIndex(s => s.unique_id === permissionId)
  if (index !== -1) {
    approvalSelections.value.splice(index, 1)
  }
}

const buildPermissionTree = async () => {
  try {
    const response = await useFetchApi<ResponsePagination<Menu[]>>(
      '/search', 
      'get-menus-with-permissions', 
      'post',
      request_search.value,
    )
    
    if (response.status.value === 'success') {
      const menus = response.data.value?.data || []
      permissionTree.value = transformMenusToTree(menus)
      await nextTick()
      await nextTick()
      await nextTick()
      setInitialCheckedNodes()
    }
  } catch (error) {
    ElMessage.error('Gagal memuat permission tree')
  }
}

const transformMenusToTree = (menus: Menu[]): PermissionTreeNode[] => {
  return menus.map(menu => {
    const node: PermissionTreeNode = {
      unique_id: menu.unique_id,
      name: menu.name,
      type: 'menu'
    }

    if (menu.menus && menu.menus.length > 0) {
      node.children = menu.menus.map((submenu: Menu) => ({
        unique_id: submenu.unique_id,
        name: submenu.name,
        type: 'submenu',
        children: transformPermissions(submenu.permissions || [])
      }))

      menu.permissions.forEach(element => {
          node.children!.push({
            unique_id: element.unique_id,
            name: element.permission_name,
            type: 'permission',
            permission_type: element.type,
            approval_type: element.approval_type,
            approval_length: element.approval_length,
            children: []
        })
      });
    } else {
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
    code: permission.unique_id,
    is_granted: props.currentPermissions.some(up => up.permission_id === permission.unique_id),
    permission_type: permission.type,
    approval_type: permission.approval_type,
    approval_length: permission.approval_length
  }))
}

const setInitialCheckedNodes = () => {
  const grantedPermissionIds = props.currentPermissions.map(p => p.permission_id)
  console.log('granted permission',grantedPermissionIds);
  treeRef.value?.setCheckedKeys(grantedPermissionIds)
}

const findPermissionByKey = (key: string): PermissionTreeNode | null => {
  const findInNodes = (nodes: PermissionTreeNode[]): PermissionTreeNode | null => {
    for (const node of nodes) {
      if (node.unique_id === key && node.type === 'permission') {
        return node
      }
      if (node.children) {
        const found = findInNodes(node.children)
        if (found) return found
      }
    }
    return null
  }
  return findInNodes(permissionTree.value)
}

const unselectPermission = (permissionId: string) => {
  treeRef.value?.setChecked(permissionId, false)
}

const updatePermissions = async () => {
  if (!canSubmit.value) return

  loading.value = true
  try {
    // Siapkan data permissions dengan informasi approval position
    const permissionsWithApprovalData = selectedPermissions.value.map(permission => {
      if (permission.permission_type === 'approval') {
        const approvalSelection = approvalSelections.value.find(s => s.unique_id === permission.unique_id)
        return {
          permission_id: permission.unique_id,
          approval_position: approvalSelection?.user_approval_position
        }
      }
      return {
        permission_id: permission.unique_id,
        approval_position: null
      }
    })

    const response = await useFetchApi(
      `/user-permission-create`, 
      'update-permissions', 
      'post',
      { 
        people_id: props.peopleId, 
        permissions: permissionsWithApprovalData.map((value) => value.permission_id), 
      }
    )

    if (response.status.value === 'success') {
      ElMessage.success('Permissions berhasil di-update')
      emit('permissionsUpdated')
    }
  } catch (error) {
    ElMessage.error('Gagal update permissions')
  } finally {
    loading.value = false
  }
}

// Tree configuration
const treeProps = {
  children: 'children',
  label: 'name'
}

// Lifecycle
onMounted(() => {
  buildPermissionTree()
})
</script>

<style scoped>
.permission-tree-manager {
  display: flex;
  flex-direction: column;
}

.filter-section {
  border-bottom: 1px solid var(--el-border-color);
  padding-bottom: 16px;
}

.tree-section {
  flex: 1;
  overflow-y: auto;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  padding: 12px;
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

.approval-info {
  display: flex;
  align-items: center;
}

.approval-tag {
  background-color: #fff7e6;
  border-color: #ffd591;
  color: #fa8c16;
}

.approval-position-section {
  border: 1px solid #ffd591;
}

.selected-summary {
  max-height: 120px;
  overflow-y: auto;
}

:deep(.el-tree-node__content) {
  border-radius: 4px;
  margin: 2px 0;
}

:deep(.el-tree-node__content:hover) {
  background-color: var(--el-fill-color-light);
}
</style>