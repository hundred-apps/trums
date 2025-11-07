<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3"> 
          {{ formMode === 'add' ? 'Tambah CoA Baru' : 'Edit CoA' }} 
        </span>
      </template>
    </el-page-header>
    
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
          />
        </el-form-item>
        
        
      </el-form>
      
      <template #footer>
        <div class="flex justify-end align-center">
          <el-button type="info" plain @click="resetForm(accountFormRef)">
            Reset
          </el-button>
          <el-button 
            type="primary" 
            @click="submitForm(accountFormRef)"
            :loading="loading"
          >
            {{ formMode === 'add' ? 'Simpan' : 'Update' }}
          </el-button>
        </div>
      </template>
    </el-card>
  </TrumsWrapper>
</template>

<script lang="ts" setup>
import type { ComponentSize, FormInstance, FormRules } from 'element-plus';
import { sampleAccount, type Account } from '~/types/finance/account';
import { OrderColumn, type RequestSearch } from '~/types/request_search';
import type { BaseResponse } from '~/types/response';
import type { ResponsePagination } from '~/types/response_pagination';

definePageMeta({
  middleware: ["auth", "app"],
});

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

const router = useRouter();
const route = useRoute();
const formSize = ref<ComponentSize>("default");
const accountFormRef = ref<FormInstance>();
const loading = ref(false);
const parentAccounts = ref<any[]>([]);
const formMode = ref<'add' | 'edit'>('add');

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

// Fetch parent accounts for autocomplete
const querySearchAccounts = (query: string, cb: (arg: any) => void) => {
  try {
    console.log(query);
    
    if(query != '' && query != 'null'){
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
      }

      useFetchApi<ResponsePagination<Account[]>>('/search', 'search-account', 'post', request_search).then((response) => {
        if(response.status.value == 'success'){
          const accounts: Account[] = (response.data.value?.data ?? []) as Account[];
          if(accounts.length > 0){
            cb(accounts.map((value) => ({
              value: `${value.name} (${value.code})`,
              isNew: false,
              ...value,
            })));
          }
          
        }
      })
    }
    
    
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

const goBack = () => router.back();

const resetForm = (formEl: FormInstance | undefined) => {
  formEl?.resetFields();
  accountForm.parent_id = null;
  accountForm.parent_name = '';
  accountForm.parent_code = '';
};

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  
  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true;
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

          ElMessage.success(
              `Account berhasil ${formMode.value === 'add' ? 'ditambahkan' : 'diupdate'}`
          );
        }  

      
      } catch (error: any) {
        ElMessage.error(
          error.response?.data?.message || 
          `Gagal ${formMode.value === 'add' ? 'menambahkan' : 'mengupdate'} account`
        );
      } finally {
        loading.value = false;
      }
    }
  });
};

// Load account data for edit mode
const fetchDataEdit = async () => {
  loading.value = true;
  try {
    const unique_id = useCookie('unique_id');
    const response = await useFetchApi<BaseResponse<Account>>(`/account-read/${unique_id.value}`, 'fetch-detail', 'get', null);
    if(response.status.value == 'success'){
      const account: Account|null = response.data.value?.data as Account;
      if(account != null){
        accountForm.code = account.code;
        accountForm.name =  account.name;
        accountForm.type =  account.type;
        accountForm.parent_id =  account.parent?.unique_id ?? '';
        accountForm.parent_name =  account.parent?.name ?? '';
        accountForm.parent_code =  account.parent?.code ?? '';
        accountForm.unique_id =  account.unique_id;
      }else{
        ElMessage.error('Gagal memuat data account')
        goBack();
      }
    }
  } catch (error) {
    ElMessage.error('Gagal memuat data account');
    goBack();
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const unique_id = useCookie('unique_id');
  if(unique_id.value != null && unique_id.value != undefined){
    fetchDataEdit();
  }
});
</script>

<style scoped>
.el-select, .el-autocomplete {
  width: 100%;
}
</style>