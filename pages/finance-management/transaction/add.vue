<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3"> Tambah Transaksi Baru </span>
      </template>
    </el-page-header>

    <el-card class="my-3" shadow="never">
      <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        :rules="rules"
        label-width="auto"
        class="demo-ruleForm"
        size="default"
        :label-position="labelPosition"
        status-icon
      >
        <div class="flex gap-5">
          <div class="flex-1">
            <!-- Transaction Type -->
            <el-form-item label="Jenis Transaksi" prop="type">
              <el-radio-group v-model="ruleForm.type">
                <el-radio-button value="income">Pemasukan</el-radio-button>
                <el-radio-button value="transfer">Transfer</el-radio-button>
                <el-radio-button value="expense">Pengeluaran</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <!-- Transaction Date -->
            <el-form-item label="Tanggal Transaksi" prop="date">
              <el-date-picker
                v-model="ruleForm.date"
                type="date"
                placeholder="Pilih Tanggal"
                format="DD/MM/YYYY"
                value-format="x"
              />
            </el-form-item>

            <!-- Description -->
            <el-form-item label="Deskripsi" prop="description">
              <el-input
                v-model="ruleForm.description"
                type="textarea"
                :rows="3"
                placeholder="Deskripsi transaksi"
              />
            </el-form-item>
          </div>
          <div class="flex-1">
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

            <h3 class="text-lg font-medium mb-4">
              Informasi Bank
              {{ ruleForm.type === "income" ? "Penerima" : "Pengirim" }}
            </h3>

            <el-form-item label="Rekening Bank" prop="account_bank_name">
              <el-autocomplete
                v-model="ruleForm.account_bank_name!"
                :fetch-suggestions="querySearchBanks"
                placeholder="Cari rekening bank"
                class="w-full"
                clearable
                @clear="() => clearSelectionBank('from')"
                @select="(item) => handleSelectBank(item, 'from')"
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
                    {{ item.account_name }} ({{ item.account_number }})
                  </div>
                </template>
              </el-autocomplete>
              <div
                v-if="ruleForm.bank_account"
                class="flex flex-col el-card p-2 gap-2 mt-3"
              >
                <p style="line-height: 1">
                  {{ ruleForm.bank_account.bank_name }} |
                  {{ ruleForm.bank_account.account_name }}
                </p>
                <span style="line-height: 1">{{
                  ruleForm.bank_account.account_number
                }}</span>
              </div>
            </el-form-item>

            <h3 class="text-lg font-medium mb-4">Informasi Bank Penerima</h3>

            <el-form-item
              label="Rekening Bank Penerima"
              prop="account_bank_to_name"
            >
              <el-autocomplete
                v-model="ruleForm.account_bank_to_name!"
                :fetch-suggestions="querySearchBanks"
                placeholder="Cari rekening bank"
                class="w-full"
                clearable
                @clear="() => clearSelectionBank('to')"
                @select="(item) => handleSelectBank(item, 'to')"
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
                    {{ item.account_name }} ({{ item.account_number }})
                  </div>
                </template>
              </el-autocomplete>
              <div
                v-if="ruleForm.bank_account_to"
                class="flex flex-col el-card p-2 gap-2 mt-3"
              >
                <p style="line-height: 1">
                  {{ ruleForm.bank_account_to.bank_name }} |
                  {{ ruleForm.bank_account_to.account_name }}
                </p>
                <span style="line-height: 1">{{
                  ruleForm.bank_account_to.account_number
                }}</span>
              </div>
            </el-form-item>

            <el-divider
              v-if="ruleForm.payment_method === PaymentMethod.BankTransfer"
            />
            <!-- <h3 class="text-lg font-medium mb-4">File Lampiran</h3> -->

            <el-form-item label="File Lampiran" prop="files">
              <TrumsUploadFile v-model:file-list="fileList" />
            </el-form-item>
          </div>
        </div>

        <!-- Total Amount -->
        <!-- <el-form-item label="Total Transaksi">
          <el-input
            v-model="ruleForm.display_amount"
            :min="0"
            :precision="2"
            controls-position="right"
            class="w-full"
            @input="
              (val) => {
                const parsed = parseCurrencyID(val);
                ruleForm.amount = parsed;
                ruleForm.display_amount = formatCurrencyID(parsed);
              }
            "
            @blur="
              () => {
                ruleForm.display_amount = formatCurrencyID(ruleForm.amount);
              }
            "
          />
        </el-form-item> -->

        <!-- Cart of Account -->
        <!-- <el-form-item
          v-if="ruleForm.type == 'transfer'"
          label="Account"
          prop="account_to_name"
        >
          <el-autocomplete
            v-model="ruleForm.account_to_name!"
            :fetch-suggestions="querySearchAccounts"
            placeholder="Cari Account"
            class="w-full"
            @select="(item) => handleSelectAccount(item, 'to')"
          >
            <template #default="{ item }">
              <div v-if="item.isNew" class="flex items-center text-blue-500">
                <el-icon><Plus /></el-icon>
                <span class="ml-2">Tambahkan "{{ item.value }}"</span>
              </div>
              <div v-else>{{ item.name }} ({{ item.code }})</div>
            </template>
          </el-autocomplete>
        </el-form-item> -->
      </el-form>
    </el-card>
    <el-card class="my-3" shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="text-lg font-medium">Daftar Item Transaksi</span>
        </div>
      </template>

      <el-table :data="ruleForm.transaction_items" border style="width: 100%">
        <el-table-column>
          <template #header>
            <span class="required-header"> Deskripsi </span>
          </template>
          <template #default="{ row, $index }">
            <el-input
              v-model="row.description"
              :min="0"
              :precision="2"
              controls-position="right"
              class="w-full"
            />
          </template>
        </el-table-column>

        <el-table-column>
          <template #header>
            <span class="required-header"> CoA </span>
          </template>
          <template #default="{ row, $index }">
            <el-autocomplete
              v-model="row.account_name"
              :fetch-suggestions="(query, cb) => querySearchAccount(query, cb)"
              placeholder="Cari daftar akun"
              class="w-full"
              @select="(selected) => onHandleSelectAccounts($index, selected)"
            >
              <template #default="{ item: suggestion }">
                <div
                  v-if="suggestion.isNew"
                  class="flex items-center text-blue-500"
                >
                  <el-icon><Plus /></el-icon>
                  <span class="ml-2">Tambahkan "{{ suggestion.value }}"</span>
                </div>
                <div v-else>
                  <p>{{ suggestion.data.code }} - {{ suggestion.value }}</p>
                </div>
              </template>
            </el-autocomplete>
          </template>
        </el-table-column>

        <el-table-column width="200">
          <template #header>
            <span class="required-header"> Amount </span>
          </template>
          <template #default="{ row, $index }">
            <el-input
              v-model="row.display_price_per_unit"
              :min="0"
              :disabled="(row as TransactionItem).transaction_item_reference.length > 0"
              :precision="2"
              controls-position="right"
              class="w-full"
              @input="
                (val) => {
                  const parsed = parseCurrencyID(val);
                  row.price_per_unit = parsed;
                  row.display_price_per_unit = formatCurrencyID(parsed);

                  row.amount = parsed;
                  row.display_amount = formatCurrencyID(parsed);
                }
              "
              @blur="
                () => {
                  row.display_price_per_unit = formatCurrencyID(
                    row.price_per_unit
                  );
                  row.display_amount = formatCurrencyID(row.amount);
                }
              "
            />
          </template>
        </el-table-column>
        <el-table-column label="Kontak" width="200">
          <template #default="{ row, $index }">
            <TrumsAutocompleteContact
              v-model="row.party_name"
              :contact="row.party"
              :fetch-suggestions="(queryString: string, cb: (arg: any) => void) => querySearchVendors(queryString, cb)"
              @save-contact="(data: Contact) => onHandleSelectContact($index, data)"
            />
          </template>
        </el-table-column>
        <el-table-column label="Referensi" width="200">
          <template #default="{ row, $index }">
            <div
              v-if="row.reference_id != null"
              class="text-blue-600 cursor-pointer"
              @click="() => openDialogReferenceSelection($index)"
            >
              {{ row.reference_value }}
            </div>
            <el-button
              v-else
              type="primary"
              link
              :icon="Search"
              @click="() => openDialogReferenceSelection($index)"
              >Cari Referensi</el-button
            >
          </template>
        </el-table-column>

        <el-table-column label="Aksi" width="70">
          <template #default="scope">
            <el-button
              type="danger"
              :icon="Delete"
              circle
              @click="removeItem(scope.$index)"
              :disabled="ruleForm.transaction_items.length <= 1"
            />
          </template>
        </el-table-column>
      </el-table>

      <el-button class="mt-4" style="width: 100%" @click="addItem">
        Add New Item
      </el-button>
    </el-card>

    <!-- <AdjustmentTransactionComponent
      v-if="!loading"
      :references="references"
      @update:total="
        (value) => {
          console.log('update total', value);
        }
      "
    /> -->

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
        <el-descriptions-item :width="100" label="Subtotal" align="right">{{
          currency(subtotal)
        }}</el-descriptions-item>
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

    <el-card shadow="never">
      <div class="flex justify-end">
        <el-button @click="resetForm(ruleFormRef)">Reset</el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="submitForm(ruleFormRef)"
          >Simpan</el-button
        >
      </div>
    </el-card>

    <el-dialog
      v-model="dialogReferenceItem"
      title="Cari Referensi"
      style="width: 80%"
    >
      <el-tabs type="border-card">
        <el-tab-pane label="Purchase Order">
          <TableSingleSelectOrder
            :type="'po'"
            :key="'purchase-order'"
            @on-selected="
              (value) =>
                onHandleSelectReference(value, TypeTransactionItemReference.PO)
            "
          />
        </el-tab-pane>
        <el-tab-pane label="Sales Order">
          <TableSingleSelectOrder
            :key="'sales-order'"
            :type="'so'"
            @on-selected="
              (value) =>
                onHandleSelectReference(value, TypeTransactionItemReference.SO)
            "
          />
        </el-tab-pane>
        <el-tab-pane label="Invoice">
          <TableSelectionInvoice
            :key="'invoice'"
            :type="'invoice'"
            @on-selected="
              (value) =>
                onHandleSelectReference(
                  value,
                  TypeTransactionItemReference.INVOICE
                )
            "
          />
        </el-tab-pane>
        <el-tab-pane label="Bill">
          <TableSelectionInvoice
            :type="'bill'"
            :key="'bill'"
            @on-selected="
              (value) =>
                onHandleSelectReference(
                  value,
                  TypeTransactionItemReference.BILL
                )
            "
          />
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogReferenceItem = false">Batal</el-button>
          <el-button type="primary" @click="submitSelection">
            Simpan
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="dialogReferenceItemSelected"
      title="Referensi Terpilih"
      width="800"
    >
      <el-table
        :data="
          ruleForm.transaction_items[
            transaction_item_active_index
          ].transaction_item_reference.filter(
            (filter) => filter.is_deleted == false
          )
        "
        border
        style="width: 100%"
      >
        <el-table-column>
          <template #header>
            <span class="required-header"> No.Ref </span>
          </template>
          <template #default="{ row, $index }">
            {{ row.reference_view }}
          </template>
        </el-table-column>

        <el-table-column width="200">
          <template #header>
            <span class="required-header"> Amount </span>
          </template>
          <template #default="{ row, $index }">
            <el-input
              v-model="row.amount"
              :min="0"
              :precision="2"
              controls-position="right"
              class="w-full"
              inputmode="decimal"
              :formatter="(value: any) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="(value: any) => value.replace(/\Rp\s?|(,*)/g, '')"
            />
          </template>
        </el-table-column>
        <el-table-column label="Aksi" width="70">
          <template #default="scope">
            <el-button
              type="danger"
              :icon="Delete"
              circle
              @click="() => deleteTransactionItemRef(scope.$index)"
              :disabled="ruleForm.transaction_items.length <= 1"
            />
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogReferenceItemSelected = false"
            >Batal</el-button
          >
          <el-button
            type="primary"
            @click="
              () => {
                dialogReferenceItemSelected = false;
                dialogReferenceItem = false;
              }
            "
          >
            Simpan
          </el-button>
        </div>
      </template>
    </el-dialog>
  </TrumsWrapper>
</template>

<script lang="ts" setup>
import type {
  FormInstance,
  FormProps,
  FormRules,
  UploadUserFile,
} from "element-plus";
import { ElMessage } from "element-plus";
import { Delete, Search } from "@element-plus/icons-vue";
import type { BankAccount } from "~/types/bank_account";
import {
  ItemReference,
  TypeTransactionItemReference,
  type Transaction,
  type TransactionItem,
  type TransactionItemReference,
} from "~/types/finance/transaction";
import { PaymentMethod, PaymentStatus, type Bill } from "~/types/finance/bill";
import type { Invoice } from "~/types/finance/invoice";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import type { Account } from "~/types/finance/account";
import type { Catalogue } from "~/types/catalogue";
import type { BaseResponse } from "~/types/response";
import type { DefaultResponsePagination } from "~/types/pagination";
import TrumsUploadFile from "~/components/trums/form/TrumsUploadFile.vue";
import { currency, parseCurrencyID, formatCurrencyID } from "#imports";
import AdjustmentTransactionComponent from "~/components/trums/AdjustmentTransactionComponent.vue";
import TableSingleSelectOrder from "~/components/trums/TableSingleSelectOrder.vue";
import TableSelectionInvoice from "~/components/trums/TableSelectionInvoice.vue";
import {
  FeeType,
  ReferenceAdjustment,
  type ReferenceTransactionAdjustment,
} from "~/types/attribute_adjustment";
import { _0 } from "#tailwind-config/theme/backdropBlur";
import type { Contact } from "~/types/contact";
import type { PurchaseOrder } from "~/types/scm/purchase_order";

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "transactions-create",
});

const labelPosition = ref<FormProps["labelPosition"]>("top");

const router = useRouter();
const route = useRoute();
const id = computed(() => route.query.id as string);

const ruleFormRef = ref<FormInstance>();
const loading = ref(false);
const dialogReferenceItem = ref<boolean>(false);
const dialogReferenceItemSelected = ref<boolean>(false);

const selection_so = ref<PurchaseOrder[]>([]);
const selection_po = ref<PurchaseOrder[]>([]);
const selection_invoice = ref<Invoice[]>([]);
const selection_bill = ref<Invoice[]>([]);

const transaction_item_active_index = ref<number>(-1);

const fileList = ref<UploadUserFile[]>([]);

const references = ref<ReferenceTransactionAdjustment[]>([]);

// Helper function to create empty item
const createEmptyItem = (): TransactionItem => {
  return {
    unique_id: null,
    account_id: null,
    reference: null,
    reference_id: null,
    reference_value: "",
    description: "",
    quantity: 1,
    price_per_unit: 0,
    amount: 0,
    debit: 0,
    debit_display: formatCurrencyID(0),
    kredit: 0,
    transaction_item_reference: [],
  };
};

interface ListItem {
  value: string;
  label: string;
}

const options = ref<ListItem[]>([]);
const paymentMethods = [
  { value: PaymentMethod.Cash, label: "Cash" },
  { value: PaymentMethod.BankTransfer, label: "Bank Transfer" },
];

const ruleForm = reactive<Transaction>({
  unique_id: "",
  unique_code: "",
  type: "income" as "income" | "expense" | "transfer",
  date: Date.now(),
  amount: 0,
  description: "",
  recipient_bank: null,
  recipient_bank_version: 0,

  recipient_bank_to: "",
  recipient_bank_to_version: 0,

  account_bank_name: "",
  account_bank_number: "",
  account_bank_version: 0,

  created_at: Date.now(),
  created_by: "",
  transaction_items: [createEmptyItem()],
  account_id: null,
  account_name: null,
  account_version: 0,

  account_bank_to_name: "",
  account_bank_to_number: "",
  account_bank_to_version: 0,

  account_to_id: "",
  account_to_name: "",
  account_to_version: 0,
  display_amount: formatCurrencyID(0),

  payment_method: PaymentMethod.Cash,
});

const totalPrice = computed(() => {
  const total = ruleForm.transaction_items.reduce(
    (accumulator, currentValue) => {
      return accumulator + currentValue.amount;
    },
    0
  );

  console.log("total_price", total);

  return total;
});

const subtotal = computed(() => {
  let total = totalPrice.value - getMinus.value + getPlus.value;

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
        (value.adjustment || value.adjustments_transaction!).operator ==
          "plus" &&
        (value.adjustment || value.adjustments_transaction!).category ===
          "adjustment"
    )
    .forEach((ref) => {
      if (ref.include == false) {
        plus +=
          ref.type == FeeType.AMOUNT
            ? Number(ref.amount)
            : displayAmount(ref, totalPrice.value);
      }
    });

  return plus;
});
const getTaxTransform = computed(() => {
  var plus = 0;

  references.value
    .filter(
      (value) =>
        (value.adjustment || value.adjustments_transaction!).operator ==
          "plus" &&
        (value.adjustment || value.adjustments_transaction!).category === "tax"
    )
    .forEach((ref) => {
      if (ref.include == false) {
        plus +=
          ref.type == FeeType.AMOUNT
            ? Number(ref.amount)
            : displayAmount(ref, totalPrice.value);
      }
    });

  return plus;
});

const grandTotal = computed(() => {
  return subtotal.value + getTaxTransform.value;
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
        const dppValue = getDPPFormula(dpp, totalPrice.value || 0);
        return getPPNFormula(ref, dppValue || totalPrice.value);
      } else {
        return getPPNFormula(ref, totalPrice.value);
      }
    } else {
      if (ref.adjustment?.operator == "minus") {
        return ref.type == "amount"
          ? ref.amount
          : displayAmount(ref, totalPrice.value || 0);
      } else if (ref.adjustment?.operator == "plus") {
        return ref.type == "amount"
          ? ref.amount
          : displayAmount(ref, totalPrice.value || 0);
      }
    }
  }
};

// const handleSelection

const deleteTransactionItemRef = (index: number) => {
  if (transaction_item_active_index.value >= 0) {
    ruleForm.transaction_items[
      transaction_item_active_index.value
    ].transaction_item_reference[index].is_deleted = true;
  }
};

// Watch total amount and update main amount
watch(
  () => ruleForm.transaction_items,
  () => {
    ruleForm.amount = ruleForm.transaction_items.reduce(
      (sum, item) => sum + (item.amount || 0),
      0
    );

    ruleForm.display_amount = formatCurrencyID(ruleForm.amount);
  },
  { deep: true }
);

// Form validation rules
const rules = reactive<FormRules>({
  type: [
    {
      required: true,
      message: "Jenis transaksi wajib dipilih",
      trigger: "change",
    },
  ],
  date: [{ required: true, message: "Tanggal wajib diisi", trigger: "change" }],
  account_id: [
    { required: true, message: "Akun wajib dipilih", trigger: "change" },
  ],
  description: [
    { required: true, message: "Deskripsi wajib diisi", trigger: "blur" },
  ],
  account_bank_name: [
    {
      required: true,
      message: "Nama bank wajib diisi",
      trigger: "blur",
      validator: (rule, value, callback) => {
        if (!ruleForm.recipient_bank && !value) {
          callback(new Error("Pilih bank atau isi manual nama bank"));
        } else {
          callback();
        }
      },
    },
  ],
  account_bank_number: [
    {
      required: true,
      message: "Nomor rekening wajib diisi",
      trigger: "blur",
      validator: (rule, value, callback) => {
        if (!ruleForm.recipient_bank && !value) {
          callback(new Error("Pilih bank atau isi manual nomor rekening"));
        } else {
          callback();
        }
      },
    },
  ],
});

const itemReferenceRules = {
  required: true,
  message: "Tipe referensi item wajib dipilih",
  trigger: "change",
};

// Methods
const goBack = () => router.back();

const addItem = () => {
  ruleForm.transaction_items.push(createEmptyItem());
};

const deleteItem = async (unique_id: string, index: number) => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<any>>(
      "/transaction-items-delete",
      "delete_item",
      "post",
      [unique_id]
    );
    if (response.status.value == "success") {
      ruleForm.transaction_items.splice(index, 1);
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.message ?? error}`);
  } finally {
    loading.value = false;
  }
};

const removeItem = async (index: number) => {
  if (ruleForm.transaction_items.length > 1) {
    const unique_id = useCookie("unique_id");
    if (unique_id.value) {
      await ElMessageBox.confirm(
        `Apakah Anda yakin ingin menghapus item ini?`,
        "Konfirmasi Hapus",
        { type: "warning" }
      );
      deleteItem(ruleForm.transaction_items[index].unique_id!, index);
    } else {
      ruleForm.transaction_items.splice(index, 1);
    }
  } else {
    ElMessage.warning("Minimal harus ada satu item transaksi");
  }
};

const querySearchAccount = (query: string, cb: (arg: any) => void) => {
  try {
    const request_search: RequestSearch = {
      keyword: query,
      table: "accounts",
      column: [],
      sort: null,
      offset: "1",
      limit: "10",
    };
    useFetchApi<ResponsePagination<Account[]>>(
      "/search",
      "search-accounts",
      "post",
      request_search
    ).then((response) => {
      if (response.status.value == "success") {
        const accounts: Account[] = (response.data.value?.data ??
          []) as Account[];
        cb(
          accounts.map((account) => ({
            value: account.name,
            data: account,
          }))
        );
      }
    });

    // if (referenceType === "invoice") {

    // } else if (referenceType === "bill") {
    //   request_search.column = [
    //     {
    //       type: ["in"],
    //     },
    //   ];
    //   useFetchApi<ResponsePagination<Invoice[]>>(
    //     "/search",
    //     "inovices",
    //     "post",
    //     request_search
    //   ).then((response) => {
    //     if (response.status.value == "success") {
    //       const invoices: Invoice[] = (response.data.value?.data ??
    //         []) as Invoice[];
    //       cb(
    //         invoices.map((inv) => ({
    //           value: inv.unique_code,
    //           ...inv,
    //           reference: "invoice",
    //         }))
    //       );
    //     }
    //   });
    // } else if (referenceType === "other") {
    //   const request_search: RequestSearch = {
    //     keyword: query,
    //     table: "catalogues",
    //     column: [],
    //     sort: {
    //       column: "created_at",
    //       order: OrderColumn.ASC,
    //     },
    //     offset: "1",
    //     limit: "10",
    //   };

    //   useFetchApi<ResponsePagination<Catalogue[]>>(
    //     "/search",
    //     "search-catalogue",
    //     "post",
    //     request_search
    //   ).then((response) => {
    //     if (response.status.value == "success") {
    //       const catalogues: Catalogue[] = (response.data.value?.data ??
    //         []) as Catalogue[];
    //       if (catalogues.length > 0) {
    //         cb(
    //           catalogues.map((value) => ({
    //             value: value.name,
    //             ...value,
    //             isNew: false,
    //           }))
    //         );
    //       } else {
    //         cb([
    //           {
    //             value: `Tambahkan ${query}`,
    //             data: query,
    //             isNew: true,
    //           },
    //         ]);
    //       }
    //     }
    //   });
    // }
  } catch (error) {
    console.error("Failed to fetch references", error);
    cb([]);
  }
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

const onHandleSelectContact = (index: number, contact: Contact) => {
  ruleForm.transaction_items[index].party_name = contact.name;
  ruleForm.transaction_items[index].party_id = contact.unique_id;
};

const onHandleSelectAccounts = (index: number, item: any) => {
  const account: Account = item.data as Account;
  ruleForm.transaction_items[index].account_id = account.unique_id;
  ruleForm.transaction_items[index].account_name = account.name;
};

const onHandleSelectReference = (
  data: any,
  ref: TypeTransactionItemReference
) => {
  if (
    ref == TypeTransactionItemReference.BILL ||
    ref == TypeTransactionItemReference.INVOICE
  ) {
    const reference = data as Invoice;
    ruleForm.transaction_items[transaction_item_active_index.value].reference =
      ref;
    ruleForm.transaction_items[
      transaction_item_active_index.value
    ].reference_id = reference.unique_id;
    ruleForm.transaction_items[
      transaction_item_active_index.value
    ].reference_value = reference.unique_code;
    ruleForm.transaction_items[transaction_item_active_index.value].amount =
      reference.total_amount;
    ruleForm.transaction_items[
      transaction_item_active_index.value
    ].display_price_per_unit = formatCurrencyID(reference.total_amount);
    ruleForm.transaction_items[transaction_item_active_index.value].party_id =
      reference.vendor?.unique_id;
    ruleForm.transaction_items[transaction_item_active_index.value].party_name =
      reference.vendor?.name;
  } else if (
    ref == TypeTransactionItemReference.PO ||
    ref == TypeTransactionItemReference.SO
  ) {
    ruleForm.transaction_items[transaction_item_active_index.value].reference =
      ref;
    const reference = data as PurchaseOrder;
    ruleForm.transaction_items[
      transaction_item_active_index.value
    ].reference_id = reference.unique_id;
    ruleForm.transaction_items[
      transaction_item_active_index.value
    ].reference_value = reference.unique_code;
    ruleForm.transaction_items[transaction_item_active_index.value].amount =
      reference.total_price;
    ruleForm.transaction_items[
      transaction_item_active_index.value
    ].display_price_per_unit = formatCurrencyID(reference.total_price);
    ruleForm.transaction_items[transaction_item_active_index.value].party_id =
      reference.vendor_id;
    ruleForm.transaction_items[transaction_item_active_index.value].party_name =
      reference.vendor_name;
  }

  dialogReferenceItem.value = false;
};

const handleSelectAccount = (item: any, type: "to" | "from") => {
  if (item.isNew == false) {
    const account = item as Account;

    if (type == "to") {
      ruleForm.account_to_id = account.unique_id;
      ruleForm.account_to_name = account.name;
      ruleForm.account_to_version = account.version ?? 0;
    } else {
      ruleForm.account_id = account.unique_id;
      ruleForm.account_name = account.name;
      ruleForm.account_version = account.version ?? 0;
    }
  }
};

const querySearchBanks = (query: string, cb: (arg: any) => void) => {
  try {
    useFetchApi<DefaultResponsePagination<BankAccount[]>>(
      "/bank-accounts-read",
      "get-bank-accounts",
      "get",
      null
    ).then((response) => {
      if (response.status.value == "success") {
        const banks = (response.data.value?.data.query ?? []) as BankAccount[];
        console.log("data", banks);
        cb(
          banks.map((value) => ({
            value: `${value.account_name} (${value.account_number})`,
            ...value,
            isNew: false,
          }))
        );
      }
    });
  } catch (error) {
    console.error("Failed to fetch accounts", error);
    cb([]);
  }
};

const handleSelectBank = (item: any, type: "from" | "to") => {
  if (item.isNew == false) {
    const bank: BankAccount = item as BankAccount;
    if (type == "from") {
      ruleForm.bank_account = bank;
      ruleForm.recipient_bank = bank.unique_id;
      ruleForm.account_bank_name = bank.account_name;
      ruleForm.account_bank_number = bank.account_number;
      ruleForm.account_bank_version = bank.version;
    } else {
      ruleForm.bank_account_to = bank;
      ruleForm.recipient_bank_to = bank.unique_id;
      ruleForm.account_bank_to_name = bank.account_name;
      ruleForm.account_bank_to_number = bank.account_number;
      ruleForm.account_bank_to_version = bank.version;
    }
  }
};
const clearSelectionBank = (type: "from" | "to") => {
  if (type == "from") {
    ruleForm.bank_account = null;
    ruleForm.recipient_bank = null;
    ruleForm.account_bank_name = null;
    ruleForm.account_bank_number = null;
    ruleForm.account_bank_version = 0;
  } else {
    ruleForm.bank_account_to = null;
    ruleForm.recipient_bank_to = "";
    ruleForm.account_bank_to_name = "";
    ruleForm.account_bank_to_number = "";
    ruleForm.account_bank_to_version = 0;
  }
};

async function createCatalogue(data: any): Promise<Catalogue | null> {
  try {
    const response = await useFetchApi<BaseResponse<Catalogue | null>>(
      "/catalogues-create",
      "create-catalogue",
      "post",
      data
    );
    if (response.status.value == "success") {
      return response.data.value?.data ?? null;
    } else {
      ElMessage.error(`${response?.error ?? "Gagal Membuat Katalog Baru"}`);
      return null;
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.message ?? error}`);
    return null;
  }
}

const openDialogReferenceSelection = (index: number) => {
  transaction_item_active_index.value = index;
  dialogReferenceItem.value = true;
};
const openDialogReferenceSelectionExist = (index: number) => {
  transaction_item_active_index.value = index;
  dialogReferenceItemSelected.value = true;
};

const submitSelection = async () => {
  let refs: TransactionItemReference[] = [];

  [...selection_po.value, ...selection_so.value].forEach((element) => {
    refs.push({
      transaction_item_id: "",
      reference: ItemReference.PO,
      reference_view: element.unique_code,
      reference_id: element.unique_id,
      amount: 0,
      amount_view: "0",
      is_deleted: false,
    });
  });
  [...selection_invoice.value, ...selection_bill.value].forEach((element) => {
    refs.push({
      transaction_item_id: "",
      reference: ItemReference.INVOICE,
      reference_view: element.unique_code,
      reference_id: element.unique_id,
      amount: 0,
      amount_view: "0",
      is_deleted: false,
    });
  });
  ruleForm.transaction_items[transaction_item_active_index.value].amount = 0;
  ruleForm.transaction_items[
    transaction_item_active_index.value
  ].transaction_item_reference = refs;

  console.log(
    "refs",
    ruleForm.transaction_items[transaction_item_active_index.value]
      .transaction_item_reference
  );

  dialogReferenceItemSelected.value = true;
};

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const date = new Date(ruleForm.date!);

        const payload = {
          unique_id: ruleForm.unique_id,
          type: ruleForm.type,
          date: date.getTime() / 1000,
          description: ruleForm.description,
          amount: ruleForm.amount,
          account_id: ruleForm.account_id,
          account_name: ruleForm.account_name,
          account_to_id: ruleForm.account_to_id,
          account_to_name: ruleForm.account_to_name,
          account_version: ruleForm.account_version ?? 1,
          account_to_version: ruleForm.account_to_version ?? 1,

          recipient_bank: ruleForm.recipient_bank,
          recipient_bank_version: ruleForm.recipient_bank_version ?? 1,

          recipient_bank_to: ruleForm.recipient_bank_to,
          recipient_bank_to_version: ruleForm.recipient_bank_to_version ?? 1,

          accont_bank_name: ruleForm.account_bank_name,
          account_bank_number: ruleForm.account_bank_number,
          account_bank_to_number: ruleForm.account_bank_to_number,
          account_bank_to_name: ruleForm.account_bank_to_name,
          payment_method: ruleForm.payment_method,

          transaction_items: ruleForm.transaction_items.map((value) => ({
            reference: value.reference,
            reference_id: value.reference_id,
            reference_value: value.reference_value,
            description: value.description,
            quantity: value.quantity,
            price_per_unit: value.price_per_unit,
            amount: value.amount,
            party_id: value.party_id,
            party: "contacts",
            is_deleted: value.is_deleted ?? false,
            transaction_item_reference: value.transaction_item_reference.map(
              (ref) => ({
                transaction_item_id: value.unique_id,
                reference: ref.reference,
                reference_id: ref.reference_id,
                amount: ref.amount,
              })
            ),
          })),
        };

        const formData = new FormData();

        // Append data biasa
        formData.append("unique_id", payload.unique_id);
        formData.append("type", payload.type);
        formData.append("date", `${payload.date}`); // Date jadi string
        formData.append("description", `${payload.description}`);
        formData.append("amount", grandTotal.value.toString());
        formData.append("account_id", `${payload.account_id}`);
        formData.append("account_name", `${payload.account_name}`);

        formData.append("payment_method", `${payload.payment_method}`);
        formData.append("recipient_bank", `${payload.recipient_bank}`);
        formData.append("account_bank_name", `${payload.accont_bank_name}`);

        formData.append("recipient_bank_to", `${payload.recipient_bank_to}`);
        formData.append(
          "account_bank_to_name",
          `${payload.account_bank_to_name}`
        );
        formData.append(
          "account_bank_to_number",
          `${payload.account_bank_to_number}`
        );
        formData.append(
          "account_bank_to_version",
          `${payload.account_to_version || 0}`
        );

        ruleForm.transaction_items.forEach((value, index) => {
          formData.append(
            `transaction_items[${index}][unique_id]`,
            value.unique_id ?? ""
          );
          formData.append(
            `transaction_items[${index}][reference]`,
            `${value.reference}`
          );
          formData.append(
            `transaction_items[${index}][account_id]`,
            value.account_id || ""
          );
          formData.append(
            `transaction_items[${index}][reference_id]`,
            value.reference_id ?? ""
          );
          formData.append(
            `transaction_items[${index}][reference_value]`,
            value.reference_value
          );
          formData.append(
            `transaction_items[${index}][description]`,
            value.description ?? ""
          );
          formData.append(
            `transaction_items[${index}][quantity]`,
            `${value.quantity}`
          );
          formData.append(
            `transaction_items[${index}][price_per_unit]`,
            `${value.price_per_unit}`
          );
          formData.append(
            `transaction_items[${index}][amount]`,
            `${value.amount}`
          );
          formData.append(`transaction_items[${index}][party]`, `contacts`);
          formData.append(
            `transaction_items[${index}][party_id]`,
            `${value.party_id}`
          );

          value.transaction_item_reference.forEach((ref, indexRef) => {
            formData.append(
              `transaction_items[${index}][transaction_item_reference][${indexRef}]['transaction_item_id']`,
              `${ref.transaction_item_id}`
            );
            formData.append(
              `transaction_items[${index}][transaction_item_reference][${indexRef}]['reference']`,
              `${ref.reference}`
            );
            formData.append(
              `transaction_items[${index}][transaction_item_reference][${indexRef}]['reference_id']`,
              `${ref.reference_id}`
            );
            formData.append(
              `transaction_items[${index}][transaction_item_reference][${indexRef}]['amount']`,
              `${ref.amount}`
            );
          });
        });

        console.log(fileList);

        fileList.value.forEach((element, index) => {
          formData.append(`files[${index}]`, element.raw as Blob);
        });

        let indexRef = 0;
        references.value.forEach((ref, i) => {
          if (ref.amount > 0) {
            const refFields = {
              unique_id: ref.unique_id,
              adjustment_id: ref.adjustment_id,
              value: ref.value,
              amount: ref.amount,
              type: ref.type,
              party_type: ref.party_type,
              party_id: ref.party_id,
              reference: ReferenceAdjustment.TRANSACTION,
              reference_id: ref.reference_id,
            };

            Object.entries(refFields).forEach(([key, value]) => {
              formData.append(
                `reference_transaction[${indexRef}][${key}]`,
                `${value}`
              );
            });

            indexRef++;
          }
        });

        const response = await useFetchApi<BaseResponse<Transaction>>(
          "/transaction-create",
          "create-transaction",
          "post",
          formData
        );

        if (response.status.value === "success") {
          ElMessage.success("Transaksi berhasil disimpan");
          const transaction: Transaction | null = response.data.value
            ?.data as Transaction;
          if (transaction) {
            ruleForm.unique_id = transaction.unique_id;
            ruleForm.transaction_items = transaction.transaction_items;
            // window.location.href =
            //   "/finance-management/transaction/" + transaction.unique_id;
          }
        }
      } catch (error: any) {
        console.error(
          "Error saat membuat transaksi:",
          error.response.message ?? error
        );
        ElMessage.error("Gagal menyimpan transaksi");
      } finally {
        loading.value = false;
      }
    }
  });
};

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  formEl.resetFields();
  ruleForm.transaction_items = [createEmptyItem()];
};

// Helper functions
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

const generateTransactionCode = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(4, "0");
  return `TRX/${year}${month}${day}/${random}`;
};

const fetchDataEdit = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<Transaction>>(
      `/transaction-read/${id.value}`,
      "data-edit",
      "get",
      null
    );
    if (response.status.value == "success") {
      const trx: Transaction | null = response.data.value?.data as Transaction;
      if (trx != null) {
        Object.assign(ruleForm, trx);
        console.log("items", trx.transaction_items[0].party_data);
        ruleForm.transaction_items = trx.transaction_items.map((item) => ({
          unique_id: item.unique_id,
          account_id: item.account_id,
          reference: item.reference,
          reference_id: item.reference_id,
          reference_value: item.reference_value,
          description: item.description,
          account_name: item.account?.name,
          quantity: item.quantity,
          price_per_unit: item.price_per_unit,
          amount: item.amount,
          party_id: item.party_id,
          party_name: item.party_data?.name,
          display_price_per_unit: formatCurrencyID(item.price_per_unit || 0),
          display_amount: formatCurrencyID(item.amount || 0),
          transaction_item_reference: item.transaction_item_reference ?? [],
        }));

        ruleForm.date = new Date(trx.date! * 1000).getTime();

        console.log("items", ruleForm.transaction_items);
      } else {
        ElMessage.error(`Data Tidak Di Temukan!`);
        router.back();
      }
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.message ?? error}`);
    router.back();
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  console.log("data edit id", id.value);
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

.el-divider {
  margin: 20px 0;
}

.item-container {
  background-color: #f9fafc;
  border-color: #e4e7ed;
}

.item-container:hover {
  border-color: #c0c4cc;
}

.required-header::before {
  content: "*";
  color: var(--el-color-danger);
  margin-right: 4px;
}
</style>
