<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3">
          {{ namePosition }} People
        </span>
      </template>
    </el-page-header>
    <el-row :gutter="20" class="my-3">
      <el-col :span="6"
        ><el-input
          v-model="request_search.keyword"
          size="large"
          placeholder="Type to search"
      /></el-col>
    </el-row>
    <el-table
      class="w-screen"
      @selection-change="handleSelectionChange"
      :data="data?.data"
      :loading="loading"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column
        v-for="col in columns"
        :key="col.prop || col.label"
        :prop="col.prop"
        :label="col.label"
        :sortable="col.sortable"
        :fixed="col.fixed"
      >
      </el-table-column>
    </el-table>
    <div class="flex justify-end">
      <el-pagination
        class="my-3"
        v-model:page-size="limit"
        :page-sizes="[10, 20, 30, 40]"
        background
        layout="total, sizes, prev, pager, next"
        :total="data?.total_data"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </TrumsWrapper>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";
import { type People } from "~/types/people";
import { useApi } from "~/composables/useApi";
import type { RequestSearch } from "~/types/request_search";
import { useRouter } from "vue-router";
import { InfoFilled } from "@element-plus/icons-vue";
import type { ResponsePagination } from "~/types/response_pagination";
const config = useRuntimeConfig();

definePageMeta({
  middleware: ["auth", "app"],
});

const router = useRouter();
const route = useRoute();
const token = useCookie("token");
const unique_id = route.query.unique_id;
const namePosition = route.params.name;
const goBack = () => router.back();

const columns = [
  {
    label: "Name",
    prop: "name",
    sortable: true,
    fixed: true,
  },
];
const loading = ref<boolean>(false);

const limit = ref(10);
const currentPage = ref(1);

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      position_id: [unique_id],
    },
  ],
  sort: null,
  limit: limit,
  offset: currentPage,
  table: "people",
});

const { data } = await useFetch<ResponsePagination<People[]>>(
  `${config.public.baseURL}/search`,
  {
    key: "",
    method: "post",
    body: request_search.value,
    headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
  }
);

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};
const handleSelectionChange = (selection: any[]) => {
  console.log("Selected Rows:", selection);
};
const handleSizeChange = (val: number) => {
  loading.value = true;
};
</script>
