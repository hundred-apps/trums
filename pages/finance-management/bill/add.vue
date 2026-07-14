<template>
  <TrumsWrapper>
    <el-card class="my-3">
      <el-form
        ref="ruleFormRef"
        style="max-width: 600px"
        :model="ruleForm"
        :rules="rules"
        :disabled="loading"
        label-width="auto"
        class="demo-ruleForm"
        size="small"
        status-icon
      >
        <el-form-item label="Referensi" prop="source_document">
          <el-select v-model="ruleForm.reference!">
            <el-option label="Lainya" :value="FinanceReference.OTHER" />
            <el-option
              label="Purchase Order"
              :value="FinanceReference.PURCHASE_ORDER"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="ruleForm.reference == FinanceReference.OTHER"
          label="Nomor Referensi"
          prop="reference_number"
        >
          <el-autocomplete
            v-model="ruleForm.reference_number!"
            :fetch-suggestions="querySearchReference"
            placeholder="Search Referensi"
            @select="onHandleSelectReference"
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
        <el-form-item
          v-if="ruleForm.reference == FinanceReference.PURCHASE_ORDER"
          label="Nomor Referensi"
          prop="reference_number"
        >
          <el-input
            v-model="ruleForm.reference_number"
            placeholder="Cari Sumber Referensi"
            class="input-with-select"
            :disabled="true"
          >
            <template #append>
              <el-button
                :icon="Search"
                type="primary"
                @click="() => (visibleModalPurchaseOrder = true)"
              />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="Subject" prop="subject">
          <el-input v-model="ruleForm.subject" />
        </el-form-item>
        <el-form-item label="TOP" prop="" v-if="paymentTerms.length > 0">
          <el-select
            v-model="ruleForm.payment_term_view"
            value-key="id"
            placeholder="Select"
            style="width: 240px"
            @change="(value) => onHandleSelectTOP(value as TermOfPayment)"
          >
            <el-option
              v-for="item in paymentTerms"
              :key="item.unique_id"
              :label="item.name"
              :value="item"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Customer" prop="customer_name">
          <AutocompleteContact
            v-model="ruleForm.customer_name"
            :contact="dataCustomer"
            :fetch-suggestions="querySearchCustomer"
            @save-contact="onHandleSelectCustomer"
          />
        </el-form-item>
        <el-form-item label="PIC" prop="pic_name">
          <AutocompleteContact
            v-model="ruleForm.pic_name!"
            :contact="dataPIC"
            :fetch-suggestions="querySearchCustomer"
            @save-contact="onHandleSelectPIC"
          />
        </el-form-item>

        <el-form-item label="Alamat Penagihan" prop="billing_address_id">
          <el-autocomplete
            :fetch-suggestions="querySearchAddress"
            v-model="ruleForm.billing_address_view"
            placeholder="Search Address"
            @select="onHandleSelectAddress"
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

        <el-form-item v-if="billing_address" label=" ">
          <div>
            <div class="flex items-center gap-2">
              <p>{{ billing_address.address_name }}</p>
              <el-icon
                class="cursor-pointer text-blue-500 hover:text-blue-600"
                @click="() => handleEditAddress(billing_address!, 'customer')"
                ><Edit
              /></el-icon>
            </div>
            <div>
              {{ billing_address.street }},
              {{ generateAddressView(billing_address) }}
            </div>
          </div>
        </el-form-item>

        <el-form-item label="Penerbit" prop="vendor_name">
          <el-autocomplete
            :fetch-suggestions="querySearchPublisher"
            v-model="ruleForm.vendor_name"
            placeholder="Search Publisher"
            @select="onHandleSelectPublisher"
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

        <el-form-item label="Alamat Penerbit" prop="vendor_address_view">
          <el-autocomplete
            :fetch-suggestions="querySearchAddressPublisher"
            v-model="ruleForm.vendor_address_view"
            placeholder="Search Address"
            @select="onHandleSelectAddressPublisher"
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

        <el-form-item v-if="publisher_address" label=" ">
          <div>
            <div class="flex items-center gap-2">
              <p>{{ publisher_address.address_name }}</p>
              <el-icon
                class="cursor-pointer text-blue-500 hover:text-blue-600"
                @click="() => handleEditAddress(publisher_address!, 'vendor')"
                ><Edit
              /></el-icon>
            </div>
            <div>
              {{ publisher_address.street }},
              {{ generateAddressView(publisher_address) }}
            </div>
          </div>
        </el-form-item>

        <el-form-item label="Tanggal Invoice" prop="invoice_date">
          <el-date-picker
            v-model="ruleForm.invoice_date!"
            type="date"
            placeholder="Pilih Tanggal Invoice"
          />
        </el-form-item>

        <el-form-item label="Metode Pembayaran" prop="payment_method">
          <el-select
            v-model="ruleForm.payment_method"
            placeholder="Select payment method"
          >
            <el-option
              v-for="method in paymentMethods"
              :key="method.value"
              :label="method.label"
              :value="method.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Rekening Penerima" prop="accont_bank_name">
          <el-autocomplete
            v-model="ruleForm.account_bank_name!"
            :fetch-suggestions="querySearchBanks"
            placeholder="Search account"
            @select="handleSelectBank"
            :trigger-on-focus="false"
          >
            <template #default="{ item }">
              <div v-if="item.isNew">
                <span class="text-blue-600 ml-2">Tambah {{ item.value }}</span>
              </div>
              <div v-else class="flex justify-between items-center w-full">
                <span>{{ item.account_name }}</span>
                <span class="text-gray-500 ml-2"
                  >({{ item.account_number }})</span
                >
              </div>
            </template>
          </el-autocomplete>
          <div class="flex gap-2 mt-5">
            <el-tag
              v-for="(tag, index) in transactionBanks"
              :key="tag.unique_id"
              closable
              type="primary"
              @close="() => removeBanks(index)"
            >
              {{ tag.bank_account_name }}
            </el-tag>
          </div>
        </el-form-item>

        <el-form-item label="File Lampiran" prop="files">
          <TrumsUploadFile v-model:file-list="fileList" />
        </el-form-item>

        <el-form-item label="Notes" prop="note">
          <el-input v-model="ruleForm.notes" type="textarea" />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Invoice Items Section -->
    <el-card class="mb-3">
      <template #header>
        <div class="card-header">
          <span>Invoice Items</span>
          <el-button
            type="primary"
            size="default"
            @click="() => (dialogDO = true)"
            >Pilih Dari DO</el-button
          >
        </div>
      </template>

      <el-table :data="ruleForm.invoice_item" border>
        <el-table-column prop="item_name" label="Item">
          <template #default="scope">
            <el-autocomplete
              :fetch-suggestions="querySearchCatalogue"
              v-model="scope.row.item_name"
              placeholder="Search item"
              :disabled="loading"
              @select="(item) => onHandleSelectCatalogue(item, scope.$index)"
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
          </template>
        </el-table-column>

        <el-table-column prop="quantity" label="Qty">
          <template #default="scope">
            <el-input-number
              v-model="scope.row.quantity"
              :min="0.01"
              :precision="2"
              :step="1"
              :disabled="loading"
              @change="calculateAmount(scope.$index)"
            />
          </template>
        </el-table-column>

        <el-table-column prop="unit_name" label="UOM">
          <template #default="scope">
            <el-autocomplete
              :fetch-suggestions="querySearchUnit"
              v-model="scope.row.unit_name"
              placeholder="Search item"
              :disabled="loading"
              @select="(item) => handleSelectUnit(item, scope)"
            >
              <template #default="{ item }">
                <div v-if="item.isNew" class="flex items-center text-blue-500">
                  <el-icon><Plus /></el-icon>
                  <span class="ml-2">Tambahkan "{{ item.value }}"</span>
                </div>
                <div v-else>
                  {{ item.value }}
                </div>
              </template>
            </el-autocomplete>
          </template>
        </el-table-column>

        <el-table-column prop="price" label="Unit Price">
          <template #default="scope">
            <el-input
              :disabled="loading"
              v-model="scope.row.display_price"
              inputmode="decimal"
              @input="
                (val) => {
                  const parsed = parseCurrencyID(val);
                  scope.row.price = parsed;
                  scope.row.display_price = formatCurrencyID(parsed);
                  calculateAmount(scope.$index);
                }
              "
              @blur="
                () => {
                  scope.row.display_price = formatCurrencyID(scope.row.price);
                  calculateAmount(scope.$index);
                }
              "
            />
          </template>
        </el-table-column>

        <el-table-column prop="total_amount" label="Amount">
          <template #default="scope">
            <el-input v-model="scope.row.display_total_amount" disabled />
          </template>
        </el-table-column>

        <el-table-column label="Actions" width="80">
          <template #default="scope">
            <el-button
              type="danger"
              :icon="Delete"
              circle
              @click="removeItem(scope.$index)"
              :disabled="ruleForm.invoice_item.length <= 1 || loading"
            />
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-between gap-3 items-start mt-3">
        <el-button :loading="loading" type="primary" link @click="addNewItem">
          Tambah Item Baru
        </el-button>
        <div class="flex gap-2 mt-5">
          <div>
            <div class="flex justify-between items-center">
              <p>Total Price</p>
              <p>{{ currencyWithoutSymbol(totalAmount || 0, 0) }}</p>
            </div>
            <el-divider />
            <div
              class="flex justify-between items-center"
              v-for="ref in references.filter(
                (value) =>
                  (value.adjustment || value.adjustments_transaction!)
                    .operator == 'plus' &&
                  (value.adjustment || value.adjustments_transaction!)
                    .category == 'adjustment'
              )"
              :key="ref.adjustment_id"
            >
              <p class="text-sm">
                {{
                  (ref.adjustment || ref.adjustments_transaction!).name ?? ""
                }}
              </p>
              <p>
                <el-input
                  v-if="ref.type == FeeType.AMOUNT"
                  v-model="ref.amount_nominal_display"
                  style="max-width: 600px"
                  class="no-border-input text-right"
                  @input="
                    (val) => {
                      const parsed = parseCurrencyID(val);
                      ref.amount = parsed;
                      ref.amount_nominal = parsed;
                      ref.amount_nominal_display = formatCurrencyID(parsed);
                      ref.value = ref.amount;
                    }
                  "
                  @blur="
                    () => {
                      ref.amount_nominal_display = formatCurrencyID(
                        ref.amount_nominal || 0
                      );
                    }
                  "
                />
                <el-input
                  v-if="ref.type == FeeType.PERCENT"
                  v-model="ref.amount_nominal"
                  style="max-width: 600px"
                  class="no-border-input text-right"
                  @input="
                    (val) => {
                      ref.amount = Number(val);
                      ref.amount_nominal = displayAmount(ref, totalAmount);
                      ref.amount_nominal_display = formatCurrencyID(
                        ref.amount_nominal || 0
                      );
                    }
                  "
                  @blur="
                    () => {
                      ref.amount_nominal_display = formatCurrencyID(
                        ref.amount_nominal || 0
                      );
                    }
                  "
                />
              </p>
            </div>
            <div
              class="flex justify-between items-center"
              v-for="ref in references.filter(
                (value) =>
                  (value.adjustment || value.adjustments_transaction!)
                    .operator == 'minus'
              )"
              :key="ref.adjustment_id"
            >
              <p class="text-sm">
                {{
                  (ref.adjustment || ref.adjustments_transaction!).name ?? ""
                }}
              </p>
              <p>
                <el-input
                  v-if="ref.type == FeeType.AMOUNT"
                  v-model="ref.amount_nominal_display"
                  style="max-width: 600px"
                  class="no-border-input text-right"
                  @input="
                    (val) => {
                      const parsed = parseCurrencyID(val);
                      ref.amount = parsed;
                      ref.amount_nominal = parsed;
                      ref.amount_nominal_display = formatCurrencyID(parsed);
                      ref.value = ref.amount;
                    }
                  "
                  @blur="
                    () => {
                      ref.amount_nominal_display = formatCurrencyID(
                        ref.amount_nominal || 0
                      );
                    }
                  "
                />
                <el-input
                  v-if="ref.type == FeeType.PERCENT"
                  v-model="ref.amount_nominal"
                  style="max-width: 600px"
                  class="no-border-input text-right"
                  @input="
                    (val) => {
                      ref.amount = Number(val);
                      ref.amount_nominal = displayAmount(ref, totalAmount);
                      ref.amount_nominal_display = formatCurrencyID(
                        ref.amount_nominal || 0
                      );
                    }
                  "
                  @blur="
                    () => {
                      ref.amount_nominal_display = formatCurrencyID(
                        ref.amount_nominal || 0
                      );
                    }
                  "
                />
              </p>
            </div>

            <el-divider />
            <div class="flex justify-between items-center">
              <p>Subtotal</p>
              <p>{{ currencyWithoutSymbol(subtotal || 0) }}</p>
            </div>

            <!-- <div
              v-if="
                references.find(
                  (value) =>
                    (
                      value.adjustments_transaction || value.adjustment
                    )?.name.toLowerCase() == 'ppn'
                )
              "
              class="flex justify-between items-center"
            >
              <p>DPP Nilai Lain</p>
              <p>{{ currencyWithoutSymbol(subtotal || 0) }}</p>
            </div> -->

            <div
              class="flex justify-between items-center"
              v-for="ref in references.filter(
                (value) =>
                  (value.adjustment || value.adjustments_transaction!)
                    .category == 'transform' ||
                  (value.adjustment || value.adjustments_transaction!)
                    .category == 'tax'
              )"
              :key="ref.adjustment_id"
            >
              <p>
                {{
                  (ref.adjustment || ref.adjustments_transaction!).name ?? ""
                }}
              </p>
              <p>
                {{
                  currencyWithoutSymbol(showTransactionAdjustmentValue(ref), 0)
                }}
              </p>
            </div>
            <el-divider />
            <div class="flex justify-between items-center">
              <p>Grand Total</p>
              <p>{{ currencyWithoutSymbol(paidAmount || 0, 0) }}</p>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <el-card>
      <div class="flex justify-end">
        <el-button :loading="loading" @click="resetForm(ruleFormRef)"
          >Reset</el-button
        >

        <el-button
          type="info"
          :loading="loading"
          @click="
            () => {
              ruleForm.is_performa = true;
              submitForm(ruleFormRef);
            }
          "
          >Simpan Sebagai Performa Invoice</el-button
        >
        <el-button
          type="primary"
          :loading="loading"
          @click="submitForm(ruleFormRef)"
          >Simpan</el-button
        >
      </div>
    </el-card>

    <el-dialog
      v-model="dialogNewAddress"
      title="Create New Address"
      width="500"
    >
      <FormAddress
        :onSetInitital="{
          ...addressInput,
          contact_id:
            stateAddress === 'customer'
              ? ruleForm.customer_id
              : ruleForm.vendor_id,
          contact_name:
            stateAddress === 'customer'
              ? ruleForm.customer_name
              : ruleForm.vendor_address_view,
          address_view: addressInput != null ? generateAddressView(addressInput!) : ''
        }"
        :onSuccess="onAddNewAddress"
      />
    </el-dialog>

    <el-dialog
      v-model="visibleModalPurchaseOrder"
      title="Cari Sales Order"
      width="1000"
    >
      <el-row :gutter="20" class="mb-3">
        <el-col :span="6"
          ><el-input
            v-model="request_search_purchase_order.keyword"
            size="default"
            placeholder="Type to search"
        /></el-col>
      </el-row>
      <el-table
        :data="purchase_order?.data.value?.data ?? []"
        style="width: 100%"
      >
        <el-table-column label="Nomor PO" prop="unique_code" />
        <el-table-column label="Vendor">
          <template #default="scope">
            {{ scope.row.vendor?.name }}
          </template>
        </el-table-column>
        <el-table-column label="Tanggal PO" width="200">
          <template #default="scope">
            <p>{{ formatLocalDate(scope.row.date) || "" }}</p>
          </template>
        </el-table-column>
        <el-table-column label="Total" width="150">
          <template #default="scope">
            <p>{{ currency(scope.row.total_price) || 0 }}</p>
          </template>
        </el-table-column>
        <el-table-column label="Aksi" width="100">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              @click="() => onHandleSelectReference(scope.row)"
              >Pilih</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-end mt-3">
        <el-pagination
          background
          layout="prev, pager, next, sizes, total"
          :total="purchase_order?.data.value?.total_data"
          :current-page="purchase_order?.data.value?.current_page"
          @current-change="paginationClick"
          @size-change="handlePoSizeChange"
        />
      </div>
    </el-dialog>

    <ElDrawer
      v-model="drawerVisibleCreateNewBank"
      :title="'Tambah Rekening Penerima'"
      direction="rtl"
      size="50%"
      destroy-on-close
    >
      <BankAccountForm
        :account="currentAccount"
        :is-editing="false"
        @submitted="(account: BankAccount|undefined) => {
          drawerVisibleCreateNewBank = false
          if(account){
            rekeningBanks.push(account.account_name);
            transactionBanks.push({
              unique_id: '',
              reference: TransactionBankReference.INVOICE,
              reference_id: '',
              bank_account_id: account.unique_id,
              bank_account_name: account.account_name,
              bank_account_version: account.version ?? 0,
            });
          }
        }"
        @cancel="drawerVisibleCreateNewBank = false"
      />
    </ElDrawer>

    <el-dialog v-model="dialogDO" title="Deliver Order" width="1000">
      <InventoryMovementTable
        :data="deliveryOrders.data.value!"
        :loading="deliveryOrders.status.value === 'pending'"
        @on-cancel="() => (dialogDO = false)"
        @on-submit="onHandleSelectDO"
      />
    </el-dialog>
  </TrumsWrapper>
</template>

<script lang="ts" setup>
import { Delete, Plus, Search, Edit } from "@element-plus/icons-vue";
import type { FormInstance, FormRules, UploadUserFile } from "element-plus";
import { PaymentMethod, PaymentStatus } from "~/types/finance/bill";
import {
  FinanceReference,
  type Invoice,
  type InvoiceItem,
} from "~/types/finance/invoice";
import type { AddressType } from "~/types/address";
import type { Catalogue } from "~/types/catalogue";
import type { Contact } from "~/types/contact";
import {
  PurchaseOrderStatus,
  type PurchaseOrder,
} from "~/types/scm/purchase_order";
import type { Account } from "~/types/finance/account";
import FormAddress from "~/components/trums/FormAddress.vue";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import type { InventoryMovement } from "~/types/inventory_movement";
import type { BaseResponse } from "~/types/response";
import type { DefaultResponsePagination } from "~/types/pagination";
import type { BankAccount } from "~/types/bank_account";
import type { Unit } from "~/types/unit";
import TrumsUploadFile from "~/components/trums/form/TrumsUploadFile.vue";
import {
  TransactionBankReference,
  type TransactionBank,
} from "~/types/finance/transaction";
import {
  ReferenceAdjustment,
  type AdjustmentTransaction,
  type ReferenceTransactionAdjustment,
} from "~/types/attribute_adjustment";
import ModalAdjustmentTransaction from "~/components/trums/ModalAdjustmentTransaction.vue";
import {
  formatLocalDate,
  currency,
  formatCurrencyID,
  generateAddressView,
  currencyWithoutSymbol,
} from "#imports";
import type { TermOfPayment } from "~/types/payment_term";
import AdjustmentTransactionComponent from "~/components/trums/AdjustmentTransactionComponent.vue";
import AutocompleteContact from "~/components/trums/AutocompleteContact.vue";
import { parseCurrencyID } from "#imports";
import InventoryMovementTable from "~/components/trums/InventoryMovementTable.vue";
import { FeeType } from "~/types/attribute_adjustment";
import { PaymentTerm } from "~/types/scm/canvasing";

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "invoices-create",
  name: "Create Bill",
});

const router = useRouter();
const route = useRoute();
const id = computed(() => route.query.id as string);
const is_termin = computed(() => route.query.is_termin as string);

const ruleFormRef = ref<FormInstance>();
const dialogNewAddress = ref(false);
const loading = ref(false);
const visibleModalPurchaseOrder = ref(false);
const drawerVisibleCreateNewBank = ref(false);
const visibleModalAdjustmentTransaction = ref(false);
const visibleModalNewAdjustment = ref(false);
const dialogDO = ref(false);

const stateAddress = ref<"customer" | "vendor">("customer");

const paymentMethods = [
  { value: PaymentMethod.Cash, label: "Cash" },
  { value: PaymentMethod.BankTransfer, label: "Bank Transfer" },
  { value: PaymentMethod.Giro, label: "Giro" },
];

const fileList = ref<UploadUserFile[]>([]);
const currentAccount = ref<BankAccount | null>(null);
const rekeningBanks = ref<string[]>([]);
const transactionBanks = ref<TransactionBank[]>([]);
const references = ref<ReferenceTransactionAdjustment[]>([]);

const addressInput = ref<AddressType | null>(null);
const billing_address = ref<AddressType | null>(null);
const publisher_address = ref<AddressType | null>(null);

const paymentTerms = ref<TermOfPayment[]>([]);
const dataCustomer = ref<Contact | null>(null);
const dataPIC = ref<Contact | null>(null);

const invoicesHistory = ref<Invoice[]>([]);

const ruleForm = reactive<Invoice>({
  unique_id: "",
  source_document: null,
  unique_code: "",
  customer_id: "",
  customer_name: "",
  customer_version: 1,
  payment_term_id: "",
  payment_term_view: "",
  billing_address_id: "",
  billing_address_version: 1,
  billing_address_view: "",
  invoice_date: Date.now(),
  due_date: Date.now(),
  is_tempo: false,
  payment_term: PaymentTerm.CASH,
  payment_term_value: null,
  payment_term_unit: null,
  payment_method: PaymentMethod.BankTransfer,
  recipient_bank: "",
  account_bank_name: null,
  account_bank_number: null,
  subject: "",
  pic_id: "",
  pic_name: "",
  pic_version: 0,
  type: "in",
  status: PaymentStatus.RELEASE,
  invoice_item: [
    {
      unique_id: "",
      unique_code: "",
      item_version: 1,
      item_name: "",
      unit_id: "",
      unit_name: "",
      quantity: 1,
      price: 0,
      total_amount: 0,
      created_at: Date.now(),
      created_by: 0,
      updated_at: Date.now(),
      item_id: null,
      version: 0,
      invoice_version: 0,
      invoice_id: null,
    },
  ],
  created_at: Date.now(),
  created_by: 0,
  updated_at: Date.now(),
  received_date: Date.now(),
  account_id: null,
  account_name: null,
  notes: null,
  reference: FinanceReference.OTHER,
  reference_id: null,
  reference_number: null,
  total_amount: 0,
  subtotal: 0,
  paid_amount: 0,
  invoice_date_view: Date.now().toString(),
  due_date_view: Date.now().toString(),
  vendor_id: null,
  vendor_name: "",
  vendor_version: 0,
  vendor_address_id: "",
  vendor_address_view: "",
  vendor_address_version: 0,
  is_performa: false,
  is_termin: is_termin.value == "1" ? true : false,
});

const tmp_purchase_order = ref<PurchaseOrder | null>(null);

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [],
  limit: "10",
  offset: "1",
  table: "maintenances",
  sort: {
    column: "created_at",
    order: OrderColumn.ASC,
  },
});

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
>(
  "/search",
  "search-adjustment",
  "post",
  querySearchAdjustmentTransaction.value
);

const rules = reactive({
  customer_name: [
    { required: true, message: "Please select customer", trigger: "blur" },
  ],
  vendor_name: [
    { required: true, message: "Please select a publisher", trigger: "blur" },
  ],
  vendor_address_view: [
    {
      required: true,
      message: "Please select a publisher address",
      trigger: "blur",
    },
  ],
  invoice_date: [
    {
      required: true,
      message: "Please select invoice date",
      trigger: "change",
    },
  ],
  payment_method: [
    {
      required: true,
      message: "Please select payment method",
      trigger: "change",
    },
  ],
  billing_address_id: [
    {
      required: true,
      message: "Please select billing address",
      trigger: "change",
    },
  ],
  invoice_item: [
    {
      validator: (
        _: any,
        value: InvoiceItem[],
        callback: (error?: Error) => void
      ) => {
        const messages: string[] = [];

        value.forEach((item, index) => {
          const rowNum = index + 1;
          if (!item.item_id)
            messages.push(`Item #${rowNum} tidak boleh kosong`);
          if (!item.unit_name)
            messages.push(`Item #${rowNum} belum memiliki UOM`);
          if (!item.price || item.price <= 0)
            messages.push(`Item #${rowNum} harga harus lebih dari 0`);
          if (!item.quantity || item.quantity < 1)
            messages.push(`Item #${rowNum} quantity minimal 1`);
        });

        if (messages.length > 0) {
          callback(new Error(messages.join("\n")));
        } else {
          callback();
        }
      },
      trigger: ["blur", "change"],
    },
  ],
});

const request_search_purchase_order = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      type: ["po"],
      status: [PurchaseOrderStatus.APPROVED, PurchaseOrderStatus.DONE],
    },
  ],
  limit: "10",
  offset: "1",
  table: "purchase_order",
  sort: {
    column: "created_at",
    order: OrderColumn.ASC,
  },
  flag: "form",
});

const request_search_do = ref<{
  uid_po: string;
  keyword: string;
  limit: number;
  page: number;
  type: "so" | "po";
}>({
  uid_po: "",
  keyword: "",
  limit: 10,
  page: 1,
  type: "po",
});

const deliveryOrders = await useAsyncData("fetch-delivery-order", async () => {
  const res = await useFetchApi<ResponsePagination<InventoryMovement[]>>(
    `/inventory-movement-by-so`,
    "fetch-delivery-order",
    "post",
    request_search_do.value
  );
  return res.data.value;
});

const purchase_order = await useFetchApi<ResponsePagination<PurchaseOrder[]>>(
  "/search",
  "search-reference-purchase-order",
  "post",
  request_search_purchase_order.value
);

const paginationClick = (page: number) => {
  request_search_purchase_order.value.offset = page.toString();
};
const handlePoSizeChange = (limit: number) => {
  request_search_purchase_order.value.limit = limit.toString();
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

const handleEditAddress = (
  addressEdit: AddressType,
  state: "customer" | "vendor"
) => {
  addressInput.value = addressEdit;
  stateAddress.value = state;
  dialogNewAddress.value = true;
};

const onHandleSelectDO = (values: InventoryMovement[]) => {
  ruleForm.invoice_item = [];
  values.forEach((element) => {
    element.inventory_movement_item.forEach((moveItem) => {
      const orderItem = tmp_purchase_order.value?.purchase_order_item.find(
        (find) => find.catalogue_id == moveItem.inventory?.catalogue_id
      );
      if (orderItem) {
        ruleForm.invoice_item.push({
          unique_id: "",
          unique_code: "",
          invoice_id: null,
          item_id: moveItem.inventory?.catalogue?.unique_id || "",
          item_version: moveItem.inventory?.catalogue?.version || 0,
          item_name: moveItem.inventory?.catalogue?.name || "",
          unit_id: moveItem.unit_id,
          unit_name: moveItem.unit_name,
          quantity: moveItem.quantity,
          price: orderItem.unit_price,
          total_amount:
            Number(orderItem.unit_price) * Number(moveItem.quantity),
          display_total_amount: formatCurrencyID(
            Number(orderItem.unit_price) * Number(moveItem.quantity)
          ),
          display_price: formatCurrencyID(orderItem.unit_price),
          inventory_movement_id: moveItem.unique_id,
          inventory_movement_version: moveItem.version,
          version: 0,
          invoice_version: 0,
          created_at: 0,
          created_by: 0,
          updated_at: 0,
        });
      }
    });
  });
  dialogDO.value = false;
};

watch(
  request_search_purchase_order.value,
  () => refreshNuxtData("search-reference-purchase-order"),
  { immediate: true }
);

watch(
  () => request_search_do.value,
  () => deliveryOrders.refresh(),
  { deep: true }
);

const handleAdjustmentSubmit = () => {
  visibleModalNewAdjustment.value = false;
  refreshNuxtData("search-adjustment");
};

const displayAmount = (ref: any, multiplier: number) => {
  if (ref.type === "percent") {
    return (multiplier || 0) * (ref.amount / 100);
  } else {
    return ref.amount;
  }
};

const removeBanks = (index: number) => {
  transactionBanks.value = transactionBanks.value.filter(
    (value, i) => i != index
  );
};

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

const paidAmount = computed(() => {
  return Number(grandTotal.value);
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
      if (ref.type == "amount") {
        return ref.amount;
      } else {
        // if (ref.amount == 11) {
        //   return subtotal.value * ref.amount;
        // } else if (ref.amount == 12) {
        //   return ((subtotal.value * 11) / 12) * ref.amount;
        // }
        return displayAmount(ref, getDPPNilaiLain.value);
      }
    } else {
      return ref.type == "amount"
        ? ref.amount
        : displayAmount(ref, ruleForm.subtotal || 0);
    }
  }
};

const getPlus = computed(() => {
  var plus = 0;

  references.value
    .filter(
      (value) =>
        (value.adjustment || value.adjustments_transaction!).operator ==
          "plus" &&
        (value.adjustment || value.adjustments_transaction!).category ===
          "adjustment"
    )
    .forEach((ref) => {
      if (ref.include) {
        plus += 0;
      } else {
        plus += showTransactionAdjustmentValue(ref);
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

const grandTotal = computed(() => {
  let total = totalPlus.value || 0;
  (references.value || [])
    .filter((value) => value.adjustment?.operator == "minus")
    .forEach((element) => {
      total = (totalPlus.value || 0) - showTransactionAdjustmentValue(element);
    });
  (references.value || [])
    .filter(
      (value) =>
        value.adjustment?.category == "transform" ||
        value.adjustment?.category == "tax"
    )
    .forEach((element) => {
      if (element.include == false) {
        total =
          (totalPlus.value || 0) + showTransactionAdjustmentValue(element);
      }
    });

  return total;
});
const getMinus = computed(() => {
  var minus = 0;
  references.value
    .filter(
      (value) =>
        (value.adjustment || value.adjustments_transaction!).operator == "minus"
    )
    .forEach((ref) => {
      if (ref.include == true) {
        minus += 0;
      } else {
        minus += Number(ref.amount);
      }
    });

  return minus;
});
const totalAmount = computed(() => {
  return ruleForm.invoice_item.reduce((total, ref) => {
    return total + Number(ref.total_amount || 0);
  }, 0);
});

const subtotal = computed(() => {
  let subtotal = ruleForm.subtotal || 0;

  if (ruleForm.is_termin && getInvoiceDownPayment.value > 0) {
    subtotal -= getInvoiceDownPayment.value;
  }

  return Number(subtotal) + Number(getPlus.value) - Number(getMinus.value);
});

const getInvoiceDownPaymentLabel = computed(() => {
  let label = "DP";
  if (invoicesHistory.value.length > 0) {
    if (invoicesHistory.value[0].payment_terms) {
      label = invoicesHistory.value[0].payment_terms.name;
    }
  }

  return label;
});
const getInvoiceDownPayment = computed(() => {
  let total = 0;
  console.log("invoice history", invoicesHistory.value);
  if (invoicesHistory.value.length > 0) {
    if (invoicesHistory.value[0].payment_terms) {
      total =
        ((totalAmount.value || 0) *
          invoicesHistory.value[0].payment_terms.value) /
        100;
    }
  }

  return total;
});

const totalPlus = computed(() => {
  return Number(ruleForm.subtotal) + Number(getPlus.value);
});

watch(
  () => ruleForm.reference_id,
  (newValue) => {
    let amount: number = ruleForm.subtotal || 0;
    let referenceTotal: number = 0;

    references.value.forEach((element) => {
      if (element.type == "amount") {
        referenceTotal += Number(element.amount);
      } else {
        referenceTotal += displayAmount(element, amount);
      }
    });

    ruleForm.total_amount = amount + referenceTotal;
  }
);

watch(
  () => references.value,
  () => {
    console.log("current ref", references.value);
    let total = totalPlus.value || 0;
    (references.value || [])
      .filter((value) => value.adjustment?.operator == "minus")
      .forEach((element) => {
        total =
          (totalPlus.value || 0) - showTransactionAdjustmentValue(element);
      });
    (references.value || [])
      .filter(
        (value) =>
          value.adjustment?.category == "transform" ||
          value.adjustment?.category == "tax"
      )
      .forEach((element) => {
        if (element.include == false) {
          total =
            (totalPlus.value || 0) + showTransactionAdjustmentValue(element);
        }
      });

    ruleForm.total_amount = total;
    ruleForm.display_total_amount = formatCurrencyID(total, 0);
    ruleForm.tmp_round = total;
  },
  { deep: true }
);

const calculateAmount = (index: number) => {
  const item = ruleForm.invoice_item[index];
  item.total_amount = item.quantity * item.price;
  item.display_total_amount = formatCurrencyID(item.total_amount);
};

watch(
  () => ruleForm.invoice_item,
  () => updateTotalAmount(),
  { deep: true }
);

const updateTotalAmount = () => {
  ruleForm.subtotal = ruleForm.invoice_item.reduce((total, ref) => {
    return total + Number(ref.total_amount || 0);
  }, 0);

  var amount = ruleForm.subtotal;

  if (ruleForm.is_termin) {
    if (ruleForm.payment_term_id) {
      amount =
        Number(amount || 0) * (Number(ruleForm.payment_terms?.value) / 100);
    }
  }

  ruleForm.subtotal = amount;
  ruleForm.total_amount = amount;
  ruleForm.display_total_amount = formatCurrencyID(amount, 0);
  ruleForm.tmp_round = ruleForm.total_amount;
};

const addNewItem = () => {
  ruleForm.invoice_item.push({
    unique_id: "",
    unique_code: "",
    item_id: "",
    item_version: 1,
    item_name: "",
    unit_id: "",
    unit_name: "",
    quantity: 1,
    price: 0,
    total_amount: 0,
    created_at: Date.now(),
    created_by: 0,
    updated_at: Date.now(),
    version: 0,
    invoice_version: 0,
    invoice_id: null,
  });
};

const deleteItem = async (unique_id: string, index: number) => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<any>>(
      "/invoice-item-delete",
      "delete_item",
      "post",
      [unique_id]
    );
    if (response.status.value == "success") {
      ruleForm.invoice_item.splice(index, 1);
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.message ?? error}`);
  } finally {
    loading.value = false;
  }
};

const removeItem = async (index: number) => {
  const unique_id = useCookie("unique_id");
  if (unique_id.value) {
    await ElMessageBox.confirm(
      `Apakah Anda yakin ingin menghapus item ini?`,
      "Konfirmasi Hapus",
      { type: "warning" }
    );
    deleteItem(ruleForm.invoice_item[index].unique_id!, index);
  } else {
    ruleForm.invoice_item.splice(index, 1);
  }
};

const querySearchBanks = (query: string, cb: (arg: any) => void) => {
  try {
    useFetchApi<DefaultResponsePagination<BankAccount[]>>(
      "/bank-accounts-read?flag=form",
      "get-bank-accounts",
      "get",
      null
    ).then((response) => {
      if (response.status.value == "success") {
        const banks = (response.data.value?.data.query ?? []) as BankAccount[];
        if (banks.length > 0) {
          let lists = banks.map((value) => ({
            value: `${value.account_name} (${value.account_number})`,
            ...value,
            isNew: false,
          }));

          cb([...lists, { isNew: true, value: `Tambahkan ${query}` }]);
        } else {
          cb([{ isNew: true, value: `Tambahkan ${query}` }]);
        }
      } else {
        cb([{ isNew: true, value: `Tambahkan ${query}` }]);
      }
    });
  } catch (error) {
    console.error("Failed to fetch accounts", error);
    cb([]);
  }
};

const getHistoryInvoices = async () => {
  loading.value = true;
  try {
    const request: RequestSearch = {
      keyword: "",
      table: "invoices",
      column: [
        {
          reference: ["sales"],
          reference_id: [ruleForm.reference_id],
        },
      ],
      sort: null,
      offset: "1",
      limit: "100",
    };
    const response = await useFetchApi<ResponsePagination<Invoice[]>>(
      "/search",
      "fetch-invoices-history",
      "post",
      request
    );
    if (response.status.value === "success") {
      (response.data.value?.data ?? []).forEach((element) => {
        if ((element.history_payment ?? []).length > 0) {
          console.log("invoice history", element);
          invoicesHistory.value.push(element);
        }
      });
    }
  } catch (error: any) {
    ElMessage.error(
      error?.response?.message ??
        (error || "Gagal Mengambil History Pembayaran")
    );
  } finally {
    loading.value = false;
  }
};

const handleSelectBank = (item: any) => {
  if (item.isNew == false) {
    const bank: BankAccount = item as BankAccount;
    transactionBanks.value.push({
      unique_id: "",
      reference: TransactionBankReference.INVOICE,
      reference_id: "",
      bank_account_id: bank.unique_id,
      bank_account_name: bank.account_name,
      bank_account_version: bank.version ?? 0,
    });
    ruleForm.account_bank_name = "";
  } else {
    ruleForm.account_bank_name = "";
    drawerVisibleCreateNewBank.value = true;
  }
};

const querySearchCustomer = (query: string, cb: (arg: any) => void) => {
  try {
    const request_contact = { ...request_search.value };

    request_contact.table = "contacts";
    request_contact.keyword = query;
    request_contact.flag = "form";

    useFetchApi<ResponsePagination<Contact>>(
      "/search",
      "search-customer",
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
              isNew: true,
              value: query,
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
    console.error("Failed to fetch customers", error);
    cb([]);
  }
};

const querySearchPublisher = (query: string, cb: (arg: any) => void) => {
  try {
    const request_contact = { ...request_search.value };

    request_contact.table = "contacts";
    request_contact.keyword = query;
    request_contact.flag = "form";
    request_contact.column = [
      {
        is_company: true,
        ownership: true,
      },
    ];

    useFetchApi<ResponsePagination<Contact>>(
      "/search",
      "search-publisher",
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
    console.error("Failed to fetch vendor", error);
    cb([]);
  }
};

const querySearchAddress = (query: string, cb: (arg: any) => void) => {
  try {
    const request_contact = { ...request_search.value };
    request_contact.table = "address";
    request_contact.keyword = query;
    request_contact.column = [
      {
        contact_id: ruleForm.customer_id,
      },
    ];
    request_contact.flag = "form";

    useFetchApi<ResponsePagination<AddressType>>(
      "/search",
      "search-address",
      "post",
      request_contact
    ).then((response) => {
      if (response.status.value == "success") {
        const address: AddressType[] = (response.data.value?.data ??
          []) as AddressType[];
        if (address.length > 0) {
          cb(
            address.map((value) => ({
              value: value.address_name,
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

const querySearchAddressPublisher = (query: string, cb: (arg: any) => void) => {
  try {
    const request_contact = { ...request_search.value };
    request_contact.table = "address";
    request_contact.keyword = query;
    request_contact.column = [
      {
        contact_id: ruleForm.vendor_id,
      },
    ];
    request_contact.flag = "form";

    useFetchApi<ResponsePagination<AddressType>>(
      "/search",
      "search-address-vendor",
      "post",
      request_contact
    ).then((response) => {
      if (response.status.value == "success") {
        const address: AddressType[] = (response.data.value?.data ??
          []) as AddressType[];
        if (address.length > 0) {
          cb(
            address.map((value) => ({
              value: value.address_name,
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

const querySearchReference = (query: string, cb: (arg: any) => void) => {
  try {
    if (ruleForm.reference == "other") {
      cb([
        {
          value: `${query}`,
          isNew: true,
          data: query,
        },
      ]);
    }
  } catch (error) {
    console.error("Failed to fetch accounts", error);
    cb([]);
  }
};

const querySearchCatalogue = (query: string, cb: (arg: any) => void) => {
  try {
    const request_contact = { ...request_search.value };
    if (ruleForm.reference === FinanceReference.OTHER) {
      request_contact.table = "catalogues";
    }

    request_contact.keyword = query;
    request_contact.flag = "form";

    useFetchApi<ResponsePagination<Catalogue[]>>(
      "/search",
      "search-catalogues",
      "post",
      request_contact
    ).then((response) => {
      if (response.status.value == "success") {
        const catalogues: Catalogue[] = (response.data.value?.data ??
          []) as Catalogue[];
        if (catalogues.length > 0) {
          cb([
            ...catalogues.map((value) => ({
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
    console.error("Failed to fetch catalogue items", error);
    cb([]);
  }
};

const onHandleSelectTOP = (item: TermOfPayment) => {
  if (item.unit == "nominal") {
    ruleForm.paid_amount = item.value;
  } else {
    ruleForm.paid_amount =
      (Number(ruleForm.subtotal) * Number(item.value)) / 100;
  }

  ruleForm.payment_term_view = item.name;
  ruleForm.payment_term_id = item.unique_id;
  ruleForm.payment_terms = item;
};

const onHandleSelectCustomer = (data: Contact) => {
  ruleForm.customer_id = data.unique_id;
  ruleForm.customer_name = data.name;
  ruleForm.customer_version = data.version || 1;
  dataCustomer.value = data;
};

const onHandleSelectPIC = (pic: Contact) => {
  dataPIC.value = pic;
  ruleForm.pic_id = pic.unique_id;
  ruleForm.pic_name = pic.name;
  ruleForm.pic_version = pic.version || 1;
};

const onHandleSelectPublisher = (item: any) => {
  if (item.isNew) {
    createNewCustomer(item.query).then((customer) => {
      if (customer) {
        ruleForm.vendor_id = customer.unique_id;
        ruleForm.vendor_name = customer.name;
        ruleForm.vendor_version = customer.version;
      } else {
        ruleForm.vendor_id = "";
        ruleForm.vendor_name = "";
        ruleForm.vendor_version = 0;
      }
    });
  } else {
    const customer = item.data as Contact;
    ruleForm.vendor_id = customer.unique_id;
    ruleForm.vendor_name = customer.name;
    ruleForm.vendor_version = customer.version || 1;
  }
};

const onHandleSelectAddress = (item: any) => {
  if (item.isNew) {
    stateAddress.value = "customer";
    dialogNewAddress.value = true;
  } else {
    const address = item.data as AddressType;
    ruleForm.billing_address_id = address.unique_id;
    ruleForm.billing_address_view = address.address_name;
    ruleForm.billing_address_version = address.version || 1;
    billing_address.value = address;
  }
};

const onHandleSelectAddressPublisher = (item: any) => {
  if (item.isNew) {
    stateAddress.value = "vendor";
    dialogNewAddress.value = true;
  } else {
    const address = item.data as AddressType;
    ruleForm.vendor_address_id = address.unique_id;
    ruleForm.vendor_address_view = address.address_name;
    ruleForm.vendor_address_version = address.version || 1;
    publisher_address.value = address;
  }
};

const onAddNewAddress = async (address: AddressType) => {
  if (stateAddress.value == "customer") {
    ruleForm.billing_address_id = address.unique_id;
    ruleForm.billing_address_view = address.address_name;
    ruleForm.billing_address_version = address.version || 1;
    billing_address.value = await getAddressDetail(address.unique_id);
  } else {
    ruleForm.vendor_address_id = address.unique_id;
    ruleForm.vendor_address_view = address.address_name;
    ruleForm.vendor_address_version = address.version || 1;
    publisher_address.value = await getAddressDetail(address.unique_id);
  }
  dialogNewAddress.value = false;
};

const getAddressDetail = async (
  unique_id: string
): Promise<AddressType | null> => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<AddressType | null>>(
      `/address-read/${unique_id}`,
      `get-address-detail-${unique_id}`,
      "get",
      null
    );

    if (response.status.value === "success") {
      return response.data.value?.data ?? null;
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

const onHandleSelectReference = async (item: any) => {
  if (ruleForm.reference == "other") {
    ruleForm.reference_number = item.data;
  } else if (ruleForm.reference === FinanceReference.PURCHASE_ORDER) {
    const po = item as PurchaseOrder;

    tmp_purchase_order.value = po;

    ruleForm.reference_id = po.unique_id;
    ruleForm.reference_number = po.unique_code;
    ruleForm.vendor_id = po.vendor_id;
    ruleForm.vendor_name = po.vendor_name;
    ruleForm.vendor_version = po.vendor_version;

    if (po.vendor) {
      dataCustomer.value = po.vendor;
    }

    if (po.pic) {
      ruleForm.pic_id = po.pic_id;
      ruleForm.pic_name = po.pic_name;
      ruleForm.pic_version = po.pic_version;
    }

    ruleForm.invoice_item = [];
    ruleForm.is_tempo = po.is_tempo;
    ruleForm.payment_method = po.method_payment;
    po.purchase_order_item.forEach((value) => {
      ruleForm.invoice_item.push({
        unique_id: "",
        unique_code: "",
        invoice_id: null,
        item_id: value.catalogue_id ?? "",
        item_version: value.catalogue_version,
        item_name: value.catalogue_name,
        unit_id: value.unit_id ?? "",
        unit_name: value.unit_name ?? "",
        quantity: value.quantity,
        price: value.unit_price,
        display_price: formatCurrencyID(value.unit_price),
        display_total_amount: formatCurrencyID(value.total_price),
        total_amount: value.total_price,
        version: value.version,
        invoice_version: 0,
        created_at: 0,
        created_by: 0,
        updated_at: 0,
      });
    });
    ruleForm.subtotal = po.total_price;
    ruleForm.vendor_address_id = po.address?.unique_id ?? "";
    ruleForm.vendor_address_view = po.address?.address_name ?? "";
    ruleForm.vendor_address_version = po.address?.version || 1;

    publisher_address.value = await getAddressDetail(
      po.address?.unique_id ?? ""
    );
    paymentTerms.value = po.payment_terms ?? [];

    po.reference_transaction.forEach((element) => {
      const index = references.value.findIndex(
        (find) => find.adjustment_id == element.adjustment_id
      );
      if (index < 0) {
        references.value.push({
          ...element,
          reference: ReferenceAdjustment.INVOICE,
          reference_id: "",
          adjustment: element.adjustments_transaction,
        });
      } else {
        references.value[index] = {
          ...element,
          reference: ReferenceAdjustment.INVOICE,
          reference_id: "",
          adjustment: element.adjustments_transaction,
        };
      }
    });

    request_search_do.value.uid_po = po.unique_id;

    updateTotalAmount();
    visibleModalPurchaseOrder.value = false;
  }
};

const onHandleSelectCatalogue = async (item: any, index: number) => {
  if (!item.isNew) {
    const catalogue = item.data as Catalogue;
    ruleForm.invoice_item[index].item_name = catalogue.name ?? "";
    ruleForm.invoice_item[index].item_id = catalogue.unique_id || "";
    ruleForm.invoice_item[index].item_version = catalogue.version || 1;
    ruleForm.invoice_item[index].price = 0;
  }
};

const createNewCustomer = async (data: any) => {
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

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const invoiceDate = new Date(ruleForm.invoice_date!);
        const billDate = new Date(ruleForm.due_date!);
        const receivedDate = new Date(ruleForm.received_date!);

        const formData = new FormData();

        formData.append("unique_id", ruleForm.unique_id);
        formData.append("source_document", ruleForm.source_document ?? "");
        formData.append("reference", ruleForm.reference!);
        formData.append("reference_id", ruleForm.reference_id ?? "");
        formData.append("reference_number", ruleForm.reference_number ?? "");
        formData.append("customer_id", ruleForm.customer_id!);
        formData.append("customer_name", ruleForm.customer_name);
        formData.append(
          "customer_version",
          ruleForm.customer_version!.toString()
        );
        formData.append("billing_address_id", ruleForm.billing_address_id!);
        formData.append(
          "billing_address_version",
          ruleForm.billing_address_version!.toString()
        );
        formData.append("vendor_id", ruleForm.vendor_id!);
        formData.append("vendor_name", ruleForm.vendor_name);
        formData.append("vendor_version", ruleForm.vendor_version!.toString());
        formData.append("vendor_address_id", ruleForm.vendor_address_id!);
        formData.append(
          "vendor_address_version",
          ruleForm.vendor_address_version!.toString()
        );
        formData.append("invoice_date", String(invoiceDate.getTime() / 1000));
        formData.append("due_date", String(billDate.getTime() / 1000));
        formData.append(
          "is_tempo",
          ruleForm.is_tempo == true ? "true" : "false"
        );
        formData.append("notes", ruleForm.notes ?? "");
        formData.append("type", ruleForm.type);
        formData.append("subject", `${ruleForm.subject}`);
        formData.append("pic_id", `${ruleForm.pic_id}`);
        formData.append("pic_name", `${ruleForm.pic_name}`);
        formData.append("pic_version", `${ruleForm.pic_version}`);

        formData.append("account_id", ruleForm.account_id ?? "");
        formData.append("account_name", ruleForm.account_name ?? "");
        formData.append("payment_method", ruleForm.payment_method);
        formData.append("recipient_bank", ruleForm.recipient_bank ?? "");
        formData.append("account_bank_name", ruleForm.account_bank_name ?? "");
        formData.append(
          "account_bank_number",
          ruleForm.account_bank_number ?? ""
        );
        formData.append("status", ruleForm.status);
        formData.append("received_date", String(receivedDate.getTime() / 1000));
        formData.append("subtotal", (ruleForm.subtotal || 0).toString());
        formData.append("total_amount", ruleForm.total_amount.toString());
        formData.append("paid_amount", ruleForm.total_amount.toString());
        formData.append("payment_term_id", `${ruleForm.payment_term_id}`);
        formData.append("is_performa", `${ruleForm.is_performa}`);
        formData.append("is_termin", `${ruleForm.is_termin}`);

        ruleForm.invoice_item.forEach((value, index) => {
          formData.append(
            `invoice_items[${index}][unique_id]`,
            value.unique_id
          );
          formData.append(
            `invoice_items[${index}][item_id]`,
            value.item_id ?? ""
          );
          formData.append(
            `invoice_items[${index}][item_version]`,
            (value.item_version ?? 0).toString()
          );
          formData.append(
            `invoice_items[${index}][item_name]`,
            value.item_name
          );
          formData.append(`invoice_items[${index}][unit_id]`, value.unit_id);
          formData.append(
            `invoice_items[${index}][unit_name]`,
            value.unit_name
          );
          formData.append(
            `invoice_items[${index}][quantity]`,
            String(value.quantity)
          );
          formData.append(
            `invoice_items[${index}][price]`,
            String(value.price)
          );
          formData.append(
            `invoice_items[${index}][total_amount]`,
            String(value.total_amount)
          );
          formData.append(
            `invoice_items[${index}][inventory_movement_item_id]`,
            String(value.inventory_movement_id)
          );
          formData.append(
            `invoice_items[${index}][inventory_movement_item_version]`,
            String(value.inventory_movement_version)
          );
        });

        fileList.value.forEach((element, index) => {
          formData.append(`files[${index}]`, element.raw as Blob);
        });

        transactionBanks.value.forEach((element, index) => {
          formData.append(
            `purchase_order_bank[${index}][unique_id]`,
            element.unique_id
          );
          formData.append(
            `purchase_order_bank[${index}][reference]`,
            element.reference
          );
          formData.append(
            `purchase_order_bank[${index}][reference_id]`,
            element.reference_id
          );
          formData.append(
            `purchase_order_bank[${index}][bank_account_id]`,
            element.bank_account_id
          );
          formData.append(
            `purchase_order_bank[${index}][bank_account_name]`,
            element.bank_account_name
          );
          formData.append(
            `purchase_order_bank[${index}][bank_account_version]`,
            `${element.bank_account_version}`
          );
        });

        references.value.forEach((ref, i) => {
          const refFields = {
            unique_id: ref.unique_id,
            adjustment_id: ref.adjustment_id,
            value: ref.value,
            amount: ref.amount,
            type: ref.type,
            party_type: ref.party_type,
            party_id: ref.party_id,
            reference: ref.reference,
            reference_id: ref.reference_id,
          };

          Object.entries(refFields).forEach(([key, value]) => {
            formData.append(`reference_transaction[${i}][${key}]`, `${value}`);
          });
        });

        const response = await useFetchApi<BaseResponse<Invoice>>(
          "/invoice-create",
          "invoice-out-create",
          "post",
          formData
        );

        if (response.status.value == "success") {
          const invoiceData: Invoice | null = response.data.value?.data ?? null;
          if (invoiceData) {
            ruleForm.unique_id = invoiceData.unique_id;
            ruleForm.invoice_item = invoiceData.invoice_item;
            ElMessage.success("Invoice Berhasil Dibuat!");
            router.push(`/finance-management/bill/${invoiceData.unique_id}`);
          }
        } else {
          ElMessage.error(
            response.error.value ?? "Gagal Membuat Data Invoice!"
          );
        }
      } catch (error) {
        ElMessage.error("Failed to create invoice");
        console.error(error);
      } finally {
        loading.value = false;
      }
    }
  });
};

const querySearchUnit = (queryString: string, cb: (arg: any) => void) => {
  var params = { ...request_search.value };
  params.keyword = queryString;
  params.table = "units";
  params.column = [];
  params.flag = "form";

  useFetchApi<ResponsePagination<Unit[]>>(
    "/search",
    "units",
    "post",
    params
  ).then((response) => {
    if (response.status.value == "success") {
      const resultApi: Unit[] = response.data.value?.data as Unit[];

      if (resultApi.length > 0) {
        cb(
          resultApi.map((value) => ({
            data: value,
            isNew: false,
            value: value.name,
          }))
        );
      } else {
        cb([
          {
            value: `Tambahkan ${queryString}`,
            isNew: true,
            id: `${queryString}`,
          },
        ]);
      }
    }
  });
};

const handleSelectUnit = async (record: Record<string, any>, scope: any) => {
  if (record.isNew) {
    const unit: Unit | null = await handleNewUnit({ name: record.id });
    if (unit != null) {
      ruleForm.invoice_item[scope.$index].unit_id = unit.unique_id!;
      ruleForm.invoice_item[scope.$index].unit_name = unit.name!;
    }
  } else {
    const unit: Unit = record.data as Unit;
    ruleForm.invoice_item[scope.$index].unit_id = unit.unique_id!;
    ruleForm.invoice_item[scope.$index].unit_name = unit.name!;
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

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  formEl.resetFields();

  ruleForm.reference = FinanceReference.OTHER;
  ruleForm.invoice_item = [
    {
      unique_id: "",
      unique_code: "",
      item_id: "",
      item_version: 1,
      item_name: "",
      unit_id: "",
      unit_name: "",
      quantity: 1,
      price: 0,
      total_amount: 0,
      invoice_version: 0,
      version: 0,
      created_at: Date.now(),
      created_by: 0,
      updated_at: Date.now(),
      invoice_id: null,
    },
  ];

  references.value.forEach((element) => {
    element.value = 0;
    element.amount = 0;
    element.amount_nominal = 0;
    element.amount_nominal_display = formatCurrencyID(0);
  });
};

const fetchPurchaseOrder = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<PurchaseOrder>>(
      `/purchase-order-read/${tmp_purchase_order.value?.unique_id}`,
      "detail-purchase-order",
      "get",
      null
    );

    if (response.status.value === "success") {
      tmp_purchase_order.value = response.data.value!.data!;
    }
  } catch (error) {
    ElMessage.error("Gagal mengambil data purchase order");
  } finally {
    loading.value = false;
  }
};

const fetchDataEdit = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<Invoice>>(
      `/invoice-read/${id.value}`,
      "detail-invoice",
      "get",
      null
    );
    if (response.status.value == "success") {
      const invoice: Invoice | null = response.data.value?.data ?? null;

      if (invoice) {
        Object.assign(ruleForm, invoice);

        ruleForm.invoice_date = new Date(
          invoice.invoice_date! * 1000
        ).getTime();
        ruleForm.due_date = new Date(invoice.due_date! * 1000).getTime();
        ruleForm.billing_address_view =
          invoice.billing_address?.address_name ?? "";

        if (invoice.billing_address) {
          billing_address.value = invoice.billing_address;
        }

        ruleForm.subtotal = invoice.subtotal;
        ruleForm.vendor_address_id = invoice.vendor_address?.unique_id ?? "";
        ruleForm.vendor_address_view =
          invoice.vendor_address?.address_name ?? "";
        ruleForm.vendor_address_version = invoice.vendor_address?.version ?? 0;

        ruleForm.invoice_item = (invoice.invoice_item || []).map((value) => ({
          ...value,
          display_price: formatCurrencyID(value.price),
          display_total_amount: formatCurrencyID(value.total_amount),
        }));

        if (invoice.vendor_address) {
          publisher_address.value = invoice.vendor_address;
        }

        ruleForm.unique_id = id.value;
        transactionBanks.value = invoice.purchase_order_bank ?? [];
        references.value = (invoice.reference_transaction ?? []).map(
          (value) => ({ ...value, adjustment: value.adjustments_transaction })
        );

        if (invoice.data_reference) {
          tmp_purchase_order.value = invoice.data_reference as PurchaseOrder;

          await fetchPurchaseOrder();

          request_search_do.value.uid_po = (
            invoice.data_reference as PurchaseOrder
          ).unique_id;
        }

        ruleForm.payment_term_id = invoice.payment_term_id;
        ruleForm.payment_term_view = invoice.payment_terms?.name ?? "";
      }
    }
  } catch (error: any) {
    ElMessage.error(error.response?.message ?? error);
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

    ruleForm.customer_id = setting.company.unique_id;
    ruleForm.customer_version = setting.company.version;
    ruleForm.customer_name = setting.company.name;

    ruleForm.billing_address_id = setting.address.unique_id;
    ruleForm.billing_address_version = setting.address.version;
    ruleForm.billing_address_view = setting.address.address_name;

    billing_address.value = setting.address;
  }
};

const fetchPPN = async () => {
  try {
    const request: RequestSearch = {
      column: [
        {
          name: "ppn",
          category: "tax",
        },
      ],
      keyword: "",
      limit: "100",
      offset: "1",
      table: "adjustments_transaction",
      sort: {
        column: "created_at",
        order: "asc",
      },
    };

    const response = await useFetchApi<
      ResponsePagination<AdjustmentTransaction[]>
    >("/search", "fetch-ppn", "post", request);

    if (response.status.value === "success") {
      const adjustment: AdjustmentTransaction = response.data.value!.data[0];

      references.value.push({
        unique_id: "",
        reference: ReferenceAdjustment.INVOICE,
        reference_id: "",
        adjustment_id: adjustment.unique_id,
        value: null,
        type: adjustment.type,
        amount: 0,
        amount_nominal: 0,
        amount_nominal_display: "0",
        adjustments_transaction: adjustment,
        adjustment: adjustment,
      });
    }
  } catch (error: any) {
    console.log("Gagal Mengambil PPN!");
  }
};

const fetchDiscount = async () => {
  try {
    const request: RequestSearch = {
      column: [
        {
          name: "Discount",
          category: "adjustment",
        },
      ],
      keyword: "",
      limit: "100",
      offset: "1",
      table: "adjustments_transaction",
      sort: {
        column: "created_at",
        order: "asc",
      },
    };

    const response = await useFetchApi<
      ResponsePagination<AdjustmentTransaction[]>
    >("/search", "fetch-discount", "post", request);

    if (response.status.value === "success") {
      const adjustment: AdjustmentTransaction = response.data.value!.data[0];

      references.value.push({
        unique_id: "",
        reference: ReferenceAdjustment.INVOICE,
        reference_id: "",
        adjustment_id: adjustment.unique_id,
        value: null,
        type: adjustment.type,
        amount: 0,
        amount_nominal: 0,
        amount_nominal_display: "0",
        adjustments_transaction: adjustment,
        adjustment: adjustment,
      });
    }
  } catch (error: any) {
    console.log("Gagal Mengambil Discount!");
  }
};

const fetchRounding = async () => {
  try {
    const request: RequestSearch = {
      column: [],
      keyword: "Pembulatan",
      limit: "100",
      offset: "1",
      table: "adjustments_transaction",
      sort: {
        column: "created_at",
        order: "asc",
      },
    };

    const response = await useFetchApi<
      ResponsePagination<AdjustmentTransaction[]>
    >("/search", "fetch-pembulatan", "post", request);

    if (response.status.value === "success") {
      const adjustment: AdjustmentTransaction[] =
        response.data.value?.data ?? [];
      adjustment.forEach((element) => {
        references.value.push({
          unique_id: "",
          reference: ReferenceAdjustment.INVOICE,
          reference_id: "",
          adjustment_id: element.unique_id,
          value: null,
          type: element.type,
          amount: 0,
          amount_nominal: 0,
          amount_nominal_display: "0",
          adjustments_transaction: element,
          adjustment: element,
        });
      });
    }
  } catch (error: any) {
    console.log("Gagal Mengambil Pembulatan!");
  }
};

const initialForm = async () => {
  loading.value = true;
  await fetchPPN();
  await fetchDiscount();
  await fetchRounding();
  loading.value = false;
};

onMounted(() => {
  initialForm();

  if (id.value != null && id.value != undefined) {
    fetchDataEdit();
  } else {
    initialSetting();
  }
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
:deep(.el-input-number) {
  width: 100% !important;
}

:deep(.no-border-input .el-input__wrapper) {
  box-shadow: none !important;
  border: none !important;
  border-bottom: 1px solid #dcdfe6 !important;
  border-radius: 0 !important;
  background: transparent !important;
  padding: 0 !important;
}

:deep(.no-border-input .el-input__inner) {
  text-align: right;
}
</style>
