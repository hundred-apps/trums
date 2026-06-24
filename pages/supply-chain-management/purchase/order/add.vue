<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3"> New Purchase Order </span>
      </template>
    </el-page-header>
    <el-form
      ref="ruleFormRef"
      style="max-width: 100%"
      :model="ruleForm"
      :rules="rules"
      label-width="auto"
      class="demo-ruleForm"
      size="default"
      status-icon
    >
      <el-card class="my-3">
        <template #header>
          <div class="card-header">
            <div class="flex">
              <el-button type="primary" @click="submitForm(ruleFormRef)"
                >Simpan</el-button
              >
              <el-button @click="resetForm(ruleFormRef)">Reset</el-button>
              <el-button @click="goBack">Batal</el-button>
            </div>
          </div>
        </template>

        <!-- Vendor Selection -->
        <el-form-item label="Vendor" prop="vendor_name" style="width: 50%">
          <el-autocomplete
            :fetch-suggestions="querySearchCustomer"
            v-model="ruleForm.vendor_name"
            placeholder="Cari Vendor"
            @select="onHandleSelectVendor"
          >
            <template #default="{ item }">
              <div v-if="item.isNew" class="flex items-center text-blue-500">
                <el-icon><Plus /></el-icon>
                <span class="ml-2">Buat Penawaran Baru </span>
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
        <el-form-item
          label="Nomor Referensi"
          prop="source_document"
          style="width: 50%"
        >
          <el-input
            v-model="ruleForm.sourcing_document"
            placeholder="Masukkan nomor referensi"
          />
        </el-form-item>

        <el-form-item
          label="Alamat Pengiriman"
          prop="delivery_address_id"
          style="width: 50%"
        >
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

        <el-form-item v-if="address" label=" " style="width: 50%">
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

        <el-form-item
          label="Estimasi Tiba"
          prop="expected_arrival"
          style="width: 50%"
        >
          <el-date-picker
            v-model="ruleForm.expected_arrival!"
            type="date"
            placeholder="Pilih tanggal"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="Tanggal PO" prop="date" style="width: 50%">
          <el-date-picker
            v-model="ruleForm.date"
            type="date"
            placeholder="Pilih tanggal"
            style="width: 100%"
          />
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
        </template>

        <el-form-item label="Status" prop="status" style="width: 50%">
          <el-select v-model="ruleForm.status" style="width: 100%">
            <el-option
              v-for="status in purchaseOrderStatusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="File Lampiran" prop="files" style="width: 50%">
          <TrumsUploadFile v-model:file-list="fileList" />
        </el-form-item>

        <el-form-item
          label="Informasi Tambahan"
          prop="additinal_information"
          style="width: 50%"
        >
          <el-input
            v-model="ruleForm.additinal_information"
            type="textarea"
            placeholder="Masukkan informasi tambahan"
          />
        </el-form-item>
      </el-card>

      <!-- Items Section -->
      <el-card class="mb-3">
        <template #header>
          <div class="card-header flex justify-between items-center">
            <span>Items</span>
            <div class="flex space-x-2">
              <el-button type="primary" @click="openCanvassingModal">
                Tambah dari Canvassing
              </el-button>
              <el-button type="primary" @click="openPricetagModal">
                Tambah dari Penawaran
              </el-button>
            </div>
          </div>
        </template>

        <TrumsDragScrollTable>
          <el-table :data="ruleForm.items" border style="width: 100%">
            <el-table-column
              prop="catalogue_name"
              label="Item"
              fixed="left"
              width="500"
            >
              <template #default="scope">
                <div class="flex justify-center w-full">
                  <el-button
                    @click="() => openCatalogueDetail(scope.row, scope.$index)"
                    text
                    ><el-icon><Warning /></el-icon
                  ></el-button>
                  <el-form-item
                    :prop="`items.${scope.$index}.catalogue_name`"
                    class="w-full"
                    style="margin-bottom: 0px !important"
                    :rules="[
                      {
                        required: true,
                        message: 'Item wajib diisi',
                        trigger: 'blur',
                      },
                    ]"
                  >
                    <el-autocomplete
                      :fetch-suggestions="querySearchAsync"
                      v-model="scope.row.catalogue_name"
                      placeholder="Please input"
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
                          <!-- Informasi produk -->
                          <div class="flex-1 min-w-0">
                            <p
                              style="line-height: 15px"
                              class="font-bold truncate"
                            >
                              {{ item.catalogue_name || item.value }}
                            </p>
                            <p class="text-sm text-gray-500 truncate">
                              PN/SN: {{ item.sn_number || "Tidak Ada" }} |
                              Brand:
                              {{ item.brand_name || "N/A" }}
                            </p>
                          </div>
                        </div>
                      </template>
                    </el-autocomplete>
                  </el-form-item>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="quantity"
              label="QTY"
              width="150"
              align="center"
            >
              <template #default="scope">
                <el-form-item
                  :prop="`items.${scope.$index}.quantity`"
                  :rules="[
                    {
                      required: true,
                      message: 'Qty wajib diisi',
                      trigger: 'change',
                    },
                    {
                      type: 'number',
                      min: 1,
                      message: 'Qty minimal 1',
                      trigger: 'change',
                    },
                  ]"
                  style="margin-bottom: 0px !important"
                >
                  <el-input-number v-model="scope.row.quantity" :min="1" />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column prop="unit_name" label="UoM" width="130">
              <template #default="scope">
                <el-form-item
                  :prop="`items.${scope.$index}.unit_name`"
                  :rules="[
                    {
                      required: true,
                      message: 'UoM wajib diisi',
                      trigger: 'change',
                    },
                  ]"
                  style="margin-bottom: 0px !important"
                >
                  <el-autocomplete
                    :fetch-suggestions="querySearchUnit"
                    v-model="scope.row.unit_name"
                    placeholder="Input Units"
                    @select="(item: Record<string, any>) => onHandleSelectItemAutocompleteUnit(item, scope)"
                  >
                    <template #default="{ item }">
                      <div
                        v-if="item.isNew"
                        class="flex items-center text-blue-500"
                      >
                        <el-icon><Plus /></el-icon>
                        <span class="ml-2">Tambahkan "{{ item.label }}"</span>
                      </div>
                      <div v-else>
                        <p class="font-bold">{{ item.name }}</p>
                      </div>
                    </template>
                  </el-autocomplete>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column
              prop="unit_price"
              label="Harga Satuan"
              align="right"
              width="200"
            >
              <template #default="scope">
                <el-form-item
                  label=""
                  :prop="`items.${scope.$index}.displayPrice`"
                  class="mb-0"
                  style="margin-bottom: 0px !important"
                  :rules="[
                    {
                      required: true,
                      message: 'Harga wajib diisi',
                      trigger: 'change',
                    },
                  ]"
                >
                  <el-input
                    v-model="scope.row.displayPrice"
                    class="mb-0"
                    inputmode="decimal"
                    @input="
                      (val) => {
                        const parsed = parseCurrencyID(val);
                        scope.row.unit_price = parsed;
                        scope.row.displayPrice = formatCurrencyID(parsed);
                      }
                    "
                    @blur="
                      () => {
                        scope.row.displayPrice = formatCurrencyID(
                          scope.row.unit_price
                        );
                      }
                    "
                  />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column
              prop="total_price"
              label="Total Harga"
              align="right"
              width="200"
            >
              <template #default="scope">
                {{ formatCurrency(scope.row.unit_price * scope.row.quantity) }}
              </template>
            </el-table-column>

            <el-table-column label="Nomor PR" width="200">
              <template #default="scope">
                <el-form-item
                  style="margin-bottom: 0px"
                  :prop="`items.${scope.$index}.pr_number`"
                  :show-message="false"
                  :rules="[
                    {
                      required: true,
                      message: 'PR Number Wajib Diisi',
                      trigger: 'change',
                    },
                  ]"
                >
                  <el-input
                    v-model="scope.row.pr_number"
                    placeholder="Cari Purchase Request"
                    class="input-with-select"
                    :disabled="true"
                  >
                    <template #append style="background-color: blue !important">
                      <el-button
                        :icon="Search"
                        type="primary"
                        @click="() => openModalPr(scope.$index)"
                      />
                    </template>
                  </el-input>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="Estimasi Pengiriman" width="200">
              <template #default="scope">
                <el-form-item
                  style="margin-bottom: 0px"
                  :prop="`items.${scope.$index}.delivery`"
                  :show-message="false"
                  :rules="[
                    {
                      required: true,
                      message: 'Estimasi Pengiriman',
                      trigger: 'change',
                    },
                  ]"
                >
                  <el-input
                    v-model="scope.row.delivery"
                    placeholder="Estimasi Pengiriman"
                    class="input-with-select"
                  />
                </el-form-item>
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
        </TrumsDragScrollTable>
        <el-button class="mt-4" style="width: 100%" @click="AddNewItem">
          Tambah Item
        </el-button>
      </el-card>
    </el-form>
    <AdjustmentTransactionComponent
      v-if="!loadingGetEditData"
      :references="references"
      @update:total="
        (value: any) => {
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

    <el-card class="mb-3" shadow="hover">
      <el-table :data="summeryData ?? []" style="width: 100%">
        <el-table-column label="" prop="label" width="300">
          <template #default="{ row }">
            <div class="font-bold">{{ row.label }}</div>
          </template>
        </el-table-column>
        <el-table-column label="" prop="value" align="right" />
      </el-table>
    </el-card>

    <!-- Modals -->
    <el-dialog
      v-model="visibleCanvassingModal"
      title="Pilih Item dari Canvassing"
      width="1200"
    >
      <el-row :gutter="20" class="mb-3">
        <el-col :span="12">
          <el-input
            v-model="canvassingSearch.keyword"
            placeholder="Cari item..."
            clearable
          />
        </el-col>
        <el-button @click="visibleCanvassingModal = false">Batal</el-button>
        <el-button type="primary" @click="addSelectedCanvassingItems">
          Tambahkan Selected ({{ selectedCanvassingItems.length }})
        </el-button>
      </el-row>

      <el-table
        :data="filteredCanvassingItems.data?.value?.data ?? []"
        style="width: 100%"
        @selection-change="handleCanvassingSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="catalogue.name" label="Item" />
        <el-table-column prop="catalogue.sn" label="SN" width="100" />
        <el-table-column prop="unit_name" label="Satuan" width="100" />
        <el-table-column
          prop="unit_price"
          label="Harga Satuan"
          width="120"
          align="right"
        >
          <template #default="scope">
            {{ formatCurrency(scope.row.unit_price) }}
          </template>
        </el-table-column>
        <!-- <el-table-column prop="vendor.name" label="Vendor" /> -->
        <el-table-column label="Nomor Canvassing" width="200">
          <template #default="scope">
            {{ scope.row.canvassing_item?.canvassing?.unique_code ?? "N/A" }}
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-end mt-3">
        <el-pagination
          background
          layout="prev, pager, next, sizes, total"
          :total="filteredCanvassingItems?.data.value?.total_data"
          :current-page="filteredCanvassingItems?.data.value?.currentPage"
          @current-change="handlePageChangeCanvassing"
          @size-change="handleSizeChangeCanvassing"
        />
      </div>
    </el-dialog>

    <el-dialog v-model="visibleModalRequest" title="Cari Nomor PR" width="1200">
      <el-row :gutter="20" class="mb-3">
        <el-col :span="6"
          ><el-input
            v-model="request_search_trail.keyword"
            size="default"
            placeholder="Type to search"
        /></el-col>
      </el-row>
      <el-table :data="itemRequest?.data.value?.data ?? []" style="width: 100%">
        <el-table-column label="Nama Item">
          <template #default="scope">
            <NuxtLink
              class="text-blue-500"
              :href="`/supply-chain-management/purchase/request/${scope.row.unique_id}`"
              >{{ scope.row.item_request?.catalogue_name ?? "-" }}</NuxtLink
            >
          </template>
        </el-table-column>
        <el-table-column label="Nomor PR" width="200">
          <template #default="scope">
            <p>
              {{
                (scope.row as ItemRequestTrail).data_reference?.unique_code ??
                "-"
              }}
            </p>
          </template>
        </el-table-column>
        <el-table-column label="Serial Number" width="150">
          <template #default="scope">
            <p>{{ scope.row.item_request?.sn ?? "-" }}</p>
          </template>
        </el-table-column>
        <el-table-column label="QTY" width="100">
          <template #default="scope">
            <p>
              {{ scope.row.quantity }}
              {{ scope.row.item_request?.unit_name ?? "" }}
            </p>
          </template>
        </el-table-column>
        <el-table-column label="Aksi" width="100">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              @click="() => selectPR(scope.row)"
              >Pilih</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-end mt-3">
        <el-pagination
          background
          layout="prev, pager, next, sizes, total"
          :total="itemRequest?.data.value?.total_data"
          :current-page="itemRequest?.data.value?.currentPage"
          @current-change="paginationClick"
          @size-change="handleSizeChange"
        />
      </div>
    </el-dialog>

    <el-dialog
      v-model="visiblePricetagModal"
      title="Pilih Item dari Penawaran"
      width="1000"
    >
      <el-row :gutter="20" class="mb-3">
        <el-col :span="12">
          <el-input
            v-model="query_search_pricetag_item.keyword"
            placeholder="Cari item..."
            clearable
          />
        </el-col>
      </el-row>

      <el-table
        :data="pricetagItems.data.value?.data ?? []"
        style="width: 100%"
        @selection-change="handlePricetagSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="catalogue.name" label="Item">
          <template #default="scope">
            {{ scope.row.catalogue?.name || "-" }}
          </template>
        </el-table-column>
        <el-table-column prop="price" label="Harga" width="120" align="right">
          <template #default="scope">
            {{ formatCurrency(scope.row.price) }}
          </template>
        </el-table-column>
        <el-table-column prop="unit_name" label="Satuan" width="100" />
        <el-table-column prop="pricetag.owner.name" label="Vendor">
          <template #default="scope">
            {{ scope.row.pricetag?.owner?.name || "-" }}
          </template>
        </el-table-column>
        <el-table-column
          prop="min_order_quantity"
          label="Min. Order"
          width="100"
        />
      </el-table>

      <template #footer>
        <el-button @click="visiblePricetagModal = false">Batal</el-button>
        <el-button type="primary" @click="addSelectedPricetagItems">
          Tambahkan Selected ({{ selectedPricetagItems.length }})
        </el-button>
      </template>
    </el-dialog>

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
      <AddPriceTagComponent v-on:submit="handleSubmitPricetag" />
    </el-dialog>
  </TrumsWrapper>
</template>

<script lang="ts" setup>
import { Delete, Plus, Search, Warning, Edit } from "@element-plus/icons-vue";
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
  type CanvassingItem,
  type CanvassingVendor,
} from "~/types/scm/canvasing";
import type { Pricetag, Pricetag_item } from "~/types/pricetag";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import type { BaseResponse } from "~/types/response";
import type { AddressType } from "~/types/address";
import TrumsUploadFile from "~/components/trums/form/TrumsUploadFile.vue";
import { DiscountUnit } from "~/types/scm/offers";
import { PaymentMethod } from "~/types/finance/bill";
import {
  ItemRequestTrailStatus,
  type ItemRequestTrail,
} from "~/types/item_request";
import {
  FeeType,
  ReferenceAdjustment,
  type AdjustmentTransaction,
  type ReferenceTransactionAdjustment,
} from "~/types/attribute_adjustment";
import ModalAdjustmentTransaction from "~/components/trums/ModalAdjustmentTransaction.vue";
import AddAdjustment from "~/components/trums/AddAdjustment.vue";
import type { Catalogue, ItemInterface } from "~/types/catalogue";
import type { ItemSearch } from "~/types/item_search";
import type { Unit } from "~/types/unit";
import CatalogueAdd from "~/components/trums/CatalogueAdd.vue";
import { generateAddressView } from "#imports";
import FormAddress from "~/components/trums/FormAddress.vue";
import AdjustmentTransactionComponent from "~/components/trums/AdjustmentTransactionComponent.vue";
import CustomPaymentTerm from "~/components/trums/CustomPaymentTerm.vue";
import type { TermOfPayment } from "~/types/payment_term";
import AddPriceTagComponent from "~/components/trums/AddPriceTagComponent.vue";

const fileList = ref<UploadUserFile[]>([]);

const router = useRouter();
const route = useRoute();

const ruleFormRef = ref<FormInstance>();
const loading = ref(false);
const loadingGetEditData = ref<boolean>(false);
const visibleModalRequest = ref(false);
const visibleModalAdjustmentTransaction = ref(false);
const visibleModalNewAdjustment = ref(false);

const visibleModalPricetagNewItem = ref<boolean>(false);

const address = ref<AddressType | null>(null);

const id = computed(() => route.query.id as string);

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
  vendor_name: "",
  vendor_version: 0,
  sourcing_document: "",
  delivery_address_id: null as string | null,
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
  displayPrice: "",
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

const poItemIndex = ref<number>(0);

// Selection data
const selectedCanvassingItems = ref<CanvassingVendor[]>([]);
const selectedPricetagItems = ref<Pricetag_item[]>([]);
const references = ref<ReferenceTransactionAdjustment[]>([]);

const tmpCatalogue = ref<Catalogue | null>(null);
const itemActive = ref<number>(-1);

const drawerCatalogue = ref<boolean>(false);
const stateFormAddress = ref<"New" | "Edit">("New");
const dialogNewAddress = ref(false);

// Sample data (replace with API calls)
const canvassingItems = ref<CanvassingVendor[]>([]);

const termOfPayments = ref<TermOfPayment[]>([]);

const query_search_pricetag_item = ref<RequestSearch>({
  column: [
    {
      pricetag: {
        type: ["in"],
        owner_id: [],
      },
    },
  ],
  keyword: "",
  table: "pricetag_item",
  sort: null,
  offset: "1",
  limit: "10",
});

const request_search = ref<RequestSearch>({
  keyword: "",
  table: "",
  column: [],
  limit: "100",
  offset: "1",
  sort: null,
});

const querySearchAdjustmentTransaction = ref<RequestSearch>({
  keyword: "",
  table: "adjustments_transaction",
  column: [],
  sort: null,
  limit: "10",
  offset: "1",
});

const request_search_pricetag_item = ref<RequestSearch>({
  column: [],
  keyword: "",
  table: "pricetag_item",
  sort: null,
  offset: "1",
  limit: "10",
});

const pricetagItems = await useAsyncData("search-pricetag-item", async () => {
  const res = await useFetchApi<ResponsePagination<Pricetag_item[]>>(
    "/search",
    "search-pricetag-item",
    "post",
    query_search_pricetag_item.value
  );
  return res.data.value;
});

const adjustmentTransactions = await useFetchApi<
  ResponsePagination<AdjustmentTransaction[]>
>(
  "/search",
  "search-adjustment",
  "post",
  querySearchAdjustmentTransaction.value
);

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
      status: [CanvassingVendorStatus.SELECTED],
    },
  ],
  keyword: "",
  table: "canvassing_vendor",
  sort: null,
  offset: "1",
  limit: "10",
});

const request_search_trail = ref<RequestSearch>({
  column: [
    {
      status: [ItemRequestTrailStatus.DONE],
      reference: ["pr"],
      pr_purchase_order_item: ["null"],
    },
  ],
  keyword: "",
  limit: "10",
  offset: "1",
  sort: {
    column: "created_at",
    order: OrderColumn.ASC,
  },
  table: "item_request_trail",
});

const itemRequest = await useAsyncData("search-item-request", async () => {
  const res = await useFetchApi<ResponsePagination<ItemRequestTrail[]>>(
    `/search`,
    "search-item-request",
    "post",
    request_search_trail.value
  );
  return res.data.value;
});

watch(
  () => request_search_trail.value,
  () => itemRequest.refresh(),
  { deep: true }
);

const paginationClick = (val: number) => {
  request_search_trail.value.offset = val.toString();
};

const handleSizeChange = (size: number) => {
  request_search_trail.value.limit = `${size}`;
};

// Handle cancel
const handleCancel = () => {
  tmpCatalogue.value = null;
  drawerCatalogue.value = false;
};

const handleSubmitPricetag = (pricetag: Pricetag | undefined) => {
  if (pricetag) {
    ruleForm.vendor_id = pricetag.owner_id;
    ruleForm.vendor_name = pricetag.owner_name || "";
    visibleModalPricetagNewItem.value = false;
    pricetagItems.refresh();
  }
};

const handleSubmit = async (catalogue: Catalogue) => {
  loading.value = true;

  try {
    const catalogueInsert = (await create_catalogue(catalogue)) ?? undefined;
    if (catalogueInsert != undefined) {
      ruleForm.items[itemActive.value].catalogue_name =
        catalogueInsert.name ?? "";
      ruleForm.items[itemActive.value].catalogue_id =
        catalogueInsert.unique_id ?? "";
      ruleForm.items[itemActive.value].catalogue = catalogueInsert;
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

const create_catalogue = async (catalogue: Catalogue) => {
  loading.value = true;
  try {
    console.log("catalogue", catalogue);
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

    console.log(response.status);
    if (response.status.value == "success") {
      const catalogue_result: Catalogue | undefined = response.data.value?.data;
      return catalogue_result;
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  } finally {
    loading.value = false;
  }
};

// Computed
const filteredCanvassingItems = await useAsyncData(
  "search-canvasing-vendor",
  async () => {
    const res = await useFetchApi<ResponsePagination<CanvassingVendor[]>>(
      `/search`,
      "search-canvasing-vendor",
      "post",
      query_search_canvasing_item.value
    );
    return res.data.value;
  }
);

const totalItems = computed(() => {
  return ruleForm.items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );
});

const subtotal = computed(() => {
  console.log("total", totalItems.value);
  console.log("get plus", getPlus.value);
  console.log("get minus", getMinus.value);
  return totalItems.value + getPlus.value - getMinus.value;
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
            : displayAmount(ref, totalItems.value);
      }
    });

  return minus;
});

const grandTotal = computed(() => {
  return subtotal.value + ppnComponent.value;
});

const paymentMethods = [
  { value: PaymentMethod.Cash, label: "Cash" },
  { value: PaymentMethod.BankTransfer, label: "Bank Transfer" },
  { value: PaymentMethod.Giro, label: "Giro" },
];

const calculatedDiscount = computed(() => {
  if (!ruleForm.is_discount) return 0;
  if (ruleForm.discount_unit === "percent") {
    return (subtotal.value * ruleForm.discount) / 100;
  }
  return ruleForm.discount;
});

const validateItems = (
  rule: any,
  value: any[],
  callback: (error?: Error) => void
) => {
  if (!value || value.length === 0) {
    ElMessage.error("Item tidak boleh kosong");
    callback(new Error());
    return;
  }

  const invalid = value.some((item) => !item.pr_number);

  if (invalid) {
    // ElMessage.error("Masih ada PR Number yang belum diisi");
    callback(new Error());
    setTimeout(() => {
      ElMessage.error("Masih ada PR Number yang belum diisi.");
    }, 0);
    return;
  }

  const invalidDelivery = value.some(
    (item) =>
      !item.delivery ||
      (typeof item.delivery === "string" && item.delivery.trim() === "")
  );

  if (invalidDelivery) {
    setTimeout(() => {
      ElMessage.error("Masih ada Estimasi Pengiriman yang belum diisi.");
    }, 0);
    callback(new Error());
    return;
  }

  callback();
};

// Validation rules
const rules = reactive<FormRules>({
  vendor_name: [
    {
      required: true,
      message: "Vendor Tidak Boleh Kosong!",
      trigger: ["blur", "change"],
    },
  ],
  sourcing_document: [
    { required: true, message: "Nomor referensi wajib diisi", trigger: "blur" },
  ],
  delivery_address_id: [
    {
      required: true,
      message: "Alamat pengiriman wajib dipilih",
      trigger: "blur",
    },
  ],

  status: [
    { required: true, message: "Status wajib dipilih", trigger: "change" },
  ],
  items: {
    validator: validateItems,
    trigger: "change",
  },
});

const openCatalogueDetail = (cat: ItemInterface, index: number) => {
  if (cat.catalogue == null) {
    tmpCatalogue.value = {
      name: "",
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
  } else {
    tmpCatalogue.value = cat.catalogue;
  }
  itemActive.value = index;
  drawerCatalogue.value = true;
};

const querySearchUnit = (queryString: string, cb: (arg: any) => void) => {
  var params = { ...request_search.value };
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
        const callback = resultApi.map((value) => ({
          ...value,
          value: value.name,
        }));
        cb([
          ...callback,
          { value: queryString, label: `${queryString}`, isNew: true },
        ]);
      } else {
        cb([{ value: `${queryString}`, label: `${queryString}`, isNew: true }]);
      }
    }
  });
};

const onHandleSelectItemAutocompleteUnit = async (
  item: Record<string, any>,
  scope: any
) => {
  console.log(scope.$index);
  console.log("item", item);
  if (item.isNew) {
    const unit: Unit | null = await handleNewUnit(item.label ?? "");
    if (unit != null) {
      ruleForm.items[scope.$index].unit_name = unit.name;
      ruleForm.items[scope.$index].unit_id = unit.unique_id;
    }
  } else {
    ruleForm.items[scope.$index].unit_name = item.value;
    ruleForm.items[scope.$index].unit_id = `${item.unique_id}`;
  }
};

const handleNewUnit = async (name: string): Promise<Unit | null> => {
  loading.value = true;
  try {
    // Call API to create unit
    const response = await useFetchApi<BaseResponse<Unit>>(
      "/unit-create",
      "create-unit",
      "post",
      { name: name }
    );

    if (response.status.value == "success") {
      return response.data.value?.data ?? null;
    }
  } catch (error: any) {
    ElMessage.error(
      "Gagal menyimpan unit: " +
        (error.response?.data?.message || error.message || "Terjadi kesalahan")
    );
    return null;
  } finally {
    loading.value = false;
    return null;
  }
};

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

const formatCurrencyID = (value: number | null) => {
  if (value === null || value === undefined) return "";
  return value.toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const querySearchAsync = (queryString: string, cb: (arg: any) => void) => {
  (request_search.value.keyword = queryString),
    (request_search.value.table = "catalogues");
  request_search.value.column = [
    {
      type: ["item"],
    },
  ];
  request_search.value.flag = "form";

  useFetchApi<ResponsePagination<ItemSearch[]>>(
    "/catalogues-inventory",
    "fetch-catalogues-inventory",
    "post",
    {
      keyword: queryString,
      flag: "form",
    }
  )
    .then((response) => {
      if (response.status.value === "success") {
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
        ElMessage.error(
          response.error.value?.data?.message ?? "Gagal mengambil data!"
        );
      }
    })
    .catch((error: any) => {
      ElMessage.error(error.response.data.message);
    });
};

const onHandleSelectItemAutocomplete = async (
  item: Record<string, any>,
  scope: any
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

    itemActive.value = scope.$index;
    tmpCatalogue.value = catalogueInsert;
    drawerCatalogue.value = true;
  } else {
    const selected: ItemSearch = item as ItemSearch;

    ruleForm.items[scope.$index].id = 0;
    ruleForm.items[scope.$index].unique_id = "";
    ruleForm.items[scope.$index].order_id = "";
    ruleForm.items[scope.$index].vendor_id = ruleForm.vendor_id;
    ruleForm.items[scope.$index].vendor_version = ruleForm.vendor_version ?? 1;
    ruleForm.items[scope.$index].catalogue_id = selected.catalogue_id ?? "";
    ruleForm.items[scope.$index].catalogue_name = selected.catalogue_name ?? "";
    ruleForm.items[scope.$index].quantity = 1;
    ruleForm.items[scope.$index].unit_price = 0;
    ruleForm.items[scope.$index].total_price = 0;
    ruleForm.items[scope.$index].is_warranty = false;
    ruleForm.items[scope.$index].warranty = 0;
    ruleForm.items[scope.$index].warranty_unit = "hari";
    ruleForm.items[scope.$index].is_discount = false;
    ruleForm.items[scope.$index].delivery_cost = 0;
    ruleForm.items[scope.$index].version = 0;
    ruleForm.items[scope.$index].created_at = 0;
    ruleForm.items[scope.$index].created_by = 0;
    ruleForm.items[scope.$index].updated_at = 0;
    ruleForm.items[scope.$index].unit_id = "";
    ruleForm.items[scope.$index].unit_name = "";
    ruleForm.items[scope.$index].item_request_trail_id = "";
    ruleForm.items[scope.$index].item_request_trail_version = 0;
    ruleForm.items[scope.$index].order_version = 1;
    ruleForm.items[scope.$index].status = PurchaseOrderItemStatus.DRAFT;

    const catalogue: Catalogue | undefined = await fetchCatalogueDetail(
      selected.catalogue_id ?? ""
    );

    if (catalogue) {
      ruleForm.items[scope.$index].catalogue = catalogue;
    }
  }
};

const fetchCatalogueDetail = async (
  unique_id: string
): Promise<Catalogue | undefined> => {
  loading.value = true;
  try {
    const response = await useApiFetch<BaseResponse<Catalogue>>(
      `/catalogues-read/${unique_id}?flag=form`,
      {
        method: "GET",
      }
    );

    if (response.success) {
      return response.data;
    }
  } catch (error: any) {
    ElMessage.error(error.response?.message ?? error);
  } finally {
    loading.value = false;
  }
};

// Methods
const goBack = () => router.back();

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const openModalPr = (index: number) => {
  request_search_trail.value.column = [
    {
      status: [ItemRequestTrailStatus.DONE],
      reference: ["pr"],
      pr_purchase_order_item: ["null"],
      item_request: {
        catalogue_id: [ruleForm.items[index].catalogue_id],
      },
    },
  ];
  poItemIndex.value = index;
  visibleModalRequest.value = true;
};
const selectPR = (row: ItemRequestTrail) => {
  ruleForm.items[poItemIndex.value].pr_item_request_trail_id = row.unique_id;
  ruleForm.items[poItemIndex.value].pr_number = row.data_reference?.unique_code;
  ruleForm.items[poItemIndex.value].pr_item_request_trail_version =
    row.version ?? 1;
  visibleModalRequest.value = false;
};

const querySearchCustomer = (query: string, cb: (arg: any) => void) => {
  try {
    const request_contact = { ...query_search.value };

    request_contact.table = "contacts";
    request_contact.keyword = query;

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
          cb([
            ...contacts.map((value) => ({
              value: value.name,
              unique_id: value.unique_id,
              data: value,
            })),
            {
              value: `Tambahkan ${query}`,
              isNew: true,
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
    console.error("Failed to fetch customers", error);
    cb([]);
  }
};

const querySearchAddress = (queryString: string, cb: (arg: any) => void) => {
  const newSearch: RequestSearch = {
    keyword: queryString,
    table: "address",
    column: [],
    limit: "100",
    offset: "1",
    sort: null,
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

const generateResultSearchAddress = (address: AddressType) => {
  console.log("addres", address);
  const name = `(${address.contact_name}) - ${address.village}, ${address.city}, ${address.regency}, ${address.codepos}`;
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

const onAddressNew = (value: AddressType) => {
  const addressView = generateResultSearchAddress(value);
  ruleForm.delivery_address_id = value.unique_id;
  ruleForm.delivery_address_version = value.version;
  ruleForm.delivery_address_view = addressView.name;
  address.value = value;
  dialogNewAddress.value = false;
};

const handleSelectAddress = (record: Record<string, any>) => {
  if (record.new) {
    stateFormAddress.value = "New";
    ruleForm.delivery_address_view = "";
    dialogNewAddress.value = true;
  } else {
    address.value = record.data as AddressType;
    ruleForm.delivery_address_id = record.address_id;
    ruleForm.delivery_address_version = record.address_version;
    ruleForm.delivery_address_view = "";
  }
};

const handleEditAddress = (addressEdit: AddressType) => {
  address.value = addressEdit;
  stateFormAddress.value = "Edit";
  dialogNewAddress.value = true;
  console.log("state", stateFormAddress.value);
};

const handleDeleteAddress = () => {
  address.value = null;
  ruleForm.delivery_address_id = null;
  ruleForm.delivery_address_version = 0;
  ruleForm.delivery_address_view = "";
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

const onUpdatePaymentTerms = (data: TermOfPayment[]) => {
  termOfPayments.value = data;
};
const handleAdjustmentSubmit = () => {
  visibleModalNewAdjustment.value = false;
  refreshNuxtData("search-adjustment");
};

watch(
  () => query_search_canvasing_item.value,
  () => {
    filteredCanvassingItems.refresh();
  },
  { deep: true }
);
watch(
  () => query_search_pricetag_item.value,
  () => {
    pricetagItems.refresh();
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
    // createNewVendor(item.query).then((customer) => {
    //   if (customer) {
    //     ruleForm.vendor_id = customer.unique_id;
    //     ruleForm.vendor_name = customer.name;
    //     ruleForm.vendor_version = customer.version;

    //     query_search_canvasing_item.value.column = [
    //       {
    //         vendor_id: [customer.unique_id],
    //         status: [CanvassingVendorStatus.SELECTED],
    //       },
    //     ];
    //     query_search_pricetag_item.value.column = [
    //       {
    //         pricetag: {
    //           owner_id: [customer.unique_id],
    //           type: ["in"],
    //         },
    //       },
    //     ];
    //   }
    // });
    visibleModalPricetagNewItem.value = true;
  } else {
    const customer = item.data as Contact;
    ruleForm.vendor_id = customer.unique_id;
    ruleForm.vendor_name = customer.name;
    ruleForm.vendor_version = customer.version || 1;
    query_search_canvasing_item.value.column = [
      {
        vendor_id: [customer.unique_id],
        status: [CanvassingVendorStatus.SELECTED],
      },
    ];
    query_search_pricetag_item.value.column = [
      {
        pricetag: {
          owner_id: [customer.unique_id],
          type: ["in"],
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

  query_search_pricetag_item.value.column = [
    {
      pricetag: {
        type: ["in"],
        owner_id: [ruleForm.vendor_id],
      },
    },
  ];
  visiblePricetagModal.value = true;
};

const handleCanvassingSelectionChange = (selection: CanvassingVendor[]) => {
  selectedCanvassingItems.value = selection;
};

const handlePricetagSelectionChange = (selection: Pricetag_item[]) => {
  selectedPricetagItems.value = selection;
};

const handlePageChangeCanvassing = (page: number) => {
  query_search_canvasing_item.value.offset = `${page}`;
  refreshNuxtData("search-canvasing-vendor");
};
const handleSizeChangeCanvassing = (size: number) => {
  query_search_canvasing_item.value.limit = `${size}`;
  refreshNuxtData("search-canvasing-vendor");
};

const addSelectedCanvassingItems = () => {
  selectedCanvassingItems.value.forEach((value) => {
    const parsed = parseCurrencyID(`${value.unit_price}`);
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
      unit_price: parsed,
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
      pricetag_item_id: value.pricetag_item_id || "",
      pricetag_item_version: value.pricetag_item_version,
      order_version: 1,
      status: PurchaseOrderItemStatus.DRAFT,
      displayPrice: formatCurrencyID(parsed),
    });
  });

  visibleCanvassingModal.value = false;
  selectedCanvassingItems.value = [];
};

const AddNewItem = () => {
  ruleForm.items.push({
    id: 0,
    unique_id: "",
    order_id: "",
    vendor_id: ruleForm.vendor_id,
    vendor_version: ruleForm.vendor_version,
    catalogue_id: "",
    catalogue_name: "",
    catalogue_version: 1,
    quantity: 1,
    unit_price: 0,
    total_price: 0,
    is_warranty: false,
    warranty: 0,
    warranty_unit: "hari",
    is_discount: false,
    delivery_cost: 0,
    version: 0,
    created_at: 0,
    created_by: 0,
    updated_at: 0,
    unit_id: null,
    unit_name: null,
    pr_item_request_trail_id: null,
    pr_item_request_trail_version: 0,
    item_request_trail_id: "",
    item_request_trail_version: 0,
    order_version: 1,
    status: PurchaseOrderItemStatus.DRAFT,
    displayPrice: formatCurrencyID(0),
  });
};

const addSelectedPricetagItems = () => {
  selectedPricetagItems.value.forEach((element) => {
    const parsed = formatCurrencyID(element.price || 0);
    ruleForm.items.push({
      id: 0,
      unique_id: "",
      order_id: "",
      order_version: 0,
      vendor_id: "",
      vendor_version: 0,
      pr_item_request_trail_id: null,
      pr_item_request_trail_version: 0,
      catalogue_name: element.catalogue?.name ?? "",
      catalogue: element.catalogue!,
      catalogue_id: element.catalogue_id,
      catalogue_version: element.catalogue?.version ?? 0,
      quantity: 1,
      unit_price: element.price,
      total_price: element.price,
      is_warranty: (element.garansi ?? 0) > 0,
      warranty: element.garansi ?? 0,
      is_discount: false,
      delivery_cost: 0,
      version: 0,
      unit_id: element.unit_id,
      unit_name: element.unit_name,
      pricetag_item_id: element.unique_id || "",
      pricetag_item_version: element.version,
      created_at: 0,
      created_by: 0,
      updated_at: 0,
      status: PurchaseOrderItemStatus.DRAFT,
      displayPrice: parsed,
    });
  });

  visiblePricetagModal.value = false;
  selectedPricetagItems.value = [];
};

const deleteItem = async (ids: string[]) => {
  try {
    const response = await useFetchApi<BaseResponse<any>>(
      "/po-item-delete",
      "delete-po-item",
      "post",
      ids
    );
    if (response.status.value === "success") {
      ElMessage.success(`Item Berhasil Di Hapus`);
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.message ?? error}`);
  }
};

const removeItem = async (index: number) => {
  if (ruleForm.items[index].unique_id) {
    await deleteItem([ruleForm.items[index].unique_id]);
    ruleForm.items.splice(index, 1);
  } else {
    ruleForm.items.splice(index, 1);
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

const onSubmit = async (formEl: FormInstance) => {
  loading.value = true;
  try {
    await formEl.validate();
    // Calculate total price
    ruleForm.total_price = totalItems.value;

    const formData = new FormData();

    // Append main fields
    formData.append("unique_id", `${ruleForm.unique_id}`);
    formData.append("vendor_id", `${ruleForm.vendor_id}`);
    formData.append("vendor_name", `${ruleForm.vendor_name}`);
    formData.append("vendor_version", `${ruleForm.vendor_version}`);
    formData.append("sourcing_document", `${ruleForm.sourcing_document}`);
    formData.append("total_price", `${ruleForm.total_price}`);
    formData.append("delivery_address_id", `${ruleForm.delivery_address_id}`);
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
    formData.append("is_tempo", `${ruleForm.is_tempo}`);
    formData.append("term_payment", `${ruleForm.payment_term}`);
    formData.append("term_payment_value", `${ruleForm.payment_term_value}`);
    formData.append("term_payment_unit", `${ruleForm.payment_term_unit}`);
    formData.append("method_payment", `${ruleForm.payment_method}`);
    formData.append("status", `${ruleForm.status}`);
    formData.append("type", `po`);

    // Append items array
    ruleForm.items.forEach((value, index) => {
      formData.append(`item[${index}][unique_id]`, `${value.unique_id}`);
      formData.append(`item[${index}][order_id]`, `${value.order_id}`);
      formData.append(`item[${index}][item_id]`, `${value.catalogue_id}`);
      formData.append(`item[${index}][item_name]`, `${value.catalogue_name}`);
      formData.append(
        `item[${index}][item_version]`,
        `${value.catalogue_version}`
      );
      formData.append(`item[${index}][quantity]`, `${value.quantity}`);
      formData.append(`item[${index}][unit_price]`, `${value.unit_price}`);
      formData.append(`item[${index}][unit_id]`, `${value.unit_id}`);
      formData.append(`item[${index}][unit_name]`, `${value.unit_name}`);
      formData.append(
        `item[${index}][total_price]`,
        `${value.quantity * value.unit_price || 0}`
      );
      formData.append(`item[${index}][is_warranty]`, `${value.is_warranty}`);
      formData.append(`item[${index}][warranty]`, `${value.warranty}`);
      formData.append(
        `item[${index}][warranty_unit]`,
        `${value.warranty_unit}`
      );
      formData.append(
        `item[${index}][is_discount]`,
        `${value.is_discount ?? false}`
      );
      formData.append(`item[${index}][discount]`, `${value.discount ?? null}`);
      formData.append(
        `item[${index}][discount_unit]`,
        `${value.discount_unit ?? null}`
      );
      formData.append(
        `item[${index}][additional_information]`,
        `${value.additinal_information}`
      );
      formData.append(
        `item[${index}][item_request_id]`,
        `${value.item_request_trail?.item_request_id}`
      );
      formData.append(
        `item[${index}][item_request_version]`,
        `${value.item_request_trail?.item_request_version}`
      );
      formData.append(
        `item[${index}][pr_item_request_trail_id]`,
        `${value.pr_item_request_trail_id}`
      );
      formData.append(
        `item[${index}][pr_item_request_trail_version]`,
        `${value.item_request_trail_version}`
      );
      formData.append(
        `item[${index}][item_request_trail_id]`,
        `${value.item_request_trail_id}`
      );
      formData.append(
        `item[${index}][item_request_trail_version]`,
        `${value.item_request_trail_version}`
      );
      formData.append(`item[${index}][version]`, `${value.version}`);
      formData.append(
        `item[${index}][order_version]`,
        `${value.order_version}`
      );
      formData.append(`item[${index}][status]`, `${value.status}`);
      formData.append(
        `item[${index}][pricetag_item_id]`,
        `${value.pricetag_item_id}`
      );
      formData.append(
        `item[${index}][pricetag_item_id_version]`,
        `${value.pricetag_item_version}`
      );
      formData.append(`item[${index}][delivery]`, `${value.delivery}`);
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
        router.push(
          `/supply-chain-management/purchase/order/${purchaseOrder.unique_id}`
        );
      }
    }
  } catch (error) {
    ElMessage.error("Gagal membuat Purchase Order");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const validateTermOfPayments = (value: TermOfPayment[]) => {
  if (!value || value.length === 0) {
    return "Minimal harus ada 1 term of payment";
  }

  for (const item of value) {
    if (!item.name || item.name.trim() === "") {
      return "Nama term of payment wajib diisi";
    }

    if (
      item.term_of_payment === PaymentTerm.TEMPO &&
      (!item.duration || item.duration <= 0)
    ) {
      return "Duration wajib diisi untuk term TEMPO";
    }
  }

  return true;
};

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      const termResult = validateTermOfPayments(termOfPayments.value);

      if (termResult !== true) {
        ElMessage.error(termResult);
        return;
      }
      onSubmit(formEl);
    } else {
      console.log("error submit!", fields);
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
        ruleForm.items = request.purchase_order_item.map((item) => ({
          ...item,
          unit_price: item.unit_price,
          displayPrice: formatCurrencyID(item.unit_price),
        }));
        ruleForm.payment_term =
          request.term_payment == null
            ? PaymentTerm.CBD
            : (request.term_payment as PaymentTerm);
        ruleForm.payment_term_unit = request.term_payment_unit;
        ruleForm.payment_term_value = request.term_payment_value ?? 0;
        ruleForm.payment_method = request.method_payment as PaymentMethod;
        console.log("rule form", ruleForm);
        query_search_canvasing_item.value.column = [
          {
            vendor_id: [request.vendor_id],
            status: [CanvassingVendorStatus.SELECTED],
          },
        ];

        query_search_pricetag_item.value.column = [
          {
            pricetag: {
              owner_id: [request.vendor_id],
              type: ["in"],
            },
          },
        ];

        references.value = request.reference_transaction.map((value) => ({
          ...value,
          adjustment: value.adjustments_transaction,
        }));

        address.value = request.address ?? null;

        termOfPayments.value = request.payment_terms ?? [];
      }
    }
  } catch (error: any) {
    ElMessage.error(error.response?.message ?? error);
  } finally {
    loading.value = false;
    loadingGetEditData.value = false;
  }
};
const getDPPNilaiLainView = computed(() => {
  let dpp = (subtotal.value * 11) / 12;

  return dpp;
});
const getDPPNilaiLain = computed(() => {
  let dpp = 0;
  references.value.forEach((element) => {
    if (
      element.adjustment?.category == "tax" &&
      element.adjustment.name.toLowerCase() === "ppn"
    ) {
      console.log("type", element.type);
      if (element.type != "amount" && element.amount == 12) {
        dpp = (subtotal.value * 11) / 12;
        console.log("dpp 12", dpp);
      } else {
        dpp = subtotal.value;
        console.log("dpp 11", dpp);
      }
    }
  });

  return dpp;
});

const summeryData = computed(() => {
  const tableData: any[] = [
    {
      label: "Total Price",
      value: currency(totalItems.value),
    },
  ];

  references.value.forEach((element) => {
    if (element.adjustment?.category != "tax") {
      tableData.push({
        label: element.adjustment?.name ? `${element.adjustment?.name}` : "-",
        value: currency(displayAmount(element, totalItems.value)),
      });
    }
  });
  tableData.push({
    label: "Subtotal",
    value: currency(subtotal.value),
  });
  if (getDPPNilaiLain.value > 0) {
    tableData.push({
      label: "DPP Nilai Lain",
      value: currency(getDPPNilaiLainView.value),
    });
  }

  references.value.forEach((element) => {
    if (
      element.adjustment?.category == "tax" &&
      element.adjustment.name.toLowerCase() === "ppn"
    ) {
      tableData.push({
        label: element.adjustment?.name ? `${element.adjustment?.name}` : "-",
        value: currency(displayAmount(element, getDPPNilaiLain.value)),
      });
    }
  });

  tableData.push({
    label: "Grand Total",
    value: currency(grandTotal.value),
  });

  return tableData;
});

// Initial load
onMounted(() => {
  if (id.value) {
    fetchDataEdit();
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
