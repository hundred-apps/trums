<template>
  <el-row :gutter="20" class="mb-3">
    <el-col :span="6">
      <el-input
        v-model="keywordSearch"
        size="default"
        placeholder="Type to search"
      />
    </el-col>
  </el-row>

  <el-table :data="data" style="width: 100%">
    <el-table-column label="Nomor Referensi" width="300">
      <template #default="scope">
        <NuxtLink
          class="text-blue-500"
          :to="`/inventory-management/inqueiries/${scope.row.unique_id}`"
        >
          {{ scope.row.unique_code ?? "-" }}
        </NuxtLink>
      </template>
    </el-table-column>
    <el-table-column label="Customer" width="300">
      <template #default="scope">
        <p>{{ scope.row.request_to?.name ?? "-" }}</p>
      </template>
    </el-table-column>
    <el-table-column label="Jumlah Item">
      <template #default="scope">
        <p>{{ scope.row.item_request?.length ?? "-" }}</p>
      </template>
    </el-table-column>
    <el-table-column label="Aksi">
      <template #default="scope">
        <el-button
          size="default"
          type="primary"
          @click="handleSelect(scope.row)"
        >
          Tambahkan
        </el-button>
      </template>
    </el-table-column>
  </el-table>

  <div class="flex justify-end mt-3">
    <el-pagination
      background
      layout="prev, pager, next"
      :total="totalData"
      @current-change="handlePagination"
    />
  </div>
</template>

<script lang="tsx" setup>
import type { Inquiry } from "~/types/inquiry";

interface Props {
  data: Inquiry[];
  searchParams: any;
  totalData: number;
}

interface Emits {
  (e: "update:visible", value: boolean): void;
  (e: "select-request", item: Inquiry): void;
  (e: "pagination-change", page: number): void;
  (e: "onSearch", keyword: string): void;
}

const keywordSearch = ref<string>("");

watch(
  () => keywordSearch.value,
  (newValue) => {
    emit("onSearch", newValue);
  },
  { deep: true }
);

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const handleSelect = (item: Inquiry) => {
  emit("select-request", item);
};

const handlePagination = (page: number) => {
  emit("pagination-change", page);
};
</script>
