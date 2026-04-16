<template>
  <el-row :gutter="16">
    <el-col :xs="24" :sm="12" :md="12" class="mb-4">
      <div class="statistic-card">
        <el-statistic
          :value="statisticBill.data.value?.data.total_nominal ?? 0"
        >
          <template #title>
            <div
              style="display: inline-flex; align-items: center"
              class="text-green-500"
            >
              Total Tagihan
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
        <el-statistic
          :value="statisticBill.data.value?.data.total_received ?? 0"
        >
          <template #title>
            <div
              style="display: inline-flex; align-items: center"
              class="text-red-500"
            >
              Total Harus Di Bayar
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
    <el-col :xs="24" :sm="12" :md="12" class="mb-4">
      <div class="statistic-card">
        <el-statistic :value="statisticBill.data.value?.data.total_paid ?? 0">
          <template #title>
            <div
              style="display: inline-flex; align-items: center"
              class="text-blue-500"
            >
              Telah Di Bayar
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
    <el-col :xs="24" :sm="12" :md="12" class="mb-4">
      <div class="statistic-card">
        <el-statistic
          :value="statisticBill.data.value?.data.total_invoices ?? 0"
        >
          <template #title>
            <div
              style="display: inline-flex; align-items: center"
              class="text-black-500"
            >
              Total Data Tagihan
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
import type { StatisticInvoice } from "~/types/finance/invoice";
import { StatisticTable, type RequestStatistic } from "~/types/request_search";
import type { BaseResponse } from "~/types/response";
import type { ResponsePagination } from "~/types/response_pagination";

const request_statistic_bill = ref<RequestStatistic>({
  table: StatisticTable.invoices,
  type: "in",
});

const statisticBill = await useFetchApi<ResponsePagination<StatisticInvoice>>(
  `/statistic`,
  "invoice-statistic",
  "post",
  request_statistic_bill.value
);

await useAsyncData("bill-statistic", async () => {
  const res = await useFetchApi<ResponsePagination<StatisticInvoice>>(
    `/statistic`,
    "bill-statistic",
    "post",
    request_statistic_bill.value
  );
  return res.data.value;
});
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
