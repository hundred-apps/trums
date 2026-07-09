<template>
  <TrumsWrapper>
    <el-card>
      <div ref="spreadsheetRef" style="height: 500px"></div>
      <template #header>
        <NuxtLink
          :href="`/sales/offer/${id}`"
          class="el-button el-button--default"
          >Batal</NuxtLink
        >
        <el-button type="primary" @click="saveSpreadsheet">Simpan</el-button>
      </template>
    </el-card>
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import {
  DeliveryMethod,
  PricetagItemStatus,
  type Pricetag,
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
import "x-data-spreadsheet/dist/xspreadsheet.css";
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
const spreadsheet = ref<any>(null);

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

const route = useRoute();

const id = computed(() => route.query.id as string);
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
      tag_id: [id.value],
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
  const res = await useFetchApi<ResponsePagination<Pricetag_item[]>>(
    `/search`,
    "fetch-pricetag-item",
    "post",
    request_search_pricelist_item.value
  );
  return res.data.value;
});
watchEffect(() => {
  console.log("items", items.data.value);
});
watch(
  () => request_search_pricelist_item.value,
  () => items.refresh(),
  { deep: true }
);
watch(
  () => items.data.value?.data,
  () => {
    pricetag_item_views.value = [];
    let no = 1;

    (items.data.value?.data ?? []).forEach((item) => {
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

    renderSpreadsheet();
  },
  { immediate: true }
);

watch(
  () => data.value?.data?.unique_id,
  (value) => {
    console.log("masil watch");
    request_search_pricelist_item.value.column[0] = {
      tag_id: [data.value?.data?.unique_id],
    };
  },
  { deep: true, immediate: true }
);

function convertToSpreadsheet(data: PricetagItemView[]) {
  const rows: Record<number, any> = {};

  // Header
  rows[0] = {
    cells: {
      0: { text: "No" },
      1: { text: "Item" },
      2: { text: "Harga" },
      3: { text: "Qty" },
      4: { text: "UoM" },
      5: { text: "Total" },
    },
  };

  let i = 1;
  // Data
  data.forEach((item, index) => {
    rows[index + 1] = {
      cells: {
        0: { text: item.hasChild ? i : "" },
        1: { text: item.item_name },
        2: { text: item.hasChild ? "" : String(item.price) },
        3: { text: item.hasChild ? "" : String(item.qty) },
        4: { text: item.hasChild ? "" : item.unit_name },
        5: { text: item.hasChild ? "" : String(item.price * item.qty) },
      },
      __locked: true,
      __unique_id: item.unique_id,
    };
    if (item.hasChild) {
      i++;
    }
  });

  return [
    {
      name: "Data",
      rows,
    },
  ];
}

function renderSpreadsheet() {
  if (!spreadsheet.value) return;

  if (data.value?.data?.raw_payload) {
    spreadsheet.value.loadData(data.value?.data?.raw_payload[0]);
  } else {
    spreadsheet.value.loadData(convertToSpreadsheet(pricetag_item_views.value));
  }
}

const saveSpreadsheet = () => {
  // if (!spreadsheet.value) return;

  const spreadsheetJson = JSON.parse(
    JSON.stringify(spreadsheet.value.getData())
  );

  onSubmit(spreadsheetJson);
};

const onSubmit = async (data: any) => {
  loading.value = true;
  try {
    const formData = new FormData();

    formData.append("unique_id", `${id.value}`);
    formData.append("raw_payload", JSON.stringify(data));

    // Get unique_id from cookie

    const response = await useFetchApi<BaseResponse<Pricetag>>(
      "/pricetag-create",
      "pricelist-create",
      "post",
      formData
    );

    if (response.status.value == "success") {
      const pricetag: Pricetag | undefined = response.data.value?.data;
      ElMessage.success("Berhasil");

      // window.location.href = "/sales/offer/" + id.value;
    }
  } catch (error: any) {
    ElMessage.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (!spreadsheetRef.value) return;

  spreadsheet.value = new x_spreadsheet(spreadsheetRef.value);

  renderSpreadsheet();

  spreadsheet.value.on("cell-edited", (text: any, ri: any, ci: any) => {
    console.log({
      text,
      row: ri,
      col: ci,
    });
  });
});
</script>
