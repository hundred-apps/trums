<template>
  <TrumsWrapper>
    <!-- Statistic Cards -->
    <el-row :gutter="16">
      <el-col :span="8">
        <div class="statistic-card">
          <el-statistic
            :value="statistic.data.value?.data?.total_canvassing || 0"
          >
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Total Canvassing
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="statistic-card">
          <el-statistic
            :value="statistic.data.value?.data?.total_waiting_approve || 0"
          >
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Pending Approval
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="statistic-card">
          <el-statistic :value="statistic.data.value?.data?.total_done || 0">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Approved
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
    </el-row>

    <!-- Action Bar -->
    <div class="mb-3 flex gap-2 p-2" v-if="isMobile">
      <el-input
        v-model="request_search.keyword"
        size="default"
        placeholder="Cari canvassing..."
        clearable
      />
      <TrumsCustomLinkButton
        type="primary"
        :is-circle="true"
        url="/sales/canvassing/add"
      >
        <el-icon><Plus /></el-icon>
      </TrumsCustomLinkButton>
      <TrumsCustomButton
        type="danger"
        :loading="loading"
        :disabled="!hasSelected"
        :is-circle="true"
        @click="bulkDelete"
      >
        <el-icon><Delete /></el-icon>
      </TrumsCustomButton>
    </div>
    <el-row :gutter="20" class="mb-3" v-else>
      <el-col :span="6">
        <el-input
          v-model="request_search.keyword"
          size="default"
          placeholder="Cari canvassing..."
          clearable
        />
      </el-col>
      <NuxtLink
        class="el-button el-button--primary el-button--default"
        href="/sales/canvassing/add"
      >
        Buat Canvassing Baru
      </NuxtLink>
      <el-button
        size="default"
        :loading-icon="Eleme"
        :loading="loading"
        @click="onRefreshData"
      >
        Muat Ulang
      </el-button>
      <el-button type="danger" :disabled="!hasSelected" @click="bulkDelete">
        Hapus yang Dipilih
      </el-button>
    </el-row>

    <!-- Table -->
    <TrumsDragScrollTable>
      <CanvassingTable
        v-on:selection-change="(values) => handleSelectionChange(values)"
        :refresh-trigger="refreshTrigger"
        :request_search="request_search"
        :fetchKey="'get-canvassing'"
        :type="'CANVASSING'"
      />
    </TrumsDragScrollTable>
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import { Eleme, SetUp, Filter, Plus, Delete } from "@element-plus/icons-vue";
import {
  type Column,
  type CheckboxValueType,
  TableV2FixedDir,
  ElPopover,
  ElCheckbox,
  ElIcon,
  type SortBy,
  ElCheckboxGroup,
} from "element-plus";
import {
  CanvassingStatus,
  type Canvassing,
  type StatisticCanvassing,
} from "~/types/scm/canvasing";
import type { Pagination } from "~/types/pagination";
import { NuxtLink } from "#components";
import CustomTable from "~/components/trums/table/customTable.vue";
import type { ResponsePagination } from "~/types/response_pagination";
import {
  OrderColumn,
  StatisticTable,
  type RequestSearch,
  type RequestStatistic,
} from "~/types/request_search";
import type { BaseResponse } from "~/types/response";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";
import { TypeInquiry } from "~/types/inquiry";
import CanvassingTable from "./components/CanvassingTable.vue";
import { refreshNuxtData } from "#app";
import { load } from "@fingerprintjs/fingerprintjs";

const { isMobile } = useDevice();

definePageMeta({
  middleware: ["auth", "app", "check-access"],
  requiredPermission: "canvassing-read",
});

// Search request
const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      inquiries: {
        type: [TypeInquiry.SALES_INQUIRY],
      },
      status: [
        CanvassingStatus.DRAFT,
        CanvassingStatus.CANVASSING,
        CanvassingStatus.PENDING_APPROVAL_RAB,
        CanvassingStatus.DONE,
      ],
    },
  ],
  limit: "10",
  offset: "1",
  table: "canvassing",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
});

const request_statistic = ref<RequestStatistic>({
  table: StatisticTable.canvassing,
  type: "sales_inquiry",
});

const refreshTrigger = ref<number>(0);

// statistic
const statistic = await useFetchApi<BaseResponse<StatisticCanvassing>>(
  "/statistic",
  "get-statistic-canvasing",
  "post",
  request_statistic.value
);
const selectedCanvassing = ref<Canvassing[]>([]);

const loading = ref<boolean>(false);

const hasSelected = computed(() => {
  return selectedCanvassing.value.length > 0;
});

// Methods
const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleDateString("id-ID");
};

const renderStatusTag = (status: CanvassingStatus) => {
  if (!status) return <></>;

  switch (status) {
    case CanvassingStatus.DRAFT:
      return <el-tag type="info">DRAFT</el-tag>;
    case CanvassingStatus.CANVASSING:
      return <el-tag type="primary">ON CANVASSING</el-tag>;
    case CanvassingStatus.PENDING_APPROVAL_RAB:
      return <el-tag type="warning">PENDING APPROVAL</el-tag>;
    case CanvassingStatus.CANCEL:
      return <el-tag type="danger">CANCELED</el-tag>;
    default:
      return <el-tag>{status}</el-tag>;
  }
};

const bulkDelete = async () => {
  try {
    await ElMessageBox.confirm(
      "Yakin ingin menghapus data Canvassing?",
      "Warning",
      {
        confirmButtonText: "Hapus",
        cancelButtonText: "Batal",
        type: "warning",
      }
    );

    const ids =
      selectedCanvassing.value
        ?.filter((item) => item.checked)
        .map((item) => item.unique_id!) || [];

    // Jika sampai sini, user klik Delete
    await handleSubmitDelete(ids);
  } catch (error) {
    // User klik Cancel atau close dialog
    console.log("Delete cancelled");
  }
};

const handleSubmitDelete = async (values: string[]) => {
  try {
    const response = await useFetchApi(
      "/canvassing-delete",
      "delete_data",
      "post",
      values
    );
    if (response.status.value == "success") {
      refreshTrigger.value++;
      await refreshNuxtData("get-canvasing");
    }
  } catch (error: any) {
    ElMessage.error(`${error?.response?.data?.message ?? error}`);
  }
};

const handleSelectionChange = (selection: Canvassing[]) => {
  console.log("selection data", selectedCanvassing.value);
  selectedCanvassing.value = selection;
};

const handlePageChange = (page: number) => {
  request_search.value.offset = `${page}`;
};

const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`;
};

const onEdit = (canvassing: Canvassing) => {
  navigateTo(
    `/supply-chain-management/canvassing/edit/${canvassing.unique_id}`
  );
};

const onSort = (sortBy: SortBy) => {
  request_search.value.sort = {
    column: sortBy.key.toString(),
    order:
      request_search.value.sort?.order === OrderColumn.ASC
        ? OrderColumn.DESC
        : OrderColumn.ASC,
  };
};

const onRefreshData = () => refreshTrigger.value++;

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
