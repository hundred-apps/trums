<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { type User as userData } from "~/types/user";
import {
  type ComponentSize,
  type FormInstance,
  type FormRules,
  ElMessage,
  type UploadProps,
  type UploadUserFile,
  ElNotification,
} from "element-plus";
import { useApi } from "~/composables/useApi";

definePageMeta({
  middleware: "app",
});

interface RuleForm {
  name: string;
  phone: string;
  gender: string;
  email: string;
}

const { t } = useI18n();

const appUserData = useCookie("userdata");
const userToken = useCookie("token");
const api = useApi();
const userdata = ref<userData | null>(null);
const imageUrl = ref("");
const fileList = ref<UploadUserFile[]>([]);
const user = localStorage.getItem("oidc._user");

const config = useRuntimeConfig();
const imageApiUrl = config.public.baseImageURL;
const loading = ref<boolean>(false);

const srcList = ref([]);

const isEdit = ref(false);

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
  console.log("submit:", fileList);
  if (!formEl) return;
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      const formData = new FormData();
      formData.append("name", ruleForm.name);
      formData.append("email", ruleForm.email);
      formData.append("phone", ruleForm.phone);
      formData.append("gender", ruleForm.gender);
      if (fileList?.value?.length > 0) {
        formData.append("photo", fileList?.value[0].raw);
      }

      const jsonUser = JSON.parse(user ?? "");

      formData.append("gid", parseInt(jsonUser.id));

      loading.value = true;

      try {
        const response = await api.post("/people-create", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.status == 201) {
          const dataUser: userData = response.data.data;
          appUserData.value = JSON.stringify(dataUser);
          userToken.value = response.data.token;
          ElNotification({
            title: "Success",
            message: "Update user",
            type: "success",
            duration: 2000,
          });
          window.location.href = `/setting/profile/${ruleForm.name}`;
        } else {
          ElMessage.error(response?.data?.message);
        }
      } catch (error) {
        ElMessage.error(error.response?.data?.message);
      } finally {
        loading.value = false;
      }
    } else {
      ElNotification({
        title: "Error!",
        type: "error",
        message: "Silahkan isi dengan benar!",
        duration: 2000,
      });
      console.log("error submit!", fields);
    }
  });
};

const toggleEdit = () => {
  isEdit.value = !isEdit.value;
};

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.name = userdata.value?.name;
  formEl.email = userdata.value?.email;
  formEl.phone = userdata.value?.phone;
  formEl.gender = userdata.value?.gender;
  ruleForm.name = formEl.name;
  ruleForm.email = formEl.email;
  ruleForm.phone = formEl.phone;
  ruleForm.gender = formEl.gender;
  imageUrl.value = "";
};
const cancelForm = (formEl: FormInstance | undefined) => {
  resetForm(formEl);
  toggleEdit();
};
console.log("test:", fileList);
onMounted(() => {
  userdata.value = appUserData.value as unknown as userData;
  srcList.value.push(imageApiUrl + "/" + userdata.value?.photo?.filename);
  ruleForm.name = userdata.value?.name;
  ruleForm.email = userdata.value?.email;
  ruleForm.phone = userdata.value?.phone;
  ruleForm.gender = userdata.value?.gender;
});
</script>
<template>
  <TrumsWrapper>
    <div class="w-full h-full flex flex-col gap-2">
      <div v-if="isEdit" class="flex justify-center">
        <el-upload
          class="avatar-uploader flex flex-col items-center gap-2"
          action=""
          v-model:file-list="fileList"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
          :on-change="handleChange"
        >
          <img v-if="imageUrl" :src="imageUrl" class="avatar" />
          <img
            v-else
            :src="`${imageApiUrl}/${userdata?.photo?.filename}`"
            class="avatar"
          />
          <div class="overlay">
            <div class="text-overlay">Change Image</div>
          </div>
        </el-upload>
      </div>
      <div v-else class="flex justify-center mb-4">
        <el-image
          class="profile rounded-lg"
          :src="`${imageApiUrl}/${userdata?.photo?.filename}`"
          :zoom-rate="1.2"
          :max-scale="7"
          :min-scale="0.2"
          :preview-src-list="srcList"
          :initial-index="0"
          loading="lazy"
          fit="contain"
        />
      </div>
      <el-form
        :inline="true"
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
            :disabled="!isEdit"
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
            :disabled="!isEdit"
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
            :disabled="!isEdit"
            :placeholder="`${t('form.placeholder.phoneNumber')}`"
            class="p-0"
          />
        </el-form-item>
        <el-form-item :label="`${t('form.label.gender')}`" prop="gender">
          <el-radio-group v-model="ruleForm.gender" :disabled="!isEdit">
            <el-radio value="pria">{{ t("form.label.genderMale") }}</el-radio>
            <el-radio value="wanita">{{
              t("form.label.genderFemale")
            }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <div class="flex-1">
            <div v-if="isEdit" class="flex justify-end">
              <el-button
                type="danger"
                @click="cancelForm(ruleFormRef)"
                :loading="loading"
                >{{ t("buttons.cancel") }}</el-button
              ><el-button @click="resetForm(ruleFormRef)" :loading="loading"
                >Reset</el-button
              ><el-button
                type="primary"
                @click="submitForm(ruleFormRef)"
                :loading="loading"
              >
                {{ t("buttons.save") }}
              </el-button>
            </div>
            <div v-else class="flex justify-end">
              <el-button
                type="warning"
                @click="toggleEdit()"
                :loading="loading"
                >{{ t("buttons.edit") }}</el-button
              >
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </TrumsWrapper>
</template>
