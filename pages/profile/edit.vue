<template>
  <TrumsWrapper>
    <!-- Header dengan Breadcrumb -->
    <el-page-header @back="goBack" class="mb-6">
        
      <template #extra>
        <div class="flex gap-2">
          <el-button @click="goBack">
            Batal
          </el-button>
          <el-button 
                type="primary" 
                size="default" 
                :loading="loading.submit"
                @click="handleSubmit"
                class="w-full"
            >
            <el-icon class="mr-2"><Check /></el-icon>
            Simpan Perubahan
        </el-button>
        </div>
      </template>
    </el-page-header>

    <el-row :gutter="24">
      <!-- Kolom Kiri: Form Edit Profile -->
      <el-col :xs="24" :md="16">
        <!-- Basic Information Form -->
        <el-card class="mb-6">
          <template #header>
            <div class="flex items-center">
              <el-icon class="mr-2"><User /></el-icon>
              <span>Informasi Dasar</span>
            </div>
          </template>
          
          <el-form 
            ref="basicInfoFormRef" 
            :model="formData" 
            :rules="basicInfoRules"
            label-width="180px"
            label-position="top"
            size="large"
          >
          
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Nama Lengkap" prop="name">
                  <el-input 
                    v-model="formData.name" 
                    placeholder="Masukkan nama lengkap"
                    clearable
                  />
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="Email" prop="email">
                  <el-input 
                    v-model="formData.email" 
                    type="email"
                    placeholder="nama@perusahaan.com"
                    clearable
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Nomor Telepon" prop="phone">
                  <el-input 
                    v-model="formData.phone" 
                    placeholder="081234567890"
                    clearable
                  />
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="Jenis Kelamin" prop="gender">
                  <el-select
                    v-model="formData.gender!"
                    placeholder="Pilih jenis kelamin"
                    style="width: 100%"
                  >
                    <el-option label="Laki-laki" value="M" />
                    <el-option label="Perempuan" value="F" />
                    <el-option label="Lainnya" value="O" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            
          </el-form>
        </el-card>

        <!-- Department & Position Information -->
        <el-card class="mb-6">
          <template #header>
            <div class="flex items-center">
              <el-icon class="mr-2"><Briefcase /></el-icon>
              <span>Informasi Departemen & Posisi</span>
            </div>
          </template>
          
          <el-form 
            ref="departmentFormRef" 
            :model="formData" 
            :rules="departmentRules"
            label-width="180px"
            label-position="top"
            size="large"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Departemen" prop="departement_id">
                  <el-select
                    v-model="formData.departement_id!"
                    placeholder="Pilih departemen"
                    filterable
                    style="width: 100%"
                    @change="handleDepartmentChange"
                  >
                    <el-option 
                      v-for="dept in departments" 
                      :key="dept.value" 
                      :label="dept.label" 
                      :value="dept.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="Posisi" prop="position_id">
                  <el-select
                    v-model="formData.position_id!"
                    placeholder="Pilih posisi"
                    filterable
                    style="width: 100%"
                    :disabled="!formData.departement_id"
                  >
                    <el-option 
                      v-for="pos in filteredPositions" 
                      :key="pos.value" 
                      :label="pos.label" 
                      :value="pos.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            
          </el-form>
        </el-card>

        
      </el-col>

      <!-- Kolom Kanan: Photo Upload & Action Buttons -->
      <el-col :xs="24" :md="8">
        <!-- Profile Photo Upload -->
        <el-card class="mb-6">
          <template #header>
            <div class="flex items-center">
              <el-icon class="mr-2"><Camera /></el-icon>
              <span>Foto Profil</span>
            </div>
          </template>

          <div class="text-center">
            <el-upload
              class="avatar-uploader"
              :action="uploadUrl"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
              :on-error="handleUploadError"
              :headers="uploadHeaders"
              :data="uploadData"
            >
              <el-avatar 
                v-if="peopleData.photo" 
                :size="150" 
                :src="`${imageUrl}/${peopleData.photo.image_path}/${peopleData.photo.filename}`"
                class="mb-4 mx-auto cursor-pointer border-2 border-gray-200"
              >
                {{ formData.name?.charAt(0) || 'U' }}
              </el-avatar>
              <div 
                v-else 
                class="avatar-uploader-placeholder mb-4 mx-auto cursor-pointer"
              >
                <el-icon :size="60" class="text-gray-400">
                  <Camera />
                </el-icon>
                <p class="text-sm text-gray-500 mt-2">Klik untuk upload foto</p>
              </div>
            </el-upload>

            <div class="mt-4">
              <p class="text-sm text-gray-500 mb-3">
                Ukuran maksimal 2MB. Format: JPG, PNG
              </p>
              <div class="flex gap-2 justify-center">
                <el-button 
                  v-if="formData.file_id" 
                  type="danger" 
                  size="small"
                  @click="removeProfilePhoto"
                >
                  Hapus Foto
                </el-button>
                <el-button 
                  type="info" 
                  size="small"
                  @click="openFileManager"
                >
                  Pilih dari File Manager
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
        
        
      </el-col>
    </el-row>

    
    <!-- Confirm Dialog -->
    <el-dialog
      v-model="showConfirmDialog"
      :title="dialogConfig.title"
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="text-center py-4">
        <el-icon :size="60" class="mb-4" :color="dialogConfig.color">
          <component :is="dialogConfig.icon" />
        </el-icon>
        <h3 class="text-lg font-semibold mb-2">{{ dialogConfig.title }}</h3>
        <p class="text-gray-600">{{ dialogConfig.message }}</p>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showConfirmDialog = false" :disabled="loading.confirm">
            Batal
          </el-button>
          <el-button 
            :type="dialogConfig.buttonType"
            :loading="loading.confirm"
            @click="confirmAction"
          >
            {{ dialogConfig.confirmText }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- File Manager Dialog -->
    <el-dialog
      v-model="showFileManager"
      title="File Manager"
      width="80%"
      top="5vh"
    >
      <FileManager 
        v-if="showFileManager"
        @select-file="handleFileSelect"
        @close="showFileManager = false"
      />
    </el-dialog>
  </TrumsWrapper>
</template>

<script lang="ts" setup>
import { 
  User, Briefcase, Camera, Check, Delete, Refresh,
  Setting, View, Lock, Unlock, InfoFilled, Key,
  Calendar, Warning, SuccessFilled, WarningFilled
} from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadProps } from 'element-plus'
import type { Contact } from '~/types/contact'
import type { People } from '~/types/people'
import type { RequestSearch } from '~/types/request_search'
import type { ResponsePagination } from '~/types/response_pagination'

const router = useRouter()
const route = useRoute()
const peopleId = computed(() => route.query.id as string)

const config = useRuntimeConfig();
const imageUrl = config.public.baseImageURL;

// Refs
const basicInfoFormRef = ref<FormInstance>()
const departmentFormRef = ref<FormInstance>()

// State
const peopleData = ref<People>({} as People)
const formData = ref<People>({
  id: 0,
  unique_id: '',
  unique_code: '',
  gid: '',
  name: '',
  email: '',
  phone: '',
  password: '',
  join_date: 0,
  gender: '',
  departement_id: '',
  position_id: '',
  file_id: '',
  created_at: 0,
  created_by: null,
  updated_at: 0,
  parent_people: '',
  position: '',
  departement: '',
  version: 1,
  devices: []
})

const request_search = ref<RequestSearch>({
    keyword: '',
    table: '',
    column: [],
    limit: '100',
    offset: '1',
    sort: null,
})


const showPasswordField = ref(false)
const loading = ref({
  submit: false,
  confirm: false
})

const showConfirmDialog = ref(false)
const showFileManager = ref(false)
const joinDateFormatted = ref('')

const dialogConfig = ref({
  title: '',
  message: '',
  confirmText: '',
  icon: Warning,
  color: '#E6A23C',
  buttonType: 'primary' as 'primary' | 'danger' | 'success',
  action: '' as 'submit' | 'reset_password' | 'deactivate'
})

// Data Options
const departments = ref([
  { label: 'IT & Development', value: 'it', positions: ['software_engineer', 'senior_dev'] },
  { label: 'Human Resources', value: 'hr', positions: ['hr_manager', 'recruiter'] },
  { label: 'Marketing', value: 'marketing', positions: ['marketing_specialist', 'content_writer'] },
  { label: 'Finance', value: 'finance', positions: ['accountant', 'financial_analyst'] },
  { label: 'Operations', value: 'operations', positions: ['ops_manager', 'logistics'] },
])

const allPositions = ref([
  { value: 'software_engineer', label: 'Software Engineer', department: 'it' },
  { value: 'senior_dev', label: 'Senior Developer', department: 'it' },
  { value: 'hr_manager', label: 'HR Manager', department: 'hr' },
  { value: 'recruiter', label: 'Recruiter', department: 'hr' },
  { value: 'marketing_specialist', label: 'Marketing Specialist', department: 'marketing' },
  { value: 'content_writer', label: 'Content Writer', department: 'marketing' },
  { value: 'accountant', label: 'Accountant', department: 'finance' },
  { value: 'financial_analyst', label: 'Financial Analyst', department: 'finance' },
  { value: 'ops_manager', label: 'Operations Manager', department: 'operations' },
  { value: 'logistics', label: 'Logistics Coordinator', department: 'operations' },
])

const parentPeopleOptions = ref<People[]>([])

// Computed
const filteredPositions = computed(() => {
  if (!formData.value.departement_id) return []
  
  const department = departments.value.find(d => d.value === formData.value.departement_id)
  if (!department) return []
  
  return allPositions.value.filter(pos => 
    department.positions.includes(pos.value)
  )
})

const uploadUrl = computed(() => {
  return '/api/upload' // Ganti dengan endpoint upload Anda
})

const uploadHeaders = computed(() => {
  const token = useCookie('auth_token')
  return {
    Authorization: `Bearer ${token.value}`
  }
})

const uploadData = computed(() => ({
  type: 'profile',
  people_id: peopleId.value
}))

// Validation Rules
const basicInfoRules: FormRules = {
  unique_code: [
    { required: true, message: 'Kode unik harus diisi', trigger: 'blur' }
  ],
  name: [
    { required: true, message: 'Nama harus diisi', trigger: 'blur' },
    { min: 3, message: 'Minimal 3 karakter', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Email harus diisi', trigger: 'blur' },
    { type: 'email', message: 'Format email tidak valid', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: 'Jenis kelamin harus dipilih', trigger: 'change' }
  ]
}

const departmentRules: FormRules = {
  departement_id: [
    { required: true, message: 'Departemen harus dipilih', trigger: 'change' }
  ],
  position_id: [
    { required: true, message: 'Posisi harus dipilih', trigger: 'change' }
  ],
  join_date: [
    { required: true, message: 'Tanggal bergabung harus diisi', trigger: 'change' }
  ]
}

// Methods
const goBack = () => {
  router.push(`/people/${peopleId.value}`)
}



const fetchPeopleDetail = async () => {
  try {
    const response = await useFetchApi<{ data: People }>(
      `/people-read/${peopleId.value}`, 
      'get-people-detail', 
      'post',
      null
    )
    
    if (response.status.value === 'success') {
      peopleData.value = response.data.value?.data || {} as People
      populateFormData()
      await fetchParentPeopleOptions()
    }
  } catch (error) {
    ElMessage.error('Gagal memuat detail people')
  }
}

const fetchParentPeopleOptions = async () => {
  try {
    const response = await useFetchApi<{ data: People[] }>(
      '/people', 
      'get-people-list', 
      'get',
      { limit: 100 }
    )
    
    if (response.status.value === 'success') {
      parentPeopleOptions.value = response.data.value?.data || []
    }
  } catch (error) {
    console.error('Failed to fetch parent people:', error)
  }
}

const populateFormData = () => {
  const data = { ...peopleData.value }
  
  // Convert join_date timestamp to date string
  if (data.join_date) {
    const date = new Date(data.join_date * 1000)
    joinDateFormatted.value = date.toISOString().split('T')[0]
  }
  
  formData.value = {
    ...data,
    password: '' // Never populate password field
  }
}

const handleJoinDateChange = (date: string) => {
  if (date) {
    const timestamp = Math.floor(new Date(date).getTime() / 1000)
    formData.value.join_date = timestamp
  } else {
    formData.value.join_date = 0
  }
}

const handleDepartmentChange = (deptId: string) => {
  // Reset position when department changes
  formData.value.position_id = ''
}

const handleSubmit = async () => {
  try {
    // Validate forms
    const [basicValid, deptValid] = await Promise.all([
      basicInfoFormRef.value?.validate(),
      departmentFormRef.value?.validate()
    ]).catch(() => [false, false])

    if (!basicValid || !deptValid) {
      ElMessage.warning('Harap periksa form yang belum valid')
      return
    }

    // Show confirmation dialog
    dialogConfig.value = {
      title: 'Simpan Perubahan',
      message: 'Apakah Anda yakin ingin menyimpan perubahan pada profil ini?',
      confirmText: 'Ya, Simpan',
      icon: SuccessFilled,
      color: '#67C23A',
      buttonType: 'primary',
      action: 'submit'
    }
    showConfirmDialog.value = true
  } catch (error) {
    console.error('Validation error:', error)
  }
}

const confirmAction = async () => {
  loading.value.confirm = true

  try {
    if (dialogConfig.value.action === 'submit') {
      await submitForm()
    } else if (dialogConfig.value.action === 'reset_password') {
      await resetPassword()
    } else if (dialogConfig.value.action === 'deactivate') {
      await deactivateAccount()
    }
  } catch (error) {
    console.error('Action failed:', error)
  } finally {
    loading.value.confirm = false
    showConfirmDialog.value = false
  }
}

const submitForm = async () => {
  loading.value.submit = true
  
  try {
    // Prepare payload - remove null password if empty
    const payload = { ...formData.value }
    
    

    const response = await useFetchApi(
      `/people/${peopleId.value}`, 
      'update-people', 
      'put',
      payload
    )

    if (response.status.value === 'success') {
      ElMessage.success('Profil berhasil diperbarui')
      router.push(`/people/${peopleId.value}`)
    }
  } catch (error) {
    ElMessage.error('Gagal memperbarui profil')
  } finally {
    loading.value.submit = false
  }
}

const resetForm = () => {
  dialogConfig.value = {
    title: 'Reset Form',
    message: 'Apakah Anda yakin ingin mengembalikan form ke data awal? Semua perubahan yang belum disimpan akan hilang.',
    confirmText: 'Ya, Reset',
    icon: Warning,
    color: '#E6A23C',
    buttonType: 'primary',
    action: 'submit'
  }
  showConfirmDialog.value = true
  
  // Actual reset logic in confirmAction
  dialogConfig.value.action = 'submit'
}

const handleAvatarSuccess: UploadProps['onSuccess'] = (response) => {
  if (response.data?.file_id) {
    formData.value.file_id = response.data.file_id
    ElMessage.success('Foto profil berhasil diunggah')
  }
}

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const isValidType = ['image/jpeg', 'image/png'].includes(rawFile.type)
  const isLt2M = rawFile.size / 1024 / 1024 < 2

  if (!isValidType) {
    ElMessage.error('Format file harus JPG atau PNG')
    return false
  }
  
  if (!isLt2M) {
    ElMessage.error('Ukuran gambar tidak boleh lebih dari 2MB')
    return false
  }
  
  return true
}

const handleUploadError = () => {
  ElMessage.error('Upload gambar gagal')
}

const removeProfilePhoto = () => {
  formData.value.file_id = ''
  ElMessage.success('Foto profil dihapus')
}

const openFileManager = () => {
  showFileManager.value = true
}

const handleFileSelect = (file: any) => {
  if (file?.url) {
    formData.value.file_id = file.url
    ElMessage.success('Foto profil dipilih')
  }
  showFileManager.value = false
}

const handleResetPassword = () => {
  dialogConfig.value = {
    title: 'Reset Password',
    message: 'Password akan direset dan dikirim ke email user. Apakah Anda yakin?',
    confirmText: 'Ya, Reset Password',
    icon: Warning,
    color: '#E6A23C',
    buttonType: 'danger',
    action: 'reset_password'
  }
  showConfirmDialog.value = true
}

const handleDeactivateAccount = () => {
  dialogConfig.value = {
    title: 'Nonaktifkan Akun',
    message: 'Akun ini akan dinonaktifkan dan tidak dapat mengakses sistem.',
    confirmText: 'Nonaktifkan Akun',
    icon: WarningFilled,
    color: '#F56C6C',
    buttonType: 'danger',
    action: 'deactivate'
  }
  showConfirmDialog.value = true
}

const resetPassword = async () => {
  try {
    const response = await useFetchApi(
      `/people/${peopleId.value}/reset-password`, 
      'reset-password', 
      'post',
      null
    )

    if (response.status.value === 'success') {
      ElMessage.success('Password berhasil direset dan dikirim ke email')
    }
  } catch (error) {
    ElMessage.error('Gagal reset password')
  }
}

const deactivateAccount = async () => {
  try {
    const response = await useFetchApi(
      `/people/${peopleId.value}/deactivate`, 
      'deactivate-people', 
      'post',
      null
    )

    if (response.status.value === 'success') {
      ElMessage.success('Akun berhasil dinonaktifkan')
      router.push('/people')
    }
  } catch (error) {
    ElMessage.error('Gagal menonaktifkan akun')
  }
}

// Helper functions
const formatDateTime = (timestamp: number) => {
  if (!timestamp) return '-'
  return new Date(timestamp * 1000).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (timestamp: number) => {
  if (!timestamp) return '-'
  return new Date(timestamp * 1000).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getDepartmentName = (deptId: string | null) => {
  if (!deptId) return '-'
  const dept = departments.value.find(d => d.value === deptId)
  return dept?.label || deptId
}

const getPositionName = (posId: string | null) => {
  if (!posId) return '-'
  const pos = allPositions.value.find(p => p.value === posId)
  return pos?.label || posId
}

const getPeopleName = (peopleId: number) => {
  const people = parentPeopleOptions.value.find(p => p.id === peopleId)
  return people?.name || `User #${peopleId}`
}

// Lifecycle
onMounted(() => {
    
    fetchPeopleDetail()
})
</script>

<style scoped>
.avatar-uploader :deep(.el-upload) {
  display: block;
}

.avatar-uploader-placeholder {
  width: 150px;
  height: 150px;
  border: 2px dashed var(--el-border-color);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s;
}

.avatar-uploader-placeholder:hover {
  border-color: var(--el-color-primary);
}

.danger-zone {
  border: 1px solid var(--el-color-danger);
  border-radius: 8px;
  padding: 16px;
  background: var(--el-color-danger-light-9);
}

:deep(.el-form--label-top .el-form-item__label) {
  font-weight: 500;
  margin-bottom: 8px;
}

:deep(.el-card__header) {
  border-bottom: 1px solid var(--el-border-color);
}

:deep(.el-divider) {
  margin: 16px 0;
}

:deep(.el-descriptions) {
  margin-top: 10px;
}
</style>