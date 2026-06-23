<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3"> RAB Canvassing </span>
      </template>
    </el-page-header>

    <el-card class="my-3">
      <template #header>
        <div class="card-header">
          <el-form-item>
            <el-button
              :disabled="loading"
              type="primary"
              @click="submitForm(ruleFormRef)"
              >Simpan</el-button
            >
            <el-button :disabled="loading" @click="resetForm(ruleFormRef)"
              >Reset</el-button
            >
          </el-form-item>
        </div>
      </template>

      <el-form
        ref="ruleFormRef"
        style="max-width: 600px"
        :model="ruleForm"
        :rules="rules"
        label-width="auto"
        class="demo-ruleForm"
        size="default"
        :disabled="loading"
        :label-position="labelPosition"
        :formSize="formSize"
        status-icon
      >
        <el-form-item
          :label="isMobile ? '' : 'Nomor Referensi/RFQ'"
          prop="source_document"
        >
          <div class="flex gap-2 w-full">
            <el-input
              v-model="ruleForm.source_document"
              :readonly="true"
              placeholder="Klik Tombol Untuk Pilih RFQ"
            />
            <el-button
              :disabled="loading"
              :icon="Plus"
              type="primary"
              size="default"
              @click="visibleModalRequest = true"
            />
          </div>
        </el-form-item>

        <el-form-item :label="isMobile ? '' : 'Deskripsi'" prop="description">
          <el-input
            v-model="ruleForm.description"
            type="textarea"
            placeholder="Masukkan deskripsi"
          />
        </el-form-item>

        <el-form-item :label="isMobile ? '' : 'File Lampiran'" prop="files">
          <TrumsUploadFile v-model:file-list="fileList" />
        </el-form-item>
      </el-form>
    </el-card>

    <div v-if="ruleForm.inquiry">
      <el-card class="my-3">
        <template #header>Detail Permintaan</template>
        <el-descriptions :column="1" size="large" :label-width="120">
          <el-descriptions-item label="Tanggal">
            {{ formatLocalDate(ruleForm.inquiry?.date!) }}
          </el-descriptions-item>
          <el-descriptions-item label="Diminta Oleh">
            {{ ruleForm.inquiry.request_to?.name ?? "Tidak Ada" }}
          </el-descriptions-item>
          <el-descriptions-item label="PIC">
            {{ ruleForm.inquiry?.request_by?.name ?? "-" }}
          </el-descriptions-item>
        </el-descriptions>
        <el-descriptions title="Alamat">
          <el-descriptions-item label="">{{
            generateResultSearchAddress(ruleForm?.inquiry?.address ?? null)
              .street
          }}</el-descriptions-item>
        </el-descriptions>
        <el-descriptions title="Note">
          <el-descriptions-item label="">{{
            ruleForm.inquiry?.description
          }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>

    <CanvassingAddTableMobile
      v-if="isMobile"
      :expand-row-key="getExpandRowKeys"
      :item_canvassing="item_canvassing"
      :loading="loading"
      :query-search-catalogue="querySearchCatalogue"
      :query-search-unit="querySearchUnit"
      @calculate-selling-price="calculateSellingPrice"
      @on-add-item-r-f-q="() => (dialogItemRequest = true)"
      @on-add-item-vendor="addItemVendor"
      @on-image-modal="(row, index) => openImageModal(index, row)"
      @on-remove-item="removeItem"
      @show-pricetag="showPricetag"
      @on-select-item-complete="onHandleSelectItemAutocompleteItem"
    />

    <el-card class="mb-3" v-else>
      <template #header>
        <div class="card-header">
          <span>Items</span>
          <el-button
            type="primary"
            :icon="Search"
            @click="() => (dialogItemRequest = true)"
            >Cari Item Permintaan</el-button
          >
        </div>
      </template>

      <TrumsDragScrollTable>
        <el-table
          ref="tableRef"
          :data="item_canvassing"
          row-key="index"
          :tree-props="{ children: 'children' }"
          :loading="loading"
          :expand-row-keys="getExpandRowKeys ?? []"
          :row-class-name="tableRowClassName"
          border
        >
          <el-table-column
            label="Actions"
            width="100"
            align="center"
            fixed="left"
          >
            <template #default="scope">
              <div class="flex items-center">
                <el-button
                  type="danger"
                  :icon="Delete"
                  circle
                  @click="removeItem(scope.row)"
                />
                <el-button
                  type="primary"
                  :icon="Plus"
                  v-if="scope.row.type === 'parent'"
                  circle
                  @click="addItemVendor(scope.row)"
                />
              </div>
            </template>
          </el-table-column>

          <el-table-column label="Image" fixed="left" width="70">
            <template #default="scope">
              <ItemImageUpload
                v-model="scope.row.files"
                :image-url="scope.row.image"
                :show-text="false"
                @open-modal="() => openImageModal(scope.$index, scope.row)"
              />
            </template>
          </el-table-column>

          <el-table-column label="Type" width="265">
            <template #default="{ row }">
              <el-select
                v-model="row.type_item"
                v-if="row.type != 'parent'"
                placeholder="Select"
                style="width: 240px"
              >
                <el-option :label="`Subtitution`" :value="'quotation'" />
                <el-option :label="`Equivalent`" :value="'equivalent'" />
                <el-option :label="`AS Requested`" :value="'original'" />
              </el-select>
              <div v-else>Permintaan</div>
            </template>
          </el-table-column>

          <el-table-column
            prop="item_name"
            label="Item"
            width="400"
            fixed="left"
          >
            <template #default="{ row }">
              <div class="flex items-center">
                <el-icon
                  v-if="row.children && row.children.length"
                  class="cursor-pointer mr-2"
                  @click="toggleExpand(row)"
                >
                  <component :is="row._expanded ? ArrowDown : ArrowRight" />
                </el-icon>
                <div v-if="row.type == 'parent' && row.type_item == 'request'">
                  {{ row.catalogue_name }}
                </div>
                <div style="width: 100%" v-else>
                  <el-autocomplete
                    v-if="row.type == 'child'"
                    :disabled="loading"
                    :fetch-suggestions="querySearchCatalogue"
                    v-model="row.catalogue_name"
                    placeholder="Cari item"
                    :trigger-on-focus="false"
                    @select="
                      (item) =>
                        onHandleSelectItemAutocompleteItem(item, row.index, row)
                    "
                  >
                    <template #default="{ item }">
                      <div
                        v-if="item.isNew"
                        class="flex items-center text-blue-500"
                      >
                        <el-icon><Search /></el-icon>
                        <span class="ml-2">Tambahkan "{{ item.value }}"</span>
                      </div>
                      <div v-else class="flex items-center gap-2">
                        <div class="flex-shrink-0 mt-1">
                          <div
                            v-if="item.files && item.files.length > 0"
                            class="w-10 h-10 rounded overflow-hidden border"
                          >
                            <img
                              :src="getFirstFileUrl(item.files)"
                              :alt="item.catalogue_name"
                              class="w-full h-full object-cover"
                            />
                          </div>
                          <div
                            v-else
                            class="w-10 h-10 rounded border flex items-center justify-center text-gray-400"
                          >
                            <el-icon><Picture /></el-icon>
                          </div>
                        </div>
                        <div class="flex flex-col">
                          <div class="flex justify-between items-center">
                            <p style="line-height: 15px" class="font-bold">
                              {{ item.catalogue?.name }}
                            </p>
                            <p class="font-bold">Harga: {{ item.price }}</p>
                          </div>
                          <p>
                            Brand:
                            {{ item.catalogue?.brand?.name ?? "Tidak Ada" }} |
                            Vendor:
                            {{ item.pricetag?.owner?.name ?? "Tidak Ada" }} |
                            Tgl:
                            {{ formatLocalDate(item.pricetag.end_date) }}
                          </p>
                        </div>
                      </div>
                    </template>
                    <template #prepend>
                      <el-button
                        @click="() => showPricetag(row)"
                        :icon="Search"
                      />
                    </template>
                  </el-autocomplete>
                  <el-autocomplete
                    v-else-if="
                      row.type == 'parent' && row.type_item == 'equivalent'
                    "
                    :disabled="loading"
                    :fetch-suggestions="querySearchCatalogueEquivalent"
                    v-model="row.catalogue_name"
                    placeholder="Cari item"
                    :trigger-on-focus="false"
                    @select="
                      (item) =>
                        onHandleSelectItemAutocompleteItemEquivalent(
                          item,
                          row.index,
                          row
                        )
                    "
                  >
                    <template #default="{ item }">
                      <div
                        v-if="item.isNew"
                        class="flex items-center text-blue-500"
                      >
                        <el-icon><Search /></el-icon>
                        <span class="ml-2">Tambahkan "{{ item.value }}"</span>
                      </div>
                      <div v-else>
                        <p style="line-height: 15px" class="font-bold">
                          {{ item.value }}
                        </p>
                        <p v-if="item.type === 'inventory'">
                          PN/SN: {{ item.sn_number ?? "Tidak Ada" }} | Lokasi:
                          {{ item.location_name ?? "Tidak Ada" }} | Available
                          Stok: {{ item.available }}
                        </p>
                        <p v-if="item.type === 'catalogue'">
                          PN/SN: {{ item.sn_number ?? "Tidak Ada" }}
                        </p>
                      </div>
                    </template>
                    <template #prepend>
                      <el-button
                        @click="() => showPricetag(row)"
                        :icon="Search"
                      />
                    </template>
                  </el-autocomplete>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="sn" label="SN/PN" width="150">
            <template #default="{ row }">
              <div v-if="row.type == 'parent' && row.type_item == 'request'">
                {{ row.sn }}
              </div>
              <el-input
                :disabled="true"
                v-else
                v-model="row.sn"
                placeholder="Please Input SN/PN"
              />
            </template>
          </el-table-column>

          <el-table-column prop="qty" label="QTY" width="200">
            <template #default="{ row }">
              <div v-if="row.type == 'parent' && row.type_item == 'request'">
                {{ row.quantity }}
              </div>
              <el-input-number
                v-else
                v-model="row.quantity"
                :min="1"
                @change="calculateSellingPrice(row)"
              />
            </template>
          </el-table-column>

          <el-table-column prop="unit_name" label="UOM" width="100">
            <template #default="{ row }">
              <div v-if="row.type == 'parent' && row.type_item == 'request'">
                {{ row.unit_name }}
              </div>
              <el-autocomplete
                v-else
                :fetch-suggestions="querySearchUnit"
                v-model="row.unit_name"
                placeholder="Input Units"
                :disabled="true"
              />
            </template>
          </el-table-column>

          <el-table-column prop="vendor" label="Vendor" width="200">
            <template #default="{ row }">
              <div v-if="row.type == 'parent'">
                {{ row.vendor_name }}
              </div>
              <div v-else>
                <el-autocomplete
                  v-model="row.vendor_name"
                  :fetch-suggestions="querySearchContact"
                  placeholder="Cari vendor"
                  :disabled="true"
                />
              </div>
            </template>
          </el-table-column>

          <el-table-column label="Harga" width="200">
            <template #default="{ row }">
              <div v-if="row.type === 'child'">
                {{ currency(row.unit_price) }}
              </div>
            </template>
          </el-table-column>

          <el-table-column label="Subtotal" width="200">
            <template #default="{ row }">
              <div v-if="row.type === 'child'">
                {{ currency(row.quantity * row.unit_price) }}
              </div>
            </template>
          </el-table-column>
        </el-table>
      </TrumsDragScrollTable>
    </el-card>

    <ModalRequest
      v-model:visible="visibleModalRequest"
      :search-params="request_search_inquiry"
      :data="inquiry?.data ?? []"
      :total-data="inquiry?.total_data ?? 0"
      @select-request="addToForm"
      @pagination-change="paginationClick"
    />

    <ModalSearchItemExample
      v-model:visible="visibleModalSearchItemExample"
      :search-params="request_search_pricetag_item"
      v-model:keyword-search="request_search_pricetag_item.keyword"
      :data="priceTagItem.data.value?.data ?? []"
      :total-data="priceTagItem?.data.value?.total_data ?? 0"
      :selected-items="itemChecked"
      @on-search="onSearchPricetag"
      @select-items="addToOfferVendor"
      @create-new="
        () => {
          visibleModalPricetagNewItem = true;
          visibleModalSearchItemExample = false;
        }
      "
      @pagination-change="paginationClickPriceTag"
      @pagination-size-change="paginationSizeChange"
      :current-item-name="
        item_canvassing.find((value) => value.index == itemIndex)
          ?.catalogue_name ?? ''
      "
    />

    <ModalContact
      v-model:visible="visibleModalContact"
      :search-params="request_search_contact"
      :data="contacts?.data ?? []"
      :total-data="contacts?.total_data ?? 0"
      @select-contacts="addVendor"
      @pagination-change="paginationClickContact"
    />

    <el-dialog
      v-model="visibleModalPricetagNewItem"
      title="Buat Penawaran Baru"
      width="1200"
    >
      <AddPriceTagComponent @submit="handlePriceTagSubmit" />
    </el-dialog>

    <el-dialog
      v-model="visibleModalNewAdjustment"
      title="Buat Biaya Lain"
      width="1000"
    >
      <AddAdjustment @submit="handleAdjustmentSubmit" />
    </el-dialog>

    <el-dialog
      v-model="showImageModal"
      :title="`Upload Gambar untuk Item ${activeItemIndex + 1}`"
      width="900px"
      :close-on-click-modal="false"
      @close="handleImageModalClose"
    >
      <div class="image-upload-modal">
        <PhotoWallUploads
          ref="photoWallRef"
          v-model="modalImageFiles"
          :action="uploadAction"
          :multiple="true"
          :limit="10"
          :max-size="5"
          accept="image/*"
          @change="handleModalImagesChange"
          @remove="handleRemoveImageList"
        />

        <div v-if="modalImageFiles.length === 0" class="empty-state-modal">
          <el-empty description="Belum ada gambar" :image-size="100">
            <template #description>
              <p>Upload gambar untuk item ini</p>
              <p class="hint">Gambar pertama akan ditampilkan di tabel</p>
            </template>
          </el-empty>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelImageUpload">Batal</el-button>
          <el-button
            type="primary"
            @click="saveItemImages"
            :disabled="modalImageFiles.length === 0"
          >
            Simpan ({{ modalImageFiles.length }} gambar)
          </el-button>
        </span>
      </template>
    </el-dialog>

    <TrumsModalItemRequest
      v-model:visible="dialogItemRequest"
      @selected-submit="addItemRequestToCanvassing"
    />
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import {
  Delete,
  Plus,
  ArrowDown,
  ArrowRight,
  Search,
  Picture,
} from "@element-plus/icons-vue";
import {
  ElButton,
  ElIcon,
  ElInput,
  ElSelect,
  ElOption,
  type FormInstance,
  type FormRules,
  type UploadUserFile,
  type UploadStatus,
} from "element-plus";
import {
  CanvassingStatus,
  CanvassingVendorStatus,
} from "~/types/scm/canvasing";
import type {
  CanvassingForm,
  CanvassingItemForm,
  Canvassing,
} from "~/types/scm/canvasing";
import type { Contact } from "~/types/contact";
import type { Inquiry } from "~/types/inquiry";
import {
  FeeType,
  PartyType,
  ReferenceAdjustment,
  type AdjustmentTransaction,
  type ReferenceTransactionAdjustment,
} from "~/types/attribute_adjustment";
import type { Pricetag_item } from "~/types/pricetag";
import type { ResponsePagination } from "~/types/response_pagination";
import { OrderColumn, type RequestSearch } from "~/types/request_search";

import AddPriceTagComponent from "~/components/trums/AddPriceTagComponent.vue";
import AddAdjustment from "~/components/trums/AddAdjustment.vue";
import TrumsUploadFile from "~/components/trums/form/TrumsUploadFile.vue";
import ModalRequest from "~/components/trums/ModalRequest.vue";
import ModalSearchItemExample from "~/components/trums/ModalSearchItemExample.vue";
import ModalContact from "~/components/trums/ModalContact.vue";
import type { BaseResponse } from "~/types/response";
import type { ItemSearch } from "~/types/item_search";
import type { Catalogue } from "~/types/catalogue";
import type { Unit } from "~/types/unit";
import type { AddressType } from "~/types/address";
import { currency, formatLocalDate, getFirstFileUrl } from "#imports";
import type { ItemRequest } from "~/types/item_request";
import ItemImageUpload from "../inquiry/components/ItemImageUpload.vue";
import PhotoWallUploads from "~/components/trums/PhotoWallUploads.vue";
import CanvassingAddTableMobile from "./components/CanvassingAddTableMobile.vue";

const { labelPosition, formSize } = useFormConfig();
const { isMobile } = useDevice();

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "canvassing-create",
});

const router = useRouter();
const id = computed(() => route.query.id as string);
const route = useRoute();
const inquiry_id = computed(() => route.query.inquiry_id as string);

const ruleFormRef = ref<FormInstance>();
const tableRef = ref();
const loading = ref(false);

const visibleModalSearchItemExample = ref(false);
const visibleModalRequest = ref(false);
const visibleModalPricetagNewItem = ref(false);
const visibleModalNewAdjustment = ref(false);
const visibleModalContact = ref(false);
const dialogItemRequest = ref(false);

const showImageModal = ref(false);
const activeItemIndex = ref(-1);
const activeItemParentIndex = ref(-1);
const activeItemData = ref<CanvassingItemForm | null>(null);
const modalImageFiles = ref<UploadUserFile[]>([]);
const photoWallRef = ref<InstanceType<typeof PhotoWallUploads>>();
const uploadAction = computed(
  () => `${config.public.apiBaseURL}/upload-item-image`
);

const itemChecked = ref<any[]>([]);
const itemIndex = ref<string>("");
const config = useRuntimeConfig();

const fileList = ref<UploadUserFile[]>([]);
const references = ref<ReferenceTransactionAdjustment[]>([]);
const contacts = ref<ResponsePagination<Contact[]>>({
  currentPage: 0,
  data: [],
  success: true,
  total_data: 0,
  total_page: 1,
});

const contactsFee = ref<ReferenceTransactionAdjustment[]>([]);

const feeState = ref<string>("minus");
const ongkirState = ref<string>("minus");
const unitFee = ref<FeeType>(FeeType.PERCENT);

const item_canvassing = ref<CanvassingItemForm[]>([]);

const request_search_inquiry = ref<RequestSearch>({
  column: [
    {
      type: ["sales_inquiry"],
    },
  ],
  keyword: "",
  limit: "10",
  offset: "1",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
  table: "inquiries",
  flag: "form",
});

const request_search_contact = ref<RequestSearch>({
  column: [],
  keyword: "",
  limit: "10",
  offset: "1",
  sort: null,
  table: "contacts",
  flag: "form",
});

const request_search_pricetag_item = ref({
  keyword: "",
  catalogue_id: "",
  location: [],
  contact: [],
  quantity: 1,
  category: ["penawaran"],
  owner_id: "",
  type: "multi" as "single" | "multi",
  offset: 1,
  limit: 10,
  flag: "form",
});

const priceTagItem = await useAsyncData("pricetag-search-items", async () => {
  const res = await useFetchApi<ResponsePagination<Pricetag_item[]>>(
    `/pricetag-item-read`,
    "pricetag-search-items",
    "post",
    request_search_pricetag_item.value
  );
  return res.data.value;
});

const inquiry = ref<ResponsePagination<Inquiry[]>>();

const ruleForm = reactive<CanvassingForm>({
  unique_id: "",
  source_document: "",
  description: "",
  status: CanvassingStatus.CANVASSING,
  canvassing_item: [],
  inquiry: null,
});

const getExpandRowKeys = computed(() => {
  return item_canvassing.value
    .filter((value) => value.children && value.children.length > 0)
    .map((value) => value.index);
});

const generateResultSearchAddress = (address: AddressType | null) => {
  if (address) {
    const name = `(${address.contact_name})`;
    const street = `${address.street}, ${address.village}, ${address.city}, ${address.regency}, ${address.province}`;
    const address_id = address.unique_id;
    const address_version = address.version;
    return {
      value: name,
      name: name,
      street: street,
      address_id: address_id,
      address_version: address.version,
    };
  } else {
    return {
      value: "",
      name: "",
      street: "",
      address_id: "",
      address_version: 0,
    };
  }
};

function findItemByIndex(
  items: CanvassingItemForm[],
  targetIndex: string
): CanvassingItemForm | null {
  for (const item of items) {
    if (item.index === targetIndex) {
      return item;
    }

    if (item.children && item.children.length > 0) {
      const found = findItemByIndex(item.children, targetIndex);
      if (found) return found;
    }
  }
  return null;
}

const goBack = () => router.back();

const addItemRequestToCanvassing = (item: ItemRequest) => {
  item_canvassing.value.push({
    type_item: "request",
    index: `${item_canvassing.value.length + 1}`,
    canvassing_id: null,
    canvaasing_version: null,
    item_request_trail_version: null,
    item_request_trail_id: null,
    unique_id: null,
    vendor_id: null,
    vendor_name: "",
    unit_id: item.unit_id,
    unit_name: item.unit_name,
    unit_version: 1,
    offer_item_id: null,
    offer_item_version: 0,
    catalogue_id: item.catalogue_id ?? "",
    parent_catalogue_id: "",
    catalogue_name: item.catalogue_name ?? "",
    sn: item.sn ?? "N/A",
    quantity: item.request_qty ?? 1,
    unit_price: 0,
    total_price: 0,
    total_selling_price: 0,
    status: CanvassingVendorStatus.SUBMITTED,
    taxes: [],
    editing: null,
    type: "parent",
    children: [],
    selling_price: 0,
    profit: 0,
    profit_unit: "percent",
    fee: 0,
    fee_unit: "percent",
    ongkir: 0,
    ongkir_unit: "percent",
    pricetag_item_id: "",
    pricetag_item_version: 0,
    contacts_fee: contactsFee.value,
    equivalent_id: null,
  });

  dialogItemRequest.value = false;
};

const openImageModal = (index: number, itemData: CanvassingItemForm) => {
  activeItemData.value = itemData;

  if (itemData.type == "child") {
    activeItemParentIndex.value = itemData.parent_index ?? -1;
    const childIndex = item_canvassing.value[
      activeItemParentIndex.value
    ].children.findIndex((child) => child.index === itemData.index);
    activeItemIndex.value = childIndex;
  } else {
    activeItemIndex.value = index;
  }

  if (photoWallRef.value) {
    photoWallRef.value.clearFiles?.();
  }

  modalImageFiles.value = (itemData.files || []).map((file) => {
    const fileCopy = { ...file };
    if (fileCopy.raw && (!fileCopy.url || !fileCopy.url.startsWith("http"))) {
      fileCopy.url = URL.createObjectURL(fileCopy.raw);
    }
    return fileCopy;
  });

  showImageModal.value = true;
};

const cancelImageUpload = () => {
  showImageModal.value = false;
};

const handleImageModalClose = () => {
  modalImageFiles.value.forEach((file) => {
    if (file.url?.startsWith("blob:")) {
      URL.revokeObjectURL(file.url);
    }
  });
  modalImageFiles.value = [];
  activeItemIndex.value = -1;
  activeItemData.value = null;
};

const handleModalImagesChange = (files: UploadUserFile[]) => {
  modalImageFiles.value = files;
};

const saveItemImages = () => {
  if (activeItemIndex.value >= 0) {
    if (activeItemParentIndex.value >= 0) {
      item_canvassing.value[activeItemParentIndex.value].children[
        activeItemIndex.value
      ].files = [...modalImageFiles.value];

      if (modalImageFiles.value.length > 0) {
        const firstFile = modalImageFiles.value[0];
        if (firstFile.url) {
          item_canvassing.value[activeItemParentIndex.value].children[
            activeItemIndex.value
          ].image = firstFile.url;
        } else if (firstFile.raw) {
          item_canvassing.value[activeItemParentIndex.value].children[
            activeItemIndex.value
          ].image = URL.createObjectURL(firstFile.raw);
        }
      } else {
        item_canvassing.value[activeItemParentIndex.value].children[
          activeItemIndex.value
        ].image = "";
      }
    } else {
      item_canvassing.value[activeItemIndex.value].files = [
        ...modalImageFiles.value,
      ];

      if (modalImageFiles.value.length > 0) {
        const firstFile = modalImageFiles.value[0];
        if (firstFile.url) {
          item_canvassing.value[activeItemIndex.value].image = firstFile.url;
        } else if (firstFile.raw) {
          item_canvassing.value[activeItemIndex.value].image =
            URL.createObjectURL(firstFile.raw);
        }
      } else {
        item_canvassing.value[activeItemIndex.value].image = "";
      }
    }

    ElMessage.success(
      `Gambar untuk item ${activeItemIndex.value + 1} disimpan`
    );
  }

  showImageModal.value = false;
};

const handleRemoveImageList = async (
  file: UploadUserFile,
  files: UploadUserFile[]
) => {
  if (!file.raw) {
    try {
      const response = await useApiFetch<BaseResponse<any>>("/file-delete", {
        method: "POST",
        body: [file.uid],
      });

      if (response.success) {
        ElMessage.success(`Image Berhasil Di Hapus!`);
      }
    } catch (error: any) {
      ElMessage.error(`${error?.response?.message ?? error}`);
    }
  }
};

const addItemVendor = (row: CanvassingItemForm) => {
  itemIndex.value = row.index;

  item_canvassing.value.forEach((item, index) => {
    if (item.index == itemIndex.value) {
      const startIndex = item.children.length;
      item.children.push({
        type_item: "original",
        parent_index: index,
        equivalent_id: null,
        index: `${item.index}-${startIndex}`,
        canvassing_id: null,
        canvaasing_version: null,
        item_request_trail_version: null,
        item_request_trail_id: null,
        unique_id: null,
        vendor_id: null,
        vendor_name: "",
        unit_id: "",
        unit_name: "",
        unit_version: 1,
        offer_item_id: null,
        offer_item_version: 0,
        catalogue_id: "0",
        parent_catalogue_id: "",
        catalogue_name: "",
        sn: "N/A",
        quantity: item.quantity,
        unit_price: 0,
        total_price: 0,
        status: CanvassingVendorStatus.SUBMITTED,
        taxes: [],
        editing: null,
        type: "child",
        children: [],
        selling_price: 0,
        total_selling_price: 0,
        profit: 0,
        profit_unit: "percent",
        fee: 0,
        fee_unit: "percent",
        ongkir: 0,
        ongkir_unit: "amount",
        pricetag_item_id: "",
        pricetag_item_version: 0,
        contacts_fee: contactsFee.value,
      });
    }
  });
};

function findParent(
  tree: CanvassingItemForm[],
  index: string
): CanvassingItemForm | null {
  for (const node of tree) {
    let find = findChildIndex(node.children, index);
    if (find >= 0) {
      return node;
    }
  }
  return null;
}

function findChildIndex(tree: CanvassingItemForm[], key: string): number {
  let index = 0;
  for (const node of tree) {
    if (node.index === key) {
      return index;
    }
    index++;
  }
  return -1;
}

const showPricetag = (row: CanvassingItemForm) => {
  const parent = findParent(item_canvassing.value, row.index);
  if (parent != null) {
    request_search_pricetag_item.value.keyword = parent.catalogue_name;
    itemIndex.value = parent.index;
    visibleModalSearchItemExample.value = true;
  }
};

const toggleExpand = (row: any) => {
  row._expanded = !row._expanded;
  const table = tableRef.value as any;
  table.toggleRowExpansion(row, row._expanded);
};

const calculateSellingPrice = (row: CanvassingItemForm) => {
  let basePrice = Number(row.unit_price || 0);
  let profitAmount = Number(row.profit_nominal);
  let feeAmount = Number(row.fee_nominal);
  let ongkir = Number(row.ongkir || 0);

  row.selling_price = basePrice + profitAmount + feeAmount + ongkir;

  if (row.type == "child") {
    const parent = findParent(item_canvassing.value, row.index);
    if (parent) {
      let selling_price = 0;
      parent.children.forEach((element) => {
        if (element.selling_price > selling_price) {
          selling_price = element.selling_price;
        }
      });
      parent.selling_price = selling_price;
      parent.total_price = Number(selling_price) * Number(parent.quantity);
    }
  }
};

const removeItem = async (item: CanvassingItemForm) => {
  if (item.type === "parent") {
    if (item.unique_id) {
      const deleted: boolean = await canvasingItemRemove([item.unique_id]);
      if (deleted) {
        item_canvassing.value = item_canvassing.value.filter(
          (value) => value.index !== item.index
        );
      }
    } else {
      item_canvassing.value = item_canvassing.value.filter(
        (value) => value.index !== item.index
      );
    }
  } else if (item.type === "child") {
    if (item.unique_id) {
      const deleted: boolean = await canvasingItemVendorRemove([
        item.unique_id,
      ]);
      if (deleted) {
        item_canvassing.value.forEach(
          (parent) =>
            (parent.children = parent.children.filter(
              (child) => child.index != item.index
            ))
        );
      }
    } else {
      item_canvassing.value.forEach(
        (parent) =>
          (parent.children = parent.children.filter(
            (child) => child.index != item.index
          ))
      );
    }
  }
};

const canvasingItemRemove = async (ids: string[]): Promise<boolean> => {
  try {
    const response = await useApiFetch<BaseResponse<any>>(
      "/canvassing-item-delete",
      {
        method: "POST",
        body: ids,
      }
    );
    return response.success;
  } catch (error: any) {
    ElMessage.error(`${error?.response?.data?.message ?? error}`);
    return false;
  }
};

const canvasingItemVendorRemove = async (ids: string[]): Promise<boolean> => {
  try {
    const response = await useApiFetch<BaseResponse<any>>(
      "/canvassing-vendor-delete",
      {
        method: "POST",
        body: ids,
      }
    );
    return response.success;
  } catch (error: any) {
    ElMessage.error(`${error?.response?.data?.message ?? error}`);
    return false;
  }
};

const addToForm = async (val: Inquiry) => {
  ruleForm.source_document = val.unique_code;
  ruleForm.inquiry = val;

  val.item_request.forEach(async (item, index) => {
    const tmp: CanvassingItemForm = {
      type_item: "request",
      equivalent_id: null,
      index: `${index}`,
      canvassing_id: null,
      canvaasing_version: null,
      item_request_trail_version: null,
      item_request_trail_id: null,
      unique_id: null,
      vendor_id: null,
      vendor_name: "",
      unit_id: item.unit_id,
      unit_name: item.unit_name,
      unit_version: 1,
      offer_item_id: null,
      offer_item_version: 0,
      catalogue_id: item.catalogue_id ?? "",
      parent_catalogue_id: "",
      catalogue_name: item.catalogue_name ?? "",
      sn: item.sn ?? "N/A",
      quantity: item.request_qty ?? 1,
      unit_price: 0,
      total_price: 0,
      status: CanvassingVendorStatus.SUBMITTED,
      taxes: [],
      editing: null,
      type: "parent",
      children: [],
      selling_price: 0,
      total_selling_price: 0,
      profit: 0,
      profit_unit: "percent",
      fee: 0,
      fee_unit: "percent",
      ongkir: 0,
      ongkir_unit: "percent",
      pricetag_item_id: "",
      pricetag_item_version: 0,
      contacts_fee: contactsFee.value,
    };

    if ((item.catalogue?.files ?? []).length > 0) {
      if (getFirstFileUrl(item.catalogue?.files ?? []) != "") {
        tmp.image = getFirstFileUrl(item.catalogue?.files ?? []);
        tmp.files = mapApiFilesToUpload(item.catalogue?.files ?? []);
      }
    }

    item_canvassing.value.push(tmp);

    nextItemVendorfield(tmp.index);
  });

  visibleModalRequest.value = false;
};

const mapApiFilesToUpload = (files: any[]) => {
  const baseUrl = useRuntimeConfig().public.baseImageURL;
  return files.map((file) => ({
    uid: file.unique_id,
    name: file.filename_original || file.filename,
    url: `${baseUrl}${file.image_path}/${file.filename}`,
    status: "success" as UploadStatus,
  }));
};

const onSearchPricetag = (keyword: string) => {
  request_search_pricetag_item.value.keyword = keyword;
};

const addToOfferVendor = (val: Pricetag_item[]) => {
  const getIndex = item_canvassing.value.findIndex(
    (value) => value.index == itemIndex.value
  );

  let startIndex = 0;

  const parentUnit = item_canvassing.value[getIndex]?.unit_name;

  const itemsWithDifferentUnit = val.filter(
    (item) => item.unit_name !== parentUnit
  );

  if (itemsWithDifferentUnit.length > 0) {
    const differentUnitNames = [
      ...new Set(itemsWithDifferentUnit.map((item) => item.unit_name)),
    ];

    ElMessageBox.confirm(
      `Ada ${
        itemsWithDifferentUnit.length
      } item dengan unit berbeda dari parent:<br>
      <strong>Unit Parent:</strong> ${parentUnit}<br>
      <strong>Unit Berbeda:</strong> ${differentUnitNames.join(", ")}<br><br>
      Tetap tambahkan semua item?`,
      "Konfirmasi Unit Berbeda",
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: "Ya, Tambahkan Semua",
        cancelButtonText: "Pilih Lagi",
        type: "warning",
        center: true,
      }
    )
      .then(() => {
        val.forEach((item: Pricetag_item) => {
          const isUnitDifferent = item.unit_name !== parentUnit;
          addChildItem(item, getIndex, startIndex, isUnitDifferent);
          startIndex++;
        });

        if (itemsWithDifferentUnit.length > 0) {
          ElMessage({
            message: `${val.length} item ditambahkan (${itemsWithDifferentUnit.length} dengan unit berbeda)`,
            type: "warning",
            duration: 3000,
          });
        }
      })
      .catch(() => {
        ElMessage.info("dibatalkan, silakan pilih item lagi.");
        return;
      });
  } else {
    val.forEach((item: Pricetag_item) => {
      addChildItem(item, getIndex, startIndex, false);
      startIndex++;
    });
    ElMessage.success(`${val.length} item berhasil ditambahkan`);
  }

  visibleModalSearchItemExample.value = false;
};

const tableRowClassName = ({ row }: { row: CanvassingItemForm }) => {
  if (row.type === "child" && row.has_different_unit) {
    return "different-unit-row";
  }
  return "";
};

const addChildItem = (
  item: Pricetag_item,
  parentIndex: number,
  childIndex: number,
  hasDifferentUnit: boolean
) => {
  const child: CanvassingItemForm = {
    parent_index: parentIndex,
    index: `${itemIndex.value}-${childIndex}`,
    type_item: "original",
    equivalent_id: null,
    canvassing_id: null,
    canvaasing_version: null,
    item_request_trail_version: null,
    item_request_trail_id: null,
    unique_id: null,
    vendor_id: item.pricetag?.owner?.unique_id ?? "",
    vendor_name: item.pricetag?.owner?.name ?? "",
    unit_id: item.unit_id,
    unit_name: item.unit_name,
    unit_version: null,
    offer_item_id: null,
    offer_item_version: 0,
    catalogue_id: item.catalogue_id ?? "",
    parent_catalogue_id: item_canvassing.value[parentIndex].catalogue_id,
    catalogue_name: item.catalogue?.name ?? "",
    sn: item.catalogue?.sn ?? "",
    quantity: item_canvassing.value[parentIndex].quantity,
    unit_price: item.price,
    total_price: 0,
    status: CanvassingVendorStatus.SUBMITTED,
    taxes: [],
    editing: null,
    type: "child",
    children: [],
    selling_price: 0,
    total_selling_price: 0,
    profit: 0,
    profit_unit: "percent",
    fee: 0,
    fee_unit: "percent",
    ongkir: 0,
    ongkir_unit: "amount",
    pricetag_item_id: item.unique_id ?? "",
    pricetag_item_version: item.version ?? 0,
    contacts_fee: contactsFee.value,
    has_different_unit: hasDifferentUnit,
  };

  if ((item.files ?? []).length > 0) {
    child.image = getFirstFileUrl(item.files ?? []);
    child.files = mapApiFilesToUpload(item.files ?? []);
  }

  const clones = contactsFee.value;
  child.contacts_fee = clones.map((value) => {
    return {
      ...value,
      reference: ReferenceAdjustment.CANVASSINGVENDOR,
      amount: 0,
      type: FeeType.PERCENT,
    };
  });

  if (item_canvassing.value[parentIndex].children[childIndex]) {
    item_canvassing.value[parentIndex].children[childIndex] = child;
  } else {
    item_canvassing.value[parentIndex].children.splice(childIndex, 0, child);
  }
};

const addVendor = (val: Contact[]) => {
  visibleModalContact.value = false;
};

const handleSelectAdjustment = (items: AdjustmentTransaction[]) => {
  items.forEach((element) => {
    references.value.push({
      unique_id: "",
      reference: ReferenceAdjustment.CANVASSING,
      reference_id: "",
      adjustment_id: element.unique_id,
      type: element.type,
      amount: element.default_value,
      created_at: 0,
      value: element.default_value,
      adjustment: element,
      changeType: true,
    });
  });
};

const createNewContact = async (data: any): Promise<Contact | null> => {
  try {
    const response = await useFetchApi<BaseResponse<Contact>>(
      "/contact-create",
      "create-customer",
      "post",
      data
    );
    if (response.status.value == "success") {
      return response.data.value?.data ?? null;
    } else {
      return null;
    }
  } catch (error: any) {
    ElMessage.error(error.response.message ?? error);
    return null;
  }
};

const create_catalogue = async (
  catalogue: Catalogue
): Promise<Catalogue | null> => {
  loading.value = true;
  try {
    const formData = new FormData();

    formData.append("unique_id", catalogue.unique_id ?? "");
    formData.append("name", catalogue.name ?? "");
    formData.append("brand_id", catalogue.brand_id ?? "");
    formData.append("year", catalogue.year ?? "");
    formData.append("sn", catalogue.sn ?? "");
    formData.append("description", catalogue.description ?? "");
    formData.append("berat", (catalogue.berat ?? 0).toString());
    formData.append(
      "volume",
      `${catalogue.length}x${catalogue.width}x${catalogue.height}`
    );
    formData.append(
      "is_asset",
      (catalogue.tmp_asset == "1" ? true : false).toString()
    );
    formData.append("type", catalogue.type);

    const response = await useFetchApi<BaseResponse<Catalogue>>(
      "/catalogues-create",
      "catalogue-create",
      "post",
      formData
    );
    if (response.status.value == "success") {
      const catalogue_result: Catalogue | null =
        response.data.value?.data ?? null;
      return catalogue_result;
    } else {
      return null;
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
    return null;
  } finally {
    loading.value = false;
  }
};

const handleNewUnit = async (data: any): Promise<Unit | null> => {
  try {
    const response = await useFetchApi<BaseResponse<Unit>>(
      "/unit-create",
      "createUnit",
      "post",
      data
    );
    if (response.status.value == "success") {
      return response.data.value?.data ?? null;
    } else {
      return null;
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.message ?? error}`);
    return null;
  }
};

const querySearchUnit = (queryString: string, cb: (arg: any) => void) => {
  var params = { ...request_search_contact.value };
  params.keyword = queryString;
  params.table = "units";
  params.column = [];
  params.flag = "form";
  useFetchApi<ResponsePagination<Unit[]>>(
    "/search",
    "search-unit",
    "post",
    params
  ).then((response) => {
    if (response.status.value == "success") {
      const resultApi: Unit[] = response.data.value?.data ?? [];

      if (resultApi.length > 0) {
        cb(
          resultApi.map((value) => ({
            ...value,
            value: value.name,
            isNew: false,
          }))
        );
      } else {
        cb([
          {
            value: `Tambahkan ${queryString}`,
            label: `${queryString}`,
            isNew: true,
          },
        ]);
      }
    }
  });
};

const querySearchCatalogue = (queryString: string, cb: (arg: any) => void) => {
  if (queryString != "") {
    request_search_pricetag_item.value.keyword = queryString;
    useFetchApi<ResponsePagination<Pricetag_item[]>>(
      `/pricetag-item-read`,
      "pricetag-search-items",
      "post",
      request_search_pricetag_item.value
    ).then((response) => {
      if (response.status.value == "success") {
        const resultApi: Pricetag_item[] = response.data.value?.data ?? [];
        if (resultApi.length > 0) {
          const results = resultApi.map((data: Pricetag_item) => {
            return {
              ...data,
              value: `${data.catalogue?.name} ${
                data.catalogue?.sn ? " - " + data.catalogue?.sn : ""
              }`,
            };
          });
          cb([
            ...results,
            { value: `${queryString}`, label: `${queryString}`, isNew: true },
          ]);
        } else {
          cb([
            { value: `${queryString}`, label: `${queryString}`, isNew: true },
          ]);
        }
      } else {
        cb([
          {
            value: `${queryString}`,
            isNew: true,
            query: queryString,
            label: `Tambahkan ${queryString}`,
          },
        ]);
      }
    });
  }
};

const querySearchCatalogueEquivalent = (
  queryString: string,
  cb: (arg: any) => void
) => {
  useFetchApi<BaseResponse<ItemSearch[]>>(
    "/catalogues-inventory",
    "search-catalogues-inventory",
    "post",
    {
      keyword: queryString,
      limit: 10,
      flag: "form",
    }
  ).then((response) => {
    if (response.status.value == "success") {
      const resultApi: ItemSearch[] = response.data.value?.data ?? [];
      if (resultApi.length > 0) {
        const results = resultApi.map((data: ItemSearch) => {
          return {
            ...data,
            value: `${data.catalogue_name} ${
              data.sn_number ? " - " + data.sn_number : ""
            }`,
          };
        });
        cb([
          ...results,
          {
            value: `${queryString}`,
            label: `Tambahkan ${queryString}`,
            isNew: true,
          },
        ]);
      } else {
        cb([
          {
            value: `${queryString}`,
            label: `Tambahkan ${queryString}`,
            isNew: true,
          },
        ]);
      }
    } else {
      cb([
        {
          value: `Tambahkan ${queryString}`,
          isNew: true,
          query: queryString,
          label: `Tambahkan ${queryString}`,
        },
      ]);
    }
  });
};

const onHandleSelectItemAutocompleteItem = async (
  item: Record<string, any>,
  itemIndex: string,
  row: CanvassingItemForm
) => {
  if (item.isNew) {
    visibleModalPricetagNewItem.value = true;
  } else {
    const selected: Pricetag_item = item as Pricetag_item;

    if (row.type === "parent") {
      item_canvassing.value.forEach((item) => {
        if (item.index == itemIndex) {
          item.catalogue_id = selected.catalogue_id ?? "";
          item.catalogue_name = selected.catalogue?.name ?? "";
          item.sn = selected.catalogue?.sn ?? "";
          item.unit_id = selected.unit_id ?? "";
          item.unit_name = selected.unit_name ?? "";
          item.quantity = 1;
        }
      });
    } else {
      item_canvassing.value.forEach((item) => {
        item.children.forEach((child) => {
          if (child.index == itemIndex) {
            console.log("child index", child.index);
            if (item.unit_id != selected.unit_id) {
              ElMessageBox.confirm(
                `UoM Berbeda Dari Permintaan?`,
                "Konfirmasi Unit Berbeda",
                {
                  confirmButtonText: "Ya, Tambahkan",
                  cancelButtonText: "Pilih Lagi",
                  type: "warning",
                  center: true,
                }
              )
                .then(() => {
                  child.catalogue_id = selected.catalogue_id ?? "";
                  child.catalogue_name = selected.catalogue?.name ?? "";
                  child.sn = selected.catalogue?.sn ?? "";
                  child.unit_id = selected.unit_id ?? "";
                  child.unit_name = selected.unit_name ?? "";
                  child.unit_price = selected.price ?? 0;
                  child.vendor_id = selected.pricetag?.owner?.unique_id ?? "";
                  child.vendor_name = selected.pricetag?.owner?.name ?? "";
                  child.quantity = 1;
                  child.pricetag_item_id = selected.unique_id ?? "";
                  child.pricetag_item_version = selected.version ?? 0;
                })
                .catch(() => {
                  ElMessage.info("Proses dibatalkan, silakan pilih item lagi.");
                  return;
                });
            } else {
              child.catalogue_id = selected.catalogue_id ?? "";
              child.catalogue_name = selected.catalogue?.name ?? "";
              child.sn = selected.catalogue?.sn ?? "";
              child.unit_id = selected.unit_id ?? "";
              child.unit_name = selected.unit_name ?? "";
              child.unit_price = selected.price ?? 0;
              child.vendor_id = selected.pricetag?.owner?.unique_id ?? "";
              child.vendor_name = selected.pricetag?.owner?.name ?? "";
              child.quantity = item.quantity;
              child.pricetag_item_id = selected.unique_id ?? "";
              child.pricetag_item_version = selected.version ?? 0;
            }

            nextItemVendorfield(item.index);
          }
        });
      });
    }
  }
};

const onHandleSelectItemAutocompleteItemEquivalent = async (
  item: Record<string, any>,
  itemIndex: string,
  row: CanvassingItemForm
) => {
  if (item.isNew) {
    const catalogueInsert: Catalogue = {
      name: item.value,
      id: null,
      unique_id: null,
      unique_code: null,
      brand_id: null,
      brand_name: null,
      year: null,
      sn: null,
      description: null,
      berat: null,
      volume: null,
      length: null,
      width: null,
      height: null,
      is_asset: null,
      tmp_asset: null,
      version: null,
      type: "item",
      created_at: null,
      created_by: null,
      updated_at: null,
      file_catalogues: [],
    };
    const selected: Catalogue | null =
      (await create_catalogue(catalogueInsert)) ?? null;

    if (selected != null) {
      item_canvassing.value.forEach((item) => {
        if (item.index == itemIndex) {
          item.catalogue_id = selected.unique_id ?? "";
          item.catalogue_name = selected.name ?? "";
        }
      });
    } else {
      ElMessage.error(`Ops, Something wrong!!`);
    }
  } else {
    const selected: ItemSearch = item as ItemSearch;
    item_canvassing.value.forEach((item) => {
      if (item.index == itemIndex) {
        item.catalogue_id = selected.catalogue_id;
        item.catalogue_name = selected.catalogue_name;
        item.sn = selected.sn_number ?? "";
        item.unit_id = selected.unit_id ?? "";
        item.unit_name = selected.unit_name ?? "";
      }
    });
  }
};

const querySearchContact = (queryString: string, cb: (arg: any) => void) => {
  (request_search_contact.value.keyword = queryString),
    useFetchApi<ResponsePagination<Contact[]>>(
      "/search",
      "search-contact",
      "post",
      request_search_contact.value
    )
      .then((response) => {
        if (response.status.value === "success") {
          const resultApi: Contact[] = response.data.value?.data ?? [];
          if (resultApi.length > 0) {
            const results = resultApi.map((data: Contact) => {
              return { ...data, value: `${data.name}`, isNew: false };
            });
            cb(results);
          } else {
            cb([
              {
                value: `Tambahkan ${queryString}`,
                isNew: true,
                query: queryString,
                label: `Tambahkan ${queryString}`,
              },
            ]);
          }
        }
      })
      .catch((error: any) => {
        ElMessage.error(error.response.data.message);
      });
};

const fetchContact = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<ResponsePagination<Contact[]>>(
      `/search`,
      "contact-search",
      "post",
      request_search_contact.value
    );

    if (response.status.value === "success") {
      contacts.value = response.data.value ?? {
        currentPage: 0,
        data: [],
        success: true,
        total_data: 0,
        total_page: 0,
      };
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.message ?? error}`);
  } finally {
    loading.value = false;
  }
};

const fetchInquiry = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<ResponsePagination<Inquiry[]>>(
      "/search",
      "search-request",
      "post",
      request_search_inquiry.value
    );
    if (response.status.value === "success") {
      inquiry.value = response.data.value!;
    }
  } catch (error: any) {
    ElMessage.error(`${error}`);
  } finally {
    loading.value = false;
  }
};

const fetchDataEdit = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<Canvassing>>(
      `/canvassing-read/${id.value}`,
      "detail-canvassing",
      "get",
      null
    );

    if (response.status.value === "success") {
      const canvasing = response.data.value?.data ?? null;
      const type = route.query.type as string;

      if (canvasing) {
        Object.assign(ruleForm, {
          unique_id: type && type === "copy" ? null : canvasing.unique_id,
          description: canvasing.description,
          status: canvasing.status,
          source_document: canvasing.source_document,
        });

        if (canvasing.source) {
          ruleForm.source_document =
            type && type === "copy" ? null : canvasing.source.unique_code;
          ruleForm.inquiry = type && type === "copy" ? null : canvasing.source;
          canvasing.canvassing_item.forEach((item, index) => {
            if (item.type_item !== "equivalent") {
              item_canvassing.value.push({
                type_item: item.type_item,
                image: "",
                equivalent_id: item.equivalent_id,
                index: `${index}`,
                canvassing_id: null,
                canvaasing_version: null,
                item_request_trail_version: null,
                item_request_trail_id: null,
                unique_id: item.unique_id,
                vendor_id: null,
                vendor_name: "",
                unit_id: item.unit_id,
                unit_name: item.unit_name,
                unit_version: 1,
                offer_item_id: null,
                offer_item_version: 0,
                catalogue_id: item.catalogue_id ?? "",
                parent_catalogue_id: "",
                catalogue_name: item.catalogue_name ?? "",
                sn: item.catalogue?.sn ?? "N/A",
                quantity: item.quantity ?? 1,
                unit_price: 0,
                total_price: 0,
                status: CanvassingVendorStatus.SUBMITTED,
                taxes: [],
                editing: null,
                type: "parent",
                children: item.canvassing_vendor.map((vendor, vIndex) => ({
                  image: "",
                  index: `${index}-${vIndex}`,
                  type_item: vendor.type_item,
                  equivalent_id: null,
                  canvassing_id: null,
                  canvaasing_version: null,
                  item_request_trail_version: null,
                  item_request_trail_id: null,
                  unique_id: vendor.unique_id,
                  vendor_id: vendor.vendor_id ?? "",
                  vendor_name: vendor.vendor?.name ?? "",
                  unit_id: vendor.unit_id,
                  unit_name: vendor.unit_name,
                  unit_version: null,
                  offer_item_id: null,
                  offer_item_version: 0,
                  catalogue_id: vendor.catalogue_id ?? "",
                  parent_catalogue_id: vendor.catalogue_id,
                  catalogue_name: item.catalogue?.name ?? "",
                  sn: vendor.catalogue?.sn ?? "N/A",
                  quantity: vendor.quantity,
                  unit_price: vendor.unit_price,
                  total_price: 0,
                  status: vendor.status,
                  parent_index: index,
                  taxes: [],
                  editing: null,
                  type: "child",
                  children: [],
                  selling_price: 0,
                  total_selling_price: 0,
                  profit: vendor.profit,
                  profit_unit: vendor.profit_unit,
                  fee: vendor.fee,
                  fee_unit: vendor.fee_unit,
                  ongkir: vendor.ongkir,
                  ongkir_unit: vendor.ongkir_unit,
                  pricetag_item_id: vendor.pricetag_item_id ?? "",
                  pricetag_item_version: vendor.pricetag_item_version ?? 0,
                  contacts_fee: [],
                })),
                selling_price: 0,
                total_selling_price: 0,
                profit: 0,
                profit_unit: "percent",
                fee: 0,
                fee_unit: "percent",
                ongkir: 0,
                ongkir_unit: "percent",
                pricetag_item_id: "",
                pricetag_item_version: 0,
                contacts_fee: [],
              });
            }
          });

          const equivalent: CanvassingItemForm[] = [];

          canvasing.canvassing_item.forEach((item, index) => {
            if (item.type_item == "equivalent") {
              equivalent.push({
                type_item: item.type_item,
                equivalent_id: item.equivalent_id,
                index: `${index}`,
                canvassing_id: null,
                canvaasing_version: null,
                item_request_trail_version: null,
                item_request_trail_id: null,
                unique_id: item.unique_id,
                vendor_id: null,
                vendor_name: "",
                unit_id: item.unit_id,
                unit_name: item.unit_name,
                unit_version: 1,
                offer_item_id: null,
                offer_item_version: 0,
                catalogue_id: item.catalogue_id ?? "",
                parent_catalogue_id: "",
                catalogue_name: item.catalogue_name ?? "",
                sn: item.catalogue?.sn ?? "N/A",
                quantity: item.quantity ?? 1,
                unit_price: 0,
                total_price: 0,
                status: CanvassingVendorStatus.SUBMITTED,
                taxes: [],
                editing: null,
                type: "parent",
                children: [],
                selling_price: 0,
                total_selling_price: 0,
                profit: 0,
                profit_unit: "percent",
                fee: 0,
                fee_unit: "percent",
                ongkir: 0,
                ongkir_unit: "percent",
                pricetag_item_id: "",
                pricetag_item_version: 0,
                contacts_fee: [],
              });
            }
          });

          equivalent.forEach((element) => {
            const indexParent = item_canvassing.value.findIndex(
              (data) => data.unique_id === element.equivalent_id
            );
            if (indexParent >= 0) {
              item_canvassing.value.splice(indexParent + 1, 0, element);
            }
          });

          item_canvassing.value = item_canvassing.value.map((item, index) => ({
            ...item,
            children: [
              ...item.children,
              {
                image: "",
                index: `${index}-${item.children.length + 1}`,
                type_item: "original",
                equivalent_id: null,
                canvassing_id: null,
                canvaasing_version: null,
                item_request_trail_version: null,
                item_request_trail_id: null,
                unique_id: "",
                vendor_id: "",
                vendor_name: "",
                unit_id: "",
                unit_name: "",
                unit_version: null,
                offer_item_id: null,
                offer_item_version: 0,
                catalogue_id: "",
                parent_catalogue_id: "",
                catalogue_name: "",
                sn: "N/A",
                quantity: item.quantity,
                unit_price: 0,
                total_price: 0,
                status: CanvassingVendorStatus.SUBMITTED,
                parent_index: index,
                taxes: [],
                editing: null,
                type: "child",
                children: [],
                selling_price: 0,
                total_selling_price: 0,
                profit: 0,
                profit_unit: "amount",
                fee: 0,
                fee_unit: "amount",
                ongkir: 0,
                ongkir_unit: "amount",
                pricetag_item_id: "",
                pricetag_item_version: 0,
                contacts_fee: [],
              },
            ],
          }));
        }
      }
    }
  } catch (error: any) {
    ElMessage.error(error);
  } finally {
    loading.value = false;
  }
};

const nextItemVendorfield = (parent_index: string) => {
  item_canvassing.value.forEach((item, parentIndex) => {
    if (item.index == parent_index) {
      item_canvassing.value[parentIndex].children.push({
        image: "",
        index: `${parentIndex}-${item.children.length + 1}`,
        type_item: "original",
        equivalent_id: null,
        canvassing_id: null,
        canvaasing_version: null,
        item_request_trail_version: null,
        item_request_trail_id: null,
        unique_id: "",
        vendor_id: "",
        vendor_name: "",
        unit_id: "",
        unit_name: "",
        unit_version: null,
        offer_item_id: null,
        offer_item_version: 0,
        catalogue_id: "",
        parent_catalogue_id: "",
        catalogue_name: "",
        sn: "N/A",
        quantity: item.quantity,
        unit_price: 0,
        total_price: 0,
        status: CanvassingVendorStatus.SUBMITTED,
        parent_index: parentIndex,
        taxes: [],
        editing: null,
        type: "child",
        children: [],
        selling_price: 0,
        total_selling_price: 0,
        profit: 0,
        profit_unit: "percent",
        fee: 0,
        fee_unit: "percent",
        ongkir: 0,
        ongkir_unit: "percent",
        pricetag_item_id: "",
        pricetag_item_version: 0,
        contacts_fee: [],
      });
    }
  });
};

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        await submit(formEl);
      } catch (error) {
        ElMessage.error("Failed to create canvassing");
        console.error(error);
      } finally {
        loading.value = false;
      }
    }
  });
};

const submit = async (formEl: FormInstance | undefined) => {
  loading.value = true;
  try {
    const formData = new FormData();

    formData.append("unique_id", ruleForm.unique_id || "");
    formData.append("source_document", ruleForm.source_document || "");
    formData.append("description", ruleForm.description || "");
    formData.append("status", ruleForm.status || "");

    item_canvassing.value.forEach((item: CanvassingItemForm, i: number) => {
      formData.append(`canvassing_items[${i}][unique_id]`, `${item.unique_id}`);
      formData.append(
        `canvassing_items[${i}][canvassing_id]`,
        `${ruleForm.unique_id}`
      );
      formData.append(`canvassing_items[${i}][quantity]`, `${item.quantity}`);
      formData.append(
        `canvassing_items[${i}][catalogue_id]`,
        `${item.catalogue_id}`
      );
      formData.append(
        `canvassing_items[${i}][catalogue_name]`,
        `${item.catalogue_name}`
      );
      formData.append(`canvassing_items[${i}][unit_id]`, `${item.unit_id}`);
      formData.append(`canvassing_items[${i}][unit_name]`, `${item.unit_name}`);
      formData.append(
        `canvassing_items[${i}][unit_selling_price]`,
        `${item.selling_price}`
      );
      formData.append(`canvassing_items[${i}][type_item]`, `${item.type_item}`);
      formData.append(
        `canvassing_items[${i}][equivalent_id]`,
        `${item.equivalent_id}`
      );

      item.children.forEach((vendor: CanvassingItemForm, j: any) => {
        if (vendor.catalogue_id == "") {
          return;
        }

        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][unique_id]`,
          `${vendor.unique_id}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][pricetag_item_id]`,
          `${vendor.pricetag_item_id}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][pricetag_item_version]`,
          `${vendor.pricetag_item_version}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][vendor_id]`,
          `${vendor.vendor_id}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][canvassing_item_id]`,
          `${item.unique_id}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][catalogue_id]`,
          `${vendor.catalogue_id}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][catalogue_name]`,
          `${vendor.catalogue_name}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][type_item]`,
          `${vendor.type_item}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][equivalent_id]`,
          `${vendor.equivalent_id}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][quantity]`,
          `${vendor.quantity}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][unit_price]`,
          `${vendor.unit_price}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][selling_price]`,
          `${vendor.selling_price}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][unit_id]`,
          `${vendor.unit_id}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][unit_name]`,
          `${vendor.unit_name}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][total_price]`,
          `${Number(vendor.quantity) * Number(vendor.unit_price)}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][profit]`,
          `${0}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][profit_unit]`,
          `${vendor.profit_unit}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][fee]`,
          `${0}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][fee_unit]`,
          `${vendor.fee_unit}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][ongkir]`,
          `${0}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][ongkir_unit]`,
          `${vendor.ongkir_unit}`
        );
      });
    });

    fileList.value.forEach((element, index) => {
      formData.append(`files[${index}]`, element.raw as Blob);
    });

    const response = await useFetchApi<BaseResponse<Canvassing>>(
      "/canvassing-create",
      "create-canvasing",
      "post",
      formData
    );
    if (response.status.value === "success") {
      ElMessage.success(`Berhasil Membuat Data Canvasing!`);
      formEl?.resetFields();
      resetFormState();
      router.push(`/sales/canvassing/${response.data.value?.data?.unique_id}`);
    }
  } catch (error: any) {
    ElMessage.error(error.response?.message ?? error);
  } finally {
    loading.value = false;
  }
};

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  resetFormState();
};

const resetFormState = () => {
  references.value = [];
  fileList.value = [];
};

const handlePriceTagSubmit = () => {
  visibleModalPricetagNewItem.value = false;
  visibleModalSearchItemExample.value = true;
  refreshNuxtData("pricetag-search-items");
};

const handleAdjustmentSubmit = () => {
  visibleModalNewAdjustment.value = false;
  refreshNuxtData("search-adjustment");
};

const paginationClick = (val: number) => {
  request_search_inquiry.value.offset = val.toString();
};

const paginationClickPriceTag = (val: number) => {
  request_search_pricetag_item.value.offset = val;
};

const paginationSizeChange = (val: number) => {
  request_search_pricetag_item.value.limit = val;
};

const paginationClickContact = (val: number) => {
  request_search_contact.value.offset = val.toString();
};

const validateChildren = (
  _rule: any,
  value: any[],
  callback: (error?: Error) => void
) => {
  if (!value || value.length < 1) {
    callback(new Error("Minimal harus ada 1 children"));
  } else {
    callback();
  }
};

const rules: FormRules = {
  source_document: [
    { required: true, message: "Nomor referensi wajib diisi", trigger: "blur" },
  ],
  status: [
    { required: true, message: "Status wajib dipilih", trigger: "change" },
  ],
  canvassing_item: [{ validator: validateChildren, trigger: "change" }],
};

watchDebounced(request_search_inquiry.value, () => fetchInquiry(), {
  debounce: 500,
});

watchDebounced(request_search_contact.value, () => fetchContact(), {
  debounce: 500,
});

watch(
  () => request_search_pricetag_item.value,
  () => {
    refreshPricetagItem();
  },
  {
    deep: true,
  }
);

const refreshPricetagItem = () => priceTagItem.refresh();

const fetchInquiryDetail = async () => {
  loading.value = true;
  try {
    const inquiry = await useFetchApi<BaseResponse<Inquiry>>(
      `/inquiries-read/${inquiry_id.value}`,
      "inquiry",
      "get",
      null
    );

    if (inquiry.status.value === "success") {
      if (inquiry.data.value?.data) {
        addToForm(inquiry.data.value!.data);
      }
    }
  } catch (error) {
    console.error("Failed to fetch related data", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (id.value) {
    fetchDataEdit();
  }

  if (inquiry_id.value) {
    fetchInquiryDetail();
  }

  fetchInquiry();
  fetchContact();
});
</script>

<style scoped>
:deep(.el-table__placeholder),
:deep(.el-table__indent),
:deep(.el-table__expand-icon--expanded),
:deep(.el-table__expand-icon) {
  display: none !important;
}

:deep(.avatar-uploader) {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 75px;
  height: 75px;
}

:deep(.image-preview-container) {
  width: 45px;
  height: 45px;
}

:deep(.avatar-uploader .avatar-uploader-icon) {
  width: 50px;
  height: 50px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-table__cell .cell {
  display: flex;
  align-items: center;
}

:deep(.different-unit-row:last-child td) {
  border-bottom: 3px solid #f56c6c !important;
}

:deep(.el-upload--text) {
  width: 100% !important;
}
</style>
