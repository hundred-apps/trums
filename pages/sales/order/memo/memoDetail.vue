<template>
  <el-card
    class="my-3"
    shadow="never"
    element-loading-text="Loading..."
    :element-loading-spinner="svg"
    element-loading-svg-view-box="-10, -10, 50, 50"
    element-loading-background="rgba(122, 122, 122, 0.8)"
  >
    <template #header>
      <div class="card-header flex justify-end gap-2">
        <el-button
          type="primary"
          :icon="Printer"
          @click="printSCMMemo"
          :loading="loading"
        >
          Cetak Memo
        </el-button>
        <NuxtLink
          class="el-button el-button--warning el-button--default"
          :href="`/sales/order/memo/add?id=${canvassingData?.unique_id}`"
          >Edit</NuxtLink
        >
      </div>
    </template>
    <div :class="`flex gap-3 my-3 ${isMobile ? 'flex-col' : ''}`">
      <div class="flex-1">
        <el-descriptions
          title=""
          :column="1"
          :label-width="150"
          size="default"
          :border="isMobile ? false : true"
        >
          <el-descriptions-item
            v-if="canvassingData?.reference_data"
            label="Diminta Oleh"
          >
            <span
              class="text-blue-600 cursor-pointer"
              @click="() => (dialogCustomerOverview = true)"
            >
              {{ canvassingData?.reference_data?.vendor_name ?? "-" }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item
            v-if="canvassingData?.reference_data"
            label="PIC"
          >
            {{ canvassingData?.reference_data?.pic_name ?? "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="Metode Pengiriman">
            {{
              getDeliveryMethodLabel(canvassingData?.delivery_method!) ?? "-"
            }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>

    <h5 class="font-bold text-black text-1xl mt-6">Catatan</h5>
    <div class="text-sm mt-2" v-if="canvassingData?.description">
      <div
        class="text-sm"
        v-html="extractDescription(canvassingData?.description ?? '')"
      ></div>
    </div>
    <h5 class="font-bold text-black text-1xl mt-6">Alamat Pengiriman</h5>
    <div class="text-sm mt-2" v-if="canvassingData?.address">
      ({{ canvassingData?.address?.address_name }})
      <div class="flex flex-col">
        <span>{{ canvassingData?.address?.street }}</span>
        <span>{{ generateAddressViewName(canvassingData?.address!) }}</span>
      </div>
    </div>
    <h5 class="font-bold text-black text-1xl mt-6">Deskripsi Pengriman</h5>
    <div class="text-sm mt-2" v-if="canvassingData?.delivery_description">
      <div
        class="text-sm"
        v-html="extractDescription(canvassingData?.delivery_description ?? '')"
      ></div>
    </div>
  </el-card>

  <TrumsDragScrollTable>
    <el-table
      :data="showItemMemo ?? []"
      row-key="key"
      :expand-row-keys="getExpandRowKeys ?? []"
      border
    >
      <el-table-column prop="catalogue_name" label="Item" width="400">
        <template #default="{ row }">
          <span>{{ row.catalogue_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Type" width="150" align="center">
        <template #default="{ row }">
          <div v-if="row.type == 'child'">
            <span v-if="row.type_item == 'quotation'">Subtitution</span>
            <span v-if="row.type_item == 'equivalent'">Equivalent</span>
            <span v-if="row.type_item == 'original'">AS Requested</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="quantity" label="QTY" align="center" :width="200">
        <template #default="{ row, $index }">
          <span>{{ row.quantity }} {{ row.unit_name }}</span>
        </template>
      </el-table-column>

      <el-table-column
        prop="stok_status"
        label="Stok"
        align="center"
        width="100"
      />
      <el-table-column
        prop="delivery_description"
        label="Pengiriman"
        align="center"
        width="120"
      />
      <el-table-column
        prop="expected_delivery"
        label="Est Pengiriman"
        align="center"
        width="150"
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
            :href="`/sales/quotation/${row.rab_id}`"
            class="text-blue-600"
            >{{ row.rab_number }}</NuxtLink
          >
          <span v-else></span>
        </template>
      </el-table-column>
      <el-table-column label="PO Vendor" width="420" align="center">
        <el-table-column
          label="No PO"
          width="200"
          header-align="center"
          align="right"
        >
          <template #default="{ row }">
            <div
              v-if="row.type == 'child'"
              class="flex items-center justify-between"
            >
              <NuxtLink
                v-if="row.po_vendor_id"
                class="text-blue-600 cursor-pointer"
                :href="`/supply-chain-management/purchase/order/${row.po_vendor_id}`"
                :target="'_blank'"
              >
                {{ row.po_vendor_number }}
              </NuxtLink>
              <span v-else>Belum Ada PO</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="Harga"
          header-align="center"
          align="right"
          width="150"
        >
          <template #default="{ row }">
            <span
              v-if="row.type == 'child'"
              >{{ currencyWithoutSymbol((row as ItemMemoView).po_vendor_unit_price, 0) }}</span
            >
          </template>
        </el-table-column>
        <el-table-column
          label="QTY"
          width="80"
          header-align="center"
          align="right"
        >
          <template #default="{ row }">
            <span
              v-if="row.type == 'child'"
              >{{ currencyWithoutSymbol((row as ItemMemoView).po_vendor_qty, 0) }}</span
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
              v-if="row.type == 'child'"
              >{{ currencyWithoutSymbol((row as ItemMemoView).po_vendor_total_price, 0) }}</span
            >
          </template>
        </el-table-column>
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
              v-if="row.type == 'child'"
              >{{ currencyWithoutSymbol((row as ItemMemoView).buying_price, 0) }}</span
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
              >{{ currencyWithoutSymbol((row as ItemMemoView).total_buying_price, 0) }}</span
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
              v-if="row.type == 'child'"
              >{{ currencyWithoutSymbol((row as ItemMemoView).quo_unit_price, 0) }}</span
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
              v-if="row.type == 'child'"
              >{{ currencyWithoutSymbol((row as ItemMemoView).quo_total_price, 0) }}</span
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
              >{{ currencyWithoutSymbol((row as ItemMemoView).so_unit_price, 0) }}</span
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
              >{{ currencyWithoutSymbol((row as ItemMemoView).so_total_price, 0) }}</span
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
            >{{ currencyWithoutSymbol((row as ItemMemoView).margin_nominal,0) }}</span
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
            >{{ customMathCeil((row as ItemMemoView).margin)

























































































            }}%</span
          >
        </template>
      </el-table-column>
    </el-table>
  </TrumsDragScrollTable>

  <el-card class="my-3" shadow="never">
    <template #header>
      <div class="card-header">
        <span>Daftar Penawaran Vendor</span>
      </div>
    </template>
    <div class="demo-collapse">
      <el-collapse v-model="activeCollapseVendor">
        <el-collapse-item
          v-for="vendor in pricetagList"
          :title="`${vendor.owner?.name ?? ''}`"
          :key="vendor.unique_id"
          :name="vendor.unique_id ?? ''"
        >
          <div>
            <el-descriptions
              title=""
              :label-width="200"
              :column="1"
              size="small"
              border
            >
              <el-descriptions-item label="Nomor Penawaran">
                <NuxtLink
                  class="text-blue-600"
                  :href="`/supply-chain-management/offer/${vendor.unique_id}`"
                  >{{ vendor.unique_code ?? "N/A" }}</NuxtLink
                >
              </el-descriptions-item>
              <el-descriptions-item label="Berlaku Hingga">
                {{
                  vendor.end_date != undefined &&
                  vendor.end_date != null &&
                  vendor.end_date > 0
                    ? dayjs.unix(vendor.end_date).format("YYYY-MM-DD")
                    : ""
                }}
              </el-descriptions-item>
              <el-descriptions-item label="Keterangan">
                {{ vendor?.note ?? "Tidak Ada Keterangan" }}
              </el-descriptions-item>

              <el-descriptions-item
                v-for="(file, index) in vendor.files"
                :label="`${index == 0 ? 'Lampiran' : ''}`"
              >
                <div class="flex items-center justify-between">
                  <span
                    ><NuxtLink
                      target="__blank"
                      class="text-blue-500"
                      :href="`${baseImageURL}${file.image_path}/${file.filename}`"
                      >{{
                        file.filename_original ?? "Tidak Ada Keterangan"
                      }}</NuxtLink
                    ></span
                  >
                  <span
                    ><el-button link type="primary"
                      ><el-icon><Download /></el-icon></el-button
                  ></span>
                </div>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </el-card>

  <el-card class="mb-3" shadow="never">
    <template #header>
      <div class="card-header flex justify-between items-center">
        <p>Penerima Fee</p>
      </div>
    </template>
    <el-table :data="contactsFee" style="width: 100%" border>
      <el-table-column label="Nama">
        <template #default="{ row, $index }">
          {{ row.party.name }}
        </template>
      </el-table-column>

      <el-table-column label="Email">
        <template #default="{ row }">
          {{ row.party.email }}
        </template>
      </el-table-column>

      <el-table-column label="No. Telepon">
        <template #default="{ row }">
          {{ row.party.phone }}
        </template>
      </el-table-column>

      <el-table-column :label="`Fee`">
        <template #default="{ row }">
          {{ currencyWithoutSymbol(row.amount) }}
        </template>
      </el-table-column>
    </el-table>
  </el-card>

  <el-card class="my-3" shadow="never">
    <div class="demo-collapse">
      <el-collapse v-model="activeCollapsePoVendors">
        <el-collapse-item
          v-for="vendor in poVendorsList"
          :title="`PO ${vendor.vendor_name ?? ''}`"
          :key="vendor.unique_id"
          :name="vendor.unique_id ?? ''"
        >
          <div>
            <div class="flex gap-3 my-3">
              <div class="flex-1">
                <el-descriptions title="" :column="1" size="large" border>
                  <el-descriptions-item label="Nomor Referensi">
                    {{ vendor.sourcing_document || "-" }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Nomor PO">
                    {{ vendor.unique_code || "-" }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Vendor">
                    {{ vendor.vendor?.name || "-" }}
                  </el-descriptions-item>
                </el-descriptions>
              </div>
              <div class="flex-1">
                <el-descriptions title="" :column="1" size="large" border>
                  <el-descriptions-item label="Total PO">
                    {{ currencyWithoutSymbol(vendor.total_price || 0) }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Tanggal Dibuat">
                    {{
                      vendor.created_at != null
                        ? formatLocalDate(vendor.created_at)
                        : "-"
                    }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Informasi Tambahan">
                    {{ vendor.additional_information ?? "Tidak Ada" }}
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </div>

            <h1>Informasi Pengiriman</h1>
            <div class="flex gap-3 my-3">
              <div class="flex-1">
                <el-descriptions title="" :column="1" size="large" border>
                  <el-descriptions-item label="Estimasi Tiba">
                    {{
                      vendor.expected_arrival != null
                        ? formatLocalDate(vendor.expected_arrival)
                        : "-"
                    }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Alamat Pengiriman">
                    ({{ vendor.address?.address_name }})
                    <div class="flex flex-col">
                      <span>{{ vendor.address?.street }}</span>
                      <span
                        >{{ generateAddressViewName(vendor.address!) }}</span
                      >
                    </div>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </div>
            <h1>Informasi Pembayaran</h1>
            <div class="flex gap-3 my-3">
              <CustomPaymentTerm
                class="w-full"
                type="view"
                :data="vendor.payment_terms ?? []"
                :total="vendor.total_price"
              />
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </el-card>

  <el-card class="mb-3" shadow="never">
    <template #header>
      <div class="card-header"><span>Summary</span></div>
    </template>
    <el-table :data="summeryView">
      <el-table-column prop="label" label="">
        <template #default="{ row }">
          <div class="flex flex-col">
            <span class="font-bold">{{ row.label }}</span>
            <div
              class="text-sm mt-1 italic text-gray-400"
              v-if="row.description"
              v-html="`${extractDescription(row.description)}`"
            ></div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="" width="200" />
      <el-table-column prop="percent" label="" width="100" />
    </el-table>
  </el-card>

  <el-dialog
    v-model="previewSCMMemoDialog"
    title="Preview PDF"
    width="80%"
    destroy-on-close
  >
    <iframe
      v-if="pdfUrl"
      :src="pdfUrl"
      width="100%"
      height="600px"
      style="border: none"
    ></iframe>

    <template #footer>
      <el-button @click="previewSCMMemoDialog = false">Tutup</el-button>
      <el-button type="success" @click="downloadSCMMemo"
        >Download PDF</el-button
      >
    </template>
  </el-dialog>
</template>
<script lang="tsx" setup>
import type { Permission } from "~/types/menu";
import {
  CanvassingItemReference,
  CanvassingVendorStatus,
  PaymentTerm,
  type Canvassing,
  type CanvassingItem,
} from "~/types/scm/canvasing";
import {
  extractDescription,
  generateAddressViewName,
  currencyWithoutSymbol,
  customMathCeil,
  formatLocalDate,
  currency,
  safePercent,
  capitalizeWords,
} from "#imports";
import {
  getDeliveryMethodLabel,
  type Pricetag,
  type Pricetag_item,
} from "~/types/pricetag";
import type { Catalogue } from "~/types/catalogue";
import type { BaseResponse } from "~/types/response";
import type { RequestSearch } from "~/types/request_search";
import type { Inquiry } from "~/types/inquiry";
import type { ResponsePagination } from "~/types/response_pagination";
import {
  ItemRequestTrailReference,
  type ItemRequestTrail,
} from "~/types/item_request";
import type {
  PurchaseOrder,
  PurchaseOrderItem,
} from "~/types/scm/purchase_order";
import { dayjs } from "element-plus";
import CustomPaymentTerm from "~/components/trums/CustomPaymentTerm.vue";
import {
  FeeType,
  type ReferenceTransactionAdjustment,
} from "~/types/attribute_adjustment";
import type { Contact } from "~/types/contact";
import jsPDF from "jspdf";
import autoTable, { type RowInput } from "jspdf-autotable";
import { Printer, Download } from "@element-plus/icons-vue";
import { StandardFonts } from "pdf-lib";

const { isMobile } = useDevice();
const { removeDuplicates } = useArray();

const config = useRuntimeConfig();

const baseImageURL = config.public.baseImageURL;

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

type ItemMemoView = {
  key: string;
  catalogue?: Catalogue;
  catalogue_name: string;
  catalogue_id: string;
  type_item: "request" | "equivalent" | "quotation" | "original";
  quantity: number;
  unit_id: string;
  unit_name: string;
  stok_status: string;
  delivery_description: string;
  expected_delivery: string;
  vendor_id: string;
  vendor_name: string;
  quo_number: string;
  rab_number: string;
  rab_id: string;
  po_vendor_number: string;
  po_vendor_id: string;
  po_vendor_qty: number;
  po_vendor_unit_price: number;
  po_vendor_total_price: number;
  buying_price: number;
  total_buying_price: number;
  quo_unit_price: number;
  quo_total_price: number;
  so_unit_price: number;
  so_total_price: number;
  margin_nominal: number;
  margin: number;
  children: ItemMemoView[];
  type: "parent" | "child";
  is_deleted: boolean;
};

const props = defineProps<{
  canvassingData: Canvassing;
  privilages: Permission[];
}>();

const loading = ref<boolean>(false);
const dialogCustomerOverview = ref<boolean>(false);

const pdfBlob = ref<Blob | null>(null);
const pdfUrl = ref<string | null>(null);
const previewSCMMemoDialog = ref<boolean>(false);

const item_memo = ref<ItemMemoView[]>([]);
const offerVendors = ref<Pricetag[]>([]);
const activeCollapseVendor = ref<string[]>([""]);

const purchaseOrderVendors = ref<PurchaseOrder[]>([]);
const activeCollapsePoVendors = ref<string[]>([""]);

const contactsFee = ref<ReferenceTransactionAdjustment[]>([]);
const otherCost = ref<ReferenceTransactionAdjustment[]>([]);

const summeryView = ref<
  {
    label: string;
    amount: string;
    percent: string;
    description: string;
  }[]
>([]);

const fetchPricetagItemDetail = async (
  unique_id: string
): Promise<Pricetag_item | undefined> => {
  try {
    const response = await useFetchApi<BaseResponse<Pricetag_item>>(
      `/pricetag-item-read/${unique_id}`,
      "pricetag-detail",
      "post",
      null
    );

    if (response.status.value == "success") {
      return response.data.value?.data;
    }
  } catch (error: any) {
    console.log("Gagal mengambil data pricetag item", error);
  }
};

const fetchCanvassing = async (
  unique_id: string
): Promise<Canvassing | undefined> => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<Canvassing>>(
      `/canvassing-read/${unique_id}`,
      "detail-canvassing",
      "get",
      null
    );

    if (response.status.value == "success") {
      return response.data.value?.data;
    }
  } catch (error) {
    console.log("Gagal mengambil data canvassing", error);
  }
};
const fetchCanvassingItemDetail = async (
  unique_id: string
): Promise<CanvassingItem | undefined> => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<CanvassingItem>>(
      `/canvassing-item-read/${unique_id}`,
      "detail-canvassing",
      "get",
      null
    );

    if (response.status.value == "success") {
      return response.data.value?.data;
    }
  } catch (error) {
    console.log("Gagal mengambil data canvassing", error);
  }
};

const fetchInquiry = async (so_id: string): Promise<Inquiry | undefined> => {
  try {
    const inquiry_request: RequestSearch = {
      keyword: "",
      table: "inquiries",
      column: [
        {
          reference: ["so"],
          reference_id: [so_id],
        },
      ],
      sort: null,
      offset: "1",
      limit: "1",
    };

    // Fetch related purchase orders
    const inquiry = await useFetchApi<ResponsePagination<Inquiry[]>>(
      `/search`,
      "fetch-inquiries",
      "post",
      inquiry_request
    );

    if (inquiry.status.value === "success") {
      if (inquiry.data.value?.data) {
        const inquiryDataValue: Inquiry[] = inquiry.data.value?.data ?? [];
        console.log("fungsi inquiry", inquiry_request);
        if (inquiryDataValue.length > 0) {
          return inquiryDataValue[0];
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch related data", error);
  }
};

const fetchPoItemVendorDetail = async (
  item_id: string
): Promise<PurchaseOrderItem | undefined> => {
  try {
    // Fetch related purchase orders
    const response = await useFetchApi<BaseResponse<PurchaseOrderItem>>(
      `/po-item-read/${item_id}`,
      "fetch-inquiries",
      "get",
      null
    );

    if (response.status.value === "success") {
      return response?.data.value?.data;
    }
  } catch (error) {
    console.error("Failed to fetch related data", error);
  }
};
const fetchPoDetail = async (
  order_id: string
): Promise<PurchaseOrder | undefined> => {
  try {
    // Fetch related purchase orders
    const response = await useFetchApi<BaseResponse<PurchaseOrder>>(
      `/purchase-order-read/${order_id}`,
      "fetch-purchase-order",
      "get",
      null
    );

    if (response.status.value === "success") {
      return response?.data.value?.data;
    }
  } catch (error) {
    console.error("Failed to fetch related data", error);
  }
};

const showItemMemo = computed(() => {
  return item_memo.value.map((item) => ({
    ...item,
    children: item.children?.filter((child) => !child.is_deleted) ?? [],
  }));
});

const getExpandRowKeys = computed(() => {
  const rowKeys = item_memo.value
    .filter((value) => value.children && value.children.length > 0)
    .map((value) => value.key!);

  return rowKeys;
});

const calculateMargin = (beli: number, jual: number) => {
  return ((jual - beli) / beli) * 100;
};
const calculateMarginNominal = (beli: number, jual: number) => {
  return (jual || 0) - Number(beli);
};

const initItemMemo = async (data: Canvassing) => {
  for (const item of data.canvassing_item || []) {
    const pricetag_item_detail = await fetchPricetagItemDetail(
      item.reference_data?.pricetag_item_id || ""
    );
    const canvassingDetail = await fetchCanvassing(
      (pricetag_item_detail?.data_reference as CanvassingItem | undefined)
        ?.canvassing_id || ""
    );

    // const inquiry: Inquiry | undefined = await fetchInquiry(
    //   item.reference_data?.order_id || ""
    // );

    // const item_trails: ItemRequestTrail[] =
    //   inquiry?.item_request?.findLast(
    //     (map) => map.catalogue_id == item.catalogue_id
    //   )?.item_request_trail || [];

    // const trailPOItem = item_trails.findLast(
    //   (find) => find.reference == ItemRequestTrailReference.PO
    // );

    // const poVendor: PurchaseOrder | undefined = trailPOItem?.data_reference;

    // console.log("PO Vendor", item_trails);

    // console.log("pricetag item", pricetag_item_detail);

    const canvassingItemDetailMemo = await fetchCanvassingItemDetail(
      pricetag_item_detail?.reference_id || ""
    );

    const children: ItemMemoView[] = [];

    for (const child of item.canvassing_vendor || []) {
      const canvassingVendor = (
        canvassingItemDetailMemo?.canvassing_vendor || []
      ).findLast(
        (find) =>
          find.catalogue_id == child.catalogue_id &&
          find.status == CanvassingVendorStatus.SELECTED &&
          find.vendor_id == child.vendor_id
      );

      const pricetagItem = await fetchPricetagItemDetail(
        canvassingVendor?.pricetag_item_id || ""
      );

      if (pricetagItem?.pricetag) {
        offerVendors.value.push(pricetagItem.pricetag);
      }

      let poItemDetail: PurchaseOrderItem | undefined = undefined;

      let marginNominal = 0;
      let marginPercentage = 0;

      if (child.reference == CanvassingItemReference.PURCHASE_ORDER_ITEM) {
        poItemDetail = await fetchPoItemVendorDetail(child.reference_id);
        marginNominal = calculateMarginNominal(
          poItemDetail?.unit_price || 0,
          item.reference_data?.unit_price || 0
        );
        marginPercentage = calculateMargin(
          poItemDetail?.unit_price || 0,
          item.reference_data?.unit_price || 0
        );

        if (poItemDetail?.purchase_order) {
          const exist = purchaseOrderVendors.value.findLast(
            (find) => find.unique_id == poItemDetail?.order_id
          );
          if (!exist) {
            const poDetail = await fetchPoDetail(poItemDetail.order_id);
            console.log("PO Detail", poDetail);
            if (poDetail) {
              purchaseOrderVendors.value.push(poDetail);
            }
          }
        }
      } else {
        marginNominal = calculateMarginNominal(
          canvassingVendor?.unit_price || 0,
          item.reference_data?.po_unit_price || 0
        );
        marginPercentage = calculateMargin(
          canvassingVendor?.unit_price || 0,
          item.reference_data?.po_unit_price || 0
        );
      }

      children.push({
        key: child.unique_id || "",
        is_deleted: false,
        catalogue_name: child.catalogue
          ? displayCatalogueName(child.catalogue)
          : child.catalogue_name,
        catalogue_id: child.catalogue_id,
        type_item: child.type_item,
        quantity: child.quantity,
        unit_id: child.unit_id || "",
        unit_name: child.unit_name || "",
        stok_status: child.pricetag_item?.status_item || "",
        delivery_description: child.pricetag_item?.delivery || "",
        expected_delivery: child.expected_delivery || "",
        vendor_id:
          poItemDetail?.purchase_order?.vendor_id || child.vendor_id || "",
        vendor_name:
          poItemDetail?.purchase_order?.vendor_name || child.vendor?.name || "",
        quo_number: pricetag_item_detail?.pricetag?.unique_code || "",
        rab_number:
          canvassingDetail?.unique_code ||
          canvassingVendor?.canvassing_item?.canvassing?.unique_code ||
          "",
        rab_id:
          canvassingDetail?.unique_id ||
          canvassingVendor?.canvassing_item?.canvassing?.unique_id ||
          "",
        po_vendor_number: poItemDetail?.purchase_order?.unique_code || "",
        po_vendor_id: poItemDetail?.purchase_order?.unique_id || "",
        po_vendor_qty: poItemDetail?.quantity || 0,
        po_vendor_unit_price: poItemDetail?.unit_price || 0,
        po_vendor_total_price: poItemDetail?.total_price || 0,
        buying_price: canvassingVendor?.unit_price || 0,
        total_buying_price: canvassingVendor?.total_price || 0,
        quo_unit_price: canvassingVendor?.selling_price || 0,
        quo_total_price: canvassingVendor?.total_selling_price || 0,
        so_unit_price: item.reference_data?.po_unit_price || 0,
        so_total_price:
          (item.reference_data?.po_unit_price || 0) * (child.quantity || 0) ||
          0,
        margin_nominal: marginNominal,
        margin: marginPercentage,
        children: [],
        type: "child",
      });
    }

    const totalBuyingPrice = children.reduce(
      (sum, data) => sum + data.total_buying_price,
      0
    );
    const soPrice = item.reference_data?.po_unit_price || 0;
    const soTotalPrice = soPrice * (item.reference_data?.quantity || 0);
    const marginNominal = calculateMarginNominal(
      totalBuyingPrice,
      soTotalPrice
    );
    const margin = calculateMargin(totalBuyingPrice, soTotalPrice);

    item_memo.value.push({
      key: item.unique_id || "",
      catalogue_name: item.catalogue
        ? displayCatalogueName(item.catalogue)
        : item.catalogue_name,
      catalogue_id: item.catalogue_id,
      type_item: "request",
      quantity: item.quantity,
      unit_id: item.unit_id || "",
      unit_name: item.unit_name || "",
      stok_status: "",
      delivery_description: "",
      expected_delivery: "",
      vendor_id: "",
      vendor_name: "",
      quo_number: pricetag_item_detail?.pricetag?.unique_code || "",
      rab_number: canvassingDetail?.unique_code || "",
      rab_id: canvassingDetail?.unique_id || "",
      po_vendor_number: "",
      po_vendor_id: "",
      po_vendor_qty: 0,
      po_vendor_unit_price: 0,
      po_vendor_total_price: 0,
      buying_price: 0,
      total_buying_price: children.reduce(
        (sum, data) => sum + data.total_buying_price,
        0
      ),
      quo_unit_price: 0,
      quo_total_price: 0,
      so_unit_price: soPrice,
      so_total_price: soTotalPrice,
      margin_nominal: marginNominal,
      margin: margin,
      children: children,
      type: "parent",
      is_deleted: false,
    });
  }

  activeCollapseVendor.value = offerVendors.value.map(
    (value) => value.unique_id
  );
  // activeCollapsePoVendors.value = purchaseOrderVendors.value.map(
  //   (value) => value.unique_id
  // );
  loading.value = false;
  calculateSummaryaData();
};

const pricetagList = computed(() => {
  const list = removeDuplicates<Pricetag>(offerVendors.value, "unique_id");

  return list;
});
const poVendorsList = computed(() => {
  const list = removeDuplicates<PurchaseOrder>(
    purchaseOrderVendors.value,
    "unique_id"
  );

  return list;
});

const generateContactFee = (data: Canvassing) => {
  for (const adjustment of data.reference_transaction || []) {
    // if(adjustment.adjustments_transaction)

    if (
      (adjustment.adjustments_transaction?.name || "").toLowerCase() == "fee"
    ) {
      contactsFee.value.push({
        ...adjustment,
        adjustment: adjustment.adjustments_transaction,
      });
    } else {
      otherCost.value.push({
        ...adjustment,
        adjustment: adjustment.adjustments_transaction,
      });
    }
  }

  console.log("penerima fee", contactsFee.value);
};

const totalHargaBeli = computed(() => {
  return item_memo.value.reduce(
    (sum, data) => sum + data.total_buying_price,
    0
  );
});
const totalHargaJual = computed(() => {
  return item_memo.value.reduce((sum, data) => sum + data.so_total_price, 0);
});

const getDPPNilaiLain = computed(() => {
  let dpp = 0;

  otherCost.value.forEach((element) => {
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

const calculateSummaryaData = () => {
  summeryView.value = [];
  summeryView.value.push({
    label: "Harga Beli",
    amount: currencyWithoutSymbol(totalHargaBeli.value, 0),
    percent: "",
    description: "",
  });
  summeryView.value.push({
    label: "Harga Jual",
    amount: currencyWithoutSymbol(totalHargaJual.value, 0),
    percent: "",
    description: "",
  });

  let subtotal = totalHargaJual.value - totalHargaBeli.value;

  summeryView.value.push({
    label: "Gross Profit",
    amount: `${currencyWithoutSymbol(subtotal, 0)}`,
    percent: `${customMathCeil(
      calculateMargin(totalHargaBeli.value, totalHargaJual.value)
    )} %`,
    description: "",
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
      if (element.type == FeeType.PERCENT) {
        const nominal = (totalHargaJual.value * Number(element.value)) / 100;
        element.amount_nominal = nominal;
        element.amount = nominal;
      } else {
        const toPercent = (Number(element.amount) / totalHargaJual.value) * 100;
        element.amount_nominal = Number(element.amount);
        element.value = customMathCeil(toPercent);
      }

      subtotal -= element.amount_nominal ?? 0;

      if (
        element.adjustments_transaction?.name.toLowerCase() == "ongkos kirim"
      ) {
        ongkir = element.amount_nominal || 0;
      }

      summeryView.value.push({
        label: element.adjustments_transaction?.name ?? "",
        amount: `${currencyWithoutSymbol(element.amount_nominal ?? 0, 0)}`,
        percent: `${customMathCeil(element.value || 0)} %`,
        description: element.description || "",
      });
    } else {
      if (element.type == FeeType.PERCENT) {
        const nominal = (getDPPNilaiLain.value * Number(element.value)) / 100;
        element.amount_nominal = nominal;
        element.amount = nominal;
      } else {
      }
    }
  });

  subtotal -= receivingCommission;

  summeryView.value.push({
    label: "Total Fee",
    amount: `${currencyWithoutSymbol(receivingCommission, 0)}`,
    percent: `${customMathCeil(
      nominalToPercent(receivingCommission, totalHargaJual.value)
    )} %`,
    description: "",
  });
  otherCost.value.forEach((element) => {
    if (
      element.adjustments_transaction?.category == "tax" &&
      element.adjustments_transaction?.name.toLowerCase() == "ppn"
    ) {
      subtotal -= element.amount_nominal || 0;
      summeryView.value.push({
        label: element.adjustments_transaction?.name ?? "",
        amount: `${currencyWithoutSymbol(element.amount_nominal ?? 0, 0)}`,
        percent:
          element.type == FeeType.PERCENT
            ? `${customMathCeil(
                ((element.amount_nominal || 0) / getDPPNilaiLain.value) * 100
              )} %`
            : `${element.value}`,
        description: element.description || "",
      });
    }
  });
  summeryView.value.push({
    label: "Net Profit",
    amount: `${currencyWithoutSymbol(subtotal, 0)}`,
    percent: `${customMathCeil(
      nominalToPercent(subtotal, totalHargaJual.value)
    )} %`,
    description: "",
  });
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;

    reader.readAsDataURL(blob);
  });
};

async function getBase64ImageFromUrl(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

const isSelectedVendor = (uniqueId: string): boolean => {
  if (!uniqueId) return false;

  for (const item of props.canvassingData?.canvassing_item || []) {
    const vendor = item.canvassing_vendor.findLast(
      (v) => v.unique_id == uniqueId
    );

    if (vendor) return vendor.status == CanvassingVendorStatus.SELECTED;
  }

  return false;
};

const generateSCMMemo = async () => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const marginX = 10;
  const marginTop = 10;
  const marginBottom = 55; // sisakan ruang footer
  const footerHeight = 35;

  let currentY = 0;

  const ensureSpace = (heightNeeded: number) => {
    if (currentY + heightNeeded > pageHeight - marginBottom) {
      doc.addPage();
      currentY = marginTop;
    }
  };

  // Logo
  const imgLogo = await getBase64ImageFromUrl("/images/trumecs-logo.png");
  const tmsLogo = await getBase64ImageFromUrl("/images/tms-logo.png");
  const headerTop = 10;
  const headerHeight = 25;
  const headerCenterY = headerTop + headerHeight / 2;

  const leftLogoWidth = 40;
  const leftLogoHeight = 35;

  const rightLogoWidth = 40;
  const rightLogoHeight = 14;

  // Logo kiri
  doc.addImage(
    tmsLogo,
    "PNG",
    marginX,
    headerCenterY - leftLogoHeight / 2,
    leftLogoWidth,
    leftLogoHeight
  );

  // Logo kanan
  doc.addImage(
    imgLogo,
    "PNG",
    pageWidth - marginX - rightLogoWidth,
    headerCenterY - rightLogoHeight / 3,
    rightLogoWidth,
    rightLogoHeight
  );

  // ================= TITLE =================
  doc.setFontSize(18);
  doc.text("SCM MEMO", pageWidth / 2, 50, { align: "center" });

  // ================= INFO =================

  const labelX = marginX;
  const colonX = marginX + 28;
  const valueX = marginX + 32;

  doc.setFontSize(8);
  doc.text("Customer", labelX, 60);
  doc.text(":", colonX, 60);
  doc.text(
    `${
      props.canvassingData?.reference_data?.vendor_name ??
      props.canvassingData?.source?.request_to?.name ??
      "-"
    }`,
    valueX,
    60
  );

  doc.text("Alamat Pengiriman", labelX, 66);
  doc.text(":", colonX, 66);
  doc.text(`${props.canvassingData?.address?.street ?? "-"}`, valueX, 66);
  doc.text("", labelX, 72);
  doc.text("", colonX, 72);
  doc.text(
    `${
      props.canvassingData?.address
        ? generateAddressViewName(props.canvassingData.address)
        : "-"
    }`,
    valueX,
    72
  );

  doc.text("RFQ Number", labelX, 80);
  doc.text(":", colonX, 80);
  doc.text(`${props.canvassingData?.source_document ?? "-"}`, valueX, 80);

  const calculateMargin = (totalBuy: number, totalSell: number) => {
    if (totalSell === 0) {
      return 0;
    }

    return ((totalSell - totalBuy) / totalBuy) * 100;
  };

  const parentCell = (
    content: string,
    halign: "left" | "center" | "right" = "left"
  ) => ({
    content,
    styles: {
      halign,

      lineWidth: 0.1,
      lineColor: [0, 0, 0] as [number, number, number],
      fillColor: [255, 255, 255] as [number, number, number],
    },
  });

  const childCell = (
    content: string,
    halign: "left" | "center" | "right" = "left",
    italic = true
  ) => ({
    content,
    styles: {
      halign,
      textColor: [120, 120, 120] as [number, number, number],
      lineWidth: 0.1,
      lineColor: [0, 0, 0] as [number, number, number],
      fillColor: [245, 245, 245] as [number, number, number],
    },
  });

  const generateRowData = () => {
    const rows: RowInput[] = [];

    const typeLabel = (row: ItemMemoView) => {
      if (row.type_item == "quotation") return "Subtitution";
      if (row.type_item == "equivalent") return "Equivalent";
      if (row.type_item == "original") return "AS Requested";
      return "";
    };

    const qtyLabel = (row: ItemMemoView) =>
      `${row.quantity ?? ""} ${row.unit_name ?? ""}`.trim();

    showItemMemo.value.forEach((item, index) => {
      rows.push([
        parentCell(`${index + 1}`, "center"),
        parentCell(`${item.catalogue_name}`),
        parentCell("", "center"),
        parentCell(qtyLabel(item), "center"),
        parentCell(`${item.stok_status ?? ""}`, "center"),
        parentCell(`${item.delivery_description ?? ""}`, "center"),
        parentCell(`${item.expected_delivery ?? ""}`, "center"),
        parentCell(`${item.vendor_name ?? ""}`, "center"),
        parentCell("", "center"),
        parentCell("", "center"),
        parentCell("", "right"),
        parentCell("", "right"),
        parentCell("", "right"),
        parentCell("", "right"),
        parentCell("", "right"),
        parentCell(
          `${currencyWithoutSymbol(item.total_buying_price || 0)}`,
          "right"
        ),
        parentCell("", "right"),
        parentCell("", "right"),
        parentCell(
          `${currencyWithoutSymbol(item.so_unit_price || 0)}`,
          "right"
        ),
        parentCell(
          `${currencyWithoutSymbol(item.so_total_price || 0)}`,
          "right"
        ),
        parentCell(
          `${currencyWithoutSymbol(item.margin_nominal || 0)}`,
          "right"
        ),
        parentCell(`${customMathCeil(item.margin ?? 0)}%`, "center"),
      ]);

      item.children.forEach((child) => {
        let delimiter = "";

        if (child.type_item == "equivalent") {
          delimiter = "EQ - ";
        } else if (child.type_item == "original") {
          delimiter = "REQ - ";
        } else if (child.type_item == "quotation") {
          delimiter = "SUB - ";
        }

        const checked = isSelectedVendor(child.key) ? "V" : "";

        rows.push([
          childCell(checked, "center"),
          childCell(`${delimiter}${child.catalogue_name}`),
          childCell(typeLabel(child), "center"),
          childCell(qtyLabel(child), "center"),
          childCell(`${child.stok_status ?? ""}`, "center", false),
          childCell(`${child.delivery_description ?? ""}`, "center", false),
          childCell(`${child.expected_delivery ?? ""}`, "center", false),
          childCell(`${child.vendor_name || "-"}`, "left"),
          childCell(`${child.quo_number ?? ""}`, "center"),
          childCell(`${child.rab_number ?? ""}`, "center"),
          childCell(
            `${
              child.po_vendor_id
                ? child.po_vendor_number || ""
                : "Belum Ada PO"
            }`,
            "center"
          ),
          childCell(
            `${currencyWithoutSymbol(child.po_vendor_unit_price || 0)}`,
            "right"
          ),
          childCell(
            `${currencyWithoutSymbol(child.po_vendor_qty || 0)}`,
            "right"
          ),
          childCell(
            `${currencyWithoutSymbol(child.po_vendor_total_price || 0)}`,
            "right"
          ),
          childCell(
            `${currencyWithoutSymbol(child.buying_price || 0)}`,
            "right"
          ),
          childCell(
            `${currencyWithoutSymbol(child.total_buying_price || 0)}`,
            "right"
          ),
          childCell(
            `${currencyWithoutSymbol(child.quo_unit_price || 0)}`,
            "right"
          ),
          childCell(
            `${currencyWithoutSymbol(child.quo_total_price || 0)}`,
            "right"
          ),
          childCell(
            `${currencyWithoutSymbol(child.so_unit_price || 0)}`,
            "right"
          ),
          childCell(
            `${currencyWithoutSymbol(child.so_total_price || 0)}`,
            "right"
          ),
          childCell(
            `${currencyWithoutSymbol(child.margin_nominal || 0)}`,
            "right"
          ),
          childCell(`${customMathCeil(child.margin ?? 0)}%`, "center"),
        ]);
      });
    });

    return rows;
  };

  const parents = showItemMemo.value;

  const subtotalBuyPrice = parents.reduce(
    (sum, p) => sum + p.children.reduce((s, c) => s + (c.buying_price || 0), 0),
    0
  );
  const subtotalBuyTotalPrice = parents.reduce(
    (sum, p) => sum + (p.total_buying_price || 0),
    0
  );
  const subtotalSellingUnit = parents.reduce(
    (sum, p) => sum + (p.so_unit_price || 0),
    0
  );
  const subtotalSellingTotal = parents.reduce(
    (sum, p) => sum + (p.so_total_price || 0),
    0
  );

  const subtotalMarginNominal = subtotalSellingTotal - subtotalBuyTotalPrice;
  const subtotalMargin =
    subtotalBuyTotalPrice === 0
      ? 0
      : (subtotalMarginNominal / subtotalBuyTotalPrice) * 100;

  let grandTotalPrint = subtotalSellingTotal - subtotalBuyTotalPrice;

  const summaryLabel = {
    halign: "right" as const,
    fontStyle: "bold" as const,
    cellWidth: 0.0,
    lineWidth: 0.1,
    lineColor: [0, 0, 0] as [number, number, number],
    fillColor: [255, 255, 255] as [number, number, number],
  };
  const summaryValue = {
    halign: "right" as const,
    cellWidth: 0.0,
    lineWidth: 0.1,
    lineColor: [0, 0, 0] as [number, number, number],
    fillColor: [255, 255, 255] as [number, number, number],
  };

  const rowData = generateRowData();

  rowData.push([
    { content: "Subtotal", colSpan: 14, styles: summaryLabel },
    {
      content: `${currencyWithoutSymbol(subtotalBuyPrice)}`,
      styles: summaryValue,
    },
    {
      content: `${currencyWithoutSymbol(subtotalBuyTotalPrice)}`,
      styles: summaryValue,
    },
    {
      content: "",
      styles: summaryValue,
    },
    {
      content: "",
      styles: summaryValue,
    },
    {
      content: `${currencyWithoutSymbol(subtotalSellingUnit)}`,
      styles: summaryValue,
    },
    {
      content: `${currencyWithoutSymbol(subtotalSellingTotal)}`,
      styles: summaryValue,
    },
    {
      content: `${currencyWithoutSymbol(subtotalMarginNominal)}`,
      styles: summaryValue,
    },
    {
      content: `${currencyWithoutSymbol(subtotalMargin)}`,
      styles: summaryValue,
    },
  ]);

  // const ongkirRef = otherCost.value.find(
  //   (element) =>
  //     (element.adjustments_transaction?.name || "").toLowerCase() ==
  //     "ongkos kirim"
  // );
  // const ongkirAmount = ongkirRef
  //   ? ongkirRef.type == FeeType.PERCENT
  //     ? (subtotalSellingTotal * Number(ongkirRef.value)) / 100
  //     : ongkirRef.amount || 0
  //   : 0;

  // if (ongkirRef) {
  //   grandTotalPrint -= ongkirAmount;

  //   rowData.push([
  //     {
  //       content: `${ongkirRef.adjustments_transaction?.name ?? "Ongkos Kirim"}`,
  //       colSpan: 8,
  //       styles: summaryLabel,
  //     },
  //     {
  //       content: `${currencyWithoutSymbol(ongkirAmount)}`,
  //       colSpan: 5,
  //       styles: summaryValue,
  //     },
  //     {
  //       content: `${safePercent(ongkirAmount, subtotalBuyTotalPrice)}`,
  //       styles: summaryValue,
  //     },
  //   ]);
  // }

  otherCost.value.forEach((element) => {
    const name = (element.adjustments_transaction?.name || "").toLowerCase();

    // if (name == "ongkos kirim" || name == "fee") return;

    const nominal =
      element.type == FeeType.PERCENT
        ? (subtotalSellingTotal * Number(element.value)) / 100
        : element.amount || 0;

    grandTotalPrint -= nominal;

    rowData.push([
      {
        content: `${element.adjustments_transaction?.name ?? "-"}`,
        colSpan: 14,
        styles: summaryLabel,
      },
      {
        content: `${currencyWithoutSymbol(nominal)}`,
        colSpan: 7,
        styles: summaryValue,
      },
      {
        content: `${safePercent(nominal, subtotalBuyTotalPrice)}`,
        styles: summaryValue,
      },
    ]);
  });

  const totalFeeRecive = contactsFee.value.reduce(
    (acc, sum) => acc + (sum.amount ?? 0),
    0
  );

  grandTotalPrint -= totalFeeRecive;

  rowData.push([
    { content: "Total Fee", colSpan: 14, styles: summaryLabel },
    {
      content: `${currencyWithoutSymbol(totalFeeRecive || 0)}`,
      colSpan: 7,
      styles: summaryValue,
    },
    {
      content: `${safePercent(totalFeeRecive, subtotalBuyTotalPrice)}`,
      styles: summaryValue,
    },
  ]);

  rowData.push([
    { content: "Grand Total", colSpan: 14, styles: summaryLabel },
    {
      content: `${currencyWithoutSymbol(grandTotalPrint || 0)}`,
      colSpan: 7,
      styles: summaryValue,
    },
    {
      content: `${safePercent(grandTotalPrint, subtotalBuyTotalPrice)}`,
      styles: summaryValue,
    },
  ]);

  // Table
  autoTable(doc, {
    startY: 86,
    theme: "grid",
    head: [
      [
        {
          content: "No",
          rowSpan: 2,
        },
        {
          content: "Item",
          rowSpan: 2,
        },
        {
          content: "Type",
          rowSpan: 2,
        },
        {
          content: "QTY",
          rowSpan: 2,
        },
        {
          content: "Stok",
          rowSpan: 2,
        },
        {
          content: "Pengiriman",
          rowSpan: 2,
        },
        {
          content: "Est Pengiriman",
          rowSpan: 2,
        },
        {
          content: "Vendor",
          rowSpan: 2,
        },
        {
          content: "No.QUO",
          rowSpan: 2,
        },
        {
          content: "No.RAB",
          rowSpan: 2,
        },
        {
          content: "PO Vendor",
          colSpan: 4,
        },
        {
          content: "Harga Beli",
          colSpan: 2,
        },
        {
          content: "Harga QUO",
          colSpan: 2,
        },
        {
          content: "Harga Jual",
          colSpan: 2,
        },
        {
          content: "Margin (Rp)",
          rowSpan: 2,
        },
        {
          content: "Margin (%)",
          rowSpan: 2,
        },
      ],
      [
        {
          content: "No PO",
        },
        {
          content: "Harga",
        },
        {
          content: "QTY",
        },
        {
          content: "Total",
        },
        {
          content: "Satuan",
        },
        {
          content: "Total",
        },
        {
          content: "Satuan",
        },
        {
          content: "Total",
        },
        {
          content: "Satuan",
        },
        {
          content: "Total",
        },
      ],
    ],
    body: rowData,
    styles: {
      fontSize: 5,
    },
    margin: { left: marginX, right: marginX },
    headStyles: {
      fillColor: [248, 248, 248], // background
      textColor: [0, 0, 0], // warna text
      fontStyle: "bold", // bold
      halign: "center", // center text
      valign: "middle", // vertical align
      lineWidth: 0.1, // border
      lineColor: [0, 0, 0], // warna border
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Notes
  ensureSpace(10);

  doc.text("Notes:", 10, currentY);

  currentY += 8;

  doc.setFontSize(8);
  const writeWrappedText = (text: string, x = 20, lineHeight = 5) => {
    const lines = doc.splitTextToSize(text, pageWidth - 30);

    ensureSpace(lines.length * lineHeight);

    doc.text(lines, x, currentY);

    currentY += lines.length * lineHeight;
  };

  writeWrappedText(
    `\u2022 Dikirim ke ${
      props.canvassingData?.address
        ? generateAddressViewName(props.canvassingData.address)
        : "-"
    }`
  );

  (props.canvassingData?.payment_terms ?? []).forEach((element) => {
    writeWrappedText(
      `\u2022 ${element.name}: ${
        element.unit == "nominal"
          ? currencyWithoutSymbol(element.value)
          : `${element.value}%`
      } ${
        element.term_of_payment == PaymentTerm.TEMPO
          ? `${element.duration}D`
          : ""
      }`
    );
  });

  if (props.canvassingData?.description) {
    const splits = `${props.canvassingData.description}`.split("\n");

    splits.forEach((value) => {
      writeWrappedText(`\u2022 ${value ?? "-"}`);
    });
  }

  currentY += 8;

  const drawFooter = async () => {
    let approvedSignBase64 = "";
    let requestSignBase64 = "";

    if (
      props.canvassingData?.approved_by?.files &&
      props.canvassingData.approved_by.files.length > 0
    ) {
      approvedSignBase64 = await getBase64ImageFromUrl(
        `${baseImageURL}/${props.canvassingData.approved_by.files[0].image_path}/${props.canvassingData.approved_by.files[0].filename}`
      );
    }

    if (
      props.canvassingData?.request_by?.files &&
      props.canvassingData.request_by.files.length > 0
    ) {
      requestSignBase64 = await getBase64ImageFromUrl(
        `${baseImageURL}/${props.canvassingData.request_by.files[0].image_path}/${props.canvassingData.request_by.files[0].filename}`
      );
    }

    const lastPage = doc.getNumberOfPages();

    doc.setPage(lastPage);

    const footerY = pageHeight - footerHeight;

    const leftX = pageWidth * 0.12;
    const middleX = pageWidth * 0.55;
    const rightX = pageWidth * 0.84;

    const signWidth = 35;
    const signHeight = 20;

    const titleY = footerY - 30;
    const imageY = titleY + 8;
    const nameY = imageY + signHeight + 8;
    const positionY = nameY + 6;

    const drawSignature = (
      centerX: number,
      title: string,
      name: string,
      position: string,
      image?: {
        base64: string;
        type: string;
      }
    ) => {
      if (title) {
        doc.text(title, centerX, titleY, {
          align: "center",
        });
      }

      if (image) {
        doc.addImage(
          image.base64,
          image.type,
          centerX - signWidth / 2,
          imageY,
          signWidth,
          signHeight
        );
      }

      doc.text(name, centerX, nameY, {
        align: "center",
      });

      doc.text(position, centerX, positionY, {
        align: "center",
      });
    };

    drawSignature(
      leftX,
      `Jakarta, ${formatLocalDate(props.canvassingData!.created_at!)}`,
      props.canvassingData?.request_by
        ? capitalizeWords(props.canvassingData.request_by?.name ?? "")
        : "Stanislaus Adrian Pratama",
      "Operation",
      requestSignBase64
        ? {
            base64: requestSignBase64,
            type: "PNG",
          }
        : undefined
    );

    drawSignature(middleX, "Diketahui Oleh,", "Nina", "Finance");

    drawSignature(
      rightX,
      "Disetujui Oleh,",
      props.canvassingData?.approved_by
        ? capitalizeWords(props.canvassingData.approved_by?.name ?? "")
        : "Chairil Juwono",
      "Direktur",
      approvedSignBase64
        ? {
            base64: approvedSignBase64,
            type:
              props.canvassingData?.approved_by?.files?.[0]?.mime_type.split(
                "/"
              )[1] ?? "png",
          }
        : undefined
    );
  };
  await drawFooter();

  doc.addPage("a4", "portrait");

  currentY = 20;
  let vendorY = currentY;

  doc.setFontSize(12);
  doc.setFont(StandardFonts.Helvetica, "bold");
  doc.text("Pembayaran Customer", marginX, vendorY);

  vendorY += 8;

  doc.setFont(StandardFonts.Helvetica, "normal");
  doc.setFontSize(9);

  (props.canvassingData?.payment_terms ?? []).forEach((payment) => {
    const duration =
      payment.term_of_payment === PaymentTerm.TEMPO
        ? ` ${payment.duration}D`
        : "";

    const paymentText =
      (payment.name ?? "").toUpperCase() ===
      (payment.term_of_payment ?? "").toUpperCase()
        ? `${payment.name} ${
            payment.unit == "percentage"
              ? `${payment.value}%`
              : currency(payment.value)
          }`
        : `${payment.name} ${
            payment.unit == "percentage"
              ? `${payment.value}%`
              : currency(payment.value)
          } ${(payment.term_of_payment ?? "").toUpperCase()}${duration}`;

    doc.text(`\u2022 ${paymentText}`, marginX + 4, vendorY);

    vendorY += 6;
  });

  vendorY += 20;

  doc.setFontSize(12);
  doc.setFont(StandardFonts.Helvetica, "bold");
  doc.text("Penerima Fee", marginX, vendorY);

  vendorY += 8;

  autoTable(doc, {
    startY: vendorY,
    theme: "grid",
    head: [["Nama", "Nomor Telepon", "Email", "Fee"]],
    body:
      contactsFee.value.map((item) => [
        (item.party as Contact)?.name ?? "-",
        (item.party as Contact)?.phone ?? "-",
        (item.party as Contact)?.email ?? "-",
        currencyWithoutSymbol(item.amount ?? 0),
      ]) || [],
    styles: {
      fontSize: 8,
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [248, 248, 248],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
    },
    bodyStyles: {
      valign: "middle",
    },
    columnStyles: {
      3: {
        halign: "right",
      },
    },
    margin: {
      left: marginX,
      right: marginX,
    },
  });

  const blob = doc.output("blob");

  return {
    blob,
  };
};

const printSCMMemo = async () => {
  loading.value = true;
  try {
    if (
      showItemMemo.value.length === 0 &&
      props.canvassingData?.canvassing_item?.length
    ) {
      await initItemMemo(props.canvassingData);
    }

    const { blob } = await generateSCMMemo();

    pdfBlob.value = blob;
    pdfUrl.value = URL.createObjectURL(blob);

    previewSCMMemoDialog.value = true;
  } catch (error) {
    console.error("Gagal membuat PDF memo", error);
    ElMessage.error("Gagal membuat PDF memo");
  } finally {
    loading.value = false;
  }
};

const downloadSCMMemo = () => {
  if (!pdfBlob.value) {
    ElMessage.warning("Tidak ada PDF untuk di-download");
    return;
  }

  const filename = `SCM-MEMO-${
    props.canvassingData?.unique_code || "document"
  }.pdf`;

  const url = URL.createObjectURL(pdfBlob.value);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

watch(
  () => props.canvassingData,
  (newData) => {
    if (newData) {
      generateContactFee(newData);
      initItemMemo(newData);
    }
  },
  { immediate: true }
);
</script>
