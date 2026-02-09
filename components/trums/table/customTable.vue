<template>
  <el-auto-resizer style="height: 400px">
    <template #default="{ height, width }">
      <el-table-v2
        :columns="columns"
        :data="data"
        :height="height"
        :width="width"
        :max-width="2000"
        :sort-state="sortState"
        class="px-3"
        @column-sort="columnSort"
        fixed
        border
      >
        <template v-if="loading" #overlay>
          <div
            class="el-loading-mask"
            style="display: flex; align-items: center; justify-content: center"
          >
            <el-icon
              class="is-loading"
              color="var(--el-color-primary)"
              :size="26"
            >
              <loading-icon />
            </el-icon>
          </div>
        </template>
      </el-table-v2>
    </template>
  </el-auto-resizer>
</template>

<script lang="tsx" setup>
import type { AnyColumn } from "element-plus/es/components/table-v2/src/common.mjs";
import type { ColumnSortHandler } from "element-plus/es/components/table-v2/src/table.mjs";
import { Loading as LoadingIcon } from "@element-plus/icons-vue";
import { ElCheckbox, type CheckboxValueType } from "element-plus";
import type { FunctionalComponent } from "vue";

const props = defineProps({
  columns: {
    type: Array<AnyColumn>,
    required: true,
  },

  data: {
    type: Array,
    required: true,
  },
  sortState: {
    type: Object,
    required: false,
  },
  loading: {
    type: Boolean,
    required: false,
  },
  columnSort: {
    type: Function as PropType<ColumnSortHandler<any>>,
    required: false,
  },
  height: {
    type: Number,
    required: false,
  },
});

const { loading } = toRefs(props);

// const handleSelectionChange = (selection: any[]) => {
//   console.log("Selected Rows:", selection);
// };

type SelectionCellProps = {
  value: boolean;
  intermediate?: boolean;
  onChange: (value: CheckboxValueType) => void;
};

const SelectionCell: FunctionalComponent<SelectionCellProps> = ({
  value,
  intermediate = false,
  onChange,
}) => {
  return (
    <ElCheckbox
      onChange={onChange}
      modelValue={value}
      indeterminate={intermediate}
    />
  );
};

const checkIfExistCheckbox = () => {
  const newColumn = [...props.columns];
};

onMounted(() => {
  console.log(props.data);
  console.log(props.loading);
});
</script>

<style scoped>
.el-table-v2__root,
.el-table-v2__main {
  width: 100% !important;
}

/* .el-table-v2__root, .el-table-v2__main, .el-table-v2__header-wrapper, .el-table-v2__header{
  width: auto !important;
}

.el-table-v2__empty{
  width: 100% !important;
}

.el-vl__vertical{
  display: none;
}
*/

/* .el-table-v2__body > div, 
.el-table-v2__body > div > div,
.el-table-v2__body > div > div > .el-table-v2__row {
  width: 100% !important;
}  */
.example-showcase .el-table-v2__overlay {
  z-index: 9;
}
</style>
