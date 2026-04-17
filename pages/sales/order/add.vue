<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3"> New Sales Order </span>
      </template>
    </el-page-header>

    <el-card class="my-3" shadow="never">
      <template #header>
        <div class="card-header">
          <el-form-item>
            <el-button type="primary" @click="submitForm(ruleFormRef)"
              >Simpan</el-button
            >
            <el-button @click="resetForm(ruleFormRef)">Reset</el-button>
            <el-button @click="goBack">Batal</el-button>
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
        status-icon
      >
        <!-- Vendor Selection -->
        <el-form-item label="Kontak" prop="vendor_name">
          <el-autocomplete
            :fetch-suggestions="querySearchCustomer"
            v-model="ruleForm.vendor_name"
            placeholder="Cari Kontak"
            @select="onHandleSelectVendor"
          >
            <template #default="{ item }">
              <div v-if="item.isNew" class="flex items-center text-blue-500">
                <el-icon><Plus /></el-icon>
                <span class="ml-2">Tambahkan "{{ item.value }}"</span>
              </div>
              <div v-else>
                {{ item.value }}
                <span class="text-gray-400 ml-2">{{
                  item.additionalInfo
                }}</span>
              </div>
            </template>
          </el-autocomplete>
        </el-form-item>

        <!-- Purchase Order Information -->
        <el-form-item label="Nomor Referensi" prop="source_document">
          <el-input
            v-model="ruleForm.sourcing_document"
            placeholder="Masukkan nomor referensi"
          />
        </el-form-item>

        <el-form-item label="Alamat Pengiriman" prop="delivery_address_id">
          <el-autocomplete
            v-model="ruleForm.delivery_address_view"
            :fetch-suggestions="querySearchAddress"
            :trigger-on-focus="false"
            clearable
            class="inline-input w-50"
            placeholder="Cari Alamat"
            @select="(record) => handleSelectAddress(record)"
          >
            <template #default="{ item }">
              <div v-if="item.new">
                <div class="name text-blue-600">{{ item.name }}</div>
              </div>
              <div v-else>
                <div class="name">{{ item.name }}</div>
                <span class="street text-sm">{{ item.street }}</span>
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

        <el-form-item label="Tanggal PO" prop="date">
          <el-date-picker
            v-model="ruleForm.date"
            type="date"
            placeholder="Pilih tanggal"
            style="width: 100%"
          />
        </el-form-item>

        <!-- <el-form-item label="Tempo Payment" prop="is_tempo">
          <el-switch v-model="ruleForm.is_tempo" />
        </el-form-item> -->

        <el-form-item label="Estimasi Tiba" prop="expected_arrival">
          <el-date-picker
            v-model="ruleForm.expected_arrival!"
            type="date"
            placeholder="Pilih tanggal"
            style="width: 100%"
          />
        </el-form-item>

        <!-- Discount Section -->
        <!-- <el-form-item label="Diskon" prop="is_discount">
          <el-checkbox v-model="ruleForm.is_discount"
            >Tambahkan diskon</el-checkbox
          >
        </el-form-item>

        <template v-if="ruleForm.is_discount">
          <el-form-item label="Nilai Diskon" prop="discount">
            <el-input-number
              v-model="ruleForm.discount"
              :min="0"
              :precision="2"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="Satuan Diskon" prop="discount_unit">
            <el-select
              v-model="ruleForm.discount_unit"
              placeholder="Pilih satuan"
              style="width: 100%"
            >
              <el-option label="Persen (%)" value="percent" />
              <el-option label="Nominal" value="nominal" />
            </el-select>
          </el-form-item>
        </template> -->

        <el-form-item label="Status" prop="status">
          <el-select v-model="ruleForm.status" style="width: 100%">
            <el-option
              v-for="status in purchaseOrderStatusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="File Lampiran" prop="files">
          <TrumsUploadFile v-model:file-list="fileList" />
        </el-form-item>

        <el-form-item label="Informasi Tambahan" prop="additinal_information">
          <el-input
            v-model="ruleForm.additinal_information"
            type="textarea"
            placeholder="Masukkan informasi tambahan"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Items Section -->
    <el-card class="mb-3" shadow="never">
      <template #header>
        <div class="card-header flex justify-between items-center">
          <span>Items</span>
          <div class="flex space-x-2">
            <el-button type="primary" @click="openPricetagModal">
              Tambah item
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="ruleForm.items" border style="width: 100%">
        <el-table-column prop="catalogue_name" label="Item" />
        <el-table-column prop="quantity" label="Qty" width="200" align="center">
          <template #default="scope">
            <el-input-number
              v-model="scope.row.quantity"
              :min="1"
              @change="
                (value) => {
                  ruleForm.items[scope.$index].total_price =
                    Number(value) * scope.row.unit_price;
                }
              "
            />
          </template>
        </el-table-column>
        <el-table-column prop="unit_name" label="Satuan" width="100" />
        <el-table-column
          prop="unit_price"
          label="Harga Satuan"
          align="right"
          width="120"
        >
          <template #default="scope">
            {{ currency(scope.row.unit_price) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="total_price"
          label="Total Harga"
          align="right"
          width="120"
        >
          <template #default="scope">
            {{ currency(scope.row.total_price) }}
          </template>
        </el-table-column>
        <el-table-column label="Garansi" width="120">
          <template #default="scope">
            <el-checkbox v-model="scope.row.is_warranty">Garansi</el-checkbox>
          </template>
        </el-table-column>
        <el-table-column label="Waktu Garansi (Hari)" width="200">
          <template #default="scope">
            <el-input-number
              v-model="scope.row.warranty"
              :disabled="!scope.row.is_warranty"
              :min="1"
            />
          </template>
        </el-table-column>
        <el-table-column label="Aksi" width="100" fixed="right">
          <template #default="scope">
            <el-button
              type="danger"
              :icon="Delete"
              circle
              @click="removeItem(scope.$index)"
            />
          </template>
        </el-table-column>
      </el-table>
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
      v-if="id === undefined && !loadingGetEditData"
      @update:term-of-payments="onUpdatePaymentTerms"
      type="input"
    />
    <CustomPaymentTerm
      v-else
      @update:term-of-payments="onUpdatePaymentTerms"
      :data="termOfPayments"
      type="input"
      v-if="!loadingGetEditData"
    />

    <el-card class="mb-3" shadow="never">
      <template #header>
        <div class="card-header">
          <span>Summary</span>
        </div>
      </template>

      <el-descriptions :column="1" border>
        <el-descriptions-item :width="100" label="Total Price" align="right">{{
          currency(totalPrice || 0)
        }}</el-descriptions-item>
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
        <el-descriptions-item :width="100" label="Grand Total" align="right">{{
          currency(grandTotal)
        }}</el-descriptions-item>
        <!-- <el-descriptions-item :width="100" label="Grand Total">{{ currency(grandTotal) }}</el-descriptions-item> -->
      </el-descriptions>
    </el-card>

    <ModalAdjustmentTransaction
      v-model:visible="visibleModalAdjustmentTransaction"
      @select-adjustment="handleSelectAdjustment"
      @create-new="visibleModalNewAdjustment = true"
      :data="adjustmentTransactions.data?.value?.data ?? []"
      :search-params="querySearchAdjustmentTransaction"
    />

    <el-dialog
      v-model="visibleModalNewAdjustment"
      title="Buat Biaya Lain"
      width="1000"
    >
      <AddAdjustment @submit="handleAdjustmentSubmit" />
    </el-dialog>

    <el-dialog
      v-model="visiblePricetagModal"
      title="Pilih Item dari Pricetag"
      width="1000"
    >
      <el-row :gutter="20" class="mb-3">
        <el-col :span="4">
          <el-input
            v-model="request_search_pricetag_item.keyword"
            placeholder="Cari item..."
            clearable
          />
        </el-col>
        <el-col :span="4">
          <el-button
            type="default"
            :icon="Plus"
            @click="
              () => {
                visibleModalPricetagNewItem = true;
              }
            "
            >Buat Harga Baru</el-button
          >
        </el-col>
        <el-col :span="4">
          <el-button
            type="primary"
            :disabled="selectedPricetagItems.length == 0"
            @click="addSelectedPricetagItems"
          >
            Tambahkan Selected ({{ selectedPricetagItems.length }})
          </el-button>
        </el-col>
      </el-row>

      <el-table
        :data="filteredPricetagItems.data.value?.data ?? []"
        style="width: 100%"
        @selection-change="handlePricetagSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="catalogue.name" label="Item">
          <template #default="scope">
            {{ scope.row.catalogue?.name || "-" }}
          </template>
        </el-table-column>
        <el-table-column prop="pricetag.name" label="Nomor Penawaran">
          <template #default="scope">
            {{ scope.row.pricetag?.unique_code || "N/A" }}
          </template>
        </el-table-column>
        <el-table-column prop="" label="Tgl Berlaku" width="200">
          <template #default="scope">
            {{
              (scope.row.pricetag as Pricetag).end_date != undefined &&
              (scope.row.pricetag as Pricetag).end_date != null
                ? formatLocalDate((scope.row.pricetag as Pricetag).end_date)
                : "-"
            }}
          </template>
        </el-table-column>
        <el-table-column prop="price" label="Harga" width="120" align="right">
          <template #default="scope">
            {{ formatCurrency(scope.row.price) }}
          </template>
        </el-table-column>
        <el-table-column prop="unit_name" label="Satuan" width="100" />
      </el-table>

      <template #footer>
        <div class="flex justify-end mt-3">
          <el-pagination
            background
            layout="prev, pager, next, sizes, total"
            :total="filteredPricetagItems?.data?.value?.total_data ?? 0"
            :current-page="Number(request_search_pricetag_item.offset)"
            :page-size="Number(request_search_pricetag_item.limit)"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </div>
      </template>
    </el-dialog>
  </TrumsWrapper>

  <el-dialog v-model="dialogNewAddress" title="Buat Alamat Baru" width="500">
    <FormAddress
      @success="onAddressNew"
      @back="() => (dialogNewAddress = false)"
      :onSetInitital="stateFormAddress == 'New' ? {
          contact_id: ruleForm.vendor_id,
          contact_name: ruleForm.vendor_name,
          address_name: '',
          unique_id: '',
          street: '',
          codepos: '',
          village: '',
          village_id: '',
          city: '',
          regency: '',
          province: '',
          address_view: '',
        } : {
          contact_id: ruleForm.vendor_id,
          contact_name: ruleForm.vendor_name,
          address_name: address?.address_name,
          unique_id: address?.unique_id,
          street: address?.street,
          codepos: address?.codepos,
          village: address?.village,
          village_id: address?.village_id,
          city: address?.city,
          regency: address?.regency,
          province: address?.province,
          address_view: address != null ? generateAddressView(address!) : ''
        }"
    />
  </el-dialog>

  <el-dialog
    v-model="visibleModalPricetagNewItem"
    title="Buat Penawaran Baru"
    width="1000"
  >
    <AddPriceTagComponent
      v-on:submit="
        () => {
          visibleModalPricetagNewItem = false;
          refreshNuxtData('search-pricetag-item');
        }
      "
    />
  </el-dialog>
</template>

<script lang="ts" setup>
import { Delete, Plus, RemoveFilled, Edit } from "@element-plus/icons-vue";
import {
  ElMessage,
  type FormInstance,
  type FormRules,
  type UploadUserFile,
} from "element-plus";
import {
  PurchaseOrderItemStatus,
  PurchaseOrderStatus,
  type PurchaseOrder,
  type PurchaseOrderItem,
} from "~/types/scm/purchase_order";
import type { Contact } from "~/types/contact";
import {
  CanvassingVendorStatus,
  PaymentTerm,
  type Canvassing,
  type CanvassingItem,
  type CanvassingVendor,
} from "~/types/scm/canvasing";
import {
  ReferencePriceTag,
  type Pricetag,
  type Pricetag_item,
} from "~/types/pricetag";
import type { RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import type { BaseResponse } from "~/types/response";
import type { AddressType } from "~/types/address";
import TrumsUploadFile from "~/components/trums/form/TrumsUploadFile.vue";
import { DiscountUnit } from "~/types/scm/offers";
import { PaymentMethod } from "~/types/finance/bill";
import AddPriceTagComponent from "~/components/trums/AddPriceTagComponent.vue";
import {
  FeeType,
  ReferenceAdjustment,
  type AdjustmentTransaction,
  type ReferenceTransactionAdjustment,
} from "~/types/attribute_adjustment";
import ModalAdjustmentTransaction from "~/components/trums/ModalAdjustmentTransaction.vue";
import AddAdjustment from "~/components/trums/AddAdjustment.vue";
import { refreshNuxtData } from "#app";
import { formatLocalDate } from "#imports";
import { generateAddressView } from "#imports";
import type { TermOfPayment } from "~/types/payment_term";
import AdjustmentTransactionComponent from "~/components/trums/AdjustmentTransactionComponent.vue";
import CustomPaymentTerm from "~/components/trums/CustomPaymentTerm.vue";
import { currency } from "#imports";
import FormAddress from "~/components/trums/FormAddress.vue";

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "purchase-order-create",
  name: "Create Sales Order",
});

const fileList = ref<UploadUserFile[]>([]);

const router = useRouter();

const ruleFormRef = ref<FormInstance>();
const loading = ref(false);
const loadingGetEditData = ref<boolean>(false);
const stateFormAddress = ref<"New" | "Edit">("New");
const dialogNewAddress = ref(false);
const visibleModalPricetagNewItem = ref<boolean>(false);
const visibleModalAdjustmentTransaction = ref(false);
const visibleModalNewAdjustment = ref(false);

const route = useRoute();
const id = computed(() => route.query.id as string);
const quotation_id = computed(() => route.query.quotation_id as string);

const address = ref<AddressType | null>(null);

const setInitialAddress = () => {
  if (ruleForm.vendor_id == "") {
    ElMessage.error(`Pilih Customer Terlebih Dahulu!`);
  }
};

// Status options
const purchaseOrderStatusOptions = [
  { value: PurchaseOrderStatus.DRAFT, label: "Draft" },
  { value: PurchaseOrderStatus.PENDING_APPROVAL, label: "Pending Approval" },
  { value: PurchaseOrderStatus.APPROVED, label: "Approved" },
];

// Form data
const ruleForm = reactive({
  unique_id: "",
  vendor_id: "",
  vendor_parent_id: "",
  vendor_name: "",
  vendor_version: 0,
  sourcing_document: "",
  delivery_address_id: "",
  delivery_address_version: 0,
  delivery_address_view: "",
  expected_arrival: null as number | null,
  date: Date.now(),
  is_discount: false,
  is_tempo: false,
  payment_term: PaymentTerm.CBD,
  payment_term_value: 0,
  payment_term_unit: "day",
  payment_method: PaymentMethod.Giro,
  discount: 0,
  discount_unit: "percent" as DiscountUnit,
  delivery_cost: 0,
  total_price: 0,
  additinal_information: "",
  status: PurchaseOrderStatus.DRAFT,
  items: [] as PurchaseOrderItem[],
});

// Vendor data
const vendorOptions = ref<Contact[]>([]);
const vendorLoading = ref(false);
const deliveryAddresses = ref<any[]>([]);

// Modals
const visibleCanvassingModal = ref(false);
const visiblePricetagModal = ref(false);

// Search data
const canvassingSearch = ref({ keyword: "" });
const pricetagSearch = ref({ keyword: "" });

// Selection data
const selectedCanvassingItems = ref<CanvassingVendor[]>([]);
const selectedPricetagItems = ref<Pricetag_item[]>([]);

// Sample data (replace with API calls)
const canvassingItems = ref<CanvassingVendor[]>([]);

const pricetagItems = ref<Pricetag_item[]>([]);

const termOfPayments = ref<TermOfPayment[]>([]);

const references = ref<ReferenceTransactionAdjustment[]>([]);

const query_search = ref<RequestSearch>({
  column: [],
  keyword: "",
  table: "contacts",
  sort: null,
  offset: "1",
  limit: "50",
});

const query_search_canvasing_item = ref<RequestSearch>({
  column: [
    {
      vendor_id: [],
    },
  ],
  keyword: "",
  table: "canvassing_vendor",
  sort: null,
  offset: "1",
  limit: "50",
});
const request_search_pricetag_item = ref<RequestSearch>({
  column: [],
  keyword: "",
  table: "pricetag_item",
  sort: null,
  offset: "1",
  limit: "10",
});

const querySearchAdjustmentTransaction = ref<RequestSearch>({
  keyword: "",
  table: "adjustments_transaction",
  column: [],
  sort: null,
  limit: "10",
  offset: "1",
});

const paymentMethods = [
  { value: PaymentMethod.Cash, label: "Cash" },
  { value: PaymentMethod.BankTransfer, label: "Bank Transfer" },
  { value: PaymentMethod.Giro, label: "Giro" },
];

const filteredPricetagItems = await useAsyncData(
  "search-pricetag-item",
  async () => {
    const res = await useFetchApi<ResponsePagination<Pricetag_item[]>>(
      `/search`,
      "search-pricetag-item",
      "post",
      request_search_pricetag_item.value
    );
    return res.data.value;
  }
);
const adjustmentTransactions = await useFetchApi<
  ResponsePagination<AdjustmentTransaction[]>
>(
  "/search",
  "search-adjustment",
  "post",
  querySearchAdjustmentTransaction.value
);

const getMinus = computed(() => {
  var minus = 0;
  references.value
    .filter((value) => value.adjustment?.operator == "minus")
    .forEach((ref) => {
      if (ref.include == false) {
        console.log("get minus ", ref.type);
        minus +=
          ref.type == FeeType.AMOUNT
            ? Number(ref.amount)
            : displayAmount(ref, totalPrice.value);
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
        plus +=
          ref.type == FeeType.AMOUNT
            ? Number(ref.amount)
            : displayAmount(ref, subtotal.value);
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

const subtotal = computed(() => {
  const sum = totalPrice.value;
  console.log("get minus", getMinus.value);
  return sum - (getMinus.value || 0);
});
const grandTotal = computed(() => {
  console.log("subtotal", subtotal);
  console.log("plus", getPlus.value);
  console.log("ppn", ppnComponent.value);
  return subtotal.value + getPlus.value + ppnComponent.value;
});

const calculatedDiscount = computed(() => {
  if (!ruleForm.is_discount) return 0;
  if (ruleForm.discount_unit === "percent") {
    return (subtotal.value * ruleForm.discount) / 100;
  }
  return ruleForm.discount;
});

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
      if (ref.adjustment?.operator == "minus") {
        return ref.type == "amount"
          ? ref.amount
          : displayAmount(ref, totalPrice.value || 0);
      } else if (ref.adjustment?.operator == "plus") {
        return ref.type == "amount"
          ? ref.amount
          : displayAmount(ref, subtotal.value || 0);
      }
    }
  }
};

const totalPrice = computed(() => {
  const total = ruleForm.items.reduce((accumulator, currentValue) => {
    return accumulator + currentValue.total_price;
  }, 0);

  console.log("total_price", total);

  return total;
});

const onUpdatePaymentTerms = (data: TermOfPayment[]) => {
  termOfPayments.value = data;
};

const handlePageChange = (page: number) => {
  request_search_pricetag_item.value.offset = `${page}`;
};

const handleSizeChange = (size: number) => {
  request_search_pricetag_item.value.limit = `${size}`;
};

function displayAmount(ref: any, multiplier: number) {
  if (ref.type === "percent") {
    return (multiplier || 0) * (ref.amount / 100);
  } else {
    return ref.amount;
  }
}

const displayPercentage = (ref: any, multiplier: number): Number => {
  console.log(ref);
  if (ref.type === "amount") {
    return ref.amount / multiplier || 0 * 100;
  } else {
    return ref.amount;
  }
};

const removeReferenceTransaction = async (
  adjustmentTransactions: ReferenceTransactionAdjustment
) => {
  if (adjustmentTransactions.unique_id) {
    loading.value = true;
    try {
      const response = await useFetchApi<BaseResponse<any>>(
        "/reference-transaction-delete",
        "remove-reference-transaction",
        "post",
        [adjustmentTransactions.unique_id]
      );
      if (response.status.value === "failed") {
        return;
      }
    } catch (error: any) {
      ElMessage.error(`${error.response?.message ?? error}`);
      return;
    } finally {
      loading.value = false;
    }
  }

  references.value = references.value.filter(
    (ref) => ref.adjustment_id == adjustmentTransactions.adjustment_id
  );
};

// Validation rules
const rules: FormRules = {
  vendor_name: [
    { required: true, message: "Vendor wajib dipilih", trigger: "change" },
  ],
  sourcing_document: [
    { required: true, message: "Nomor referensi wajib diisi", trigger: "blur" },
  ],
  delivery_address_id: [
    {
      required: true,
      message: "Alamat pengiriman wajib dipilih",
      trigger: "change",
    },
  ],
  status: [
    { required: true, message: "Status wajib dipilih", trigger: "change" },
  ],
};

// Methods
const goBack = () => router.back();

const handleAdjustmentSubmit = () => {
  visibleModalNewAdjustment.value = false;
  refreshNuxtData("search-adjustment");
};

const handleSelectAdjustment = (items: AdjustmentTransaction[]) => {
  items.forEach((element) => {
    const exist = references.value.findIndex(
      (value) => value.adjustment_id == element.unique_id
    );
    if (exist < 0) {
      references.value.push({
        unique_id: "",
        reference: ReferenceAdjustment.PURCHASEORDER,
        reference_id: "",
        adjustment_id: element.unique_id,
        type: element.type,
        amount: element.default_value,
        created_at: 0,
        value: element.default_value,
        adjustment: element,
        changeType: true,
      });
    }
  });
  visibleModalAdjustmentTransaction.value = false;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const querySearchCustomer = (query: string, cb: (arg: any) => void) => {
  try {
    const request_contact = { ...query_search.value };

    request_contact.table = "contacts";
    request_contact.keyword = query;
    request_contact.flag = "form";

    useFetchApi<ResponsePagination<Contact>>(
      "/search",
      "search-vendor",
      "post",
      request_contact
    ).then((response) => {
      if (response.status.value == "success") {
        const contacts: Contact[] = (response.data.value?.data ??
          []) as Contact[];
        if (contacts.length > 0) {
          cb(
            contacts.map((value) => ({
              value: value.name,
              unique_id: value.unique_id,
              data: value,
            }))
          );
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
    console.error("Failed to fetch customers", error);
    cb([]);
  }
};

const generateResultSearchAddress = (address: AddressType) => {
  const name = `(${address.contact_name}) - ${address.village}, ${address.city}, ${address.regency}, ${address.province}`;
  const street = `${address.street}`;
  const address_id = address.unique_id;
  const address_version = address.version;
  return {
    value: name,
    name: name,
    street: street,
    address_id: address_id,
    address_version: address.version,
    data: address,
  };
};

const handleEditAddress = (addressEdit: AddressType) => {
  address.value = addressEdit;
  stateFormAddress.value = "Edit";
  dialogNewAddress.value = true;
  console.log("state", stateFormAddress.value);
};

const handleDeleteAddress = () => {
  address.value = null;
  ruleForm.delivery_address_id = "";
  ruleForm.delivery_address_version = 0;
  ruleForm.delivery_address_view = "";
};

const querySearchAddress = (queryString: string, cb: (arg: any) => void) => {
  const newSearch: RequestSearch = {
    keyword: queryString,
    table: "address",
    column: [
      {
        contact_id: [ruleForm.vendor_id, ruleForm.vendor_parent_id],
      },
    ],
    limit: "100",
    offset: "1",
    sort: null,
  };

  useFetchApi<ResponsePagination<AddressType[]>>(
    "/search",
    "address",
    "post",
    newSearch
  ).then((response) => {
    if (response.status.value == "success") {
      const resultApi: AddressType[] = response.data.value?.data!;

      if (resultApi.length > 0) {
        cb([
          ...resultApi.map(generateResultSearchAddress),
          {
            value: `Buat Alamat Baru`,
            new: true,
            name: `Buat Alamat Baru`,
            street: "",
          },
        ]);
      } else {
        cb([
          {
            value: `Buat Alamat Baru`,
            new: true,
            name: `Buat Alamat Baru`,
            street: "",
          },
        ]);
      }
    }
  });
};

const handleSelectAddress = (record: Record<string, any>) => {
  if (record.new) {
    stateFormAddress.value = "New";
    ruleForm.delivery_address_view = "";
    dialogNewAddress.value = true;
    console.log("state", stateFormAddress.value);
  } else {
    console.log(record);
    const addressType: AddressType = record.data as AddressType;
    ruleForm.delivery_address_id = addressType.unique_id;
    ruleForm.delivery_address_version = addressType.version;
    ruleForm.delivery_address_view = "";
    address.value = addressType;
  }
};

const onAddressNew = (value: AddressType) => {
  const addressView = generateResultSearchAddress(value);
  ruleForm.delivery_address_id = value.unique_id;
  ruleForm.delivery_address_version = value.version;
  ruleForm.delivery_address_view = addressView.name;
  address.value = value;
  dialogNewAddress.value = false;
};

watch(
  () => request_search_pricetag_item.value,
  () => {
    filteredPricetagItems.refresh();
  },
  { deep: true }
);

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

const onHandleSelectVendor = (item: any) => {
  if (item.isNew) {
    createNewVendor(item.query).then((customer) => {
      if (customer) {
        ruleForm.vendor_id = customer.unique_id;
        ruleForm.vendor_name = customer.name;
        ruleForm.vendor_version = customer.version;
        ruleForm.vendor_parent_id = customer.parent_id ?? "";
        request_search_pricetag_item.value.column = [
          {
            pricetag: {
              category: ["penawaran"],
              to_id: [customer.unique_id],
            },
          },
        ];
      }
    });
  } else {
    const customer = item.data as Contact;
    ruleForm.vendor_id = customer.unique_id;
    ruleForm.vendor_name = customer.name;
    ruleForm.vendor_version = customer.version || 1;
    ruleForm.vendor_parent_id = customer.parent_id ?? "";
    request_search_pricetag_item.value.column = [
      {
        pricetag: {
          category: ["penawaran"],
          to_id: [customer.unique_id],
        },
      },
    ];
  }
};

const loadVendorAddresses = async (vendorId: string) => {
  // try {
  //   // Replace with actual API call
  //   const response = await $fetch(`/api/vendors/${vendorId}/addresses`)
  //   deliveryAddresses.value = response.data
  // } catch (error) {
  //   ElMessage.error('Gagal memuat alamat vendor')
  // }
};

const loadCanvassingItems = async () => {
  // try {
  //   // Replace with actual API call - filter by approved status and vendor
  //   const response = await useFetch<ResponsePagination<CanvassingVendor[]>>('/search', 'search-canvasing-vendor', 'post', query_search_canvasing_item.value);
  //   if(response)
  // } catch (error) {
  //   ElMessage.error('Gagal memuat item canvassing')
  // }
};

const loadPricetagItems = async (vendorId: string) => {};

const openCanvassingModal = () => {
  if (!ruleForm.vendor_id) {
    ElMessage.warning("Pilih vendor terlebih dahulu");
    return;
  }
  visibleCanvassingModal.value = true;
};

const openPricetagModal = () => {
  if (!ruleForm.vendor_id) {
    ElMessage.warning("Pilih vendor terlebih dahulu");
    return;
  }
  visiblePricetagModal.value = true;
};

const handleCanvassingSelectionChange = (selection: CanvassingVendor[]) => {
  selectedCanvassingItems.value = selection;
};

const handlePricetagSelectionChange = (selection: Pricetag_item[]) => {
  selectedPricetagItems.value = selection;
};

const addSelectedCanvassingItems = () => {
  selectedCanvassingItems.value.forEach((value) => {
    ruleForm.items.push({
      id: 0,
      unique_id: "",
      order_id: "",
      vendor_id: value.vendor_id!,
      vendor_version: value.vendor?.version ?? 1,
      catalogue_id: value.catalogue_id ?? "",
      catalogue_name: value.catalogue?.name ?? "",
      catalogue_version: value.catalogue?.version ?? 1,
      quantity: value.quantity,
      unit_price: value.unit_price,
      total_price: value.total_price,
      is_warranty: false,
      warranty: 0,
      warranty_unit: "hari",
      is_discount: false,
      delivery_cost: 0,
      version: 0,
      created_at: 0,
      created_by: 0,
      updated_at: 0,
      unit_id: value.unit_id,
      unit_name: value.unit_name,
      pr_item_request_trail_id:
        value.canvassing_item?.item_request_trail_id ?? "",
      pr_item_request_trail_version:
        value.canvassing_item?.item_request_trail_version ?? 0,
      item_request_trail_id: "",
      item_request_trail_version: 0,
      item_request_trail: value.canvassing_item?.item_request_trail,
      order_version: 1,
      status: PurchaseOrderItemStatus.DRAFT,
    });
  });

  visibleCanvassingModal.value = false;
  selectedCanvassingItems.value = [];
};

const addSelectedPricetagItems = () => {
  selectedPricetagItems.value.forEach((value) => {
    ruleForm.items.push({
      id: 0,
      unique_id: "",
      order_id: "",
      vendor_id: value.pricetag?.owner_id ?? "",
      vendor_version: value.pricetag?.owner?.version ?? 0,
      catalogue_id: value.catalogue_id ?? "",
      catalogue_name: value.catalogue?.name ?? "",
      catalogue_version: value.catalogue?.version ?? 1,
      quantity: 1,
      unit_price: value.price,
      total_price: Number(value.quantity) * Number(value.price),
      is_warranty: false,
      warranty: 0,
      warranty_unit: "hari",
      is_discount: false,
      delivery_cost: 0,
      version: 0,
      created_at: 0,
      created_by: 0,
      updated_at: 0,
      unit_id: value.unit_id,
      unit_name: value.unit_name,
      pr_item_request_trail_id: "",
      pr_item_request_trail_version: 0,
      item_request_trail_id: "",
      item_request_trail_version: 0,
      order_version: 1,
      status: PurchaseOrderItemStatus.DRAFT,
    });
  });

  console.log("rule form", ruleForm.items);

  visiblePricetagModal.value = false;
  selectedPricetagItems.value = [];
};

const removeItem = (index: number) => {
  ruleForm.items.splice(index, 1);
};

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  await formEl.validate(async (valid) => {
    if (valid) {
      if (ruleForm.items.length === 0) {
        ElMessage.warning("Tambahkan minimal satu item");
        return;
      }

      loading.value = true;
      try {
        // Calculate total price
        ruleForm.total_price = grandTotal.value;

        const formData = new FormData();

        // Append main fields
        formData.append("unique_id", `${ruleForm.unique_id}`);
        formData.append("vendor_id", `${ruleForm.vendor_id}`);
        formData.append("vendor_name", `${ruleForm.vendor_name}`);
        formData.append("vendor_version", `${ruleForm.vendor_version}`);
        formData.append("sourcing_document", `${ruleForm.sourcing_document}`);
        formData.append("total_price", `${ruleForm.total_price}`);
        formData.append(
          "delivery_address_id",
          `${ruleForm.delivery_address_id}`
        );
        formData.append(
          "delivery_address_version",
          `${ruleForm.delivery_address_version}`
        );
        formData.append(
          "expected_arrival",
          `${
            ruleForm.expected_arrival != null
              ? ruleForm.expected_arrival / 1000
              : null
          }`
        );
        formData.append("date", `${ruleForm.date / 1000}`);
        formData.append("is_discount", `${ruleForm.is_discount}`);
        formData.append("discount", `${ruleForm.discount}`);
        formData.append("discount_unit", `${ruleForm.discount_unit}`);
        formData.append("delivery_cost", `${ruleForm.delivery_cost}`);
        formData.append(
          "additional_information",
          `${ruleForm.additinal_information}`
        );
        formData.append("status", `done`);
        formData.append("type", `so`);
        formData.append("is_tempo", `${ruleForm.is_tempo}`);
        formData.append("term_payment", `${ruleForm.payment_term}`);
        formData.append("term_payment_unit", `${ruleForm.payment_term_unit}`);
        formData.append("term_payment_value", `${ruleForm.payment_term_value}`);
        formData.append("method_payment", `${ruleForm.payment_method}`);

        // Append items array
        ruleForm.items.forEach((value, index) => {
          formData.append(`item[${index}][unique_id]`, `${value.unique_id}`);
          formData.append(`item[${index}][order_id]`, `${value.order_id}`);
          formData.append(`item[${index}][item_id]`, `${value.catalogue_id}`);
          formData.append(
            `item[${index}][item_name]`,
            `${value.catalogue_name}`
          );
          formData.append(
            `item[${index}][item_version]`,
            `${value.catalogue_version}`
          );
          formData.append(`item[${index}][quantity]`, `${value.quantity}`);
          formData.append(`item[${index}][unit_id]`, `${value.unit_id}`);
          formData.append(`item[${index}][unit_name]`, `${value.unit_name}`);
          formData.append(`item[${index}][unit_price]`, `${value.unit_price}`);
          formData.append(
            `item[${index}][total_price]`,
            `${value.quantity * value.unit_price || 0}`
          );
          formData.append(
            `item[${index}][is_warranty]`,
            `${value.is_warranty}`
          );
          formData.append(`item[${index}][warranty]`, `${value.warranty}`);
          formData.append(
            `item[${index}][warranty_unit]`,
            `${value.warranty_unit}`
          );
          formData.append(
            `item[${index}][is_discount]`,
            `${value.is_discount ?? false}`
          );
          formData.append(
            `item[${index}][discount]`,
            `${value.discount ?? null}`
          );
          formData.append(
            `item[${index}][discount_unit]`,
            `${value.discount_unit ?? null}`
          );
          formData.append(
            `item[${index}][additional_information]`,
            `${value.additinal_information}`
          );

          formData.append(`item[${index}][version]`, `${value.version}`);
          formData.append(
            `item[${index}][order_version]`,
            `${value.order_version}`
          );
          formData.append(`item[${index}][status]`, `done`);
        });

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
          formData.append(
            `ref_trans_adj[${index}][unique_id]`,
            `${ref.unique_id}`
          );
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
          formData.append(
            `ref_trans_adj[${index}][party_id]`,
            `${ref.party_id}`
          );
          formData.append(`ref_trans_adj[${index}][type]`, `${ref.type}`);
          formData.append(`ref_trans_adj[${index}][include]`, `${ref.include}`);
        });

        // Append files
        fileList.value.forEach((file, index) => {
          if (file.raw) {
            formData.append(`files[${index}]`, file.raw);
          }
        });

        const response = await useFetchApi<BaseResponse<PurchaseOrder>>(
          "/purchase-order-create",
          "create-purchase-order",
          "post",
          formData
        );

        if (response.status.value === "success") {
          const purchaseOrder: PurchaseOrder | undefined =
            response.data.value?.data;
          ElMessage.success("Purchase Order berhasil dibuat");
          if (purchaseOrder) {
            router.push(`/sales/order/${purchaseOrder.unique_id}`);
          }
        }
      } catch (error) {
        ElMessage.error("Gagal membuat Purchase Order");
        console.error(error);
      } finally {
        loading.value = false;
      }
    }
  });
};

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  formEl.resetFields();
  ruleForm.items = [];
  ruleForm.vendor_id = "";
  ruleForm.vendor_name = "";
  ruleForm.vendor_version = 0;
};

const fetchDataEdit = async () => {
  loading.value = true;
  loadingGetEditData.value = true;
  try {
    const response = await useFetchApi<BaseResponse<PurchaseOrder>>(
      `/purchase-order-read/${id.value}`,
      "detail-purchase-order",
      "get",
      null
    );

    if (response.status.value == "success") {
      const request: PurchaseOrder | null = response.data.value?.data ?? null;
      if (request != null) {
        ruleForm.unique_id = request.unique_id;
        ruleForm.vendor_id = request.vendor_id ?? "";
        ruleForm.vendor_name = request.vendor?.name ?? "";
        ruleForm.vendor_version = request.vendor_version;
        ruleForm.sourcing_document = request.sourcing_document ?? "";
        ruleForm.delivery_address_id = request.delivery_address_id ?? "";
        ruleForm.delivery_address_version = request.delivery_address_version;
        ruleForm.delivery_address_view = `(${request.address?.contact_name}) - ${request.address?.village}, ${request.address?.city}, ${request.address?.regency}, ${request.address?.province}`;
        ruleForm.expected_arrival =
          request.expected_arrival == null
            ? null
            : request.expected_arrival * 1000;
        ruleForm.date = request.date == null ? Date.now() : request.date * 1000;
        ruleForm.is_discount = request.is_discount;
        ruleForm.discount = request.discount;
        ruleForm.discount_unit = request.discount_unit ?? DiscountUnit.PERCENT;
        ruleForm.delivery_cost = request.delivery_cost;
        ruleForm.total_price = request.total_price;
        ruleForm.additinal_information = request.additional_information ?? "";
        ruleForm.status = request.status;
        ruleForm.items = request.purchase_order_item;
        ruleForm.payment_term =
          request.term_payment == null
            ? PaymentTerm.CBD
            : (request.term_payment as PaymentTerm);
        ruleForm.payment_term_unit = request.term_payment_unit;
        ruleForm.payment_term_value = request.term_payment_value ?? 0;
        ruleForm.payment_method = request.method_payment as PaymentMethod;

        references.value = request.reference_transaction.map((value) => ({
          ...value,
          adjustment: value.adjustments_transaction,
        }));

        termOfPayments.value = request.payment_terms ?? [];

        if (request.address) {
          address.value = request.address;
        }
      }
    }
  } catch (error: any) {
    ElMessage.error(error.response?.message ?? error);
  } finally {
    loading.value = false;
    loadingGetEditData.value = false;
  }
};

const fetchCanvassing = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<Canvassing>>(
      `/canvassing-read/${quotation_id.value}`,
      "detail-canvassing",
      "get",
      null
    );

    if (
      response.status.value == "success" &&
      response.data.value?.data != undefined
    ) {
      // currentPrivilage.value = response.data.value.privilege ?? [];
      // initialCanvassing(response.data.value.data)
      console.log("data quotation", response.data?.value.data);

      const canvassingData: Canvassing = response.data.value!.data!;

      (ruleForm.vendor_id = canvassingData.source?.request_to?.unique_id ?? ""),
        (ruleForm.vendor_parent_id = ""),
        (ruleForm.vendor_name = canvassingData.source?.request_to?.name ?? ""),
        (ruleForm.vendor_version =
          canvassingData.source?.request_to?.version ?? 0),
        (ruleForm.sourcing_document = ""),
        (ruleForm.delivery_address_id = canvassingData.address_id ?? ""),
        (ruleForm.delivery_address_version =
          canvassingData.address_version ?? 0),
        (ruleForm.delivery_address_view =
          canvassingData?.address?.address_name ?? ""),
        (ruleForm.expected_arrival = null as number | null),
        (ruleForm.date = Date.now()),
        (ruleForm.is_discount = false),
        (ruleForm.is_tempo = false),
        (ruleForm.payment_term =
          canvassingData.payment_term != undefined
            ? (canvassingData.payment_term as PaymentTerm)
            : PaymentTerm.CASH),
        (ruleForm.payment_term_value = canvassingData.tempo_value ?? 0),
        (ruleForm.payment_term_unit = canvassingData.tempo_unit ?? "day"),
        (ruleForm.payment_method = PaymentMethod.Giro),
        (ruleForm.discount = 0),
        (ruleForm.discount_unit = "percent" as DiscountUnit),
        (ruleForm.delivery_cost = 0),
        (ruleForm.total_price = 0),
        (ruleForm.additinal_information = ""),
        (ruleForm.status = PurchaseOrderStatus.DRAFT),
        (ruleForm.items = [] as PurchaseOrderItem[]);

      // request_search_pricetag_item.value.column = [
      //   {
      //     pricetag: {
      //       catagory: ['penawaran'],
      //       reference_id: quotation_id.value,
      //     }
      //   }
      // ]
    }
  } catch (error) {
    ElMessage.error("Failed to fetch canvassing data");
    console.error(error);
    goBack();
  } finally {
    loading.value = false;
  }
};

// Initial load
onMounted(() => {
  if (id.value) {
    fetchDataEdit();
  }

  if (quotation_id.value) {
    fetchCanvassing();
    request_search_pricetag_item.value.column = [
      {
        pricetag: {
          category: ["penawaran"],
          reference_id: [`${quotation_id.value}`],
        },
      },
    ];

    refreshNuxtData("search-pricetag-item");
  }
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-table .cell) {
  white-space: nowrap;
}
</style>
