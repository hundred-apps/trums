<template>
  <TrumsWrapper>
    <!-- Header -->
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3">
          Contact - {{ contactData?.unique_code }}
        </span>
      </template>
    </el-page-header>

    <!-- Contact Detail -->
    <el-card
      class="my-3"
      v-loading="loading"
      element-loading-text="Loading..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      element-loading-background="rgba(122, 122, 122, 0.8)"
    >
      <template #header>
        <div class="card-header flex justify-end">
          <el-button type="danger" :icon="Delete" @click="confirmDelete"
            >Hapus</el-button
          >
          <NuxtLink
            :href="`/contact-management/contacts/form/${contactData?.name}?mode=update&unique_id=${contactData?.unique_id}`"
            class="el-button el-button--primary"
          >
            <el-icon class="me-2"><Edit /></el-icon> Edit
          </NuxtLink>
        </div>
      </template>

      <div class="flex gap-3 my-3">
        <!-- Left Side -->
        <div class="flex-1">
          <el-descriptions :column="1" size="large" border>
            <el-descriptions-item label="Nama">
              {{ contactData?.name ?? "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="Email">
              {{ contactData?.email ?? "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="Telepon">
              {{ contactData?.phone ?? "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="Website">
              {{ contactData?.website ?? "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="Tax ID">
              {{ contactData?.tax_id ?? "-" }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- Right Side -->
        <div class="flex-1">
          <el-descriptions :column="1" size="large" border>
            <el-descriptions-item label="Tipe Contact">
              <el-tag v-if="contactData?.is_personal" type="primary"
                >Personal</el-tag
              >
              <el-tag v-else-if="contactData?.is_company" type="success"
                >Company</el-tag
              >
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="Parent">
              {{ contactData?.parent?.name ?? "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="Title">
              {{ contactData?.title ?? "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="Tags">
              <span v-if="contactData?.tags">{{ contactData.tags }}</span>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="Di Buat Pada">
              {{
                contactData?.created_at != null
                  ? formatLocalDate(contactData?.created_at)
                  : "-"
              }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      <el-card class="mt-3" shadow="never">
        <template #header>
          <div class="card-header flex items-center justify-between">
            <span>Daftar PIC</span>
          </div>
        </template>
        <el-table :data="contactData?.children ?? []" border>
          <el-table-column label="Nama" prop="name" />
          <el-table-column label="Telepon" prop="phone" />
          <el-table-column label="Email" prop="email" />
          <el-table-column label="Aksi" width="75">
            <template #default="scope">
              <el-button
                :icon="Delete"
                type="danger"
                @click="() => handleDeletePIC(scope.$index)"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- Addresses -->
      <el-card shadow="never" class="mt-3">
        <template #header>
          <div class="card-header">
            <span>Alamat</span>
          </div>
        </template>
        <el-table :data="contactData?.address ?? []" border>
          <el-table-column prop="address_name" label="Nama Alamat" />
          <el-table-column prop="street" label="Jalan" />
          <el-table-column prop="city" label="Kota" />
          <el-table-column prop="province" label="Provinsi" />
          <el-table-column prop="codepos" label="Kode Pos" />
          <el-table-column prop="country" label="Negara" />
        </el-table>
      </el-card>
    </el-card>
  </TrumsWrapper>
</template>

<script lang="ts" setup>
import { Delete, Edit, Plus } from "@element-plus/icons-vue";
import type { Contact } from "~/types/contact";
import type { BaseResponse } from "~/types/response";

definePageMeta({
  middleware: ["auth", "app"],
  name: "Contact Detail",
});

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const contactData = ref<Contact | null>(null);

// Loading animation SVG
const svg = `
  <path class="path" d="
    M 30 15
    L 28 17
    M 25.61 25.61
    A 15 15, 0, 0, 1, 15 30
    A 15 15, 0, 1, 1, 27.99 7.5
    L 15 15
  " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
`;

const goBack = () => router.back();

// Fetch Contact
const fetchContact = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<Contact>>(
      `/contact-read/${route.params.id}`,
      "detail-contact",
      "get",
      null
    );
    if (response.status.value === "success") {
      contactData.value = response.data.value!.data;
    }
  } catch (error) {
    ElMessage.error("Gagal memuat data kontak");
    goBack();
  } finally {
    loading.value = false;
  }
};

const submitDeleteContact = async (ids: string[]): Promise<boolean> => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<any>>(
      "/contact-delete",
      "delete-pic",
      "post",
      ids
    );
    if (response.status.value === "success") {
      return true;
    } else {
      return false;
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message || error);
    loading.value = false;
    return false;
  }
};

const handleDeletePIC = async (index: number) => {
  await ElMessageBox.confirm("Yakin ingin menghapus data PIC", "Warning", {
    confirmButtonText: "Hapus",
    cancelButtonText: "Batal",
    type: "warning",
  });

  const exist = contactData.value?.children?.[index];
  if (exist) {
    if (exist.unique_id) {
      await submitDeleteContact([exist.unique_id ?? ""]);
    }
    contactData.value?.children?.splice(index, 1);
  }
};

// Format date
const formatDate = (timestamp?: number | null) => {
  if (!timestamp) return "-";
  return new Date(timestamp * 1000).toLocaleDateString("id-ID");
};

const addLineContact = () =>
  contactData.value!.children!.push({
    id: 0,
    unique_id: "",
    unique_code: "",
    is_personal: false,
    is_company: null,
    internal_id: "",
    name: "",
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
  });

// Delete Contact
const confirmDelete = () => {
  ElMessageBox.confirm(
    "Kontak ini akan dihapus permanen. Lanjutkan?",
    "Warning",
    {
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      type: "warning",
    }
  )
    .then(async () => {
      await deleteContact();
    })
    .catch(() => {});
};

const deleteContact = async () => {
  loading.value = true;
  try {
    // await $fetch(`/api/contact/${contactData.value?.id}`, { method: 'DELETE' })
    ElMessage.success("Kontak berhasil dihapus");
    router.push("/contacts");
  } catch (error) {
    ElMessage.error("Gagal menghapus kontak");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchContact();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-descriptions__body) {
  background-color: transparent;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
}
</style>
