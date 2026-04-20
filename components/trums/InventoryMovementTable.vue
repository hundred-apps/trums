<template>
  <customTable
    @sort-change=""
    :columns="availableColumn"
    :data="data ?? []"
    :loading="loading"
    :table-props="{
      lazy: true,
      load: onLoadMovementItem,
      rowKey: 'unique_id',
      treeProps: {
        children: 'children',
        hasChildren: 'hasChildren',
      },
    }"
  />
  <!-- <div class="flex justify-end mt-3">
      <el-pagination
        background
        layout="prev, pager, next, sizes"
        :total="data?.total_data"
        :page-size="parseInt(request_search.limit)"
        :current-page="parseInt(request_search.offset)"
        @current-change="paginationClick"
        @size-change="handleSizeChange"
      />
    </div> -->
  <div class="flex justify-end my-5">
    <el-button @click="() => emit('onCancel')">Batal</el-button>
    <el-button type="primary" @click="handleSelected">Simpan</el-button>
  </div>
</template>

<script lang="tsx" setup>
import { Setting, SetUp } from "@element-plus/icons-vue";
import {
  ElCheckbox,
  ElCheckboxGroup,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElIcon,
  ElPopover,
  ElTag,
  TableV2FixedDir,
  type CheckboxValueType,
} from "element-plus";
import type { ColumnTable } from "~/types/ColumnTable";
import type {
  InventoryMovement,
  InventoryMovementItem,
} from "~/types/inventory_movement";
import SelectionCell from "./table/SelectionCell.vue";
import { NuxtLink } from "#components";
import customTable from "./table/customTable.vue";
import type { ResponsePagination } from "~/types/response_pagination";
import type { RequestSearch } from "~/types/request_search";

const props = defineProps<{
  data: ResponsePagination<InventoryMovement[]>;
  loading: boolean;
}>();

const data = ref<DataDeliveryOrder[]>([]);
const realData = ref<InventoryMovement[]>([]);
const selectedData = ref<InventoryMovement[]>([]);

const emit = defineEmits(["onSubmit", "onCancel"]);

const popoverRef = ref();
const tableKey = ref(0);

type DataDeliveryOrder = {
  movement_id: string;
  unique_id: string;
  unique_code: string;
  name: string;
  date: string;
  qty: string;
  checked: boolean;
  children: DataDeliveryOrder[];
  hasChildren?: boolean;
};

const availableColumn: ColumnTable<DataDeliveryOrder>[] = [
  {
    title: "Unique Code",
    dataKey: "unique_code",
    key: "unique_code",
    width: 300,
    cellRenderer: ({ rowData: row }) => (
      <span class={"text-blue-600"}>{row.unique_code}</span>
    ),
  },
  {
    title: "Tujuan",
    dataKey: "name",
    key: "name",
  },
  //   {
  //     title: "Status",
  //     dataKey: "status",
  //     key: "status",
  //     width: 100,
  //     align: "center",
  //     cellRenderer: ({ rowData: row }) => getStatus(row),
  //   },
  {
    title: "Tgl Dibuat",
    dataKey: "created_at",
    key: "created_at",
    width: 200,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: DataDeliveryOrder }) => (
      <p>{rowData.date}</p>
    ),
  },
  {
    title: "Jumlah Item",
    dataKey: "",
    key: "",
    width: 200,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: DataDeliveryOrder }) => (
      <p>{rowData.qty}</p>
    ),
  },
  {
    title: "",
    dataKey: "",
    key: "selection",
    width: 50,
    cellRenderer: ({ rowData }: { rowData: DataDeliveryOrder }) => {
      const onChange = (value: CheckboxValueType) => {
        const checked = value as boolean;

        // 1. update current row
        rowData.checked = checked;

        // 2. kalau children sudah ada → update juga
        if (rowData.children && rowData.children.length > 0) {
          setChildrenChecked(rowData, checked);
        }

        // 3. update parent (optional tapi bagus)
        updateParentChecked(data.value);

        // 4. trigger reactivity
        data.value = [...data.value];
      };

      return <SelectionCell value={rowData.checked} onChange={onChange} />;
    },
    maxWidth: 50,

    headerCellRenderer: () => {
      const _data = unref(data);
      const onChange = (value: CheckboxValueType) =>
        (data.value = _data?.map((row: any) => {
          row.checked = value;

          return row;
        }));

      const allSelected = _data.every((row) => row.checked);
      const containsChecked = _data.some((row) => row.checked);

      return (
        <SelectionCell
          style={{ width: 50 }}
          value={allSelected}
          interminate={containsChecked && !allSelected}
          onChange={onChange}
        />
      );
    },
  },
];

const setChildrenChecked = (row: DataDeliveryOrder, checked: boolean) => {
  row.checked = checked;

  if (row.children && row.children.length > 0) {
    row.children.forEach((child) => {
      setChildrenChecked(child, checked);
    });
  }
};

const updateParentChecked = (data: DataDeliveryOrder[]) => {
  const traverse = (nodes: DataDeliveryOrder[]): boolean => {
    let allChecked = true;
    let anyChecked = false;

    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        const childAllChecked = traverse(node.children);

        node.checked = childAllChecked;
      }

      if (node.checked) anyChecked = true;
      else allChecked = false;
    });

    return allChecked;
  };

  traverse(data);
};

const getStatus = (data: InventoryMovement) => {
  // 'draft','waiting','approve','done','cancelled','repair'

  if (data.status == "draft") {
    return <ElTag type="info">{(data?.status ?? "").toUpperCase()}</ElTag>;
  } else if (data.status == "waiting") {
    return <ElTag type="warning">{(data?.status ?? "").toUpperCase()}</ElTag>;
  } else if (data.status == "approve") {
    return <ElTag type="success">{(data?.status ?? "").toUpperCase()}</ElTag>;
  } else if (data.status == "done") {
    return <ElTag type="primary">{(data?.status ?? "").toUpperCase()}</ElTag>;
  } else if (data.status == "cancelled") {
    return <ElTag type="danger">{(data?.status ?? "").toUpperCase()}</ElTag>;
  } else {
    return <ElTag type="info">{(data?.status ?? "").toUpperCase()}</ElTag>;
  }
};
const onLoadMovementItem = async (
  row: InventoryMovement,
  treeNode: unknown,
  resolve: (data: DataDeliveryOrder[]) => void
) => {
  try {
    console.log();
    const movement_id = row.unique_id.split("___")[0];

    const req_search: RequestSearch = {
      column: [
        {
          movement_id: [movement_id],
        },
      ],
      keyword: "",
      limit: "100",
      offset: "1",
      table: "inventory_movement_item",
      sort: {
        column: "created_at",
        order: "asc",
      },
    };

    const response = await useFetchApi<
      ResponsePagination<InventoryMovementItem[]>
    >(`/search`, "fetch-vendor-list", "post", req_search);
    console.log("response status value", response.status.value);
    if (response.status.value == "success") {
      const dataDelivery: DataDeliveryOrder[] = (
        response.data.value?.data ?? []
      ).map((value) => ({
        movement_id: "",
        unique_id: value.unique_id,
        unique_code: "",
        checked: false,
        date: formatLocalDate(value.created_at),
        name: value.inventory?.catalogue?.name ?? "",
        qty: `${value.quantity} ${value.unit_name}`,
        hasChildren: false,
        children: [],
      }));

      const findIndex = data.value.findIndex(
        (value) => value.unique_id == row.unique_id
      );

      console.log("find index", findIndex);
      data.value[findIndex].children = dataDelivery;

      resolve(dataDelivery);
    }
  } catch (error: any) {
    ElMessage.error(error.response?.message ?? error);
  }
};

watch(
  () => props.data,
  () => {
    data.value = (props.data.data || []).map((value) => ({
      movement_id: value.unique_id,
      unique_id: `${value.unique_id}___${tableKey.value}`,
      unique_code: value.unique_code,
      name: value.to_name,
      date: formatLocalDate(value.created_at),
      qty: `${value.inventory_movement_item.length}`,
      checked: false,
      children: [],
      hasChildren: value.inventory_movement_item.length > 0,
    }));
    realData.value = props.data.data;
  },
  { immediate: true }
);

const handleSelected = () => {
  selectedData.value = [];
  data.value.forEach((element) => {
    const find = realData.value.find(
      (find) => find.unique_id == element.movement_id
    );
    if (find) {
      const idsChecked = (element.children || [])
        .filter((filter) => filter.checked)
        .map((map) => map.unique_id);

      const movementSelected: InventoryMovementItem[] =
        find.inventory_movement_item.filter((filter) =>
          idsChecked.includes(filter.unique_id)
        );

      selectedData.value.push({
        ...find,
        inventory_movement_item: movementSelected,
      });
    }
  });

  emit("onSubmit", selectedData.value);
};

onMounted(() => {
  console.log("props", props.data);
});
</script>
