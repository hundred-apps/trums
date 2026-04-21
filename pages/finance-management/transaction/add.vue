<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3"> Tambah Transaksi Baru </span>
      </template>
    </el-page-header>

    <el-card class="my-3">
      <template #header>
        <div class="card-header">
          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              @click="submitForm(ruleFormRef)"
              >Simpan</el-button
            >
            <el-button @click="resetForm(ruleFormRef)">Reset</el-button>
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
            :rows="2"
            placeholder="Deskripsi transaksi"
          />
        </el-form-item>

        <!-- Total Amount -->
        <el-form-item label="Total Transaksi">
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
        </el-form-item>

        <!-- Cart of Account -->
        <el-divider />
        <h3 class="text-lg font-medium mb-4">CoA</h3>

        <el-form-item label="Account" prop="account_name">
          <el-autocomplete
            v-model="ruleForm.account_name!"
            :fetch-suggestions="querySearchAccounts"
            placeholder="Cari Account"
            class="w-full"
            @select="(item) => handleSelectAccount(item, 'from')"
          >
            <template #default="{ item }">
              <div v-if="item.isNew" class="flex items-center text-blue-500">
                <el-icon><Plus /></el-icon>
                <span class="ml-2">Tambahkan "{{ item.value }}"</span>
              </div>
              <div v-else>{{ item.name }} ({{ item.code }})</div>
            </template>
          </el-autocomplete>
        </el-form-item>

        <h3 v-if="ruleForm.type == 'transfer'" class="text-lg font-medium mb-4">
          CoA Tujuan
        </h3>

        <el-form-item
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
        </el-form-item>

        <!-- Bank Information Section -->
        <el-divider />
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
            @select="(item) => handleSelectBank(item, 'from')"
          >
            <template #default="{ item }">
              <div v-if="item.isNew" class="flex items-center text-blue-500">
                <el-icon><Plus /></el-icon>
                <span class="ml-2">Tambahkan "{{ item.value }}"</span>
              </div>
              <div v-else>
                {{ item.account_name }} ({{ item.account_number }})
              </div>
            </template>
          </el-autocomplete>
        </el-form-item>

        <h3 v-if="ruleForm.type == 'transfer'" class="text-lg font-medium mb-4">
          Informasi Bank Penerima
        </h3>

        <el-form-item
          v-if="ruleForm.type == 'transfer'"
          label="Rekening Bank Penerima"
          prop="account_bank_to_name"
        >
          <el-autocomplete
            v-model="ruleForm.account_bank_to_name!"
            :fetch-suggestions="querySearchBanks"
            placeholder="Cari rekening bank"
            class="w-full"
            @select="(item) => handleSelectBank(item, 'to')"
          >
            <template #default="{ item }">
              <div v-if="item.isNew" class="flex items-center text-blue-500">
                <el-icon><Plus /></el-icon>
                <span class="ml-2">Tambahkan "{{ item.value }}"</span>
              </div>
              <div v-else>
                {{ item.account_name }} ({{ item.account_number }})
              </div>
            </template>
          </el-autocomplete>
        </el-form-item>

        <el-divider />
        <h3 class="text-lg font-medium mb-4">File Lampiran</h3>

        <el-form-item label="File" prop="files">
          <TrumsUploadFile v-model:file-list="fileList" />
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="my-3">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="text-lg font-medium">Daftar Item Transaksi</span>
        </div>
      </template>

      <el-table :data="ruleForm.transaction_items" border style="width: 100%">
        <el-table-column label="Referensi">
          <template #default="{ row, $index }">
            <el-select v-model="row.reference" placeholder="pilih referensi">
              <el-option label="Invoice" value="invoice" />
              <el-option label="Bill" value="bill" />
              <el-option label="Other" value="other" />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column label="Nomor/Nama Item">
          <template #default="{ row, $index }">
            <el-autocomplete
              v-if="row.reference && row.reference !== 'other'"
              v-model="row.reference_value"
              :fetch-suggestions="
                (query, cb) => querySearchReference(query, cb, row.reference)
              "
              placeholder="Cari nomor referensi"
              class="w-full"
              :disabled="row.reference == null"
              @select="
                (selected) =>
                  onHandleSelectReference(selected, $index, row.reference)
              "
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
                  <p style="line-height: 15px" class="font-bold">
                    {{
                      row.reference == "invoice"
                        ? suggestion.customer_name
                        : row.reference == "bill"
                        ? suggestion.vendor_name
                        : ""
                    }}
                  </p>
                  <p>
                    Nomor: {{ suggestion.unique_code ?? "Tidak Ada" }} | Jumlah:
                    {{ currency(suggestion.total_amount) ?? "Tidak Ada" }}
                  </p>
                </div>
              </template>
            </el-autocomplete>

            <el-input
              v-else
              v-model="row.reference_value"
              :disabled="row.reference == null"
              placeholder="Nama item"
            />
          </template>
        </el-table-column>

        <el-table-column label="Kuantitas">
          <template #default="{ row, $index }">
            <el-input-number
              v-model="row.quantity"
              :min="0.01"
              :step="0.01"
              :precision="2"
              :disabled="row.reference == null"
              controls-position="right"
              class="w-full"
              @change="calculateItemAmount($index)"
            />
          </template>
        </el-table-column>

        <el-table-column label="Harga Satuan">
          <template #default="{ row, $index }">
            <el-input
              v-model="row.display_price_per_unit"
              :min="0"
              :precision="2"
              controls-position="right"
              class="w-full"
              :disabled="
                row.reference == null ||
                row.reference == 'invoice' ||
                row.reference == 'bill'
              "
              @change="calculateItemAmount($index)"
            />
          </template>
        </el-table-column>

        <el-table-column label="Total">
          <template #default="{ row, $index }">
            <el-input
              v-model="row.display_amount"
              :precision="2"
              :disabled="row.reference == null"
              controls-position="right"
              class="w-full"
            />
          </template>
        </el-table-column>

        <el-table-column label="Aksi">
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
  </TrumsWrapper>
</template>

<script lang="ts" setup>
import type { FormInstance, FormRules, UploadUserFile } from "element-plus";
import { ElMessage } from "element-plus";
import { Delete } from "@element-plus/icons-vue";
import type { BankAccount } from "~/types/bank_account";
import type { Transaction, TransactionItem } from "~/types/finance/transaction";
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

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "transactions-create",
});

const router = useRouter();
const ruleFormRef = ref<FormInstance>();
const loading = ref(false);

const fileList = ref<UploadUserFile[]>([]);

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
  };
};

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
});

// // Calculate total amacount from items
// const totalAmount = computed(() => {
//   ruleForm.amount = ruleForm.transaction_items.reduce(
//     (sum, item) => sum + (item.amount || 0),
//     0
//   );

//   ruleForm.display_amount = formatCurrencyID(ruleForm.amount);

//   return
// });

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

const calculateItemAmount = (index: number) => {
  const item = ruleForm.transaction_items[index];
  item.amount = Number((item.quantity * item.price_per_unit).toFixed(2));
};

const handleItemReferenceChange = (index: number) => {
  const item = ruleForm.transaction_items[index];
  item.reference_id = null;
  item.reference_value = "";
};

const querySearchReference = (
  query: string,
  cb: (arg: any) => void,
  referenceType: string | null
) => {
  try {
    if (!referenceType) {
      cb([]);
      return;
    }

    const request_search: RequestSearch = {
      keyword: query,
      table: "invoices",
      column: [
        {
          status: ["received"],
          type: ["out"],
        },
      ],
      sort: null,
      offset: "1",
      limit: "10",
    };

    if (referenceType === "invoice") {
      useFetchApi<ResponsePagination<Invoice[]>>(
        "/search",
        "inovices",
        "post",
        request_search
      ).then((response) => {
        if (response.status.value == "success") {
          const invoices: Invoice[] = (response.data.value?.data ??
            []) as Invoice[];
          cb(
            invoices.map((inv) => ({
              value: inv.unique_code,
              ...inv,
              reference: "invoice",
            }))
          );
        }
      });

      // if (filtered.length > 0) {
      //   cb(filtered.map(inv => ({
      //     value: inv.unique_code,
      //     unique_id: inv.unique_id,
      //     reference: 'invoice',
      //     data: inv
      //   })))
      // } else {
      //   cb([{
      //     value: query,
      //     isNew: true,
      //     reference: 'invoice'
      //   }])
      // }
    } else if (referenceType === "bill") {
      request_search.column = [
        {
          type: ["in"],
        },
      ];
      useFetchApi<ResponsePagination<Invoice[]>>(
        "/search",
        "inovices",
        "post",
        request_search
      ).then((response) => {
        if (response.status.value == "success") {
          const invoices: Invoice[] = (response.data.value?.data ??
            []) as Invoice[];
          cb(
            invoices.map((inv) => ({
              value: inv.unique_code,
              ...inv,
              reference: "invoice",
            }))
          );
        }
      });
    } else if (referenceType === "other") {
      const request_search: RequestSearch = {
        keyword: query,
        table: "catalogues",
        column: [],
        sort: {
          column: "created_at",
          order: OrderColumn.ASC,
        },
        offset: "1",
        limit: "10",
      };

      useFetchApi<ResponsePagination<Catalogue[]>>(
        "/search",
        "search-catalogue",
        "post",
        request_search
      ).then((response) => {
        if (response.status.value == "success") {
          const catalogues: Catalogue[] = (response.data.value?.data ??
            []) as Catalogue[];
          if (catalogues.length > 0) {
            cb(
              catalogues.map((value) => ({
                value: value.name,
                ...value,
                isNew: false,
              }))
            );
          } else {
            cb([
              {
                value: `Tambahkan ${query}`,
                data: query,
                isNew: true,
              },
            ]);
          }
        }
      });
    }
  } catch (error) {
    console.error("Failed to fetch references", error);
    cb([]);
  }
};

const querySearchAccounts = (query: string, cb: (arg: any) => void) => {
  try {
    console.log(query);

    if (query != "" && query != "null") {
      const request_search: RequestSearch = {
        keyword: query,
        table: "accounts",
        column: [],
        sort: {
          column: "created_at",
          order: OrderColumn.ASC,
        },
        offset: "1",
        limit: "10",
      };

      useFetchApi<ResponsePagination<Account[]>>(
        "/search",
        "search-account",
        "post",
        request_search
      ).then((response) => {
        if (response.status.value == "success") {
          const accounts: Account[] = (response.data.value?.data ??
            []) as Account[];
          cb(
            accounts.map((value) => ({
              value: `${value.name} (${value.code})`,
              isNew: false,
              ...value,
            }))
          );
        }
      });
    }
  } catch (error) {
    console.error("Failed to fetch accounts", error);
    cb([]);
  }
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
  console.log(item);
  if (item.isNew == false) {
    const bank: BankAccount = item as BankAccount;
    if (type == "from") {
      ruleForm.recipient_bank = bank.unique_id;
      ruleForm.account_bank_name = bank.account_name;
      ruleForm.account_bank_number = bank.account_number;
      ruleForm.account_bank_version = bank.version;
    } else {
      ruleForm.recipient_bank_to = bank.unique_id;
      ruleForm.account_bank_to_name = bank.account_name;
      ruleForm.account_bank_to_number = bank.account_number;
      ruleForm.account_bank_to_version = bank.version;
    }
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

const onHandleSelectReference = async (
  selected: any,
  index: number,
  reference: string
) => {
  const item = ruleForm.transaction_items[index];
  console.log(selected.reference);
  if (selected.reference === "invoice" || selected.reference === "bill") {
    const invoice = selected as Invoice;
    item.reference_value = invoice.unique_code;
    item.reference_id = invoice.unique_id;
    item.description = "";
    item.price_per_unit = invoice.total_amount;
    item.quantity = 1;
    item.amount = invoice.total_amount;
    item.display_price_per_unit = formatCurrencyID(invoice.total_amount);
    item.display_amount = formatCurrencyID(invoice.total_amount);
  } else {
    if (selected.isNew) {
      const catalogue: Catalogue | null = await createCatalogue({
        name: selected.data,
      });
      item.reference_value = catalogue?.name ?? "";
      item.reference_id = catalogue?.unique_id ?? "";
      item.description = "";
      item.price_per_unit = 0;
      item.quantity = 1;
      item.amount = 0;
    } else {
      const catalogue: Catalogue = selected.data as Catalogue;
      item.reference_value = catalogue.name ?? "";
      item.reference_id = catalogue.unique_id;
      item.description = "";
      item.price_per_unit = 0;
      item.quantity = 1;
      item.amount = 0;
    }
  }
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

          transaction_items: ruleForm.transaction_items.map((value) => ({
            reference: value.reference,
            reference_id: value.reference_id,
            reference_value: value.reference_value,
            description: value.description,
            quantity: value.quantity,
            price_per_unit: value.price_per_unit,
            amount: value.amount,
          })),
        };

        const formData = new FormData();

        // Append data biasa
        formData.append("unique_id", payload.unique_id);
        formData.append("type", payload.type);
        formData.append("date", `${payload.date}`); // Date jadi string
        formData.append("description", `${payload.description}`);
        formData.append("amount", payload.amount.toString());
        formData.append("account_id", `${payload.account_id}`);
        formData.append("account_name", `${payload.account_name}`);

        formData.append("recipient_bank", `${payload.recipient_bank}`);
        formData.append("account_bank_name", `${payload.accont_bank_name}`);
        formData.append(
          "account_bank_number",
          `${payload.account_bank_number}`
        );

        ruleForm.transaction_items.forEach((value, index) => {
          formData.append(
            `transaction_items[${index}][unique_id]`,
            value.unique_id ?? ""
          );
          formData.append(
            `transaction_items[${index}][reference]`,
            value.reference ?? ""
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
        });

        console.log(fileList);

        fileList.value.forEach((element, index) => {
          formData.append(`files[${index}]`, element.raw as Blob);
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
            window.location.href =
              "/finance-management/transaction/" + transaction.unique_id;
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
    const unique_id = useCookie("unique_id");
    const response = await useFetchApi<BaseResponse<Transaction>>(
      `/transaction-read/${unique_id.value}`,
      "data-edit",
      "get",
      null
    );
    if (response.status.value == "success") {
      const trx: Transaction | null = response.data.value?.data as Transaction;
      if (trx != null) {
        Object.assign(ruleForm, trx);
        ruleForm.date = new Date(trx.date! * 1000).getTime();
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
  const unique_id = useCookie("unique_id");
  if (unique_id.value != null && unique_id.value != undefined) {
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
</style>
