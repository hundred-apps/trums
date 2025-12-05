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
                    <el-option label="Pria" value="pria" />
                    <el-option label="Wanita" value="wanita" />
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
            
            label-width="180px"
            label-position="top"
            size="large"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Departemen" prop="departement_id">
                  <el-autocomplete
                    :fetch-suggestions="querySearchDepartement"
                    v-model="formData.departement_name!"
                    placeholder="Cari Departement"
                    @select="onHandleSelectDepartement"
                />
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="Posisi" prop="position_id">
                  <el-autocomplete
                    :fetch-suggestions="querySearchPosition"
                    v-model="formData.position_name!"
                    placeholder="Cari Position"
                    @select="onHandleSelectPosition"
                />
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
              class="avatar-uploader flex flex-col items-center gap-2"
              action=""
              v-model:file-list="fileList"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
              :on-change="handleChange"
            >
              <img v-if="tmp_image_url" :src="tmp_image_url" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              <div class="overlay">
                <div v-if="!tmp_image_url" class="text-overlay">Add Image</div>
                <div v-else class="text-overlay">Change Image</div>
              </div>
            </el-upload>

            <div class="mt-4">
              <p class="text-sm text-gray-500 mb-3">
                Ukuran maksimal 2MB. Format: JPG, PNG
              </p>
              <div class="flex gap-2 justify-center">
                <el-button 
                  v-if="fileList.length > 0" 
                  type="danger" 
                  size="small"
                  @click="removeProfilePhoto"
                >
                  Hapus Foto
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
import type { FormInstance, FormRules, UploadProps, UploadUserFile } from 'element-plus'
import type { Contact } from '~/types/contact'
import type { Departement } from '~/types/departement'
import type { People } from '~/types/people'
import type { Position } from '~/types/position'
import type { RequestSearch } from '~/types/request_search'
import type { BaseResponse } from '~/types/response'
import type { ResponsePagination } from '~/types/response_pagination'

const router = useRouter()
const route = useRoute()
const peopleId = computed(() => route.query.id as string)

const config = useRuntimeConfig();
const imageUrl = config.public.baseImageURL;

const fileList = ref<UploadUserFile[]>([]);
const appUserData = useCookie("userdata");
const authStore = useAuthStore();
const api = useApi();

// Refs
const basicInfoFormRef = ref<FormInstance>()
const departmentFormRef = ref<FormInstance>()
const tmp_image_url = ref("");
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
  departement_name: '',
  position_name: '',
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

const onLoading = ref<boolean>(false)

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





const parentPeopleOptions = ref<People[]>([])


const handleChange: UploadProps["onChange"] = (uploadFile, uploadFiles) => {
  var data = uploadFiles[uploadFiles.length - 1];
  fileList.value = [data];
  // console.log(fileList.value);
};

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

const departement_create = async (name: string): Promise<Departement | undefined> => {
  onLoading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<Departement>>('/departement-create?flag=form', 'departement-create', 'post', {name: name});
    if(response.status.value == 'success'){
      return response.data.value?.data
    }
  } catch (error: any) {
    ElMessage.error(error.response?.message ?? error)
  }finally {
    onLoading.value = false;
  }
}
const position_create = async (name: string): Promise<Position | undefined> => {
  onLoading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<Position>>('/position-create?flag=form', 'position-create', 'post', {name: name});
    if(response.status.value == 'success'){
      return response.data.value?.data
    }
  } catch (error: any) {
    ElMessage.error(error.response?.message ?? error)
  }finally {
    onLoading.value = false;
  }
}

const onHandleSelectDepartement = async (item: Record<string, any>) => {
  console.log('on select', item);
  if(item.isNew){
    const departement: Departement|null = await departement_create(`${item.label}`) ?? null;
    if(departement !== null){
      formData.value.departement_id = departement.unique_id;
      formData.value.departement_name = departement.name;
    }
  }else{
    const departement: Departement = item as Departement;
    formData.value.departement_id = departement.unique_id;
      formData.value.departement_name = departement.name;
  }


  
  
}
const onHandleSelectPosition = async (item: Record<string, any>) => {
  
  if(item.isNew){
    const position: Position|null = await position_create(`${item.label}`) ?? null;
    if(position !== null){
      formData.value.position_id = position.unique_id;
      formData.value.position_name = position.name;
    }
  }else{
    const position: Position = item as Position;
    formData.value.position_id = position.unique_id;
      formData.value.position_name = position.name;
  }


  
  
}

const querySearchPosition = (queryString: string, cb: (arg: any) => void) => {
      
    request_search.value.keyword = queryString,
    request_search.value.table = 'positions';
    request_search.value.column = [];
    request_search.value.flag = "form";

    useFetchApi<ResponsePagination<Position[]>>('/search', 'address', 'post', request_search).then((response) => {
        if(response.status.value == 'success'){
            
            const resultApi: Position[]  = response.data.value?.data!;
            
            if(resultApi.length > 0){

                if(resultApi.length > 0){
                  const results = resultApi.map((data: Position) => {
                      return {...data, value: `${data.name}`}
                  });    
                  cb([...results, { value: `${queryString}`, label: `Tambahkan ${queryString}`, isNew: true}])
                }else{
                  cb([{ value: `${queryString}`, label: `Tambahkan ${queryString}`, isNew: true}])
                }
            }else{
                cb([{value: `Tambahkan ${queryString}`, isNew: true, label: `${queryString}`}]);
            }
        }
    })
    
}
const querySearchDepartement = (queryString: string, cb: (arg: any) => void) => {
      
    request_search.value.keyword = queryString,
    request_search.value.table = 'departements';
    request_search.value.column = [];
    request_search.value.flag = "form";

    useFetchApi<ResponsePagination<Departement[]>>('/search', 'address', 'post', request_search).then((response) => {
        if(response.status.value == 'success'){
            
            const resultApi: Departement[]  = response.data.value?.data!;
            
            if(resultApi.length > 0){

                if(resultApi.length > 0){
                  const results = resultApi.map((data: Departement) => {
                      return {...data, value: `${data.name}`}
                  });    
                  cb([...results, { value: `${queryString}`, label: `Tambahkan ${queryString}`, isNew: true}])
                }else{
                  cb([{ value: `${queryString}`, label: `Tambahkan ${queryString}`, isNew: true}])
                }
            }else{
                cb([{value: `Tambahkan ${queryString}`, isNew: true, label: `${queryString}`}]);
            }
        }
    })
    
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

  formData.value.departement = peopleData.value.departement_name ?? '';
  formData.value.position = peopleData.value.position_name ?? '';

  tmp_image_url.value = `${config.public.baseBE}${formData.value.photo?.image_path}/${formData.value.photo?.filename}`;
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

    const formDataPayload = new FormData();
    formDataPayload.append("name", `${formData.value.name}`);
    formDataPayload.append("email", `${formData.value.email}`);
    formDataPayload.append("phone", `${formData.value.phone}`);
    formDataPayload.append("gender", `${formData.value.gender}`);
    formDataPayload.append("departement_id", `${formData.value.departement_id}`);
    formDataPayload.append("position_id", `${formData.value.position_id}`);

    if (fileList.value.length > 0) {
      formDataPayload.append("photo", fileList.value[0].raw as Blob);
    }

    // const jsonUser = JSON.parse(user ?? "");

    formDataPayload.append("unique_id", `${formData.value.unique_id}`);

    const response = await api.post("/people-create", formDataPayload, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.status == 201) {
      const dataUser: People = response.data.data;
      appUserData.value = JSON.stringify(dataUser);
      

      console.log('user',response.data.data);
      
      authStore.setUserData(dataUser);
      authStore.setMenu(dataUser.menu || []);
      
      ElMessage.success('Berhasil Login!');
      fetchPeopleDetail();
    } else {
      ElMessage.error(response?.data?.message);
    }
    
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

const handleAvatarSuccess: UploadProps["onSuccess"] = (
  response,
  uploadFile
) => {
  tmp_image_url.value = URL.createObjectURL(uploadFile.raw!);
};

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
  fileList.value = [];
  tmp_image_url.value = `${config.public.baseBE}${formData.value.photo?.image_path}/${formData.value.photo?.filename}`;
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