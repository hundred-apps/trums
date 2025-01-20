<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useApi } from "~/composables/useApi";
import type { ComponentSize, FormInstance, FormRules, ElMessage, UploadProps, UploadUserFile } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const imageUrl = ref('')
const fileList = ref<UploadUserFile>([])
const api = useApi();
const user = localStorage.getItem('oidc._user');

definePageMeta({
    middleware: "auth",
    layout: false,
});

const layout = "authcallback";


interface RuleForm {
  name: string,
  phone:string,
  gender: string,
  email: string,
}

const loading = ref<boolean>(false);

const formSize = ref<ComponentSize>('default')
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
  name: null,
  phone: null,
  gender: null,
  email: null,
})

const genderOptions = ['Pria', 'Wanita'];

const rules = reactive<FormRules<RuleForm>>({
  name: [
    { required: true, message: 'Masukan nama anda', trigger: 'blur' },
  ],
  email: [
    { required: true, message: 'Masukan email anda', trigger: 'blur' },
    {
          type: 'email',
          message: 'Please input correct email address',
          trigger: ['blur', 'change'],
    }
  ],
  phone: [
    { required: true, message: 'Masukan Nomor Telepon anda', trigger: 'blur' },
  ],
  gender: [
    { required: true, message: 'Pilih Pria/Wanita', trigger: 'change', },
  ]

})

const handleAvatarSuccess: UploadProps['onSuccess'] = (
  response,
  uploadFile
) => {
  
  imageUrl.value = URL.createObjectURL(uploadFile.raw!)
}

const handleChange: UploadProps['onChange'] = (uploadFile, uploadFiles) => {
  var data = uploadFiles[uploadFiles.length - 1]
  fileList.value = [data]
  console.log(fileList.value)
}

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/jpg' && rawFile.type !== 'image/png') {
    ElMessage.error('Avatar picture must be JPG format!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('Avatar picture size can not exceed 2MB!')
    return false
  }
  return true
}

const submitForm = async (formEl: FormInstance | undefined) => {
  console.log(fileList.value[0].originFileObj);
  if (!formEl) return
  await formEl.validate( async (valid, fields) => {
    console.log('form is valid : ', valid)
    console.log('field is valid : ', fields)
    if (valid) {
      

      const formData = new FormData();
      formData.append("name", ruleForm.name);
      formData.append("email", ruleForm.email);
      formData.append("phone", ruleForm.phone);
      formData.append("gender", ruleForm.gender);
      formData.append("photo", fileList.value[0]);
      

      const jsonUser = JSON.parse(user);

      formData.append("gid", jsonUser.id);

      loading.value = true;

      try {

        
        const response = await api.post('/people-create', formData, {headers: {"Content-Type": "multipart/form-data"}});

        console.log(response.data);
        
      } catch (error) {
        ElMessage.error(error.response?.data?.message);
      } finally {
        loading.value = false;
      }

    } else {
      console.log('error submit!', fields)
    }
  })
}


const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}

</script>

<template>
  <NuxtLayout :name="layout">
    <div class="w-full h-screen flex items-center justify-center">

      <el-card class="bg-red-800 dark:bg-slate-800 w-1/2 ">
        <div class="flex justify-center mb-3">
          <el-upload
            class="avatar-uploader"
            action=""
            v-model:file-list="fileList"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            :on-change="handleChange"
          >
            <img v-if="imageUrl" :src="imageUrl" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </div>
        <el-form
            ref="ruleFormRef"
            :model="ruleForm"
            :rules="rules"
            label-width="auto"
            :size="formSize"
            status-icon
          >

            <el-form-item label="Nama" prop="name" class="p-0">
              <el-input v-model="ruleForm.name" class="p-0" />
            </el-form-item>
            <el-form-item label="Email" prop="email" class="p-0">
              <el-input v-model="ruleForm.email" class="p-0" />
            </el-form-item>
            <el-form-item label="Nomor Telepon" prop="phone" class="p-0">
              <el-input v-model="ruleForm.phone" class="p-0" />
            </el-form-item>
            <el-form-item label="Gender" prop="gender">
              <el-radio-group v-model="ruleForm.gender">
                <el-radio value="Pria">Pria</el-radio>
                <el-radio value="Wanita">Wanita</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitForm(ruleFormRef)" :loading="loading">
                Create
              </el-button>
              <el-button @click="resetForm(ruleFormRef)" :loading="loading">Reset</el-button>
            </el-form-item>
        </el-form>
      </el-card>

    </div>
  </NuxtLayout>
</template>


<style scoped>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>