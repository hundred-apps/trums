<template>
  <TrumsWrapper>
    <el-card
      shadow="never"
      class="my-3"
      v-loading="loading"
      element-loading-text="Loading..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      element-loading-background="rgba(122, 122, 122, 0.8)"
    >
      <template #header>
        <div class="card-header flex items-center gap-3" v-if="isMobile">
          <TrumsCustomButton
            v-if="
              canvassingData?.status == CanvassingStatus.DRAFT ||
              canvassingData?.status == CanvassingStatus.CANVASSING
            "
            type="danger"
            :loading="loading"
            :disabled="loading"
            :is-circle="true"
            @click="confirmDelete"
          >
            <el-icon><Delete /></el-icon>
          </TrumsCustomButton>
          <TrumsCustomLinkButton
            v-if="
              canvassingData?.status == CanvassingStatus.DRAFT ||
              canvassingData?.status == CanvassingStatus.CANVASSING
            "
            :url="`/sales/canvassing/add?id=${canvassingData?.unique_id}`"
            :is-circle="true"
            type="default"
            style="margin-left: 0px"
          >
            <el-icon><Edit /></el-icon>
          </TrumsCustomLinkButton>

          <TrumsCustomButton
            v-if="
              canvassingData?.status == CanvassingStatus.DRAFT ||
              canvassingData?.status == CanvassingStatus.CANVASSING
            "
            type="success"
            :loading="loading"
            :disabled="loading"
            @click="() => updateStatus(CanvassingStatus.PENDING_APPROVAL_RAB)"
          >
            Ajukan Approval
          </TrumsCustomButton>
          <TrumsCustomButton
            v-if="
              canvassingData?.status == CanvassingStatus.PENDING_APPROVAL_RAB
            "
            type="default"
            :loading="loading"
            :disabled="loading"
            @click="() => updateStatus(CanvassingStatus.DRAFT)"
          >
            Batalkan Pengajuan
          </TrumsCustomButton>
          <!-- <NuxtLink
            class="el-button el-button--primary"
            :href="`/sales/canvassing/add?id=${canvassingData?.unique_id}&type=copy`"
          >
            Salin Canvassing
          </NuxtLink> -->
        </div>
        <div class="card-header flex justify-end" v-else>
          <el-button
            v-if="
              canvassingData?.status == CanvassingStatus.DRAFT ||
              canvassingData?.status == CanvassingStatus.CANVASSING
            "
            type="danger"
            :icon="Delete"
            @click="confirmDelete"
            >Hapus</el-button
          >
          <NuxtLink
            v-if="
              canvassingData?.status == CanvassingStatus.DRAFT ||
              canvassingData?.status == CanvassingStatus.CANVASSING
            "
            :to="`/sales/canvassing/add?id=${canvassingData?.unique_id}`"
            class="el-button el-button--default"
          >
            <el-icon class="me-2"><Edit /></el-icon> Edit
          </NuxtLink>

          <el-button
            v-if="
              canvassingData?.status == CanvassingStatus.DRAFT ||
              canvassingData?.status == CanvassingStatus.CANVASSING
            "
            type="success"
            @click="() => updateStatus(CanvassingStatus.PENDING_APPROVAL_RAB)"
          >
            Ajukan Approval
          </el-button>
          <el-button
            v-if="
              canvassingData?.status == CanvassingStatus.PENDING_APPROVAL_RAB
            "
            type="default"
            @click="() => updateStatus(CanvassingStatus.DRAFT)"
          >
            Batalkan Pengajuan
          </el-button>
          <!-- <NuxtLink
            class="el-button el-button--primary"
            :href="`/sales/canvassing/add?id=${canvassingData?.unique_id}&type=copy`"
          >
            Salin Canvassing
          </NuxtLink> -->
        </div>
      </template>

      <div class="flex gap-3 my-3">
        <div class="flex-1">
          <el-descriptions title="" :label-width="120" :column="1" size="large">
            <el-descriptions-item label="Canvassing Code">
              {{ canvassingData?.unique_code || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="Source Document">
              {{ canvassingData?.source_document || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="Description">
              {{ canvassingData?.description || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="Status">
              <el-tag
                v-if="canvassingData"
                :type="getStatusTagType(canvassingData.status)"
              >
                {{ formatStatus(canvassingData.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="Catatan">
              {{ canvassingData?.note ?? "" }}
            </el-descriptions-item>
          </el-descriptions>

          <h5 class="font-bold text-black text-1xl mt-6">Lampiran</h5>
          <div v-for="(file, key) in canvassingData?.files" :key="key">
            <NuxtLink
              class="text-blue-600 text-sm"
              :href="`${imageUrl}/${file.image_path}/${file.filename}`"
              target="_blank"
              >{{ file.filename_original }}</NuxtLink
            >
          </div>
        </div>
      </div>
    </el-card>

    <div v-if="canvassingData?.source">
      <el-card class="my-3" shadow="never">
        <template #header>Data Permintaan</template>
        <div :class="`flex ${isMobile ? 'flex-col' : ''} gap-3 my-3`">
          <div class="flex-1">
            <el-descriptions :column="1" :label-width="120" size="large">
              <el-descriptions-item label="Nomor RFQ">
                <NuxtLink
                  class="text-blue-600"
                  :href="`/sales/inquiry/${canvassingData?.source?.unique_id}`"
                  >{{ canvassingData?.source?.unique_code }}</NuxtLink
                >
              </el-descriptions-item>
              <el-descriptions-item label="Tanggal RFQ">
                {{ formatLocalDate(canvassingData?.source?.date!) }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
          <div class="flex-1">
            <el-descriptions :column="1" :label-width="120" size="large">
              <el-descriptions-item label="Diminta Oleh">
                {{ canvassingData?.source?.request_to?.name ?? "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="PIC">
                {{ canvassingData?.source?.request_by?.name ?? "-" }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
        <el-descriptions title="Alamat">
          <el-descriptions-item label="" v-if="canvassingData?.source?.address">
            {{
              `(${canvassingData!.source?.address?.address_name ?? "-"}) ${
                canvassingData!.source?.address?.street
              } ,` + generateAddressViewName(canvassingData!.source!.address!)
            }}
          </el-descriptions-item>
        </el-descriptions>
        <el-descriptions title="Note">
          <el-descriptions-item label="">{{
            canvassingData?.source?.description
          }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>

    <el-card class="mb-3" shadow="never">
      <template #header>
        <div class="card-header">
          <span>Canvassing Items</span>
        </div>
      </template>
      <TrumsDragScrollTable>
        <el-table
          ref="tableRef"
          :data="item_canvassing"
          row-key="index"
          :tree-props="{ children: 'children' }"
          :row-class-name="tableRowClassName"
          :expand-row-keys="getExpandRowKeys ?? []"
          style="width: max-content"
          border
        >
          <el-table-column
            prop="item_name"
            label="Item"
            width="400"
            :fixed="isMobile ? false : `left`"
          >
            <template #default="{ row }">
              <span
                v-if="row.type != 'parent'"
                class="text-blue-600 cursor-pointer"
                @click="() => detailCanvassingVendor(row)"
              >
                {{ row.catalogue_name }}
              </span>
              <span v-else>{{ row.catalogue_name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Image" width="75">
            <template #default="scope">
              <ItemImageUpload
                v-model="scope.row.files"
                :image-url="scope.row.image"
                :show-text="false"
                @open-modal="() => {
                fileList = ((scope.row as CanvassingItemForm).files ?? []).map((data) => data.url ?? '');
                initialIndexImage = 0;
                showPreviewImage = true;
              }"
              />
            </template>
          </el-table-column>
          <el-table-column prop="type_item" label="Item Type" width="150">
            <template #default="{ row }">
              <div v-if="row.type === 'parent'">
                {{ row.type_item == "request" ? "Permintaan" : "Equivalent" }}
              </div>
              <div v-else>
                {{
                  row.type_item == "original"
                    ? "AS Requested"
                    : row.type_item == "quotation"
                    ? "Subtitution"
                    : "Equivalent"
                }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Equivalent Dari" width="300">
            <template #default="{ row }">
              {{
                item_canvassing.find(
                  (value) => value.unique_id == row.equivalent_id
                )?.catalogue_name
              }}
            </template>
          </el-table-column>
          <el-table-column prop="sn" label="SN/PN" width="150">
            <template #default="{ row }">
              {{ row.sn ?? "N/A" }}
            </template>
          </el-table-column>
          <el-table-column prop="qty" label="Qty" width="78">
            <template #default="{ row }">
              {{ row.quantity }}
            </template>
          </el-table-column>
          <el-table-column prop="unit_name" label="UOM" width="100">
            <template #default="{ row }">
              {{ row.unit_name }}
            </template>
          </el-table-column>
          <el-table-column prop="vendor" label="Vendor" width="200">
            <template #default="{ row }">
              {{ row.vendor_name }}
            </template>
          </el-table-column>

          <el-table-column label="Harga" width="200">
            <template #default="{ row }">
              <div v-if="row.type === 'child'">
                {{ currency(row.unit_price) }}
              </div>
            </template>
          </el-table-column>

          <el-table-column label="Subtotal" width="200">
            <template #default="{ row }">
              <div v-if="row.type === 'child'">
                {{ currency(row.quantity * row.unit_price) }}
              </div>
            </template>
          </el-table-column>
        </el-table>
      </TrumsDragScrollTable>
    </el-card>

    <el-dialog
      v-model="visibleApproveDialog"
      title="Approve Canvasing!"
      width="500"
    >
      <el-form :model="canvassingData!" :label-position="formApproveLabel">
        <el-form-item label="Catatan" prop="note">
          <el-input v-model="canvassingData!.note" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="visibleApproveDialog = false">Cancel</el-button>
          <el-button type="primary" @click="submitApprove"> Approve </el-button>
        </div>
      </template>
    </el-dialog>
    <el-image-viewer
      v-if="showPreviewImage"
      show-progress
      :url-list="fileList"
      @close="showPreviewImage = false"
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
    <FeeDrawer
      v-model="drawerFeeVisible"
      :item="selectedItemDrawer"
      :contacts="contactsFeeToEdit"
      :adjustment="adjustmentContact!"
      :readonly="true"
      @save="() => {}"
    />

    <TrumsDialogPriceTagItem
      :data="stateCanvassingVendorDetail?.item"
      :visible="stateCanvassingVendorDetail.visibleModal"
      @on-submit="submitItemModal"
      @on-delete="
        () => {
          // onDeleteList(ruleForm.pricetag_item[itemActive]);
        }
      "
      :with-delete-action="false"
      @on-close="onCloseDetailCanvassingVendor"
    />
  </TrumsWrapper>
</template>

<script lang="ts" setup>
import {
  Delete,
  Edit,
  CircleCheck,
  ArrowDown,
  Operation,
  InfoFilled,
} from "@element-plus/icons-vue";
import {
  CanvassingStatus,
  CanvassingVendorStatus,
} from "~/types/scm/canvasing";
import type {
  Canvassing,
  CanvassingItem,
  CanvassingItemForm,
  CanvassingItemVendorSummery,
  CanvassingVendor,
} from "~/types/scm/canvasing";
import type { BaseResponse } from "~/types/response";
import type { ItemRequest, ItemRequestTrail } from "~/types/item_request";
import type {
  ElTable,
  FormInstance,
  FormProps,
  UploadUserFile,
} from "element-plus";
import {
  FeeType,
  PartyType,
  ReferenceAdjustment,
  type AdjustmentTransaction,
  type ReferenceTransactionAdjustment,
} from "~/types/attribute_adjustment";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import type { Contact } from "~/types/contact";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  OperationPriceTag,
  ReferencePriceTag,
  VariablePriceTag,
  type Pricetag_item,
} from "~/types/pricetag";
import FeeDrawer from "~/components/trums/FeeDrawer.vue";
import type { AppFile } from "~/types/file";
import { currency, formatLocalDate, getFirstFileUrl } from "#imports";
import type { Permission } from "~/types/menu";
import ItemImageUpload from "../../inquiry/components/ItemImageUpload.vue";
import { generateAddressView, generateAddressViewName } from "#imports";
import type { Unit } from "~/types/unit";
import type { ItemSearch } from "~/types/item_search";
import type { Catalogue } from "~/types/catalogue";
import CatalogueAdd from "~/components/trums/CatalogueAdd.vue";
import { TrumsCustomLinkButton } from "#components";

const config = useRuntimeConfig();
const imageUrl = config.public.baseImageURL;
const { isMobile } = useDevice();
const router = useRouter();
const route = useRoute();

const canvassingId = ref<string>(route.params.id as string);

const selectedVendors = ref<Record<string, string>>({});

// Loading animation SVG
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

const loading = ref(false);
const editStateFee = ref<boolean>(false);
const canvassingData = ref<Canvassing | null>(null);
const itemDialogVisible = ref(false);
const selectedItem = ref<CanvassingItem | null>(null);
const visibleApproveDialog = ref<boolean>(false);
const drawerFeeVisible = ref(false);
const formApproveLabel = ref<FormProps["labelPosition"]>("top");
const contactsFee = ref<ReferenceTransactionAdjustment[]>([]);
const itemIndex = ref<string>("");
const selectedItemDrawer = ref<{
  index: string;
  name: string;
  vendor_name: string;
}>({
  index: "",
  name: "",
  vendor_name: "",
});
const contactsFeeToEdit = ref<ReferenceTransactionAdjustment[]>([]);
const selectedChildren = ref<CanvassingItemForm[]>([]);
const showPreview = ref(false);
const showPreviewImage = ref(false);
const tmpCatalogue = ref<Catalogue | null>(null);
const drawerCatalogue = ref<boolean>(false);
const fileList = ref<string[]>([]);
const initialIndexImage = ref<number>(0);

const pdfUrl = ref<string | null>(null);

const feeState = ref<string>("minus");

const item_canvassing = ref<CanvassingItemForm[]>([]);
const stateCanvassingVendorDetail = ref<{
  parent_index: number;
  child_index: number;
  item: Pricetag_item;
  visibleModal: boolean;
}>({
  parent_index: 0,
  child_index: 0,
  item: {
    item_name: undefined,
    unique_id: null,
    tag_id: null,
    catalogue_id: null,
    catalogue: null,
    inventory_id: "",
    inventory: null,
    quantity: 0,
    price: 0,
    displayPrice: undefined,
    readonly: undefined,
    pricetag: undefined,
    sn: undefined,
    checked: undefined,
    is_new: undefined,
    unit_id: null,
    unit_name: null,
    unit_version: null,
    version: undefined,
    fileUploads: [],
    image: undefined,
    files: undefined,
    note: undefined,
    reference: undefined,
    reference_id: undefined,
    data_reference: undefined,
    total_price: undefined,
    display_total_price: undefined,
    reference_transaction: undefined,
    garansi: undefined,
  },
  visibleModal: false,
});

const references = ref<ReferenceTransactionAdjustment[]>([]);

const tableRef = ref<InstanceType<typeof ElTable>>();

const availableStatuses = [
  CanvassingStatus.DRAFT,
  CanvassingStatus.PENDING_APPROVAL,
  CanvassingStatus.CANCEL,
];

interface VendorGroup {
  vendor_id: string;
  vendor_name: string;
  items: CanvassingVendor[];
}

const props = defineProps<{
  canvassingData: Canvassing;
  privilages: Permission[];
  itemHighlights: string[];
}>();

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
>("/search", "search-adjustment", "post", querySearchAdjustmentTransaction);

const adjustmentContact = computed(() => {
  const data = adjustmentTransactions.data.value?.data || [];
  return data.find(
    (value: AdjustmentTransaction) =>
      value.name?.toLowerCase().includes("fee") &&
      value.operator === feeState.value
  );
});

const changeDiscount = (
  vendor: CanvassingItemVendorSummery | null,
  price: number
) => {
  if (vendor) {
    if (vendor.discount_unit == "percent") {
      return `${vendor.discount_value}%`;
    } else {
      return `${(vendor.discount_value / price) * 100}%`;
    }
  } else {
    return 0;
  }
};

const submitCanvassing = async () => {
  loading.value = true;
  try {
    // Membuat FormData
    const formData = new FormData();

    // Menambahkan data utama
    formData.append("unique_id", canvassingData.value!.unique_id || "");

    // Append canvassing_items dengan individual fields
    item_canvassing.value.forEach((item: CanvassingItemForm, i: number) => {
      formData.append(`canvassing_items[${i}][unique_id]`, `${item.unique_id}`);
      formData.append(
        `canvassing_items[${i}][canvassing_id]`,
        `${canvassingData.value!.unique_id}`
      );
      formData.append(`canvassing_items[${i}][quantity]`, `${item.quantity}`);
      formData.append(
        `canvassing_items[${i}][catalogue_id]`,
        `${item.catalogue_id}`
      );
      formData.append(
        `canvassing_items[${i}][catalogue_name]`,
        `${item.catalogue_name}`
      );
      formData.append(`canvassing_items[${i}][unit_id]`, `${item.unit_id}`);
      formData.append(`canvassing_items[${i}][unit_name]`, `${item.unit_name}`);
      formData.append(
        `canvassing_items[${i}][unit_selling_price]`,
        `${item.selling_price}`
      );
      formData.append(`canvassing_items[${i}][type_item]`, `${item.type_item}`);
      formData.append(
        `canvassing_items[${i}][equivalent_id]`,
        `${item.equivalent_id}`
      );

      item.children.forEach((vendor: CanvassingItemForm, j: any) => {
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][unique_id]`,
          `${vendor.unique_id}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][pricetag_item_id]`,
          `${vendor.pricetag_item_id}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][pricetag_item_version]`,
          `${vendor.pricetag_item_version}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][vendor_id]`,
          `${vendor.vendor_id}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][canvassing_item_id]`,
          `${item.unique_id}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][catalogue_id]`,
          `${vendor.catalogue_id}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][catalogue_name]`,
          `${vendor.catalogue_name}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][type_item]`,
          `${vendor.type_item}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][equivalent_id]`,
          `${vendor.equivalent_id}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][quantity]`,
          `${vendor.quantity}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][unit_price]`,
          `${vendor.unit_price}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][selling_price]`,
          `${vendor.selling_price}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][unit_id]`,
          `${vendor.unit_id}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][unit_name]`,
          `${vendor.unit_name}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][total_price]`,
          `${Number(vendor.quantity) * Number(vendor.unit_price)}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][profit]`,
          `${0}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][profit_unit]`,
          `${vendor.profit_unit}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][fee]`,
          `${0}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][fee_unit]`,
          `${vendor.fee_unit}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][ongkir]`,
          `${0}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][ongkir_unit]`,
          `${vendor.ongkir_unit}`
        );

        if (vendor.imageFile) {
          if (vendor.imageFile?.raw) {
            formData.append(
              `canvassing_items[${i}][canvassing_vendor][${j}][files]`,
              vendor.imageFile?.raw as Blob
            );
          }
        }
      });
    });

    const response = await useFetchApi<BaseResponse<Canvassing>>(
      "/canvassing-create",
      "create-canvasing",
      "post",
      formData
    );
    if (response.status.value === "success") {
      console.log("edited");
    }
  } catch (error: any) {
    ElMessage.error(error.response?.message ?? error);
  } finally {
    loading.value = false;
  }
};

const submitItemModal = async (value: Pricetag_item) => {
  loading.value = true;
  try {
    const formData = new FormData();
    formData.append(`unique_id`, `${value.unique_id}`);
    formData.append(`catalogue_id`, `${value.catalogue_id}`);
    formData.append(`catalogue_version`, `${value.catalogue?.version}`);
    formData.append(`inventory_id`, `${value.inventory_id}`);
    formData.append(`price`, `${value.price}`);
    formData.append(`unit_id`, `${value.unit_id}`);
    formData.append(`unit_name`, `${value.unit_name}`);
    formData.append(`unit_version`, `${value.unit_version}`);
    formData.append(`quantity`, `${value.quantity}`);
    formData.append(`note`, `${value.note}`);
    formData.append(`reference`, `${value.reference}`);
    formData.append(`reference_id`, `${value.reference_id}`);
    const response = await useFetchApi<BaseResponse<Pricetag_item>>(
      "/pricetag-item-create",
      "update-pricetag-item",
      "post",
      formData
    );
    if (response.status.value == "success") {
      const pricetagItem: Pricetag_item | null =
        response.data.value?.data ?? null;
      if (pricetagItem) {
        const child: CanvassingItemForm =
          item_canvassing.value[stateCanvassingVendorDetail.value.parent_index]
            .children[stateCanvassingVendorDetail.value.child_index];

        child.unit_price = pricetagItem.price;
        child.total_price = pricetagItem.price * child.quantity;
        child.catalogue_id = pricetagItem.catalogue_id || "";
        child.catalogue_name = pricetagItem.catalogue?.name || "";
        child.unit_id = pricetagItem.unit_id;
        child.unit_name = pricetagItem.unit_name;

        item_canvassing.value[
          stateCanvassingVendorDetail.value.parent_index
        ].children[stateCanvassingVendorDetail.value.child_index] = child;

        await submitCanvassing();

        onCloseDetailCanvassingVendor();
      }
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  } finally {
    loading.value = false;
  }
};

const getPricetagItemDetail = async (
  unique_id: string
): Promise<Pricetag_item | null> => {
  try {
    const res = await useFetchApi<BaseResponse<Pricetag_item>>(
      "/pricetag-item-read/" + unique_id,
      `get-pricetag-item-detail`,
      "post",
      null
    );
    if (res.status.value == "success") {
      return res.data.value?.data ?? null;
    } else {
      return null;
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
    return null;
  }
};

const onCloseDetailCanvassingVendor = () => {
  stateCanvassingVendorDetail.value = {
    child_index: -1,
    parent_index: -1,
    item: {
      item_name: undefined,
      unique_id: null,
      tag_id: null,
      catalogue_id: null,
      catalogue: null,
      inventory_id: "",
      inventory: null,
      quantity: 0,
      price: 0,
      displayPrice: undefined,
      readonly: undefined,
      pricetag: undefined,
      sn: undefined,
      checked: undefined,
      is_new: undefined,
      unit_id: null,
      unit_name: null,
      unit_version: null,
      version: undefined,
      fileUploads: [],
      image: undefined,
      files: undefined,
      note: undefined,
      reference: undefined,
      reference_id: undefined,
      data_reference: undefined,
      total_price: undefined,
      display_total_price: undefined,
      reference_transaction: undefined,
      garansi: undefined,
    },
    visibleModal: false,
  };
};

const detailCanvassingVendor = async (item: CanvassingItemForm) => {
  let pricetag_item: Pricetag_item | null = await getPricetagItemDetail(
    item.pricetag_item_id
  );

  const parent_index = item_canvassing.value.findIndex(
    (value) => value.catalogue_id == item.parent_catalogue_id
  );

  if (pricetag_item) {
    pricetag_item!.item_name = pricetag_item?.catalogue?.name || "";

    (pricetag_item.garansi =
      (pricetag_item.reference_transaction || []).find(
        (find) =>
          find.adjustments_transaction?.name.toLowerCase() == "garansi" &&
          find.adjustments_transaction?.category == "attribute"
      )?.amount || 0),
      (stateCanvassingVendorDetail.value = {
        child_index: item_canvassing.value[parent_index].children.findIndex(
          (child) => child.unique_id == item.unique_id
        ),
        parent_index: parent_index,
        item: pricetag_item,
        visibleModal: true,
      });

    console.log("pricetag item", stateCanvassingVendorDetail.value);
  }
};

const getFile = (files: AppFile[]) => {
  if (files.length > 0) {
    return `${imageUrl}/${files[0].image_path}/${files[0].filename}`;
  } else {
    return "";
  }
};

const selectableCheckbox = (row: CanvassingItemForm, index: number) => {
  return canvassingData.value?.status != CanvassingStatus.PENDING_APPROVAL
    ? true
    : false;
};

const openFeeDrawer = (item: CanvassingItemForm) => {
  itemIndex.value = item.index;
  contactsFeeToEdit.value = item.contacts_fee;

  selectedItemDrawer.value = {
    index: item.index,
    vendor_name: item.vendor_name ?? "",
    name: item.catalogue_name,
  };

  drawerFeeVisible.value = true;
};

const getExpandRowKeys = computed(() => {
  const rowKeys = item_canvassing.value
    .filter((value) => value.children && value.children.length > 0)
    .map((value) => value.index);

  console.log("row keys", rowKeys);
  return rowKeys;
});

const displayAmount = (ref: any, multiplier: number) => {
  console.log("ref", ref);
  if (ref !== undefined) {
    if (ref.type === "percent") {
      return (multiplier || 0) * (ref.amount / 100);
    }
    return ref.amount;
  } else {
    return 0;
  }
};

const displayPercentage = (ref: any, multiplier: number) => {
  if (ref.type === "amount") {
    return ref.amount / multiplier || 0 * 100;
  }
  return ref.amount;
};

const onChangeFeeState = (val: string) => {
  // contactsFee.value.forEach((value) => {
  //   value.amount = 0;
  //   value.type = val == 'plus' ? FeeType.AMOUNT : FeeType.PERCENT;
  // })

  // item_canvassing.value.forEach((value) => {
  //   value.children.forEach(child => {
  //     child.contacts_fee.forEach((fee) => fee.amount = 0);
  //     calculateSellingPrice(child)
  //     child.fee = 0;
  //   });

  //   value.fee = 0;
  // })

  // unitFee.value = val == 'plus' ? FeeType.AMOUNT : FeeType.PERCENT;

  console.log(contactsFee.value);
};

const removeContact = (index: number) => {
  contactsFee.value.splice(index, 1);
};

const addContact = () => {
  contactsFee.value.push({
    unique_id: "",
    reference: ReferenceAdjustment.CANVASSING,
    reference_id: "",
    adjustment_id: `${adjustmentContact.value?.unique_id}`,
    adjustment: adjustmentContact.value,
    value: null,
    type: FeeType.PERCENT,
    amount: 0,
    created_at: 0,
    changeType: true,
    party: {
      id: 0,
      unique_id: "",
      unique_code: "",
      is_personal: false,
      is_company: false,
      internal_id: "",
      name: "",
      email: "",
      phone: "",
      tax_id: "",
      website: "",
      title: "",
      tags: "",
      created_at: 0,
      created_by: "",
      updated_at: 0,
      version: 0,
      address: [],
    },
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

const generateQuotationPdf = async (items: CanvassingItem[]) => {
  const doc = new jsPDF();
  const today = new Date();
  const formatted = today.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Logo
  const imgLogo = await getBase64ImageFromUrl("/images/trumecs-logo.png"); // path logo (public/logo.png)
  const tmsLogo = await getBase64ImageFromUrl("/images/tms-logo.png"); // path logo (public/logo.png)
  doc.addImage(imgLogo, "PNG", 160, 10, 40, 20);
  doc.addImage(tmsLogo, "PNG", 10, 10, 40, 20);

  // Header
  doc.setFontSize(18);
  doc.text("Quotation", 105, 20, { align: "center" });

  // Info
  doc.setFontSize(11);
  doc.text(`Number: ${canvassingData.value?.unique_code}`, 10, 40);
  doc.text(`Subject: -`, 10, 46);
  doc.text(`Jakarta, ${formatted}`, 160, 40);

  doc.text(`To: ${canvassingData.value?.source?.request_by?.name}`, 10, 60);
  doc.text(`PIC: ${canvassingData.value?.source?.request_by?.name}`, 10, 66);

  // Body text
  doc.text("Bersama ini kami kirimkan penawaran sebagai berikut:", 10, 80);

  // Table
  autoTable(doc, {
    startY: 90,
    head: [["No", "Item", "Qty", "Unit", "Price", "Total"]],
    body: items.map((item: CanvassingItem, i: number) => [
      i + 1,
      item.catalogue?.name ?? "",
      item.quantity,
      item.unit_name,
      `${currency(item.unit_selling_price || 0)}`,
      `${currency(item.quantity * (item.unit_selling_price || 0))}`,
    ]),
    styles: { fontSize: 10 },
    margin: { left: 10 },
    headStyles: { fillColor: [200, 200, 200] },
  });

  // // Summary
  let finalY = (doc as any).lastAutoTable.finalY + 10;
  // doc.text(`Total Price: Rp ${currency(grandTotal.value)}`, 140, finalY)

  // finalY += 10
  // doc.text(`Grand Total: Rp ${currency(grandTotal.value)}`, 140, finalY)

  // Notes
  doc.text("Notes:", 10, finalY + 20);
  doc.text(`${canvassingData.value?.description ?? "-"}`, 20, finalY + 30);

  // Signature
  doc.text("Best Regards,", 10, finalY + 60);
  doc.text("Stanislaus Adrian Pratama,", 10, finalY + 90);
  doc.text("Operation Manager", 10, finalY + 100);

  return doc;
};

const handleProfitUnitChange = (row: CanvassingItemForm) => {
  const cost = Number(row.unit_price) || 0;
  let profit = Number(row.profit) || 0;

  if (row.profit_unit === "percent") {
    // sebelumnya dalam nominal → ubah ke persen
    row.profit = cost > 0 ? (profit / cost) * 100 : 0;
  } else if (row.profit_unit === "amount") {
    // sebelumnya dalam persen → ubah ke nominal
    row.profit = cost * (profit / 100);
  }
};

const grandTotal = computed(() => {
  return item_canvassing.value.reduce((acc, row: CanvassingItemForm) => {
    if (row.type === "parent") {
      acc += Number(row.total_price || 0);
    }

    return acc;
  }, 0);
});
const totalBuyingPrice = computed(() => {
  let total = 0;

  item_canvassing.value.forEach((element) => {
    if (element.children.length > 0) {
      let dataMin = element.children.reduce((max, data) =>
        data.total_price < max.total_price ? data : max
      );

      total += Number(dataMin.total_price);
    }
  });

  return total;
});

const totalBuyingPriceMin = computed(() => {
  let total = 0;

  item_canvassing.value.forEach((element) => {
    if (element.children.length > 0) {
      let dataMin = element.children.reduce((max, data) =>
        data.unit_price > max.unit_price ? data : max
      );

      total += Number(dataMin.unit_price) * Number(element.quantity);
    }
  });

  return total;
});

const adjustmentTransactionFeeTotal = computed(() => {
  const filter = canvassingData.value?.reference_transaction?.filter(
    (value) => value.adjustments_transaction?.name.toLowerCase() == "fee"
  );

  if (filter) {
    return {
      ...filter[0],
      amount: filter?.reduce(
        (sum, item) => Number(sum) + Number(item.amount),
        0
      ),
    };
  }
});
const adjustmentTransactionOngkirTotal = computed(() => {
  return canvassingData.value?.reference_transaction?.find(
    (value) =>
      value.adjustments_transaction?.name.toLowerCase() == "ongkos kirim"
  );
});

const netProfitForBuying = computed(() => {
  let fee = 0;

  console.log("gross profit", grandTotal.value);

  if (adjustmentTransactionFeeTotal.value) {
    if (adjustmentTransactionFeeTotal.value.type == FeeType.AMOUNT) {
      fee = adjustmentTransactionFeeTotal.value.amount;
    } else if (adjustmentTransactionFeeTotal.value.type == FeeType.PERCENT) {
      fee =
        (grandTotal.value * adjustmentTransactionFeeTotal.value.amount) / 100;
    }
  }

  console.log("fee", fee);
  return Number(totalForGrossProfitForBuying.value || 0) - Number(fee || 0);
});

const getAnotherFee = computed(() => {
  return canvassingData.value?.reference_transaction?.filter(
    (value) =>
      value.adjustments_transaction?.name.toLowerCase() != "fee" &&
      value.adjustments_transaction?.name.toLowerCase() != "ongkos kirim"
  );
});

const grossProfit = computed(() => {
  return Number(grandTotal.value) - Number(totalBuyingPrice.value);
});

const totalForGrossProfitForBuyingMin = computed(() => {
  let gross = Number(grossProfitMin.value);

  gross -= Number(adjustmentTransactionOngkirTotal.value?.amount ?? 0);

  references.value.forEach((element) => {
    if (element.type === FeeType.PERCENT) {
      gross -= (element.amount / totalBuyingPriceMin.value) * 100;
    } else {
      gross -= element.amount;
    }
  });

  return gross;
});

const netProfitForBuyingMin = computed(() => {
  if (adjustmentTransactionFeeTotal.value) {
    let fee = 0;

    if (adjustmentTransactionFeeTotal.value.type == FeeType.AMOUNT) {
      fee = adjustmentTransactionFeeTotal.value.amount;
    } else if (adjustmentTransactionFeeTotal.value.type == FeeType.PERCENT) {
      fee =
        (grandTotal.value * adjustmentTransactionFeeTotal.value.amount) / 100;
    }
    return (
      Number(totalForGrossProfitForBuyingMin.value || 0) - Number(fee || 0)
    );
  } else {
    return Number(totalForGrossProfitForBuyingMin.value || 0) - Number(0);
  }
});
const grossProfitMin = computed(() => {
  return Number(grandTotal.value) - Number(totalBuyingPriceMin.value);
});

const totalForGrossProfitForBuying = computed(() => {
  let gross = Number(grossProfit.value);

  if (adjustmentTransactionOngkirTotal.value) {
    gross -= Number(adjustmentTransactionOngkirTotal.value.amount);
  }

  console.log("gross profit value", grossProfit.value);
  console.log("ongkir value", adjustmentTransactionOngkirTotal.value?.amount);

  if (getAnotherFee.value) {
    getAnotherFee.value.forEach((element) => {
      if (element.type === FeeType.PERCENT) {
        gross -= (element.amount / totalBuyingPrice.value) * 100;
      } else {
        gross -= element.amount;
      }
    });
  }

  return gross;
});

const goBack = () => router.back();

const setProfit = (row: CanvassingItemForm) => {
  const selling_price = Number(row.selling_price || 0);

  if (row.type == "parent") {
    row.children.forEach((child) => {
      const hargaBeli = Number(child.unit_price || 0);

      let ongkirNominal =
        child.ongkir_unit === "percent"
          ? (hargaBeli * child.ongkir) / 100
          : Number(child.ongkir) || 0;

      const selisih = selling_price - hargaBeli - ongkirNominal;

      // ganti 100
      let profit = 100;
      let fee = 0;

      if (child.fee_unit == "percent") {
        fee = Number(child.fee);
      } else {
        fee = (Number(child.fee) / hargaBeli) * 100;
      }

      if (child.profit_unit == "amount") {
        profit = (Number(child.profit) / hargaBeli) * 100;
      }

      let profitAndFee = profit + fee;

      child.fee = fee;
      child.fee_nominal =
        (selisih * fee) / profitAndFee < 0 ? 0 : (selisih * fee) / profitAndFee;

      child.profit_nominal =
        ((selisih < 0 ? 0 : selisih) * profit) / profitAndFee;

      child.profit = Number(
        ((child.profit_nominal / hargaBeli) * 100).toFixed(2)
      );
    });
  }
};

const summeryData = computed(() => {
  const tableData: any[] = [
    {
      label: "Total Harga Jual",
      max: currency(grandTotal.value),
      beli: "",
      jual: "",
      min: currency(grandTotal.value),
      beliMin: "",
      jualMin: "",
    },
    {
      label: "Total Harga Beli",
      max: currency(totalBuyingPrice.value),
      beli: "",
      jual: "",
      min: currency(totalBuyingPriceMin.value),
      beliMin: "",
      jualMin: "",
    },
    {
      label: "Total",
      max: currency(grossProfit.value),
      beli: `${safePercent(grossProfit.value, totalBuyingPrice.value)} %`,
      jual: `${
        grandTotal.value == 0
          ? 0
          : safePercent(grossProfit.value, grandTotal.value)
      } %`,
      min: currency(grossProfitMin.value),
      beliMin: `${safePercent(grossProfit.value, totalBuyingPriceMin.value)} %`,
      jualMin: `${
        grandTotal.value == 0
          ? 0
          : safePercent(grossProfitMin.value, grandTotal.value)
      } %`,
    },
    {
      label: "Ongkos Kirim",
      max: currency(adjustmentTransactionOngkirTotal.value?.amount ?? 0),
      beli: `${safePercent(
        adjustmentTransactionOngkirTotal.value?.amount ?? 0,
        totalBuyingPrice.value
      )} %`,
      jual: `${safePercent(
        adjustmentTransactionOngkirTotal.value?.amount ?? 0,
        grandTotal.value
      )} %`,
      min: currency(adjustmentTransactionOngkirTotal.value?.amount ?? 0),
      beliMin: `${safePercent(
        adjustmentTransactionOngkirTotal.value?.amount ?? 0,
        totalBuyingPriceMin.value
      )} %`,
      jualMax: `${safePercent(
        adjustmentTransactionOngkirTotal.value?.amount ?? 0,
        grandTotal.value
      )} %`,
    },
  ];

  references.value.forEach((element) => {
    tableData.push({
      label: element.adjustments_transaction?.name ?? "-",
      max: currency(displayAmount(element, totalBuyingPrice.value)),
      beli: `${safePercent(
        displayPercentage(element, totalBuyingPrice.value),
        1
      )}`,
      jual: `${safePercent(displayPercentage(element, grandTotal.value), 1)}`,
      min: currency(displayAmount(element, totalBuyingPriceMin.value)),
      beliMin: `${safePercent(
        displayPercentage(element, totalBuyingPriceMin.value),
        1
      )}`,
      jualMin: `${safePercent(
        displayPercentage(element, grandTotal.value),
        1
      )}`,
    });
  });

  tableData.push(
    {
      label: adjustmentTransactionFeeTotal.value?.adjustments_transaction?.name,
      max: currency(
        displayAmount(adjustmentTransactionFeeTotal.value, grandTotal.value)
      ),
      beli: `${
        adjustmentTransactionFeeTotal.value?.type == FeeType.PERCENT
          ? adjustmentTransactionFeeTotal.value?.amount
          : safePercent(
              adjustmentTransactionFeeTotal.value?.amount,
              totalBuyingPrice.value
            )
      } %`,
      jual: `${
        adjustmentTransactionFeeTotal.value?.type == FeeType.PERCENT
          ? adjustmentTransactionFeeTotal.value?.amount
          : safePercent(
              adjustmentTransactionFeeTotal.value?.amount,
              grandTotal.value
            )
      } %`,
      min: currency(
        displayAmount(adjustmentTransactionFeeTotal.value, grandTotal.value)
      ),
      beliMin: `${
        adjustmentTransactionFeeTotal.value?.type == FeeType.PERCENT
          ? adjustmentTransactionFeeTotal.value?.amount
          : safePercent(
              adjustmentTransactionFeeTotal.value?.amount,
              totalBuyingPriceMin.value
            )
      } %`,
      jualMin: `${
        adjustmentTransactionFeeTotal.value?.type == FeeType.PERCENT
          ? adjustmentTransactionFeeTotal.value?.amount
          : safePercent(
              adjustmentTransactionFeeTotal.value?.amount,
              grandTotal.value
            )
      } %`,
    },

    {
      label: "Net Profit",
      max: currency(netProfitForBuying.value),
      beli: `${safePercent(
        netProfitForBuying.value,
        totalBuyingPrice.value
      )} %`,
      jual: `${safePercent(netProfitForBuying.value, grandTotal.value)} %`,
      min: currency(netProfitForBuyingMin.value),
      beliMin: `${safePercent(
        netProfitForBuying.value,
        totalBuyingPriceMin.value
      )} %`,
      jualMin: `${safePercent(netProfitForBuying.value, grandTotal.value)} %`,
    }
  );

  return tableData;
});

const tableRowClassName = ({
  row,
  rowIndex,
}: {
  row: CanvassingItemForm;
  rowIndex: number;
}) => {
  if (row.checked == true) {
    return "success-row";
  }

  // row.children.forEach(child => {
  //   child..forEach(element => {
  //     if(row.children)
  //   });
  // });

  // console.log(props.itemHighlights.includes(row.catalogue_id!));

  if (props.itemHighlights.includes(row.catalogue_id!)) {
    return "primary-row";
  }

  return "";
};

const disableButtonApprove = computed(() => {
  return Object.values(selectedVendors.value).every((v) => v !== "");
});
const getSelectedVendorId = (itemId: string) => {
  return selectedVendors.value[itemId] || "";
};

const vendorGrouped = computed<VendorGroup[]>(() => {
  if (!canvassingData.value) return [];
  return groupByVendor(canvassingData.value);
});

const flattenedData = computed(() => {
  if (!canvassingData.value) return [];
  const rows: any[] = [];
  canvassingData.value.canvassing_item.forEach((item) => {
    if (item.canvassing_vendor && item.canvassing_vendor.length > 0) {
      item.canvassing_vendor.forEach((vendor, index) => {
        rows.push({
          item,
          vendor,
          _first: index === 0, // tanda baris pertama untuk rowspan
        });
      });
    } else {
      // kalau tidak ada vendor, tetap push row dummy
      rows.push({
        item,
        vendor: null,
        _first: true,
      });
    }
  });
  console.log(rows);
  return rows;
});

const groupByVendor = (data: Canvassing): VendorGroup[] => {
  const vendorMap: Record<string, VendorGroup> = {};

  console.log(data);
  data.canvassing_item.forEach((item: CanvassingItem) => {
    const itemReq: ItemRequestTrail = item.item_request_trail!;

    item.canvassing_vendor.forEach((vendor: CanvassingVendor) => {
      const vendorItem: CanvassingVendor = vendor;

      if (!vendorMap[vendor.vendor_id!]) {
        vendorMap[vendor.vendor_id!] = {
          vendor_id: vendor.vendor_id ?? "",
          vendor_name: vendor.vendor?.name ?? "",
          items: [],
        };
      }

      vendorMap[vendor.vendor_id!].items.push(vendorItem);
    });
  });

  return Object.values(vendorMap);
};

function calculateMargin(row: CanvassingItemForm) {
  // let sellingPrice = row.item.selling_price;
  let sellingPrice = row.selling_price;
  let unit_price = row.unit_price;

  return ((sellingPrice - unit_price) / unit_price) * 100;
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatStatus = (status: CanvassingStatus) => {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatVendorStatus = (status: CanvassingVendorStatus) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const isRowSelected = (
  selection: CanvassingItemForm[],
  row: CanvassingItemForm
): boolean => {
  return selection.some((selected) => selected.index === row.index);
};

watch(
  () => item_canvassing.value,
  () => {
    item_canvassing.value.forEach((element) => {
      const findCanvassingItem = (
        canvassingData.value?.canvassing_item ?? []
      ).findIndex((item) => item.unique_id == element.unique_id);
      element.children.forEach((child) => {
        if (findCanvassingItem >= 0) {
          const vendorIndex = (
            canvassingData.value?.canvassing_item[findCanvassingItem]
              .canvassing_vendor ?? []
          ).findIndex((v) => v.unique_id == child.unique_id);

          if (vendorIndex >= 0) {
            if (child.checked == true) {
              canvassingData.value!.canvassing_item[
                findCanvassingItem
              ].canvassing_vendor[vendorIndex].status =
                CanvassingVendorStatus.SELECTED;
            } else {
              canvassingData.value!.canvassing_item[
                findCanvassingItem
              ].canvassing_vendor[vendorIndex].status =
                CanvassingVendorStatus.SUBMITTED;
            }
          }
        }
      });
    });
    updateSelectedChildrenFromChecked();
    updateTableSelection();
  },
  { deep: true }
);

const handleSelect = (
  selection: CanvassingItemForm[],
  row: CanvassingItemForm
): void => {
  const isSelected = selection.some((selected) => selected.index === row.index);

  if (row.type === "parent") {
    // Parent di-check/uncheck → update semua children
    if (isSelected) {
      // Check parent dan semua children
      row.checked = true;
      row.children?.forEach((child) => {
        child.checked = true;
      });
    } else {
      // Uncheck parent dan semua children
      row.checked = false;
      row.children?.forEach((child) => {
        child.checked = false;
      });
    }
  } else {
    // Child di-check/uncheck → update child saja
    row.checked = isSelected;

    // Update parent state berdasarkan children
    updateParentCheckedState(row);
  }

  // Update selectedChildren array berdasarkan checked state
  updateSelectedChildrenFromChecked();
};

const updateParentCheckedState = (changedChild?: CanvassingItemForm): void => {
  item_canvassing.value.forEach((parent) => {
    if (parent.children) {
      const allChildren = parent.children;
      const checkedChildrenCount = allChildren.filter(
        (child) => child.checked
      ).length;

      if (checkedChildrenCount === allChildren.length) {
        // Semua children checked → parent fully checked
        parent.checked = true;
      } else if (checkedChildrenCount > 0) {
        // Beberapa children checked → parent indeterminate
        parent.checked = false; // Tapi visually Element Plus akan handle indeterminate
      } else {
        // Tidak ada children checked → parent unchecked
        parent.checked = false;
      }
    }
  });
};

const updateSelectedChildrenFromChecked = (): void => {
  selectedChildren.value = [];

  item_canvassing.value.forEach((parent) => {
    if (parent.children) {
      parent.children.forEach((child) => {
        if (child.checked) {
          selectedChildren.value.push(child);
        }
      });
    }
  });
};

const updateTableSelection = (): void => {
  nextTick(() => {
    if (!tableRef.value) return;

    // Clear semua selection
    tableRef.value.clearSelection();

    // Set selection berdasarkan checked state
    item_canvassing.value.forEach((parent) => {
      if (parent.checked) {
        tableRef.value!.toggleRowSelection(parent, true);
      }

      parent.children?.forEach((child) => {
        if (child.checked) {
          tableRef.value!.toggleRowSelection(child, true);
        }
      });
    });
  });
};

const updateParentSelectionState = (
  changedChild?: CanvassingItemForm
): void => {
  console.log("🔄 updateParentSelectionState called");

  nextTick(() => {
    console.log("⏰ nextTick executed");
    if (!tableRef.value) {
      console.log("❌ tableRef is null");
      return;
    }

    console.log("Updating parent selection state...");

    // JANGAN clearSelection() di sini!
    // tableRef.value.clearSelection() ← HAPUS JIKA ADA

    // Hanya update parent states, jangan sentuh child selections
    item_canvassing.value.forEach((parent) => {
      if (parent.children) {
        const selectedCount = parent.children.filter((child) =>
          selectedChildren.value.some(
            (selected) => selected.index === child.index
          )
        ).length;

        console.log(
          `Parent ${parent.index}: ${selectedCount}/${parent.children.length} children selected`
        );

        if (selectedCount === parent.children.length) {
          // All children selected → check parent
          tableRef.value!.toggleRowSelection(parent, true);
        } else if (selectedCount > 0) {
          // Some children selected → indeterminate (uncheck visually)
          tableRef.value!.toggleRowSelection(parent, false);
        } else {
          // No children selected → uncheck parent
          tableRef.value!.toggleRowSelection(parent, false);
        }
      }
    });
  });
};

const selectAllChildren = (parentRow: CanvassingItemForm): void => {
  if (parentRow.children) {
    parentRow.children.forEach((child) => {
      // Tambah ke selectedChildren jika belum ada
      if (
        !selectedChildren.value.find(
          (selected) => selected.index === child.index
        )
      ) {
        selectedChildren.value.push(child);
      }
    });
    updateTableSelection();
  }
};

const unselectAllChildren = (parentRow: CanvassingItemForm): void => {
  if (parentRow.children) {
    parentRow.children.forEach((child) => {
      // Hapus dari selectedChildren
      const index = selectedChildren.value.findIndex(
        (selected) => selected.index === child.index
      );
      if (index !== -1) {
        selectedChildren.value.splice(index, 1);
      }
    });
    updateTableSelection();
  }
};

const findRowById = (id: string): CanvassingItemForm | null => {
  const findRecursive = (
    items: CanvassingItemForm[]
  ): CanvassingItemForm | null => {
    for (const item of items) {
      if (item.index === id) return item; // ← Cari by ID
      if (item.children) {
        const found = findRecursive(item.children);
        if (found) return found;
      }
    }
    return null;
  };

  return findRecursive(item_canvassing.value);
};

const handleSelectAll = (selection: CanvassingItemForm[]): void => {
  if (selection.length === 0) {
    // Unselect all
    selectedChildren.value = [];
  } else {
    // Select all children
    selectedChildren.value = [];
    item_canvassing.value.forEach((parent) => {
      if (parent.children) {
        parent.children.forEach((child) => {
          if (
            !selectedChildren.value.find((selected) => selected.sn === child.sn)
          ) {
            selectedChildren.value.push(child);
          }
        });
      }
    });
  }
};

const getStatusTagType = (
  status: CanvassingStatus
): "success" | "info" | "danger" | "warning" | "primary" => {
  switch (status) {
    case CanvassingStatus.DRAFT:
      return "info";
    case CanvassingStatus.PENDING_APPROVAL:
      return "warning";
    case CanvassingStatus.CANCEL:
      return "danger";
    default:
      return "primary";
  }
};

const getVendorStatusTagType = (
  status: CanvassingVendorStatus
): "success" | "info" | "danger" | "warning" | "primary" => {
  switch (status) {
    case CanvassingVendorStatus.SUBMITTED:
      return "info";
    case CanvassingVendorStatus.SELECTED:
      return "success";
    case CanvassingVendorStatus.REJECTED:
      return "danger";
    default:
      return "primary";
  }
};

const initializeSelectedVendors = () => {
  if (!canvassingData.value) return;

  canvassingData.value.canvassing_item.forEach((item) => {
    selectedVendors.value[item.unique_id] = "";
  });

  canvassingData.value.canvassing_item.forEach((item) => {
    if (item.canvassing_vendor) {
      const selectedVendor = item.canvassing_vendor.find(
        (vendor) => vendor.status === CanvassingVendorStatus.SELECTED
      );

      if (selectedVendor) {
        selectedVendors.value[item.unique_id] = selectedVendor.unique_id!;
      }
    }
  });
};

const canUpdateStatus = (newStatus: CanvassingStatus): boolean => {
  if (!canvassingData.value) return false;

  const currentStatus = canvassingData.value.status;

  // Define allowed status transitions
  const allowedTransitions: any = {
    [CanvassingStatus.DRAFT]: [
      CanvassingStatus.PENDING_APPROVAL,
      CanvassingStatus.CANCEL,
    ],
    [CanvassingStatus.PENDING_APPROVAL]: [CanvassingStatus.CANCEL],
    [CanvassingStatus.CANCEL]: [CanvassingStatus.DRAFT],
  };

  return allowedTransitions[currentStatus]?.includes(newStatus) || false;
};

// Actions
const updateStatus = async (status: CanvassingStatus) => {
  if (!canvassingData.value) return;

  loading.value = true;
  try {
    const formData = new FormData();
    formData.append("unique_id", canvassingData.value.unique_id || "");
    formData.append("status", status);
    formData.append("note", canvassingData.value.note ?? "");

    const response = await useFetchApi<BaseResponse<Canvassing>>(
      "/canvassing-create",
      "update-canvassing-status",
      "post",
      formData
    );

    if (response.status.value == "success") {
      canvassingData.value.status = status;

      if (status === CanvassingStatus.DONE) {
        const owner = await getContacts();

        if (owner == null) {
          return ElMessage.error(`Gagal Mengambil Kontak!`);
        }

        const items: any[] = [];
        const itemsVendor: CanvassingVendor[] = [];

        (canvassingData.value?.canvassing_item ?? []).forEach((element) => {
          (element.canvassing_vendor ?? []).forEach((vendor) => {
            items.push({
              unique_id: null,
              tag_id: null,
              catalogue_id: vendor.catalogue_id,
              inventory_id: null,
              price: parseInt(`${vendor.selling_price}`),
              unit_id: vendor.unit_id,
              unit_name: vendor.unit_name,
              reference: ReferencePriceTag.CANVASING_VENDOR,
              reference_id: vendor.unique_id,
            });
            itemsVendor.push(vendor);
          });
        });

        var data_price_tag = {
          name: `Penawaran ${canvassingData.value?.source?.request_by?.name}`,
          start_date: canvassingData.value?.source?.date,
          owner_id: owner.unique_id,
          pricetag_item: items,
          condition: [
            {
              operation: "is_equal",
              variable: VariablePriceTag.KONTAK,
              unique_id: null,
              value: canvassingData.value?.source?.request_by?.unique_id,
            },
          ],
        };

        await createQuotationPrice(data_price_tag);
      }

      ElMessage.success("Canvassing status updated");
    }
  } catch (error) {
    ElMessage.error("Failed to update status");
    console.error(error);
  } finally {
    loading.value = false;
  }
};
const createQuotationPrice = async (data: any) => {
  loading.value = true;
  try {
    const response = await useFetchApi(
      "/pricetag-create",
      "pricelist-create",
      "post",
      data
    );

    if (response.status.value == "success") {
      ElMessage.success("Berhasil");
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message ?? error);
  } finally {
    loading.value = false;
  }
};

const submitForApproval = async () => {
  await updateStatus(CanvassingStatus.PENDING_APPROVAL);
};
const approve = async () => {
  visibleApproveDialog.value = true;
};

const submitApprove = async () => {
  //   canvassingData.value?.canvassing_item.forEach(element => {
  //     const valueSelected = selectedVendors.value[element.unique_id];

  //     element.canvassing_vendor.forEach(element => {
  //       if(element.unique_id === valueSelected){
  //         element.status = CanvassingVendorStatus.SELECTED;
  //       }
  //     });
  //   });

  await updateStatus(CanvassingStatus.DONE);

  visibleApproveDialog.value = false;
};

const viewItemDetails = (item: CanvassingItem) => {
  selectedItem.value = item;
  itemDialogVisible.value = true;
};

const selectVendor = async (item: CanvassingItem, vendor: CanvassingVendor) => {
  if (!selectedItem.value) return;

  try {
    console.log(vendor);
    // const formData = new FormData()
    // formData.append("canvassing_vendor_id", vendor.unique_id || '')
    // formData.append("status", CanvassingVendorStatus.SELECTED)

    // const response = await useFetchApi<BaseResponse<any>>(
    //   '/canvassing/select-vendor',
    //   'select-vendor',
    //   'post',
    //   formData
    // )

    // if(response.status.value == 'success'){
    //   ElMessage.success('Vendor selected')
    //   // Update local data
    //   if (selectedItem.value.canvassing_vendor) {
    //     selectedItem.value.canvassing_vendor = selectedItem.value.canvassing_vendor.map((v: any) => {
    //       if (v.unique_id === vendor.unique_id) {
    //         return { ...v, status: CanvassingVendorStatus.SELECTED }
    //       } else if (v.status === CanvassingVendorStatus.SELECTED) {
    //         return { ...v, status: CanvassingVendorStatus.SUBMITTED }
    //       }
    //       return v
    //     })
    //   }
    // }
  } catch (error) {
    ElMessage.error("Failed to select vendor");
    console.error(error);
  }
};

const confirmDelete = () => {
  ElMessageBox.confirm(
    "This will permanently delete the canvassing. Continue?",
    "Warning",
    {
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      type: "warning",
    }
  )
    .then(async () => {
      await deleteCanvassing();
    })
    .catch(() => {
      // Cancel
    });
};

const deleteCanvassing = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<any>>(
      `/canvassing-delete`,
      "delete-canvassing",
      "post",
      [canvassingId.value]
    );

    if (response.status.value == "success") {
      ElMessage.success("Canvassing deleted");
      router.push("/sales/canvassing");
    }
  } catch (error) {
    ElMessage.error("Failed to delete canvassing");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const getContacts = async (): Promise<Contact | null> => {
  try {
    const request_search: RequestSearch = {
      keyword: "",
      table: "contacts",
      column: [
        {
          ownership: [true],
        },
      ],
      sort: null,
      offset: "1",
      limit: "10",
    };
    const response = await useFetchApi<ResponsePagination<Contact[]>>(
      "/search",
      "get-contacts",
      "post",
      request_search
    );
    if (response.status.value == "success") {
      return response.data.value?.data[0] ?? null;
    } else {
      return null;
    }
  } catch (error: any) {
    return null;
  }
};

const generateQuotation = async () => {
  const items: any[] = [];
  const itemsVendor: CanvassingVendor[] = [];

  (canvassingData.value?.canvassing_item ?? []).forEach((element) => {
    (element.canvassing_vendor ?? []).forEach((vendor) => {
      items.push({
        unique_id: null,
        tag_id: null,
        catalogue_id: vendor.catalogue_id,
        inventory_id: null,
        price: parseInt(`${vendor.selling_price}`),
        unit_id: vendor.unit_id,
        unit_name: vendor.unit_name,
      });
      itemsVendor.push(vendor);
    });
  });

  // const response = await useFetchApi('/pricetag-create', 'pricelist-create', 'post', data_price_tag);

  // if(response.status.value == 'success'){
  //   ElMessage.success("Berhasil");
  //   formEl.resetFields();
  // }

  const doc = await generateQuotationPdf(
    canvassingData.value?.canvassing_item ?? []
  );
  const blob = doc.output("blob");
  pdfUrl.value = URL.createObjectURL(blob);
  showPreview.value = true;
};

const initialCanvassing = (data: Canvassing) => {
  canvassingData.value = data;
  contactsFee.value = [];
  (data.reference_transaction ?? []).forEach((element) => {
    if (element.party_type == PartyType.CONTACT) {
      contactsFee.value.push(element);
    }
    if (
      (element.adjustments_transaction?.name ?? "").toLowerCase() !== "fee" &&
      (element.adjustments_transaction?.name ?? "").toLowerCase() !==
        "ongkos kirim"
    ) {
      references.value.push(element);
    }
  });

  (data.canvassing_item ?? []).forEach((element) => {
    if (element.type_item !== "equivalent") {
      fileList.value.push(getFile(element.files ?? []));
      element.canvassing_vendor
        .map((child) => getFile(child.files ?? []))
        .forEach((element) => {
          fileList.value.push(element);
        });

      console.log("item canvassing", element);

      item_canvassing.value.push({
        index: `${element.unique_id}`,
        canvassing_id: element.canvassing_id,
        canvaasing_version: element.canvaasing_version,
        item_request_trail_version: element.item_request_trail_version,
        item_request_trail_id: element.item_request_trail_id,
        unique_id: element.unique_id,
        vendor_id: null,
        vendor_name: "",
        unit_id: element.unit_id,
        unit_name: element.unit_name,
        unit_version: null,
        offer_item_id: null,
        offer_item_version: 0,
        catalogue_id: element.catalogue_id ?? "",
        parent_catalogue_id: "",
        catalogue_name: element.catalogue_name ?? "",
        sn: element.catalogue?.sn ?? "N/A",
        quantity: element.quantity ?? 1,
        unit_price: 0,
        total_price:
          Number(element.unit_selling_price) * Number(element.quantity),
        status: CanvassingVendorStatus.SUBMITTED,
        taxes: [],
        editing: null,
        type: "parent",
        type_item: element.type_item,
        equivalent_id: element.equivalent_id,
        children: element.canvassing_vendor.map((child) => ({
          type_item: child.type_item,
          image: getFirstFileUrl(child.files ?? []),
          equivalent_id: child.equivalent_id,
          index: `${child.unique_id}`,
          canvassing_id: null,
          canvaasing_version: null,
          item_request_trail_version: null,
          item_request_trail_id: null,
          unique_id: child.unique_id,
          vendor_id: child.vendor_id ?? "",
          vendor_name: child.vendor?.name ?? "",
          unit_id: child.unit_id,
          unit_name: child.unit_name,
          unit_version: null,
          offer_item_id: null,
          offer_item_version: 0,
          catalogue_id: child.catalogue_id ?? "",
          parent_catalogue_id: child.catalogue_id,
          catalogue_name: child.catalogue?.name ?? "",
          sn: child.catalogue?.sn ?? "",
          quantity: child.quantity,
          unit_price: child.unit_price,
          total_price: child.total_price,
          status: child.status,
          checked:
            child.status == CanvassingVendorStatus.SELECTED ? true : false,
          taxes: [],
          editing: null,
          type: "child",
          children: [],
          selling_price: child.selling_price ?? 0,
          profit: child.profit,
          profit_unit: child.profit_unit,
          fee: child.fee,
          fee_unit: child.fee_unit,
          ongkir: child.ongkir,
          ongkir_unit: child.ongkir_unit,
          pricetag_item_id: child.pricetag_item_id ?? "",
          pricetag_item_version: child.pricetag_item_version ?? 0,
          total_selling_price: 0,
          contacts_fee: (child.reference_transaction ?? []).filter(
            (value) => value.party_type == PartyType.CONTACT
          ),
        })),

        selling_price: element.unit_selling_price,
        profit: 0,
        profit_unit: "percent",
        fee: 0,
        fee_unit: "percent",
        ongkir: 0,
        ongkir_unit: "percent",
        pricetag_item_id: "",
        pricetag_item_version: 0,
        contacts_fee: [],
        files: mapApiFilesView(element.files ?? []),
        image:
          mapApiFilesView(element.files ?? []).length > 0
            ? mapApiFilesView(element.files ?? [])[0].url
            : "",
        total_selling_price: 0,
      });
    }
  });

  const equivalent: CanvassingItemForm[] = [];

  (data.canvassing_item ?? []).forEach((element) => {
    if (element.type_item == "equivalent") {
      equivalent.push({
        index: `${element.unique_id}`,
        canvassing_id: element.canvassing_id,
        canvaasing_version: element.canvaasing_version,
        item_request_trail_version: element.item_request_trail_version,
        item_request_trail_id: element.item_request_trail_id,
        unique_id: element.unique_id,
        vendor_id: null,
        vendor_name: "",
        unit_id: element.unit_id,
        unit_name: element.unit_name,
        unit_version: null,
        offer_item_id: null,
        offer_item_version: 0,
        catalogue_id: element.catalogue_id ?? "",
        parent_catalogue_id: "",
        catalogue_name: element.catalogue_name ?? "",
        sn: element.catalogue?.sn ?? "N/A",
        quantity: element.quantity ?? 1,
        unit_price: 0,
        total_price:
          Number(element.unit_selling_price) * Number(element.quantity),
        status: CanvassingVendorStatus.SUBMITTED,
        taxes: [],
        editing: null,
        type: "parent",
        type_item: element.type_item,
        equivalent_id: element.equivalent_id,
        children: element.canvassing_vendor.map((child) => ({
          type_item: child.type_item,
          equivalent_id: child.equivalent_id,
          index: `${child.unique_id}`,
          canvassing_id: null,
          canvaasing_version: null,
          item_request_trail_version: null,
          item_request_trail_id: null,
          unique_id: child.unique_id,
          vendor_id: child.vendor_id ?? "",
          vendor_name: child.vendor?.name ?? "",
          unit_id: child.unit_id,
          unit_name: child.unit_name,
          unit_version: null,
          offer_item_id: null,
          offer_item_version: 0,
          catalogue_id: child.catalogue_id ?? "",
          parent_catalogue_id: child.catalogue_id,
          catalogue_name: child.catalogue?.name ?? "",
          sn: child.catalogue?.sn ?? "",
          quantity: child.quantity,
          unit_price: child.unit_price,
          total_price: child.total_price,
          status: child.status,
          checked:
            child.status == CanvassingVendorStatus.SELECTED ? true : false,
          taxes: [],
          editing: null,
          type: "child",
          children: [],
          selling_price: child.selling_price ?? 0,
          profit: child.profit,
          profit_unit: child.profit_unit,
          fee: child.fee,
          fee_unit: child.fee_unit,
          ongkir: child.ongkir,
          ongkir_unit: child.ongkir_unit,
          pricetag_item_id: child.pricetag_item_id ?? "",
          pricetag_item_version: child.pricetag_item_version ?? 0,
          contacts_fee: (child.reference_transaction ?? []).filter(
            (value) => value.party_type == PartyType.CONTACT
          ),
          total_selling_price: 0,
        })),
        selling_price: element.unit_selling_price,
        profit: 0,
        profit_unit: "percent",
        fee: 0,
        fee_unit: "percent",
        ongkir: 0,
        ongkir_unit: "percent",
        pricetag_item_id: "",
        pricetag_item_version: 0,
        contacts_fee: [],
        total_selling_price: 0,
      });
    }
  });

  equivalent.forEach((element) => {
    const indexParent = item_canvassing.value.findIndex(
      (data) => data.unique_id === element.equivalent_id
    );
    if (indexParent >= 0) {
      // item_canvassing.value.splice(indexParent + 1, 0, element);
      const eq = element.children.map((child) => ({
        ...child,
        equivalent_id: element.equivalent_id,
      }));
      item_canvassing.value[indexParent].children = [
        ...item_canvassing.value[indexParent].children,
        ...eq,
      ];
    }
  });

  item_canvassing.value.forEach((parent) => {
    setProfit(parent);
  });
};

watch(
  () => props.canvassingData,
  (newData) => {
    if (newData) {
      initialCanvassing(newData);
    }
  },
  { immediate: true }
);

onMounted(() => {});
</script>

<style scoped>
.el-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
}

:deep(.el-descriptions__body) {
  background-color: transparent;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
}

.vendor-info {
  line-height: 1.4;
}

.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}
.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}

.demo-image__error .el-image {
  max-width: 300px;
  max-height: 200px;
  width: 100%;
}

.demo-image__error .image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-size: 30px;
  height: 200px;
  background: #fff;
}
.demo-image__error .image-slot .el-icon {
  font-size: 30px;
}
.image-viewer-slot {
  background: var(--el-fill-color-light);
}
.viewer-error {
  color: #000;
}
:deep(.image-viewer-slot) {
  height: 30px !important;
}
:deep(.el-table .primary-row) {
  --el-table-tr-bg-color: var(--el-color-primary-light-9);
}
</style>
