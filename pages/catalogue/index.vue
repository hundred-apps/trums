<script lang="tsx" setup>
definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "catalogues-read",
  name: "List Of Catalogues",
});

import {
  InfoFilled,
  SetUp,
  Filter,
  Refresh,
  PictureFilled,
  Setting,
  Eleme,
} from "@element-plus/icons-vue";
import CustomTable from "~/components/trums/table/customTable.vue";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import {
  ElButton,
  TableV2FixedDir,
  ElCheckbox,
  ElIcon,
  ElPopover,
  ElTag,
  type CheckboxValueType,
  type Column,
  type SortBy,
  ElCheckboxGroup,
  ElImage,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
} from "element-plus";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";
import DeleteButton from "~/components/trums/DeleteButton.vue";
import { NuxtLink } from "#components";
import type { Catalogue } from "~/types/catalogue";
import type { AppFile } from "~/types/file";
import type { ColumnTable } from "~/types/ColumnTable";

interface FormFilter {
  date_range: string[];
}

const ruleFormFilter = reactive<FormFilter>({
  date_range: ["", ""],
});

const previewImage = ref<boolean>(false);
const initialIndexImage = ref<number>(0);
const urlFileList = ref<string[]>([]);

const loading = ref<boolean>(false);
const column_selected = ref<string[]>([
  "selection",
  "image",
  "unique_code",
  "name",
  "sn",
  "brand_name",
  "type",
  "status",
  "created_at",
  "actions",
  "setup",
]);
const search = ref("");
const router = useRouter();
const popoverRef = ref();

// Columns definition
const availableColumn: ColumnTable<Catalogue>[] = [
  {
    key: "selection",
    width: 50,
    fixed: true,
    cellRenderer: ({ rowData }) => {
      const onChange = (value: CheckboxValueType) => (rowData.checked = value);
      return <SelectionCell value={rowData.checked} onChange={onChange} />;
    },
    headerCellRenderer: () => {
      const _data = unref(data);
      const onChange = (value: CheckboxValueType) =>
        (data.value!.data = _data!.data.map((row: any) => {
          row.checked = value;
          return row;
        }));
      const allSelected = (_data?.data ?? []).every(
        (row) => row.checked ?? false
      );
      const containsChecked = (_data?.data ?? []).some(
        (row) => row.checked ?? false
      );

      return (
        <SelectionCell
          value={allSelected}
          interminate={containsChecked && !allSelected}
          onChange={onChange}
        />
      );
    },
  },
  {
    key: "image",
    title: "Image",
    width: 70,
    align: "center",
    fixed: true,
    cellRenderer: ({ rowData }: { rowData: Catalogue }) => {
      const image = getFileFirst(rowData.files ?? []);

      return (
        <div class="flex items-center justify-center">
          {image ? (
            <div
              onClick={() => {
                initialIndexImage.value = 0;
                previewImage.value = true;
                urlFileList.value = getFiles(rowData.files ?? []);
              }}
            >
              <ElImage
                src={image}
                style={{ width: "25px", height: "25px", cursor: "pointer" }}
                zoomRate={1.2}
                maxScale={7}
                minScale={0.2}
                initialIndex={0}
              />
            </div>
          ) : (
            <div
              class="flex items-center justify-center border rounded py-2 px-2"
              style={{ width: "25px", height: "25px", fontSize: "10px" }}
            >
              <ElIcon>
                <PictureFilled />
              </ElIcon>
            </div>
          )}
        </div>
      );
    },
  },
  {
    key: "unique_code",
    title: "Kode",
    width: 150,
    fixed: true,
    cellRenderer: ({ rowData: row }) => (
      <NuxtLink href={`/catalogue/${row.unique_id}`} class={"text-blue-600"}>
        {row.unique_code}
      </NuxtLink>
    ),
  },
  {
    dataKey: "name",
    key: "name",
    title: "Nama",
    width: 500,
    fixed: true,
    sortable: true,
  },
  {
    dataKey: "sn",
    key: "sn",
    title: "SN",
    width: 200,
  },
  {
    dataKey: "brand_name",
    key: "brand_name",
    title: "Brand",
    cellRenderer: ({ rowData: row }) => <p>{row.brand?.name ?? "N/A"}</p>,
  },
  {
    dataKey: "type",
    key: "type",
    title: "Tipe",
    width: 100,
    headerCellRenderer: () => (
      <div class="flex items-center justify-center">
        <span class="mr-2 text-xs">Tipe</span>
        <ElPopover trigger="click" width="200">
          {{
            default: () => (
              <div class="filter-wrapper">
                <div class="filter-group flex flex-col">
                  <ElCheckboxGroup
                    v-model={request_search.value.column[0].type}
                  >
                    <ElCheckbox key={"place"} value={"place"} label={"Place"} />
                    <ElCheckbox key={"item"} value={"item"} label={"Item"} />
                  </ElCheckboxGroup>
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
    dataKey: "is_asset",
    key: "is_asset",
    title: "Asset",
    width: 120,
    cellRenderer: ({ rowData: row }) => (
      <ElTag type={row.is_asset ? "success" : "info"}>
        {row.is_asset ? "Asset" : "Non-Asset"}
      </ElTag>
    ),
  },
  {
    dataKey: "year",
    key: "year",
    title: "Tahun",
    width: 150,
  },
  {
    dataKey: "created_at",
    key: "created_at",
    title: "Dibuat Pada",
    sortable: true,
    width: 150,
    cellRenderer: ({ rowData: row }) => (
      <span>{formatLocalDate(row.created_at * 1000)}</span>
    ),
  },
  {
    dataKey: "created_by",
    key: "created_by",
    title: "Dibuat Oleh",
    sortable: true,
    width: 150,
    cellRenderer: ({ rowData: row }) => (
      <span>{row.people?.name ?? "N/A"}</span>
    ),
  },
  {
    dataKey: "actions",
    key: "actions",
    title: "Aksi",
    width: 60,
    align: "center",
    // cellRenderer: ({ rowData: row }) => (
    //   <>
    //     <NuxtLink
    //       class="el-button el-button--small"
    //       href={`/catalogue/add?unique_id=${row.unique_id}`}
    //     >
    //       Edit
    //     </NuxtLink>
    //     <DeleteButton
    //       size="small"
    //       onConfirm={() => handleDelete([row.unique_id])}
    //       onCancel={() => {}}
    //     />
    //   </>
    // ),
    cellRenderer: ({ rowData: row }) => {
      const onCommand = (command: string) => {
        if (command === "edit") {
          window.location.href = `/catalogue/add?unique_id=${row.unique_id}`;
        }
        if (command === "delete") {
          handleDelete([row.unique_id]);
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
                  Hapus
                </ElDropdownItem>
              </ElDropdownMenu>
            ),
          }}
        </ElDropdown>
      );
    },
  },
  {
    dataKey: "setup",
    key: "setup",
    title: "",
    width: 50,
    fixed: TableV2FixedDir.RIGHT,
    headerCellRenderer: () => (
      <div class="flex items-center justify-center">
        <ElPopover trigger="click" width="200">
          {{
            default: () => (
              <div class="filter-wrapper">
                <div class="filter-group flex flex-col">
                  <ElCheckboxGroup v-model={column_selected.value}>
                    {availableColumn
                      .filter((c) => c.key !== "selection" && c.key !== "setup")
                      .map((c) => (
                        <ElCheckbox
                          key={c.key}
                          value={c.key!.toString()}
                          label={c.title}
                        />
                      ))}
                  </ElCheckboxGroup>
                </div>
              </div>
            ),
            reference: () => (
              <ElIcon class="cursor-pointer">
                <SetUp />
              </ElIcon>
            ),
          }}
        </ElPopover>
      </div>
    ),
  },
];

const getFileFirst = (files: AppFile[]) => {
  const config = useRuntimeConfig();
  const imageUrl = config.public.baseImageURL;
  if (files!.length > 0) {
    return `${imageUrl}/${files![0].image_path}/${files![0].filename}`;
  } else {
    return "";
  }
};
const getFiles = (files: AppFile[]): string[] => {
  const config = useRuntimeConfig();
  const imageUrl = config.public.baseImageURL;
  return files.map(
    (value) => `${imageUrl}/${value.image_path}/${value.filename}`
  );
};

// availableColumn[10].headerCellRenderer = () => {
//     return (<div class="flex items-center justify-center">
//       <span class="mr-2 text-xs"></span>
//       <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
//         {{
//           default: () => (
//             <div class="filter-wrapper">
//               <div class="filter-group flex flex-col">
//                 <ElCheckboxGroup v-model={column_selected.value}>

//                 {
//                   availableColumn.map((value) => (
//                     value.key != 'selection' && value.key != 'setup' ? <ElCheckbox onChange={() => console.log("ok")} value={value.key!.toString()}>
//                       {value.title}
//                     </ElCheckbox> : <></>
//                 ))
//                 }
//                 </ElCheckboxGroup>
//               </div>
//             </div>
//           ),
//           reference: () => (
//             <ElIcon class="cursor-pointer">
//               <SetUp />
//             </ElIcon>
//           ),
//         }}
//       </ElPopover>
//     </div>)
//   }

const filteredColumn = computed(() => {
  return availableColumn.filter((col) =>
    column_selected.value.includes(col.key!.toString())
  );
});

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      type: [],
      status: [],
    },
  ],
  limit: "10",
  offset: "1",
  table: "catalogues",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
});

const { data, refresh, status } = await useAsyncData(
  "get-catalogues",
  async () => {
    const res = await useFetchApi<ResponsePagination<Catalogue[]>>(
      `/search`,
      "get-catalogues",
      "post",
      request_search.value
    );
    return res.data.value;
  }
);

const checkSelect = () => data.value?.data.some((row) => row.checked);

const handleEdit = (row: Catalogue) => {
  const session = useCookie("unique_id");
  session.value = row.unique_id;
  router.push(`/catalogue/add`);
};

const handleDelete = async (ids: string[]) => {
  try {
    await ElMessageBox.confirm(
      "Yakin ingin menghapus data Catalog?",
      "Warning",
      {
        confirmButtonText: "Hapus",
        cancelButtonText: "Batal",
        type: "warning",
      }
    );

    await useFetchApi("/catalogues-delete", "delete-catalogue", "post", ids);
    ElMessage.success("Katalog berhasil dihapus");
    refresh();
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || "Gagal menghapus katalog");
  }
};

const deleteBulk = async () => {
  const ids = (data.value?.data ?? [])
    .filter((item) => item.checked)
    .map((item) => item.unique_id!);

  if (ids.length) {
    await handleDelete(ids);
  }
};

const onSort = (sortBy: { order: string; prop: string }) => {
  request_search.value.sort = {
    column: sortBy.prop,
    order:
      sortBy.order === OrderColumn.ASCENDING
        ? OrderColumn.DESC
        : OrderColumn.ASC,
  };
};

const formatLocalDate = (timestamp: number | null) => {
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleDateString("id-ID");
};

const fetchData = async () => {
  loading.value = true;
  try {
    await refresh();
  } catch (error) {
    ElMessage.error("Gagal memuat data katalog");
  } finally {
    loading.value = false;
  }
};

watch(request_search, fetchData, { deep: true });

const shortcutsDate = [
  {
    text: "Minggu lalu",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: "Bulan lalu",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
];

const refreshTable = () => refresh();

const handlePageChange = (page: number) => {
  request_search.value.offset = `${page}`;
  refreshTable;
};

const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`;
  request_search.value.offset = "1";
  refreshTable;
};
</script>

<template>
  <TrumsWrapper>
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6">
        <el-input
          v-model="request_search.keyword"
          placeholder="Cari katalog..."
          clearable
        />
      </el-col>
      <NuxtLink href="/catalogue/add" class="el-button el-button--primary">
        Tambah Katalog
      </NuxtLink>

      <el-button
        :icon="Eleme"
        :loading="status === 'pending'"
        size="default"
        type="default"
        @click="refreshTable"
        >Reload</el-button
      >

      <el-popconfirm
        v-if="checkSelect()"
        title="Hapus item terpilih?"
        @confirm="deleteBulk"
      >
        <template #reference>
          <el-button type="danger">Hapus Terpilih</el-button>
        </template>
      </el-popconfirm>
    </el-row>

    <CustomTable
      :columns="filteredColumn"
      :data="data?.data ?? []"
      :loading="status === 'pending'"
      @sort-change="onSort"
    />

    <div class="flex justify-end mt-3">
      <el-pagination
        background
        layout="prev, pager, next, sizes"
        :total="data?.total_data ?? 0"
        :page-size="parseInt(request_search.limit)"
        :current-page="parseInt(request_search.offset)"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>

    <el-image-viewer
      v-if="previewImage"
      show-progress
      :initial-index="initialIndexImage"
      :url-list="urlFileList"
      @close="previewImage = false"
    >
      <template #viewer-error="{ activeIndex, src }">
        <div class="image-slot viewer-error">
          <el-icon><icon-picture /></el-icon>
          <span>
            this is viewer-error slot. current index: {{ activeIndex }}. src:
            {{ src }}
          </span>
        </div>
      </template>
    </el-image-viewer>
  </TrumsWrapper>
</template>
