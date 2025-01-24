<script lang="ts" setup>
import { reactive, ref, onMounted } from "vue";
import { useApi } from "~/composables/useApi";
import {
  type ComponentSize,
  type FormInstance,
  type FormRules,
  ElMessage,
  type UploadProps,
  type UploadUserFile,
} from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import { type User } from "~/types/user";

const imageUrl = ref("");
const fileList = ref<UploadUserFile[]>([]);
const api = useApi();
const user = localStorage.getItem("oidc._user");
const appUserData = useCookie("userdata");
const userToken = useCookie("token");

const { t } = useI18n();
const config = useRuntimeConfig();

definePageMeta({
  middleware: "auth",
  layout: false,
});

const layout = "authcallback";

interface RuleForm {
  name: string;
  phone: string;
  gender: string;
  email: string;
}

const loading = ref<boolean>(false);

const formSize = ref<ComponentSize>("default");
const ruleFormRef = ref<FormInstance>();
const ruleForm = reactive<RuleForm>({
  name: "",
  phone: "",
  gender: "",
  email: "",
});

const rules = reactive<FormRules<RuleForm>>({
  name: [
    {
      required: true,
      message: `${t("form.validate.name")}`,
      trigger: "blur",
    },
  ],
  email: [
    { required: true, message: `${t("form.validate.email")}`, trigger: "blur" },
    {
      type: "email",
      message: `${t("form.validate.emailAddress")}`,
      trigger: ["blur", "change"],
    },
  ],
  phone: [
    { required: true, message: `${t("form.validate.phone")}`, trigger: "blur" },
    {
      min: 11,
      max: 13,
      message: `${t("form.validate.phoneLength")}`,
      trigger: ["blur", "change"],
    },
  ],
  gender: [
    {
      required: true,
      message: `${t("form.validate.gender")}`,
      trigger: "change",
    },
  ],
});

// const fetchData = async () => {
//   try {
//     const response = await api.get(`/people-read/`);
//     ruleForm.value = response.data.data;
//   } catch (error) {
//     console.error("Gagal memuat postingan:", error);
//   }
// };

const handleAvatarSuccess: UploadProps["onSuccess"] = (
  response,
  uploadFile
) => {
  imageUrl.value = URL.createObjectURL(uploadFile.raw!);
};

const handleChange: UploadProps["onChange"] = (uploadFile, uploadFiles) => {
  var data = uploadFiles[uploadFiles.length - 1];
  fileList.value = [data];
  console.log(fileList.value);
};

const beforeAvatarUpload: UploadProps["beforeUpload"] = (rawFile) => {
  if (
    rawFile.type !== "image/jpeg" &&
    rawFile.type !== "image/jpg" &&
    rawFile.type !== "image/png"
  ) {
    ElMessage.error("Avatar picture must be JPG format!");
    return false;
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error("Avatar picture size can not exceed 2MB!");
    return false;
  }
  return true;
};

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      const formData = new FormData();
      formData.append("name", ruleForm.name);
      formData.append("email", ruleForm.email);
      formData.append("phone", ruleForm.phone);
      formData.append("gender", ruleForm.gender);

      if (fileList.value.length > 0) {
        formData.append("photo", fileList.value[0].raw);
      }

      const jsonUser = JSON.parse(user ?? "");

      formData.append("gid", parseInt(jsonUser.id));

      loading.value = true;

      try {
        const response = await api.post("/people-create", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.status == 201) {
          const dataUser: User = response.data.data;
          appUserData.value = JSON.stringify(dataUser);
          userToken.value = response.data.token;

          window.location.href = "/dashboard";
        } else {
          ElMessage.error(response?.data?.message);
        }
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message);
      } finally {
        loading.value = false;
      }
    } else {
      console.log("error submit!", fields);
    }
  });
};

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

const getUser = async () => {
  loading.value = true;
  try {
    const jsonUser = JSON.parse(user || "");
    const response = await api.get(`people-read/${jsonUser.id}`);

    console.log(config.public.baseBE);
    ruleForm.phone = response.data.data.phone;
    ruleForm.gender = response.data.data.gender;
    ruleForm.name = response.data.data.name;
    imageUrl.value = `${config.public.baseBE}${response.data.data.photo.image_path}/${response.data.data.photo.filename}`;

    console.log(imageUrl.value);
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const jsonUser = JSON.parse(user || "");
  ruleForm.email = jsonUser.email;
  getUser();
});
</script>

<template>
  <NuxtLayout :name="layout">
    <div class="w-full h-screen flex items-center justify-center">
      <el-card class="bg-red-800 dark:bg-slate-800 w-1/2">
        <div class="flex justify-center mb-3">
          <el-upload
            class="avatar-uploader flex flex-col items-center gap-2"
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
          class="flex flex-col gap-1"
          status-icon
        >
          <el-form-item
            :label="`${t('form.label.name')}`"
            prop="name"
            class="p-0"
          >
            <el-input
              v-model="ruleForm.name"
              :placeholder="`${t('form.placeholder.name')}`"
              class="p-0"
            />
          </el-form-item>
          <el-form-item
            :label="`${t('form.label.email')}`"
            prop="email"
            class="p-0"
          >
            <el-input
              v-model="ruleForm.email"
              :placeholder="`${t('form.placeholder.email')}`"
              class="p-0"
            />
          </el-form-item>
          <el-form-item
            :label="`${t('form.label.phoneNumber')}`"
            prop="phone"
            class="p-0"
          >
            <el-input
              v-model="ruleForm.phone"
              :placeholder="`${t('form.placeholder.phoneNumber')}`"
              class="p-0"
            />
          </el-form-item>
          <el-form-item :label="`${t('form.label.gender')}`" prop="gender">
            <el-radio-group v-model="ruleForm.gender">
              <el-radio value="pria">{{ t("form.label.genderMale") }}</el-radio>
              <el-radio value="wanita">{{
                t("form.label.genderFemale")
              }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item>
            <div class="flex-1">
              <div class="flex justify-end">
                <el-button @click="resetForm(ruleFormRef)" :loading="loading"
                  >Reset</el-button
                ><el-button
                  type="primary"
                  @click="submitForm(ruleFormRef)"
                  :loading="loading"
                >
                  {{ t("buttons.save") }}
                </el-button>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </NuxtLayout>
</template>
