<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3">Biaya Tambahan</span>
      </template>
    </el-page-header>
    <el-card class="form-card mt-6">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="200px"
        label-position="left"
        :disabled="loading"
      >
        <el-row :gutter="24">
          <el-col :span="12">
            <!-- Kode Pajak -->
            <el-form-item label="Kode" prop="unique_code">
              <el-input
                v-model="form.unique_code"
                placeholder="Masukkan kode (contoh: PPN11)"
                maxlength="20"
                show-word-limit
              />
            </el-form-item>

            <!-- Nama Pajak -->
            <el-form-item label="Nama Biaya" prop="name">
              <el-input
                v-model="form.name"
                placeholder="Masukkan nama biaya"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>

            <!-- Tipe Pajak -->
            <el-form-item label="Tipe Biaya" prop="type">
              <el-radio-group v-model="form.type">
                <el-radio label="percent">Persentase (%)</el-radio>
                <el-radio label="fixed">Fixed Amount</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- Nilai Default -->
            <el-form-item label="Nilai Default" prop="default_value">
              <el-input
                v-model="form.default_value"
                :placeholder="
                  form.type === 'percent'
                    ? 'Masukkan persentase'
                    : 'Masukkan jumlah fixed'
                "
              >
                <template #append>
                  {{ form.type === "percent" ? "%" : "IDR" }}
                </template>
              </el-input>
              <div class="form-tip">
                {{
                  form.type === "percent"
                    ? "Contoh: 11 untuk 11%"
                    : "Contoh: 5000 untuk Rp 5.000"
                }}
              </div>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <!-- Operator -->
            <el-form-item label="Operator" prop="operator">
              <el-radio-group v-model="form.operator">
                <el-radio label="plus">Exclude</el-radio>
                <el-radio label="minus">Include</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- Allow Party -->
            <el-form-item label="Allow Party" prop="allow_party">
              <el-switch
                v-model="form.allow_party"
                active-text="Ya"
                inactive-text="Tidak"
              />
              <div class="form-tip">
                Jika diaktifkan, pajak dapat diterapkan ke party tertentu
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Action Buttons -->
        <el-form-item class="form-actions">
          <el-button type="primary" :loading="loading" @click="onSubmit">
            Simpan
          </el-button>
          <el-button :disabled="loading" @click="onReset"> Reset </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Configurasi Akun</span>
        </div>
      </template>
      <el-tabs type="border-card">
        <el-tab-pane
          v-for="(role, index) in account_mappings"
          :label="role.account_role?.name"
          :key="role.account_role?.code"
        >
          <el-autocomplete
            v-model="role.account_name"
            :fetch-suggestions="querySearchAccounts"
            placeholder="Cari Akun"
            @select="(item) => handleSelectAccount(index, item)"
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
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </TrumsWrapper>
</template>

<script lang="ts" setup>
import type { FormInstance, FormRules } from "element-plus";
import {
  FeeOperator,
  FeeType,
  type AdjustmentTransaction,
} from "~/types/attribute_adjustment";
import {
  AccountMappingReference,
  type Account,
  type AccountMapping,
} from "~/types/finance/account";
import type { AccountRole } from "~/types/finance/account_role";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { BaseResponse } from "~/types/response";
import type { ResponsePagination } from "~/types/response_pagination";

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "adjustments_transaction-create",
  name: "Create Cost",
});

// Route and state
const route = useRoute();
const router = useRouter();
const formRef = ref<FormInstance>();
const loading = ref(false);
const deleteLoading = ref(false);

const goBack = () => router.back();

const account_mappings = ref<AccountMapping[]>([]);

// Check if edit mode
const isEdit = computed(() => !!route.query.id);

// Form data
const form = ref<AdjustmentTransaction>({
  unique_id: "",
  unique_code: "",
  name: "",
  type: FeeType.PERCENT,
  default_value: 0,
  operator: FeeOperator.PLUS,
  allow_party: false,
  version: 1,
  created_at: 0,
  updated_at: 0,
});

// Validation rules
const rules = reactive<FormRules>({
  unique_code: [
    { required: true, message: "Kode pajak wajib diisi", trigger: "blur" },
    { min: 2, max: 20, message: "Panjang kode 2-20 karakter", trigger: "blur" },
    {
      pattern: /^[A-Z0-9]+$/,
      message: "Hanya huruf kapital dan angka",
      trigger: "blur",
    },
  ],
  name: [
    { required: true, message: "Nama pajak wajib diisi", trigger: "blur" },
    {
      min: 2,
      max: 100,
      message: "Panjang nama 2-100 karakter",
      trigger: "blur",
    },
  ],
  type: [
    { required: true, message: "Tipe pajak wajib dipilih", trigger: "change" },
  ],
  default_value: [
    { required: true, message: "Nilai default wajib diisi", trigger: "blur" },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (!value) {
          callback(new Error("Nilai default wajib diisi"));
          return;
        }

        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          callback(new Error("Nilai harus berupa angka"));
          return;
        }

        if (form.value.type === "percent") {
          if (numValue < 0 || numValue > 100) {
            callback(new Error("Persentase harus antara 0-100"));
            return;
          }
        } else {
          if (numValue < 0) {
            callback(new Error("Nilai fixed tidak boleh negatif"));
            return;
          }
        }

        callback();
      },
      trigger: "blur",
    },
  ],
  operator: [
    { required: true, message: "Operator wajib dipilih", trigger: "change" },
  ],
  version: [
    { required: true, message: "Versi wajib diisi", trigger: "blur" },
    {
      type: "number",
      min: 1,
      max: 100,
      message: "Versi harus 1-100",
      trigger: "blur",
    },
  ],
});

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      type: [],
    },
  ],
  limit: "10",
  offset: "1",
  table: "account_roles",
  sort: {
    column: "created_at",
    order: OrderColumn.ASC,
  },
});

const account_roles = await useAsyncData("fetch-account-roles", async () => {
  const res = await useFetchApi<ResponsePagination<AccountRole[]>>(
    `/search`,
    "fetch-account-roles",
    "post",
    request_search.value
  );
  account_mappings.value = [];
  if (res.data.value?.data) {
    (res.data.value?.data || []).forEach((element) => {
      account_mappings.value.push({
        unique_id: "",
        reference: AccountMappingReference.ADJUSTMENT_TRANSACTION,
        reference_id: "",
        account_role_id: element.unique_id,
        account_id: "",
        version: 0,
        account_role: element,
      });
    });
  }

  return res.data.value;
});

// Load data for edit
const loadTaxData = async () => {
  if (!isEdit.value) return;

  try {
    loading.value = true;
    const response = await useFetchApi<BaseResponse<AdjustmentTransaction>>(
      `/adjustments-transaction-read/${route.query.id}`,
      "get-tax-detail",
      "get",
      null
    );

    if (response.data.value?.success && response.data.value.data) {
      const taxData = response.data.value.data;
      form.value = {
        unique_id: taxData.unique_id,
        unique_code: taxData.unique_code,
        name: taxData.name,
        type: taxData.type,
        default_value: taxData.default_value,
        operator: taxData.operator,
        allow_party: taxData.allow_party,
        version: taxData.version,
        created_at: taxData.created_at,
        updated_at: taxData.updated_at,
        checked: false,
      };
    } else {
      ElMessage.error("Data pajak tidak ditemukan");
      router.push("/master/tax");
    }
  } catch (error) {
    ElMessage.error("Gagal memuat data pajak");
    router.push("/master/tax");
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

    useFetchApi<ResponsePagination<Account>>(
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

const handleSelectAccount = (index: number, item: any) => {
  const accountData: Account = item.data as Account;
  account_mappings.value[index].account_id = accountData.unique_id;
  account_mappings.value[index].account_name = accountData.name;
};
// Submit form
const onSubmit = async () => {
  if (!formRef.value) return;

  try {
    const valid = await formRef.value.validate();
    if (!valid) return;

    loading.value = true;

    const payload = {
      unique_id: form.value.unique_id,
      unique_code: form.value.unique_code,
      name: form.value.name,
      type: form.value.type,
      default_value: form.value.default_value,
      operator: form.value.operator,
      allow_party: form.value.allow_party,
    };

    const response = await useFetchApi<BaseResponse<AdjustmentTransaction>>(
      "/adjustments-transaction-create",
      "adjustment-create",
      "post",
      payload
    );

    if (response.status.value == "success") {
      if (isEdit.value) {
        ElMessage.success("Setting Biaya Tambahan diupdate");
      } else {
        ElMessage.success("Setting Biaya Tambahan dibuat");
      }

      // Redirect back to list
      router.push("/master/cost");
    } else {
      ElMessage.error("Setting Biaya Tambahan Gagal Di Buat!");
    }
  } catch (error: any) {
    if (error?.errors) {
      // Validation errors handled by form
      return;
    }
    ElMessage.error(
      isEdit.value
        ? "Gagal mengupdate Biaya Tambahan"
        : "Gagal membuat Biaya Tambahan"
    );
  } finally {
    loading.value = false;
  }
};

// Reset form
const onReset = () => {
  if (isEdit.value) {
    loadTaxData(); // Reload original data
  } else {
    formRef.value?.resetFields();
    form.value.version = 1;
    form.value.allow_party = false;
  }
};

// Delete tax
const onDelete = async () => {
  try {
    const confirmed = await ElMessageBox.confirm(
      "Apakah Anda yakin ingin menghapus setting pajak ini?",
      "Konfirmasi Hapus",
      {
        confirmButtonText: "Ya, Hapus",
        cancelButtonText: "Batal",
        type: "warning",
      }
    );

    if (confirmed) {
      deleteLoading.value = true;
      await useFetchApi<BaseResponse<any>>(
        "/tax-delete",
        "delete-tax",
        "post",
        [form.value.unique_id]
      );

      ElMessage.success("Setting pajak berhasil dihapus");
      router.push("/master/tax");
    }
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("Gagal menghapus setting pajak");
    }
  } finally {
    deleteLoading.value = false;
  }
};

// Watch for type changes to update validation
watch(
  () => form.value.type,
  (newType) => {
    // Clear default value when type changes
    form.value.default_value = 0;
  }
);

// Load data on mount if edit mode
onMounted(() => {
  if (isEdit.value) {
    loadTaxData();
  }
});
</script>

<style scoped>
.form-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.form-actions {
  margin-top: 30px;
  text-align: center;
}

.form-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.preview-card {
  margin-top: 20px;
}

.preview-title {
  font-size: 16px;
  font-weight: 600;
}

.preview-content {
  max-width: 500px;
}

.preview-value {
  font-weight: 600;
  color: var(--el-color-primary);
}

:deep(.el-descriptions__label) {
  font-weight: 500;
}
</style>
