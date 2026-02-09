<template>
  <TrumsWrapper>
    <!-- Statistic Cards -->
    <el-row :gutter="16">
      <el-col :span="6">
        <div class="statistic-card">
          <el-statistic
            :value="(data?.data ?? []).filter((item: PurchaseOrder) => item.status === PurchaseOrderStatus.DRAFT).length"
          >
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Draft Sales Order
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="statistic-card">
          <el-statistic
            :value="(data?.data ?? []).filter((item: PurchaseOrder) => item.status === PurchaseOrderStatus.PENDING_APPROVAL).length"
          >
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Pending Approval
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="statistic-card">
          <el-statistic
            :value="(data?.data ?? []).filter((item: PurchaseOrder) => item.status === PurchaseOrderStatus.CANCELLED).length"
          >
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Cancelled
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="statistic-card">
          <el-statistic :value="data?.total_data ?? 0">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Total Sales Order
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
    </el-row>

    <!-- Action Bar -->
    <el-row :gutter="20" class="mb-3 mt-4">
      <el-col :span="6">
        <el-input
          v-model="request_search.keyword"
          size="default"
          placeholder="Cari sales order..."
          clearable
        />
      </el-col>
      <el-col :span="18" class="text-right space-x-2">
        <NuxtLink
          class="el-button el-button--primary el-button--default"
          href="/sales/order/add"
        >
          Buat Sales Order Baru
        </NuxtLink>
        <el-button
          size="default"
          :loading-icon="Eleme"
          :loading="loading"
          @click="() => refreshNuxtData(refreshKey)"
        >
          Muat Ulang
        </el-button>
        <el-button
          type="danger"
          :disabled="hasDelete && selected.length > 0"
          @click="batchDelete"
        >
          Hapus yang Dipilih
        </el-button>
      </el-col>
    </el-row>

    <OrderTable
      :request_search="request_search"
      :key="refreshKey"
      @has-bulk="(value) => (selected = value)"
      v-on:on-pending="(value) => (loading = value)"
      @on-success="
        (value) => {
          console.log('purchase order data ', value);
          data = value ?? {
            currentPage: 0,
            data: [],
            success: false,
            total_page: 0,
            total_data: 0,
          };
        }
      "
    />
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import { Eleme } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import {
  PurchaseOrderStatus,
  type PurchaseOrder,
} from "~/types/scm/purchase_order";
import { NuxtLink } from "#components";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { BaseResponse } from "~/types/response";
import OrderTable from "./components/OrderTable.vue";
import { refreshNuxtData } from "#app";
import { load } from "@fingerprintjs/fingerprintjs";
import type { ResponsePagination } from "~/types/response_pagination";

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "purchase-order-read",
});

const refreshKey = "get-sales-order";

const selected = ref<string[]>([]);
const loading = ref<boolean>(false);

const hasCreate = await checkPermission("purchase-order-create");
const hasUpdate = await checkPermission("purchase-order-update");
const hasDelete = await checkPermission("purchase-order-delete");

const data = ref<ResponsePagination<PurchaseOrder[]>>({
  currentPage: 0,
  data: [],
  success: false,
  total_page: 0,
  total_data: 0,
});

// Search request
const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      type: ["so"],
      status: [],
    },
  ],
  limit: "10",
  offset: "1",
  table: "purchase_order",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
});

const onDelete = async (uniques: string[]) => {
  try {
    // Implement delete functionality here
    const response = await useFetchApi<BaseResponse<any>>(
      "/purchase-order-delete",
      "delete-purchase-order",
      "post",
      uniques
    );
    if (response.status.value === "success") {
      await refreshNuxtData(refreshKey);
    }
  } catch (error) {
    ElMessage.error("Gagal menghapus purchase order");
  }
};

const batchDelete = async () => {
  if (selected.value.length > 0) {
    await onDelete(selected.value);
  }
};

onMounted(() => {});
</script>

<style scoped>
.el-row {
  margin-bottom: 20px;
}

.statistic-card {
  height: 100%;
  padding: 20px;
  border-radius: 4px;
  background-color: var(--el-bg-color-overlay);
}

.statistic-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 16px;
}

.statistic-footer .footer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.statistic-footer .footer-item span:last-child {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
}
</style>
