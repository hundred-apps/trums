<template>
  <el-tabs type="border-card">
    <el-tab-pane label="Penawaran Vendor">
      <el-row :gutter="20" class="mb-3">
        <el-col :span="6">
          <el-input
            v-model="request_search.keyword"
            size="default"
            placeholder="Type to search"
          />
        </el-col>
        <el-button
          type="default"
          size="default"
          :icon="Plus"
          @click="createNewOffer"
        >
          Buat Baru
        </el-button>
      </el-row>

      <el-table
        :data="data?.data"
        style="width: 100%"
        ref="tableRef"
        :lazy="true"
        @cell-click="onSelect"
      >
        <el-table-column label="No.QUO" width="130">
          <template #default="scope">
            <NuxtLink
              class="text-blue-500"
              :href="`/supply-chain-management/offer/${scope.row.pricetag.unique_id}`"
              target="_blank"
              >{{
                wrapUniqueCode(scope.row.pricetag?.unique_code ?? "-")
              }}</NuxtLink
            >
          </template>
        </el-table-column>
        <el-table-column label="Vendor" width="180">
          <template #default="scope">
            <p>{{ scope.row.pricetag?.owner?.name ?? "-" }}</p>
          </template>
        </el-table-column>
        <el-table-column label="Nama Item">
          <template #default="scope">
            <NuxtLink
              class="text-blue-500"
              :to="`/catalogue/${scope.row.unique_id}`"
            >
              {{ scope.row.catalogue?.name ?? "" }}
            </NuxtLink>
          </template>
        </el-table-column>
        <el-table-column label="Harga" width="120" align="right">
          <template #default="scope">
            <p>{{ currency(scope.row.price) }}</p>
          </template>
        </el-table-column>
        <el-table-column label="UOM" width="100" align="right">
          <template #default="scope">
            <p>{{ scope.row.unit?.name ?? "" }}</p>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-end mt-3">
        <el-pagination
          background
          :layout="`prev, pager, next, ${isMobile ? '' : 'sizes, total'}`"
          :total="data?.total_data"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
          size="small"
        />
      </div>
    </el-tab-pane>
    <el-tab-pane label="Penawaran Customer">
      <el-row :gutter="20" class="mb-3">
        <el-col :span="6">
          <el-input
            v-model="request_search_customer.keyword"
            size="default"
            placeholder="Type to search"
          />
        </el-col>
      </el-row>

      <el-table
        :data="offerCustomer.data.value?.data ?? []"
        style="width: 100%"
        ref="tableRef"
        :lazy="true"
        @cell-click="onSelect"
      >
        <el-table-column label="No.QUO" width="130">
          <template #default="scope">
            <NuxtLink
              class="text-blue-500"
              :href="`/sales/offer/${scope.row.pricetag.unique_id}`"
              target="_blank"
              >{{
                wrapUniqueCode(scope.row.pricetag?.unique_code ?? "-")
              }}</NuxtLink
            >
          </template>
        </el-table-column>
        <el-table-column label="No.RAB" width="180">
          <template #default="scope">
            <NuxtLink
              v-if="scope.row.pricetag?.reference_data"
              :target="'_blank'"
              class="text-blue-600"
              :href="`/sales/quotation/${ (scope.row.pricetag?.reference_data as Canvassing).unique_id }`"
              >{{ (scope.row.pricetag?.reference_data as Canvassing|undefined)?.unique_code || "N/A" }}
            </NuxtLink>
          </template>
        </el-table-column>
        <el-table-column label="Nama Item">
          <template #default="scope">
            <NuxtLink
              class="text-blue-500"
              :to="`/catalogue/${scope.row.unique_id}`"
              target="_blank"
            >
              {{ scope.row.catalogue?.name ?? "" }}
            </NuxtLink>
          </template>
        </el-table-column>
        <el-table-column label="Harga" width="120" align="right">
          <template #default="scope">
            <p>{{ currency(scope.row.price) }}</p>
          </template>
        </el-table-column>
        <el-table-column label="UOM" width="100" align="right">
          <template #default="scope">
            <p>{{ scope.row.unit?.name ?? "" }}</p>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-end mt-3">
        <el-pagination
          background
          :layout="`prev, pager, next, ${isMobile ? '' : 'sizes, total'}`"
          :total="offerCustomer.data.value?.total_data"
          @current-change="handlePageChangeCustomer"
          @size-change="handleSizeChangeCustomer"
          size="small"
        />
      </div>
    </el-tab-pane>
  </el-tabs>
  <el-dialog
    v-model="visibleModalPricetagNewItem"
    title="Buat Penawaran Baru"
    width="1000"
  >
    <AddPriceTagComponent @submit="onRefresh" />
  </el-dialog>
  <el-image-viewer
    v-if="previewImage"
    show-progress
    :url-list="fileList"
    @close="previewImage = false"
  >
    <template #viewer-error="{ activeIndex, src }">
      <div class="image-slot viewer-error">
        <el-icon><icon-picture /></el-icon>
        <span>
          this is viewer-error slot. current index: {{ activeIndex }}. src:
          {{ src }}
        </span>
      </div>
    </template>
  </el-image-viewer>
</template>

<script lang="tsx" setup>
import { Plus, Picture } from "@element-plus/icons-vue";
import type { Pricetag_item } from "~/types/pricetag";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import AddPriceTagComponent from "./AddPriceTagComponent.vue";
import { currency, wrapUniqueCode } from "#imports";
import type { Canvassing } from "~/types/scm/canvasing";

interface Props {
  customer_id: string;
}

const props = defineProps<Props>();
const emit = defineEmits(["onSelection"]);

const { isMobile } = useDevice();

const visibleModalPricetagNewItem = ref<boolean>(false);
const previewImage = ref<boolean>(false);

const fileList = ref<string[]>([]);

const initialIndexImage = ref<number>(0);

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      pricetag: {
        category: ["penawaran"],
        type: ["in"],
      },
    },
  ],
  limit: "10",
  offset: "1",
  table: "pricetag_item",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
  flag: "list",
});
const request_search_customer = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      pricetag: {
        category: ["penawaran"],
        type: ["out"],
        to_id: [props.customer_id],
      },
    },
  ],
  limit: "10",
  offset: "1",
  table: "pricetag_item",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
  flag: "list",
});

const { data, refresh } = await useAsyncData(
  "fetch-pricetag-item",
  async () => {
    const res = await useFetchApi<ResponsePagination<Pricetag_item[]>>(
      `/search`,
      "fetch-pricetag-item",
      "post",
      request_search.value
    );
    return res.data.value;
  }
);

const offerCustomer = await useAsyncData(
  `fetch-pricetag-item-${props.customer_id}`,
  async () => {
    const res = await useFetchApi<ResponsePagination<Pricetag_item[]>>(
      `/search`,
      `fetch-pricetag-item-${props.customer_id}`,
      "post",
      request_search_customer.value
    );
    return res.data.value;
  }
);

const handlePageChange = (page: number) => {
  console.log("harusnya referesh");
  request_search.value.offset = `${page}`;
};

const handleSizeChange = (size: number) => {
  console.log("harusnya referesh");
  request_search.value.limit = `${size}`;
};
const handlePageChangeCustomer = (page: number) => {
  console.log("harusnya referesh");
  request_search_customer.value.offset = `${page}`;
};

const handleSizeChangeCustomer = (size: number) => {
  console.log("harusnya referesh");
  request_search_customer.value.limit = `${size}`;
};

const createNewOffer = () => {
  visibleModalPricetagNewItem.value = true;
};

const onSelect = (item: Pricetag_item) => {
  emit("onSelection", item);
};

const onRefresh = () => refresh();
const onRefreshCustomer = () => offerCustomer.refresh();

watch(
  () => request_search_customer.value,
  () => onRefreshCustomer(),
  { immediate: true, deep: true }
);
watch(
  () => request_search.value,
  () => onRefresh(),
  { immediate: true, deep: true }
);
</script>
