<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import {
  dayjs,
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules,
} from "element-plus";
import { useRouter, useRoute } from "vue-router";
import type { AccountRole } from "~/types/finance/account_role";
import type { BaseResponse } from "~/types/response";

const { formSize, labelPosition } = useFormConfig();

// ==================== PAGE META ====================
definePageMeta({
  middleware: ["auth", "app"],
});

// ==================== ROUTER & ROUTE ====================
const router = useRouter();
const route = useRoute();

const goBack = () => router.back();

// ==================== FORM REFS ====================
const formRef = ref<FormInstance>();
const isEdit = ref<boolean>(false);
const loading = ref<boolean>(false);

// ==================== DUMMY DATA STORE ====================
// Simulasi database dummy untuk edit
const dummyData: AccountRole[] = [
  {
    unique_id: "role-001",
    code: "ADMIN",
    name: "Administrator",
    created_at: dayjs().unix(),
  },
  {
    unique_id: "role-002",
    code: "FIN_MGR",
    name: "Finance Manager",
    created_at: dayjs().unix(),
  },
  {
    unique_id: "role-003",
    code: "FIN_STAFF",
    name: "Finance Staff",
    created_at: dayjs().unix(),
  },
  {
    unique_id: "role-004",
    code: "ACCT",
    name: "Accountant",
    created_at: dayjs().unix(),
  },
  {
    unique_id: "role-005",
    code: "AUDITOR",
    name: "Auditor",
    created_at: dayjs().unix(),
  },
  {
    unique_id: "role-006",
    code: "TREASURER",
    name: "Treasurer",
    created_at: dayjs().unix(),
  },
  {
    unique_id: "role-007",
    code: "CONTROLLER",
    name: "Financial Controller",
    created_at: dayjs().unix(),
  },
];

// ==================== FORM DATA ====================
const formData = ref<Omit<AccountRole, "created_at">>({
  unique_id: "",
  code: "",
  name: "",
});

// ==================== FORM VALIDATION RULES ====================
const rules = ref<FormRules<typeof formData>>({
  code: [
    { required: true, message: "Kode Role wajib diisi", trigger: "blur" },
    {
      min: 2,
      max: 20,
      message: "Kode Role harus 2-20 karakter",
      trigger: "blur",
    },
    {
      pattern: /^[A-Z_]+$/,
      message: "Kode Role hanya boleh huruf kapital dan underscore",
      trigger: "blur",
    },
  ],
  name: [
    { required: true, message: "Nama Role wajib diisi", trigger: "blur" },
    {
      min: 3,
      max: 50,
      message: "Nama Role harus 3-50 karakter",
      trigger: "blur",
    },
  ],
});

// ==================== CHECK IF EDIT MODE ====================
onMounted(() => {
  const id = route.query.id as string;
  if (id) {
    isEdit.value = true;
    const existingData = dummyData.find((item) => item.unique_id === id);
    if (existingData) {
      formData.value = {
        unique_id: existingData.unique_id,
        code: existingData.code,
        name: existingData.name,
      };
    } else {
      ElMessage.error("Data tidak ditemukan");
      router.push("/finance-management/account-roles");
    }
  }
});

// ==================== GENERATE UNIQUE ID ====================
const generateUniqueId = (): string => {
  const prefix = "role";
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `${prefix}-${timestamp}-${random}`;
};

// ==================== CHECK DUPLICATE CODE ====================
const isCodeDuplicate = (code: string, excludeId?: string): boolean => {
  return dummyData.some(
    (item) =>
      item.code.toUpperCase() === code.toUpperCase() &&
      item.unique_id !== excludeId
  );
};

// ==================== SUBMIT FORM ====================
const onSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    loading.value = true;

    try {
      const response = await useFetchApi<BaseResponse<any>>(
        "/account-role-create",
        "create-account-roles",
        "post",
        {
          unique_id: formData.value.unique_id,
          name: formData.value.name.toUpperCase(),
        }
      );

      if (response.status.value === "success") {
        router.push("/master/account_roles");
      }
    } catch (error) {
      ElMessage.error("Terjadi kesalahan, silakan coba lagi");
    } finally {
      loading.value = false;
    }
  });
};

// ==================== CANCEL / BACK ====================
const onCancel = () => {
  router.push("/finance-management/account-roles");
};

// ==================== RESET FORM ====================
const onReset = () => {
  if (!isEdit.value) {
    formData.value = {
      unique_id: "",
      code: "",
      name: "",
    };
    formRef.value?.clearValidate();
  } else {
    ElMessage.info("Gunakan tombol Batal untuk keluar dari edit");
  }
};

// ==================== PAGE TITLE ====================
const pageTitle = computed(() => {
  return isEdit.value ? "Edit Role" : "Tambah Role Baru";
});

const breadcrumbTitle = computed(() => {
  return isEdit.value ? "Edit Role" : "Tambah Role";
});
</script>

<template>
  <TrumsWrapper>
    <!-- PAGE HEADER -->
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3">{{ pageTitle }}</span>
      </template>
    </el-page-header>
    <!-- FORM -->
    <el-card class="max-w-2xl" shadow="never">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="auto"
        class="demo-ruleForm"
        :label-position="labelPosition"
        :size="formSize"
        @submit.prevent="onSubmit"
      >
        <!-- NAMA ROLE -->
        <el-form-item label="Nama Role" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="Masukkan nama role (contoh: Finance Manager)"
            :disabled="loading"
            clearable
          >
          </el-input>
        </el-form-item>
        <!-- ACTION BUTTONS -->
        <el-form-item>
          <div class="flex gap-3 w-full">
            <el-button
              type="primary"
              size="default"
              :loading="loading"
              @click="onSubmit"
              class="min-w-[120px]"
            >
              {{ isEdit ? "Perbarui" : "Simpan" }}
            </el-button>
            <el-button size="default" @click="onCancel" :disabled="loading">
              Batal
            </el-button>
            <el-button
              v-if="!isEdit"
              size="default"
              type="warning"
              plain
              @click="onReset"
              :disabled="loading"
            >
              Reset
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- INFORMASI TAMBAHAN (untuk edit) -->
    <el-card v-if="isEdit" class="max-w-2xl mt-4" shadow="never">
      <div class="text-sm text-gray-500">
        <div class="flex items-center gap-2">
          <el-icon><i class="el-icon-info" /></el-icon>
          <span>
            Role ini dibuat pada:
            {{
              new Date(
                dummyData.find((d) => d.unique_id === formData.unique_id)
                  ?.created_at || Date.now()
              ).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            }}
          </span>
        </div>
        <div class="flex items-center gap-2 mt-1">
          <el-icon><i class="el-icon-warning" /></el-icon>
          <span class="text-yellow-600">
            Perubahan akan mempengaruhi semua pengguna yang memiliki role ini
          </span>
        </div>
      </div>
    </el-card>
  </TrumsWrapper>
</template>

<style scoped>
:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

:deep(.el-input .el-input__inner) {
  text-transform: uppercase;
}

:deep(.el-card) {
  border: 1px solid var(--el-border-color-lighter);
}

:deep(.el-card .el-card__body) {
  padding: 24px;
}
</style>
