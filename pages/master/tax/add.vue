<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3"> Tambah Pajak Baru </span>
      </template>
    </el-page-header>
    
    <el-card class="my-3">
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
        <el-form-item label="Nama Pajak" prop="tax_name">
          <el-input
            v-model="ruleForm.tax_name"
            placeholder="Masukan Nama Pajak"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="Tipe Unit" prop="unit">
          <el-radio-group v-model="ruleForm.unit">
            <el-radio value="percentage">Percentage (%)</el-radio>
            <el-radio value="nominal">Nominal (Rp)</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item 
          :label="ruleForm.unit === 'percentage' ? 'Nilai Pajak (%)' : 'Nilai Pajak (Rp)'" 
          prop="tax_value"
        >
          <el-input
            v-model="ruleForm.tax_value"
            :placeholder="ruleForm.unit === 'percentage' ? 'Masukan nilai persentase' : 'Masukan nilai nominal'"
            :formatter="ruleForm.unit === 'percentage' ? formatPercentage : formatCurrency"
            :parser="ruleForm.unit === 'percentage' ? parsePercentage : parseCurrency"
          >
            <template v-if="ruleForm.unit === 'percentage'" #append>%</template>
            <template v-else #append>Rp</template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="Keterangan" prop="description">
          <el-input
            v-model="ruleForm.description"
            type="textarea"
            :rows="3"
            placeholder="Masukan keterangan tambahan (opsional)"
            clearable
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="flex justify-end align-center">
          <el-button type="info" plain @click="resetForm(ruleFormRef)">
            Reset
          </el-button>
          <el-button type="primary" :loading="loading" @click="submitForm(ruleFormRef)">
            Simpan
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

interface RuleForm {
  tax_name: string;
  unit: 'percentage' | 'nominal';
  tax_value: string;
  tax_value_numeric: number;
  description: string;
  unique_id?: string;
}

import { reactive, ref, onMounted, watch } from "vue";
import {
  type ComponentSize,
  type FormInstance,
  type FormRules,
  ElMessage,
  ElMessageBox,
} from "element-plus";
import { useApi } from "#imports";
import type { Tax } from "~/types/tax";
import type { BaseResponse } from "~/types/response";

const router = useRouter();
const route = useRoute();

const goBack = () => router.back();

const loading = ref<boolean>(false);
const formSize = ref<ComponentSize>("default");
const ruleFormRef = ref<FormInstance>();

const id = computed(() => route.query.id as string);

const ruleForm = reactive<RuleForm>({
  tax_name: "",
  unit: "percentage",
  tax_value: "",
  tax_value_numeric: 0,
  description: "",
});

const rules = reactive<FormRules<RuleForm>>({
  tax_name: [
    { required: true, message: "Nama pajak harus diisi", trigger: "blur" },
    { min: 2, message: "Nama pajak minimal 2 karakter", trigger: "blur" }
  ],
  unit: [
    { required: true, message: "Tipe unit harus dipilih", trigger: "change" }
  ],
  tax_value: [
    { required: true, message: "Nilai pajak harus diisi", trigger: "blur" },
    { 
      validator: (_, value, callback) => {
        if (ruleForm.unit === 'percentage') {
          const numValue = parseFloat(value.replace(/[^0-9.]/g, ''));
          if (numValue < 0 || numValue > 100) {
            callback(new Error('Nilai persentase harus antara 0-100%'));
          } else {
            callback();
          }
        } else {
          const numValue = parseFloat(value.replace(/[^0-9]/g, ''));
          if (numValue < 0) {
            callback(new Error('Nilai nominal tidak boleh negatif'));
          } else {
            callback();
          }
        }
      }, 
      trigger: "blur" 
    }
  ],
});

// Format currency for nominal input
const formatCurrency = (value: any) => {
  if (!value) return '';
  const num = parseInt(value.replace(/[^0-9]/g, ''));
  return isNaN(num) ? '' : num.toLocaleString('id-ID');
};

// Parse currency for nominal input
const parseCurrency = (value: any) => {
  return value.replace(/[^0-9]/g, '');
};

// Format percentage input
const formatPercentage = (value: any) => {
  if (!value) return '';
  const num = parseFloat(value.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? '' : num.toString();
};

// Parse percentage input
const parsePercentage = (value: any) => {
  return value.replace(/[^0-9.]/g, '');
};

// Watch unit changes to reset tax value
watch(() => ruleForm.unit, (newUnit) => {
  ruleForm.tax_value = "";
  ruleForm.tax_value_numeric = 0;
});

const submit = async (formEl: FormInstance | undefined) => {
  loading.value = true;
  try {
    // Convert tax_value to numeric based on unit
    if (ruleForm.unit === 'percentage') {
      ruleForm.tax_value_numeric = parseFloat(ruleForm.tax_value.replace(/[^0-9.]/g, ''));
    } else {
      ruleForm.tax_value_numeric = parseFloat(ruleForm.tax_value.replace(/[^0-9]/g, ''));
    }

    const payload = {
      tax_name: ruleForm.tax_name,
      unit: ruleForm.unit,
      tax_value: ruleForm.tax_value_numeric,
      description: ruleForm.description,
      unique_id: ruleForm.unique_id ?? null,
    };

    const response = await useFetchApi<BaseResponse<Tax>>(
      '/taxs-create',
      'create-tax',
      'post',
      payload
    );

    if (response.status.value === 'success') {
      ElMessage.success(
        ruleForm.unique_id 
          ? 'Pajak berhasil diperbarui' 
          : 'Pajak berhasil ditambahkan'
      );
      
      if (!ruleForm.unique_id) {
        resetForm(formEl);
      } else {
        // Redirect to list page after update
        setTimeout(() => {
          router.push('/master/tax');
        }, 1000);
      }
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message || 'Terjadi kesalahan'}`);
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
      console.log('Validation errors:', fields);
      ElMessage.error('Harap periksa kembali form yang diisi');
    }
  });
};

const resetForm = (formEl: FormInstance | undefined) => {
  formEl?.resetFields();
  ruleForm.tax_name = "";
  ruleForm.unit = "percentage";
  ruleForm.tax_value = "";
  ruleForm.tax_value_numeric = 0;
  ruleForm.description = "";
  ruleForm.unique_id = undefined;
};

const fetchTaxDetail = async () => {
  loading.value = true;
  try {
  
    if (!id.value) return;

    const response = await useFetchApi<BaseResponse<Tax>>(
      `/taxs-read/${id.value}`,
      'read-tax',
      'get',
      null,
    );

    if (response.status.value === 'success' && response.data.value) {
      const tax = response.data.value.data;
      ruleForm.tax_name = tax.tax_name || '';
      ruleForm.unit = tax.unit as 'percentage' | 'nominal' || 'percentage';
      
      // Format tax value based on unit
      if (tax.unit === 'percentage') {
        ruleForm.tax_value = tax.tax_value?.toString() || '';
      } else {
        ruleForm.tax_value = tax.tax_value?.toLocaleString('id-ID') || '';
      }
      
      ruleForm.tax_value_numeric = tax.tax_value || 0;
    //   ruleForm.description = tax.description || '';
      ruleForm.unique_id = tax.unique_id || undefined;
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message || 'Gagal memuat data pajak'}`);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  
  if (id.value) {
    fetchTaxDetail();
  }
});

// Clean up cookie when leaving page
onBeforeUnmount(() => {
  const unique_id = useCookie('tax_edit_id');
  if (unique_id.value && !ruleForm.unique_id) {
    unique_id.value = null;
  }
});
</script>

<style scoped>
.el-input-group__append {
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-regular);
}

.el-form-item {
  margin-bottom: 20px;
}

:deep(.el-textarea__inner) {
  resize: vertical;
  min-height: 80px;
}

.flex.justify-end.align-center {
  gap: 12px;
}
</style>