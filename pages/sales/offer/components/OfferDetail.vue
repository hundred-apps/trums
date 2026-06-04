<template>
  <el-card class="my-3" shadow="never">
    <template #header>
      <div class="card-header flex items-center justify-between">
        <div>
          <el-form-item
            v-if="dataInterface.data?.type == 'out'"
            label="Tipe Summery"
            style="margin: 0 !important"
            size="small"
          >
            <el-radio-group v-model="typeSummery">
              <el-radio value="satuan">Satuan</el-radio>
              <el-radio value="total">Total</el-radio>
            </el-radio-group>
          </el-form-item>
          <span>{{ dataInterface.data?.unique_code }}</span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <NuxtLink
            v-if="canAccess('pricetag-update', dataInterface?.privilege ?? [])"
            :href="`/${
              dataInterface.data?.type == 'in'
                ? 'supply-chain-management'
                : 'sales'
            }/offer/add?id=${dataInterface?.data?.unique_id}&type=${
              dataInterface?.data?.type
            }`"
            class="el-button el-button--default"
          >
            <el-icon><Edit /></el-icon>
          </NuxtLink>

          <!-- <NuxtLink
            v-if="canAccess('pricetag-update', dataInterface?.privilege ?? [])"
            :href="`/sales/offer/add?id=${dataInterface?.data?.unique_id}&type=${dataInterface?.data?.type}`"
            class="el-button el-button--defult"
          >
            Edit
          </NuxtLink> -->
          <TrumsCustomButton
            v-if="dataInterface.data?.type == 'out'"
            :type="'primary'"
            @click="generateQuotation"
            :loading="loading"
            :disabled="false"
          >
            <el-icon> <Printer /> </el-icon>
          </TrumsCustomButton>
        </div>
      </div>
    </template>
    <!-- <el-button type="primary" @click="onCheckout" :loading="loading">Proses</el-button> -->
    <div class="flex gap-3 my-3">
      <div class="flex-1">
        <el-descriptions title="" :column="1" :size="'default'">
          <el-descriptions-item
            label="No"
            label-class-name="font-bold"
            :label-width="isMobile ? 50 : 100"
            >{{ dataInterface?.data?.unique_code }}</el-descriptions-item
          >
          <el-descriptions-item
            :label="`Vendor`"
            :label-width="isMobile ? 50 : 100"
            v-if="dataInterface?.data?.type == 'in'"
            label-class-name="font-bold"
            >{{
              dataInterface?.data?.owner?.name ?? "N/A"
            }}</el-descriptions-item
          >
          <el-descriptions-item
            label="Kepada"
            v-if="dataInterface?.data?.type == 'out'"
            label-class-name="font-bold"
            :label-width="isMobile ? 50 : 100"
            >{{ dataInterface?.data?.to?.name ?? "N/A" }}</el-descriptions-item
          >
          <el-descriptions-item
            label="Subject"
            label-class-name="font-bold"
            :label-width="isMobile ? 50 : 100"
            >{{ dataInterface?.data?.subject ?? "N/A" }}</el-descriptions-item
          >
          <!-- <el-descriptions-item label="Berlaku Mulai Tanggal">{{
            formatLocalDate(dataInterface?.data?.start_date ?? 0)
          }}</el-descriptions-item> -->
          <el-descriptions-item
            label="S/d"
            label-class-name="font-bold"
            :label-width="isMobile ? 50 : 100"
            v-if="dataInterface?.data?.end_date"
            >{{
              dataInterface?.data?.end_date != 0
                ? formatLocalDate(dataInterface?.data?.end_date ?? 0)
                : "-"
            }}</el-descriptions-item
          >
        </el-descriptions>
      </div>
    </div>

    <h1 class="font-bold text-sm" v-if="props.dataInterface?.data?.note">
      Note
    </h1>
    <div class="text-sm" v-html="getNote"></div>

    <h5
      class="font-bold text-black text-1xl mt-6 text-sm"
      v-if="(dataInterface?.data?.files || []).length > 0"
    >
      Lampiran
    </h5>
    <div v-for="(file, key) in dataInterface?.data?.files" :key="key">
      <NuxtLink
        class="text-blue-600 text-sm"
        :href="`${baseImageURL}/${file.image_path}/${file.filename}`"
        target="_blank"
        >{{ file.filename_original }}</NuxtLink
      >
    </div>
  </el-card>
  <el-card class="mb-3" shadow="never">
    <el-row :gutter="20" class="mb-3">
      <el-col :span="12"
        ><el-input
          v-model="request_search_pricelist_item.keyword"
          :size="isMobile ? 'small' : 'default'"
          placeholder="Type to search"
      /></el-col>
      <!-- <el-col :span="6"
        ><el-button
          type="primary"
          :disabled="selectedPricetagItems.length == 0"
        >
          Tambahkan Selected ({{ selectedPricetagItems.length }})
        </el-button></el-col
      > -->
    </el-row>

    <!-- <el-table
      :data="items.data ?? []"
      size="small"
      border
      ref="offerItemTableRef"
      @selection-change="handlePricetagSelectionChange"
    > -->
    <!-- <el-table-column type="selection" width="30" /> -->
    <!-- <el-table-column prop="image" label="Image" width="75">
        <template #default="scope">
          <div class="demo-image__preview flex items-center">
            <ItemImageUpload
              v-if="((scope.row as Pricetag_item).files ?? []).length > 0 && getFirstFileUrl(((scope.row as Pricetag_item).files ?? [])) !== ''"
              v-model="scope.row.files"
              :image-url="getFirstFileUrl((scope.row as Pricetag_item).files ?? [])"
              :show-text="false"
              @open-modal="() => {
                              fileList = mapAllAppFileToFileUri((scope.row as Pricetag_item).files || []);
                              initialIndexImage = 0;
                              previewImage = true;
                            }"
            />
            <div
              v-else
              class="w-10 h-10 rounded border flex items-center justify-center text-gray-400 image-viewer-slot image-slot"
            >
              <el-icon><Picture /></el-icon>
            </div>
          </div>
        </template>
      </el-table-column> -->
    <!-- <el-table-column prop="name" label="item">
        <template #default="scope">
          {{ scope.row.catalogue?.name ?? "-" }}
        </template>
      </el-table-column>
      <el-table-column prop="catalogue.sn" label="SN/PN" width="300" />
      <el-table-column prop="quantity" label="QTY" width="70" />
      <el-table-column prop="unit_name" label="UOM" width="100" />
      <el-table-column
        prop="price"
        label="Harga Jual"
        width="140"
        align="right"
      >
        <template #default="scope">
          {{ currency(scope.row.price * scope.row.quantity) }}
        </template>
      </el-table-column>
      <el-table-column prop="note" label="Note" width="150" /> -->
    <!-- </el-table> -->
    <el-table
      :data="items.data.value?.data ?? []"
      :size="isMobile ? 'small' : 'default'"
    >
      <!-- <el-table-column prop="fileUploads" label="image" width="75">
            <template #default="scope">
              <ItemImageUpload
                v-model="scope.row.fileUploads"
                :image-url="scope.row.image"
                :show-text="false"
                @open-modal="() => openImageModal(scope.$index, scope.row)"
              />
            </template>
          </el-table-column> -->
      <el-table-column
        prop="item_name"
        label="Nama Barang"
        class="my-0"
        :width="isMobile ? 160 : 0"
        fixed="left"
        :align="isMobile ? 'center' : 'left'"
      >
        <template #default="scope">
          <p class="text-start text-blue-600">
            {{ scope.row.catalogue?.name }}
          </p>
        </template>
      </el-table-column>
      <el-table-column
        prop="selling_price"
        label="Harga"
        class="mb-0"
        width="120"
        align="center"
      >
        <template #default="scope">
          {{ currencyWithoutSymbol(scope.row.price, 0) }}
        </template>
      </el-table-column>
      <!-- <el-table-column prop="sn" label="Serial Number" /> -->
      <el-table-column
        prop="quantity"
        label="QTY"
        class="mb-0"
        :width="isMobile ? 50 : 80"
        align="center"
      >
        <template #default="scope">
          <!-- <el-input-number v-model="scope.row.quantity" /> -->
          {{ scope.row.quantity }}
        </template>
      </el-table-column>
      <el-table-column prop="unit" label="Unit" width="100">
        <template #default="scope">
          <!-- <el-autocomplete
                :fetch-suggestions="querySearchUnit"
                v-model="scope.row.unit_name"
                placeholder="Input Units"
                @select="(item: Record<string, any>) => onHandleSelectItemAutocompleteUnit(item, scope)"
              /> -->
          {{ scope.row.unit_name }}
        </template>
      </el-table-column>

      <el-table-column prop="total" label="Total" class="mb-0" width="150">
        <template #default="scope">
          {{
            currencyWithoutSymbol(
              Number(scope.row.price) * Number(scope.row.quantity),
              0
            )
          }}
        </template>
      </el-table-column>
      <el-table-column prop="Garansi" label="Garansi" class="mb-0" width="150">
        <template #default="scope">
          {{
            ((scope.row as Pricetag_item).reference_transaction || []).find((find) => find.adjustments_transaction?.name.toLowerCase() == 'garansi' && find.adjustments_transaction?.category == 'attribute')?.amount || 'N/A'
          }}
        </template>
      </el-table-column>
      <el-table-column prop="note" label="Catatan" class="mb-0" width="150">
        <template #default="scope">
          {{ scope.row.note }}
        </template>
      </el-table-column>
    </el-table>
    <div class="flex justify-end">
      <el-pagination
        class="my-3"
        v-model:page-size="limit"
        :page-sizes="[10, 20, 30, 40]"
        background
        layout="total, sizes, prev, pager, next"
        :total="items.data.value?.total_data"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
    <!-- <el-button class="mt-4" style="width: 100%" @click="addNewLine">
              Tambahkan Item
          </el-button> -->
  </el-card>

  <CustomPaymentTerm
    type="view"
    :data="dataInterface.data?.payment_terms ?? []"
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
        v-for="ref in (
          dataInterface.data?.reference_transaction_adjustment ?? []
        ).filter((value) => value.adjustments_transaction?.operator == 'minus')"
        :key="ref.adjustment_id"
        :label="ref.adjustments_transaction?.name ?? ''"
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
        v-for="ref in (
          dataInterface.data?.reference_transaction_adjustment ?? []
        ).filter(
          (value) =>
            value.adjustments_transaction?.operator == 'plus' &&
            value.adjustments_transaction?.category == 'adjustment'
        )"
        :key="ref.adjustment_id"
        :label="ref.adjustments_transaction?.name ?? ''"
        >{{
          currency(showTransactionAdjustmentValue(ref))
        }}</el-descriptions-item
      >
      <el-descriptions-item
        :width="100"
        label="DPP Nilai Lain"
        align="right"
        v-if="getDPPNilaiLain > 0"
        >{{ currency(getDPPNilaiLain) }}</el-descriptions-item
      >
      <el-descriptions-item
        :width="100"
        align="right"
        v-for="ref in (
          dataInterface.data?.reference_transaction_adjustment ?? []
        ).filter(
          (value) =>
            value.adjustments_transaction?.category == 'transform' ||
            value.adjustments_transaction?.category == 'tax'
        )"
        :key="ref.adjustment_id"
        :label="ref.adjustments_transaction?.name ?? ''"
        >{{
          currency(showTransactionAdjustmentValue(ref))
        }}</el-descriptions-item
      >
      <el-descriptions-item :width="100" align="right" class-name="font-bold">
        <template #label>
          <div class="cell-item font-bold">Grand Total</div> </template
        ><span class="font-bold">{{
          currency(grandTotal)
        }}</span></el-descriptions-item
      >
      <!-- <el-descriptions-item :width="100" label="Grand Total">{{ currency(grandTotal) }}</el-descriptions-item> -->
    </el-descriptions>
  </el-card>

  <el-dialog
    v-model="showPreviewQuotation"
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
      <el-button @click="showPreviewQuotation = false">Tutup</el-button>
      <el-button type="success" @click="downloadPdf">Download PDF</el-button>
    </template>
  </el-dialog>

  <el-image-viewer
    v-if="previewImage"
    show-progress
    :url-list="fileList"
    @close="previewImage = false"
  >
    <template #viewer-error="{ activeIndex, src }">
      <div class="image-slot viewer-error">
        <el-icon><icon-picture /></el-icon>
        <span>
          this is viewer-error slot. current index: {{ activeIndex }}. src:
          {{ src }}
        </span>
      </div>
    </template>
  </el-image-viewer>
</template>

<script lang="tsx" setup>
import { TrumsWrapper } from "#components";
import { Edit, InfoFilled, Picture, Printer } from "@element-plus/icons-vue";
import type { ComponentSize, ElTable } from "element-plus";
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
  VariablePriceTag,
  type Pricetag,
  type Pricetag_condition,
  type Pricetag_item,
} from "~/types/pricetag";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { BaseResponse, DataInterface } from "~/types/response";
import type { ResponsePagination } from "~/types/response_pagination";
import {
  PaymentTerm,
  paymentTermView,
  type Canvassing,
} from "~/types/scm/canvasing";
import {
  formatLocalDate,
  currency,
  canAccess,
  getFirstFileUrl,
  mapAllAppFileToFileUri,
} from "#imports";
import ItemImageUpload from "../../inquiry/components/ItemImageUpload.vue";
import type { ReferenceTransactionAdjustment } from "~/types/attribute_adjustment";
import CustomPaymentTerm from "~/components/trums/CustomPaymentTerm.vue";
import type { _0 } from "#tailwind-config/theme/backdropBlur";
import { currencyWithoutSymbol } from "#imports";
import { findPath } from "nuxt/kit";
const { isMobile } = useDevice();

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

const fileList = ref<string[]>([]);
const initialIndexImage = ref<number>(0);
const previewImage = ref<boolean>(false);

const offerItemTableRef = ref<InstanceType<typeof ElTable>>();
const selectedPricetagItems = ref<Pricetag_item[]>([]);

const items = await useAsyncData("fetch-pricetag-item", async () => {
  const res = await useFetchApi<ResponsePagination<Pricetag_item[]>>(
    `/search`,
    "fetch-pricetag-item",
    "post",
    request_search_pricelist_item.value
  );
  return res.data.value;
});
const itemLoad = ref<boolean>(true);

const limit = ref<number>(10);

const props = defineProps<{
  dataInterface: DataInterface<Pricetag>;
}>();

const request_search_pricelist_item = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      tag_id: [props.dataInterface.data?.unique_id],
    },
  ],
  limit: "10",
  offset: "1",
  table: "pricetag_item",
  sort: {
    column: "created_at",
    order: OrderColumn.ASC,
  },
});

const pricelist_item_new = ref<Pricelist_item[]>([]);

const size = ref<ComponentSize>("default");

const pdfBlob = ref<Blob | null>(null);

const config = useRuntimeConfig();
const baseImageURL = config.public.baseImageURL;

const handlePricetagSelectionChange = (selection: Pricetag_item[]) => {
  selectedPricetagItems.value = selection;
};

const handlePageChange = (page: number) => {
  request_search_pricelist_item.value.offset = `${page}`;
};

const handleSizeChange = (size: number) => {
  request_search_pricelist_item.value.limit = `${size}`;
  limit.value = size;
};

function handleSelectContact(row: Pricetag_condition) {
  console.log(row);
  quotationToId.value = row.value_data?.unique_id ?? "";
  quotationToName.value = row.value_data?.name ?? "";
}

const getNote = computed(() => {
  let message = props.dataInterface?.data?.note ?? "";
  message = message.replace(/\r?\n/g, "<br>");
  return message;
});

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

const generateResultSearchAddress = (address: AddressType | null) => {
  if (address) {
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
      address: address,
    };
  } else {
    return {
      value: "",
      name: "",
      street: "",
      address_id: "",
      address_version: 0,
      address: null,
    };
  }
};

const totalPrice = computed(() => {
  return props.dataInterface.data?.total_price || 0;
});
const subtotal = computed(() => {
  console.log("get minus", totalPrice.value);
  return Number(totalPrice.value) - Number(getMinus.value);
});

const getMinus = computed(() => {
  var minus = 0;
  (props.dataInterface.data?.reference_transaction_adjustment ?? [])
    .filter(
      (value) =>
        (value.adjustment ?? value.adjustments_transaction)?.operator == "minus"
    )
    .forEach((ref) => {
      if (ref.include == false) {
        minus += Number(ref.amount);
      }
    });

  return minus;
});
const getPlus = computed(() => {
  var plus = 0;

  (props.dataInterface.data?.reference_transaction_adjustment ?? [])
    .filter(
      (value) =>
        (value.adjustment ?? value.adjustments_transaction)?.operator ==
          "plus" &&
        (value.adjustment ?? value.adjustments_transaction)?.category ===
          "adjustment"
    )
    .forEach((ref) => {
      if (ref.include == false) {
        plus += Number(ref.amount);
      }
    });

  return plus;
});

const getDPPNilaiLain = computed(() => {
  let dpp = 0;
  (props.dataInterface.data?.reference_transaction_adjustment || []).forEach(
    (element) => {
      if (
        element.adjustments_transaction?.category == "tax" &&
        element.adjustments_transaction.name.toLowerCase() === "ppn"
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
    }
  );

  return dpp;
});

const generateQuotationPdf = async () => {
  const doc = new jsPDF();

  const today = new Date();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const marginX = 10;
  const bottomMargin = 20;

  const formatted = today.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const checkPageBreak = (currentY: number, neededSpace: number = 10) => {
    if (currentY + neededSpace > pageHeight - bottomMargin) {
      doc.addPage();
      return 20;
    }

    return currentY;
  };

  // ================= LOGO =================

  const imgLogo = await getBase64ImageFromUrl("/images/trumecs-logo.png");

  const tmsLogo = await getBase64ImageFromUrl("/images/tms-logo.png");

  const headerTop = 10;
  const headerHeight = 25;
  const headerCenterY = headerTop + headerHeight / 2;

  const leftLogoWidth = 40;
  const leftLogoHeight = 35;

  const rightLogoWidth = 40;
  const rightLogoHeight = 15;

  doc.addImage(
    tmsLogo,
    "PNG",
    marginX,
    headerCenterY - leftLogoHeight / 2,
    leftLogoWidth,
    leftLogoHeight
  );

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

  doc.text("Quotation", pageWidth / 2, 50, {
    align: "center",
  });

  // ================= INFO =================

  const labelX = marginX;
  const colonX = marginX + 28;
  const valueX = marginX + 32;

  doc.setFontSize(9);

  doc.text("Number", labelX, 60);
  doc.text(":", colonX, 60);

  doc.text(`${props.dataInterface?.data?.unique_code}`, valueX, 60);

  doc.text(`Jakarta, ${formatted}`, pageWidth - marginX, 60, {
    align: "right",
  });

  doc.text("Subject", labelX, 66);
  doc.text(":", colonX, 66);

  doc.text(`${props.dataInterface?.data?.subject ?? "-"}`, valueX, 66);

  doc.text("To", labelX, 78);
  doc.text(":", colonX, 78);

  doc.text(`${props.dataInterface?.data?.to?.name ?? "-"}`, valueX, 78);

  doc.text("PIC", labelX, 84);
  doc.text(":", colonX, 84);

  doc.text(`${props.dataInterface?.data?.pic_name ?? "-"}`, valueX, 84);

  // ================= BODY =================

  doc.text("Bersama ini kami kirimkan penawaran sebagai berikut:", marginX, 98);

  // ================= TABLE =================

  let rowData: RowInput[] = (items.data.value?.data ?? []).map(
    (item: Pricetag_item, i: number) => [
      {
        content: `${i + 1}`,
        styles: {
          halign: "center",
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
      },
      {
        content: `${item.catalogue?.name}`,
        styles: {
          halign: "left",
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
      },
      {
        content: `${item.quantity}`,
        styles: {
          halign: "center",
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
      },
      {
        content: `${item.unit_name}`,
        styles: {
          halign: "center",
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
      },
      {
        content: `${currencyWithoutSymbol(item.price)}`,
        styles: {
          halign: "right",
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
      },
      {
        content: `${currencyWithoutSymbol(item.quantity * (item.price || 0))}`,
        styles: {
          halign: "right",
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
      },
    ]
  );

  if (typeSummery.value === "total") {
    rowData.push([
      {
        content: `Total Price`,
        colSpan: 5,
        styles: {
          halign: "right",
          fontStyle: "bold",
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
      },
      {
        content: `${currencyWithoutSymbol(totalPrice.value)}`,
        styles: {
          halign: "right",
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
      },
    ]);

    rowData.push([
      {
        content: `Subtotal`,
        colSpan: 5,
        styles: {
          halign: "right",
          fontStyle: "bold",
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
      },
      {
        content: `${currencyWithoutSymbol(subtotal.value)}`,
        styles: {
          halign: "right",
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
      },
    ]);

    (props.dataInterface.data?.reference_transaction_adjustment ?? [])
      .filter(
        (value) =>
          value.adjustments_transaction?.category == "transform" ||
          value.adjustments_transaction?.category == "tax"
      )
      .forEach((element) => {
        if (element.adjustments_transaction?.name.toLowerCase() == "ppn") {
          rowData.push([
            {
              content: `DPP Nilai Lain`,
              colSpan: 5,
              styles: {
                halign: "right",
                fontStyle: "bold",
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
              },
            },
            {
              content: `${currencyWithoutSymbol(getDPPNilaiLain.value)}`,
              styles: {
                halign: "right",
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
              },
            },
          ]);
        }

        rowData.push([
          {
            content: `${element.adjustments_transaction?.name}`,
            colSpan: 5,
            styles: {
              halign: "right",
              fontStyle: "bold",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
          {
            content: `${currencyWithoutSymbol(
              showTransactionAdjustmentValue(element)
            )}`,
            styles: {
              halign: "right",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            },
          },
        ]);
      });

    rowData.push([
      {
        content: `Grand Total`,
        colSpan: 5,
        styles: {
          halign: "right",
          fontStyle: "bold",
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
      },
      {
        content: `${currencyWithoutSymbol(grandTotal.value || 0)}`,
        styles: {
          halign: "right",
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
      },
    ]);
  }

  autoTable(doc, {
    startY: 105,
    head: [["No", "Item", "Qty", "UoM", "Price", "Total Price"]],
    body: rowData,
    styles: {
      fontSize: 7,
    },
    margin: {
      left: marginX,
      right: marginX,
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
  });

  // ================= NOTES =================

  let currentY = (doc as any).lastAutoTable.finalY + 15;

  currentY = checkPageBreak(currentY);

  doc.setFontSize(9);

  doc.text("Notes:", 10, currentY);

  currentY += 10;

  doc.setFontSize(8);

  const writeWrappedText = (text: string) => {
    const lines = doc.splitTextToSize(text, pageWidth - 30);

    const textHeight = lines.length * 5;

    currentY = checkPageBreak(currentY, textHeight);

    doc.text(lines, 20, currentY);

    currentY += textHeight;
  };

  const canvassing: Canvassing | undefined =
    props.dataInterface?.data?.reference_data;

  if (canvassing) {
    writeWrappedText(
      `\u2022 Dikirim ke ${
        generateResultSearchAddress(canvassing?.address ?? null).name
      }`
    );

    (props.dataInterface.data?.payment_terms ?? []).forEach((element) => {
      writeWrappedText(
        `\u2022 ${element.name} ${
          element.term_of_payment == PaymentTerm.TEMPO
            ? `${element.duration}D`
            : ""
        }`
      );
    });
  }

  if (props.dataInterface?.data?.note) {
    const splits = `${props.dataInterface?.data?.note}`.split("\n");

    splits.forEach((value) => {
      writeWrappedText(`\u2022 ${value ?? "-"}`);
    });
  }

  // ================= SIGNATURE =================

  currentY += 20;

  currentY = checkPageBreak(currentY, 50);

  doc.setFontSize(9);

  doc.text("Best Regards,", 10, currentY);

  currentY += 30;

  if (props.dataInterface?.data?.type === "in") {
    doc.text(props.dataInterface?.data?.owner?.name ?? "", 10, currentY);
  } else {
    doc.text("Stanislaus Adrian Pratama,", 10, currentY);

    currentY += 10;

    doc.text("Operation Manager", 10, currentY);
  }

  // ================= OUTPUT =================

  const blob = doc.output("blob");

  pdfBlob.value = blob;

  pdfUrl.value = URL.createObjectURL(blob);

  return {
    doc,
    blob,
  };
};

const ppnComponent = computed(() => {
  const ppnComponentRef = (
    props.dataInterface.data?.reference_transaction_adjustment || []
  ).find(
    (value) =>
      (value.adjustment || value.adjustments_transaction!).category == "tax" &&
      (
        value.adjustment || value.adjustments_transaction!
      ).name.toLowerCase() === "ppn"
  );
  if (ppnComponentRef) {
    return getPPNFormula(ppnComponentRef!, getDPPNilaiLain.value || 0);
  } else {
    return 0;
  }
});

const grandTotal = computed(() => {
  console.log("subtotal", subtotal.value);
  console.log("getplus", getPlus.value);
  console.log("ppn componen", ppnComponent.value);
  return subtotal.value + getPlus.value + ppnComponent.value;
});
const showTransactionAdjustmentValue = (
  ref: ReferenceTransactionAdjustment
) => {
  if (ref.include) {
    return 0;
  } else {
    if (
      ref.adjustments_transaction?.category == "tax" &&
      ref.adjustments_transaction?.name.toLowerCase() === "ppn"
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
        : displayAmount(ref, subtotal.value || 0);
    }
  }
};

const generateQuotation = async () => {
  const { doc } = await generateQuotationPdf();
  const blob = doc.output("blob");
  pdfUrl.value = URL.createObjectURL(blob);
  showPreviewQuotation.value = true;
};

const downloadPdf = () => {
  if (!pdfBlob.value) {
    ElMessage.warning("Tidak ada PDF untuk di-download");
    return;
  }

  const filename = `Quotation-${
    props.dataInterface?.data?.name || "document"
  }.pdf`;

  // Buat URL object untuk blob
  const url = URL.createObjectURL(pdfBlob.value);

  // Buat anchor element untuk download
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // ElMessage.success('PDF berhasil di-download')
};

const querySearchAsyncInventories = (
  queryString: string,
  cb: (arg: any) => void
) => {
  const query_search: RequestSearch = {
    table: "inventories",
    column: [
      {
        location_id: [props.dataInterface?.data?.location_id],
      },
    ],
    keyword: queryString,
    limit: "20",
    offset: "1",
    sort: null,
  };
  useFetchApi<ResponsePagination<Inventory[]>>(
    "/search",
    "inventories",
    "post",
    query_search
  )
    .then((response) => {
      if (response.status.value == "success") {
        const inventories: Inventory[] = response.data?.value?.data ?? [];

        const results = inventories.map((data: Inventory) => {
          return {
            value: `${data.catalogue.name}-${data.location?.name}`,
            unique_id: data.unique_id,
            object: data,
          };
        });
        cb(results);
      }
    })
    .catch((error: any) => {
      ElMessage.error(`${error.response?.data?.message ?? error}`);
    });
};

// const fetchItem = async () => {
//   try {
//     if (request_search_pricelist_item.value.column.length > 0) {
//       const response = await useApiFetch<ResponsePagination<Pricetag_item[]>>(
//         "/search",
//         {
//           method: "POST",
//           body: request_search_pricelist_item.value,
//         }
//       );

//       if (response.success) {
//         items.value = response;
//       }
//     }
//   } catch (error: any) {
//     ElMessage.error(error?.response?.message ?? error);
//   } finally {
//     itemLoad.value = false;
//   }
// };

watch(
  () => props.dataInterface.data?.unique_id,
  () => {
    request_search_pricelist_item.value.column = [
      {
        tag_id: [props.dataInterface.data?.unique_id],
      },
    ];
  },
  { deep: true }
);

watch(request_search_pricelist_item.value, () => items.refresh(), {
  immediate: true,
});
</script>

<style scoped>
:deep(.image-viewer-slot) {
  height: 30px !important;
}
</style>
