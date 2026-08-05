<template>
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
      <div class="card-header flex justify-end">
        <el-button type="danger" :icon="Delete" @click="confirmDelete"
          >Hapus</el-button
        >
        <NuxtLink
          :href="`/supply-chain-management/purchase/request/add?id=${purchaseRequestData?.unique_id}`"
          class="el-button el-button--primary"
        >
          <el-icon class="me-2"><Edit /></el-icon> Edit
        </NuxtLink>
        <el-button
          type="success"
          v-if="purchaseRequestData?.status === 'waiting_approval'"
          @click="approvePurchaseRequest"
        >
          <el-icon class="me-2"><CircleCheck /></el-icon> Approve
        </el-button>
        <el-button
          type="danger"
          v-if="purchaseRequestData?.status === 'waiting_approval'"
          @click="declinePurchaseRequest"
        >
          <el-icon class="me-2"><CircleCheck /></el-icon> Decline
        </el-button>
        <el-button
          type="warning"
          v-if="purchaseRequestData?.status === 'draft'"
          @click="submitForApproval"
          :icon="Upload"
        >
          Submit for Approval
        </el-button>
      </div>
    </template>

    <div class="flex gap-3 my-3">
      <div class="flex-1">
        <el-descriptions title="" :column="1" size="large" border>
          <el-descriptions-item label="Nomor Referensi">
            {{ purchaseRequestData?.source_document || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="Nomor PR">
            {{ purchaseRequestData?.unique_code || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="Diminta Oleh">
            {{ purchaseRequestData?.requester?.name || "-" }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <div class="flex-1">
        <el-descriptions title="" :column="1" size="large" border>
          <el-descriptions-item label="Status">
            <el-tag
              :type="getStatusTagType(purchaseRequestData?.status || 'draft')"
            >
              {{ formatStatus(purchaseRequestData?.status || "draft") }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Dibuat Oleh">
            {{ purchaseRequestData?.people?.name || "-" }}
          </el-descriptions-item>

          <el-descriptions-item label="Tanggal Dibuat">
            {{
              purchaseRequestData?.created_at != null
                ? formatLocalDate(purchaseRequestData?.created_at)
                : "-"
            }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>

    <el-descriptions title="Catatan" v-if="purchaseRequestData?.note">
      <el-descriptions-item label="">{{
        purchaseRequestData?.note
      }}</el-descriptions-item>
    </el-descriptions>
  </el-card>

  <el-card class="mb-3" shadow="never">
    <template #header>
      <div class="card-header">
        <span>Purchase Request Items</span>
      </div>
    </template>
    <el-table
      :data="purchaseRequestItem || []"
      row-key="index"
      :summary-method="getSummaries"
      show-summary
      border
    >
      <el-table-column prop="object_name" label="Item" />
      <el-table-column
        prop="request_number"
        label="Nomor Permintaan"
        width="190"
      />
      <el-table-column
        prop="quantity"
        label="Qty Diminta"
        align="right"
        width="120"
      />

      <el-table-column
        prop="unit_name"
        label="UOM"
        align="center"
        width="100"
      />
      <el-table-column
        prop="total_price"
        label="Total Harga"
        align="center"
        width="150"
      >
        <template #default="{ row }">
          {{ currencyWithoutSymbol(row.total_price || 0) }}
        </template>
      </el-table-column>
      <!-- <el-table-column
          label="Aksi"
          align="center"
          width="300"
          v-if="
            purchaseRequestData?.status ===
            PurchaseRequestStatus.WAITING_APPROVAL
          "
        >
          <template #default="scope">
            <el-button
              type="success"
              v-if="
                scope.row.status === ItemRequestTrailStatus.WAITING &&
                purchaseRequestData?.status ===
                  PurchaseRequestStatus.WAITING_APPROVAL
              "
              @click="
                () => itemAction(scope.$index, ItemRequestTrailStatus.DONE)
              "
            >
              <el-icon class="me-2"><CircleCheck /></el-icon> Approve
            </el-button>
            <el-button
              type="danger"
              v-if="
                scope.row.status === ItemRequestTrailStatus.WAITING &&
                purchaseRequestData?.status ===
                  PurchaseRequestStatus.WAITING_APPROVAL
              "
              @click="
                () => itemAction(scope.$index, ItemRequestTrailStatus.REJECT)
              "
            >
              <el-icon class="me-2"><CircleCheck /></el-icon> Reject
            </el-button>
            <el-tag
              v-if="
                scope.row.status === ItemRequestTrailStatus.DONE ||
                scope.row.status === ItemRequestTrailStatus.REJECT
              "
              :type="getItemStatusTagType(scope.row.status)"
            >
              {{ formatStatusItem(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column> -->
    </el-table>
  </el-card>

  <el-card
    class="mb-3"
    v-if="
      purchaseRequestData?.status === 'approved' &&
      relatedPurchaseOrders.data.length > 0
    "
    shadow="never"
  >
    <template #header>
      <div class="card-header">
        <span>Purchase Orders Terkait</span>
      </div>
    </template>
    <el-table :data="relatedPurchaseOrders.data ?? []" border>
      <el-table-column prop="catalogue_name" label="Item" />
      <el-table-column prop="purchase_order.unique_code" label="Nomor PO" />
      <el-table-column prop="purchase_order.vendor_name" label="Vendor" />
      <el-table-column prop="quantity" label="Quantity" align="right" />
      <el-table-column prop="unit_price" label="Unit Price" align="right">
        <template #default="scope">
          {{ currency(scope.row.unit_price) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="Status" align="center">
        <template #default="scope">
          <el-tag :type="getPOStatusTagType(scope.row.status)">
            {{ formatStatus(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="120" align="center">
        <template #default="scope">
          <NuxtLink
            :to="`/supply-chain-management/purchase/order/${scope.row.purchase_order.unique_id}`"
            class="el-button el-button--primary el-button--small"
          >
            View
          </NuxtLink>
        </template>
      </el-table-column>
    </el-table>
  </el-card>

  <el-dialog v-model="visibleApproveDialog" title="Approve PR!" width="500">
    <el-form :model="purchaseRequestData!" :label-position="formApproveLabel">
      <el-form-item label="Catatan" prop="note">
        <el-input v-model="purchaseRequestData!.note" type="textarea" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visibleApproveDialog = false">Cancel</el-button>
        <el-button type="primary" @click="submitForApprove">
          Approve
        </el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog v-model="visibleDeclineDialog" title="Decline PR!" width="500">
    <el-form :model="purchaseRequestData!" :label-position="formApproveLabel">
      <el-form-item label="Catatan" prop="note">
        <el-input v-model="purchaseRequestData!.note" type="textarea" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visibleApproveDialog = false">Cancel</el-button>
        <el-button type="primary" @click="declineForApprove">
          Approve
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="tsx" setup>
import { CircleCheck, Delete, Upload, Edit } from "@element-plus/icons-vue";
import {
  ItemRequestTrailStatus,
  type ItemRequestTrail,
} from "~/types/item_request";
import {
  PurchaseRequestStatus,
  type PurchaseRequest,
} from "~/types/purchase_request";
import type { BaseResponse } from "~/types/response";
import { currencyWithoutSymbol, formatLocalDate, currency } from "#imports";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import type { FormProps, TableColumnCtx } from "element-plus";
import type { PurchaseOrderItem } from "~/types/scm/purchase_order";

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

interface SummaryMethodProps<T = PurchaseRequestItemView> {
  columns: TableColumnCtx<T>[];
  data: T[];
}

type PurchaseRequestItemView = {
  index: string;
  unique_id: string;
  object_unique_id: string;
  object_name: string;
  request_number: string;
  quantity: number;
  total_price: number;
  unit_name: string;
  children: PurchaseRequestItemView[];
};
interface Props {
  purchaseRequestData: PurchaseRequest;
}
const props = defineProps<Props>();
const request_search_item_request_trail = ref<RequestSearch>({
  keyword: "",
  table: "item_request_trail",
  column: [
    {
      reference: ["pr"],
      reference_id: [props.purchaseRequestData.unique_id],
    },
  ],
  sort: null,
  offset: "1",
  limit: "10",
});

const purchase_request_order_related = ref<RequestSearch>({
  column: [],
  table: "purchase_order_item",
  keyword: "",
  filter: null,
  offset: "1",
  limit: "10",
  sort: {
    column: "updated_at",
    order: OrderColumn.ASC,
  },
});
const purchaseRequestItem = ref<PurchaseRequestItemView[]>([]);

const loading = ref<boolean>(false);
const visibleApproveDialog = ref<boolean>(false);
const visibleDeclineDialog = ref<boolean>(false);

const formApproveLabel = ref<FormProps["labelPosition"]>("top");

const relatedPurchaseOrders = ref<ResponsePagination<PurchaseOrderItem[]>>({
  current_page: 0,
  data: [],
  success: true,
  total_data: 0,
  total_page: 0,
});

const emit = defineEmits(["onRefresh"]);

const item_request_trials = await useAsyncData(
  "fetch-item-request-trails",
  async () => {
    if (request_search_item_request_trail.value.column.length == 0) {
      return {
        success: false,
        current_page: 0,
        total_page: 0,
        total_data: 0,
        data: [],
        privilege: [],
        message: "",
      };
    } else {
      const res = await useFetchApi<ResponsePagination<ItemRequestTrail[]>>(
        `/search`,
        "fetch-item-request-trails",
        "post",
        request_search_item_request_trail.value
      );
      return res.data.value;
    }
  }
);

const confirmDelete = () => {
  ElMessageBox.confirm(
    "Purchase request akan dihapus secara permanen. Lanjutkan?",
    "Warning",
    {
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      type: "warning",
    }
  )
    .then(async () => {
      await deletePurchaseRequest();
    })
    .catch(() => {
      // Cancel
    });
};

const deletePurchaseRequest = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<any>>(
      `/purchase-request-delete/${props.purchaseRequestData.unique_id}`,
      "delete-purchase-request",
      "delete",
      null
    );

    if (response.status.value === "success") {
      ElMessage.success("Purchase request berhasil dihapus");
      window.location.href = "/supply-chain-management/purchase";
    }
  } catch (error) {
    ElMessage.error("Gagal menghapus purchase request");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const approvePurchaseRequest = async () => {
  // await updateStatus(PurchaseRequestStatus.APPROVED)

  const validate = (props.purchaseRequestData.items_request_trail ?? []).find(
    (value) => value.quantity === 0
  );

  if (validate) {
    ElMessage.error(
      `${validate.item_request?.catalogue_name} Masih Menunggu Approval!`
    );
  } else {
    visibleApproveDialog.value = true;
  }
};
const declinePurchaseRequest = async () => {
  // await updateStatus(PurchaseRequestStatus.APPROVED)

  const validate = (props.purchaseRequestData.items_request_trail ?? []).find(
    (value) => value.quantity === 0
  );

  if (validate) {
    ElMessage.error(
      `${validate.item_request?.catalogue_name} Masih Menunggu Approval!`
    );
  } else {
    visibleDeclineDialog.value = true;
  }
};

const submitForApproval = async () => {
  await updateStatus(PurchaseRequestStatus.WAITING_APPROVAL);
};

// Actions
const updateStatus = async (status: PurchaseRequestStatus) => {
  loading.value = true;
  try {
    const formData = new FormData();
    formData.append("unique_id", props.purchaseRequestData.unique_id);
    formData.append("status", status);
    formData.append("note", `${props.purchaseRequestData.note}`);

    // Append itemsL
    (props.purchaseRequestData.items_request_trail ?? []).forEach(
      (item: ItemRequestTrail, index: number) => {
        formData.append(
          `item_request_trail[${index}][unique_id]`,
          item.unique_id
        );
        formData.append(
          `item_request_trail[${index}][item_request_id]`,
          `${item.item_request_id}`
        );
        formData.append(
          `item_request_trail[${index}][reference]`,
          `${item.reference}`
        );
        formData.append(
          `item_request_trail[${index}][reference_id]`,
          `${item.reference_id}`
        );
        formData.append(
          `item_request_trail[${index}][reference_version]`,
          `${item.reference_version ?? 1}`
        );
        formData.append(
          `item_request_trail[${index}][quantity]`,
          `${item.quantity}`
        );
        formData.append(
          `item_request_trail[${index}][status]`,
          `${ItemRequestTrailStatus.DONE}`
        );
      }
    );

    const response = await useFetchApi<BaseResponse<PurchaseRequest>>(
      "/purchase-request-create",
      "update-status",
      "post",
      formData
    );

    if (response.status.value === "success") {
      props.purchaseRequestData.status = status;
      ElMessage.success("Status berhasil diupdate");
      emit("onRefresh");
    }
  } catch (error) {
    ElMessage.error("Gagal mengupdate status");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const getStatusTagType = (
  status: string
): "success" | "info" | "danger" | "warning" | "primary" => {
  switch (status) {
    case "draft":
      return "info";
    case "waiting_approval":
      return "warning";
    case "approved":
      return "success";
    case "rejected":
      return "danger";
    case "canvassing":
      return "primary";
    default:
      return "primary";
  }
};

const getPOStatusTagType = (
  status: string
): "success" | "info" | "danger" | "warning" | "primary" => {
  switch (status) {
    case "draft":
      return "info";
    case "waiting_approval":
      return "warning";
    case "done":
      return "success";
    case "cancelled":
      return "danger";
    default:
      return "primary";
  }
};

const formatStatus = (status: string | undefined) => {
  if (!status) return "-";

  const statusMap: Record<string, string> = {
    draft: "Draft",
    waiting_approval: "Waiting For Approval",
    approved: "Disetujui",
    rejected: "Ditolak",
    canvassing: "Canvassing",
  };

  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
};

watch(
  () => request_search_item_request_trail.value,
  () => item_request_trials.refresh(),
  { deep: true }
);

watch(
  () => item_request_trials.data.value?.data,
  () => {
    purchaseRequestItem.value = [];
    (item_request_trials.data.value?.data || []).forEach((element, index) => {
      purchaseRequestItem.value.push({
        index: `${index}`,
        unique_id: element.unique_id,
        object_unique_id: element.item_request?.unique_id || "",
        object_name:
          displayCatalogueName(element.item_request?.catalogue!) || "",
        request_number:
          (element.data_reference as PurchaseRequest).unique_code || "",
        quantity: element.quantity || 0,
        total_price:
          element.vendor
            ?.filter(
              (filter) =>
                filter.catalogue_id ==
                element.item_request?.catalogue?.unique_id
            )
            .reduce((acc, item) => acc + (item.total_price || 0), 0) || 0,
        unit_name: element.item_request?.unit_name || "",
        children: (element.vendor || [])
          .filter(
            (filter) =>
              filter.catalogue_id == element.item_request?.catalogue?.unique_id
          )
          .map((vendor, vindex) => ({
            index: `${index}-${vindex}`,
            unique_id: vendor.unique_id || "",
            object_name: vendor.vendor?.name || "",
            object_unique_id: vendor.vendor?.unique_id || "",
            request_number: "",
            quantity: vendor.quantity || 0,
            total_price: vendor.total_price || 0,
            unit_name: vendor.unit_name ?? "",
            children: [],
          })),
      });
    });

    console.log("item request trails", item_request_trials.data.value?.data);

    purchase_request_order_related.value.column = [
      {
        pr_item_request_trail_id: item_request_trials.data.value?.data.map(
          (value) => value.unique_id
        ),
        status: "done",
      },
    ];
  },
  { immediate: true, deep: true }
);

watch(
  () => purchase_request_order_related.value,
  () => fetchRelatedData(),
  { deep: true }
);

const getSummaries = (param: SummaryMethodProps) => {
  const { columns, data } = param;
  const sums: (string | VNode)[] = [];

  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = h("div", { style: { fontWeight: "bold" } }, ["Total"]);
      return;
    }

    // HANYA total_price
    if (column.property === "total_price") {
      const total = data.reduce((prev, curr) => {
        return prev + Number(curr.total_price || 0);
      }, 0);

      sums[index] = h("div", { style: { fontWeight: "bold" } }, [
        currencyWithoutSymbol(total),
      ]);
    } else {
      sums[index] = "";
    }
  });

  return sums;
};

// Fetch related data
const fetchRelatedData = async () => {
  try {
    // Fetch related purchase orders
    const poResponse = await useFetchApi<
      ResponsePagination<PurchaseOrderItem[]>
    >(
      `/search`,
      "related-purchase-order",
      "post",
      purchase_request_order_related.value
    );
    console.log("related purchase order", poResponse.data);
    if (poResponse.status.value === "success") {
      relatedPurchaseOrders.value = poResponse.data.value || {
        current_page: 0,
        data: [],
        success: true,
        total_data: 0,
        total_page: 0,
      };
    }
  } catch (error) {
    console.error("Failed to fetch related data", error);
  }
};
const downloadAttachment = async (attachment: any) => {
  try {
    // Implement download logic here
    ElMessage.info("Download functionality would be implemented here");
  } catch (error) {
    ElMessage.error("Gagal mengunduh file");
    console.error(error);
  }
};
const submitForApprove = async () => {
  (item_request_trials.data.value?.data ?? []).forEach((element) => {
    element.status == ItemRequestTrailStatus.DONE;
  });

  await updateStatus(PurchaseRequestStatus.APPROVED);
  visibleApproveDialog.value = false;
};

const declineForApprove = async () => {
  (item_request_trials.data.value?.data ?? []).forEach((element) => {
    element.status == ItemRequestTrailStatus.DONE;
  });

  await updateStatus(PurchaseRequestStatus.REJECTED);
  visibleDeclineDialog.value = false;
};
</script>
