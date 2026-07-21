<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3"> Buat Memo Transaksi </span>
      </template>
    </el-page-header>
    <el-card
      class="my-3"
      shadow="hover"
      v-loading="status == 'pending'"
      element-loading-text="Loading..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      element-loading-background="rgba(122, 122, 122, 0.8)"
    >
      <template #header>
        <div class="card-header flex justify-end">Memo Transaksi</div>
      </template>

      <div class="flex gap-3 my-3">
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="small" :label-width="200">
            <el-descriptions-item
              label="Nomor Referensi"
              label-class-name="font-bold"
            >
              {{ data?.data?.sourcing_document || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label-class-name="font-bold" label="Nomor SO">
              {{ data?.data?.unique_code || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label-class-name="font-bold" label="Kontak">
              {{ data?.data?.vendor?.name || "-" }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="small" :label-width="200">
            <el-descriptions-item label-class-name="font-bold" label="PIC">
              {{ data?.data?.pic_name || "-" }}
            </el-descriptions-item>
            <el-descriptions-item
              label-class-name="font-bold"
              label="Tanggal PO"
            >
              {{
                data?.data?.date != null
                  ? formatLocalDate(data?.data?.date)
                  : "-"
              }}
            </el-descriptions-item>

            <el-descriptions-item
              label-class-name="font-bold"
              label="Estimasi Sampai"
            >
              {{
                data?.data?.expected_arrival != null
                  ? formatLocalDate(data?.data?.expected_arrival)
                  : "-"
              }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <h1 class="font-bold">Informasi Tambahan</h1>
      <div
        class="text-sm mt-1"
        v-if="data?.data?.additional_information"
        v-html="`${extractDescription(data?.data?.additional_information)}`"
      ></div>
      <span v-else class="text-sm text-gray-400"
        >Tidak ada informasi tambahan</span
      >
    </el-card>

    <el-card class="mb-3" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>Purchase Order Items</span>
        </div>
      </template>
      <TrumsDragScrollTable>
        <el-table
          :data="item_memo ?? []"
          row-key="unique_id"
          :expand-row-keys="getExpandRowKeys ?? []"
          border
        >
          <el-table-column prop="catalogue_name" label="Item" width="400" />
          <el-table-column
            prop="quantity"
            label="QTY"
            align="right"
            :width="70"
          />
          <el-table-column
            prop="unit_name"
            label="UOM"
            align="center"
            width="100"
          />
          <el-table-column
            prop="vendor_name"
            label="Vendor"
            align="center"
            width="200"
          >
            <template #default="{ row, $index }">
              <div class="flex justify-between items-center cursor-pointer">
                <span>{{ row.vendor_name }}</span>
                <el-icon
                  v-if="row.type == 'child'"
                  color="#409efc"
                  @click="
                    () => changeItem(row.parent_index, parseInt(row.index))
                  "
                  ><Refresh
                /></el-icon>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="quo_number"
            label="No.QUO"
            align="center"
            width="200"
          >
            <template #default="{ row }">
              <span v-if="row.type == 'child'">{{ row.quo_number }}</span>
              <span v-else></span>
            </template>
          </el-table-column>
          <el-table-column
            prop="canvassing_number"
            label="No.RAB"
            align="center"
            width="200"
          >
            <template #default="{ row }">
              <NuxtLink
                v-if="row.type == 'child'"
                :href="`/sales/quotation/${row.canvassing_id}`"
                class="text-blue-600"
                >{{ row.canvassing_number }}</NuxtLink
              >
              <span v-else></span>
            </template>
          </el-table-column>
          <el-table-column label="Harga Beli" width="300" align="center">
            <el-table-column
              label="Satuan"
              width="150"
              header-align="center"
              align="right"
            >
              <template #default="{ row }">
                <span
                  >{{ currencyWithoutSymbol((row as CanvassingItemMemoForm).unit_price, 0) }}</span
                >
              </template>
            </el-table-column>
            <el-table-column
              label="Total"
              header-align="center"
              align="right"
              width="150"
            >
              <template #default="{ row }">
                <span
                  >{{ currencyWithoutSymbol((row as CanvassingItemMemoForm).total_price, 0) }}</span
                >
              </template>
            </el-table-column>
          </el-table-column>

          <el-table-column label="Harga QUO" width="300" align="center">
            <el-table-column
              label="Satuan"
              header-align="center"
              align="right"
              width="150"
            >
              <template #default="{ row }">
                <span
                  >{{ currencyWithoutSymbol((row as CanvassingItemMemoForm).selling_price, 0) }}</span
                >
              </template>
            </el-table-column>
            <el-table-column
              label="Total"
              header-align="center"
              align="right"
              width="150"
            >
              <template #default="{ row }">
                <span
                  >{{ currencyWithoutSymbol((row as CanvassingItemMemoForm).total_selling_price, 0) }}</span
                >
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column label="Harga Jual" width="300" align="center">
            <el-table-column
              label="Satuan"
              header-align="center"
              align="right"
              width="150"
            >
              <template #default="{ row }">
                <span
                  >{{ currencyWithoutSymbol((row as CanvassingItemMemoForm).unit_po_price, 0) }}</span
                >
              </template>
            </el-table-column>
            <el-table-column
              label="Total"
              header-align="center"
              align="right"
              width="150"
            >
              <template #default="{ row }">
                <span
                  class="text-end"
                  >{{ currencyWithoutSymbol((row as CanvassingItemMemoForm).total_po_price, 0) }}</span
                >
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column
            prop="margin"
            label="Margin (Rp)"
            align="right"
            width="150"
          >
            <template #default="{ row }">
              <span
                >{{ currencyWithoutSymbol(calculateMarginNominal((row as CanvassingItemMemoForm).unit_price, (row as CanvassingItemMemoForm).unit_po_price), 0) }}</span
              >
            </template>
          </el-table-column>
          <el-table-column
            prop="margin"
            label="Margin (%)"
            align="right"
            width="150"
          >
            <template #default="{ row }">
              <span
                >{{ customMathCeil(calculateMargin((row as CanvassingItemMemoForm).unit_price, (row as CanvassingItemMemoForm).unit_po_price))









































































































































































                }}%</span
              >
            </template>
          </el-table-column>
        </el-table>
      </TrumsDragScrollTable>

      <div class="flex justify-end mt-3">
        <el-pagination
          background
          layout="prev, pager, next, sizes, total"
          :total="purchaseOrderItem?.data.value?.total_data"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
    <el-card class="mb-3" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>Penerima Fee</span>
        </div>
      </template>
      <el-table :data="contactsFee" border style="width: 100%">
        <el-table-column label="Nama">
          <template #default="{ row, $index }">
            {{ row.party?.name || "N/A" }}
          </template>
        </el-table-column>

        <el-table-column label="No.RAB">
          <template #default="{ row }">
            {{ row.canvassing_code || "" }}
          </template>
        </el-table-column>

        <el-table-column :label="`Fee`" prop="amount">
          <template #default="{ row }">
            {{ currencyWithoutSymbol(row.amount, 0) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="mb-3" shadow="never">
      <template #header>
        <div class="card-header"><span>Biaya Lainya</span></div>
      </template>
      <div>
        <div
          class="flex justify-between items-center mb-2"
          v-for="(ref, index) in otherCost.filter(
            (filter) => filter.adjustments_transaction?.category !== 'tax'
          )"
        >
          <span class="font-bold text-sm">{{
            ref.adjustment?.name
              ? ref.adjustment?.name
              : ref.adjustments_transaction?.name ?? ""
          }}</span>
          <span class="text-sm flex items-center gap-3">
            <el-input
              v-model="ref.tmp_amount_input"
              style="max-width: 300px"
              :disabled="true"
              placeholder="Masukan Nilai"
              @input="
                (value) => {
                  // onInputAdjustment(ref);
                  ref.amount = Number(value);
                  console.log('ref', ref);
                }
              "
            >
              <template #append>
                <el-select
                  v-model="ref.type"
                  :disabled="true"
                  style="width: 100px"
                >
                  <el-option label="%" value="percent" />
                  <el-option label="Rp" value="amount" />
                </el-select>
              </template>
            </el-input>
          </span>
        </div>
      </div>
    </el-card>
    <el-card class="mb-3" shadow="never">
      <template #header>
        <div class="card-header"><span>Pajak</span></div>
      </template>
      <div>
        <div
          class="flex justify-between items-center mb-2"
          v-for="(ref, index) in otherCost.filter(
            (filter) => filter.adjustments_transaction?.category == 'tax'
          )"
        >
          <span class="font-bold text-sm">{{
            ref.adjustment?.name
              ? ref.adjustment?.name
              : ref.adjustments_transaction?.name ?? ""
          }}</span>
          <span class="text-sm flex items-center gap-3">
            <el-input
              v-model="ref.tmp_amount_input"
              style="max-width: 300px"
              :disabled="true"
              placeholder="Masukan Nilai"
              @input="
                (value) => {
                  // onInputAdjustment(ref);
                  ref.amount = Number(value);
                  console.log('ref', ref);
                }
              "
            >
              <template #append>
                <el-select
                  v-model="ref.type"
                  :disabled="true"
                  style="width: 100px"
                >
                  <el-option label="%" value="percent" />
                  <el-option label="Rp" value="amount" />
                </el-select>
              </template>
            </el-input>
          </span>
        </div>
      </div>
    </el-card>
    <el-card class="mb-3" shadow="never">
      <template #header>
        <div class="card-header"><span>Summary</span></div>
      </template>
      <el-table :data="summeryView">
        <el-table-column prop="label" label="">
          <template #default="{ row }">
            <span class="font-bold">{{ row.label }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="" width="200" />
        <el-table-column prop="percent" label="" width="100" />
      </el-table>
    </el-card>

    <el-dialog
      v-model="modalSelectItem"
      title="Buat/Pilih Penawaran Baru"
      width="1000"
    >
      <PricetagItemSelect
        :customer_id="data?.data.vendor_id!"
        @on-selection="onSelectPricetagItem"
      />
    </el-dialog>
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import type { ResponsePagination } from "~/types/response_pagination";
import type {
  PurchaseOrder,
  PurchaseOrderItem,
} from "~/types/scm/purchase_order";
import { formatLocalDate, extractDescription } from "#imports";
import {
  CanvassingVendorStatus,
  type Canvassing,
  type CanvassingItem,
  type CanvassingItemForm,
} from "~/types/scm/canvasing";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import { currencyWithoutSymbol } from "#imports";
import {
  FeeType,
  type ReferenceTransactionAdjustment,
} from "~/types/attribute_adjustment";
import { customMathCeil } from "#imports";
import { Refresh } from "@element-plus/icons-vue";
import ModalSearchItemExample from "~/components/trums/ModalSearchItemExample.vue";
import type { Pricetag_item } from "~/types/pricetag";
import PricetagItemSelect from "~/components/trums/PricetagItemSelect.vue";
import { triggerEvent } from "element-plus/es/utils/index.mjs";

type ReferenceTransactionAdjustmentMemo = ReferenceTransactionAdjustment & {
  canvassing_id: string;
  canvassing_code: string;
};

const contactsFee = ref<ReferenceTransactionAdjustmentMemo[]>([]);
const otherCost = ref<ReferenceTransactionAdjustment[]>([]);

const svg = `
  <path class="path" d="
    M 30 15
    L 28 17
    M 25.61 25.61
    A 15 15, 0, 0, 1, 15 30
    A 15 15, 0, 1, 1, 27.99 7.5
    L 15 15
  " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
`;

const router = useRouter();
const route = useRoute();
const goBack = () => router.back();

const purchaseOrderId = ref<string>(route.query.id as string);

const visibleModalSearchItemExample = ref(false);
const modalSelectItem = ref(false);

const parentIndexActive = ref<number>(-1);
const childIndexActive = ref<number>(-1);

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

type PurchasOrderViewTree = {
  unique_id: string;
  item_name: string;
  item_id: string;
  quo_id: string;
  canvassing_id: string;
  canvassing_code: string;
  quantity: number;
  unit_name: string;
  quo_number: string;
  harga_quo: number;
  harga_po: number;
  total: number;
  children: PurchasOrderViewTree[];
};

const purchaseOrderItemsView = ref<PurchasOrderViewTree[]>([]);
const summeryView = ref<
  {
    label: string;
    amount: string;
    percent: string;
  }[]
>([]);

type CanvassingItemMemoForm = CanvassingItemForm & {
  unit_po_price: number;
  total_po_price: number;
  canvassing_number: string;
  canvassing_vendor_unique_id: string;
};

type TotalPerRAB = {
  canvassing_id: string;
  total: number;
};

const item_memo = ref<CanvassingItemMemoForm[]>([]);
const list_canvassings = ref<string[]>([]);

const fee_canvassing = ref<
  {
    canvassing_id: string;
    canvassing_vendors: {
      unique_id: string;
      fee: ReferenceTransactionAdjustment[];
    }[];
  }[]
>([]);

const list_canvassing_vendors = ref<string[]>([]);
const total_per_RAB = ref<TotalPerRAB[]>([]);

const { data, status, refresh } = await useAsyncData(
  "fetch-po-detail",
  async () => {
    const res = await useFetchApi<ResponsePagination<PurchaseOrder>>(
      `/purchase-order-read/${purchaseOrderId.value}`,
      "detail-purchase-order",
      "get",
      null
    );
    return res.data.value;
  }
);

const request_search_po_item = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      order_id: [purchaseOrderId.value],
    },
  ],
  limit: "10",
  offset: "1",
  table: "purchase_order_item",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
  flag: "list",
});

const purchaseOrderItem = await useAsyncData("fetch-order-item", async () => {
  let res: ResponsePagination<PurchaseOrderItem[]> = {
    success: false,
    current_page: 0,
    total_page: 0,
    total_data: 0,
    data: [],
  };
  console.log("fetch ", request_search_po_item.value.column);
  if (request_search_po_item.value.column.length > 0) {
    const response = await useFetchApi<ResponsePagination<PurchaseOrderItem[]>>(
      `/search`,
      "fetch-order-item",
      "post",
      request_search_po_item.value
    );
    console.log("masuk ke sini", response);
    res = response.data.value ?? {
      success: false,
      current_page: 0,
      total_page: 0,
      total_data: 0,
      data: [],
    };
  }

  return res;
});

const getContactsFee = async (
  reference: string[],
  reference_id: string[]
): Promise<ReferenceTransactionAdjustment[]> => {
  try {
    const request: RequestSearch = {
      keyword: "",
      column: [
        {
          reference: reference,
          reference_id: reference_id,
          adjustments_transaction: {
            name: ["Fee"],
          },
        },
      ],
      limit: "10",
      offset: "1",
      table: "reference_transaction_adjustment",
      sort: {
        column: "created_at",
        order: "DESC",
      },
      flag: "list",
    };

    const response = await useFetchApi<
      ResponsePagination<ReferenceTransactionAdjustment[]>
    >("/search", "search-ref-fee", "post", request);
    if (response.status.value == "success") {
      return response.data.value?.data || [];
    } else {
      return [];
    }
  } catch (error: any) {
    return [];
  }
};

const onSelectPricetagItem = (item: Pricetag_item) => {
  const vendors =
    (item.data_reference as CanvassingItem | undefined)?.canvassing_vendor ??
    [];

  if (item.pricetag?.type == "in") {
    item_memo.value[parentIndexActive.value].children[
      childIndexActive.value
    ].vendor_id = item.pricetag?.owner_id;
    item_memo.value[parentIndexActive.value].children[
      childIndexActive.value
    ].vendor_name = item.pricetag?.owner?.name || "";
    item_memo.value[parentIndexActive.value].children[
      childIndexActive.value
    ].quo_number = item.pricetag?.unique_code;
    item_memo.value[parentIndexActive.value].children[
      childIndexActive.value
    ].unit_id = item.unit_id;
    item_memo.value[parentIndexActive.value].children[
      childIndexActive.value
    ].unit_id = item.unit_name;
    item_memo.value[parentIndexActive.value].children[
      childIndexActive.value
    ].unit_price = item.price;
    item_memo.value[parentIndexActive.value].children[
      childIndexActive.value
    ].total_price =
      item_memo.value[parentIndexActive.value].children[childIndexActive.value]
        .quantity * item.price;
  } else {
    console.log("items", item);
    const match = vendors.findLast(
      (find) =>
        find.catalogue_id ==
        item_memo.value[parentIndexActive.value].children[
          childIndexActive.value
        ].catalogue_id
    );
    if (match) {
      item_memo.value[parentIndexActive.value].children[
        childIndexActive.value
      ].vendor_id = match.vendor_id;
      item_memo.value[parentIndexActive.value].children[
        childIndexActive.value
      ].vendor_name = match.vendor?.name || "";
      item_memo.value[parentIndexActive.value].children[
        childIndexActive.value
      ].quo_number = item.pricetag?.unique_code;
      item_memo.value[parentIndexActive.value].children[
        childIndexActive.value
      ].unit_id = item.unit_id;
      item_memo.value[parentIndexActive.value].children[
        childIndexActive.value
      ].unit_id = item.unit_name;
      item_memo.value[parentIndexActive.value].children[
        childIndexActive.value
      ].unit_price = match.unit_price;
      item_memo.value[parentIndexActive.value].children[
        childIndexActive.value
      ].total_price =
        item_memo.value[parentIndexActive.value].children[
          childIndexActive.value
        ].quantity * match.unit_price;
      item_memo.value[parentIndexActive.value].children[
        childIndexActive.value
      ].selling_price = item.price;
      item_memo.value[parentIndexActive.value].children[
        childIndexActive.value
      ].total_selling_price =
        item_memo.value[parentIndexActive.value].children[
          childIndexActive.value
        ].quantity * item.price;
    }
  }
  parentIndexActive.value = -1;
  childIndexActive.value = -1;
  modalSelectItem.value = false;

  findRecepientFee();
  calculateSummaryaData();
};

const generateFee = async () => {
  contactsFee.value = [];
  item_memo.value.forEach((element) => {
    element.children.forEach((child) => {
      child.contacts_fee.forEach((fee) => {
        if (fee.type == FeeType.PERCENT) {
          if (fee.value != null) {
            const totalProfitFee = Number(fee.value) + 100;
            const profit =
              child.selling_price - child.unit_price - child.ongkir;
            contactsFee.value.push({
              ...fee,
              amount: child.quantity * (profit / totalProfitFee) * fee.value,
              canvassing_id: element.canvassing_id || "",
              canvassing_code: element.canvassing_number,
            });
          }
        } else {
          contactsFee.value.push({
            ...fee,
            amount: fee.amount * child.quantity,
            canvassing_id: element.canvassing_id || "",
            canvassing_code: element.canvassing_number,
          });
        }
      });
    });
  });

  item_memo.value.forEach((element) => {
    const totalRAB = total_per_RAB.value.findLast(
      (find) => find.canvassing_id == element.canvassing_id
    );
    if (totalRAB) {
      element.contacts_fee.forEach((cFee) => {
        if (cFee.type == FeeType.PERCENT) {
          const feePercent = Number(cFee.value);
          cFee.amount = totalRAB.total * (feePercent / 100);
        }

        contactsFee.value.push({
          ...cFee,
          canvassing_id: element.canvassing_id || "",
          canvassing_code: element.canvassing_number,
        });
      });
    }
  });
};

const findRecepientFee = () => {
  item_memo.value = item_memo.value.map((parent) => {
    // Ambil semua party_id yang ada di fee child
    const childPartyIds = parent.children.flatMap((child) =>
      (child.contacts_fee || [])
        .filter((fee) => fee.reference === "canvassing_vendor")
        .map((fee) => fee.party_id)
    );

    return {
      ...parent,
      contacts_fee: (parent.contacts_fee || []).filter((fee) => {
        // Hapus fee parent jika party_id sama dengan fee child
        if (
          fee.reference === "canvassing" &&
          childPartyIds.includes(fee.party_id)
        ) {
          return false;
        }

        return true;
      }),
    };
  });

  generateFee();
};

const totalHargaBeli = computed(() => {
  return item_memo.value.reduce((sum, data) => sum + data.total_price, 0);
});
const totalHargaJual = computed(() => {
  return item_memo.value.reduce(
    (sum, data) => sum + data.total_selling_price,
    0
  );
});

watch(
  () => purchaseOrderItem.data.value?.data,
  async () => {
    item_memo.value = [];
    let parentIndex = 0;
    for (const element of purchaseOrderItem.data.value?.data || []) {
      let childs: CanvassingItemMemoForm[] = [];

      childs =
        element.pricetag_item?.data_reference == undefined
          ? []
          : await Promise.all(
              (
                (element.pricetag_item?.data_reference as CanvassingItem)
                  .canvassing_vendor ?? []
              )
                .filter(
                  (vendor) =>
                    vendor.catalogue_id === element.catalogue_id &&
                    vendor.status == CanvassingVendorStatus.SELECTED
                )
                .map(async (vendor, indexChild) => {
                  const unit_buy_price = vendor.unit_price || 0;
                  const quantity = element.quantity;
                  const total_buy_price = quantity * (vendor.unit_price || 0);

                  const findPerRAB = total_per_RAB.value.findIndex(
                    (find) =>
                      find.canvassing_id ==
                      (
                        (element.pricetag_item
                          ?.data_reference as CanvassingItem) || undefined
                      )?.canvassing_id
                  );

                  if (findPerRAB >= 0) {
                    total_per_RAB.value[findPerRAB].total += total_buy_price;
                  } else {
                    if (
                      (
                        (element.pricetag_item
                          ?.data_reference as CanvassingItem) || undefined
                      )?.canvassing_id
                    ) {
                      total_per_RAB.value.push({
                        canvassing_id: (
                          (element.pricetag_item
                            ?.data_reference as CanvassingItem) || undefined
                        )?.canvassing_id,
                        total: total_buy_price,
                      });
                    }
                  }

                  let fees: ReferenceTransactionAdjustment[] = [];

                  if (vendor.unique_id) {
                    fees = await getContactsFee(
                      ["canvassing_vendor"],
                      [vendor.unique_id!]
                    );
                  }

                  return {
                    index: `${indexChild}`,
                    canvassing_id:
                      (
                        element.pricetag_item?.pricetag?.reference_data as
                          | Canvassing
                          | undefined
                      )?.unique_id || "N/A",
                    canvaasing_version: null,
                    item_request_trail_version: null,
                    item_request_trail_id: null,
                    unique_id: vendor.unique_id,
                    vendor_id: vendor.vendor_id,
                    vendor_name: vendor.vendor?.name || "",
                    unit_id: vendor.unit_id,
                    unit_name: vendor.unit_name,
                    unit_version: vendor.unit_version,
                    offer_item_id: null,
                    offer_item_version: 0,
                    catalogue_id: vendor.catalogue_id || "",
                    catalogue_name: vendor.catalogue
                      ? displayCatalogueName(vendor.catalogue)
                      : vendor.catalogue_name,
                    sn: "",
                    quantity: vendor.quantity,
                    unit_price: vendor.unit_price,
                    total_price: element.quantity * vendor.unit_price,
                    status: CanvassingVendorStatus.SUBMITTED,
                    taxes: [],
                    editing: null,
                    type: "child",
                    type_item: "request",
                    equivalent_id: null,
                    children: [],
                    selling_price: element.pricetag_item?.price || 0,
                    total_selling_price:
                      element.quantity * (element.pricetag_item?.price || 0),
                    profit: vendor.profit_nominal || 0,
                    profit_unit: "amount",
                    fee: vendor.fee_nominal || 0,
                    fee_unit: "amount",
                    ongkir: vendor.ongkir,
                    ongkir_unit: "amount",
                    pricetag_item_id: vendor.pricetag_item_id || "",
                    pricetag_item_version: vendor.pricetag_item_version,
                    quo_number:
                      element.pricetag_item?.pricetag?.unique_code || "",
                    unit_po_price: element.po_unit_price || 0,
                    total_po_price:
                      element.quantity * (element.po_unit_price || 0),
                    contacts_fee: fees,
                    canvassing_vendor_unique_id: vendor.unique_id || "",
                    canvassing_number:
                      (
                        element.pricetag_item?.pricetag?.reference_data as
                          | Canvassing
                          | undefined
                      )?.unique_code || "",
                    parent_index: parentIndex,
                  };
                })
            );

      let feeAccum: ReferenceTransactionAdjustment[] = [];
      const canvassing_id = (
        element.pricetag_item?.pricetag?.reference_data as
          | Canvassing
          | undefined
      )?.unique_id;
      if (canvassing_id) {
        feeAccum = await getContactsFee(["canvassing"], [canvassing_id]);
      }
      item_memo.value.push({
        index: "",
        canvassing_id:
          (
            element.pricetag_item?.pricetag?.reference_data as
              | Canvassing
              | undefined
          )?.unique_id || "",
        canvaasing_version: null,
        item_request_trail_version: null,
        item_request_trail_id: null,
        unique_id: element.unique_id,
        vendor_id: "",
        vendor_name: "",
        canvassing_vendor_unique_id: "",
        unit_id: element.unit_id,
        unit_name: element.unit_name,
        unit_version: null,
        offer_item_id: null,
        offer_item_version: 0,
        quo_number: element.pricetag_item?.pricetag?.unique_code || "",
        catalogue_id: element.catalogue_id || "",
        catalogue_name: element.catalogue
          ? displayCatalogueName(element.catalogue)
          : element.catalogue_name,
        sn: "",
        quantity: element.quantity,
        unit_price: childs.reduce(
          (sum, data) => sum + (data.unit_price || 0),
          0
        ),
        total_price: childs.reduce(
          (sum, data) => sum + data.quantity * (data.unit_price || 0),
          0
        ),
        status: CanvassingVendorStatus.SUBMITTED,
        taxes: [],
        editing: null,
        type: "parent",
        type_item: "request",
        equivalent_id: null,
        children: childs,
        selling_price: element.unit_price || 0,
        total_selling_price: element.quantity * (element.unit_price || 0),
        profit: 0,
        profit_unit: "amount",
        fee: 0,
        fee_unit: "amount",
        ongkir: 0,
        ongkir_unit: "amount",
        pricetag_item_id: "",
        pricetag_item_version: 0,
        contacts_fee: feeAccum,
        unit_po_price: element.po_unit_price || 0,
        total_po_price: (element.po_unit_price || 0) * element.quantity,

        canvassing_number:
          (
            element.pricetag_item?.pricetag?.reference_data as
              | Canvassing
              | undefined
          )?.unique_code || "N/A",
      });

      parentIndex++;
    }

    findRecepientFee();
    calculateReferences();
  },
  {
    immediate: true,
    deep: true,
  }
);

const getDPPNilaiLain = computed(() => {
  let dpp = 0;

  data.value?.data.reference_transaction.forEach((element) => {
    if (
      element.adjustments_transaction?.category == "tax" &&
      element.adjustments_transaction?.name.toLowerCase() === "ppn"
    ) {
      if (element.type != "amount" && Number(element.value) == 12) {
        dpp = (totalHargaJual.value * 11) / 12;
        console.log("dpp 12", dpp);
      } else {
        console.log("category", element.adjustments_transaction?.category);
        console.log("name", totalHargaJual.value ?? "");
        dpp = totalHargaJual.value;
        console.log("dpp 11", dpp);
      }
    }
  });

  return dpp;
});

const getExpandRowKeys = computed(() => {
  const rowKeys = item_memo.value
    .filter((value) => value.children && value.children.length > 0)
    .map((value) => value.unique_id!);

  return rowKeys;
});
const changeItem = (parentIndex: number, childIndex: number) => {
  parentIndexActive.value = parentIndex;
  childIndexActive.value = childIndex;
  modalSelectItem.value = true;
};

const handlePageChange = (page: number) => {
  request_search_po_item.value.offset = `${page}`;
};

const handleSizeChange = (size: number) => {
  request_search_po_item.value.limit = `${size}`;
};

const calculateMargin = (beli: number, jual: number) => {
  return ((jual - beli) / beli) * 100;
};
const calculateMarginNominal = (beli: number, jual: number) => {
  return (jual || 0) - Number(beli);
};

watch(
  () => request_search_po_item.value,
  () => purchaseOrderItem.refresh(),
  { deep: true }
);

const calculateSummaryaData = () => {
  summeryView.value = [];
  summeryView.value.push({
    label: "Harga Beli",
    amount: currencyWithoutSymbol(totalHargaBeli.value, 0),
    percent: "",
  });
  summeryView.value.push({
    label: "Harga Jual",
    amount: currencyWithoutSymbol(totalHargaJual.value, 0),
    percent: "",
  });

  let subtotal = totalHargaJual.value - totalHargaBeli.value;

  summeryView.value.push({
    label: "Gross Profit",
    amount: `${currencyWithoutSymbol(subtotal, 0)}`,
    percent: `${customMathCeil(
      calculateMargin(totalHargaBeli.value, totalHargaJual.value)
    )} %`,
  });

  let ongkir = 0;
  let receivingCommission = contactsFee.value.reduce(
    (sum, data) => sum + (data.amount || 0),
    0
  );

  otherCost.value.forEach((element) => {
    if (
      element.adjustments_transaction?.category != "tax" &&
      element.adjustments_transaction?.name.toLowerCase() != "ppn"
    ) {
      subtotal -= element.amount_nominal ?? 0;

      if (
        element.adjustments_transaction?.name.toLowerCase() == "ongkos kirim"
      ) {
        ongkir = element.amount_nominal || 0;
      }

      summeryView.value.push({
        label: element.adjustments_transaction?.name ?? "",
        amount: `${currencyWithoutSymbol(element.amount_nominal ?? 0, 0)}`,
        percent: `${customMathCeil(
          Number(displayPercentage(element, totalHargaJual.value)) * 100
        )} %`,
      });
    }
  });

  subtotal -= receivingCommission;

  summeryView.value.push({
    label: "Total Fee",
    amount: `${currencyWithoutSymbol(receivingCommission, 0)}`,
    percent: `${customMathCeil(
      nominalToPercent(receivingCommission, totalHargaJual.value)
    )} %`,
  });

  summeryView.value.push({
    label: "Net Profit",
    amount: `${currencyWithoutSymbol(subtotal, 0)}`,
    percent: `${customMathCeil(
      nominalToPercent(subtotal, totalHargaJual.value)
    )} %`,
  });

  otherCost.value.forEach((element) => {
    if (
      element.adjustments_transaction?.category == "tax" &&
      element.adjustments_transaction?.name.toLowerCase() == "ppn"
    ) {
      summeryView.value.push({
        label: element.adjustments_transaction?.name ?? "",
        amount: `${currencyWithoutSymbol(element.amount_nominal ?? 0, 0)}`,
        percent:
          element.type == FeeType.PERCENT
            ? `${customMathCeil(
                ((element.amount_nominal || 0) / getDPPNilaiLain.value) * 100
              )} %`
            : `${element.value}`,
      });
    }
  });
};

const calculateReferences = () => {
  otherCost.value = [];
  (data.value?.data.reference_transaction || []).forEach((element) => {
    if (element.adjustments_transaction?.category == "tax") {
      if (element.type == FeeType.PERCENT) {
        element.amount_nominal =
          (getDPPNilaiLain.value * Number(element.value)) / 100;
        element.amount = element.amount_nominal;
        element.tmp_amount_input = currencyWithoutSymbol(
          element.amount_nominal,
          0
        );
      }
    } else {
      if (element.type == FeeType.PERCENT) {
        element.amount_nominal =
          (totalHargaJual.value * Number(element.value)) / 100;
        element.amount = element.amount_nominal;
        element.tmp_amount_input = currencyWithoutSymbol(
          element.amount_nominal,
          0
        );
      } else {
        element.amount_nominal = element.amount;
        element.tmp_amount_input = currencyWithoutSymbol(
          element.amount_nominal,
          0
        );
      }
    }

    otherCost.value.push(element);
  });

  calculateSummaryaData();
};

onMounted(() => {
  console.log("id", route.params);
});
</script>
