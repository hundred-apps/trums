<template>
  <el-dialog
    v-model="visible"
    :title="`Cari Item ${currentItemName}`"
    width="1000"
  >
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6">
        <el-input
          v-model="keywordSearch"
          size="default"
          placeholder="Type to search"
        />
      </el-col>
      <el-button
        size="default"
        type="primary"
        @click="handleSelect"
        :disabled="selectedItems.length === 0"
      >
        Tambahkan {{ selectedItems.length }}
      </el-button>
      <el-button
        type="default"
        size="default"
        :icon="Plus"
        @click="$emit('create-new')"
      >
        Buat Baru
      </el-button>
    </el-row>

    <el-table
      :data="data"
      style="width: 100%"
      ref="tableRef"
      :lazy="true"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="image" label="Image" width="75">
        <template #default="scope">
          <div class="demo-image__preview flex items-center">
            <ItemImageUpload
              v-if="((scope.row as Pricelist_item).files ?? []).length > 0 && getFirstFileUrl(((scope.row as Pricelist_item).files ?? [])) !== ''"
              v-model="scope.row.files"
              :image-url="getFirstFileUrl((scope.row as Pricelist_item).files ?? [])"
              :show-text="false"
              @open-modal="() => {
                      fileList = mapAllAppFileToFileUri((scope.row as Pricelist_item).files || []);
                      initialIndexImage = 0;
                      previewImage = true;
                    }"
            />
            <div
              v-else
              class="w-10 h-10 rounded border flex items-center justify-center text-gray-400 image-viewer-slot image-slot"
            >
              <el-icon><Picture /></el-icon>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Vendor" width="180">
        <template #default="scope">
          <p>{{ scope.row.pricetag?.owner?.name ?? "-" }}</p>
        </template>
      </el-table-column>
      <el-table-column label="Nama Item">
        <template #default="scope">
          <NuxtLink
            class="text-blue-500"
            :to="`/catalogue/${scope.row.unique_id}`"
          >
            {{ scope.row.catalogue?.name ?? "" }}
          </NuxtLink>
        </template>
      </el-table-column>
      <el-table-column label="Harga" width="120" align="right">
        <template #default="scope">
          <p>{{ currency(scope.row.price) }}</p>
        </template>
      </el-table-column>
      <el-table-column label="UOM" width="100" align="right">
        <template #default="scope">
          <p>{{ scope.row.unit?.name ?? "" }}</p>
        </template>
      </el-table-column>
    </el-table>

    <div class="flex justify-end mt-3">
      <el-pagination
        v-model:current-page="offset"
        v-model:page-size="limit"
        background
        layout="sizes, prev, pager, next"
        :total="totalData"
        :size="size"
        @current-change="handlePagination"
        @size-change="handleSizeChange"
        :page-sizes="[10, 50, 100, 500]"
      />
    </div>
  </el-dialog>

  <el-image-viewer
    v-if="previewImage"
    show-progress
    :url-list="fileList"
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
</template>

<script setup lang="ts">
import { getFirstFileUrl, mapAllAppFileToFileUri } from "#imports";
import { Plus, Picture } from "@element-plus/icons-vue";
import type { Pricelist_item } from "~/types/pricelist";
import type { Pricetag_item } from "~/types/pricetag";
import ItemImageUpload from "~/pages/sales/inquiry/components/ItemImageUpload.vue";
import type { ComponentSize } from "element-plus";
import type { RequestSearch } from "~/types/request_search";

const size = ref<ComponentSize>("default");
const fileList = ref<string[]>([]);
const initialIndexImage = ref<number>(0);
const previewImage = ref<boolean>(false);

interface Props {
  visible: boolean;
  data: Pricetag_item[];
  searchParams: {
    keyword: string;
    catalogue_id: string;
    location: never[];
    contact: never[];
    quantity: number;
    category: string[];
    owner_id: string;
    type: "single" | "multi";
    offset: number;
    limit: number;
    flag: string;
  };
  totalData: number;
  selectedItems: any[];
  currentItemName: string;
}

interface Emits {
  (e: "update:visible", value: boolean): void;
  (e: "select-items", items: any[]): void;
  (e: "create-new"): void;
  (e: "pagination-change", page: number): void;
  (e: "pagination-size-change", page: number): void;
  (e: "onSearch", value: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const keywordSearch = ref<string>(props.searchParams.keyword);
const limit = ref<number>(Number(props.searchParams.limit || "0"));
const offset = ref<number>(Number(props.searchParams.offset || "0"));

const visible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});

const selectedItems = ref<Pricetag_item[]>([]);
const tableRef = ref();

// Watcher untuk reset selection ketika modal dibuka
watch(visible, (newVal) => {
  if (newVal) {
    // Reset selection ketika modal dibuka
    selectedItems.value = [];
    nextTick(() => {
      if (tableRef.value) {
        tableRef.value.clearSelection();
      }
    });
  }
});
watch(
  () => keywordSearch.value,
  (newVal) => {
    console.log("search disni");
    emit("onSearch", newVal);
  },
  { deep: true }
);
watch(
  () => props.searchParams.keyword,
  (newVal) => {
    keywordSearch.value = newVal;
  },
  { deep: true }
);

const handleSelectionChange = (val: Pricetag_item[]) => {
  selectedItems.value = val;
  //   selectedItems.value = val.map((value) => ({
  //     catalogue_id: value.catalogue_id,
  //     catalogue_name: value.catalogue?.name ?? '',
  //     price: value.price,
  //     sn: value.catalogue?.sn ?? '',
  //     unique_id: '',
  //     vendor_id: value.pricetag?.owner?.unique_id ?? '',
  //     vendor_name: value.pricetag?.owner?.name ?? '',
  //   }))
};

const handleSelect = () => {
  emit("select-items", selectedItems.value);
  visible.value = false;
};

const handlePagination = (page: number) => {
  emit("pagination-change", page);
};

const handleSizeChange = (val: number) => {
  emit("pagination-size-change", val);
};

// Currency formatter (salin dari komponen utama)
const currency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(value);
};

onMounted(() => {
  console.log("prop", props);
});
</script>
