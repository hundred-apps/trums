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
        status-icon
      >
        <el-form-item label="Nomor Referensi" prop="source_document">
          <div class="flex gap-2">
            <el-input
              v-model="ruleForm.source_document"
              :readonly="true"
              placeholder="Masukkan nomor referensi"
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

        <el-form-item label="Deskripsi" prop="description">
          <el-input
            v-model="ruleForm.description"
            type="textarea"
            placeholder="Masukkan deskripsi"
          />
        </el-form-item>

        <el-form-item label="File Lampiran" prop="files">
          <TrumsUploadFile v-model:file-list="fileList" />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Detail Permintaan -->
    <div v-if="ruleForm.inquiry">
      <el-card class="my-3">
        <template #header>Detail Permintaan</template>
        <div class="flex gap-3 my-3">
          <div class="flex-1">
            <el-descriptions :column="1" size="large" border>
              <el-descriptions-item label="Prioritas Permintaan">
                {{ ruleForm.inquiry?.priority?.toUpperCase() }}
              </el-descriptions-item>
              <el-descriptions-item label="Tanggal Permintaan">
                {{ formatLocalDate(ruleForm.inquiry?.date!) }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
          <div class="flex-1">
            <el-descriptions :column="1" size="large" border>
              <el-descriptions-item label="Ditujukan Untuk">
                {{ ruleForm.inquiry.request_to?.name ?? "Tidak Ada" }}
              </el-descriptions-item>
              <el-descriptions-item label="Diminta Oleh">
                {{ ruleForm.inquiry?.request_by?.name ?? "-" }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
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

    <!-- Items Section -->
    <el-card class="mb-3">
      <template #header>
        <div class="card-header"><span>Items</span></div>
      </template>

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

        <el-table-column label="Image" fixed="left" width="100">
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
            </el-select>
            <div v-else>Permintaan</div>
          </template>
        </el-table-column>

        <el-table-column prop="item_name" label="Item" width="400" fixed="left">
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
                  :trigger-on-focus="true"
                  @select="(item: Record<string, any>) => onHandleSelectItemAutocompleteItem(item, row.index, row)"
                >
                  <template #default="{ item }">
                    <div
                      v-if="item.isNew"
                      class="flex items-center text-blue-500"
                    >
                      <el-icon><Plus /></el-icon>
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
                      <div class="flex flex-col ">
                        <div class="flex justify-between items-center">
                          <p style="line-height: 15px" class="font-bold">
                            {{ item.catalogue?.name }}
                          </p>
                          <p class="font-bold">Harga: {{ item.price }}</p>
                        </div>
                        <p>
                          PN/SN: {{ item.catalogue?.sn ?? "Tidak Ada" }} | Vendor:
                          {{ item.pricetag?.owner?.name ?? "Tidak Ada" }} | Tgl:
                          {{ formatLocalDate(item.pricetag.end_date) }}
                        </p>
                      </div>
                    </div>
                  </template>
                  <template #prepend>
                    <el-button @click="() => showPricetag(row)" :icon="Plus" />
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
                  @select="(item: Record<string, any>) => onHandleSelectItemAutocompleteItemEquivalent(item, row.index, row)"
                >
                  <template #default="{ item }">
                    <div
                      v-if="item.isNew"
                      class="flex items-center text-blue-500"
                    >
                      <el-icon><Plus /></el-icon>
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
              :disabled="true"
              v-else
              v-model="row.quantity"
              :min="1"
              @change="calculateSellingPrice(row)"
              @input="calculateSellingPrice(row)"
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
              @select="(item: Record<string, any>) => handleSelectUnit(item, row.index, row)"
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
                @select="(item) => onHandleSelectVendor(item, row.index)"
                style="width: 100%"
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
      :data="priceTagItem.data?.value?.data ?? []"
      :total-data="priceTagItem.data.value?.total_data ?? 0"
      :selected-items="itemChecked"
      
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
      width="1000"
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

    <FeeDrawer
      v-model="drawerFeeVisible"
      :item="selectedItem"
      :contacts="contactsFeeToEdit"
      :adjustment="adjustmentContact!"
      @save="handleSaveFee"
    />

    <el-dialog
      v-model="showImageModal"
      :title="`Upload Gambar untuk Item ${activeItemIndex + 1}`"
      width="900px"
      :close-on-click-modal="false"
      @close="handleImageModalClose"
    >
      <div class="image-upload-modal">
        <!-- Photo Wall Upload -->
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
        
        <!-- Preview Section -->
        <div v-if="modalImageFiles.length > 0" class="preview-section">
          
          
        </div>
        
        <!-- Empty State -->
        <div v-else class="empty-state-modal">
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
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import {
  Delete,
  Plus,
  ArrowDown,
  ArrowRight,
  Operation,
  Search,
  Picture
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
  type UploadProps,
  type UploadFile,
  type UploadStatus,
} from "element-plus";
import {
  CanvassingStatus,
  CanvassingVendorStatus,
} from "~/types/scm/canvasing";
import type {
  CanvassingForm,
  QuotationItemInterface,
  QuatotationVendorEquivalent,
  QuotationVendor,
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

// Components
import AddPriceTagComponent from "~/components/trums/AddPriceTagComponent.vue";
import AddAdjustment from "~/components/trums/AddAdjustment.vue";
import TrumsUploadFile from "~/components/trums/form/TrumsUploadFile.vue";
import ModalAdjustmentTransaction from "~/components/trums/ModalAdjustmentTransaction.vue";
import ModalRequest from "~/components/trums/ModalRequest.vue";
import ModalSearchItemExample from "~/components/trums/ModalSearchItemExample.vue";
import ModalContact from "~/components/trums/ModalContact.vue";
import type { BaseResponse } from "~/types/response";
import FeeDrawer from "~/components/trums/FeeDrawer.vue";
import type { ItemSearch } from "~/types/item_search";
import type { Pagination } from "~/types/pagination";
import type { Catalogue } from "~/types/catalogue";
import type { Unit } from "~/types/unit";
import type { AddressType } from "~/types/address";
import { currency, formatLocalDate, getFirstFileUrl } from "#imports";
import type { ItemRequest } from "~/types/item_request";
import { urlToFile } from "#imports";
import type { AppFile } from "~/types/file";
import ItemImageUpload from "../inquiry/components/ItemImageUpload.vue";
import PhotoWallUploads from "~/components/trums/PhotoWallUploads.vue";

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "canvassing-create",
});

const router = useRouter();
const id = computed(() => route.query.id as string);
const route = useRoute();
const inquiry_id = computed(() => route.query.inquiry_id as string);

// Refs
const ruleFormRef = ref<FormInstance>();
const tableRef = ref();
const loading = ref(false);

// Modal States
const visibleModalSearchItemExample = ref(false);
const visibleModalRequest = ref(false);
const visibleModalAdjustmentTransaction = ref(false);
const visibleModalPricetagNewItem = ref(false);
const visibleModalNewAdjustment = ref(false);
const visibleModalContact = ref(false);
const drawerFeeVisible = ref(false);

// image
const showImageModal = ref(false)
const activeItemIndex = ref(-1)
const activeItemParentIndex = ref(-1);
const activeItemData = ref<CanvassingItemForm | null>(null)
const modalImageFiles = ref<UploadUserFile[]>([])
const photoWallRef = ref<InstanceType<typeof PhotoWallUploads>>()
const uploadAction = computed(() => `${config.public.apiBaseURL}/upload-item-image`)

// Index References
const itemStartIndex = ref<string>("");
const itemChecked = ref<any[]>([]);
const itemIndex = ref<string>("");
const selectedItem = ref<{ index: string; name: string; vendor_name: string }>({
  index: "",
  name: "",
  vendor_name: "",
});
const config = useRuntimeConfig();
const imageUrl = config.public.baseImageURL;

// Data
const fileList = ref<UploadUserFile[]>([]);
const references = ref<ReferenceTransactionAdjustment[]>([]);
const quotationItems = ref<QuotationItemInterface[]>([]);
const contacts = ref<ResponsePagination<Contact[]>>({
  currentPage: 0,
  data: [],
  success: true,
  total_data: 0,
  total_page: 1,
});

// Bulk input data
const bulkProfit = ref("");
const bulkProfitUnit = ref("percent");
const bulkFee = ref("");
const bulkFeeUnit = ref("percent");
const bulkOngkir = ref("");

// Computed untuk check apakah ada input bulk
const hasBulkInput = computed(() => {
  return (
    bulkProfit.value !== "" || bulkFee.value !== "" || bulkOngkir.value !== ""
  );
});

const feeState = ref<string>("minus");
const ongkirState = ref<string>("minus");
const unitFee = ref<FeeType>(FeeType.PERCENT);

const item_canvassing = ref<CanvassingItemForm[]>([]);

const hasInquirySelected = computed(() => !!ruleForm.inquiry);

// Search Parameters
const request_search_inquiry = ref<RequestSearch>({
  column: [],
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

// API Calls
const priceTagItem = await useFetchApi<ResponsePagination<Pricetag_item[]>>(
  `/pricetag-item-read`,
  "pricetag-search-items",
  "post",
  request_search_pricetag_item.value
);

const inquiry = ref<ResponsePagination<Inquiry[]>>();
const querySearchAdjustmentTransaction = ref<RequestSearch>({
  keyword: "",
  table: "adjustments_transaction",
  column: [],
  sort: null,
  limit: "10",
  offset: "1",
  flag: "form",
});

const adjustmentTransactions = await useFetchApi<
  ResponsePagination<AdjustmentTransaction[]>
>("/search", "search-adjustment", "post", querySearchAdjustmentTransaction);

const adjustmentContact = computed(() => {
  const data = adjustmentTransactions.data.value?.data || [];
  return data.find(
    (value: AdjustmentTransaction) =>
      value.name?.toLowerCase().includes("fee") &&
      value.operator === feeState.value
  );
});
const adjustmentOngkir = computed(() => {
  const data = adjustmentTransactions.data.value?.data || [];

  return data.find(
    (value: AdjustmentTransaction) =>
      value.name?.toLowerCase().includes("ongkos kirim") &&
      value.operator === ongkirState.value
  );
});

const getExpandRowKeys = computed(() => {
  const rowKeys = item_canvassing.value
    .filter((value) => value.children && value.children.length > 0)
    .map((value) => value.index);

  console.log("row keys", rowKeys);
  return rowKeys;
});

const adjustmentTransactionFeeTotal = computed(() => {
  return {
    unique_id: "",
    reference: ReferenceAdjustment.CANVASSING,
    reference_id: "",
    adjustment_id: `${adjustmentContact.value?.unique_id}`,
    adjustment: adjustmentContact.value,
    value: null,
    type: unitFee.value,
    amount: contactsFee.value.reduce(
      (sum, c) => Number(sum) + Number(c.amount || 0),
      0
    ),
    created_at: 0,
  };
});

const openImageModal = (index: number, itemData: CanvassingItemForm) => {
  console.log('item data', itemData);
  activeItemData.value = itemData;


  if(itemData.type == "child"){
    activeItemParentIndex.value = parseInt(itemData.parent_index ?? '-1');
    console.log()
    const childIndex = item_canvassing.value[activeItemParentIndex.value].children.findIndex((child) => child.index === itemData.index);
    activeItemIndex.value = childIndex
  }else{
    activeItemIndex.value = index
    
  }
  
  // Reset photoWallRef jika perlu (clear selection)
  if (photoWallRef.value) {
    photoWallRef.value.clearFiles?.()
  }
  
  // Load files dengan memastikan URL valid
  modalImageFiles.value = (itemData.files || []).map(file => {
    // Clone file object
    const fileCopy = { ...file }
    
    // Jika file punya raw tapi URL invalid/expired, buat URL baru
    if (fileCopy.raw && (!fileCopy.url || !isValidUrl(fileCopy.url))) {
      fileCopy.url = URL.createObjectURL(fileCopy.raw)
    }
    
    return fileCopy
  })

  console.log('modal file ', modalImageFiles.value);
  
  showImageModal.value = true
}

const cancelImageUpload = () => {
  showImageModal.value = false
}

const handleImageModalClose = () => {
  // Optional: Clear temporary blob URLs
  modalImageFiles.value.forEach(file => {
    if (file.url?.startsWith('blob:')) {
      URL.revokeObjectURL(file.url)
    }
  })
  modalImageFiles.value = []
  activeItemIndex.value = -1
  activeItemData.value = null
}

const handleModalImagesChange = (files: UploadUserFile[]) => {
  console.log('images', files);
  modalImageFiles.value = files
}

// Fungsi untuk menyimpan gambar
const saveItemImages = () => {
  if (activeItemIndex.value >= 0) {

    if(activeItemParentIndex.value >= 0){
      console.log('activeItemParentIndex', activeItemParentIndex.value);
      console.log('activeItemIndex', activeItemIndex.value);
      item_canvassing.value[activeItemParentIndex.value].children[activeItemIndex.value].files = [...modalImageFiles.value];

      // Set image URL untuk preview di tabel (mengambil gambar pertama)
      if (modalImageFiles.value.length > 0) {
        const firstFile = modalImageFiles.value[0]
        if (firstFile.url) {
          item_canvassing.value[activeItemParentIndex.value].children[activeItemIndex.value].image = firstFile.url
        } else if (firstFile.raw) {
          item_canvassing.value[activeItemParentIndex.value].children[activeItemIndex.value].image = URL.createObjectURL(firstFile.raw)
        }
      } else {
        item_canvassing.value[activeItemParentIndex.value].children[activeItemIndex.value].image = ''
      }
    }else{
      // Update dataTable dengan files baru
      item_canvassing.value[activeItemIndex.value].files = [...modalImageFiles.value]
      
      // Set image URL untuk preview di tabel (mengambil gambar pertama)
      if (modalImageFiles.value.length > 0) {
        const firstFile = modalImageFiles.value[0]
        if (firstFile.url) {
          item_canvassing.value[activeItemIndex.value].image = firstFile.url
        } else if (firstFile.raw) {
          item_canvassing.value[activeItemIndex.value].image = URL.createObjectURL(firstFile.raw)
        }
      } else {
        item_canvassing.value[activeItemIndex.value].image = ''
      }
    }


    
    
    ElMessage.success(`Gambar untuk item ${activeItemIndex.value + 1} disimpan`)
  }
  
  showImageModal.value = false
}

const handleRemoveImageList = async (file: UploadUserFile, files: UploadUserFile[]) => {
  if(file.raw){
    console.log('file baru upload');
  }else{
    console.log('file lama', file.uid);
    try {
      const response = await useApiFetch<BaseResponse<any>>('/file-delete', {
        method: 'POST',
        body: [file.uid]
      })

      if(response.success){
        ElMessage.success(`Image Berhasil Di Hapus!`);
      }
    } catch (error: any) {
      ElMessage.error(`${error?.response?.message ?? error}`);
    }
  }
}

const isValidUrl = (urlString: string): boolean => {
  console.log('url string', urlString);
  if (!urlString.startsWith('blob:')) return true // Non-blob URLs valid
  
  try {
    // Coba fetch URL untuk test validity
    fetch(urlString, { method: 'HEAD', mode: 'no-cors' })
    return true
  } catch {
    return false
  } finally {
    return false;
  }
}

const adjustmentTransactionOngkirTotal = ref<ReferenceTransactionAdjustment>({
  unique_id: "",
  reference: ReferenceAdjustment.CANVASSING,
  reference_id: "",
  adjustment_id: `${adjustmentOngkir.value?.unique_id}`,
  adjustment: adjustmentOngkir.value,
  value: null,
  type: FeeType.AMOUNT,
  amount: 0,
  created_at: 0,
  changeType: false,
});

const updateAllFeeType = () => {
  contactsFee.value.map((value) => (value.type = unitFee.value));

  item_canvassing.value.forEach((element) => {
    element.fee_unit = unitFee.value;
    element.children.map((value) => (value.fee_unit = unitFee.value));
  });
};

// const updateFeeTypeItem = (items: CanvassingItemForm[], feeType: FeeType) => {
//   for (const it of items) {
//     if (it.index === index) {
//       if(contactsFee){
//         it.fee = contactsFee.reduce((sum, c) => sum + (c.fee || 0), 0);
//       }else{
//         it.fee = fee ?? 0;
//       }
//       // it.contactsFee = contactsFee
//       return true
//     }
//     if (it.children && updateItemFee(it.children, index, contactsFee)) {
//       return true
//     }
//   }
//   return false
// }

const contactsFee = ref<ReferenceTransactionAdjustment[]>([]);
const contactsFeeToEdit = ref<ReferenceTransactionAdjustment[]>([]);
// Form Data
const ruleForm = reactive<CanvassingForm>({
  unique_id: "",
  source_document: "",
  description: "",
  status: CanvassingStatus.CANVASSING,
  canvassing_item: [],
  inquiry: null,
});

// Constants
const canvassingStatusOptions = [
  { value: CanvassingStatus.DRAFT, label: "Draft" },
  { value: CanvassingStatus.PENDING_APPROVAL, label: "Pending Approval" },
  { value: CanvassingStatus.CANCEL, label: "Cancel" },
];

const netProfitForBuying = computed(() => {
  let fee = 0;

  if (adjustmentTransactionFeeTotal.value.type == FeeType.AMOUNT) {
    fee = adjustmentTransactionFeeTotal.value.amount;
  } else if (adjustmentTransactionFeeTotal.value.type == FeeType.PERCENT) {
    fee = (grandTotal.value * adjustmentTransactionFeeTotal.value.amount) / 100;
  }

  return Number(totalForGrossProfitForBuying.value || 0) - Number(fee || 0);
});
const netProfitForBuyingMin = computed(() => {
  let fee = 0;

  if (adjustmentTransactionFeeTotal.value.type == FeeType.AMOUNT) {
    fee = adjustmentTransactionFeeTotal.value.amount;
  } else if (adjustmentTransactionFeeTotal.value.type == FeeType.PERCENT) {
    fee = (grandTotal.value * adjustmentTransactionFeeTotal.value.amount) / 100;
  }
  return Number(totalForGrossProfitForBuyingMin.value || 0) - Number(fee || 0);
});
const grossProfitMin = computed(() => {
  return Number(grandTotal.value) - Number(totalBuyingPriceMin.value);
});
const grossProfit = computed(() => {
  return Number(grandTotal.value) - Number(totalBuyingPrice.value);
});

const totalForGrossProfitForBuying = computed(() => {
  let gross = Number(grossProfit.value);

  gross -= Number(adjustmentTransactionOngkirTotal.value.amount);

  references.value.forEach((element) => {
    if (element.type === FeeType.PERCENT) {
      gross -= (element.amount / totalBuyingPrice.value) * 100;
    } else {
      gross -= element.amount;
    }
  });

  return gross;
});
const totalForGrossProfitForBuyingMin = computed(() => {
  let gross = Number(grossProfitMin.value);

  gross -= Number(adjustmentTransactionOngkirTotal.value.amount);

  references.value.forEach((element) => {
    if (element.type === FeeType.PERCENT) {
      gross -= (element.amount / totalBuyingPriceMin.value) * 100;
    } else {
      gross -= element.amount;
    }
  });

  return gross;
});

const totalBuyingPrice = computed(() => {
  let total = 0;
  item_canvassing.value.forEach((element) => {
    console.log("total", total);
    if (element.children.length > 0) {
      let dataMin = element.children.reduce((max, data) =>
        data.unit_price < max.unit_price ? data : max
      );
      console.log(
        "min price",
        Number(dataMin.unit_price) * Number(element.quantity)
      );
      total += Number(dataMin.unit_price) * Number(element.quantity);
    }
  });

  return total;
});
const totalBuyingPriceMin = computed(() => {
  let total = 0;

  item_canvassing.value.forEach((element) => {
    console.log("total Min", total);
    if (element.children.length > 0) {
      let dataMin = element.children.reduce((max, data) =>
        data.unit_price > max.unit_price ? data : max
      );
      console.log(
        "data Min",
        Number(dataMin.unit_price) * Number(element.quantity)
      );
      total += Number(dataMin.unit_price) * Number(element.quantity);
    }
  });

  return total;
});

const grandTotal = computed(() => {
  return item_canvassing.value.reduce((acc, row: CanvassingItemForm) => {
    if (row.type === "parent") {
      acc += Number(row.total_price || 0);
    }

    return acc;
  }, 0);
});

const finalTotal = computed(() => {
  let total = Number(grandTotal.value || 0);

  references.value.forEach((ref) => {
    let adjustmentValue = 0;

    if (ref.type === "percent") {
      adjustmentValue = total * (ref.amount / 100);
    } else {
      adjustmentValue = ref.amount;
    }

    if (ref.adjustment?.operator === "minus") {
      total -= Number(adjustmentValue);
    } else if (ref.adjustment?.operator === "plus") {
      total += Number(adjustmentValue);
    }
  });

  let fee = 0;

  if (adjustmentTransactionFeeTotal.value.type === FeeType.PERCENT) {
    fee = total * (adjustmentTransactionFeeTotal.value.amount / 100);
  } else {
    fee = adjustmentTransactionFeeTotal.value.amount;
  }
  if (adjustmentTransactionFeeTotal.value.adjustment?.operator === "minus") {
    total -= Number(fee);
  } else if (
    adjustmentTransactionFeeTotal.value.adjustment?.operator === "plus"
  ) {
    total += Number(fee);
  }

  // total -= transaction

  return total;
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

const onInputAdjustment = (row: ReferenceTransactionAdjustment) => {
  if (row.adjustment?.name.toLowerCase() == "ongkos kirim") {
    ongChangeGlobalDeliveryFee();
  }
};

const ongChangeGlobalDeliveryFee = () => {
  item_canvassing.value.forEach((element) => {
    element.children.forEach((child) => {
      child.ongkir = 0;
    });

    setProfit(element);
  });
};

const onChangeFeeState = (val: string) => {
  contactsFee.value.forEach((value) => {
    value.amount = 0;
    value.type = val == "plus" ? FeeType.AMOUNT : FeeType.PERCENT;
  });

  item_canvassing.value.forEach((value) => {
    value.children.forEach((child) => {
      child.contacts_fee.forEach((fee) => (fee.amount = 0));
      calculateSellingPrice(child);
      child.fee = 0;
    });

    value.fee = 0;
  });

  unitFee.value = val == "plus" ? FeeType.AMOUNT : FeeType.PERCENT;
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

// Methods
const goBack = () => router.back();

const openFeeDrawer = (item: CanvassingItemForm) => {
  itemIndex.value = item.index;
  contactsFeeToEdit.value = item.contacts_fee;

  selectedItem.value = {
    index: item.index,
    vendor_name: item.vendor_name ?? "",
    name: item.catalogue_name,
  };

  drawerFeeVisible.value = true;
};

const handleSaveFee = ({
  item,
  contacts,
  fee,
}: {
  item: { index: string; name: string; vendor_name: string };
  contacts: ReferenceTransactionAdjustment[];
  fee?: number;
}) => {
  console.log("contacts", contacts);

  if (contacts) {
    // contactsFee.value = contacts;

    updateItemFee(item_canvassing.value, itemIndex.value, contacts, fee ?? 0);
    // item_canvassing.value.forEach(element => {
    //   updateItemFee(element.children, itemIndex.value, contacts);
    // });

    // contactsFee.value = fees;
  } else {
    updateItemFee(item_canvassing.value, itemIndex.value, contacts, fee ?? 0);
  }

  syncFeeAcumulation();

  item_canvassing.value.forEach((element) => {
    setProfit(element);
  });

  // drawerFeeVisible.value = false;
};

const syncFeeAcumulation = () => {
  contactsFee.value.forEach((value) => (value.amount = 0));
  item_canvassing.value.forEach((element) => {
    element.children.forEach((child) => {
      child.contacts_fee.forEach((contact) => {
        const index = contactsFee.value.findIndex(
          (value) => value.party_id == contact.party_id
        );
        if (index >= 0) {
          contactsFee.value[index].amount += Number(contact.amount);
        } else {
          contactsFee.value.push({ ...contact });
        }
      });
    });
  });
};

function calculateFee() {
  contactsFee.value.forEach((value) => (value.amount = 0));
  item_canvassing.value.forEach((item) => {
    const selling_price = Number(item.selling_price || 0);

    item.children.forEach((child) => {
      const hargaBeli = Number(child.unit_price || 0);

      let ongkirNominal = child.ongkir;

      child.contacts_fee.forEach((contact) => {
        const selisih = selling_price - hargaBeli - ongkirNominal;

        let profit = 100;
        let fee = 0;

        if (contact.type == "percent") {
          fee = Number(contact.amount);
        } else {
          fee = (Number(contact.amount) / hargaBeli) * 100;
        }

        if (child.profit_unit == "amount") {
          profit = (Number(child.profit) / hargaBeli) * 100;
        }

        let profitAndFee = profit + fee;

        contact.amount = fee;
        contact.amount_nominal = (selisih * fee) / profitAndFee;

        console.log("calculate selisih", selisih);
        console.log("calculate amount", contact.amount);
        console.log("calculate amount_nominal", contact.amount_nominal);

        const findContactFee = contactsFee.value.findIndex(
          (fee) => fee.party_id == contact.party_id
        );

        if (findContactFee >= 0) {
          if (unitFee.value == FeeType.AMOUNT) {
            contactsFee.value[findContactFee].amount += Number(
              contact.amount_nominal
            );
          } else {
            contactsFee.value[findContactFee].amount += Number(contact.amount);
          }
          contactsFee.value[findContactFee].amount = Math.round(
            contactsFee.value[findContactFee].amount
          );

          console.log("calculate ", findContactFee);
        }
      });
    });
  });
}

function updateItemFee(
  items: CanvassingItemForm[],
  index: string,
  contacts?: ReferenceTransactionAdjustment[],
  fee?: number
) {
  for (const it of items) {
    if (it.index === index && it.type == "child") {
      if (contacts) {
        it.fee = contacts.reduce((sum, c) => sum + (c.amount || 0), 0);
        // contacts.forEach(element => {
        //   const exist = contactsFee.value.findIndex((value) => value.party?.unique_id == element.party?.unique_id);
        //   if(exist < 0){
        //     const newContactFee = element;
        //     newContactFee.reference = ReferenceAdjustment.CANVASSING;
        //     contactsFee.value.push(element);
        //   }
        // });

        it.contacts_fee = contacts;
      } else {
        it.fee = fee ?? 0;
      }

      // calculateSellingPrice(it);

      // it.contactsFee = contactsFee
    } else {
      // it.contacts_fee = contac

      if (contacts) {
        if (it.contacts_fee.length > 0) {
          const contactNotExist: ReferenceTransactionAdjustment[] = [];

          contacts.forEach((element) => {
            const findIndex = (it.contacts_fee ?? []).findIndex(
              (c) => c.party_id == element.party_id
            );

            if (findIndex < 0) {
              contactNotExist.push({ ...element, amount: 0 });
            }
          });

          it.contacts_fee = [...it.contacts_fee, ...contactNotExist];
        } else {
          it.contacts_fee = contacts.map((value) => ({ ...value, amount: 0 }));
        }
      }
    }

    if (it.type == "parent") {
      // setProfit(it);
    }

    if (it.children.length > 0) {
      updateItemFee(it.children, index, contacts, fee);
    }
  }
}

const accumulateFee = () => {
  contactsFee.value.forEach((contactFee) => (contactFee.amount = 0));
  item_canvassing.value.forEach((element) => {
    element.children.forEach((childs) => {
      childs.contacts_fee.forEach((fee) => {
        const exist = contactsFee.value.findIndex(
          (value) => value.party?.unique_id == fee.party?.unique_id
        );
        if (exist >= 0) {
          if (contactsFee.value[exist].type == FeeType.AMOUNT) {
            if (fee.type == FeeType.AMOUNT) {
              // Both AMOUNT: langsung tambah
              contactsFee.value[exist].amount +=
                Number(fee.amount) * Number(childs.quantity);
            } else {
              // contactsFee: AMOUNT, element: PERCENT → konversi percent ke amount

              let profitAmount = 0;

              if (childs.profit) {
                if (childs.profit_unit === "percent") {
                  profitAmount = childs.unit_price * (childs.profit / 100);
                } else {
                  profitAmount = childs.profit || 0;
                }
              }

              let feeAmount = profitAmount * (fee.amount / 100);

              feeAmount = Number(feeAmount) * childs.quantity;

              contactsFee.value[exist].amount += feeAmount;
            }
          } else {
            // contactsFee: PERCENT, element: AMOUNT → konversi amount ke percent
            let profitAmount = 0;

            if (childs.profit) {
              if (childs.profit_unit === "percent") {
                profitAmount = childs.unit_price * (childs.profit / 100);
                profitAmount = Number(profitAmount) * Number(childs.quantity);
              } else {
                profitAmount = childs.profit || 0;
                profitAmount = Number(profitAmount) * Number(childs.quantity);
              }
            }

            // Hindari division by zero
            if (profitAmount > 0) {
              const amountAsPercent = (fee.amount / profitAmount) * 100;
              contactsFee.value[exist].amount += amountAsPercent;
            } else {
              // Jika profitAmount 0, set percent ke 0 atau handle sesuai business logic
              contactsFee.value[exist].amount += 0;
            }
          }
        }
      });
    });
  });
};

const accumulateOngkir = () => {
  let ongkirAmount = 0;

  item_canvassing.value.forEach((element) => {
    element.children.forEach((childs) => {
      ongkirAmount += Number(childs.ongkir) * Number(childs.quantity);
    });
  });

  if (ongkirAmount > 0) {
    adjustmentTransactionOngkirTotal.value.amount = ongkirAmount;
  }
};

const addItemVendor = (row: CanvassingItemForm) => {
  itemIndex.value = row.index;

  // visibleModalSearchItemExample.value = true
  item_canvassing.value.forEach((item, index) => {
    if (item.index == itemIndex.value) {
      const startIndex = item.children.length;
      item.children.push({
        type_item: "quotation",
        parent_index: item.index,
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
        quantity: 22,
        unit_price: 0,
        total_price: 0,
        status: CanvassingVendorStatus.SUBMITTED,
        taxes: [],
        editing: null,
        type: "child",
        children: [],
        selling_price: 0,
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
const addEquivalent = (row: CanvassingItemForm) => {
  const indexParent = item_canvassing.value.findIndex(
    (value) => value.index == row.index
  );

  const equivalentItem: CanvassingItemForm = {
    type_item: "equivalent",
    equivalent_id: `${item_canvassing.value[indexParent].catalogue_id}`,
    index: `${item_canvassing.value[indexParent]}-${
      item_canvassing.value.length + 1
    }`,
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
    quantity: item_canvassing.value[indexParent].quantity,
    unit_price: 0,
    total_price: 0,
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
    ongkir_unit: "amount",
    pricetag_item_id: "",
    pricetag_item_version: 0,
    contacts_fee: contactsFee.value,
  };

  item_canvassing.value.splice(indexParent + 1, 0, equivalentItem);
};

function findParent(
  tree: CanvassingItemForm[],
  index: string
): CanvassingItemForm | null {
  for (const node of tree) {
    // if (node.index === index) return node;
    // if (node.children) {
    //   const found = findParent(node.children, index);
    //   if (found) return found;
    // }

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
    itemIndex.value = parent.index;
    itemStartIndex.value = row.index;
    visibleModalSearchItemExample.value = true;
  }
};

const toggleExpand = (row: any) => {
  row._expanded = !row._expanded;
  const table = tableRef.value as any;
  table.toggleRowExpansion(row, row._expanded);
};

const calculateMargin = (row: CanvassingItemForm) => {
  return ((row.selling_price - row.unit_price) / row.unit_price) * 100;
};

const changeFeeUnitContacts = (row: CanvassingItemForm) => {
  row.contacts_fee.forEach((element) => {
    element.type = row.fee_unit as FeeType;
  });
};
const changeFeeUnit = (val: any) => {
  contactsFee.value.forEach((element) => {
    element.type = val as FeeType;
  });
};

const getProfit = (row: CanvassingItemForm) => {
  if (row.profit_unit == "percent") {
    const profit = Number(row.unit_price) * (Number(row.profit) / 100);
    return currency(profit || 0);
  } else if (row.profit_unit == "amount") {
    const profit = (Number(row.profit) / Number(row.unit_price)) * 100;
    return `${profit.toFixed(2)}%`;
  }
};

const onChangeChild = (row: CanvassingItemForm) => {
  if (row.type == "child") {
    const parent = findParent(item_canvassing.value, row.index);
    if (parent != null) {
      setProfit(parent);
    }
  }
};

// watch(
//   item_canvassing.value,
//   () => {
//     item_canvassing.value.forEach(element => {
//       setProfit(element);
//     });
//   },
//   { immediate: true }
// )

const setProfit = (row: CanvassingItemForm) => {
  const selling_price = Number(row.selling_price || 0);

  if (row.type == "parent") {
    row.children.forEach((child) => {
      const hargaBeli = Number(child.unit_price || 0);

      let ongkirNominal =
        child.ongkir_unit === "percent"
          ? (hargaBeli * child.ongkir) / 100
          : Number(child.ongkir) || 0;

      const selisih = selling_price - hargaBeli - ongkirNominal;

      // ganti 100
      let profit = 100;
      let fee = 0;

      if (child.fee_unit == "percent") {
        fee = Number(child.fee);
      } else {
        fee = (Number(child.fee) / hargaBeli) * 100;
      }

      if (child.profit_unit == "amount") {
        profit = (Number(child.profit) / hargaBeli) * 100;
      }

      let profitAndFee = profit + fee;

      child.fee = fee;
      child.fee_nominal =
        (selisih * fee) / profitAndFee < 0 ? 0 : (selisih * fee) / profitAndFee;

      child.profit_nominal =
        ((selisih < 0 ? 0 : selisih) * profit) / profitAndFee;

      console.log("harga beli", hargaBeli);
      console.log("ongkir", ongkirNominal);
      console.log("selling_price", selling_price);
      console.log("selisih", selisih);
      console.log("profit", profit);
      console.log("fee", fee);
      console.log("profit nominal", child.profit_nominal);

      child.profit = Number(
        ((child.profit_nominal / hargaBeli) * 100).toFixed(2)
      );

      // let newProfitAndFee = child.profit + fee;
      // child.fee_nominal = selisih * fee / newProfitAndFee;

      calculateSellingPrice(child);
    });
  }

  calculateFee();
};

const handleProfitUnitChange = (row: CanvassingItemForm) => {
  const cost = Number(row.unit_price) || 0;
  let profit = Number(row.profit) || 0;

  if (row.profit_unit === "percent") {
    // sebelumnya dalam nominal → ubah ke persen
    row.profit = cost > 0 ? (profit / cost) * 100 : 0;
  } else if (row.profit_unit === "amount") {
    // sebelumnya dalam persen → ubah ke nominal
    row.profit = cost * (profit / 100);
  }

  calculateSellingPrice(row);
};

// const handleProfitChange = (row: CanvassingItemForm) => {
//   const cost = Number(row.unit_price) || 0
//   let profit = Number(row.profit) || 0

//   if (row.profit_unit === 'percent') {
//     // sebelumnya dalam nominal → ubah ke persen
//     row.profit = cost > 0 ? (profit / cost) * 100 : 0
//   } else if (row.profit_unit === 'amount') {
//     // sebelumnya dalam persen → ubah ke nominal
//     row.profit = cost * (profit / 100)
//   }

//   calculateSellingPrice(row)
// }

const handleProfitUnitChangeParent = (row: CanvassingItemForm) => {
  const cost = Number(row.unit_price) || 0;
  let profit = Number(row.profit) || 0;

  if (row.profit_unit === "percent") {
    // sebelumnya dalam nominal → ubah ke persen
    row.profit = cost > 0 ? (profit / cost) * 100 : 0;
  } else if (row.profit_unit === "amount") {
    // sebelumnya dalam persen → ubah ke nominal
    row.profit = cost * (profit / 100);
  }

  calculateSellingPrice(row);
};
const handleParentChange = (row: CanvassingItemForm) => {
  row.children.forEach((child) => {
    child.profit = row.profit;
    child.profit_unit = row.profit_unit;
    child.fee = row.fee;
    child.fee_unit = row.fee_unit;
    child.ongkir = row.ongkir;
    child.ongkir_unit = row.ongkir_unit;
  });

  calculateSellingPrice(row);
};

const calculateSellingPrice = (row: CanvassingItemForm) => {
  let basePrice = Number(row.unit_price || 0);

  // let sellingPrice = Number(basePrice);
  let profitAmount = Number(row.profit_nominal);
  let feeAmount = Number(row.fee_nominal);
  let ongkir = Number(row.ongkir || 0);

  // Update harga jual
  row.selling_price = basePrice + profitAmount + feeAmount + ongkir;

  console.log("basePrice", basePrice);
  console.log("profit amount", profitAmount);
  console.log("feeAmount", feeAmount);
  console.log("ongir", ongkir);

  if (feeState.value === "plus") {
    // accumulateFee();
  }
  accumulateOngkir();

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
  console.log("type", item.type);

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

    // removeVendor(item.vendor_id)
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

const removeVendor = (vendorId: string) => {
  quotationItems.value = quotationItems.value.map((item) => {
    return {
      ...item,
      equivalents: item.equivalents.map((eq) => {
        return {
          ...eq,
          vendors: eq.vendors.filter((v) => v.vendor_id !== vendorId), // hanya filter vendors
        };
      }),
    };
  });
};

const removeReference = (index: number) => {
  references.value.splice(index, 1);
};

const displayAmount = (ref: any, multiplier: number) => {
  console.log("type", ref.type);
  if (ref.type === "percent") {
    console.log("amount", ref.amount);
    console.log("multiplier", (multiplier || 0) * (ref.amount / 100));
    return (multiplier || 0) * (ref.amount / 100);
  } else {
    return ref.amount;
  }
};
const displayPercentage = (ref: any, multiplier: number) => {
  if (ref.type === "amount") {
    return ref.amount / multiplier || 0 * 100;
  } else {
    return displayAmount(ref, multiplier);
  }
};

const applyAllBulk = () => {
  item_canvassing.value.forEach((item) => {
    if (item.children && item.children.length) {
      item.children.forEach((child) => {
        if (child.type === "child") {
          // Apply profit jika diisi
          if (bulkProfit.value !== "") {
            child.profit = parseInt(bulkProfit.value);
            child.profit_unit = bulkProfitUnit.value as "amount" | "percent";
            child.profit_nominal = child.unit_price * (child.profit / 100);
          }

          // Apply fee jika diisi
          if (bulkFee.value !== "" && feeState.value !== "minus") {
            child.fee = parseInt(bulkFee.value);
            child.fee_unit = bulkFeeUnit.value as "amount" | "percent";
            child.fee_nominal = (child.fee / 100) * child.profit;
            changeFeeUnitContacts(child);
          } else {
            // if(child.fee == ''){
            //   child.fee = 0;
            //   child.fee_unit = bulkFeeUnit.value as "amount"|"percent";
            //   child.fee_nominal = 0;
            // }
          }

          // Apply ongkir jika diisi
          if (bulkOngkir.value !== "") {
            child.ongkir = parseInt(bulkOngkir.value);
          }

          // Recalculate selling price
          calculateSellingPrice(child);
        }
      });
    }
  });

  item_canvassing.value.forEach((item) => {
    setProfit(item);
  });

  // Show success message
  ElMessage.success("Berhasil menerapkan semua setting ke semua item");
};

const resetAllBulk = () => {
  // Reset bulk input fields
  bulkProfit.value = "";
  bulkFee.value = "";
  bulkOngkir.value = "";
  bulkProfitUnit.value = "percent";
  bulkFeeUnit.value = "percent";

  // Reset all items
  item_canvassing.value.forEach((item) => {
    if (item.children && item.children.length) {
      item.children.forEach((child) => {
        if (child.type === "child") {
          child.profit = 0;
          child.fee = 0;
          child.ongkir = 0;
          child.profit_unit = "percent";
          child.fee_unit = "percent";
          child.selling_price = child.unit_price || 0;
        }
      });
    }
  });

  ElMessage.info("Semua setting telah direset");
};

const getFile = (files: AppFile[]) => {
  if (files!.length > 0) {
    return `${imageUrl}/${files[0].image_path}/${files[0].filename}`;
  } else {
    return "";
  }
};

const getFileName = (itemRequest: ItemRequest) => {
  if (itemRequest.files != null && itemRequest.files!.length >= 0) {
    return `${itemRequest.files![0].filename_original}`;
  } else {
    return "";
  }
};

// Form Operations
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


    if((item.catalogue?.files ?? []).length > 0){
      if(getFirstFileUrl((item.catalogue?.files ?? [])) != ""){
        tmp.image = getFirstFileUrl(item.catalogue?.files ?? []);
        tmp.files = mapApiFilesToUpload((item.catalogue?.files ?? []));
      }
    }

    if (getFile(item.files ?? []) != "") {
      // const file = await urlToFile(
      //   getFile(item.files ?? []),
      //   getFileName(item)
      // );
      
      // tmp.imageFile = {
      //   name: file.name,
      //   url: getFile(item.files ?? []),
      //   raw: file,
      //   uid: Date.now(),
      // };
      tmp.files = [...(tmp.files ?? []), ...mapApiFilesToUpload(item.files ?? [])];

      
    }
    


    item_canvassing.value.push(tmp);
  });

  console.log("items", item_canvassing.value);

  visibleModalRequest.value = false;
};

const mapApiFilesToUpload = (files: any[]) => {
  const baseUrl = useRuntimeConfig().public.baseImageURL; 
  // sesuaikan dengan config kamu

  return files.map((file) => ({
    uid: file.unique_id,
    name: file.filename_original || file.filename,
    url: `${baseUrl}${file.image_path}/${file.filename}`,
    status: 'success' as UploadStatus,
  }));
};

const addNewItem = () => {
  item_canvassing.value.push({
    type_item: "equivalent",
    equivalent_id: null,
    index: `${item_canvassing.value.length + 1}`,
    canvassing_id: null,
    canvaasing_version: null,
    item_request_trail_version: null,
    item_request_trail_id: null,
    unique_id: null,
    vendor_id: null,
    vendor_name: "",
    unit_id: null,
    unit_name: null,
    unit_version: 1,
    offer_item_id: null,
    offer_item_version: 0,
    catalogue_id: "",
    parent_catalogue_id: "",
    catalogue_name: "",
    sn: "N/A",
    quantity: 1,
    unit_price: 0,
    total_price: 0,
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
  });
};

const addToOfferVendor = (val: Pricetag_item[]) => {


  const getIndex = item_canvassing.value.findIndex(
    (value) => value.index == itemIndex.value
  );

  let startIndex = 0;

  if (itemStartIndex.value !== "") {
    startIndex = findChildIndex(
      item_canvassing.value[getIndex].children,
      itemStartIndex.value
    );
  }

  const parentUnit = item_canvassing.value[getIndex]?.unit_name;

  const itemsWithDifferentUnit = val.filter(item => item.unit_name !== parentUnit);
  const hasDifferentUnit = itemsWithDifferentUnit.length > 0;
  
  if (hasDifferentUnit) {
    // Tampilkan konfirmasi dialog dengan informasi detail
    const differentUnitNames = [...new Set(itemsWithDifferentUnit.map(item => item.unit_name))];
    
    ElMessageBox.confirm(
      `Ada ${itemsWithDifferentUnit.length} item dengan unit berbeda dari parent:<br>
      <strong>Unit Parent:</strong> ${parentUnit}<br>
      <strong>Unit Berbeda:</strong> ${differentUnitNames.join(', ')}<br><br>
      Tetap tambahkan semua item?`,
      'Konfirmasi Unit Berbeda',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: 'Ya, Tambahkan Semua',
        cancelButtonText: 'Pilih Lagi',
        type: 'warning',
        center: true,
        customClass: 'unit-difference-dialog'
      }
    ).then(() => {
      // User memilih "Ya, Tambahkan Semua"
      val.forEach((item: Pricetag_item, index: number) => {
        const isUnitDifferent = item.unit_name !== parentUnit;
        addChildItem(item, getIndex, startIndex, isUnitDifferent);
        startIndex++;
      });
      
      // Tampilkan notifikasi berhasil
      if (itemsWithDifferentUnit.length > 0) {
        ElMessage({
          message: `${val.length} item ditambahkan (${itemsWithDifferentUnit.length} dengan unit berbeda)`,
          type: 'warning',
          duration: 3000
        });
      }
    }).catch(() => {
      // User memilih "Pilih Lagi" atau menutup dialog
      ElMessage.info('Proses ditambahkan dibatalkan, silakan pilih item lagi.');
      return; // Tidak menambahkan apa-apa
    });
  } else {
    // Semua unit sama, langsung tambahkan semua
    val.forEach((item: Pricetag_item, index: number) => {
      addChildItem(item, getIndex, startIndex, false);
      startIndex++;
    });
    
    // Tampilkan notifikasi sukses
    ElMessage.success(`${val.length} item berhasil ditambahkan`);
  }

  visibleModalSearchItemExample.value = false;

  // val.forEach((item: Pricetag_item, index: number) => {
    
  //   const child: CanvassingItemForm = {
  //     parent_index: `${getIndex}`,
  //     index: `${itemIndex.value}-${startIndex}`,
  //     type_item: "quotation",
  //     equivalent_id: null,
  //     canvassing_id: null,
  //     canvaasing_version: null,
  //     item_request_trail_version: null,
  //     item_request_trail_id: null,
  //     unique_id: null,
  //     vendor_id: item.pricetag?.owner?.unique_id ?? "",
  //     vendor_name: item.pricetag?.owner?.name ?? "",
  //     unit_id: item.unit_id,
  //     unit_name: item.unit_name,
  //     unit_version: null,
  //     offer_item_id: null,
  //     offer_item_version: 0,
  //     catalogue_id: item.catalogue_id ?? "",
  //     parent_catalogue_id: item_canvassing.value[getIndex].catalogue_id,
  //     catalogue_name: item.catalogue?.name ?? "",
  //     sn: item.catalogue?.sn ?? "",
  //     quantity: item_canvassing.value[getIndex].quantity,
  //     unit_price: item.price,
  //     total_price: 0,
  //     status: CanvassingVendorStatus.SUBMITTED,
  //     taxes: [],
  //     editing: null,
  //     type: "child",
  //     children: [],
  //     selling_price: 0,
  //     profit: 0,
  //     profit_unit: "percent",
  //     fee: 0,
  //     fee_unit: "percent",
  //     ongkir: 0,
  //     ongkir_unit: "amount",
  //     pricetag_item_id: item.unique_id ?? "",
  //     pricetag_item_version: item.version ?? 0,
  //     contacts_fee: contactsFee.value,
  //   };

  //   if((item.files ?? []).length > 0){
  //     child.image = getFirstFileUrl(item.files ?? []);
  //     child.files = mapApiFilesToUpload(item.files ?? []);
  //   }

  //   const clones = contactsFee.value;

  //   child.contacts_fee = clones.map((value) => {
  //     return {
  //       ...value,
  //       reference: ReferenceAdjustment.CANVASSINGVENDOR,
  //       amount: 0,
  //       type: FeeType.PERCENT,
  //     };
  //   });

  //   if (item_canvassing.value[getIndex].children[startIndex]) {
  //     item_canvassing.value[getIndex].children[startIndex] = child;
  //   } else {
  //     item_canvassing.value[getIndex].children.splice(startIndex, 0, child);
  //   }

    

  //   startIndex++;
  // });


  // visibleModalSearchItemExample.value = false;
};


const tableRowClassName = ({ row }: { row: CanvassingItemForm }) => {
  if (row.type === 'child' && row.has_different_unit) {
    return 'different-unit-row';
  }
  return '';
};


const addChildItem = (item: Pricetag_item, parentIndex: number, childIndex: number, hasDifferentUnit: boolean) => {
  const child: CanvassingItemForm = {
    parent_index: `${parentIndex}`,
    index: `${itemIndex.value}-${childIndex}`,
    type_item: "quotation",
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
    profit: 0,
    profit_unit: "percent",
    fee: 0,
    fee_unit: "percent",
    ongkir: 0,
    ongkir_unit: "amount",
    pricetag_item_id: item.unique_id ?? "",
    pricetag_item_version: item.version ?? 0,
    contacts_fee: contactsFee.value,
    // Tambahkan flag untuk unit berbeda
    has_different_unit: hasDifferentUnit
  };

  if((item.files ?? []).length > 0){
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
  // Implementation for adding vendors
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
  visibleModalAdjustmentTransaction.value = false;
};

const addContact = () => {
  contactsFee.value.push({
    unique_id: "",
    reference: ReferenceAdjustment.CANVASSING,
    reference_id: "",
    adjustment_id: `${adjustmentContact.value?.unique_id}`,
    adjustment: adjustmentContact.value,
    value: null,
    type: FeeType.PERCENT,
    amount: 0,
    created_at: 0,
    changeType: true,
    party: {
      id: 0,
      unique_id: "",
      unique_code: "",
      is_personal: false,
      is_company: false,
      internal_id: "",
      name: "",
      email: "",
      phone: "",
      tax_id: "",
      website: "",
      title: "",
      tags: "",
      created_at: 0,
      created_by: "",
      updated_at: 0,
      version: 0,
      address: [],
    },
  });
};

const removeContact = (index: number) => {
  contactsFee.value.splice(index, 1);
};

const onHandleSelectContact = async (
  item: Record<string, any>,
  index: number
) => {
  if (item.isNew) {
    const contact: Contact | null = await createNewContact({
      name: item.query,
    });
    if (contact !== null) {
      contactsFee.value[index].reference = ReferenceAdjustment.CANVASSING;
      contactsFee.value[index].party_id = contact.unique_id;
      contactsFee.value[index].party = contact;
      contactsFee.value[index].party_type = PartyType.CONTACT;
    }
  } else {
    const contact: Contact = item as Contact;
    contactsFee.value[index].reference = ReferenceAdjustment.CANVASSING;
    contactsFee.value[index].party_id = contact.unique_id;
    contactsFee.value[index].party = contact;
    contactsFee.value[index].party_type = PartyType.CONTACT;
  }

  item_canvassing.value.forEach((value) => {
    value.children.forEach((child) => (child.contacts_fee = contactsFee.value));
  });
};
const onHandleSelectVendor = async (
  record: Record<string, any>,
  index: string
) => {
  const parentIndex = findParent(item_canvassing.value, index);
  if (parentIndex) {
    const childIndex = parentIndex.children.findIndex(
      (value) => value.index == index
    );
    if (childIndex >= 0) {
      if (record.isNew) {
        const contact: Contact | null = await createNewContact({
          name: record.query,
        });
        if (contact != null) {
          parentIndex.children[childIndex].vendor_id = contact.unique_id!;
          parentIndex.children[childIndex].vendor_name = contact.name!;
        }
      } else {
        const contact: Contact = record as Contact;
        parentIndex.children[childIndex].vendor_id = contact.unique_id!;
        parentIndex.children[childIndex].vendor_name = contact.name!;
      }
    }
  }
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
    return null;
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

const handleSelectUnit = async (
  record: Record<string, any>,
  index: string,
  row: CanvassingItemForm
) => {
  if (row.type == "parent") {
    item_canvassing.value.forEach((item) => {
      if (item.index === index) {
        const unit: Unit = record as Unit;
        item.unit_id = unit.unique_id!;
        item.unit_name = unit.name!;
      }
    });
  } else {
    const parentIndex = findParent(item_canvassing.value, index);
    if (parentIndex) {
      const childIndex = parentIndex.children.findIndex(
        (value) => value.index == index
      );
      if (childIndex >= 0) {
        if (record.isNew) {
          const unit: Unit | null = await handleNewUnit({ name: record.id });
          if (unit != null) {
            parentIndex.children[childIndex].unit_id = unit.unique_id!;
            parentIndex.children[childIndex].unit_name = unit.name!;
          }
        } else {
          const unit: Unit = record as Unit;
          parentIndex.children[childIndex].unit_id = unit.unique_id!;
          parentIndex.children[childIndex].unit_name = unit.name!;
        }
      }
    }
  }
};

const querySearchCatalogue = (queryString: string, cb: (arg: any) => void) => {
  if (queryString != "") {
    request_search_pricetag_item.value.keyword = queryString;

    useFetchApi<ResponsePagination<Pricetag_item[]>>(
      `/pricetag-item-read`,
      "pricetag-search-items",
      "post",
      request_search_pricetag_item
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
      console.log("result api", resultApi);
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
    // const catalogueInsert: Catalogue = {
    //   name: item.value,
    //   id: null,
    //   unique_id: null,
    //   unique_code: null,
    //   brand_id: null,
    //   brand_name: null,
    //   year: null,
    //   sn: null,
    //   description: null,
    //   berat: null,
    //   volume: null,
    //   panjang: null,
    //   lebar: null,
    //   tinggi: null,
    //   is_asset: null,
    //   tmp_asset: null,
    //   version: null,
    //   type: 'item',
    //   created_at: null,
    //   created_by: null,
    //   updated_at: null,
    //   file_catalogues: []
    // }
    // const selected: Catalogue|null = await create_catalogue(catalogueInsert) ?? null;

    // if(selected != null){

    //   if(row.type === 'parent'){
    //     item_canvassing.value.forEach((item) => {
    //       if(item.index == itemIndex){
    //         item.catalogue_id = selected.unique_id ?? '';
    //         item.catalogue_name = selected.name ?? '';
    //       }
    //     })
    //   }else{
    //     item_canvassing.value.forEach((item) => {
    //       item.children.forEach((child) => {
    //         if(child.index == itemIndex){
    //           child.catalogue_id = selected.unique_id ?? '';
    //           child.catalogue_name = selected.name ?? '';
    //         }
    //       })
    //     })
    //   }

    // }else{
    //   ElMessage.error(`Ops, Something wrong!!`);
    // }
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

// API Methods
const fetchContact = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<ResponsePagination<Contact[]>>(
      `/search`,
      "contact-search",
      "post",
      request_search_contact
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
        // Populate form data
        Object.assign(ruleForm, {
          unique_id: type && type === "copy" ? null : canvasing.unique_id,
          description: canvasing.description,
          status: canvasing.status,
          source_document: canvasing.source_document,
        });

        if (canvasing.source) {
          ruleForm.source_document = type && type === "copy" ? null : canvasing.source.unique_code;
          ruleForm.inquiry = type && type === "copy" ? null : canvasing.source;
          canvasing.canvassing_item.forEach((item, index) => {
            if (item.type_item !== "equivalent") {
              item_canvassing.value.push({
                type_item: item.type_item,
                image: getFile(item.files ?? []),
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
                  image: getFile(vendor.files ?? []),
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
                  parent_index: `${index}`,
                  taxes: [],
                  editing: null,
                  type: "child",
                  children: [],
                  selling_price: 0,
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
                children: item.canvassing_vendor.map((vendor, vIndex) => ({
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
                  taxes: [],
                  editing: null,
                  type: "child",
                  children: [],
                  selling_price: 0,
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

          console.log("data item canvasing", item_canvassing.value);

          equivalent.forEach((element) => {
            console.log("equivalent_id", element.equivalent_id);
            const indexParent = item_canvassing.value.findIndex(
              (data) => data.unique_id === element.equivalent_id
            );

            // console.log("equivalent exist", indexParent);
            if (indexParent >= 0) {
              item_canvassing.value.splice(indexParent + 1, 0, element);
            }
          });

          // item_canvassing.value = item_canvassing.value.filter(
          //   (value) => value.type_item !== "equivalent"
          // );
        }
      }
    }
  } catch (error: any) {
    ElMessage.error(error);
  } finally {
    loading.value = false;
  }
};

// Form Submission
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
    const referenceAdjustment: ReferenceTransactionAdjustment[] = [
      ...references.value,
      ...contactsFee.value,
      adjustmentTransactionOngkirTotal.value as ReferenceTransactionAdjustment,
    ];
    const referenceAdjustmentVendor: ReferenceTransactionAdjustment[] = [];

    item_canvassing.value.forEach((element) => {
      element.children.forEach((child) => {
        child.contacts_fee.forEach((fee) => {
          fee.reference_id = child.unique_id ?? "";
          referenceAdjustmentVendor.push(fee);
        });
        referenceAdjustmentVendor.push({
          unique_id: "",
          reference: ReferenceAdjustment.CANVASSINGVENDOR,
          reference_id: child.unique_id ?? "",
          adjustment_id: `${adjustmentOngkir.value?.unique_id}`,
          adjustment: adjustmentOngkir.value,
          value: child.ongkir,
          type: child.ongkir_unit as FeeType,
          amount: child.ongkir,
        });
      });
    });

    const payload = {
      unique_id: ruleForm.unique_id,
      source_document: ruleForm.source_document,
      description: ruleForm.description,
      status: ruleForm.status,
      canvassing_items: item_canvassing.value.map((value) => ({
        unique_id: value.unique_id,
        canvassing_id: value.canvassing_id,
        quantity: value.quantity,
        catalogue_id: value.catalogue_id,
        catalogue_name: value.catalogue_name,
        unit_id: value.unit_id,
        unit_name: value.unit_name,
        unit_selling_price: value.selling_price,
        canvassing_vendor: value.children.map((child) => ({
          unique_id: child.unique_id,
          vendor_id: child.vendor_id,
          canvassing_item_id: value.unique_id,
          catalogue_id: child.catalogue_id,
          catalogue_name: child.catalogue_name,
          quantity: child.quantity,
          unit_price: child.unit_price,
          selling_price: child.selling_price,
          unit_id: child.unit_id,
          unit_name: child.unit_name,
          total_price: Number(child.quantity) * Number(child.unit_price),
        })),
      })),
      reference_transaction: referenceAdjustment.map((ref) => ({
        unique_id: ref.unique_id,
        adjustment_id: ref.adjustment_id,
        value: ref.value,
        amount: ref.amount,
        type: ref.type,
        party_type: ref.party_type,
        party_id: ref.party_id,
        reference: ReferenceAdjustment.CANVASSING,
        reference_id: ref.reference_id,
      })),
    };

    // Membuat FormData
    const formData = new FormData();

    // Menambahkan data utama
    formData.append("unique_id", ruleForm.unique_id || "");
    formData.append("source_document", ruleForm.source_document || "");
    formData.append("description", ruleForm.description || "");
    formData.append("status", ruleForm.status || "");

    // Append canvassing_items dengan individual fields
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

      if (item.imageFile) {
        if(item.imageFile.raw){
          formData.append(
            `canvassing_items[${i}][files]`,
            item.imageFile?.raw as Blob
          );
        }
      }

      // Append canvassing_vendor
      // Append canvassing_vendor fields satu per satu
      item.children.forEach((vendor: CanvassingItemForm, j: any) => {
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

        if (vendor.imageFile) {
          if(vendor.imageFile?.raw){
            formData.append(
              `canvassing_items[${i}][canvassing_vendor][${j}][files]`,
              vendor.imageFile?.raw as Blob
            );
          }
        }
      });
    });

    // Untuk debugging: lihat semua entries FormData
    console.log("=== FORM DATA ENTRIES ===");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    // Append files
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
  quotationItems.value = [];
  references.value = [];
  fileList.value = [];
};

// Event Handlers
const handlePriceTagSubmit = () => {
  visibleModalPricetagNewItem.value = false;
  visibleModalSearchItemExample.value = true;
  refreshNuxtData("pricetag-search-items");
};

const handleAdjustmentSubmit = () => {
  visibleModalNewAdjustment.value = false;
  refreshNuxtData("search-adjustment");
};

// Pagination Handlers
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

// Form Validation Rules
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

watchDebounced(
  querySearchAdjustmentTransaction.value,
  () => refreshNuxtData("search-adjustment"),
  { debounce: 500 }
);

watchDebounced(request_search_contact.value, () => fetchContact(), {
  debounce: 500,
});
// watchDebounced(
//   contactsFee.value,
//   () => {
//     const data = contactsFee.value || [];
//     item_canvassing.value.forEach((value) => {
//       value.children.forEach((child) => {
//         child.contacts_fee = data;
//       })
//     })
//   },
//   { debounce: 500 }
// )

watchDebounced(
  request_search_pricetag_item.value,
  () => refreshNuxtData("pricetag-search-items"),
  { debounce: 500 }
);

const initItemCanvassing = () => {
  // contactsFee.value.push({
  //     unique_id: '',
  //     reference: ReferenceAdjustment.CANVASSING,
  //     reference_id: '',
  //     adjustment_id: `${adjustmentContact.value?.unique_id}`,
  //     adjustment: adjustmentContact.value,
  //     value: null,
  //     type: FeeType.PERCENT,
  //     amount: 0,
  //     created_at: 0,
  //     changeType: true,
  //     party: {
  //       id: 0,
  //       unique_id: 'example unique_id',
  //       unique_code: '',
  //       is_personal: false,
  //       is_company: false,
  //       internal_id: 0,
  //       name: 'example name',
  //       email: 'example email',
  //       phone: 'example phone',
  //       tax_id: '',
  //       website: '',
  //       title: '',
  //       tags: '',
  //       created_at: 0,
  //       created_by: '',
  //       updated_at: 0,
  //       version: 0,
  //       address: [],
  //     }

  // })

  item_canvassing.value.push({
    index: `0`,
    canvassing_id: null,
    canvaasing_version: null,
    item_request_trail_version: null,
    item_request_trail_id: null,
    unique_id: null,
    vendor_id: null,
    vendor_name: "",
    unit_id: "33",
    unit_name: "pcs",
    unit_version: 1,
    offer_item_id: null,
    offer_item_version: 0,
    catalogue_id: "0",
    parent_catalogue_id: "",
    catalogue_name: "Black Rubber Belt Conveyor Size: 600 MM",
    sn: "N/A",
    quantity: 22,
    unit_price: 0,
    total_price: 0,
    status: CanvassingVendorStatus.SUBMITTED,
    taxes: [],
    editing: null,
    type: "parent",
    children: [
      {
        type_item: "quotation",
        index: `0-1`,
        canvassing_id: null,
        canvaasing_version: null,
        item_request_trail_version: null,
        item_request_trail_id: null,
        unique_id: null,
        vendor_id: "8201773a6cb5455bdb9100864d81181c",
        vendor_name: "sparepart indonesia",
        unit_id: "33",
        unit_name: "pcs",
        unit_version: 1,
        offer_item_id: null,
        offer_item_version: 0,
        catalogue_id: "0",
        parent_catalogue_id: "",
        catalogue_name: "Black Rubber Belt Conveyor Size: 600 MM",
        sn: "300000710",
        quantity: 22,
        unit_price: 1000,
        total_price: 1000 * 22,
        status: CanvassingVendorStatus.SUBMITTED,
        taxes: [],
        editing: null,
        type: "child",
        children: [],
        selling_price: 0,
        profit: 0,
        profit_unit: "percent",
        fee: 0,
        fee_unit: "percent",
        ongkir: 0,
        ongkir_unit: "amount",
        pricetag_item_id: "",
        pricetag_item_version: 0,
        contacts_fee: contactsFee.value,
        equivalent_id: null,
      },
      {
        type_item: "quotation",
        index: `0-2`,
        canvassing_id: null,
        canvaasing_version: null,
        item_request_trail_version: null,
        item_request_trail_id: null,
        unique_id: null,
        vendor_id: "2f3c43ab4769286b294fa8b5b5997ab2",
        vendor_name: "trumecs",
        unit_id: "33",
        unit_name: "pcs",
        unit_version: 1,
        offer_item_id: null,
        offer_item_version: 0,
        catalogue_id: "0",
        parent_catalogue_id: "",
        catalogue_name: "Black Rubber Belt Conveyor Size: 600 MM",
        sn: "300000710",
        quantity: 22,
        unit_price: 1200,
        total_price: 1200 * 22,
        status: CanvassingVendorStatus.SUBMITTED,
        taxes: [],
        editing: null,
        type: "child",
        children: [],
        selling_price: 0,
        profit: 0,
        profit_unit: "percent",
        fee: 0,
        fee_unit: "percent",
        ongkir: 0,
        ongkir_unit: "amount",
        pricetag_item_id: "",
        pricetag_item_version: 0,
        contacts_fee: contactsFee.value,
        equivalent_id: null,
      },
    ],
    type_item: "request",
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
};

const summeryData = computed(() => {
  const tableData: any[] = [
    {
      label: "Total Harga Jual",
      max: currency(grandTotal.value),
      beli: "",
      jual: "",
      min: currency(grandTotal.value),
      beliMin: "",
      jualMin: "",
    },
    {
      label: "Total Harga Beli",
      max: currency(totalBuyingPrice.value),
      beli: "",
      jual: "",
      min: currency(totalBuyingPriceMin.value),
      beliMin: "",
      jualMin: "",
    },
    {
      label: "Total",
      max: currency(grossProfit.value),
      beli: `${safePercent(grossProfit.value, totalBuyingPrice.value)} %`,
      jual: `${
        grandTotal.value == 0
          ? 0
          : safePercent(grossProfit.value, grandTotal.value)
      } %`,
      min: currency(grossProfitMin.value),
      beliMin: `${safePercent(grossProfit.value, totalBuyingPriceMin.value)} %`,
      jualMin: `${
        grandTotal.value == 0
          ? 0
          : safePercent(grossProfitMin.value, grandTotal.value)
      } %`,
    },
    {
      label: "Ongkos Kirim",
      max: currency(adjustmentTransactionOngkirTotal.value.amount),
      beli: `${safePercent(
        adjustmentTransactionOngkirTotal.value.amount,
        totalBuyingPrice.value
      )} %`,
      jual: `${safePercent(
        adjustmentTransactionOngkirTotal.value.amount,
        grandTotal.value
      )} %`,
      min: currency(adjustmentTransactionOngkirTotal.value.amount),
      beliMin: `${safePercent(
        adjustmentTransactionOngkirTotal.value.amount,
        totalBuyingPriceMin.value
      )} %`,
      jualMax: `${safePercent(
        adjustmentTransactionOngkirTotal.value.amount,
        grandTotal.value
      )} %`,
    },
  ];

  references.value.forEach((element) => {
    tableData.push({
      label: element.adjustment?.name ?? "-",
      max: currency(displayAmount(element, totalBuyingPrice.value)),
      beli: `${safePercent(
        displayPercentage(element, totalBuyingPrice.value),
        1
      )}`,
      jual: `${safePercent(displayPercentage(element, grandTotal.value), 1)}`,
      min: currency(displayAmount(element, totalBuyingPriceMin.value)),
      beliMin: `${safePercent(
        displayPercentage(element, totalBuyingPriceMin.value),
        1
      )}`,
      jualMin: `${safePercent(
        displayPercentage(element, grandTotal.value),
        1
      )}`,
    });
  });

  tableData.push(
    {
      label: adjustmentTransactionFeeTotal.value.adjustment?.name,
      max: currency(
        displayAmount(adjustmentTransactionFeeTotal.value, grandTotal.value)
      ),
      beli: `${
        adjustmentTransactionFeeTotal.value.type == FeeType.PERCENT
          ? adjustmentTransactionFeeTotal.value.amount
          : safePercent(
              adjustmentTransactionFeeTotal.value.amount,
              totalBuyingPrice.value
            )
      } %`,
      jual: `${
        adjustmentTransactionFeeTotal.value.type == FeeType.PERCENT
          ? adjustmentTransactionFeeTotal.value.amount
          : safePercent(
              adjustmentTransactionFeeTotal.value.amount,
              grandTotal.value
            )
      } %`,
      min: currency(
        displayAmount(adjustmentTransactionFeeTotal.value, grandTotal.value)
      ),
      beliMin: `${
        adjustmentTransactionFeeTotal.value.type == FeeType.PERCENT
          ? adjustmentTransactionFeeTotal.value.amount
          : safePercent(
              adjustmentTransactionFeeTotal.value.amount,
              totalBuyingPriceMin.value
            )
      } %`,
      jualMin: `${
        adjustmentTransactionFeeTotal.value.type == FeeType.PERCENT
          ? adjustmentTransactionFeeTotal.value.amount
          : safePercent(
              adjustmentTransactionFeeTotal.value.amount,
              grandTotal.value
            )
      } %`,
    },
    {
      label: "Net Profit",
      max: currency(netProfitForBuying.value),
      beli: `${safePercent(
        netProfitForBuying.value,
        totalBuyingPrice.value
      )} %`,
      jual: `${safePercent(netProfitForBuying.value, grandTotal.value)} %`,
      min: currency(netProfitForBuyingMin.value),
      beliMin: `${safePercent(
        netProfitForBuying.value,
        totalBuyingPriceMin.value
      )} %`,
      jualMin: `${safePercent(netProfitForBuying.value, grandTotal.value)} %`,
    }
  );

  return tableData;
});

const fetchInquiryDetail = async () => {
  loading.value = true;
  try {
    // Fetch related purchase orders
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

// Lifecycle
onMounted(() => {
  if (id.value) {
    fetchDataEdit();
  }

  if (inquiry_id.value) {
    fetchInquiryDetail();
  }

  fetchInquiry();
  fetchContact();

  // remove
  // initItemCanvassing();
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

/* :deep(.different-unit-row) {
  background-color: rgba(255, 0, 0, 0.05) !important;
} */

/* :deep(.different-unit-row td) {
  border-left: 3px solid #f56c6c !important;
  border-right: 3px solid #f56c6c !important;
} */

/* :deep(.different-unit-row:first-child td) {
  border-top: 3px solid #f56c6c !important;
} */

:deep(.different-unit-row:last-child td) {
  /* border-top: 2px solid #f56c6c !important; */
  border-bottom: 3px solid #f56c6c !important;
}

/* Optional: tambahkan tooltip atau indikator visual di kolom unit */
.different-unit-indicator {
  color: #f56c6c;
  font-weight: bold;
  position: relative;
}

.different-unit-indicator::after {
  content: "⚠";
  margin-left: 5px;
  color: #f56c6c;
}
</style>
