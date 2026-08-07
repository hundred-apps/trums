<template>
  <TrumsWrapper>
    <el-card
      class="my-3"
      shadow="never"
      element-loading-text="Loading..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      element-loading-background="rgba(122, 122, 122, 0.8)"
    >
      <template #header>
        <div class="card-header flex justify-end">
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
          v-html="
            extractDescription(canvassingData?.delivery_description ?? '')
          "
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
        <el-table-column label="Type" width="200">
          <template #default="{ row }">
            <el-select
              v-if="row.type == 'child'"
              v-model="row.type_item"
              :disabled="row.type == 'parent'"
              placeholder="Select"
            >
              <el-option :label="`Subtitution`" :value="'quotation'" />
              <el-option :label="`Equivalent`" :value="'equivalent'" />
              <el-option :label="`AS Requested`" :value="'original'" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column
          prop="quantity"
          label="QTY"
          align="center"
          :width="200"
        >
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
                <span v-if="row.po_id" class="text-blue-600 cursor-pointer">
                  {{ row.po_number }}
                </span>
                <span v-else>Belum pilih PO</span>
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
  </TrumsWrapper>
</template>
<script lang="tsx" setup>
import type { Permission } from "~/types/menu";
import {
  CanvassingItemReference,
  CanvassingVendorStatus,
  type Canvassing,
  type CanvassingItem,
} from "~/types/scm/canvasing";
import {
  extractDescription,
  generateAddressViewName,
  currencyWithoutSymbol,
  customMathCeil,
} from "#imports";
import { getDeliveryMethodLabel, type Pricetag_item } from "~/types/pricetag";
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

const { isMobile } = useDevice();

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

const item_memo = ref<ItemMemoView[]>([]);

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
          child.vendor_id == child.vendor_id
      );

      let poItemDetail: PurchaseOrderItem | undefined = undefined;

      let marginNominal = 0;
      let marginPercentage = 0;

      console.log("canvassing vendor ", child);

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
          (item.reference_data?.po_unit_price || 0) *
            (item.reference_data?.quantity || 0) || 0,
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
};

watch(
  () => props.canvassingData,
  (newData) => {
    if (newData) {
      initItemMemo(newData);
    }
  },
  { immediate: true }
);
</script>
