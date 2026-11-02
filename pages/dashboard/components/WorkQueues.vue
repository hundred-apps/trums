<script setup lang="ts">
import type { BaseResponse } from "~/types/response";

type DateRange = [Date, Date] | null;
type WorkStage = "procurement" | "sales" | "manager";
type InquiryStatistic = { total_inquiry: number; inquiries?: unknown[] };
type RabStatistic = {
  total_rab?: number;
  total_pending_approval?: number;
  rab?: unknown[];
};
type QueueCounts = Record<WorkStage, number>;

const props = defineProps<{ dateRange: [Date, Date] }>();
const pageLimit = 10;

const { data, pending, error, refresh } = await useAsyncData(
  "dashboard-work-queue-counts",
  async () => {
    const body: {
      start_date?: number;
      end_date?: number;
      offset: number;
      limit: number;
    } = { offset: 1, limit: pageLimit };

    const [start, end] = props.dateRange;
    const startOfDay = new Date(start);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(end);
    endOfDay.setHours(23, 59, 59, 999);
    body.start_date = Math.floor(startOfDay.getTime() / 1000);
    body.end_date = Math.floor(endOfDay.getTime() / 1000);

    const [noPrice, onProgress, pendingApproval] = await Promise.all([
      useFetchApi<BaseResponse<InquiryStatistic>>(
        "/statistic/inquiry-no-price",
        "dashboard-inquiry-no-price",
        "post",
        body
      ),
      useFetchApi<BaseResponse<InquiryStatistic>>(
        "/statistic/inquiry-on-progress",
        "dashboard-inquiry-on-progress",
        "post",
        body
      ),
      useFetchApi<BaseResponse<RabStatistic>>(
        "/statistic/rab-pending-approval",
        "dashboard-rab-pending-approval",
        "post",
        body
      ),
    ]);

    const responses = [noPrice, onProgress, pendingApproval];
    const failed = responses.find(
      (response) => response.code !== 200 || !response.data.value?.success
    );
    if (failed) {
      throw failed.error.value ?? new Error("Gagal memuat statistik dashboard");
    }

    return {
      procurement: noPrice.data.value?.data?.total_inquiry ?? 0,
      sales: onProgress.data.value?.data?.total_inquiry ?? 0,
      manager:
        pendingApproval.data.value?.data?.total_pending_approval ??
        pendingApproval.data.value?.data?.total_rab ??
        0,
    } satisfies QueueCounts;
  },
  { watch: [() => props.dateRange] }
);

const stages: {
  key: WorkStage;
  title: string;
  description: string;
  href: string;
}[] = [
  {
    key: "procurement",
    title: "Belum diproses · Procurement",
    description: "Inquiry belum memiliki harga.",
    href: "/sales/inquiry?dashboard_queue=procurement",
  },
  {
    key: "sales",
    title: "Sedang diproses · Sales",
    description: "Canvassing sedang dikerjakan atau belum diajukan.",
    href: "/sales/canvassing?dashboard_queue=sales",
  },
  {
    key: "manager",
    title: "Menunggu approval RAB · Manager",
    description: "Canvassing menunggu persetujuan manager.",
    href: "/sales/canvassing?dashboard_queue=manager",
  },
];
</script>

<template>
  <section class="mb-6">
    <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-4">
      <div>
        <h2 class="text-xl font-semibold">Pekerjaan yang perlu ditindaklanjuti</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">Ringkasan jumlah inquiry dan RAB pada rentang tanggal terpilih.</p>
      </div>
      <el-button :loading="pending" @click="refresh">Muat ulang</el-button>
    </div>

    <el-alert
      v-if="error"
      title="Ringkasan pekerjaan belum dapat dimuat"
      type="error"
      :closable="false"
      show-icon
      class="mb-4"
    >
      <template #default>
        <div class="flex items-center gap-3">
          <span>Periksa koneksi atau akses API, lalu coba lagi.</span>
          <el-button size="small" @click="refresh">Coba lagi</el-button>
        </div>
      </template>
    </el-alert>

    <div v-if="pending" class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <el-skeleton v-for="stage in stages" :key="stage.key" animated :rows="2" />
    </div>

    <div v-else-if="data" class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <el-card v-for="stage in stages" :key="stage.key" shadow="never" class="h-full">
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="font-semibold">{{ stage.title }}</h3>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ stage.description }}</p>
            </div>
            <NuxtLink
              :to="stage.href"
              class="rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
              :aria-label="`Buka ${stage.title}: ${data[stage.key]} item`"
            >
              <el-tag class="cursor-pointer text-lg">{{ data[stage.key] }}</el-tag>
            </NuxtLink>
          </div>
        </template>
        <NuxtLink :to="stage.href" class="inline-flex text-sm text-blue-600 hover:underline">
          Lihat daftar
        </NuxtLink>
      </el-card>
    </div>
  </section>
</template>
