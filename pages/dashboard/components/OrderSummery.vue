<template>
  <el-date-picker
    class="mb-3"
    v-model="monthRange"
    type="monthrange"
    unlink-panels
    range-separator="To"
    start-placeholder="Start month"
    end-placeholder="End month"
    :shortcuts="shortcuts"
  />
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

const currentYear = new Date().getFullYear();

const monthRange = ref([
  new Date(currentYear, 0, 1),
  new Date(currentYear, 11, 1),
]);

const shortcuts = [
  {
    text: "This month",
    value: [new Date(), new Date()],
  },
  {
    text: "This year",
    value: () => {
      const end = new Date();
      const start = new Date(new Date().getFullYear(), 0);
      return [start, end];
    },
  },
  {
    text: "Last 6 months",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 6);
      return [start, end];
    },
  },
];

const { data, status, refresh } = await useAsyncData(
  "fetch-po-summary",
  async () => {
    const res = await useFetchApi<BaseResponse<SummeryType>>(
      `/purchase-orders-summary?start_date=${
        monthRange.value[0].getTime() / 1000
      }&end_date=${monthRange.value[1].getTime() / 1000}`,
      "fetch-po-summary",
      "get",
      null
    );
    return res.data.value;
  }
);

// SELECT
//     i.unique_id,
//     i.unique_code,

//     COUNT(DISTINCT ir.unique_id) AS total_item,

//     COUNT(DISTINCT CASE
//         WHEN cv.id IS NOT NULL THEN ir.id
//     END) AS completed_item,

//     ROUND(
//         COUNT(DISTINCT CASE
//             WHEN cv.unique_id IS NOT NULL THEN ir.unique_id
//         END)
//         * 100 /
//         NULLIF(COUNT(DISTINCT ir.id),0),
//         2
//     ) AS progress

// FROM inquiries i

// LEFT JOIN item_request ir ON ir.inquiry_id = i.

// LEFT JOIN canvassing c
//     ON c.source_document = i.unique_code

// LEFT JOIN item_canvassing ic
//     ON ic.canvassing_id = c.unique_id
//     AND ic.catalogue_id = ir.catalogue_id

// LEFT JOIN canvassing_vendor cv
//     ON cv.item_canvassing_id = ic.unique_id

// GROUP BY
//     i.unique_id,
//     i.unique_code;

watch(
  () => monthRange.value,
  () => refresh(),
  { deep: true }
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
