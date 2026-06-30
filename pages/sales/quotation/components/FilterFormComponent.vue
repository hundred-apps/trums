<template>
  <el-form
    ref="formRef"
    :model="model"
    :rules="rules"
    :label-position="labelPosition"
  >
    <el-form-item prop="contact_names" label="Kontak">
      <el-select
        v-model="model.contact_names"
        multiple
        filterable
        remote
        reserve-keyword
        placeholder="Cari Kontak"
        :remote-method="querySearchContact"
        :loading="loadingContact"
        remote-show-suffix
        @change="handleSelectContact"
      >
        <el-option
          v-for="item in listContacts"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>

    <el-row :gutter="16" style="margin-bottom: 0">
      <el-col :xs="24" :sm="12">
        <el-form-item prop="date_start" label="Tanggal Mulai">
          <el-date-picker
            v-model="model.date_start"
            type="date"
            placeholder="Pilih tanggal mulai"
            format="DD MMM YYYY"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>

      <el-col :xs="24" :sm="12">
        <el-form-item prop="date_end" label="Tanggal Berakhir">
          <el-date-picker
            v-model="model.date_end"
            type="date"
            placeholder="Pilih tanggal berakhir"
            format="DD MMM YYYY"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="Status" prop="status">
      <el-select v-model="model.status" placeholder="Pilih Status">
        <el-option
          v-for="item in optionsStatus"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
  </el-form>

  <div class="flex gap-2">
    <TrumsCustomButton
      type="default"
      :loading="loading"
      :disabled="loading"
      @click="emit('cancel')"
    >
      Batal
    </TrumsCustomButton>

    <TrumsCustomButton
      type="info"
      :loading="loading"
      :disabled="loading"
      @click="resetForm"
    >
      Reset
    </TrumsCustomButton>

    <TrumsCustomButton
      type="primary"
      :loading="loading"
      :disabled="loading"
      @click="submitForm"
    >
      Terapkan
    </TrumsCustomButton>
  </div>
</template>

<script setup lang="ts">
import {
  ElMessage,
  type FormInstance,
  type FormRules,
  type FormProps,
  dayjs,
} from "element-plus";

import {
  CanvassingStatus,
  getStatusCanvassingLabel,
} from "~/types/scm/canvasing";

import type { Contact } from "~/types/contact";
import type { RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";

interface FormFilter {
  contact_ids: string[];
  contact_names: string[];
  contact_data: Contact | null;
  date_start: string;
  date_end: string;
  status: CanvassingStatus;
}

interface ListItemContact {
  label: string;
  value: string;
  data: Contact;
}

const props = defineProps<{
  model: FormFilter;
  rules: FormRules;
  loading: boolean;
  labelPosition: FormProps["labelPosition"];
}>();

const emit = defineEmits<{
  (e: "submit"): void;
  (e: "reset"): void;
  (e: "cancel"): void;
}>();

const formRef = ref<FormInstance>();

const loadingContact = ref(false);

const listContacts = ref<ListItemContact[]>([]);

const request_search_contact = ref<RequestSearch>({
  keyword: "",
  table: "contacts",
  column: [],
  limit: "100",
  offset: "1",
  sort: {
    column: "name",
    order: "ASC",
  },
});

const optionsStatus = [
  {
    label: getStatusCanvassingLabel(CanvassingStatus.DRAFT),
    value: CanvassingStatus.DRAFT,
  },
  {
    label: getStatusCanvassingLabel(CanvassingStatus.CANVASSING),
    value: CanvassingStatus.CANVASSING,
  },
  {
    label: getStatusCanvassingLabel(CanvassingStatus.RAB),
    value: CanvassingStatus.RAB,
  },
  {
    label: getStatusCanvassingLabel(CanvassingStatus.PENDING_APPROVAL_RAB),
    value: CanvassingStatus.PENDING_APPROVAL_RAB,
  },
  {
    label: getStatusCanvassingLabel(CanvassingStatus.PENDING_APPROVAL),
    value: CanvassingStatus.PENDING_APPROVAL,
  },
  {
    label: getStatusCanvassingLabel(CanvassingStatus.DONE),
    value: CanvassingStatus.DONE,
  },
  {
    label: getStatusCanvassingLabel(CanvassingStatus.CANCEL),
    value: CanvassingStatus.CANCEL,
  },
];

const querySearchContact = async (query: string) => {
  request_search_contact.value.keyword = query;

  loadingContact.value = true;

  try {
    const response = await useFetchApi<ResponsePagination<Contact[]>>(
      "/search",
      `search-contact-${query}`,
      "post",
      request_search_contact.value
    );

    if (response.status.value === "success") {
      listContacts.value = (response.data.value?.data ?? []).map((item) => ({
        label: `${item.name} | ${item.phone}`,
        value: item.unique_id,
        data: item,
      }));
    } else {
      ElMessage.error(response.data.value?.message);
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message);
  } finally {
    loadingContact.value = false;
  }
};

const handleSelectContact = (value: string[]) => {
  props.model.contact_ids = value;
};

const submitForm = async () => {
  if (!formRef.value) return;

  const valid = await formRef.value.validate();

  if (valid) {
    emit("submit");
  }
};

const resetForm = () => {
  props.model.contact_ids = [];
  props.model.contact_names = [];
  props.model.contact_data = null;
  props.model.date_start = dayjs().format("YYYY-MM-DD");
  props.model.date_end = "";
  props.model.status = CanvassingStatus.DRAFT;

  formRef.value?.clearValidate();

  emit("reset");
};
</script>
