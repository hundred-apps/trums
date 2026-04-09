<template>
  <TrumsWrapper>
    <div class="w-auto">
      <el-card class="my-3" shadow="never">
        <template #header>
          <div class="card-header">
            <el-form-item>
              <el-button type="primary" @click="submitForm(ruleFormRef)"
                >Simpan</el-button
              >
              <el-button @click="resetForm(ruleFormRef)">Batal</el-button>
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
          :size="formSize"
          status-icon
          :disabled="loading"
        >
          <el-form-item
            prop="owner_name"
            v-if="ruleForm.type == 'in'"
            label="Vendor"
          >
            <div class="flex items-center gap-3">
              <el-autocomplete
                v-model="ruleForm.owner_name"
                :fetch-suggestions="querySearchVendors"
                placeholder="Cari vendor"
                @select="(item) => onHandleSelectVendor(item, 'vendor')"
                style="width: 100%"
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
                    {{ item.value }}
                  </div>
                </template>
              </el-autocomplete>
              <el-button
                type="primary"
                v-if="ruleForm.owner_id"
                @click="() => openModalContact('vendor')"
                :icon="ElUserIcon"
              />
            </div>
          </el-form-item>
          <el-form-item label="Subject" prop="subject">
            <el-input
              v-model="ruleForm.subject"
              placeholder="Masukan Subject"
            />
          </el-form-item>
          <el-form-item
            prop="to_name"
            label="Kepada"
            v-if="ruleForm.type == 'out'"
          >
            <div class="flex items-center gap-3">
              <el-autocomplete
                v-model="ruleForm.to_name"
                :fetch-suggestions="querySearchVendors"
                placeholder="Cari Kontak"
                @select="(item) => onHandleSelectVendor(item, 'to')"
                style="width: 100%"
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
                    {{ item.value }}
                  </div>
                </template>
              </el-autocomplete>
              <el-button
                type="primary"
                v-if="ruleForm.to_id"
                @click="() => openModalContact('customer')"
                :icon="ElUserIcon"
              />
            </div>
          </el-form-item>

          <el-form-item prop="pic_name" label="PIC">
            <div class="flex items-center gap-3">
              <el-autocomplete
                v-model="ruleForm.pic_name"
                :fetch-suggestions="querySearchPIC"
                placeholder="Cari Kontak"
                @select="(item) => onHandleSelectVendor(item, 'pic')"
                style="width: 100%"
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
                    {{ item.value }}
                  </div>
                </template>
              </el-autocomplete>
              <el-button
                type="primary"
                v-if="ruleForm.pic_id"
                @click="() => openModalContact('pic')"
                :icon="ElUserIcon"
              />
            </div>
          </el-form-item>

          <el-form-item prop="start_date" label="Tanggal Mulai Berlaku">
            <el-date-picker
              v-model="ruleForm.start_date"
              type="date"
              aria-label="Pilih Tanggal"
              placeholder="Pilih Tanggal"
              style="width: 100%"
              ,
            />
          </el-form-item>
          <el-form-item prop="end_date" label="Tanggal Akhir Berlaku">
            <el-date-picker
              v-model="ruleForm.end_date"
              type="date"
              aria-label="Pilih Tanggal"
              placeholder="Pilih Tanggal"
              style="width: 100%"
              ,
            />
          </el-form-item>
          <el-form-item label="File Lampiran" prop="files">
            <TrumsUploadFile v-model:file-list="fileList" />
          </el-form-item>
          <el-form-item label="Catatan" prop="note">
            <el-input
              v-model="ruleForm.note"
              type="textarea"
              placeholder="Masukkan deskripsi"
            />
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="mb-3" v-if="!loading" shadow="never">
        <el-form
          :label-position="'top'"
          label-width="auto"
          :model="tmpEditBulk"
        >
          <p class="font-bold my-3">Edit Sekaligus</p>
          <div
            class="flex mb-3 p-4 gap-3 border items-end border-gray-200 rounded-lg w-full bg-gray-50"
          >
            <el-form-item class="mb-0 form-bulk" label="Harga">
              <el-input
                v-model="tmpEditBulk.priceview"
                inputmode="decimal"
                placeholder="Harga"
                @input="
                  (val) => {
                    const parsed = parseCurrencyID(val);
                    tmpEditBulk.price = parsed;
                    tmpEditBulk.priceview = formatCurrencyID(parsed);
                  }
                "
                @blur="
                  () => {
                    tmpEditBulk.priceview = formatCurrencyID(tmpEditBulk.price);
                  }
                "
              />
            </el-form-item>
            <el-form-item class="mb-0 form-bulk" label="QTY">
              <el-input-number
                class="w-full"
                v-model="tmpEditBulk.qty"
                :min="1"
              />
            </el-form-item>
            <el-form-item class="mb-0 form-bulk" label="Unit">
              <el-autocomplete
                :fetch-suggestions="querySearchUnit"
                v-model="tmpEditBulk.unit_name"
                placeholder="Input Units"
                @select="(item: Record<string, any>) => {
  const unit = item as Unit;
  tmpEditBulk.unit_id = unit.unique_id;
  tmpEditBulk.unit_name = unit.name;
  tmpEditBulk.unit_version = unit.version;
                  }"
              />
            </el-form-item>
            <el-button
              type="primary"
              size="default"
              @click="applyBulkEdit"
              :disabled="!hasBulkInput"
            >
              Terapkan Semua
            </el-button>
            <el-button
              type="danger"
              size="default"
              @click="resetBulkEdit"
              plain
            >
              Reset All
            </el-button>
          </div>
        </el-form>

        <el-table :data="ruleForm.pricetag_item">
          <el-table-column prop="fileUploads" label="image" width="75">
            <template #default="scope">
              <ItemImageUpload
                v-model="scope.row.fileUploads"
                :image-url="scope.row.image"
                :show-text="false"
                @open-modal="() => openImageModal(scope.$index, scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column
            prop="item_name"
            label="item"
            class="my-0"
            width="300"
          >
            <template #default="scope">
              <el-autocomplete
                :disabled="loading"
                :fetch-suggestions="querySearchAsyncInventories"
                v-model="scope.row.item_name"
                placeholder="Cari item"
                @select="(item: Record<string, any>) => onHandleSelectItemAutocomplete(item, scope)"
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
                    <!-- Thumbnail file pertama -->
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

                    <!-- Informasi produk -->
                    <div class="flex-1 min-w-0">
                      <p style="line-height: 15px" class="font-bold truncate">
                        {{ item.catalogue_name || item.value }}
                      </p>
                      <p class="text-sm text-gray-500 truncate">
                        PN/SN: {{ item.sn_number || "Tidak Ada" }} | Brand:
                        {{ item.brand_name || "N/A" }}
                      </p>
                    </div>
                  </div>
                </template>
              </el-autocomplete>
            </template>
          </el-table-column>
          <el-table-column prop="sn" label="Serial Number" />
          <el-table-column prop="quantity" label="QTY" class="mb-0" width="200">
            <template #default="scope">
              <el-input-number v-model="scope.row.quantity" />
            </template>
          </el-table-column>
          <el-table-column prop="unit" label="Unit" width="100">
            <template #default="scope">
              <el-autocomplete
                :fetch-suggestions="querySearchUnit"
                v-model="scope.row.unit_name"
                placeholder="Input Units"
                @select="(item: Record<string, any>) => onHandleSelectItemAutocompleteUnit(item, scope)"
              />
            </template>
          </el-table-column>
          <el-table-column
            prop="selling_price"
            label="Harga"
            class="mb-0"
            width="150"
          >
            <template #default="scope">
              <el-form-item
                label=""
                :prop="`items.${scope.index}.price`"
                class="mb-0"
                style="margin-bottom: 0px !important"
              >
                <el-input
                  v-model="scope.row.displayPrice"
                  class="mb-0"
                  inputmode="decimal"
                  @input="
                    (val) => {
                      const parsed = parseCurrencyID(val);
                      scope.row.price = parsed;
                      scope.row.displayPrice = formatCurrencyID(parsed);
                    }
                  "
                  @blur="
                    () => {
                      scope.row.displayPrice = formatCurrencyID(
                        scope.row.price
                      );
                    }
                  "
                />
              </el-form-item>
            </template>
          </el-table-column>

          <el-table-column label="Aksi" width="100px" class="flex items-center">
            <template #default="scope" class="flex items-center">
              <el-popconfirm
                width="220"
                :icon="InfoFilled"
                icon-color="#626AEF"
                title="Are you sure to delete this?"
                @cancel="() => {}"
              >
                <template #reference>
                  <el-button type="danger" :icon="Delete" circle />
                </template>
                <template #actions="{ confirm, cancel }">
                  <el-button size="small" @click="cancel">No!</el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="() => onDeleteList(scope)"
                  >
                    Yes?
                  </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-button class="mt-4" style="width: 100%" @click="addNewLine">
          Tambahkan Baris Baru
        </el-button>
      </el-card>

      <AdjustmentTransactionComponent
        v-if="!loadingGetEditData"
        :references="references"
        @update:total="
          (value) => {
            console.log('update total', value);
          }
        "
      />

      <CustomPaymentTerm
        v-if="
          id === undefined && !loadingGetEditData && !canvassing_id && !loading
        "
        @update:term-of-payments="onUpdatePaymentTerms"
        type="input"
      />
      <CustomPaymentTerm
        v-else
        @update:term-of-payments="onUpdatePaymentTerms"
        :data="termOfPayments"
        type="input"
        v-if="!loadingGetEditData && !loading"
      />

      <el-card class="mb-3" shadow="never">
        <template #header>
          <div class="card-header">
            <span>Summary</span>
          </div>
        </template>

        <el-descriptions :column="1" border>
          <el-descriptions-item
            :width="100"
            label="Total Price"
            align="right"
            >{{ currency(totalPrice || 0) }}</el-descriptions-item
          >
          <el-descriptions-item
            :width="100"
            align="right"
            v-for="ref in references.filter(
              (value) => value.adjustment?.operator == 'minus'
            )"
            :key="ref.adjustment_id"
            :label="ref.adjustment?.name ?? ''"
            >{{
              currency(showTransactionAdjustmentValue(ref))
            }}</el-descriptions-item
          >
          <el-descriptions-item :width="100" label="Subtotal" align="right">{{
            currency(subtotal)
          }}</el-descriptions-item>
          <el-descriptions-item
            :width="100"
            align="right"
            v-for="ref in references.filter(
              (value) =>
                value.adjustment?.operator == 'plus' &&
                value.adjustment?.category == 'adjustment'
            )"
            :key="ref.adjustment_id"
            :label="ref.adjustment?.name ?? ''"
            >{{
              currency(showTransactionAdjustmentValue(ref))
            }}</el-descriptions-item
          >
          <el-descriptions-item
            :width="100"
            align="right"
            v-for="ref in references.filter(
              (value) =>
                value.adjustment?.category == 'transform' ||
                value.adjustment?.category == 'tax'
            )"
            :key="ref.adjustment_id"
            :label="ref.adjustment?.name ?? ''"
            >{{
              currency(showTransactionAdjustmentValue(ref))
            }}</el-descriptions-item
          >
          <el-descriptions-item
            :width="100"
            label="Grand Total"
            align="right"
            >{{ currency(grandTotal) }}</el-descriptions-item
          >
          <!-- <el-descriptions-item :width="100" label="Grand Total">{{ currency(grandTotal) }}</el-descriptions-item> -->
        </el-descriptions>
      </el-card>
    </div>

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
        <div v-if="modalImageFiles.length > 0" class="preview-section"></div>

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

    <el-drawer
      v-model="drawerCatalogue"
      title="Detail Item"
      :with-header="true"
    >
      <CatalogueAdd :catalogue_form="tmpCatalogue!" :loading="loading" />
      <template #footer>
        <div style="flex: auto">
          <el-button @click="handleCancel">Batal</el-button>
          <el-button type="primary" @click="() => handleSubmit(tmpCatalogue!)"
            >Simpan</el-button
          >
        </div>
      </template>
    </el-drawer>

    <!-- <ModalAdjustmentTransaction
      v-model:visible="visibleModalAdjustmentTransaction"
      @select-adjustment="handleSelectAdjustment"
      @create-new="() => console.log('create new')"
      :data="adjustmentTransactions.data?.value?.data ?? []"
      :search-params="querySearchAdjustmentTransaction"
    /> -->
    <!-- <el-dialog
      v-model="visibleModalNewAdjustment"
      title="Buat Biaya Lain"
      width="1000"
    >
      <AddAdjustment @submit="handleAdjustmentSubmit" />
    </el-dialog> -->
    <el-dialog v-model="dialogContact" title="Detail Kontak">
      <AddContact
        ref="formFieldsRefContact"
        :contact-data="stateActiveTypeContat == 'customer' ? ruleForm.to! : stateActiveTypeContat == 'pic' ? ruleForm.pic! : ruleForm.owner!"
        :loading="loading"
        @submit="handleSubmitContact"
        @reset="handleResetContact"
      />
    </el-dialog>
  </TrumsWrapper>
</template>
<script lang="tsx" setup>
import {
  Filter,
  InfoFilled,
  Delete,
  Picture,
  User as ElUserIcon,
} from "@element-plus/icons-vue";
import {
  ElCheckbox,
  ElIcon,
  ElPopover,
  type CheckboxValueType,
  type Column,
  type ComponentSize,
  type FormInstance,
  type FormRules,
  type SortBy,
  type UploadUserFile,
} from "element-plus";
import type { Catalogue } from "~/types/catalogue";
import type { Inventory } from "~/types/inventory";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import type { Unit } from "~/types/unit";
import CustomTable from "~/components/trums/table/customTable.vue";
import SkeletonPage from "~/components/trums/SkeletonPage.vue";
import Collapse from "~/components/trums/Collapse.vue";
import type { Contact } from "~/types/contact";
import type { FunctionalComponent } from "vue";
import type { Quotation } from "~/types/quotation";
import {
  OperationPriceTag,
  ReferencePriceTag,
  VariablePriceTag,
  type Pricetag,
  type Pricetag_condition,
  type Pricetag_item,
} from "~/types/pricetag";
import type { User } from "~/types/user";
import type { BaseResponse } from "~/types/response";
import type { Pricelist_item } from "~/types/pricelist";
import type { ItemSearch } from "~/types/item_search";
import type { Pagination } from "~/types/pagination";
import { CanvassingVendorStatus, type Canvassing } from "~/types/scm/canvasing";
import TrumsUploadFile from "~/components/trums/form/TrumsUploadFile.vue";
import type { AppFile } from "~/types/file";
import type { AddressType } from "~/types/address";
import PhotoWallUploads from "~/components/trums/PhotoWallUploads.vue";
import ItemImageUpload from "~/pages/sales/inquiry/components/ItemImageUpload.vue";
import CatalogueAdd from "~/components/trums/CatalogueAdd.vue";
import { getFirstFileUrl } from "#imports";
import { currency, displayAmount } from "#imports";
import {
  ReferenceAdjustment,
  type AdjustmentTransaction,
  type ReferenceTransactionAdjustment,
} from "~/types/attribute_adjustment";
import ModalAdjustmentTransaction from "~/components/trums/ModalAdjustmentTransaction.vue";
import AddAdjustment from "~/components/trums/AddAdjustment.vue";
import AdjustmentTransactionComponent from "~/components/trums/AdjustmentTransactionComponent.vue";
import CustomPaymentTerm from "~/components/trums/CustomPaymentTerm.vue";
import AddContact from "./AddContact.vue";
import {
  TermOfPaymentReference,
  type TermOfPayment,
} from "~/types/payment_term";

const props = defineProps<{
  onSubmit: (data: Pricetag | undefined) => void;
  data?: Pricetag;
}>();

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "pricetag-create",
});
const loadingGetEditData = ref<boolean>(true);
const loading = ref<boolean>(false);
const drawerCatalogue = ref<boolean>(false);
const visibleModalAdjustmentTransaction = ref(false);
const visibleModalNewAdjustment = ref(false);

const stateActiveTypeContat = ref<"vendor" | "customer" | "pic">("vendor");
const dialogContact = ref<boolean>(false);

const itemActive = ref<number>(-1);
const router = useRouter();
const api = useApi();

const goBack = () => router.back();
const popoverRef = ref();
const route = useRoute();
const canvassing_id = computed(() => route.query.canvassing_id as string);
const id = computed(() => route.query.id as string);
const fileList = ref<UploadUserFile[]>([]);
const formSize = ref<ComponentSize>("default");
const ruleFormRef = ref<FormInstance>();
const ruleForm = reactive<Pricetag>(
  props.data ?? {
    code: "",
    unique_id: "",
    name: "",
    location_id: "",
    start_date: Date.now(),
    end_date: Date.now(),
    start_date_view: "",
    end_date_view: "",
    owner_id: "",
    created_at: 0,
    created_by: "",
    updated_at: 0,
    version: 0,
    type: "in",
    note: "",
    subject: "",
    pricetag_item: [
      {
        catalogue: {
          id: null,
          unique_id: null,
          unique_code: null,
          name: "",

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
          type: "",
          created_at: null,
          created_by: null,
          updated_at: null,
          file_catalogues: [],
        },
        unique_id: null,
        tag_id: null,
        catalogue_id: "",
        inventory_id: "",
        inventory: null,
        price: 0,
        is_new: true,
        unit_id: "",
        unit_name: "",
        unit_version: 0,
        checked: false,
        quantity: 1,
        fileUploads: [],
      },
    ],

    location: {
      id: null,
      unique_id: null,
      unique_code: null,
      name: "",
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
      type: "",
      created_at: null,
      created_by: null,
      updated_at: null,
      file_catalogues: [],
      checked: undefined,
    },
    pricetag_condition: [],
    reference: null,
    reference_version: null,
    reference_id: null,
    to_id: "",
    to_name: "",
    files: [],
    pic_id: "",
    pic_name: "",
    pic_version: 0,
  }
);

const formatCurrencyID = (value: number | null) => {
  if (value === null || value === undefined) return "";
  return value.toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const tmpCatalogue = ref<Catalogue | null>(null);
const tmpEditBulk = ref<{
  qty: number;
  unit_id: string;
  unit_name: string;
  price: number;
  priceview: string;
  unit_version: number;
}>({
  price: 1,
  priceview: formatCurrencyID(0),
  qty: 1,
  unit_id: "",
  unit_name: "",
  unit_version: 0,
});

const config = useRuntimeConfig();
const baseImageURL = config.public.baseImageURL;

// special price
const contact_condition = ref<Pricetag_condition[]>([]);
const location_condition = ref<Pricetag_condition[]>([]);
const quantity = ref<Pricetag_condition>({
  operation: "greater_then",
  variable: VariablePriceTag.ITEM_QUANTITY,
  unique_id: null,
  tag_id: null,
  value: "0",
  variable_pricetag: {
    unique_id: "",
    name: VariablePriceTag.ITEM_QUANTITY,
    type: "variable",
    slug: "",
  },
  operation_pricetag: {
    unique_id: "",
    name: OperationPriceTag.GREATER_THAN,
    type: "operation",
    slug: "",
  },
});

const showImageModal = ref(false);
const activeItemIndex = ref(-1);
const activeItemData = ref<Pricetag_item | null>(null);
const modalImageFiles = ref<UploadUserFile[]>([]);
const photoWallRef = ref<InstanceType<typeof PhotoWallUploads>>();
const uploadAction = computed(
  () => `${config.public.apiBaseURL}/upload-item-image`
);

// const biayaLain = ref<number>(0);
// const potonganBiaya = ref<number>(0);
// const totalPajak = ref<number>(0);

const references = ref<ReferenceTransactionAdjustment[]>([]);

const collapse_special_price =
  ref<{ title: string; name: string; element: any }[]>();

const requestSearchLocation = ref<RequestSearch>({
  keyword: "",
  table: "",
  column: [],
  sort: null,
  limit: "50",
  offset: "1",
});

const requestSearchInventory = ref<RequestSearch>({
  keyword: "",
  table: "inventories",
  column: [
    {
      location_id: [""],
      unit_id: [],
    },
  ],
  sort: null,
  limit: "50",
  offset: "1",
});

const requestSearchUnit = ref<RequestSearch>({
  keyword: "",
  table: "units",
  column: [],
  sort: {
    column: "created_at",
    order: OrderColumn.ASC,
  },
  limit: "50",
  offset: "1",
});

const search_default = ref<RequestSearch>({
  keyword: "",
  table: "inventories",
  column: [
    {
      location_id: [""],
      contact_id: [""],
    },
  ],
  sort: {
    column: "created_at",
    order: OrderColumn.ASC,
  },
  limit: "50",
  offset: "1",
});

const querySearchAdjustmentTransaction = ref<RequestSearch>({
  keyword: "",
  table: "adjustments_transaction",
  column: [
    {
      operator: ["plus"],
    },
  ],
  sort: null,
  limit: "10",
  offset: "1",
  flag: "form",
});

const adjustmentTransactions = await useAsyncData(
  "search-adjustment",
  async () => {
    const res = await useFetchApi<ResponsePagination<AdjustmentTransaction[]>>(
      "/search",
      "search-adjustment",
      "post",
      querySearchAdjustmentTransaction.value
    );

    return res.data.value;
  }
);

const units = ref<Unit[]>([]);
const termOfPayments = ref<TermOfPayment[]>([]);

const rules = reactive<FormRules>({
  code: [
    {
      required: true,
      message: "Nomor Penawaran Tidak Boleh Kosong!",
      trigger: "blur",
    },
  ],
  owner_name: [
    { required: true, message: "Vendor Tidak Boleh Kosong!", trigger: "blur" },
  ],
  to_name: [
    { required: true, message: "Vendor Tidak Boleh Kosong!", trigger: "blur" },
  ],

  start_date: [
    {
      type: "date",
      required: true,
      message: "Tanggal Mulai Tidak Boleh Kosong!",
      trigger: "change",
    },
  ],

  pricetag_item: {
    type: "array",
    required: true,
    min: 1,
    message: "Item Tidak Boleh Kosong!",
    trigger: "change",
  },
});

const onUpdatePaymentTerms = (data: TermOfPayment[]) => {
  termOfPayments.value = data;
};

const totalPrice = computed(() => {
  return ruleForm.pricetag_item.reduce((accumulator, currentValue) => {
    return accumulator + currentValue.price;
  }, 0);
});
const subtotal = computed(() => {
  console.log("get minus", totalPrice.value);
  return Number(totalPrice.value) - Number(getMinus.value);
});

const applyBulkEdit = () => {
  ruleForm.pricetag_item.forEach((element) => {
    element.price = tmpEditBulk.value.price;
    (element.displayPrice = formatCurrencyID(element.price)),
      (element.quantity = tmpEditBulk.value.qty);
    element.unit_id = tmpEditBulk.value.unit_id;
    element.unit_name = tmpEditBulk.value.unit_name;
  });
};
const resetBulkEdit = () => {
  ruleForm.pricetag_item.forEach((element) => {
    element.price = 0;
    (element.displayPrice = "0"), (element.quantity = 0);
    element.unit_id = "";
    element.unit_name = "";
  });
};

const hasBulkInput = computed(() => {
  return (
    tmpEditBulk.value.price > 0 ||
    tmpEditBulk.value.qty > 0 ||
    tmpEditBulk.value.unit_id != ""
  );
});

watch(
  () => querySearchAdjustmentTransaction.value,
  () => {
    console.log("berubah");
    refreshNuxtData("search-adjustment");
  },
  { immediate: true }
);

const showTransactionAdjustmentValue = (
  ref: ReferenceTransactionAdjustment
) => {
  if (ref.include) {
    return 0;
  } else {
    if (
      ref.adjustment?.category == "tax" &&
      ref.adjustment.name.toLowerCase() === "ppn"
    ) {
      const dpp: ReferenceTransactionAdjustment | undefined =
        references.value.find(
          (value) => value.adjustment?.unique_code == "DPPL"
        );
      if (dpp) {
        const dppValue = getDPPFormula(dpp, subtotal.value || 0);
        return getPPNFormula(ref, dppValue || subtotal.value);
      } else {
        return getPPNFormula(ref, subtotal.value);
      }
    } else {
      return ref.type == "amount"
        ? ref.amount
        : displayAmount(ref, subtotal.value || 0);
    }
  }
};

const getMinus = computed(() => {
  var minus = 0;
  references.value
    .filter((value) => value.adjustment?.operator == "minus")
    .forEach((ref) => {
      if (ref.include == false) {
        minus += Number(ref.amount);
      }
    });

  return minus;
});
const getPlus = computed(() => {
  var plus = 0;

  references.value
    .filter(
      (value) =>
        value.adjustment?.operator == "plus" &&
        value.adjustment?.category === "adjustment"
    )
    .forEach((ref) => {
      if (ref.include == false) {
        plus += Number(ref.amount);
      }
    });

  return plus;
});

const dppComponent = computed(() => {
  return references.value.find(
    (value) =>
      value.adjustment?.category == "transform" &&
      value.adjustment?.unique_code == "DPPL"
  );
});
const handleSubmitContact = async (formData: Contact) => {
  try {
    const contact: Contact | null = await createNewContact({
      parent_id: formData.parent_id,
      parent_version: formData.parent_version,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      tax_id: formData.tax_id,
      website: formData.website,
      title: formData.title,
      is_personal: formData.is_personal,
      is_company: formData.is_company,
      tags: formData.tmp_tags?.join(","),
      unique_id: formData.unique_id,
      ownership: formData.ownership,
    });
    if (contact !== null) {
      if (stateActiveTypeContat.value == "customer") {
        ruleForm.to_id = contact.unique_id;
        ruleForm.to_name = contact.name;
        ruleForm.to_version = contact.version;
        ruleForm.to = contact;
      } else if (stateActiveTypeContat.value == "pic") {
        ruleForm.pic_id = contact.unique_id;
        ruleForm.pic_name = contact.name;
        ruleForm.pic_version = contact.version;
        ruleForm.pic = contact;
      } else if (stateActiveTypeContat.value == "vendor") {
        ruleForm.owner_id = contact.unique_id;
        ruleForm.owner_name = contact.name;
        ruleForm.owner = contact;
      }
    }
    dialogContact.value = false;
  } catch (error) {
    console.log("eror", error);
    ElMessage.error(`${error}`);
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

const handleResetContact = () => {
  dialogContact.value = false;
};

const getDetailContact = async (
  unique_id: string
): Promise<Contact | undefined> => {
  loading.value = true;
  try {
    const response = await useApiFetch<BaseResponse<Contact | undefined>>(
      `/contact-read/${unique_id}`,
      {
        method: "get",
      }
    );

    if (response.success) {
      console.log("response", response.data);
      return response.data;
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  } finally {
    loading.value = false;
  }
};

const openModalContact = async (type: "vendor" | "customer" | "pic") => {
  if (type == "pic") {
    const contact = await getDetailContact(ruleForm.pic_id || "");
    console.log("data kontak ", contact);
    if (contact !== undefined) {
      ruleForm.pic = contact;
    }
  } else if (type == "vendor") {
    const contact = await getDetailContact(ruleForm.owner_id || "");
    if (contact !== undefined) {
      ruleForm.owner = contact;
    }
  } else if (type == "customer") {
    const contact = await getDetailContact(ruleForm.to_id || "");
    if (contact !== undefined) {
      ruleForm.to = contact;
    }
  }
  stateActiveTypeContat.value = type;
  dialogContact.value = true;
};

const ppnComponent = computed(() => {
  const ppnComponentRef = references.value.find(
    (value) =>
      value.adjustment?.category == "tax" &&
      value.adjustment?.name.toLowerCase() === "ppn"
  );

  if (ppnComponentRef) {
    if (dppComponent.value) {
      const dppValue = getDPPFormula(dppComponent.value, subtotal.value || 0);
      if (ppnComponentRef.include) {
        return 0;
      } else {
        return getPPNFormula(ppnComponentRef, dppValue);
      }
    } else {
      if (ppnComponentRef.include) {
        return 0;
      } else {
        return getPPNFormula(ppnComponentRef, subtotal.value || 0);
      }
    }
  } else {
    return 0;
  }
});

const grandTotal = computed(() => {
  console.log("PPN", ppnComponent.value);
  return subtotal.value + getPlus.value + ppnComponent.value;
});

const getDPP = async (): Promise<AdjustmentTransaction | undefined> => {
  loading.value = true;
  try {
    querySearchAdjustmentTransaction.value.column = [
      {
        category: ["transform"],
        unique_code: ["DPPL"],
      },
    ];
    const response = await useFetchApi<
      ResponsePagination<AdjustmentTransaction[]>
    >("/search", "search-adjustment", "post", querySearchAdjustmentTransaction);

    if (response.status.value === "success") {
      if (
        response.data.value?.data != null &&
        response.data.value?.data != undefined &&
        response.data.value!.data.length > 0
      )
        return response.data.value!.data[0];
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  } finally {
    loading.value = false;
  }
};

const handleSelectAdjustment = (items: AdjustmentTransaction[]) => {
  items.forEach(async (element) => {
    if (
      element.category == "tax" &&
      element.name.toLocaleLowerCase() === "ppn"
    ) {
      const adj = await getDPP();
      if (adj) {
        references.value.push({
          unique_id: "",
          reference: ReferenceAdjustment.OFFER,
          reference_id: "",
          adjustment_id: adj.unique_id,
          type: adj.type,
          amount: adj.default_value,
          created_at: 0,
          value: adj.default_value,
          adjustment: adj,
          changeType: true,
          inc_tmp: "0",
          include: false,
        });
      }
    }

    references.value.push({
      unique_id: "",
      reference: ReferenceAdjustment.OFFER,
      reference_id: "",
      adjustment_id: element.unique_id,
      type: element.type,
      amount: element.default_value,
      created_at: 0,
      value: element.default_value,
      adjustment: element,
      changeType: true,
      inc_tmp: "0",
      include: false,
    });
  });
  visibleModalAdjustmentTransaction.value = false;
};

const handleAdjustmentSubmit = () => {
  visibleModalNewAdjustment.value = false;
  refreshNuxtData("search-adjustment");
};

const querySearchLocation = (queryString: string, cb: (arg: any) => void) => {
  requestSearchLocation.value.keyword = queryString;
  requestSearchLocation.value.table = "catalogues";
  requestSearchLocation.value.column = [
    {
      type: ["place"],
    },
  ];
  requestSearchLocation.value.flag = "form";

  useFetchApi<ResponsePagination<Catalogue[]>>(
    "/search",
    "warehouse",
    "post",
    requestSearchLocation.value
  )
    .then((response) => {
      if (response.status.value == "success") {
        const resultApi: Catalogue[] = response.data.value?.data ?? [];

        if (resultApi.length > 0) {
          cb(resultApi.map((value) => ({ ...value, value: value.name })));
        }
      }
    })
    .catch((error: any) => {
      ElMessage.error(error.response?.data?.message ?? error);
    });
};

// Handle cancel
const handleCancel = () => {
  // Reset form atau navigasi kembali
  console.log("Form cancelled");
  resetFormCatalogue();
  drawerCatalogue.value = false;
  // atau navigate back
};

// Fungsi untuk reset form
const resetFormCatalogue = () => {
  tmpCatalogue.value = null;
};

const handleSubmit = async (catalogue: Catalogue) => {
  loading.value = true;
  console.log("on submit");
  try {
    const catalogueInsert = (await create_catalogue(catalogue)) ?? undefined;

    if (catalogueInsert != undefined) {
      ruleForm.pricetag_item[itemActive.value].item_name =
        catalogueInsert?.name ?? "";
      // dataTable.value[itemActive.value].item_id = catalogueInsert?.unique_id ?? '';
      ruleForm.pricetag_item[itemActive.value].sn = catalogueInsert?.sn ?? "";
      ruleForm.pricetag_item[itemActive.value].catalogue = catalogueInsert;
      ruleForm.pricetag_item[itemActive.value].catalogue_id =
        catalogueInsert.unique_id;
      ruleForm.pricetag_item[itemActive.value].fileUploads = mapApiFilesView(
        catalogueInsert.files ?? []
      );
      ruleForm.pricetag_item[itemActive.value].image = getFirstFileUrl(
        catalogueInsert.files ?? []
      );
    } else {
      ElMessage.error("Kesalahan saat menyimpan data catalogue!");
    }
  } catch (error: any) {
    console.log(error);
    ElMessage.error(`Gagal menyimpan catalogue`);
  } finally {
    loading.value = false;
    drawerCatalogue.value = false;
  }
};

const querySearchQuotation = (queryString: string, cb: (arg: any) => void) => {
  requestSearchLocation.value.keyword = queryString;
  requestSearchLocation.value.table = "offers";
  requestSearchLocation.value.column = [];
  requestSearchLocation.value.flag = "form";

  useFetchApi<ResponsePagination<Quotation[]>>(
    "/search",
    "offers",
    "post",
    requestSearchLocation.value
  )
    .then((response) => {
      if (response.status.value == "success") {
        const resultApi: Quotation[] = response.data.value?.data ?? [];
        if (resultApi.length > 0) {
          cb(
            resultApi.map((value) => ({
              ...value,
              value: value.sourcing_number,
            }))
          );
        }
      }
    })
    .then((error: any) => {
      ElMessage.error(error.response?.data?.message ?? error);
    });
};

const openImageModal = (index: number, itemData: Pricetag_item) => {
  activeItemIndex.value = index;
  activeItemData.value = itemData;

  // Reset photoWallRef jika perlu (clear selection)
  if (photoWallRef.value) {
    photoWallRef.value.clearFiles?.();
  }

  // Load files dengan memastikan URL valid
  modalImageFiles.value = (itemData.fileUploads || []).map((file) => {
    // Clone file object
    const fileCopy = { ...file };

    // Jika file punya raw tapi URL invalid/expired, buat URL baru
    if (fileCopy.raw && (!fileCopy.url || !isValidUrl(fileCopy.url))) {
      fileCopy.url = URL.createObjectURL(fileCopy.raw);
    }

    return fileCopy;
  });

  console.log("modal file ", modalImageFiles.value);

  showImageModal.value = true;
};

const handleImageModalClose = () => {
  // Optional: Clear temporary blob URLs
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
  console.log("images", files);
  modalImageFiles.value = files;
};

const handleRemoveImageList = async (
  file: UploadUserFile,
  files: UploadUserFile[]
) => {
  if (file.raw) {
    console.log("file baru upload");
  } else {
    console.log("file lama", file.uid);
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

const cancelImageUpload = () => {
  showImageModal.value = false;
};

const saveItemImages = () => {
  if (activeItemIndex.value >= 0) {
    // Update dataTable dengan files baru
    ruleForm.pricetag_item[activeItemIndex.value].fileUploads = [
      ...modalImageFiles.value,
    ];

    // Set image URL untuk preview di tabel (mengambil gambar pertama)
    if (modalImageFiles.value.length > 0) {
      const firstFile = modalImageFiles.value[0];
      if (firstFile.url) {
        ruleForm.pricetag_item[activeItemIndex.value].image = firstFile.url;
      } else if (firstFile.raw) {
        ruleForm.pricetag_item[activeItemIndex.value].image =
          URL.createObjectURL(firstFile.raw);
      }
    } else {
      ruleForm.pricetag_item[activeItemIndex.value].image = "";
    }

    ElMessage.success(
      `Gambar untuk item ${activeItemIndex.value + 1} disimpan`
    );
  }

  showImageModal.value = false;
};

const querySearchVendors = (query: string, cb: (arg: any) => void) => {
  try {
    const request_search: RequestSearch = {
      column: [],
      keyword: query,
      limit: "50",
      offset: "1",
      sort: {
        column: "created_at",
        order: OrderColumn.ASC,
      },
      flag: "form",
      table: "contacts",
    };

    useFetchApi<ResponsePagination<Contact>>(
      "/search",
      "search-customer",
      "post",
      request_search
    ).then((response) => {
      if (response.status.value == "success") {
        const contacts: Contact[] = (response.data.value?.data ??
          []) as Contact[];
        if (contacts.length > 0) {
          cb([
            ...contacts.map((value) => ({
              value: value.name,
              unique_id: value.unique_id,
              data: value,
            })),
            {
              value: query,
              isNew: true,
              keyword: query,
            },
          ]);
        } else {
          cb([
            {
              value: query,
              isNew: true,
              keyword: query,
            },
          ]);
        }
      }
    });
  } catch (error) {
    console.error("Failed to fetch vendors", error);
    cb([]);
  }
};
const querySearchPIC = (query: string, cb: (arg: any) => void) => {
  try {
    const request_search: RequestSearch = {
      column: [
        {
          parent_id:
            ruleForm.type == "in" ? [ruleForm.owner_id] : [ruleForm.to_id],
        },
      ],
      keyword: query,
      limit: "50",
      offset: "1",
      sort: {
        column: "created_at",
        order: OrderColumn.ASC,
      },
      flag: "form",
      table: "contacts",
    };

    useFetchApi<ResponsePagination<Contact>>(
      "/search",
      "search-customer",
      "post",
      request_search
    ).then((response) => {
      if (response.status.value == "success") {
        const contacts: Contact[] = (response.data.value?.data ??
          []) as Contact[];
        if (contacts.length > 0) {
          cb([
            ...contacts.map((value) => ({
              value: value.name,
              unique_id: value.unique_id,
              data: value,
            })),
            {
              value: query,
              isNew: true,
              keyword: query,
            },
          ]);
        } else {
          cb([
            {
              value: query,
              isNew: true,
              keyword: query,
            },
          ]);
        }
      }
    });
  } catch (error) {
    console.error("Failed to fetch vendors", error);
    cb([]);
  }
};

const submitRemoveCost = async (ids: string[]) => {
  loading.value = true;
  try {
    const response = await useFetchApi(
      "/reference-transaction-delete",
      "remove-cost",
      "post",
      ids
    );
    if (response.status.value == "success") {
      ElMessage.success("Biaya Lainya Berhasil Dihapus!");
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  } finally {
    loading.value = false;
  }
};

const removeAnotherCost = async (adj_id: string) => {
  const findIndex = references.value.findIndex(
    (ref) => ref.adjustment_id === adj_id
  );
  const unique_id = references.value[findIndex].unique_id;
  if (unique_id != "") {
    await submitRemoveCost([unique_id]);
  }

  references.value.splice(findIndex, 1);
};

const querySearchUnit = (queryString: string, cb: (arg: any) => void) => {
  var params = { ...requestSearchUnit.value };
  params.keyword = queryString;
  params.table = "units";
  params.column = [];
  params.flag = "form";
  useFetchApi<ResponsePagination<Unit[]>>(
    "/search",
    "search-unit",
    "post",
    params
  )
    .then((response) => {
      if (response.status.value === "success") {
        const resultApi: Unit[] = response.data.value?.data ?? [];

        if (resultApi.length > 0) {
          cb(resultApi.map((value) => ({ ...value, value: value.name })));
        } else {
          cb([{ value: `Tambahkan ${queryString}`, label: `${queryString}` }]);
        }
      }
    })
    .catch((error: any) => {
      ElMessage.error(error.response?.data?.message);
    });
};

const createNewVendor = async (data: any) => {
  try {
    const response = await useFetchApi<BaseResponse<Contact>>(
      "/contact-create",
      "create-customer",
      "post",
      data
    );
    if (response.status.value == "success") {
      return response.data.value?.data;
    }
  } catch (error: any) {
    ElMessage.error(error.response.message ?? error);
  }
};

const onHandleSelectVendor = (item: any, type: "to" | "vendor" | "pic") => {
  if (item.isNew) {
    if (type == "vendor") {
      ruleForm.owner_name = item.keyword;
      ruleForm.owner = {
        id: 0,
        unique_id: "",
        unique_code: "",
        is_personal: false,
        is_company: false,
        internal_id: "",
        name: item.keyword,
        email: "",
        phone: null,
        tax_id: null,
        website: null,
        title: null,
        tags: "",

        created_at: 0,
        created_by: "",
        updated_at: 0,

        version: 0,
        address: [],
      };
      stateActiveTypeContat.value = "vendor";
    } else if (type == "pic") {
      ruleForm.pic_name = item.keyword;
      ruleForm.pic = {
        id: 0,
        unique_id: "",
        unique_code: "",
        is_personal: false,
        is_company: false,
        internal_id: "",
        name: item.keyword,
        email: "",
        phone: null,
        tax_id: null,
        website: null,
        title: null,
        tags: "",

        created_at: 0,
        created_by: "",
        updated_at: 0,

        version: 0,
        address: [],
      };
      stateActiveTypeContat.value = "pic";
    } else {
      ruleForm.to_name = item.keyword;
      ruleForm.to = {
        id: 0,
        unique_id: "",
        unique_code: "",
        is_personal: false,
        is_company: false,
        internal_id: "",
        name: item.keyword,
        email: "",
        phone: null,
        tax_id: null,
        website: null,
        title: null,
        tags: "",

        created_at: 0,
        created_by: "",
        updated_at: 0,

        version: 0,
        address: [],
      };
      stateActiveTypeContat.value = "customer";
    }

    dialogContact.value = true;
    // createNewVendor({ name: item.keyword }).then((customer) => {
    //   if (customer) {
    //     if (type == "vendor") {
    //       ruleForm.owner_id = customer.unique_id;
    //       ruleForm.owner_name = customer.name;
    //       ruleForm.owner = customer;
    //     } else if (type == "pic") {
    //       ruleForm.pic_id = customer.unique_id;
    //       ruleForm.pic_name = customer.name;
    //       ruleForm.pic_version = customer.version;
    //     } else {
    //       ruleForm.to_id = customer.unique_id;
    //       ruleForm.to_name = customer.name;
    //       ruleForm.to_version = customer.version;
    //       ruleForm.to = customer;
    //     }
    //   }
    // });
  } else {
    const customer = item.data as Contact;
    if (type == "vendor") {
      ruleForm.owner_id = customer.unique_id;
      ruleForm.owner_name = customer.name;
      ruleForm.owner = customer;
    } else if (type == "pic") {
      ruleForm.pic_id = customer.unique_id;
      ruleForm.pic_name = customer.name;
      ruleForm.pic_version = customer.version;
    } else {
      ruleForm.to_id = customer.unique_id;
      ruleForm.to_name = customer.name;
      ruleForm.to_version = customer.version;
      ruleForm.to = customer;
    }
  }
};

const handleSelectLocation = (item: Record<string, any>) => {
  const catalogue: Catalogue = item as Catalogue;

  ruleForm.location = catalogue;
  ruleForm.location_id = catalogue.unique_id!;
};

const addNewLine = () => {
  const newItem: {
    unique_id: string | null;
    tag_id: string | null;
    catalogue_id: string | null;
    catalogue: Catalogue | null;
    inventory_id: string;
    inventory: Inventory | null;
    price: number;
    is_new?: boolean;
    unit_id: string | null;
    unit_name: string | null;
    unit_version: number | null;
    quantity: number;
    fileUploads: UploadUserFile[];
  }[] = [
    ...ruleForm.pricetag_item,
    {
      catalogue: {
        id: null,
        unique_id: null,
        unique_code: null,
        name: "",
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
        type: "",
        created_at: null,
        created_by: null,
        updated_at: null,
        file_catalogues: [],
      },
      unique_id: null,
      tag_id: null,
      catalogue_id: "",
      inventory_id: "",
      inventory: null,
      price: 0,
      is_new: true,
      unit_id: "",
      unit_name: "",
      unit_version: 0,
      quantity: 1,
      fileUploads: [],
    },
  ];

  ruleForm.pricetag_item = newItem;
};

type SelectionCellProps = {
  value: boolean;
  intermediate?: boolean;
  onChange: (value: CheckboxValueType) => void;
};

// const checkSelect = () => da?.value?.data.some((row) => row.checked);

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

const querySearchAsyncInventories = (
  queryString: string,
  cb: (arg: any) => void
) => {
  const data = {
    location_id: ruleForm.location_id,
    keyword: queryString,
    limit: 50,
    flag: "form",
  };
  useFetchApi<ResponsePagination<ItemSearch[]>>(
    "/catalogues-inventory",
    "catalogues-inventory",
    "post",
    data
  )
    .then((response) => {
      if (response.status.value == "success") {
        const inventories: ItemSearch[] = response.data?.value?.data ?? [];

        if (inventories.length > 0) {
          const results = inventories.map((data: ItemSearch) => {
            return { isNew: false, value: `${data.catalogue_name}`, ...data };
          });
          cb([
            ...results,
            {
              isNew: true,
              value: `${queryString}`,
              name: `Tambahkan ${queryString}`,
            },
          ]);
        } else {
          cb([
            {
              isNew: true,
              value: `${queryString}`,
              name: `Tambahkan ${queryString}`,
            },
          ]);
        }
      }
    })
    .catch((error: any) => {
      ElMessage.error(`${error.response?.data?.message ?? error}`);
    });
};

const create_catalogue = async (catalogue: Catalogue) => {
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

    // Tambahkan file foto
    catalogue.file_catalogues.forEach((file) => {
      if (file.raw) {
        formData.append("files[]", file.raw);
      }
    });

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
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  } finally {
    loading.value = false;
  }
};

const onHandleSelectItemAutocomplete = async (
  record: Record<string, any>,
  scope: any
) => {
  if (record.isNew) {
    const catalogueInsert: Catalogue = {
      name: record.value,
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

    tmpCatalogue.value = catalogueInsert;
    itemActive.value = scope.$index;
    drawerCatalogue.value = true;

    // const selected: Catalogue|null = await create_catalogue(catalogueInsert) ?? null;

    // if(selected != null){
    //   ruleForm.pricetag_item[scope.$index].item_name = selected.name!;
    //   ruleForm.pricetag_item[scope.$index].catalogue_id = selected.unique_id!;
    //   ruleForm.pricetag_item[scope.$index].sn = selected.sn ?? 'Tidak Ada SN/PN';
    //   ruleForm.pricetag_item[scope.$index].quantity = 1;
    // }else{
    //   ElMessage.error(`Ops, Something wrong!!`);
    // }
  } else {
    const selected: ItemSearch = record as ItemSearch;
    ruleForm.pricetag_item[scope.$index].item_name = selected.catalogue_name!;
    ruleForm.pricetag_item[scope.$index].catalogue_id = selected.catalogue_id!;
    ruleForm.pricetag_item[scope.$index].sn =
      selected.sn_number ?? "Tidak Ada SN/PN";
    ruleForm.pricetag_item[scope.$index].inventory_id =
      selected.inventory_id ?? "";
    ruleForm.pricetag_item[scope.$index].unit_id = selected.unit_id ?? "";
    ruleForm.pricetag_item[scope.$index].unit_name = selected.unit_name ?? "";
    ruleForm.pricetag_item[scope.$index].quantity = 1;
    ruleForm.pricetag_item[scope.$index].catalogue_id = selected.catalogue_id;
    ruleForm.pricetag_item[scope.$index].fileUploads = mapApiFilesView(
      selected.files ?? []
    );
    ruleForm.pricetag_item[scope.$index].image = getFirstFileUrl(
      selected.files ?? []
    );
    // ruleForm.pricetag_item[scope.$index].catalogue = catalogue;
    ruleForm.pricetag_item[scope.$index].price = 0;
  }
};

const onHandleSelectItemAutocompleteUnit = (
  item: Record<string, any>,
  scope: any
) => {
  if (item.unique_id == undefined) {
    ruleForm.pricetag_item[scope.$index].unit_name = item.label;
    ruleForm.pricetag_item[scope.$index].unit_id = "";
  } else {
    ruleForm.pricetag_item[scope.$index].unit_name = item.value;
    ruleForm.pricetag_item[scope.$index].unit_id = `${item.id}`;
  }
};

const deleteItemInServer = (string: string[]) => {
  loading.value = false;
  try {
    useFetchApi<BaseResponse<any>>(
      "/pricetag-item-delete",
      "pricetag-item-delete",
      "post",
      string
    ).then((response) => {
      if (response.status.value == "success") {
        ElMessage.success(`Data Berhasil Di Hapus`);
        fetchInitialData();
      }
    });
  } catch (error: any) {
    ElMessage.error(`${error.response?.message ?? error}`);
  } finally {
    loading.value = false;
  }
};

const onDeleteList = (data: any) => {
  const price_list_item: Pricetag_item = data.row;
  // console.log(data);
  if (!price_list_item!.is_new) {
    deleteItemInServer([price_list_item.unique_id!]);
  } else {
    ruleForm.pricetag_item.splice(data.$index, 1);
  }
};

const onSort = (sortBy: SortBy) => {
  console.log("sort", sortBy.key);
  console.log(requestSearchInventory.value);
  const data: RequestSearch = { ...requestSearchInventory.value };
  data.sort = {
    column: sortBy.key.toString(),
    order:
      requestSearchInventory.value.sort?.order == OrderColumn.ASC
        ? OrderColumn.DESC
        : OrderColumn.ASC,
  };
  requestSearchInventory.value = data;
};

const onSubmit = async (formEl: FormInstance) => {
  loading.value = true;
  try {
    const cookie = useCookie("userdata");
    // ruleForm.owner_id = (cookie.value! as unknown as User).unique_id;

    const formData = new FormData();

    formData.append("unique_id", `${ruleForm.unique_id}`);
    formData.append("name", `${ruleForm.code}`);
    formData.append("location_id", `${ruleForm.location_id}`);
    formData.append("start_date", `${ruleForm.start_date / 1000}`);
    formData.append("end_date", `${ruleForm.end_date / 1000}`);
    formData.append("owner_id", `${ruleForm.owner_id}`);
    formData.append("reference", `${ruleForm.reference}`);
    formData.append("reference_id", `${ruleForm.reference_id}`);
    formData.append("reference_version", `${ruleForm.reference_version}`);
    formData.append("type", `${ruleForm.type}`);
    formData.append("subject", `${ruleForm.subject}`);
    formData.append("note", `${ruleForm.note}`);
    formData.append("to_id", `${ruleForm.to_id}`);
    formData.append("to_version", `${ruleForm.to_version}`);
    formData.append("category", `penawaran`);
    formData.append("pic_id", `${ruleForm.pic_id}`);
    formData.append("pic_name", `${ruleForm.pic_name}`);
    formData.append("pic_version", `${ruleForm.pic_version}`);

    // Append pricetag_item array
    ruleForm.pricetag_item.forEach((value, index) => {
      formData.append(
        `pricetag_item[${index}][unique_id]`,
        `${value.unique_id}`
      );
      formData.append(`pricetag_item[${index}][tag_id]`, `${value.tag_id}`);
      formData.append(
        `pricetag_item[${index}][catalogue_id]`,
        `${value.catalogue_id}`
      );
      formData.append(
        `pricetag_item[${index}][catalogue_version]`,
        `${value.catalogue?.version}`
      );
      formData.append(
        `pricetag_item[${index}][inventory_id]`,
        `${value.inventory_id}`
      );
      formData.append(`pricetag_item[${index}][price]`, `${value.price}`);
      formData.append(`pricetag_item[${index}][unit_id]`, `${value.unit_id}`);
      formData.append(
        `pricetag_item[${index}][unit_name]`,
        `${value.unit_name}`
      );
      formData.append(
        `pricetag_item[${index}][unit_version]`,
        `${value.unit_version}`
      );
      formData.append(`pricetag_item[${index}][quantity]`, `${value.quantity}`);

      (value.fileUploads ?? []).forEach((file) => {
        if (file.raw) {
          formData.append(`pricetag_item[${index}][files]`, file.raw as Blob);
        }
      });
    });

    (fileList.value ?? []).forEach((file, index) => {
      if (file.raw) {
        formData.append(`files[${index}]`, file.raw);
      }
    });

    // Get unique_id from cookie
    const unique_id = useCookie("tag_id");
    if (unique_id.value) {
      formData.append("unique_id", `${unique_id.value}`);
    }

    termOfPayments.value.forEach((top, indexTOP) => {
      formData.append(
        `payment_terms[${indexTOP}][unique_id]`,
        `${top.unique_id}`
      );
      formData.append(`payment_terms[${indexTOP}][name]`, `${top.name}`);
      formData.append(`payment_terms[${indexTOP}][value]`, `${top.value}`);
      formData.append(`payment_terms[${indexTOP}][unit]`, `${top.unit}`);
      formData.append(
        `payment_terms[${indexTOP}][term_of_payment]`,
        `${top.term_of_payment}`
      );
      formData.append(
        `payment_terms[${indexTOP}][duration]`,
        `${top.duration}`
      );
    });
    references.value.forEach((ref, index) => {
      formData.append(`ref_trans_adj[${index}][unique_id]`, `${ref.unique_id}`);
      formData.append(
        `ref_trans_adj[${index}][adjustment_id]`,
        `${ref.adjustment_id}`
      );
      formData.append(
        `ref_trans_adj[${index}][adjustment_version]`,
        `${ref.adjustment?.version}`
      );
      formData.append(`ref_trans_adj[${index}][value]`, `${ref.value}`);
      formData.append(`ref_trans_adj[${index}][amount]`, `${ref.amount}`);
      formData.append(
        `ref_trans_adj[${index}][party_type]`,
        `${ref.party_type}`
      );
      formData.append(`ref_trans_adj[${index}][party_id]`, `${ref.party_id}`);
      formData.append(`ref_trans_adj[${index}][type]`, `${ref.type}`);
      formData.append(`ref_trans_adj[${index}][include]`, `${ref.include}`);
    });

    const response = await useFetchApi<BaseResponse<Pricetag>>(
      "/pricetag-create",
      "pricelist-create",
      "post",
      formData
    );

    if (response.status.value == "success") {
      const pricetag: Pricetag | undefined = response.data.value?.data;
      ElMessage.success("Berhasil");

      return props.onSubmit(pricetag);
    }
  } catch (error: any) {
    ElMessage.error(error);
  } finally {
    loading.value = false;
  }
};

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      onSubmit(formEl);
    } else {
      console.log("error submit!", fields);
    }
  });
};

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

// watch(requestSearchInventory, fetchData, {immediate: true});

const parseCurrencyID = (val: string): number => {
  if (!val) return 0;

  // hapus ribuan
  let clean = val.replace(/\./g, "");
  // ubah koma ke titik
  clean = clean.replace(",", ".");
  // hanya angka & titik
  clean = clean.replace(/[^0-9.]/g, "");

  return Number(clean) || 0;
};

const fetchInitialData = async () => {
  loadingGetEditData.value = true;

  try {
    const response = await useFetchApi<BaseResponse<Pricetag>>(
      `/pricetag-read/${id.value}`,
      "pricetag-detail",
      "get",
      null
    );

    if (response.status.value == "success") {
      const pricetagEdit = response.data.value?.data as Pricetag;

      const dateViewStart = new Date(pricetagEdit.start_date * 1000);
      const dateViewEnd =
        pricetagEdit.end_date > 0
          ? new Date(pricetagEdit.end_date * 1000)
          : null;

      ruleForm.unique_id = pricetagEdit.unique_id;
      ruleForm.name = pricetagEdit.name;
      ruleForm.code = pricetagEdit.name;
      ruleForm.owner_id = pricetagEdit.owner_id;
      ruleForm.owner_name = pricetagEdit.owner?.name ?? "";
      ruleForm.to_id = pricetagEdit.to_id;
      ruleForm.to_name = pricetagEdit.to?.name;
      ruleForm.location_id = pricetagEdit.location_id;
      ruleForm.start_date = dateViewStart.getTime();
      ruleForm.reference = pricetagEdit.reference;
      ruleForm.reference_id = pricetagEdit.reference_id;
      if (dateViewEnd != null) {
        ruleForm.end_date = dateViewEnd.getTime();
      }
      // ruleForm.start_date_view = dateViewStart.toString();
      // if(pricetagEdit.end_date > 0){
      //   ruleForm.end_date_view = dateViewEnd!.toString();
      // }
      ruleForm.owner_id = pricetagEdit.owner_id;
      ruleForm.owner_name = pricetagEdit.owner?.name ?? "";
      ruleForm.created_at = pricetagEdit.created_at;
      ruleForm.created_by = pricetagEdit.created_by;
      ruleForm.updated_at = pricetagEdit.updated_at;
      ruleForm.version = pricetagEdit.version;

      ruleForm.pricetag_item = pricetagEdit.pricetag_item.map((value) => {
        const parsed = parseCurrencyID(`${value.price}`);
        return {
          ...value,
          price: parsed,
          displayPrice: formatCurrencyID(parsed),
          item_name: value.catalogue?.name ?? "",
          sn: value.catalogue?.sn ?? "N/A",
          is_new: false,
        };
      });

      console.log("pricetag item", ruleForm.pricetag_item);
      ruleForm.pricetag_condition = pricetagEdit.pricetag_condition;
      ruleForm.location = pricetagEdit.location;
      ruleForm.pic_id = pricetagEdit.pic_id;
      ruleForm.pic_name = pricetagEdit.pic_name;
      ruleForm.pic_version = pricetagEdit.pic_version;
      ruleForm.subject = pricetagEdit.subject;

      pricetagEdit.pricetag_condition.forEach((value) => {
        if (value.variable_pricetag?.name == VariablePriceTag.KONTAK) {
          console.log(value.value_data);
          contact_condition.value.push({
            ...value,
            value_display: value.value_data?.name ?? "",
            is_new: false,
          });
        } else if (value.variable_pricetag?.name == VariablePriceTag.LOCATION) {
          location_condition.value.push({
            ...value,
            ...value,
            value_display: value.value_data?.name ?? "",
            is_new: false,
          });
        } else if (
          value.variable_pricetag?.name == VariablePriceTag.ITEM_QUANTITY
        ) {
          quantity.value = value;
          quantity.value.is_new = false;
        }

        // initialSpecialPrice();
      });

      fileList.value = pricetagEdit.files.map((file: AppFile) => ({
        name: file.filename_original || "",
        url: `${baseImageURL}${file.image_path}/${file.filename}`,
        // status: 'success', // status penting untuk menunjukkan file sudah terupload
        // response: file, // simpan response original jika diperlukan
      }));

      references.value = (
        pricetagEdit.reference_transaction_adjustment ?? []
      ).map((ref) => ({
        ...ref,
        adjustment: ref.adjustments_transaction,
      }));
      console.log("reference", references.value);
      termOfPayments.value = pricetagEdit.payment_terms ?? [];
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.message ?? error}`);
  } finally {
    loadingGetEditData.value = false;
  }
};

const fetchCanvassing = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<Canvassing>>(
      `/canvassing-read/${canvassing_id.value}`,
      "detail-canvassing",
      "get",
      null
    );

    if (response.status.value == "success") {
      const canvassing: Canvassing | null = response.data.value?.data ?? null;
      console.log("data RAB", canvassing);
      if (canvassing) {
        ruleForm.reference = ReferencePriceTag.CANVASSING;
        ruleForm.reference_id = canvassing.unique_id;
        ruleForm.reference_version = canvassing.version;
        ruleForm.start_date_view = (Date.now() / 1000).toString();
        ruleForm.type = "out";
        ruleForm.to_id = canvassing.source?.request_to?.unique_id;
        ruleForm.to_name = canvassing.source?.request_to?.name;
        ruleForm.to_version = canvassing.source?.request_to?.version;

        if (canvassing.source) {
          ruleForm.pic_id = canvassing.source?.request_by?.unique_id;
          ruleForm.pic_name = canvassing.source?.request_by?.name;
          ruleForm.pic_version = canvassing.source?.request_by?.version;
        }
        ruleForm.pricetag_item = [];
        canvassing.canvassing_item.forEach((element) => {
          element.canvassing_vendor.forEach((cvendor) => {
            if (cvendor.status == CanvassingVendorStatus.SELECTED) {
              // console.log(
              //   "canvassing vendor selected",
              //   cvendor.catalogue?.name
              // );

              ruleForm.pricetag_item.push({
                unique_id: null,
                tag_id: null,
                catalogue: cvendor.catalogue ?? null,
                catalogue_id: cvendor.catalogue_id,
                inventory_id: "",
                inventory: null,
                price: element.unit_selling_price,
                displayPrice: formatCurrencyID(element.unit_selling_price),
                is_new: true,
                unit_id: cvendor.unit_id,
                unit_name: cvendor.unit_name,
                unit_version: cvendor.unit_version,
                sn: cvendor.catalogue?.sn ?? "N/A",
                checked: false,
                item_name: cvendor.catalogue?.name ?? "",
                quantity: 1,
                fileUploads: [],
              });
            }
          });
        });

        references.value = (canvassing.reference_transaction ?? []).map(
          (ref) => ({
            ...ref,
            unique_id: "",
            reference: ReferenceAdjustment.OFFER,
            adjustment: ref.adjustments_transaction,
          })
        );

        termOfPayments.value = (canvassing.payment_terms ?? []).map((ref) => ({
          ...ref,
          unique_id: "",
          reference: TermOfPaymentReference.OFFER,
          unique_code: "",
        }));
        console.log("payment terms", termOfPayments.value);
        // console.log("references", canvassing.reference_transaction);

        // ruleForm.pricetag_item = canvassing.canvassing_item.map((item) => ({
        //   unique_id: null,
        //   tag_id: null,
        //   catalogue: item.catalogue ?? null,
        //   catalogue_id: item.catalogue_id,
        //   inventory_id: "",
        //   inventory: null,
        //   price: item.unit_selling_price,
        //   displayPrice: formatCurrencyID(item.unit_selling_price),
        //   is_new: true,
        //   unit_id: item.unit_id,
        //   unit_name: item.unit_name,
        //   unit_version: item.unit_version,
        //   sn: item.catalogue?.sn ?? "N/A",
        //   checked: false,
        //   item_name: item.catalogue?.name ?? "",
        //   quantity: 1,
        //   fileUploads: [],
        // }));

        contact_condition.value.push({
          operation: "is_equal",
          variable: VariablePriceTag.KONTAK,
          unique_id: null,
          tag_id: null,
          value: `${canvassing.source?.request_by?.unique_id}`,
          value_display: `${canvassing.source?.request_by?.name}`,
          variable_pricetag: {
            unique_id: "",
            name: VariablePriceTag.KONTAK,
            type: "variable",
            slug: "",
          },
          operation_pricetag: {
            unique_id: "",
            name: OperationPriceTag.IS_EQUAL,
            type: "operation",
            slug: "",
          },
        });
      }
    }
  } catch (error) {
    ElMessage.error("Failed to fetch canvassing data");
    console.error(error);
    goBack();
  } finally {
    loading.value = false;
  }
};

const initialSetting = () => {
  const store = localStorage.getItem("setting");
  if (store) {
    const setting: {
      company: Contact;
      address: AddressType;
    } = JSON.parse(store);
    console.log("type", ruleForm.type);
    if (ruleForm.type == "in") {
      ruleForm.to = setting.company;
      ruleForm.to_id = setting.company.unique_id;
      ruleForm.to_version = setting.company.version;
      ruleForm.to_name = setting.company.name;
    } else {
      ruleForm.owner = setting.company;
      ruleForm.owner_id = setting.company.unique_id;
      ruleForm.owner_name = setting.company.name;
    }

    console.log("rule form", ruleForm);
  }
};

onMounted(() => {
  loadingGetEditData.value = false;
  if (canvassing_id.value) {
    fetchCanvassing();
  }

  if (id.value) {
    fetchInitialData();
  } else {
    initialSetting();
  }
});
</script>

<style scoped>
:deep(.form-bulk) {
  margin-bottom: 0px !important;
}
</style>
