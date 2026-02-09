<template>
  <el-row :gutter="16">
    <el-col :xs="24" :sm="12" :md="12" class="mb-4">
      <div class="statistic-card">
        <el-statistic :value="data?.data?.penjualan ?? 0">
          <template #title>
            <div
              style="display: inline-flex; align-items: center"
              class="text-green-500"
            >
              Total Penjualan
              <el-tooltip
                effect="dark"
                content="Number of users who logged into the product in one day"
                placement="top"
              >
                <el-icon style="margin-left: 4px" :size="12">
                  <Warning />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-statistic>
      </div>
    </el-col>
    <el-col :xs="24" :sm="12" :md="12" class="mb-4">
      <div class="statistic-card">
        <el-statistic :value="data?.data?.pembelian ?? 0">
          <template #title>
            <div
              style="display: inline-flex; align-items: center"
              class="text-red-500"
            >
              Total Pembelian
              <el-tooltip
                effect="dark"
                content="Number of users who logged into the product in one month"
                placement="top"
              >
                <el-icon style="margin-left: 4px" :size="12">
                  <Warning />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-statistic>
      </div>
    </el-col>
  </el-row>
</template>

<script lang="tsx" setup>
import type { BaseResponse } from "~/types/response";

type SummeryType = {
  pembelian: number;
  penjualan: number;
};

const { data, pending } = await useFetchApi<BaseResponse<SummeryType>>(
  "/purchase-orders-summary",
  "fetch-po-summary",
  "get",
  null
);
</script>

<style scoped>
:global(h2#card-usage ~ .example .example-showcase) {
  background-color: var(--el-fill-color) !important;
}

.el-statistic {
  --el-statistic-content-font-size: 28px;
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

.green {
  color: var(--el-color-success);
}
.red {
  color: var(--el-color-error);
}
</style>
