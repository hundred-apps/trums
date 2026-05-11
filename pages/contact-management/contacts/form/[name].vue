<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3"> {{ mode }} Contact </span>
      </template>
    </el-page-header>
    <AddContact
      :data="contact ?? null"
      v-on:submit="(value) => console.log('submit contact', value)"
    />
  </TrumsWrapper>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: ["auth", "app"],
});

import { ref, onMounted } from "vue";
import { toPascalCase } from "~/utils/string_format";
import { ElMessage, type FormInstance } from "element-plus";
import { useApi } from "#imports";
import { type Contact } from "~/types/contact";
import { useRoute } from "vue-router";
import type { BaseResponse } from "~/types/response";
import AddContact from "~/components/trums/AddContact.vue";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const loading = ref<boolean>(false);

const mode = toPascalCase(`${route.query.mode}`);

const goBack = () => router.back();
const unique_id = route.query.unique_id;
const contact = ref<Contact | null>();

const submit = async (formEl: FormInstance | undefined) => {
  loading.value = true;
  try {
    // const response = await useFetchApi<BaseResponse<Contact>>("/contact-create", 'create-contact', 'post', {
    //   name: ruleForm.name,
    //   email: ruleForm.email,
    //   phone: ruleForm.phone,
    //   tax_id: ruleForm.tax_id,
    //   website: ruleForm.website,
    //   title: ruleForm.title,
    //   is_personal: ruleForm.is_personal,
    //   is_company: ruleForm.is_company,
    //   tags: ruleForm.tags?.toString(),
    //   unique_id: ruleForm.unique_id,
    //   ownership: ruleForm.ownership,
    //   parent_id: ruleForm.parent_id,
    //   parent_version: ruleForm.perent_version,
    //   address: ruleForm.address.map((value) => ({
    //     address_name: value.address_name,
    //     street: value.street,
    //     village_id: value.village_id,
    //     village: value.village,
    //     city: value.city,
    //     regency: value.regency,
    //     province: value.province,
    //     country: "indonesia",
    //     codepos: parseInt(`${value.codepos || 0}`),
    //     unique_id: value.unique_id,
    //   })),
    // });
    const response = await useFetchApi<BaseResponse<Contact>>(
      "/contact-create",
      "create-contact",
      "post",
      contact.value
    );
    if (response.status.value == "success") {
      if (unique_id) {
        ElMessage.success(`Berhasil Mengedit contact`);
      } else {
        ElMessage.success(`Berhasil Menambahkan contact`);
      }
      goBack();
    }
  } catch (error: any) {
    if (unique_id !== null) {
      ElMessage.error(`${error.response?.data?.message}`);
    }
  } finally {
    loading.value = false;
  }
};

const detail = async () => {
  loading.value = true;
  try {
    // const response = await api.get(`/contact-read/${unique_id}`);
    const response = await useFetchApi<BaseResponse<Contact>>(
      `/contact-read/${unique_id}`,
      "get-contact-edit",
      "get",
      null
    );
    if (response.status.value == "success") {
      contact.value = response.data.value?.data;
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
  if (unique_id) {
    detail();
  }
});
</script>
