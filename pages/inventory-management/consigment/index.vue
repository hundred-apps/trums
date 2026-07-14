<script lang="tsx" setup>
import {
  ElButton,
  type CheckboxValueType,
  type Column,
  type SortBy,
} from "element-plus";
import type { Consigment } from "~/types/consignment";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";
import { NuxtLink } from "#components";
import DeleteButton from "~/components/trums/DeleteButton.vue";
import CustomTable from "~/components/trums/table/customTable.vue";
import { InfoFilled } from "@element-plus/icons-vue";
definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "transaction-recaps-read",
  name: "List Of Consigment",
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
  table: "transaction_recaps",
  sort: {
    column: "created_at",
    order: OrderColumn.ASC,
  },
});

const router = useRouter();

const loading = ref<boolean>(false);
const selectionItem = ref<Consigment[]>([]);

const createConsigment = () =>
  router.push("/inventory-management/consigment/add");

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<ResponsePagination<Consigment[]>>(
      `/search`,
      "transaction_recaps",
      "post",
      request_search.value
    );

    if (response.status.value == "success") {
      data.value = response.data.value as ResponsePagination<Consigment[]>;
    }
  } catch (error: any) {
    ElMessage.error(
      `${error.response?.data?.message ?? "Gagal Mengambil Data!"}`
    );
    return [];
  } finally {
    loading.value = false;
  }
};

const { data } = await useFetchApi<ResponsePagination<Consigment[]>>(
  `/search`,
  "transaction_recaps",
  "post",
  request_search.value
);

const availableColumn: Column<Consigment>[] = [
  {
    title: "",
    dataKey: "",
    key: "selection",
    width: 50,
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
          style={{ width: 50 }}
          value={allSelected}
          interminate={containsChecked && !allSelected}
          onChange={onChange}
        />
      );
    },
  },
  {
    title: "Unique Code",
    dataKey: "unique_code",
    key: "unique_code",
    width: 200,
    cellRenderer: ({ rowData: row }) => (
      <NuxtLink href={`checkin/${row.unique_id}`} class={"text-blue-600"}>
        {row.unique_code}
      </NuxtLink>
    ),
  },
  {
    title: "Nama",
    dataKey: "contact_name",
    key: "contact_name",
    width: 200,
  },
  {
    title: "Jumlah Item",
    dataKey: "",
    key: "",
    width: 10,
    cellRenderer: ({ rowData: row }) => (
      <p>{row.transaction_recaps_item.length}</p>
    ),
  },
  {
    title: "Total",
    dataKey: "",
    key: "",
    width: 150,
    cellRenderer: ({ rowData: row }) => <p>{getTotalTransaction(row)}</p>,
  },
  {
    title: "Dibuat Tgl",
    dataKey: "",
    key: "",
    width: 100,
    cellRenderer: ({ rowData: row }) => (
      <p>{formatLocalDate(row.created_at)}</p>
    ),
  },
  {
    title: "Operasi",
    key: "",
    dataKey: "",
    width: 250,

    cellRenderer: ({ rowData: row }) => (
      <>
        <ElButton size="small" onClick={() => downloadPdf(row)}>
          Download PDF
        </ElButton>
        <DeleteButton
          onConfirm={() => handleDelete([row.unique_id])}
          onCancel={() => {}}
        />
      </>
    ),
  },
];

const downloadPdf = (data: Consigment) => {};
const handleDelete = (data: string[]) => {};

const getTotalTransaction = (data: Consigment) => {
  return currency(
    data?.transaction_recaps_item.reduce(
      (prev: any, curr: any) => prev + curr.quantity * curr.selling_price,
      0
    )
  );
};

const onSort = async (sortBy: SortBy) => {
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

watch(request_search, fetchData, { immediate: true });

const paginationClick = (val: number) => {
  const data: RequestSearch = { ...request_search.value };
  data.offset = val.toString();
  request_search.value = data;
};

const handleSelectionChange = (val: Consigment[]) => {
  selectionItem.value = val;
};

const deleteBulk = async (ids: string[]) => {
  loading.value = true;
  try {
    const response = await useFetchApi(
      "/transaction-recaps-delete",
      "transaction_recaps",
      "post",
      ids
    );
    if (response.status.value == "success") {
      await refreshNuxtData("transaction_recaps");
    }
  } catch (error: any) {
    ElMessage.error(`${error?.response?.data?.message ?? ""}`);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <TrumsWrapper>
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6"
        ><el-input
          v-model="request_search.keyword"
          size="default"
          placeholder="Type to search"
      /></el-col>
      <el-button size="default" @click="createConsigment"
        >Consignment</el-button
      >
      <el-popconfirm
        v-if="selectionItem.length > 0"
        width="220"
        :icon="InfoFilled"
        icon-color="#626AEF"
        title="Are you sure to delete this?"
        @cancel="() => {}"
      >
        <template #reference>
          <el-button type="danger">Hapus</el-button>
        </template>
        <template #actions="{ confirm, cancel }">
          <el-button size="small" @click="cancel">No!</el-button>
          <el-button
            type="danger"
            size="small"
            @click="
              () => deleteBulk(selectionItem.map((value) => value.unique_id))
            "
          >
            Hapus
          </el-button>
        </template>
      </el-popconfirm>
    </el-row>
    <el-table
      v-if="!loading"
      :data="data?.data"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        :selectable="(data, index) => true"
        width="50"
      />
      <el-table-column prop="unique_code" label="Unique Code" width="180" />
      <el-table-column prop="contact_name" label="Nama" width="180" />
      <el-table-column prop="" label="Jumlah Item">
        <template #default="{ row }">
          {{ `${row.transaction_recaps_item.length}` }}
        </template>
      </el-table-column>
      <el-table-column prop="" label="Total">
        <template #default="{ row }">
          {{ getTotalTransaction(row) }}
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="Tgl Dibuat">
        <template #default="{ row }">
          {{ formatLocalDate(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="Operations">
        <template #default="scope">
          <el-button size="small" @click="downloadPdf(scope.row)">
            Cetak PDF
          </el-button>
          <el-popconfirm
            width="220"
            :icon="InfoFilled"
            icon-color="#626AEF"
            title="Are you sure to delete this?"
            @cancel="() => {}"
          >
            <template #reference>
              <el-button size="small" type="danger">Hapus</el-button>
            </template>
            <template #actions="{ confirm, cancel }">
              <el-button size="small" @click="cancel">No!</el-button>
              <el-button
                type="danger"
                size="small"
                @click="() => deleteBulk([scope.row.unique_id])"
              >
                Hapus
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
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
  </TrumsWrapper>
</template>
