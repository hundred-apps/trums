<script lang="ts" setup>
import type { FormInstance, FormRules } from "element-plus";
import type { Bank, BankAccount } from "~/types/bank_account";
import type { Account } from "~/types/finance/account";
import type {
  DefaultResponse,
  DefaultResponsePagination,
} from "~/types/pagination";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";

interface Props {
  account?: BankAccount | null;
  isEditing: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(["submitted", "cancel"]);

const formRef = ref<FormInstance>();
const loading = ref(false);
const bankOptions = ref<{ value: string; label: string }[]>([]);

// Initialize form with default values or props
const form = reactive({
  unique_id: props.account?.unique_id,
  bank_name: props.account?.bank_name || "",
  account_name: props.account?.account_name || "",
  account_number: props.account?.account_number || "",
  bank_id: props.account?.bank_id || null,
  account_id: props.account?.account_id || null,
  coa_name: props.account?.account?.name ?? "",
});

// Form validation rules
const rules = reactive<FormRules>({
  coa_name: [
    { required: true, message: "Nama bank wajib diisi", trigger: "blur" },
    { min: 3, max: 100, message: "Panjang 3-100 karakter", trigger: "blur" },
  ],
  bank_name: [
    { required: true, message: "Nama bank wajib diisi", trigger: "blur" },
    { min: 3, max: 100, message: "Panjang 3-100 karakter", trigger: "blur" },
  ],
  account_name: [
    {
      required: true,
      message: "Nama pemilik rekening wajib diisi",
      trigger: "blur",
    },
    { min: 3, max: 100, message: "Panjang 3-100 karakter", trigger: "blur" },
  ],
  account_number: [
    { required: true, message: "Nomor rekening wajib diisi", trigger: "blur" },
    {
      pattern: /^[0-9]+$/,
      message: "Hanya boleh mengandung angka",
      trigger: "blur",
    },
  ],
});

// Fetch bank options for dropdown
const fetchBankOptions = async () => {
  try {
    const response = await useFetchApi<DefaultResponsePagination<Bank[]>>(
      "/banks-read",
      "get-bank-options",
      "get",
      null
    );

    if (response.status.value == "success") {
      bankOptions.value = (response.data.value?.data.query ?? []).map(
        (value) => ({ label: value.bank_name, value: value.unique_id })
      );
    }
  } catch (error) {
    console.error("Failed to fetch banks:", error);
  }
};

// Handle form submission
const submitForm = async () => {
  loading.value = true;
  try {
    await formRef.value?.validate();

    const endpoint = `/bank-accounts-create`;

    const response = await useFetchApi<DefaultResponse<BankAccount>>(
      endpoint,
      `create-bank-account`,
      "post",
      form
    );

    if (response.status.value === "success") {
      ElMessage.success(
        `Akun bank berhasil ${props.isEditing ? "diperbarui" : "ditambahkan"}`
      );
      emit("submitted", response.data.value?.data);
    }
  } catch (error) {
    console.error("Error submitting form:", error);
  } finally {
    loading.value = false;
  }
};

const querySearchAccounts = (query: string, cb: (arg: any) => void) => {
  try {
    const request_search: RequestSearch = {
      column: [],
      keyword: query,
      limit: "50",
      offset: "1",
      sort: {
        column: "created_at",
        order: OrderColumn.ASC,
      },
      flag: "form",
      table: "accounts",
    };

    useFetchApi<ResponsePagination<Account[]>>(
      "/search",
      "search-customer",
      "post",
      request_search
    ).then((response) => {
      if (response.status.value == "success") {
        const contacts: Account[] = (response.data.value?.data ??
          []) as Account[];
        if (contacts.length > 0) {
          cb([
            ...contacts.map((value) => ({
              value: value.name,
              unique_id: value.unique_id,
              data: value,
            })),
          ]);
        }
      }
    });
  } catch (error) {
    console.error("Failed to fetch vendors", error);
    cb([]);
  }
};

const handleSelectAccount = (item: any) => {
  const accountData: Account = item.data as Account;
  form.account_id = accountData.unique_id;
  form.coa_name = accountData.name;
};

// Initialize component
onMounted(async () => {
  await fetchBankOptions();

  // If in edit mode and bank_id exists, ensure it's in options
  if (
    props.isEditing &&
    props.account?.bank_id &&
    !bankOptions.value.some((b) => b.value === props.account?.bank_id)
  ) {
    bankOptions.value.push({
      value: props.account.bank_id,
      label: props.account.bank_name || "Unknown Bank",
    });
  }
});
</script>

<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="150px"
    label-position="top"
    :disabled="loading"
  >
    <el-form-item label="Bank" prop="bank_name">
      <el-select
        v-model="form.bank_id!"
        filterable
        placeholder="Pilih Bank"
        class="w-full"
        @change="
          (val) => {
            const selected = bankOptions.find((b) => b.value === val);
            form.bank_name = selected?.label || '';
          }
        "
      >
        <el-option
          v-for="bank in bankOptions"
          :key="bank.value"
          :label="bank.label"
          :value="bank.value"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="Nama Pemilik Rekening" prop="account_name">
      <el-input
        v-model="form.account_name"
        placeholder="Masukkan nama pemilik rekening"
        clearable
      />
    </el-form-item>

    <el-form-item label="Nomor Rekening" prop="account_number">
      <el-input
        v-model="form.account_number"
        placeholder="Masukkan nomor rekening"
        clearable
      />
    </el-form-item>
    <el-form-item label="CoA" prop="account_name">
      <el-autocomplete
        v-model="form.coa_name!"
        :fetch-suggestions="querySearchAccounts"
        placeholder="Cari Akun"
        @select="(item) => handleSelectAccount(item)"
      >
        <template #default="{ item }">
          <div v-if="item.isNew" class="flex items-center text-blue-500">
            <el-icon><Plus /></el-icon>
            <span class="ml-2">Tambahkan "{{ item.value }}"</span>
          </div>
          <div v-else>
            {{ item.value }}
          </div>
        </template>
      </el-autocomplete>
    </el-form-item>

    <div class="flex justify-end gap-3 mt-6">
      <el-button @click="emit('cancel')"> Batal </el-button>
      <el-button type="primary" @click="submitForm" :loading="loading">
        {{ isEditing ? "Update" : "Simpan" }}
      </el-button>
    </div>
  </el-form>
</template>
