<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3"> 
          {{ ruleForm.unique_id ? 'Edit Brand' : 'Tambah Brand Baru' }} 
        </span>
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
        <el-form-item label="Nama Brand" prop="name">
          <el-input
            v-model="ruleForm.name"
            placeholder="Masukan Nama Brand"
            clearable
          />
        </el-form-item>

        <el-form-item label="Parent Brand" prop="parent_name">
          <el-autocomplete
            v-model="ruleForm.parent_name"
            :fetch-suggestions="querySearchBrand"
            :trigger-on-focus="false"
            clearable
            class="inline-input w-50"
            placeholder="Cari parent brand (opsional)"
            @select="handleSelectBrand"
            @clear="handleClearParent"
          />
          <div class="el-upload__tip text-gray-400 mt-1">
            Kosongkan jika ini brand utama (tidak memiliki parent)
          </div>
        </el-form-item>

        <el-form-item label="Deskripsi" prop="description">
          <el-input
            v-model="ruleForm.description"
            type="textarea"
            :rows="4"
            placeholder="Deskripsi brand (opsional)"
          />
        </el-form-item>

      </el-form>
      
      <template #footer>
        <div class="flex justify-end align-center gap-3">
          <el-button type="info" plain @click="resetForm(ruleFormRef)">
            Reset
          </el-button>
          <el-button 
            type="primary" 
            :loading="loading"
            @click="submitForm(ruleFormRef)"
          >
            {{ ruleForm.unique_id ? 'Update' : 'Simpan' }}
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
  unique_id: string | null;
  name: string;
  parent_id: string | null;
  parent_name: string;
  description: string;
}



import { reactive, ref, onMounted } from "vue";
import {
  type ComponentSize,
  type FormInstance,
  type FormRules,
  ElMessage,
  ElMessageBox,
} from "element-plus";
import type { ResponsePagination } from "~/types/response_pagination";
import type { BaseResponse } from "~/types/response";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { Brands } from "~/types/brand";

const router = useRouter();
const route = useRoute();
const goBack = () => router.back();

const loading = ref<boolean>(false);
const formSize = ref<ComponentSize>("default");
const ruleFormRef = ref<FormInstance>();

const ruleForm = reactive<RuleForm>({
  unique_id: null,
  name: "",
  parent_id: null,
  parent_name: "",
  description: "",
});

const rules = reactive<FormRules<RuleForm>>({
  name: [
    { 
      required: true, 
      message: "Nama brand wajib diisi", 
      trigger: "blur" 
    },
    {
      min: 2,
      max: 100,
      message: "Nama brand harus antara 2-100 karakter",
      trigger: "blur",
    }
  ],
  description: [
    {
      max: 500,
      message: "Deskripsi maksimal 500 karakter",
      trigger: "blur",
    }
  ],
});

// Autocomplete search untuk parent brand
const querySearchBrand = (queryString: string, cb: (arg: any) => void) => {
  if (!queryString.trim()) {
    cb([]);
    return;
  }

  try {
    const requestSearch: RequestSearch = {
      keyword: queryString,
      table: "brands",
      limit: "10",
      offset: "1",
      column: [
        {
          parent_id: ['null'] // Hanya cari brand utama
        }
      ],
      sort: {
        column: "created_at",
        order: OrderColumn.DESC,
      }
    };

    const response = useFetchApi<ResponsePagination<Brands[]>>(
      '/search', 
      'search-parent-brands', 
      'post', 
      requestSearch
    ).then((response) => {
        if(response.status.value === "success"){
            const brands: Brands[] = response.data.value?.data || [];
      
            if (brands.length > 0) {
                cb(
                brands.map((brand: Brands) => ({
                    ...brand,
                    value: brand.name,
                }))
                );
            } else {
                cb([]);
            }
        }
    })

    
  } catch (error: any) {
    console.error('Search brand error:', error);
    ElMessage.error('Gagal mencari brand');
    cb([]);
  }
};

const handleSelectBrand = (item: any) => {
  ruleForm.parent_id = item.unique_id;
  ruleForm.parent_name = item.name;
};

const handleClearParent = () => {
  ruleForm.parent_id = null;
  ruleForm.parent_name = "";
};

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  
  await formEl.validate(async (valid) => {
    if (!valid) return;

    loading.value = true;
    try {
      // Siapkan payload - selalu gunakan POST
      const payload = {
        name: ruleForm.name,
        parent_id: ruleForm.parent_id,
        description: ruleForm.description,
      };

      // Jika edit, tambahkan unique_id ke payload
      if (ruleForm.unique_id) {
        (payload as any).unique_id = ruleForm.unique_id;
      }

      // Selalu gunakan POST baik untuk create maupun edit
      const response = await useFetchApi<BaseResponse<Brands>>(
        '/brands-create', 
        ruleForm.unique_id ? 'update-brand' : 'create-brand', 
        'post', 
        payload
      );

      if (response.status.value === 'success') {
        ElMessage.success(
          `Berhasil ${ruleForm.unique_id ? "memperbarui" : "menambahkan"} brand`
        );
        
        // Redirect ke halaman brands setelah sukses
        await navigateTo('/catalogue/brand');
      } else {
        ElMessage.error(response.data?.value?.message || 'Terjadi kesalahan');
      }

    } catch (error: any) {
      ElMessage.error(
        error.data?.message || "Terjadi kesalahan saat menyimpan"
      );
    } finally {
      loading.value = false;
    }
  });
};

const resetForm = (formEl: FormInstance | undefined) => {
  // Konfirmasi reset jika form sudah ada isian
  if (ruleForm.name || ruleForm.description || ruleForm.parent_name) {
    ElMessageBox.confirm(
      'Apakah Anda yakin ingin mereset form? Semua perubahan akan hilang.',
      'Konfirmasi Reset',
      {
        confirmButtonText: 'Ya, Reset',
        cancelButtonText: 'Batal',
        type: 'warning',
      }
    ).then(() => {
      formEl?.resetFields();
      Object.assign(ruleForm, {
        unique_id: route.query.id ? route.query.id as string : null,
        name: "",
        parent_id: null,
        parent_name: "",
        description: "",
      });
    }).catch(() => {
      // User canceled
    });
  } else {
    formEl?.resetFields();
    Object.assign(ruleForm, {
      unique_id: route.query.id ? route.query.id as string : null,
      name: "",
      parent_id: null,
      parent_name: "",
      description: "",
    });
  }
};

// Load data untuk edit berdasarkan route query
const loadBrandData = async (uniqueId: string) => {
  loading.value = true;
  try {
    
    const response = await useFetchApi<ResponsePagination<Brands>>(
      `/brands-read/${uniqueId}`, 
      'get-brand-detail', 
      'get', 
      null
    );

    if (response.status.value === 'success') {
      const brand = response.data.value?.data;
      
      if(brand){
        

        Object.assign(ruleForm, {
            unique_id: brand.unique_id,
            name: brand.name,
            parent_id: brand.parent_id,
            parent_name: brand.parent?.name ?? '',
            description: brand.description || "",
        });
      }
      
    } else {
      ElMessage.error('Data brand tidak ditemukan');
      await navigateTo('/catalogue/brand');
    }
  } catch (error: any) {
    ElMessage.error('Gagal memuat data brand');
    await navigateTo('/catalogue/brand');
  } finally {
    loading.value = false;
  }
};

// Check jika mode edit berdasarkan route query
onMounted(async () => {
  const brandId = route.query.id as string;
  
  if (brandId) {
    // Mode edit - load data brand
    await loadBrandData(brandId);
  } else {
    // Mode create - reset form
    Object.assign(ruleForm, {
      unique_id: null,
      name: "",
      parent_id: null,
      parent_name: "",
      description: "",
    });
  }
});
</script>

<style scoped>
.el-form-item {
  margin-bottom: 22px;
}

:deep(.el-textarea__inner) {
  min-height: 80px;
}

:deep(.el-autocomplete) {
  width: 100%;
}

.text-gray-400 {
  color: #9ca3af;
}

.mt-1 {
  margin-top: 0.25rem;
}
</style>