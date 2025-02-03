<script lang="tsx" setup>
import { ref, onMounted } from "vue";
import { Eleme } from "@element-plus/icons-vue";
import {
  type Column,
  type CheckboxValueType,
  type InputInstance,
  type MainInstance,
  ElButton,
  ElTag,
  ElText,
  ElCheckbox,
} from "element-plus";
import type { Inspection } from "~/types/inspection";
import { formatDate } from "@vueuse/core";
import type { FunctionalComponent } from "vue";
import CustomTable from "~/components/trums/table/customTable.vue";
import type { Pagination } from "~/types/pagination";

definePageMeta({
  middleware: ["auth", "app"],
});

const inspections = ref<Inspection[]>([]);
const inspectionsPaginate = ref<Pagination<Inspection[]>>();
const tmpInspections = ref<Inspection[]>([]);
const loading = ref<boolean>(false);
const search = ref("");

const axios = useApi();

type SelectionCellProps = {
  value: boolean;
  intermediate?: boolean;
  onChange: (value: CheckboxValueType) => void;
};

const filterTableData = computed(() =>
  inspections.value.filter(
    (data) =>
      !search.value ||
      data.unique_code.toLowerCase().includes(search.value.toLowerCase()) ||
      data.unique_id.toLowerCase().includes(search.value.toLowerCase()) ||
      data.status.toLowerCase().includes(search.value.toLowerCase()) ||
      data.condition?.toLowerCase().includes(search.value.toLowerCase()) ||
      formatLocalDate(data.inspection_date)
        .toLowerCase()
        .includes(search.value.toLowerCase())
  )
);

const columnInspection: Column<Inspection>[] = [
  {
    key: "selection",
    title: "Nomor",
    dataKey: "unique_code",
    width: 150,
    align: "center",
  },
  {
    key: "inspection_date",
    title: "Tanggal Inspeksi",
    dataKey: "inspection_date",
    width: 250,
    cellRenderer: ({ rowData: row }) => (
      <ElText>{formatLocalDate(row.inspection_date)}</ElText>
    ),
  },
  {
    key: "condition",
    title: "Kondisi",
    dataKey: "condition",
    width: 250,
  },
  {
    key: "status",
    title: "Status",
    dataKey: "status",
    width: 150,
    cellRenderer: ({ rowData: row }) =>
      row.status == "draft" ? (
        <ElTag type="info">{row.status.toUpperCase()}</ElTag>
      ) : row.status == "progress" ? (
        <ElTag type="success">{row.status.toUpperCase()}</ElTag>
      ) : row.status == "repair" ? (
        <ElTag type="warning">{row.status.toUpperCase()}</ElTag>
      ) : row.status == "cancel" ? (
        <ElTag type="danger">{row.status.toUpperCase()}</ElTag>
      ) : (
        <ElTag type="primary">{row.status.toUpperCase()}</ElTag>
      ),
  },
  {
    key: "operations",
    title: "Operations",
    cellRenderer: ({ rowData: row }) => (
      <>
        <ElButton size="small" onClick={() => onEdit(row)}>
          Edit
        </ElButton>
        <ElButton size="small" type="danger" onClick={() => onDelete(row)}>
          Hapus
        </ElButton>
      </>
    ),
    width: 150,
    align: "center",
  },
];

columnInspection.unshift({
  key: "selection",
  width: 5,
  align: "center",
  cellRenderer: ({ rowData }) => {
    const onChange = (value: CheckboxValueType) => (rowData.checked = value);
    return <SelectionCell value={rowData.checked} onChange={onChange} />;
  },
  headerCellRenderer: () => {
    const _data = unref(inspections);
    const onChange = (value: CheckboxValueType) =>
      (inspections.value = _data.map((row: any) => {
        row.checked = value;
        return row;
      }));
    const allSelected = _data.every((row: any) => row.checked);
    const containsChecked = _data.some((row: any) => row.checked);

    return (
      <SelectionCell
        value={allSelected}
        intermediate={containsChecked && !allSelected}
        onChange={onChange}
      />
    );
  },
});

const onSelection = (event: CheckboxValueType) => {
  console.log(event);
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

const onDelete = async (value: Inspection) => {
  console.log("deleted", value);
};
const onEdit = async (value: Inspection) => {
  console.log("edited", value);
};

const handleSelectionChange = (selection: any[]) => {
  console.log("Selected Rows:", selection);
};

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await axios.get("/inspection-read");
    if (response.status == 200) {
      inspectionsPaginate.value = response.data.data;
      inspections.value = response.data.data.query;
    } else {
      ElMessage.warning(response.data?.message);
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>
<template>
  <TrumsWrapper>
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6"
        ><el-input v-model="search" size="large" placeholder="Type to search"
      /></el-col>
      <el-button size="large" @click="$router.push('inspection/add')"
        >New Inspection</el-button
      >
      <el-button
        size="large"
        @click="fetchData"
        :loading-icon="Eleme"
        :loading="loading"
        >Reload Data</el-button
      >
    </el-row>
    <CustomTable
      :columns="columnInspection"
      :data="inspections"
      :loading="loading"
    />
    <div class="flex justify-end mt-3">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="inspectionsPaginate?.total_page"
      />
    </div>
  </TrumsWrapper>
</template>
