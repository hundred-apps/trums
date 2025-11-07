<template>
  <el-card class="my-3">
    <el-form
      ref="accountFormRef"
      style="max-width: 600px"
      :model="accountForm"
      :rules="accountRules"
      label-width="auto"
      class="demo-accountForm"
      :size="formSize"
      status-icon
      :disabled="loading"
    >
      <el-form-item label="Kode Account" prop="code">
        <el-input
          v-model="accountForm.code"
          placeholder="Masukan Kode Account"
          clearable
        />
      </el-form-item>
      
      <el-form-item label="Nama Account" prop="name">
        <el-input
          v-model="accountForm.name"
          placeholder="Masukan Nama Account"
          clearable
        />
      </el-form-item>
      
      <el-form-item label="Tipe Account" prop="type">
        <el-select
          v-model="accountForm.type"
          placeholder="Pilih Tipe Account"
          clearable
        >
          <el-option
            v-for="type in accountTypes"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="Parent Account" prop="parent_id">
        <el-autocomplete
          v-model="accountForm.parent_name"
          :fetch-suggestions="querySearchAccounts"
          :trigger-on-focus="false"
          clearable
          placeholder="Cari Parent Account"
          @select="handleSelectParent"
          @clear="clearParent"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="flex justify-end align-center">
        <el-button type="info" plain @click="handleReset">
          Reset
        </el-button>
        <el-button 
          type="primary" 
          @click="handleSubmit"
          :loading="loading"
        >
          {{ submitButtonText }}
        </el-button>
      </div>
    </template>
  </el-card>
</template>

<script lang="ts" setup>
import type { ComponentSize, FormInstance, FormRules } from 'element-plus';
import type { Account } from '~/types/finance/account';
import { OrderColumn, type RequestSearch } from '~/types/request_search';
import type { BaseResponse } from '~/types/response';
import type { ResponsePagination } from '~/types/response_pagination';

// Props
interface Props {
  initialData?: Account | null;
  mode?: 'add' | 'edit';
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  initialData: null,
  mode: 'add',
  loading: false
});

// Emits
const emit = defineEmits<{
  submit: [data: Account];
  reset: [];
  cancel: [];
}>();

// Types
interface AccountForm {
  unique_id?: string;
  code: string;
  name: string;
  type: string;
  parent_id: string | null;
  parent_name: string;
  parent_code: string;
}

interface AccountTypeOption {
  value: string;
  label: string;
}

export interface AccountFormData {
  unique_id?: string;
  code: string;
  name: string;
  type: string;
  parent_id: string | null;
}

// Reactive Data
const formSize = ref<ComponentSize>("default");
const accountFormRef = ref<FormInstance>();
const internalLoading = ref(false);

const accountForm = reactive<AccountForm>({
  code: '',
  name: '',
  type: '',
  parent_id: null,
  parent_name: '',
  parent_code: '',
  unique_id: '',
});

const accountTypes = ref<AccountTypeOption[]>([
  { value: 'asset', label: 'Asset' },
  { value: 'liability', label: 'Liability' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'equity', label: 'Equity' },
  { value: 'expense', label: 'Expense' }
]);

const accountRules = reactive<FormRules<AccountForm>>({
  code: [
    { required: true, message: 'Kode account wajib diisi', trigger: 'blur' },
    { min: 3, max: 10, message: 'Panjang kode 3-10 karakter', trigger: 'blur' }
  ],
  name: [
    { required: true, message: 'Nama account wajib diisi', trigger: 'blur' },
    { min: 3, max: 100, message: 'Panjang nama 3-100 karakter', trigger: 'blur' }
  ],
  type: [
    { required: true, message: 'Tipe account wajib dipilih', trigger: 'change' }
  ]
});

// Computed
const submitButtonText = computed(() => 
  props.mode === 'add' ? 'Simpan' : 'Update'
);

const isLoading = computed(() => props.loading || internalLoading.value);

// Methods
const querySearchAccounts = (query: string, cb: (arg: any) => void) => {
  try {
    if (!query || query === 'null') {
      cb([]);
      return;
    }

    const request_search: RequestSearch = {
      keyword: query,
      table: 'accounts',
      column: [],
      sort: {
        column: 'created_at',
        order: OrderColumn.ASC
      },
      offset: '1',
      limit: '10'
    };

    useFetchApi<ResponsePagination<Account[]>>(
      '/search', 
      `search-account-${Date.now()}`, 
      'post', 
      request_search
    ).then((response) => {
        if (response.status.value === 'success') {
            const accounts: Account[] = (response.data.value?.data ?? []) as Account[];
            if (accounts.length > 0) {
                cb(accounts.map((value) => ({
                value: `${value.name} (${value.code})`,
                isNew: false,
                ...value,
                })));
            } else {
                cb([]);
            }
        }else{
            cb([]);
        }
    }).catch((err) => {
        cb([]);
    })

    
  } catch (error) {
    console.error('Failed to fetch accounts', error);
    cb([]);
  }
};

const handleSelectParent = (item: any) => {
  const account: Account = item as Account;
  accountForm.parent_id = account.unique_id;
  accountForm.parent_name = account.name;
  accountForm.parent_code = account.code;
};

const clearParent = () => {
  accountForm.parent_id = null;
  accountForm.parent_name = '';
  accountForm.parent_code = '';
};

const handleReset = () => {
  accountFormRef.value?.resetFields();
  clearParent();
  emit('reset');
};

const handleSubmit = async () => {
  if (!accountFormRef.value) return;
  
  await accountFormRef.value.validate(async (valid) => {
    if (valid) {
      internalLoading.value = true;
      
      try {
        
        const payload = {
          unique_id: accountForm.unique_id,
          code: accountForm.code,
          name: accountForm.name,
          type: accountForm.type,
          parent_id: accountForm.parent_id
        };

        const response = await useFetchApi<BaseResponse<Account>>('/account-create', 'store-account', 'post', payload);

        if(response.status.value == 'success'){
          const account: Account|null = response.data.value?.data as Account;
          if(account != null){
            accountForm.unique_id = account.unique_id;
          }

          emit('submit', account);
        }

        
      } finally {
        internalLoading.value = false;
      }
    }
  });
};

const loadFormData = (account: Account) => {
  accountForm.code = account.code;
  accountForm.name = account.name;
  accountForm.type = account.type;
  accountForm.parent_id = account.parent?.unique_id ?? '';
  accountForm.parent_name = account.parent?.name ?? '';
  accountForm.parent_code = account.parent?.code ?? '';
  accountForm.unique_id = account.unique_id;
};

const clearForm = () => {
  accountForm.code = '';
  accountForm.name = '';
  accountForm.type = '';
  accountForm.parent_id = null;
  accountForm.parent_name = '';
  accountForm.parent_code = '';
  accountForm.unique_id = '';
};

// Watch for initialData changes
watch(() => props.initialData, (newData) => {
  if (newData) {
    loadFormData(newData);
  } else {
    clearForm();
  }
}, { immediate: true });

// Expose methods to parent
defineExpose({
  resetForm: handleReset,
  submitForm: handleSubmit,
  clearForm
});
</script>

<style scoped>
.el-select, .el-autocomplete {
  width: 100%;
}
</style>