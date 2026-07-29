<template>
  <TrumsDragScrollTable>
    <customTable
      :columns="type == 'document' ? availableColumnDocument : availableColumn"
      :data="data?.data ?? []"
      :loading="status === 'pending'"
      @sort-change="onSort"
    />
  </TrumsDragScrollTable>
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
</template>
<script lang="tsx" setup>
import {
  ElCheckbox,
  ElCheckboxGroup,
  ElIcon,
  ElImage,
  ElPopover,
  ElTag,
  type CheckboxValueType,
} from "element-plus";
import customTable from "./table/customTable.vue";
import { Filter, PictureFilled } from "@element-plus/icons-vue";
import { NuxtLink } from "#components";
import type { Catalogue } from "~/types/catalogue";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ColumnTable } from "~/types/ColumnTable";
import type { AppFile } from "~/types/file";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";
import type { ResponsePagination } from "~/types/response_pagination";
import { getDocRefLink, getDocRefView } from "~/types/document";

const props = defineProps<{
  type: "place" | "item" | "document";
}>();
const emit = defineEmits<{
  (e: "selection-change", value: Catalogue[]): void;
}>();
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
  table: "catalogues",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
});

const { data, refresh, status } = await useAsyncData(
  `get-catalogues-${props.type}`,
  async () => {
    const res = await useFetchApi<ResponsePagination<Catalogue[]>>(
      `/search`,
      `get-catalogues-${props.type}`,
      "post",
      request_search.value
    );
    return res.data.value;
  }
);

const previewImage = ref<boolean>(false);

const initialIndexImage = ref<number>(0);

const urlFileList = ref<string[]>([]);

const availableColumn: ColumnTable<Catalogue>[] = [
  {
    key: "selection",
    width: 50,
    fixed: true,
    cellRenderer: ({ rowData }) => {
      const onChange = (value: CheckboxValueType) => {
        rowData.checked = value;
        emitSelection();
      };
      return <SelectionCell value={rowData.checked} onChange={onChange} />;
    },
    headerCellRenderer: () => {
      const _data = unref(data);
      const onChange = (value: CheckboxValueType) => {
        data.value!.data = _data!.data.map((row: any) => {
          row.checked = value;
          return row;
        });
        emitSelection();
      };

      const allSelected = (_data?.data ?? []).every(
        (row: any) => row.checked ?? false
      );
      const containsChecked = (_data?.data ?? []).some(
        (row: any) => row.checked ?? false
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
    cellRenderer: ({ rowData }: { rowData: Catalogue }) => (
      <NuxtLink
        href={`/catalogue/${rowData.unique_id}`}
        class={"text-blue-600"}
      >
        {rowData.unique_code}
      </NuxtLink>
    ),
  },
  {
    dataKey: "name",
    key: "name",
    title: "Nama",
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
    width: 100,
    cellRenderer: ({ rowData }: { rowData: Catalogue }) => (
      <p>{rowData.brand?.name ?? "N/A"}</p>
    ),
  },
];
const availableColumnDocument: ColumnTable<Catalogue>[] = [
  {
    key: "selection",
    width: 50,
    fixed: true,
    cellRenderer: ({ rowData }) => {
      const onChange = (value: CheckboxValueType) => (rowData.checked = value);
      emitSelection();
      return <SelectionCell value={rowData.checked} onChange={onChange} />;
    },
    headerCellRenderer: () => {
      const _data = unref(data);
      const onChange = (value: CheckboxValueType) => {
        data.value!.data = _data!.data.map((row: any) => {
          row.checked = value;
          return row;
        });
        emitSelection();
      };

      const allSelected = (_data?.data ?? []).every(
        (row: any) => row.checked ?? false
      );
      const containsChecked = (_data?.data ?? []).some(
        (row: any) => row.checked ?? false
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
    cellRenderer: ({ rowData }: { rowData: Catalogue }) => (
      <NuxtLink
        href={`/catalogue/${rowData.unique_id}`}
        class={"text-blue-600"}
      >
        {rowData.unique_code}
      </NuxtLink>
    ),
  },
  {
    dataKey: "name",
    key: "name",
    title: "Nama",
    fixed: true,
    sortable: true,
  },

  {
    dataKey: "type",
    key: "type",
    title: "Tipe",
    width: 100,
    // headerCellRenderer: () => (
    //   <div class="flex items-center justify-center">
    //     <span class="mr-2 text-xs">Doc REF</span>
    //     <ElPopover trigger="click" width="200">
    //       {{
    //         default: () => (
    //           <div class="filter-wrapper">
    //             <div class="filter-group flex flex-col">
    //               <ElCheckboxGroup
    //                 v-model={request_search.value.column[0].type}
    //               >
    //                 <ElCheckbox key={"place"} value={"place"} label={"Place"} />
    //                 <ElCheckbox key={"item"} value={"item"} label={"Item"} />
    //               </ElCheckboxGroup>
    //             </div>
    //           </div>
    //         ),
    //         reference: () => (
    //           <ElIcon class="cursor-pointer">
    //             <Filter />
    //           </ElIcon>
    //         ),
    //       }}
    //     </ElPopover>
    //   </div>
    // ),
    cellRenderer: ({ rowData }: { rowData: Catalogue }) => (
      <NuxtLink href={getDocRefLink(rowData.document)} class={"text-blue-600"}>
        {getDocRefView(rowData.document?.reference)}
      </NuxtLink>
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

const handlePageChange = (page: number) => {
  request_search.value.offset = `${page}`;
};

const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`;
  request_search.value.offset = "1";
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

const emitSelection = () => {
  emit(
    "selection-change",
    (data.value?.data ?? []).filter((item) => item.checked)
  );
};

watch(
  () => request_search.value,
  () => refresh(),
  { deep: true }
);
</script>
