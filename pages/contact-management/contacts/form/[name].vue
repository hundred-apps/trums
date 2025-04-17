<template>
  <TrumsWrapper>
    <el-page-header @back="goBack" :title="`${t('menu.back')}`">
      <template #content>
        <span class="text-large font-600 mr-3">
          {{ mode === "update" ? t("form.type.update") : t("form.type.new") }}
          {{ t("menu.contact") }}
        </span>
      </template>
    </el-page-header>
    <el-card class="my-3">
      <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        :rules="rules"
        label-width="auto"
        class="demo-ruleForm"
        :size="formSize"
        status-icon
        :disabled="loading"
      >
        <div class="lg:flex lg:gap-2 lg:justify-between lg:items-center">
          <el-form-item
            :label="`${t('form.label.name')}`"
            prop="name"
            class="w-full"
          >
            <el-input v-model="ruleForm.name" placeholder="Nama" />
          </el-form-item>
          <el-form-item
            :label="`${t('form.label.email')}`"
            prop="email"
            class="w-full"
          >
            <el-input v-model="ruleForm.email" placeholder="Email" />
          </el-form-item>
        </div>
        <div class="lg:flex lg:gap-2 lg:justify-between lg:items-center">
          <el-form-item
            :label="`${t('form.label.phoneNumber')}`"
            prop="phone"
            class="w-full"
          >
            <el-input v-model="ruleForm.phone" placeholder="Phone" />
          </el-form-item>
          <el-form-item
            :label="`${t('form.label.taxId')}`"
            prop="tax_id"
            class="w-full"
          >
            <el-input v-model="ruleForm.tax_id" placeholder="NPWP" />
          </el-form-item>
        </div>
        <div class="lg:flex lg:gap-2 lg:justify-between lg:items-center">
          <el-form-item
            :label="`${t('form.label.website')}`"
            prop="website"
            class="w-full"
          >
            <el-input v-model="ruleForm.website" placeholder="Website" />
          </el-form-item>
          <el-form-item
            :label="`${t('form.label.title')}`"
            prop="title"
            class="w-full"
          >
            <el-input v-model="ruleForm.title" placeholder="Title" />
          </el-form-item>
        </div>
        <div class="lg:flex lg:gap-2 lg:justify-between lg:items-center">
          <el-form-item :label="`${t('form.label.type')}`" class="w-full">
            <el-checkbox
              v-model="ruleForm.is_personal"
              :label="`${t('form.label.personal')}`"
              border
            />
            <el-checkbox
              v-model="ruleForm.is_company"
              :label="`${t('form.label.company')}`"
              border
            />
          </el-form-item>
          <el-form-item
            :label="`${t('form.label.tags')}`"
            prop="tags"
            class="w-full"
          >
            <el-input-tag
              v-model="ruleForm.tags"
              :max="3"
              clearable
              placeholder="enter up to 3 tags"
              class="flex-1"
            >
              <template #suffix>
                <el-tooltip
                  :content="`${t('tooltip.infoTags')}`"
                  placement="top"
                >
                  <Icon name="material-symbols:info" />
                </el-tooltip>
              </template>
            </el-input-tag>
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <div class="flex justify-end align-center">
          <el-button type="info" plain @click="resetForm(ruleFormRef)">{{
            t("buttons.reset")
          }}</el-button>
          <el-button type="primary" @click="submitForm(ruleFormRef)">
            {{ t("buttons.save") }}
          </el-button>
        </div>
      </template>
    </el-card>
  </TrumsWrapper>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: ["auth", "app"],
});

import { reactive, ref, onMounted } from "vue";
import {
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
const unique_id = route.query.unique_id;

const mode = route.query.mode;

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
  tax_id: [
    {
      pattern: /^(\d{10}|\d{15}|\d{16})$/,
      message: "masukan format npwp",
      trigger: ["blur", "change"],
    },
  ],
  website: [
    {
      type: "url",
      message: `url yaaa`,
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
  if (unique_id == null) {
    ruleForm.name = "";
    ruleForm.email = "";
    ruleForm.phone = "";
    ruleForm.tax_id = "";
    ruleForm.website = "";
    ruleForm.title = "";
    ruleForm.is_personal = false;
    ruleForm.is_company = false;
    ruleForm.tags = "";
  } else {
    detail();
  }
};

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
      if (unique_id == null) {
        ElMessage.success(`Berhasil Menambahkan contact`);
      } else {
        ElMessage.success(`Berhasil Mengedit contact`);
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
