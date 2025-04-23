<template>
  <TrumsWrapper>
    <el-page-header @back="goBack" :title="`${t('menu.back')}`">
      <template #content>
        <span class="text-large font-600 mr-3" v-if="lang === 'en'">
          <span class="font-bold">{{ nameDepartement }}</span>
          {{ t("menu.submenu.people") }}
        </span>
        <span class="text-large font-600 mr-3" v-else>
          {{ t("menu.submenu.people") }}
          <span class="font-bold">{{ nameDepartement }}</span>
        </span>
      </template>
    </el-page-header>
    <el-row class="my-3 w-full flex justify-between items-center">
      <div class="flex justify-between w-full items-center">
        <el-col :span="6"
          ><el-input
            v-model="request_search.keyword"
            size="large"
            style="width: 380px"
            :placeholder="`${t('form.placeholder.search')}`"
          >
            <template #prefix>
              <Icon name="lineicons:magnifier" />
            </template>
          </el-input>
        </el-col>
        <el-tooltip :content="`${t('tooltip.reloadData')}`" placement="top">
          <el-button
            size="large"
            @click="fetchData"
            :loading-icon="RefreshRight"
            :loading="loading"
            ><Icon
              name="material-symbols:refresh"
              size="1.5em"
              :hidden="loading"
            />
            <span :hidden="!loading">{{ t("buttons.load") }}</span></el-button
          >
        </el-tooltip>
      </div>
    </el-row>
    <CustomTable :data="data?.data ?? []" :columns="columns" />
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
import { ref } from "vue";
import { type People } from "~/types/people";
import type { RequestSearch } from "~/types/request_search";
import { useRouter } from "vue-router";
import { RefreshRight } from "@element-plus/icons-vue";
import type { ResponsePagination } from "~/types/response_pagination";
import CustomTable from "~/components/trums/table/customTable.vue";
import { type Column, ElMessage } from "element-plus";

definePageMeta({
  middleware: ["auth", "app"],
});

const config = useRuntimeConfig();
const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const token = useCookie("token");
const lang = useCookie("language");
const unique_id = route.query.unique_id;
const nameDepartement = route.params.name;
const goBack = () => router.back();
const loading = ref<boolean>(false);
const limit = ref(10);
const currentPage = ref(1);

const columns: Column<People>[] = [
  {
    title: `${t("form.label.name")}`,
    key: "name",
    dataKey: "name",
    width: 200,
    sortable: true,
    fixed: true,
  },
];

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      departement_id: [unique_id],
    },
  ],
  sort: null,
  limit: limit,
  offset: currentPage,
  table: "people",
});

const { data } = await useFetchApi<ResponsePagination<People[]>>(
  "/search",
  "people",
  "post",
  request_search.value
);

const fetchData = async () => {
  loading.value = true;
  try {
    await refreshNuxtData();
  } catch (error) {
    console.error("Gagal memuat data:", error);
  }
  loading.value = false;
  ElMessage.success(`${t("message.reloadData")}`);
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};

const handleSelectionChange = (selection: any[]) => {
  console.log("Selected Rows:", selection);
};

const handleSizeChange = (val: number) => {
  loading.value = true;
  try {
    refreshNuxtData();
  } catch (error) {
    console.error("Gagal memuat data:", error);
  }
  loading.value = false;
  ElMessage.info(`${t("message.handleSizeChange")}`);
};
</script>
