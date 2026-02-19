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
import { Eleme, Filter } from "@element-plus/icons-vue";
import { NuxtLink } from "#components";
import { InfoFilled, SetUp } from "@element-plus/icons-vue";
import type { Pricetag } from "~/types/pricetag";
import { canAccess, useCookie } from "#imports";
import OfferTable from "./components/OfferTable.vue";
definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "pricetag-read",
  name: "Daftar Penawaran",
});

const router = useRouter();
const loading = ref<boolean>(false);
const popoverRef = ref();
const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      type: ["out"],
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

const refreshTrigger = ref<number>(0);

const hasCreate = await checkPermission("pricetag-create");
const hasUpdate = await checkPermission("pricetag-update");
const hasDelete = await checkPermission("pricetag-delete");

const locations = ref<Catalogue[]>([]);
const idsSelected = ref<string[]>([]);

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
const childRef = ref();
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
      refreshTrigger.value++;
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

const deleteBulk = () => {
  handleDelete(idsSelected.value);
};

const onRefreshTable = () => refreshTrigger.value++;

onMounted(() => {
  fetchLocation();
});
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
      <NuxtLink
        v-if="hasCreate"
        href="/sales/offer/add?type=out"
        @click="
          () => {
            const cookie = useCookie('tag_id');
            cookie.value = null;
          }
        "
        class="el-button el-button--primary el-button--default"
        >Buat Penawaran Baru</NuxtLink
      >
      <el-button
        size="default"
        class="ml-3"
        type="default"
        :icon="Eleme"
        @click="onRefreshTable"
        >Reload</el-button
      >
      <el-popconfirm
        v-if="idsSelected.length > 0 && hasDelete"
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
    <OfferTable
      ref="childRef"
      :request_search="request_search"
      :refresh_trigger="refreshTrigger"
      :key="'get-offer-to-customer'"
      v-on:has-bulk="(value) => (idsSelected = value)"
    />
  </TrumsWrapper>
</template>
