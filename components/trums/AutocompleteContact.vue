<template>
  <div class="flex items-center gap-3 w-full">
    <el-autocomplete
      :fetch-suggestions="handleFetch"
      v-model="model"
      placeholder="Cari Kontak"
      @select="handleSelect"
    >
      <template #default="{ item }">
        <div v-if="!item.isNew">{{ item.value }}</div>
        <div v-else class="flex items-center text-blue-500">
          <el-icon><Plus /></el-icon>
          <span class="ml-2">Tambahkan "{{ item.value }}"</span>
        </div>
      </template>
    </el-autocomplete>
    <el-button
      type="primary"
      v-if="contact"
      @click="dialogContact = true"
      :icon="User"
    />
  </div>

  <el-dialog v-model="dialogContact" title="Detail Kontak">
    <AddContact
      ref="formFieldsRefContact"
      :data="tmpContact!"
      :loading="loading"
      @submit="(value) => handleSubmitContact(value!)"
      @reset="handleResetContact"
    />
  </el-dialog>
</template>

<script lang="tsx" setup>
import { User, Plus } from "@element-plus/icons-vue";
import AddContact from "./AddContact.vue";
import type { Contact } from "~/types/contact";
import type { BaseResponse } from "~/types/response";

const loading = ref<boolean>(false);
const dialogContact = ref<boolean>(false);
const tmpContact = ref<Contact | null>(null);

const formFieldsRefContact = ref();

interface Props {
  modelValue: string;
  type?: string; // 'to', 'from', dll
  placeholder?: string;
  fetchSuggestions: (
    query: string,
    cb: (arg: any) => void,
    type?: string
  ) => void;
  contact?: any;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Cari Kontak",
});

const emit = defineEmits(["update:modelValue", "open-dialog", "save-contact"]);

watch(
  () => props.contact,
  () => {
    console.log("props contact", props.contact);
    tmpContact.value = props.contact;
  },
  {
    immediate: true,
  }
);

// v-model binding
const model = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// const openDialog = () => {
//     dialogContact.value = false;
//     tmpContact.value = props.cona
// }

// handle fetch
const handleFetch = (query: string, cb: any) => {
  props.fetchSuggestions(query, cb, props.type);
};

// handle select
const handleSelect = (item: any) => {
  if (item.isNew) {
    const contactData: Contact = {
      id: 0,
      unique_id: "",
      unique_code: "",
      is_personal: false,
      is_company: null,
      internal_id: "",
      name: item.value,
      email: "",
      phone: null,
      tax_id: null,
      website: null,
      title: null,
      tags: "",
      created_at: 0,
      created_by: "",
      updated_at: 0,
      version: 0,
      address: [],
    };
    tmpContact.value = contactData;
    dialogContact.value = true;
  } else {
    console.log("item", item.data);
    if (item.data) {
      emit("save-contact", item.data as Contact);
    }
    // emit("select", item, props.type);
  }
};

const createNewContact = async (data: any): Promise<Contact | null> => {
  try {
    const response = await useFetchApi<BaseResponse<Contact>>(
      "/contact-create",
      "create-customer",
      "post",
      data
    );
    if (response.status.value == "success") {
      return response.data.value?.data ?? null;
    } else {
      return null;
    }
  } catch (error: any) {
    ElMessage.error(error.response.message ?? error);
    return null;
  }
};

const handleSubmitContact = async (formData: Contact) => {
  try {
    const contact: Contact | null = await createNewContact({
      parent_id: formData.parent_id,
      parent_version: formData.parent_version,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      tax_id: formData.tax_id,
      website: formData.website,
      title: formData.title,
      is_personal: formData.is_personal,
      is_company: formData.is_company,
      tags: formData.tags?.toString(),
      unique_id: formData.unique_id,
      ownership: formData.ownership,
    });
    if (contact !== null) {
      emit("save-contact", contact);
    }
    dialogContact.value = false;
  } catch (error) {
    console.log("eror", error);
  }
};

const handleResetContact = () => {
  formFieldsRefContact.value?.resetForm();
  dialogContact.value = false;
};
</script>

<style scoped>
:deep(.el-form-item) {
  margin-bottom: 18px !important;
}
</style>
