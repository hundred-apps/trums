<template>
  <el-row :gutter="20" class="mb-3">
    <el-col :span="6"
      ><el-input
        v-model="request_search.keyword"
        size="default"
        placeholder="Type to search"
    /></el-col>
    <NuxtLink
      v-if="canAccess('inquiries-create', data?.privilege ?? [])"
      class="el-button el-button--default"
      href="/sales/inquiry/add"
      >Buat Inquiri</NuxtLink
    >
    <el-button
      :loading="loading"
      @click="onRefresh"
      size="default"
      type="default"
      :icon="Eleme"
      >Refresh</el-button
    >
    <el-button
      :disabled="!hasSelected"
      @click="bulkDelete"
      size="default"
      type="danger"
      >Hapus</el-button
    >
  </el-row>
  <customTable
    @sort-change="onSort"
    :columns="filteredColumn"
    :data="data?.data ?? []"
  />
  <div class="flex justify-end mt-3">
    <el-pagination
      background
      layout="prev, pager, next, sizes, total"
      :total="data?.total_data"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </div>
  <!-- <el-dialog v-model="modalAddVendor" title="Tambah Vendor" width="1000">
    <el-form
      ref="ruleFormRef"
      :model="ruleFormVendor"
      style="max-width: 600px"
      :rules="rules"
      label-width="auto"
      class="demo-ruleForm"
      :size="formSize"
      status-icon
      :disabled="loading"
    >
      <el-form-item label="Diminta oleh?" prop="to_name">
        <div class="flex items-center gap-3">
          <el-autocomplete
            :fetch-suggestions="(queryString: string, cb: (arg: any) => void) => querySearchContact(queryString, cb, 'to')"
            v-model="ruleForm.to_name"
            placeholder="Cari Kontak"
            @select="(item: Record<string, any>) => onHandleSelectContact(item, 'to')"
          >
            <template #default="{ item }">
              <div v-if="!item.isNew">{{ item.name }}</div>
              <div v-else class="text-blue-600">{{ item.value }}</div>
            </template>
          </el-autocomplete>
          <el-button
            type="primary"
            v-if="toContact"
            @click="openDialogTo"
            :icon="User"
          />
        </div>
      </el-form-item>
      <el-form-item
        v-if="toContact && toContact.is_company"
        label="PIC"
        prop="request_by_name"
      >
        <div class="flex items-center gap-3">
          <el-autocomplete
            :fetch-suggestions="(queryString: string, cb: (arg: any) => void) => querySearchContact(queryString, cb, 'pic')"
            v-model="ruleForm.request_by_name"
            placeholder="Cari Kontak"
            @select="(item: Record<string, any>) => onHandleSelectContact(item, 'pic')"
          >
            <template #default="{ item }">
              <div v-if="!item.isNew">{{ item.name }}</div>
              <div v-else class="text-blue-600">{{ item.value }}</div>
            </template>
          </el-autocomplete>
          <el-button
            type="primary"
            v-if="picContact"
            @click="openDialogPIC"
            :icon="User"
          />
        </div>
      </el-form-item>

      <el-form-item label="File Lampiran" prop="files">
        <TrumsUploadFile v-model:file-list="fileList" />
      </el-form-item>

      <el-form-item label="Cari Alamat" prop="address_view">
        <el-autocomplete
          v-model="ruleForm.address_view"
          :fetch-suggestions="querySearchAddress"
          :trigger-on-focus="false"
          clearable
          class="inline-input w-50"
          placeholder="Cari Alamat/Buat Baru"
          @select="(record) => handleSelectAddress(record)"
        >
          <template #default="{ item }">
            <div v-if="!item.new">
              <div class="name">{{ item.name }}</div>
              <span class="street text-sm">{{ item.street }}</span>
            </div>
            <div v-else>
              <div class="text-blue-600">{{ item.name }}</div>
            </div>
          </template>
        </el-autocomplete>
      </el-form-item>

      <el-form-item v-if="address" label=" ">
        <div>
          <div class="flex items-center gap-2">
            <p>{{ address.address_name }}</p>
            <el-icon
              class="cursor-pointer text-blue-500 hover:text-blue-600"
              @click="handleEditAddress(address)"
              ><Edit
            /></el-icon>
            <el-icon
              class="cursor-pointer text-read-500 hover:text-read-600"
              @click="handleDeleteAddress"
              ><Delete
            /></el-icon>
          </div>
          <div>
            {{ address.street }},
            {{ generateResultSearchAddress(address).name }}
          </div>
        </div>
      </el-form-item>

      <el-form-item label="Tanggal Permintaan" prop="date">
        <el-date-picker
          v-model="ruleForm.date!"
          type="date"
          placeholder="Tanggal Inquiri"
        />
      </el-form-item>

      <el-form-item label="Prioritas" label-position="right">
        <el-radio-group v-model="ruleForm.priority" aria-label="Prioritas">
          <el-radio-button value="low">Low</el-radio-button>
          <el-radio-button value="medium">Medium</el-radio-button>
          <el-radio-button value="high">Hight</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="Note">
        <el-input v-model="ruleForm.description" type="textarea" />
      </el-form-item>
    </el-form>

    <el-table
      :data="data"
      ref="tableRef"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="Nama Biaya" prop="name">
        <template #default="scope">
          <p>{{ scope.row.name ?? "-" }}</p>
        </template>
      </el-table-column>
      <el-table-column label="Nilai Default" prop="default_value" />
      <el-table-column label="Type" prop="type">
        <template #default="scope">
          {{ scope.row.type == "percent" ? "%" : "Rp" }}
        </template>
      </el-table-column>
    </el-table>
  </el-dialog> -->
</template>
<script lang="tsx" setup>
import {
  ElButton,
  ElCheckbox,
  ElCheckboxGroup,
  ElIcon,
  ElPopover,
  type CheckboxValueType,
  type Column,
  type ComponentSize,
  type FormInstance,
  type FormRules,
} from "element-plus";
import type { ItemRequest } from "~/types/item_request";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import { TypeInquiry } from "~/types/inquiry";
import type { ResponsePagination } from "~/types/response_pagination";
import { NuxtLink } from "#components";
import type {
  CellRendererParams,
  SortBy,
} from "element-plus/es/components/table-v2/src/types.mjs";
import { Eleme, SetUp, Plus } from "@element-plus/icons-vue";
import customTable from "~/components/trums/table/customTable.vue";
import { canAccess } from "#imports";
import type { ColumnTable } from "~/types/ColumnTable";
import type { CanvassingItem } from "~/types/scm/canvasing";

const popoverRef = ref();

const loading = ref<boolean>(false);
const modalAddVendor = ref<boolean>(false);
const canvassingItem = ref<CanvassingItem | null>(null);

const formSize = ref<ComponentSize>("default");
const ruleFormRef = ref<FormInstance>();

const ruleFormVendor = reactive<CanvassingItem>({
  unique_id: "",
  canvassing_id: "",
  canvaasing_version: 0,
  item_request_trail_id: "",
  item_request_trail_version: 0,
  canvassing_vendor: [],
  unit_id: null,
  unit_name: null,
  unit_version: null,
  catalogue_id: "",
  catalogue_name: "",
  quantity: 0,
  unit_selling_price: 0,
  created_at: 0,
  created_by: 0,
  updated_at: 0,
  type_item: "request",
  equivalent_id: null,
});

const rules = reactive<FormRules<CanvassingItem>>({
  canvassing_vendor: [
    {
      type: "array",
      required: true,
      message: "Items wajib ada",
      trigger: "change",
    },
  ],
  "items.*.price": [
    {
      required: true,
      message: "Harga wajib diisi",
      trigger: "blur",
    },
  ],
});

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      inquiry: {
        type: [TypeInquiry.SALES_INQUIRY],
      },
    },
  ],
  limit: "10",
  offset: "1",
  table: "item_request",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
  flag: "list",
});

const { data, refresh, status } = await useAsyncData(
  "fetch-item-request",
  async () => {
    const res = await useFetchApi<ResponsePagination<ItemRequest[]>>(
      `/search`,
      "fetch-item-request",
      "post",
      request_search.value
    );
    return res.data.value;
  }
);

const column_selected = ref<string[]>([
  "selection",
  "unique_code",
  "date",
  "request_by",
  "request_to",
  "catalogue_name",
  "sn",
  "quantity",
  "uom",
  "harga",
]);

const hasSelected = computed(() => {
  return data.value?.data?.some((item) => item.checked) || false;
});

const availableColumn: ColumnTable<ItemRequest>[] = [
  {
    title: "",
    dataKey: "",
    key: "selection",
    width: 50,
    fixed: true,
    cellRenderer: ({ rowData }) => {
      const onChange = (value: CheckboxValueType) => (rowData.checked = value);
      return <SelectionCell value={rowData.checked} onChange={onChange} />;
    },
    maxWidth: 50,

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
          privilege: _data?.privilege ?? [],
        });
      const allSelected = _data!.data.every((row) => row.checked);
      const containsChecked = _data?.data.some((row) => row.checked);

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
  {
    title: "Nomor RFQ",
    dataKey: "unique_code",
    key: "unique_code",
    fixed: true,
    cellRenderer: ({ rowData }: { rowData: ItemRequest }) => (
      <NuxtLink
        href={`inquiry/${rowData.inquiry?.unique_id}`}
        class={"text-blue-600"}
      >
        {rowData.inquiry?.unique_code}
      </NuxtLink>
    ),
  },
  {
    title: "Nama Item",
    dataKey: "catalogue_name",
    key: "catalogue_name",
    fixed: true,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: ItemRequest }) => (
      <p>{rowData.catalogue_name ?? "Tidak Ada"}</p>
    ),
  },
  {
    title: "Ditujukan Untuk",
    dataKey: "request_to",
    key: "request_to",
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: ItemRequest }) => (
      <p>{`${rowData.inquiry?.request_to?.name} (${
        rowData.inquiry?.request_by?.name ?? "N/A"
      })`}</p>
    ),
  },

  {
    title: "SN/PN Number",
    dataKey: "sn",
    key: "sn",
    cellRenderer: ({ rowData }: { rowData: ItemRequest }) => (
      <p>{rowData.catalogue?.sn ?? "Tidak Ada"}</p>
    ),
  },
  {
    title: "QTY",
    dataKey: "quantity",
    key: "quantity",
    width: 100,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: ItemRequest }) => (
      <p>{rowData.request_qty ?? "0"}</p>
    ),
  },
  {
    title: "UoM",
    dataKey: "uom",
    key: "uom",
    width: 100,
    cellRenderer: ({ rowData }: { rowData: ItemRequest }) => (
      <p>{rowData.unit_name ?? "-"}</p>
    ),
  },
  {
    title: "Vendor",
    dataKey: "harga",
    key: "harga",
    width: 100,
    align: "center",
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: ItemRequest }) => (
      <p>{rowData.total_canvassing_vendor ?? 0}</p>
    ),
  },
];

const filteredColumn = computed(() => {
  return availableColumn.filter((col) =>
    column_selected.value.includes(col.key!.toString())
  );
});

const bulkDelete = async () => {
  try {
    await ElMessageBox.confirm(
      "Yakin ingin menghapus data Inquiry?",
      "Warning",
      {
        confirmButtonText: "Hapus",
        cancelButtonText: "Batal",
        type: "warning",
      }
    );

    const ids =
      (data.value?.data ?? [])
        .filter((item) => item.checked)
        .map((item) => item.unique_id!) || [];

    // Jika sampai sini, user klik Delete
    await submitToDelete(ids);
  } catch (error) {
    // User klik Cancel atau close dialog
    console.log("Delete cancelled");
  }
};

const findCanvassingItem = async (
  catalogue_id: string
): Promise<CanvassingItem | null> => {
  status.value = "pending";
  try {
    const requestFindCanvassingItem: RequestSearch = {
      keyword: "",
      table: "canvassing_item",
      column: [
        {
          catalogue_id: [catalogue_id],
        },
      ],
      sort: null,
      offset: "1",
      limit: "1",
    };
    const response = await useFetchApi<ResponsePagination<CanvassingItem[]>>(
      "/search",
      "fetch-canvassing-item",
      "post",
      requestFindCanvassingItem
    );

    if (
      response.status.value == "success" &&
      (response.data.value?.data ?? []).length > 0
    ) {
      return response.data.value!.data[0];
    }
  } catch (error: any) {
    ElMessage.error(error.response?.message ?? error);
    return null;
  } finally {
    status.value = "success";
    return null;
  }
};

const onNewVendor = async (item: ItemRequest) => {
  const canvassingItem: CanvassingItem | null = await findCanvassingItem(
    item.catalogue_id || ""
  );
  if (canvassingItem) {
  }
};

const submitToDelete = async (ids: string[]) => {
  loading.value = false;
  try {
    const response = await useFetchApi<ResponsePagination<string[]>>(
      `/item-request-delete`,
      "item-request-delete",
      "post",
      ids
    );
    if (response.status.value == "success") {
      await refreshNuxtData("fetch-item-request");
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message}`);
  } finally {
    loading.value = false;
  }
};

const onSort = (sortBy: { order: string; prop: string }) => {
  request_search.value.sort = {
    column: sortBy.prop,
    order:
      sortBy.order === OrderColumn.ASCENDING
        ? OrderColumn.ASC
        : OrderColumn.DESC,
  };
};

const handlePageChange = (page: number) => {
  request_search.value.offset = `${page}`;
};

const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`;
};

const onRefresh = () => refresh();
</script>
