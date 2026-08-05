<template>
  <TrumsWrapper>
    <!-- Statistic Cards -->
    <el-row :gutter="16">
      <el-col :span="6">
        <div class="statistic-card">
          <el-statistic
            :value="statistic.data.value?.data?.total_purchase_order || 0"
          >
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Total Data
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="statistic-card">
          <el-statistic :value="statistic.data.value?.data?.total_nominal || 0">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Total Purchase Order
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="statistic-card">
          <el-statistic
            :value="statistic.data.value?.data?.total_pending_approve || 0"
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
          <el-statistic :value="statistic.data.value?.data?.total_vendor || 0">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Total Vendor
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
          v-model="keywordSearch"
          size="default"
          placeholder="Cari purchase order..."
          clearable
        />
      </el-col>
      <el-col :span="18" class="text-right space-x-2">
        <NuxtLink
          class="el-button el-button--primary el-button--default"
          href="/supply-chain-management/purchase/order/add"
        >
          Buat Purchase Order Baru
        </NuxtLink>
        <el-button size="default" :loading-icon="Eleme" @click="onRefreshData">
          Muat Ulang
        </el-button>
        <el-button
          type="danger"
          :disabled="selectedPurchaseOrders.length == 0"
          @click="batchDelete"
        >
          Hapus yang Dipilih
        </el-button>
      </el-col>
    </el-row>

    <PurchaseOrderTable
      ref="childRef"
      :mode="'edit'"
      :keyword-search="keywordSearch"
      @on-selection-change="handleSelectionChange"
    />
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import { Eleme } from "@element-plus/icons-vue";

import {
  type PurchaseOrder,
  type PurchaseOrderStatistic,
} from "~/types/scm/purchase_order";
import { NuxtLink } from "#components";
import {
  OrderColumn,
  StatisticTable,
  type RequestSearch,
  type RequestStatistic,
} from "~/types/request_search";
import type { BaseResponse } from "~/types/response";

import PurchaseOrderTable from "../components/PurchaseOrderTable.vue";

definePageMeta({
  middleware: ["auth", "app"],
});

const childRef = ref<InstanceType<typeof PurchaseOrderTable> | null>(null);

const keywordSearch = ref<string>("");

const request_statistic = ref<RequestStatistic>({
  table: StatisticTable.purchase_order,
  type: "po",
});

const statistic = await useFetchApi<BaseResponse<PurchaseOrderStatistic>>(
  "/statistic",
  "po-statistic",
  "post",
  request_statistic.value
);

// Data state

const selectedPurchaseOrders = ref<PurchaseOrder[]>([]);

const handleSelectionChange = (selection: PurchaseOrder[]) => {
  console.log("on selection", selection);
  selectedPurchaseOrders.value = selection;
};

const batchDelete = async () => {
  const ids = selectedPurchaseOrders.value.map((item) => item.unique_id!) || [];

  if (ids.length > 0) {
    await onDelete(ids);
  }
};
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
      onRefreshData();
    }
  } catch (error) {
    ElMessage.error("Gagal menghapus purchase order");
  }
};

const onRefreshData = () => {
  childRef.value?.onRefreshData();
};

onMounted(() => {
  console.log("child ref", Object.keys(childRef.value!));
});
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
