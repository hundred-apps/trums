<template>
  <el-row :gutter="20" class="mb-3 mt-4">
    <el-col :span="6">
      <el-input
        v-model="request_search.keyword"
        size="default"
        placeholder="Cari sales order..."
        clearable
      />
    </el-col>
  </el-row>

  <OrderTable
    :request_search="request_search"
    :refresh-key="refreshKey"
    :refresh-trigger="refreshTrigger"
    @has-bulk="onSelection"
    :readonly="true"
  />
</template>

<script lang="tsx" setup>
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import OrderTable from "~/pages/sales/order/components/OrderTable.vue";
import type { PurchaseOrder } from "~/types/scm/purchase_order";

const props = defineProps<{
  type: "so" | "po";
}>();

const refreshKey = `get-sales-order-selection-${props.type}`;

const refreshTrigger = ref<number>(0);

const emit = defineEmits(["selection-change"]);

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      type: [props.type],
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

watch(
  () => request_search.value,
  () => refreshTrigger.value++,
  { deep: true }
);

const onSelection = (selections: PurchaseOrder[]) => {
  emit("selection-change", selections);
};
</script>
