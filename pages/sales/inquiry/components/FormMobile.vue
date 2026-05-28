<script setup lang="ts">
import { Edit, Delete } from "@element-plus/icons-vue";
import type { FormInstance, FormRules, UploadUserFile } from "element-plus";
import type { Contact } from "@/types/contact";
import type { AddressType } from "~/types/address";
import AutocompleteContact from "~/components/trums/AutocompleteContact.vue";
import TrumsUploadFile from "~/components/trums/form/TrumsUploadFile.vue";
const { labelPosition } = useFormConfig();

interface Props {
  modelValue: Record<string, any>;
  rules?: FormRules;
  loading?: boolean;
  fileList?: UploadUserFile[];

  toContact?: Contact | null;
  picContact?: Contact | null;
  address?: AddressType | null;
  formSize?: "default" | "small" | "large";

  querySearchContact?: (
    queryString: string,
    cb: (arg: any) => void,
    type: "to" | "pic"
  ) => void;

  querySearchAddress?: (queryString: string, cb: (arg: any) => void) => void;

  generateResultSearchAddress?: (address: AddressType | null) => {
    name: string;
  };
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  labelPosition: "top",
  formSize: "default",
  fileList: () => [],
});

const emit = defineEmits<{
  "update:modelValue": [value: Record<string, any>];
  "update:fileList": [value: UploadUserFile[]];

  selectContact: [data: Contact, type: "to" | "pic"];
  selectAddress: [data: any];

  editAddress: [data: AddressType];
  deleteAddress: [];
}>();

const ruleFormRef = ref<FormInstance>();

const ruleForm = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const localFileList = computed({
  get: () => props.fileList,
  set: (value) => emit("update:fileList", value),
});

const fetchToSuggestions = (queryString: string, cb: (arg: any) => void) => {
  props.querySearchContact?.(queryString, cb, "to");
};

const fetchPicSuggestions = (queryString: string, cb: (arg: any) => void) => {
  props.querySearchContact?.(queryString, cb, "pic");
};

const onSelectContact = (data: Contact, type: "to" | "pic") => {
  emit("selectContact", data, type);
};

const onSelectAddress = (data: any) => {
  emit("selectAddress", data);
};

const onEditAddress = () => {
  if (!props.address) return;

  emit("editAddress", props.address);
};

const onDeleteAddress = () => {
  emit("deleteAddress");
};

defineExpose({
  ruleFormRef,
});
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="ruleForm"
    :rules="rules"
    :label-position="labelPosition"
    :size="formSize"
    :disabled="loading"
    label-width="auto"
    status-icon
    class="w-full"
  >
    <!-- TO CONTACT -->
    <el-form-item label="" prop="to_name" class="w-full">
      <AutocompleteContact
        class="w-full"
        v-model="ruleForm.to_name"
        :contact="toContact"
        :fetch-suggestions="fetchToSuggestions"
        @save-contact="(data: Contact) => onSelectContact(data, 'to')"
      />
    </el-form-item>

    <!-- PIC -->
    <el-form-item v-if="toContact?.is_company" label="" prop="request_by_name">
      <AutocompleteContact
        v-model="ruleForm.request_by_name"
        :contact="picContact"
        :fetch-suggestions="fetchPicSuggestions"
        @save-contact="(data: Contact) => onSelectContact(data, 'pic')"
      />
    </el-form-item>

    <!-- ADDRESS -->
    <el-form-item label="" prop="address_view">
      <el-autocomplete
        v-model="ruleForm.address_view"
        :fetch-suggestions="querySearchAddress"
        :trigger-on-focus="false"
        clearable
        placeholder="Cari Alamat/Buat Baru"
        @select="onSelectAddress"
      >
        <template #default="{ item }">
          <div v-if="!item.new">
            <div class="font-medium">
              {{ item.name }}
            </div>

            <span class="text-sm text-gray-500">
              {{ item.street }}
            </span>
          </div>

          <div v-else class="text-blue-600 font-medium">
            {{ item.name }}
          </div>
        </template>
      </el-autocomplete>
    </el-form-item>

    <div class="space-y-1" v-if="address">
      <div class="flex items-center gap-2">
        <p class="font-medium">
          {{ address.address_name }}
        </p>

        <el-icon
          class="cursor-pointer text-blue-500 hover:text-blue-600"
          @click="onEditAddress"
        >
          <Edit />
        </el-icon>

        <el-icon
          class="cursor-pointer text-red-500 hover:text-red-600"
          @click="onDeleteAddress"
        >
          <Delete />
        </el-icon>
      </div>

      <div class="text-sm text-gray-500">
        {{ address.street }},
        {{ generateResultSearchAddress?.(address)?.name }}
      </div>
    </div>

    <!-- DATE -->
    <el-form-item label="" prop="date" class="w-full">
      <el-date-picker
        v-model="ruleForm.date"
        type="date"
        placeholder="Tanggal Inquiry"
        class="w-full"
      />
    </el-form-item>

    <!-- NOTE -->
    <el-form-item label="Note" prop="description">
      <el-input v-model="ruleForm.description" type="textarea" :rows="4" />
    </el-form-item>
    <!-- FILE -->
    <el-form-item label="File Lampiran" prop="files">
      <TrumsUploadFile v-model:file-list="localFileList" />
    </el-form-item>
  </el-form>
</template>
