<template>
  <el-dialog v-model="visible" title="RFQ Items" width="1200">
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6">
        <el-input
          v-model="request_search_item_request.keyword"
          size="default"
          placeholder="Type to search"
        />
      </el-col>
      <!-- <el-button
        size="default"
        :disabled="selectedItemsRequest.length == 0"
        type="primary"
        @click="() => addItemRequestToCanvassing(selectedItemsRequest)"
      >
        Tambahkan
        {{
          selectedItemsRequest.length > 0 ? selectedItemsRequest.length : ""
        }}</el-button
      > -->
    </el-row>
    <el-table
      ref="tableItemRequestRef"
      :data="item_request.data.value?.data || []"
      @row-click="addItemRequestToCanvassing"
      @sort-change="onSort"
      border
    >
      <el-table-column label="Nama Item" prop="catalogue.name" :sortable="true">
        <template #default="{ row }">
          <span
            class="text-blue-600 cursor-pointer"
            >{{ (row as ItemRequest).catalogue?.name }}</span
          >
        </template>
      </el-table-column>
      <el-table-column
        label="QTY"
        align="right"
        width="100"
        prop="request_qty"
        :sortable="true"
      >
        <template #default="{ row }">
          {{ (row as ItemRequest).request_qty }}
        </template>
      </el-table-column>
      <el-table-column label="UoM" width="100">
        <template #default="{ row }">
          {{ (row as ItemRequest).unit_name }}
        </template>
      </el-table-column>
      <el-table-column label="No.RFQ" width="200">
        <template #default="{ row }">
          {{ (row as ItemRequest).inquiry?.unique_code }}
        </template>
      </el-table-column>
    </el-table>
    <div class="flex justify-end mt-3">
      <el-pagination
        background
        layout="prev, pager, next, sizes, total"
        :total="item_request.data.value?.total_data"
        @current-change="handlePageChangeItemRequest"
        @size-change="handleSizeChangeItemRequest"
      />
    </div>
  </el-dialog>
</template>

<script lang="tsx" setup>
import type { ElTable } from "element-plus";
import type { ItemRequest } from "~/types/item_request";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";

interface Props {
  visible: boolean;
}

interface Emits {
  (e: "update:visible", value: boolean): void;
  (e: "selectedSubmit", value: ItemRequest): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const request_search_item_request = ref<RequestSearch>({
  keyword: "",
  table: "item_request",
  column: [
    {
      inquiry: {
        type: ["sales_inquiry"],
      },
    },
  ],
  sort: null,
  offset: "1",
  limit: "10",
});

const tableItemRequestRef = ref<InstanceType<typeof ElTable>>();

const selectedItemsRequest = ref<ItemRequest[]>([]);

const visible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});

const item_request = await useAsyncData("fetch-item-request", async () => {
  const res = await useFetchApi<ResponsePagination<ItemRequest[]>>(
    `/search`,
    "fetch-item-request",
    "post",
    request_search_item_request.value
  );
  return res.data.value;
});

const handleSelectionChange = (val: ItemRequest[]) => {
  selectedItemsRequest.value = val;
};

const handlePageChangeItemRequest = (page: number) => {
  request_search_item_request.value.offset = `${page}`;
};

const handleSizeChangeItemRequest = (size: number) => {
  request_search_item_request.value.limit = `${size}`;
};

const addItemRequestToCanvassing = (items: ItemRequest) => {
  emit("selectedSubmit", items);
};

const onSort = (data: any) => {
  console.log("data sort", data);
  request_search_item_request.value.sort = {
    column: data.prop,
    order:
      data.order === OrderColumn.ASCENDING ? OrderColumn.DESC : OrderColumn.ASC,
  };
};

watch(
  () => request_search_item_request.value,
  () => item_request.refresh(),
  { deep: true }
);
</script>
