<template>
  <div ref="spreadsheetRef" style="height: 500px"></div>
</template>

<script lang="tsx" setup>
import { TrumsWrapper } from "#components";
import { Edit } from "@element-plus/icons-vue";
import type { ComponentSize } from "element-plus";
import jsPDF from "jspdf";
import autoTable, {
  type CellDef,
  type CellInput,
  type RowInput,
} from "jspdf-autotable";
import type { AddressType } from "~/types/address";
import type { Inventory } from "~/types/inventory";
import type { Pricelist, Pricelist_item } from "~/types/pricelist";
import {
  DeliveryMethod,
  PricetagItemStatus,
  VariablePriceTag,
  type Pricetag,
  type Pricetag_condition,
  type Pricetag_item,
} from "~/types/pricetag";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { BaseResponse } from "~/types/response";
import type { ResponsePagination } from "~/types/response_pagination";
import {
  PaymentTerm,
  paymentTermView,
  type Canvassing,
} from "~/types/scm/canvasing";
import OfferDetail from "./components/OfferDetail.vue";
import * as XLSX from "xlsx";
import x_spreadsheet from "x-data-spreadsheet";
import ExcelJS from "exceljs";

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "pricetag-read",
  name: "Trums Offer Detail",
});

const router = useRouter();
const loading = ref<boolean>(false);
const goBack = () => router.back();

const quotationToId = ref<string>("");
const quotationToName = ref<string>("");
const quotationNumber = ref<string>("");
const showPreviewQuotation = ref(false);
const pdfUrl = ref<string | null>(null);
const typeSummery = ref<"satuan" | "total">("satuan");
const modalSelectContact = ref<boolean>(false);

const spreadsheetRef = ref<HTMLDivElement | null>(null);

type PricetagItemView = {
  unique_id: string;
  item_name: string;
  price: number;
  qty: number;
  unit_id: string;
  unit_name: string;
  garansi: string;
  note: string;
  is_equivalent: boolean;
  equivalent_from_id: string;
  hasChild: boolean;
  no: string;
  status_item?: PricetagItemStatus;
  delivery?: DeliveryMethod;
};
const pricetag_item_views = ref<PricetagItemView[]>([]);

const id = ref<string>((router.currentRoute.value.params.id as string) ?? "");
const { data, pending } = await useFetchApi<BaseResponse<Pricetag>>(
  `/pricetag-read/${id.value}`,
  "pricetag-detail",
  "get",
  null
);

const request_search_pricelist_item = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      tag_id: [],
    },
  ],
  limit: "10",
  offset: "1",
  table: "pricetag_item",
  sort: {
    column: "created_at",
    order: OrderColumn.ASC,
  },
  flag: "form",
});

const items = await useAsyncData("fetch-pricetag-item", async () => {
  let res: ResponsePagination<Pricetag_item[]> = {
    success: false,
    currentPage: 0,
    total_page: 0,
    total_data: 0,
    data: [],
  };
  if (request_search_pricelist_item.value.column[0].tag_id.length > 0) {
    const response = await useFetchApi<ResponsePagination<Pricetag_item[]>>(
      `/search`,
      "fetch-pricetag-item",
      "post",
      request_search_pricelist_item.value
    );
    res = response.data.value!;
  }

  return res;
});

watch(
  () => request_search_pricelist_item.value,
  () => items.refresh(),
  { deep: true }
);
watch(
  () => items.data.value?.data,
  (data) => {
    pricetag_item_views.value = [];
    let no = 1;

    (data ?? []).forEach((item) => {
      if (item.data_reference) {
        const isExist = pricetag_item_views.value.findIndex(
          (find) => find.unique_id == item.reference_id
        );

        if (isExist < 0) {
          pricetag_item_views.value.push({
            no: `${no}`,
            unique_id: item.reference_id || "",
            item_name: item.catalogue?.name || "",
            price: item.price,
            qty: item.quantity,
            unit_id: item.unit_id || "",
            unit_name: item.unit_name || "",
            garansi: item.garansi ? item.garansi + " Hari" : "N/A",
            note: item.note || "",
            is_equivalent: false,
            equivalent_from_id: "",
            delivery: item.delivery,
            status_item: item.status_item,
            hasChild: true,
          });
          no += 1;

          pricetag_item_views.value.push({
            no: ``,
            unique_id: item.unique_id || "",
            item_name: displayCatalogueName(item.catalogue!),
            price: item.price,
            qty: item.quantity,
            unit_id: item.unit_id || "",
            unit_name: item.unit_name || "",
            garansi: item.garansi ? item.garansi + " Hari" : "N/A",
            note: item.note || "",
            is_equivalent: false,
            equivalent_from_id: "",
            delivery: item.delivery,
            status_item: item.status_item,
            hasChild: false,
          });
        } else {
          pricetag_item_views.value.push({
            no: ``,
            unique_id: item.unique_id || "",
            item_name: displayCatalogueName(item.catalogue!),
            price: item.price,
            qty: item.quantity,
            unit_id: item.unit_id || "",
            unit_name: item.unit_name || "",
            garansi: item.garansi ? item.garansi + " Hari" : "N/A",
            note: item.note || "",
            is_equivalent: false,
            equivalent_from_id: "",
            delivery: item.delivery,
            status_item: item.status_item,
            hasChild: false,
          });
        }

        // (data ?? []).forEach((item) => {
        //   pricetag_item_views.value.push({
        //     no: `${no}`,
        //     unique_id: item.unique_id || "",
        //     item_name: item.catalogue?.name || "",
        //     price: item.price,
        //     qty: item.quantity,
        //     unit_id: item.unit_id || "",
        //     unit_name: item.unit_name || "",
        //     garansi: item.garansi ? item.garansi + " Hari" : "N/A",
        //     note: item.note || "",
        //     is_equivalent: false,
        //     equivalent_from_id: "",
        //     delivery: item.delivery,
        //     status_item: item.status_item,
        //     hasChild: false,
        //   });
        //   no += 1;
        // });
      } else {
        pricetag_item_views.value.push({
          no: `${no}`,
          unique_id: item.unique_id || "",
          item_name: displayCatalogueName(item.catalogue!),
          price: item.price,
          qty: item.quantity,
          unit_id: item.unit_id || "",
          unit_name: item.unit_name || "",
          garansi: item.garansi ? item.garansi + " Hari" : "N/A",
          note: item.note || "",
          is_equivalent: false,
          equivalent_from_id: "",
          delivery: item.delivery,
          status_item: item.status_item,
          hasChild: false,
        });
      }
    });
  },
  { deep: true }
);

function convertToSpreadsheet(data: PricetagItemView[]) {
  const rows: Record<number, any> = {};

  // Header
  rows[0] = {
    cells: {
      0: { text: "Item" },
      1: { text: "Harga" },
      2: { text: "Qty" },
      3: { text: "UoM" },
      4: { text: "Total" },
    },
  };

  // Data
  data.forEach((item, index) => {
    rows[index + 1] = {
      cells: {
        0: { text: item.item_name },
        1: { text: String(item.price) },
        2: { text: String(item.qty) },
        3: { text: item.unit_name },
        4: { text: String(item.price * item.qty) },
      },
    };
  });

  return [
    {
      name: "Data",
      rows,
    },
  ];
}

watch(
  () => pricetag_item_views.value,
  () => {
    x_spreadsheet.loadData(convertToSpreadsheet(pricetag_item_views.value));
  },
  { deep: true }
);
</script>
