<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3"> {{ mode }} Contact </span>
      </template>
    </el-page-header>
    <el-form
      ref="ruleFormRef"
      style="max-width: 600px"
      :model="ruleForm"
      :rules="rules"
      label-width="auto"
      class="demo-ruleForm"
      :size="formSize"
      status-icon
      :disabled="loading"
    >
      <el-card class="my-3">
        <template #header>
          <div class="card-header">
            <el-form-item>
              <el-button type="primary" @click="submitForm(ruleFormRef)">
                Simpan
              </el-button>
              <el-button @click="resetForm(ruleFormRef)">Reset</el-button>
            </el-form-item>
          </div>
          <el-form-item label="Name" prop="name">
            <el-input v-model="ruleForm.name" placeholder="Nama" />
          </el-form-item>
          <el-form-item label="Email" prop="email">
            <el-input v-model="ruleForm.email" placeholder="Email" />
          </el-form-item>
          <el-form-item label="Phone" prop="phone">
            <el-input v-model="ruleForm.phone" placeholder="Phone" />
          </el-form-item>
          <el-form-item label="NPWP" prop="tax_id">
            <el-input v-model="ruleForm.tax_id" placeholder="NPWP" />
          </el-form-item>
          <el-form-item label="Website" prop="website">
            <el-input v-model="ruleForm.website" placeholder="Website" />
          </el-form-item>
          <el-form-item label="Title" prop="title">
            <el-input v-model="ruleForm.title" placeholder="Title" />
          </el-form-item>
          <el-checkbox
            v-model="ruleForm.is_personal"
            label="Personal"
            size="large"
          />

          <el-checkbox
            v-model="ruleForm.is_company"
            label="Perusaahan"
            size="large"
          />
          <el-form-item label="Tags" prop="tags">
            <el-input-tag
              v-model="ruleForm.tags"
              :max="3"
              placeholder="enter up to 3 tags"
            />
          </el-form-item>
        </template>
      </el-card>
    </el-form>
  </TrumsWrapper>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: ["auth", "app"],
});

import { reactive, ref, onMounted } from "vue";
import { toPascalCase } from "~/utils/string_format";
import {
  type Column,
  type ComponentSize,
  type FormInstance,
  type FormRules,
  ElMessage,
} from "element-plus";
import { useApi } from "#imports";
import { type Contact } from "~/types/contact";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const mode = toPascalCase(route.query.mode);

const goBack = () => router.back();

interface RuleForm {
  id: number;
  unique_id: string;
  unique_code: string;
  is_personal: boolean;
  is_company: boolean | null;
  internal_id: number;
  name: string;
  email: string;
  phone: string | null;
  tax_id: string | null;
  website: string | null;
  title: string | null;
  tags: string | [] | null;
}
const ruleForm = reactive<RuleForm>({
  id: 1,
  unique_code: "",
  is_personal: false,
  is_company: false,
  internal_id: 1,
  name: "",
  email: "",
  phone: "",
  tax_id: "",
  website: "",
  title: "",
  tags: "",
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
});

const formSize = ref<ComponentSize>("default");
const ruleFormRef = ref<FormInstance>();
const api = useApi();
const loading = ref<boolean>(false);

const resetForm = (formEl: FormInstance | undefined) => {
  formEl?.resetFields();
  ruleForm.name = "";
  ruleForm.email = "";
  ruleForm.phone = "";
};

const unique_id = route.query.unique_id;

const submit = async (formEl: FormInstance | undefined) => {
  loading.value = true;
  try {
    const response = await api.post("/contact-create", {
      name: ruleForm.name,
      email: ruleForm.email,
      phone: ruleForm.phone,
      tax_id: ruleForm.tax_id,
      website: ruleForm.website,
      title: ruleForm.title,
      is_personal: ruleForm.is_personal,
      is_company: ruleForm.is_company,
      tags: ruleForm.tags?.toString(),
      unique_id: ruleForm.unique_id,
    });
    if (response.status == 201) {
      ElMessage.success(`Berhasil Menambahkan contact`);
      if (unique_id == null) {
        resetForm(formEl);
      } else {
        detail();
      }
      router.push("/contact-management/contacts");
    }
  } catch (error: any) {
    if (unique_id !== null) {
      ElMessage.error(`${error.response?.data?.message}`);
    }
  } finally {
    loading.value = false;
  }
};

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      submit(formEl);
    } else {
      console.log(ruleForm);
      ElMessage.error(`${fields}`);
    }
  });
};
const detail = async () => {
  loading.value = true;
  try {
    const response = await api.get(`/contact-read/${unique_id}`);
    if (response.status == 200) {
      const contact: Contact = response.data.data;
      ruleForm.name = contact.name ?? "";
      ruleForm.email = contact.email ?? "";
      ruleForm.phone = contact.phone;
      ruleForm.tax_id = contact.tax_id;
      ruleForm.website = contact.website;
      ruleForm.title = contact.title;
      ruleForm.is_personal = contact.is_personal;
      ruleForm.is_company = contact.is_company;
      ruleForm.tags = contact.tags ? contact.tags.split(",") : [];
      ruleForm.unique_id = contact.unique_id;
    }
  } catch (error: any) {
    if (unique_id !== null) {
      ElMessage.error(`${error.response?.data?.message}`);
    }
  } finally {
    loading.value = false;
  }
};
onMounted(() => {
  if (unique_id !== null) {
    detail();
  }
});
</script>
