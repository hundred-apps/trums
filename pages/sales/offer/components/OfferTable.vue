<template>
  <CustomTable
    @sort-change="onSort"
    :columns="availableColumn"
    :data="data?.data ?? []"
  />
  <div class="flex justify-end mt-3">
    <el-pagination
      background
      layout="prev, pager, next, sizes"
      :total="data?.total_data"
      @next-click="paginationClick"
      @prev-click="paginationClick"
      @change="paginationClick"
    />
  </div>
</template>

<script lang="tsx" setup>
import { NuxtLink } from "#components";
import { Filter, Setting } from "@element-plus/icons-vue";
import {
  ElButton,
  ElCheckbox,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElIcon,
  ElPopconfirm,
  ElPopover,
  type CheckboxValueType,
  type Column,
  type SortBy,
} from "element-plus";
import type { Catalogue } from "~/types/catalogue";
import type { Pricetag } from "~/types/pricetag";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import CustomTable from "~/components/trums/table/customTable.vue";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";
import type { ColumnTable } from "~/types/ColumnTable";

const { isMobile } = useDevice();

const props = defineProps<{
  // onSubmit: (catalogue: Catalogue) => void,
  // onCancel: () => void,
  request_search: RequestSearch;
  refresh_trigger: number;
  fetchKey: string;
  type: "in" | "out";
}>();

const emit = defineEmits<{
  (e: "has-bulk", value: string[]): void;
}>();

const loading = ref<boolean>(false);
const popoverRef = ref();
const request_search = ref<RequestSearch>(props.request_search);
const locations = ref<Catalogue[]>([]);
const selected = ref<string[]>([]);

const { data, refresh } = await useAsyncData(props.fetchKey, async () => {
  const res = await useFetchApi<ResponsePagination<Pricetag[]>>(
    `/search`,
    props.fetchKey,
    "post",
    request_search.value
  );
  return res.data.value;
});
const paginationClick = (val: number) => {
  request_search.value.offset = val.toString();
  refresh();
};

const generateNumber = (number: string) => {
  const split = number.split("/");
  return `${split[0]}...${split[split.length - 1]}`;
};

const availableColumn: ColumnTable<Pricetag>[] = [
  {
    title: props.type == "in" ? "Vendor" : "Kepada",
    key: "",
    dataKey: "",
    width: isMobile ? 200 : 0,
    cellRenderer: ({ rowData }: { rowData: Pricetag }) => (
      <span>
        {props.type === "in"
          ? rowData.owner?.name || "-"
          : rowData.to?.name || "-"}
      </span>
    ),
  },
  {
    title: "Ref No",
    key: "name",
    dataKey: "name",
    align: "center",
    width: isMobile ? 120 : 0,
    cellRenderer: ({ rowData }: { rowData: Pricetag }) => (
      <NuxtLink
        class={"text-blue-600"}
        href={`/sales/offer/${rowData.unique_id}`}
      >
        {generateNumber(rowData.unique_code || "")}
      </NuxtLink>
    ),
  },

  {
    title: "Validity",
    key: "start_date",
    dataKey: "start_date",
    sortable: true,
    width: isMobile ? 120 : 0,
    align: "center",
    cellRenderer: ({ rowData: row }) => (
      <>{row.start_date ? formatLocalDate(row.start_date) : "-"}</>
    ),
  },
  {
    title: "Operasi",
    key: "operasi",
    width: 90,
    align: "center",

    cellRenderer: ({ rowData }: { rowData: Pricetag }) => {
      const onCommand = (command: string) => {
        if (command === "edit") {
          window.location.href = `/sales/offer/add?id=${rowData.unique_id}&type=${rowData.type}`;
        }
        if (command === "delete") {
          handleDelete([rowData.unique_id]);
        }
      };

      return (
        <ElDropdown onCommand={onCommand} hideOnClick={false}>
          {{
            default: () => (
              <span class="cursor-pointer text-primary">
                <ElIcon>
                  <Setting />
                </ElIcon>
              </span>
            ),
            dropdown: () => (
              <ElDropdownMenu>
                <ElDropdownItem command="edit">Edit</ElDropdownItem>
                <ElDropdownItem class={"text-red-600"} command="delete" divided>
                  Delete
                </ElDropdownItem>
              </ElDropdownMenu>
            ),
          }}
        </ElDropdown>
      );
    },
  },
  {
    key: "selection",
    width: 50,
    cellRenderer: ({ rowData }) => {
      const onChange = (value: CheckboxValueType) => (rowData.checked = value);
      return <SelectionCell value={rowData.checked} onChange={onChange} />;
    },

    headerCellRenderer: () => {
      const _data = unref(data);
      const onChange = (value: CheckboxValueType) =>
        (data.value = {
          success: true,
          currentPage: _data?.currentPage ?? 0,
          total_data: _data?.total_data ?? 0,
          total_page: _data?.total_data ?? 0,
          data: _data?.data?.map((row: any) => {
            row.checked = value;
            return row;
          })!,
        });
      const allSelected = _data!.data.every((row) => row.checked);
      const containsChecked = _data?.data.some((row) => row.checked);
      selected.value = (_data?.data ?? [])
        .filter((value) => value.checked)
        .map((check) => check.unique_id);
      return (
        <SelectionCell
          value={allSelected}
          interminate={containsChecked && !allSelected}
          onChange={onChange}
        />
      );
    },
  },
];

// availableColumn.unshift({
//   key: "selection",
//   width: 50,
//   cellRenderer: ({ rowData }) => {
//     const onChange = (value: CheckboxValueType) => (rowData.checked = value);
//     return <SelectionCell value={rowData.checked} onChange={onChange} />;
//   },

//   headerCellRenderer: () => {
//     const _data = unref(data);
//     const onChange = (value: CheckboxValueType) =>
//       (data.value = {
//         success: true,
//         currentPage: _data?.currentPage ?? 0,
//         total_data: _data?.total_data ?? 0,
//         total_page: _data?.total_data ?? 0,
//         data: _data?.data?.map((row: any) => {
//           row.checked = value;
//           return row;
//         })!,
//       });
//     const allSelected = _data!.data.every((row) => row.checked);
//     const containsChecked = _data?.data.some((row) => row.checked);
//     selected.value = (_data?.data ?? [])
//       .filter((value) => value.checked)
//       .map((check) => check.unique_id);
//     return (
//       <SelectionCell
//         value={allSelected}
//         interminate={containsChecked && !allSelected}
//         onChange={onChange}
//       />
//     );
//   },
// });

const onSort = (sortBy: { order: string; prop: string }) => {
  request_search.value.sort = {
    column: sortBy.prop,
    order:
      sortBy.order === OrderColumn.ASCENDING
        ? OrderColumn.ASC
        : OrderColumn.DESC,
  };
  refresh();
};

const handleDelete = async (ids: string[]) => {
  loading.value = true;
  try {
    const response = await useFetchApi(
      `/pricetag-delete`,
      "pricelist",
      "post",
      ids
    );
    if (response.status.value == "success") {
      await refresh();
      ElMessage.success("Data Berhasil Dihapus");
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message}`);
  } finally {
    loading.value = false;
  }
};

const fetchLocation = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<ResponsePagination<Catalogue[]>>(
      `/search`,
      "location",
      "post",
      {
        keyword: "",
        column: [
          {
            type: ["place"],
          },
        ],
        limit: "10",
        offset: "1",
        table: "catalogues",
        sort: {
          column: "created_at",
          order: OrderColumn.ASC,
        },
      }
    );

    if (response.status.value == "success") {
      locations.value = (
        response.data.value as ResponsePagination<Catalogue[]>
      ).data;
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message ?? error);
    return [];
  } finally {
    loading.value = false;
  }
};

watch(
  selected,
  (val) => {
    emit("has-bulk", val);
  },
  { deep: true }
);

watch(
  () => props.refresh_trigger,
  async () => {
    selected.value = [];
    refresh();
  }
);

// watch(request_search, () => refreshNuxtData(props.key), { deep: true });

onMounted(() => {
  fetchLocation();
});
</script>
