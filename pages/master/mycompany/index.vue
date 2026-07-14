<template>
  <TrumsWrapper>
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6">
        <el-input
          v-model="request_search.keyword"
          size="default"
          placeholder="Cari kontak..."
          clearable
        />
      </el-col>
      <NuxtLink
        class="el-button el-button--primary el-button--default"
        href="/contact-management/contacts/form/add?mode=add&company=false&ownership=true"
      >
        Buat Perusahaan Baru
      </NuxtLink>
      <el-button
        size="default"
        :loading-icon="Eleme"
        :loading="loading"
        @click="fetchData"
      >
        Muat Ulang
      </el-button>
      <el-button type="danger" :disabled="!hasSelected" @click="batchDelete">
        Hapus yang Dipilih
      </el-button>
    </el-row>

    <CustomTable
      :columns="filteredColumns"
      :data="data?.data ?? []"
      :loading="loading"
      :column-sort="onSort"
      @selection-change="handleSelectionChange"
    />

    <div class="flex justify-end mt-3">
      <el-pagination
        background
        layout="prev, pager, next, sizes, total"
        :total="data?.total_data"
        :current-page="data?.current_page"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import { Eleme, SetUp, Filter } from "@element-plus/icons-vue";
import {
  type Column,
  type CheckboxValueType,
  TableV2FixedDir,
  ElPopover,
  ElCheckbox,
  ElIcon,
  type SortBy,
  ElCheckboxGroup,
  ElTag,
} from "element-plus";
import type { Pagination } from "~/types/pagination";
import { NuxtLink } from "#components";
import CustomTable from "~/components/trums/table/customTable.vue";
import type { ResponsePagination } from "~/types/response_pagination";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";
import type { Contact } from "~/types/contact";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { BaseResponse } from "~/types/response";

definePageMeta({
  middleware: ["auth", "app"],
});

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      is_company: true,
      ownership: true,
    },
  ],
  limit: "10",
  offset: "1",
  table: "contacts",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
});

// Data state
const { data } = await useFetchApi<ResponsePagination<Contact[]>>(
  `/search`,
  "contact",
  "post",
  request_search.value
);
const selectedContacts = ref<Contact[]>([]);
const loading = ref(false);
const popoverRef = ref();
const router = useRouter();

// Columns
const columnsSelected = ref<string[]>([
  "selection",
  "unique_code",
  "name",
  "email",
  "phone",
  "is_personal",
  "created_at",
  "operations",
  "setup",
]);
const columns: Column<Contact>[] = [
  {
    key: "unique_code",
    title: "Kode Kontak",
    dataKey: "unique_code",
    width: 150,
    cellRenderer: ({ rowData: row }) => (
      <NuxtLink
        href={`/contact-management/contacts/${row.unique_id}`}
        class="text-blue-500"
      >
        {row.unique_code}
      </NuxtLink>
    ),
  },
  {
    key: "name",
    title: "Nama",
    dataKey: "name",
    width: 200,
    sortable: true,
  },
  {
    key: "email",
    title: "Email",
    dataKey: "email",
    width: 200,
    sortable: true,
  },
  {
    key: "phone",
    title: "Telepon",
    dataKey: "phone",
    width: 150,
    cellRenderer: ({ rowData }: { rowData: Contact }) => (
      <span>{rowData.phone || "-"}</span>
    ),
  },
  {
    key: "is_personal",
    title: "Tipe",
    dataKey: "is_personal",
    width: 120,
    cellRenderer: ({ rowData }: { rowData: Contact }) => (
      <ElTag type={rowData.is_personal ? "success" : "primary"}>
        {rowData.is_personal
          ? "Personal"
          : rowData.is_company
          ? "Perusahaan"
          : "Lainnya"}
      </ElTag>
    ),
  },
  {
    key: "tax_id",
    title: "NPWP",
    dataKey: "tax_id",
    width: 150,
    cellRenderer: ({ rowData }: { rowData: Contact }) => (
      <span>{rowData.tax_id || "-"}</span>
    ),
  },
  {
    key: "created_at",
    title: "Dibuat Pada",
    dataKey: "created_at",
    width: 150,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: Contact }) => (
      <span>{formatLocalDate(rowData.created_at)}</span>
    ),
  },
  {
    key: "operations",
    title: "Aksi",
    cellRenderer: ({ rowData }: { rowData: Contact }) => (
      <>
        <el-button
          size="small"
          onClick={() =>
            navigateToForm("update", rowData.name, rowData.unique_id ?? "")
          }
        >
          Edit
        </el-button>

        <el-button
          size="small"
          type="danger"
          onClick={() => onDelete([rowData.unique_id])}
        >
          Hapus
        </el-button>
      </>
    ),
    width: 150,
    align: "center",
  },
  {
    title: "",
    key: "setup",
    width: 50,
    fixed: TableV2FixedDir.RIGHT,
  },
];

// Tambahkan kolom seleksi di awal
columns.unshift({
  key: "selection",
  width: 50,
  maxWidth: 50,
  align: "center",
  cellRenderer: ({ rowData }) => {
    const onChange = (value: CheckboxValueType) => (rowData.checked = value);
    return <SelectionCell value={rowData.checked} onChange={onChange} />;
  },
  headerCellRenderer: () => {
    const _data = unref(data.value);
    const onChange = (value: CheckboxValueType) =>
      (data.value!.data = (_data?.data ?? []).map((row: any) => {
        row.checked = value;
        return row;
      }));
    const allSelected = _data?.data.every((row: any) => row.checked) ?? false;
    const containsChecked =
      _data?.data.some((row: any) => row.checked) ?? false;

    return (
      <SelectionCell
        value={allSelected}
        interminate={containsChecked && !allSelected}
        onChange={onChange}
      />
    );
  },
});

const navigateToForm = (mode = "", name = "", unique_id: string) => {
  const path = name
    ? `/contact-management/contacts/form/${name}`
    : "/contact-management/contacts/form/add";
  router.push({ path, query: { mode, unique_id } });
};

// Tambahkan setup kolom di akhir
columns[columns.length - 1].headerCellRenderer = () => {
  return (
    <div class="flex items-center justify-center">
      <span class="mr-2 text-xs"></span>
      <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
        {{
          default: () => (
            <div class="filter-wrapper">
              <div class="filter-group flex flex-col">
                <ElCheckboxGroup v-model={columnsSelected.value}>
                  {columns
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
  );
};

// Filter columns based on selection
const filteredColumns = computed(() => {
  return columns.filter((col) =>
    columnsSelected.value.includes(col.key!.toString())
  );
});

// Format date
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("id-ID");
};

const hasSelected = computed(() => {
  return data.value?.data.some((item) => item.checked);
});

// Handle selection change
const handleSelectionChange = (selection: Contact[]) => {
  selectedContacts.value = selection;
};

// Handle page change
const handlePageChange = (page: number) => {
  request_search.value.offset = `${page}`;
};

// Handle page size change
const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`;
};

// Edit contact
const onEdit = (contact: Contact) => {
  const cookie = useCookie("contact_unique_id");
  cookie.value = contact.unique_id;
  router.push(`/contact-management/contact/add`);
};

// Delete contact
const onDelete = async (contactIds: string[]) => {
  try {
    await ElMessageBox.confirm(
      `Apakah Anda yakin ingin menghapus ${contactIds.length} kontak?`,
      "Konfirmasi Hapus",
      { type: "warning" }
    );

    const response = await useFetchApi<BaseResponse<any>>(
      "/contact-delete",
      "delete-contact",
      "post",
      contactIds
    );
    if (response.status.value == "success") {
      ElMessage.success("Kontak berhasil dihapus");
      refreshNuxtData("contact");
    }
  } catch (error) {
    // User canceled or error occurred
  }
};

// Batch delete
const batchDelete = async () => {
  const ids: string[] = [];
  for (let index = 0; index < (data.value?.data ?? []).length; index++) {
    const element = data.value?.data[index];
    if (element?.checked) {
      ids.push(element.unique_id);
    }
  }
  onDelete(ids);
};

// Fetch data from API
const fetchData = async () => {
  loading.value = true;
  try {
    refreshNuxtData("contact");
  } catch (error: any) {
    ElMessage.error(
      error.response?.data?.message || "Gagal memuat data kontak"
    );
  } finally {
    loading.value = false;
  }
};

const onSort = async (sortBy: SortBy) => {
  request_search.value.sort = {
    column: sortBy.key.toString(),
    order:
      request_search.value.sort?.order == OrderColumn.ASC
        ? OrderColumn.DESC
        : OrderColumn.ASC,
  };
};

// Watch search query
watchDebounced(
  request_search.value,
  () => {
    refreshNuxtData("contact");
  },
  { debounce: 500 }
);

onMounted(() => {
  // fetchData()
});
</script>

<style scoped>
.el-row {
  margin-bottom: 20px;
}
</style>
