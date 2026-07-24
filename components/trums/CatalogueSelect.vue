<!-- <template>
  <customTable
    :columns="filteredColumn"
    :data="data?.data ?? []"
    :loading="status === 'pending'"
    @sort-change="onSort"
  />
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

const previewImage = ref<boolean>(false);

const initialIndexImage = ref<number>(0);

const urlFileList = ref<string[]>([]);

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
    cellRenderer: ({ rowData }: { rowData: Catalogue }) => (
      <p>{rowData.brand?.name ?? "N/A"}</p>
    ),
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
</script> -->
