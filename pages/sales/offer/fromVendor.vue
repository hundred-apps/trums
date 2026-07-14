<script lang="tsx" setup>
import {
  ElButton,
  ElCheckbox,
  ElIcon,
  ElPopconfirm,
  ElPopover,
  type CheckboxValueType,
  type Column,
  type SortBy,
} from "element-plus";
import type { FunctionalComponent } from "vue";
import type { Pricelist } from "~/types/pricelist";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import CustomTable from "~/components/trums/table/customTable.vue";
import type { Catalogue } from "~/types/catalogue";
import { Filter } from "@element-plus/icons-vue";
import { NuxtLink } from "#components";
import { InfoFilled, SetUp } from "@element-plus/icons-vue";
import type { Pricetag } from "~/types/pricetag";
import type { Contact } from "~/types/contact";
import type { AddressType } from "~/types/address";
import { canAccess, useCookie } from "#imports";
definePageMeta({
  middleware: ["auth", "app"],
  name: "Penawaran ke vendor",
});

const router = useRouter();
const loading = ref<boolean>(false);
const popoverRef = ref();
const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      type: ["in"],
      category: ["penawaran"],
    },
  ],
  limit: "10",
  offset: "1",
  table: "pricetag",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
});

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<ResponsePagination<Pricetag[]>>(
      `/search`,
      "Pricetag-to-vendor",
      "post",
      request_search.value
    );

    if (response.status.value == "success") {
      data.value = response.data.value as ResponsePagination<Pricetag[]>;
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message ?? error);
    return [];
  } finally {
    loading.value = false;
  }
};

const locations = ref<Catalogue[]>([]);

const { data } = await useFetchApi<ResponsePagination<Pricetag[]>>(
  `/search`,
  "Pricetag-to-vendor",
  "post",
  request_search.value
);

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

watch(request_search, fetchData, { immediate: true });

const availableColumn: Column<Pricetag>[] = [
  {
    title: "No",
    key: "no",
    dataKey: "no",
    width: 80,
    cellRenderer: ({ rowIndex }) => <span>{rowIndex + 1}</span>,
  },
  {
    title: "Nama",
    key: "name",
    dataKey: "name",
    width: 200,
  },
  {
    title: "Owner",
    key: "owner",
    dataKey: "owner",
    width: 200,
    cellRenderer: ({ rowData }: { rowData: Pricetag }) => (
      <span>{rowData.owner?.name || "-"}</span>
    ),
  },
  {
    title: "Gudang",
    key: "location.name",
    dataKey: "location.name",
    width: 200,
    headerCellRenderer: () => (
      <div class="flex items-center justify-center">
        <span class="mr-2 text-xs">Location</span>
        <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
          {{
            default: () => (
              <div class="filter-wrapper">
                <div class="filter-group flex flex-col">
                  <el-checkbox-group
                    v-model={request_search.value.column![0].location_id}
                  >
                    {locations.value.map((location: Catalogue) => (
                      <ElCheckbox
                        key={location.unique_id!}
                        value={location.unique_id!}
                      >
                        {location.name}
                      </ElCheckbox>
                    ))}
                  </el-checkbox-group>
                </div>
              </div>
            ),
            reference: () => (
              <ElIcon class="cursor-pointer">
                <Filter />
              </ElIcon>
            ),
          }}
        </ElPopover>
      </div>
    ),
  },
  {
    title: "Tanggal Berlaku",
    key: "reference",
    dataKey: "reference",
    width: 200,
    cellRenderer: ({ rowData: row }) => <>{formatLocalDate(row.start_date)}</>,
  },
  {
    title: "Operasi",
    key: "operasi",
    width: 250,
    cellRenderer: ({ rowData: row }) => (
      <>
        <NuxtLink
          href={`/sales/offer/${row.unique_id}`}
          class="el-button el-button--small"
        >
          Detail
        </NuxtLink>
        <NuxtLink
          href={`/sales/offer/add?id=${row.unique_id}`}
          class="el-button el-button--small"
        >
          Edit
        </NuxtLink>

        <ElPopconfirm
          title="Yakin ingin menghapus?"
          confirmButtonText="Ya"
          cancelButtonText="Tidak"
          onConfirm={() => handleDelete([row.unique_id])}
        >
          {{
            reference: () => (
              <ElButton size="small" type="danger">
                Delete
              </ElButton>
            ),
          }}
        </ElPopconfirm>
        {/* <ElButton size="small" type="danger" onClick={() => handleDelete(row)}>Delete</ElButton> */}
      </>
    ),
  },
];

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

availableColumn.unshift({
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
        current_page: _data?.current_page ?? 0,
        total_data: _data?.total_data ?? 0,
        total_page: _data?.total_data ?? 0,
        data: _data?.data?.map((row: any) => {
          row.checked = value;
          return row;
        })!,
      });
    const allSelected = _data!.data.every((row) => row.checked);
    const containsChecked = _data?.data.some((row) => row.checked);

    return (
      <SelectionCell
        value={allSelected}
        intermediate={containsChecked && !allSelected}
        onChange={onChange}
      />
    );
  },
});

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
      await refreshNuxtData("Pricetag");
      ElMessage.success("Data Berhasil Dihapus");
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message}`);
  } finally {
    loading.value = false;
  }
};

const handleEdit = (data: Pricetag) => {
  const cookie = useCookie("tag_id");
  cookie.value = data.unique_id;

  router.push("/sales/offer/add");
};

const onSort = (sortBy: SortBy) => {
  console.log("sort", sortBy.key);
  console.log(request_search.value);
  const data: RequestSearch = { ...request_search.value };
  data.sort = {
    column: sortBy.key.toString(),
    order:
      request_search.value.sort?.order == OrderColumn.ASC
        ? OrderColumn.DESC
        : OrderColumn.ASC,
  };
  request_search.value = data;
};

const paginationClick = (val: number) => {
  const data: RequestSearch = { ...request_search.value };
  data.offset = val.toString();
  request_search.value = data;
};

const checkSelect = () => data?.value?.data.some((row) => row.checked);

const deleteBulk = () => {
  const checkeds = data.value?.data.filter((value) => value.checked);
  handleDelete(checkeds?.map((value) => value.unique_id) ?? []);
};

onMounted(() => {
  fetchLocation();
});
</script>
<template>
  <TrumsWrapper>
    <div class="w-auto">
      <el-row :gutter="20" class="mb-3">
        <el-col :span="6"
          ><el-input
            v-model="request_search.keyword"
            size="default"
            placeholder="Type to search"
        /></el-col>
        <NuxtLink
          v-if="canAccess('pricetag-create', data?.privilege ?? [])"
          href="/sales/offer/add"
          @click="
            () => {
              const cookie = useCookie('tag_id');
              cookie.value = null;
            }
          "
          class="el-button el-button--default"
          >Buat Penawaran Dari Vendor</NuxtLink
        >
        <el-popconfirm
          v-if="checkSelect()"
          width="220"
          :icon="InfoFilled"
          icon-color="#626AEF"
          title="Apakah Anda Yakin Ingin Menghapus Data ini?"
          @cancel="() => {}"
        >
          <template #reference>
            <el-button size="default" class="ml-3" type="danger"
              >Delete</el-button
            >
          </template>
          <template #actions="{ confirm, cancel }">
            <el-button size="small" @click="cancel">Batal</el-button>
            <el-button type="danger" size="small" @click="deleteBulk">
              Hapus
            </el-button>
          </template>
        </el-popconfirm>
      </el-row>
      <CustomTable
        :column-sort="onSort"
        :columns="availableColumn"
        :data="data?.data ?? []"
      />
      <div class="flex justify-end mt-3">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="data?.total_data"
          @next-click="paginationClick"
          @prev-click="paginationClick"
          @change="paginationClick"
        />
      </div>
    </div>
  </TrumsWrapper>
</template>
