<template>
  <el-table
    v-loading="loading ?? false"
    :data="data"
    border
    style="width: 100%"
    @sort-change="onSortChange"
    v-bind="tableProps"
    ref="tableRef"
    @row-click="rowClick"
  >
    <el-table-column
      v-for="col in columns"
      :key="col.key"
      :prop="col.dataKey"
      :label="col.title"
      :width="col.width"
      :align="col.align ?? 'left'"
      :sortable="col.sortable ? 'custom' : false"
      :fixed="col.fixed"
    >
      <template #header v-if="col.headerCellRenderer">
        <component :is="renderHeader(col)" />
      </template>
      <template #default="scope">
        <!-- kalau ada cellRenderer -->
        <component v-if="col.cellRenderer" :is="renderCell(col, scope)" />
        <!-- fallback -->
        <span v-else>
          {{ scope.row[col.dataKey] }}
        </span>
      </template>
    </el-table-column>
  </el-table>
</template>
<script lang="tsx" setup>
import { h } from "vue";

defineProps<{
  columns: any[];
  data: any[];
  loading?: boolean;
  tableProps?: Record<string, any>;
  rowClick?: (args: any) => void;
}>();

const tableRef = ref();

defineExpose({
  tableRef,
});

const renderCell = (col: any, scope: any) => {
  return h(
    "span",
    col.cellRenderer({
      rowData: scope.row,
      rowIndex: scope.$index,
      column: col,
    })
  );
};

const renderHeader = (col: any) => {
  if (!col.headerCellRenderer) return null;

  // hasil TSX → kita bungkus jadi VNode
  return h("div", { class: "el-table__header-cell" }, [
    col.headerCellRenderer(),
  ]);
};

const emit = defineEmits(["sort"]);

const onSortChange = ({
  prop,
  order,
}: {
  prop: string;
  order: "ascending" | "descending" | null;
}) => {
  emit("sort", { prop, order });
};
</script>
<style scoped>
.el-table th .cell {
  font-weight: 700 !important;
}

:deep(.el-table__cell) {
  padding: 0px !important;
}
</style>
