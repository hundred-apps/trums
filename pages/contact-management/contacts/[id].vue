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
        <div
          class="flex flex-col mb-5"
          v-for="(address, index) in contactData?.address"
        >
          <div class="flex justify-start gap-3 items-center">
            <span class="font-bold text-md mb-1">
              {{ address.address_name }} | {{ address.phone }}
            </span>
            <span class="text-sm mb-1 text-blue-600 font-italic">
              Alamat
              {{ getAddressLabel(address.type || AddressLabel.DELIVERY) }}
            </span>
          </div>
          <p class="text-sm" style="line-height: 15px">
            {{ address.street }}
          </p>
          <p class="text-sm">
            {{ generateAddressView(address) }}
          </p>
        </div>
      </el-card>

      <!-- Produk Dijual (Penawaran Masuk) -->
      <el-card class="mt-3" shadow="never" v-loading="soldProductsPending">
        <template #header>
          <div class="card-header flex items-center justify-between">
            <span>Produk Dijual (Penawaran Masuk)</span>
            <el-input
              v-model="soldProductsKeyword"
              size="small"
              placeholder="Cari produk"
              clearable
              style="width: 220px"
              @change="handleSoldSearch"
            />
          </div>
        </template>
        <el-table
          :data="soldProductsData?.data ?? []"
          border
          @sort-change="handleSoldSortChange"
        >
          <el-table-column
            label="Produk"
            prop="item_name"
            min-width="180"
            sortable="custom"
          >
            <template #default="scope">
              {{ scope.row.catalogue?.name ?? scope.row.item_name ?? "-" }}
            </template>
          </el-table-column>
          <el-table-column
            label="Qty"
            prop="quantity"
            width="80"
            sortable="custom"
          />
          <el-table-column
            label="Satuan"
            prop="unit_name"
            width="100"
            sortable="custom"
          />
          <el-table-column label="Harga" prop="price" width="120" sortable="custom">
            <template #default="scope">
              {{ currency(scope.row.price ?? 0) }}
            </template>
          </el-table-column>
          <el-table-column label="Total" prop="total_price" width="120" sortable="custom">
            <template #default="scope">
              {{
                currency((scope.row.price ?? 0) * (scope.row.quantity ?? 0))
              }}
            </template>
          </el-table-column>
          <el-table-column
            label="No. Penawaran"
            prop="pricetag.unique_code"
            width="150"
            sortable="custom"
          >
            <template #default="scope">
              {{ scope.row.pricetag?.unique_code ?? "-" }}
            </template>
          </el-table-column>
          <el-table-column
            label="Tanggal"
            prop="created_at"
            width="120"
            sortable="custom"
          >
            <template #default="scope">
              {{
                formatLocalDate(
                  scope.row.pricetag?.created_at ?? scope.row.created_at
                )
              }}
            </template>
          </el-table-column>
        </el-table>
        <div
          v-if="!(soldProductsData?.data ?? []).length"
          class="text-gray-500 mt-2"
        >
          Tidak ada data
        </div>
        <div class="flex justify-end mt-3">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next"
            :total="soldProductsData?.total_data ?? 0"
            v-model:page-size="soldProductsSize"
            v-model:current-page="soldProductsPage"
            :page-sizes="[10, 20, 30, 50]"
            @current-change="handleSoldPageChange"
            @size-change="handleSoldSizeChange"
          />
        </div>
      </el-card>

      <!-- Produk Dibeli -->
      <el-card class="mt-3" shadow="never" v-loading="boughtProductsPending">
        <template #header>
          <div class="card-header flex items-center justify-between">
            <span>Produk Dibeli</span>
            <el-input
              v-model="boughtProductsKeyword"
              size="small"
              placeholder="Cari produk"
              clearable
              style="width: 220px"
              @change="handleBoughtSearch"
            />
          </div>
        </template>
        <el-table
          :data="boughtProductsData?.data ?? []"
          border
          @sort-change="handleBoughtSortChange"
        >
          <el-table-column
            label="Produk"
            prop="item_name"
            min-width="180"
            sortable="custom"
          >
            <template #default="scope">
              {{
                scope.row.catalogue?.name ??
                scope.row.catalogue_name ??
                scope.row.item_name ??
                "-"
              }}
            </template>
          </el-table-column>
          <el-table-column
            label="Qty"
            prop="quantity"
            width="80"
            sortable="custom"
          />
          <el-table-column
            label="Satuan"
            prop="unit_name"
            width="100"
            sortable="custom"
          />
          <el-table-column label="Harga" prop="unit_price" width="120" sortable="custom">
            <template #default="scope">
              {{ currency(scope.row.unit_price ?? 0) }}
            </template>
          </el-table-column>
          <el-table-column label="Total" prop="total_price" width="120" sortable="custom">
            <template #default="scope">
              {{ currency(scope.row.total_price ?? 0) }}
            </template>
          </el-table-column>
          <el-table-column
            label="No. PO"
            prop="purchase_order.unique_code"
            width="150"
            sortable="custom"
          >
            <template #default="scope">
              {{ scope.row.purchase_order?.unique_code ?? "-" }}
            </template>
          </el-table-column>
          <el-table-column
            label="Tanggal"
            prop="created_at"
            width="120"
            sortable="custom"
          >
            <template #default="scope">
              {{
                formatLocalDate(
                  scope.row.purchase_order?.created_at ?? scope.row.created_at
                )
              }}
            </template>
          </el-table-column>
        </el-table>
        <div
          v-if="!(boughtProductsData?.data ?? []).length"
          class="text-gray-500 mt-2"
        >
          Tidak ada data
        </div>
        <div class="flex justify-end mt-3">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next"
            :total="boughtProductsData?.total_data ?? 0"
            v-model:page-size="boughtProductsSize"
            v-model:current-page="boughtProductsPage"
            :page-sizes="[10, 20, 30, 50]"
            @current-change="handleBoughtPageChange"
            @size-change="handleBoughtSizeChange"
          />
        </div>
      </el-card>
    </el-card>
  </TrumsWrapper>
</template>

<script lang="ts" setup>
import { Delete, Edit, Plus } from "@element-plus/icons-vue";
import type { Contact } from "~/types/contact";
import type { BaseResponse } from "~/types/response";
import type { ResponsePagination } from "~/types/response_pagination";
import type { PurchaseOrder } from "~/types/scm/purchase_order";
import type { PurchaseOrderItem } from "~/types/scm/purchase_order";
import type { Pricetag_item } from "~/types/pricetag";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import { formatLocalDate, currency } from "#imports";
import { generateAddressView } from "#imports";
import { AddressLabel, getAddressLabel } from "~/types/address";

definePageMeta({
  middleware: ["auth", "app"],
  name: "Contact Detail",
});

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const contactData = ref<Contact | null>(null);

const contactId = String(route.params.id || "");

const soldProductsPage = ref(1);
const soldProductsSize = ref(10);
const boughtProductsPage = ref(1);
const boughtProductsSize = ref(10);
const soldProductsKeyword = ref("");
const boughtProductsKeyword = ref("");

const requestSoldProducts = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      pricetag: {
        owner_id: [contactId],
        type: ["in"],
        category: ["penawaran"],
      },
    },
  ],
  limit: soldProductsSize.value.toString(),
  offset: soldProductsPage.value.toString(),
  table: "pricetag_item",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
});

const requestBoughtProducts = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      purchase_order: {
        vendor_id: [contactId],
        type: ["so"],
      },
    },
  ],
  limit: boughtProductsSize.value.toString(),
  offset: boughtProductsPage.value.toString(),
  table: "purchase_order_item",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
});

const {
  data: soldProductsData,
  pending: soldProductsPending,
  refresh: refreshSoldProducts,
} = await useAsyncData(
  `contact-sold-products-${contactId}`,
  async () => {
    const res = await useFetchApi<ResponsePagination<Pricetag_item[]>>(
      "/search",
      `contact-sold-products-${contactId}`,
      "post",
      requestSoldProducts.value
    );
    return res.data.value;
  }
);

const {
  data: boughtProductsData,
  pending: boughtProductsPending,
  refresh: refreshBoughtProducts,
} = await useAsyncData(
  `contact-bought-products-${contactId}`,
  async () => {
    const res = await useFetchApi<ResponsePagination<PurchaseOrderItem[]>>(
      "/search",
      `contact-bought-products-${contactId}`,
      "post",
      requestBoughtProducts.value
    );
    return res.data.value;
  }
);

const handleSoldPageChange = (page: number) => {
  requestSoldProducts.value.offset = `${page}`;
  refreshSoldProducts();
};

const handleSoldSizeChange = (size: number) => {
  soldProductsSize.value = size;
  soldProductsPage.value = 1;
  requestSoldProducts.value.limit = `${size}`;
  requestSoldProducts.value.offset = "1";
  refreshSoldProducts();
};

const handleBoughtPageChange = (page: number) => {
  requestBoughtProducts.value.offset = `${page}`;
  refreshBoughtProducts();
};

const handleBoughtSizeChange = (size: number) => {
  boughtProductsSize.value = size;
  boughtProductsPage.value = 1;
  requestBoughtProducts.value.limit = `${size}`;
  requestBoughtProducts.value.offset = "1";
  refreshBoughtProducts();
};

const handleSoldSearch = () => {
  soldProductsPage.value = 1;
  requestSoldProducts.value.keyword = soldProductsKeyword.value;
  requestSoldProducts.value.offset = "1";
  refreshSoldProducts();
};

const handleBoughtSearch = () => {
  boughtProductsPage.value = 1;
  requestBoughtProducts.value.keyword = boughtProductsKeyword.value;
  requestBoughtProducts.value.offset = "1";
  refreshBoughtProducts();
};

const handleSoldSortChange = ({ prop, order }: { prop: string; order: string | null }) => {
  soldProductsPage.value = 1;
  requestSoldProducts.value.offset = "1";
  if (!order) {
    requestSoldProducts.value.sort = null;
  } else {
    requestSoldProducts.value.sort = {
      column: prop,
      order: order === "ascending" ? OrderColumn.ASC : OrderColumn.DESC,
    };
  }
  refreshSoldProducts();
};

const handleBoughtSortChange = ({ prop, order }: { prop: string; order: string | null }) => {
  boughtProductsPage.value = 1;
  requestBoughtProducts.value.offset = "1";
  if (!order) {
    requestBoughtProducts.value.sort = null;
  } else {
    requestBoughtProducts.value.sort = {
      column: prop,
      order: order === "ascending" ? OrderColumn.ASC : OrderColumn.DESC,
    };
  }
  refreshBoughtProducts();
};

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
      contactData.value = response.data.value!.data!;
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
