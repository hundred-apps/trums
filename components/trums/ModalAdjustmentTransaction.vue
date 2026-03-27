<template>
  <el-dialog v-model="visible" title="Biaya Tambahan" width="1000">
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6">
        <el-input
          v-model="searchParams.keyword"
          size="default"
          placeholder="Type to search"
        />
      </el-col>
      <el-button
        type="primary"
        size="default"
        :disabled="selectedItems.length === 0"
        @click="handleSelect"
      >
        Tambahkan ({{ selectedItems.length }})
      </el-button>
      <el-button
        type="default"
        size="default"
        :icon="Plus"
        @click="$emit('create-new')"
      >
        Buat Baru
      </el-button>
    </el-row>

    <el-table
      :data="data"
      ref="tableRef"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="Nama Biaya" prop="name">
        <template #default="scope">
          <p>{{ scope.row.name ?? "-" }}</p>
        </template>
      </el-table-column>
      <el-table-column label="Nilai Default" prop="default_value" />
      <el-table-column label="Type" prop="type">
        <template #default="scope">
          {{ scope.row.type == "percent" ? "%" : "Rp" }}
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script setup lang="ts">
import { Plus } from "@element-plus/icons-vue";
import type { ElTable } from "element-plus";
import type { AdjustmentTransaction } from "~/types/attribute_adjustment";

interface Props {
  visible: boolean;
  data: AdjustmentTransaction[];
  searchParams: any;
}

interface Emits {
  (e: "update:visible", value: boolean): void;
  (e: "select-adjustment", items: AdjustmentTransaction[]): void;
  (e: "create-new"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const visible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});

const selectedItems = ref<AdjustmentTransaction[]>([]);

const tableRef = ref<InstanceType<typeof ElTable>>();

const handleSelectionChange = (val: AdjustmentTransaction[]) => {
  selectedItems.value = val;
};

const handleSelect = () => {
  const selected = selectedItems.value;

  emit("select-adjustment", selected);

  // reset selection
  selectedItems.value = [];
  tableRef.value?.clearSelection();

  visible.value = false;
};
</script>
