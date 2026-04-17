<template>
  <div>
    <el-card
      class="my-3"
      shadow="hover"
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
            :to="`/sales/order/add?id=${purchaseOrderData?.unique_id}`"
            class="el-button el-button--default"
          >
            <el-icon class="me-2"><Edit /></el-icon> Edit
          </NuxtLink>
          <NuxtLink
            :to="`/inventory-management/inqueiries/add?sales_id=${purchaseOrderData?.unique_id}`"
            class="el-button el-button--primary"
          >
            <el-icon class="me-2"><Edit /></el-icon> Buat Inquiry
          </NuxtLink>
          <el-button
            type="success"
            v-if="
              purchaseOrderData?.status === PurchaseOrderStatus.PENDING_APPROVAL
            "
            @click="approvePurchaseOrder"
          >
            <el-icon class="me-2"><CircleCheck /></el-icon> Approve
          </el-button>
          <el-button
            type="danger"
            v-if="
              purchaseOrderData?.status === PurchaseOrderStatus.PENDING_APPROVAL
            "
            @click="rejectPurchaseOrder"
          >
            <el-icon class="me-2"><CircleClose /></el-icon> REJECT
          </el-button>
          <el-button
            type="warning"
            v-if="purchaseOrderData?.status === PurchaseOrderStatus.DRAFT"
            @click="submitForApproval"
          >
            <el-icon class="me-2"><Upload /></el-icon> Submit for Approval
          </el-button>
          <el-button
            type="primary"
            v-if="purchaseOrderData?.status === PurchaseOrderStatus.APPROVED"
            @click="markAsCompleted"
          >
            <el-icon class="me-2"><CircleCheck /></el-icon> Mark as Completed
          </el-button>
        </div>
      </template>

      <div class="flex gap-3 my-3">
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            <el-descriptions-item label="Nomor Referensi">
              {{ purchaseOrderData?.sourcing_document || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="Nomor SO">
              {{ purchaseOrderData?.unique_code || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="Kontak">
              {{ purchaseOrderData?.vendor?.name || "-" }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            <el-descriptions-item label="Status">
              <el-tag
                :type="
                  getStatusTagType(
                    purchaseOrderData?.status || PurchaseOrderStatus.DRAFT
                  )
                "
              >
                {{
                  formatStatus(
                    purchaseOrderData?.status || PurchaseOrderStatus.DRAFT
                  )
                }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="Estimasi Sampai">
              {{
                purchaseOrderData?.expected_arrival != null
                  ? formatLocalDate(purchaseOrderData?.expected_arrival)
                  : "-"
              }}
            </el-descriptions-item>

            <el-descriptions-item label="Tanggal Dibuat">
              {{
                purchaseOrderData?.created_at != null
                  ? formatLocalDate(purchaseOrderData?.created_at)
                  : "-"
              }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <el-descriptions title="Informasi Tambahan">
        <el-descriptions-item label="">
          <div
            v-html="
              `${formattedText(
                purchaseOrderData?.additional_information ?? ''
              )}`
            "
          ></div>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="mb-3" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>Purchase Order Items</span>
        </div>
      </template>
      <el-table :data="purchaseOrderData?.purchase_order_item ?? []" border>
        <el-table-column prop="catalogue_name" label="Item" />
        <el-table-column
          prop="quantity"
          label="QTY"
          align="right"
          :width="
            purchaseOrderData?.status === PurchaseOrderStatus.PENDING_APPROVAL
              ? 200
              : 70
          "
        >
          <template #default="scope">
            <el-input-number
              v-model="scope.row.quantity"
              width="100"
              :min="1"
              v-if="
                scope.row.status === PurchaseOrderItemStatus.PENDING_APPROVAL ||
                (scope.row.status === PurchaseOrderItemStatus.DRAFT &&
                  purchaseOrderData?.status ===
                    PurchaseOrderStatus.PENDING_APPROVAL)
              "
            />
            <p v-else>
              {{ scope.row.quantity }}
            </p>
          </template>
        </el-table-column>
        <el-table-column
          prop="unit_name"
          label="UOM"
          align="center"
          width="100"
        />
        <el-table-column
          prop="unit_price"
          label="Harga Unit"
          align="right"
          width="150"
        >
          <template #default="scope">
            {{ currency(scope.row.unit_price) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="total_price"
          label="Total Harga"
          align="right"
          width="150"
        >
          <template #default="scope">
            {{ currency(scope.row.total_price) }}
          </template>
        </el-table-column>
        <el-table-column label="Garansi" width="150">
          <template #default="scope">
            {{
              scope.row.is_warranty
                ? `${scope.row.warranty} ${scope.row.warranty_unit}`
                : "Tidak ada"
            }}
          </template>
        </el-table-column>
        <el-table-column label="Diskon" width="150">
          <template #default="scope">
            {{
              scope.row.is_discount
                ? `${scope.row.discount}${
                    scope.row.discount_unit === "percent" ? "%" : ""
                  }`
                : "Tidak ada"
            }}
          </template>
        </el-table-column>

        <el-table-column
          label="Aksi"
          align="center"
          width="300"
          v-if="
            purchaseOrderData?.status === PurchaseOrderStatus.PENDING_APPROVAL
          "
        >
          <template #default="scope">
            <el-button
              type="success"
              v-if="
                scope.row.status === PurchaseOrderItemStatus.PENDING_APPROVAL ||
                (scope.row.status === PurchaseOrderItemStatus.DRAFT &&
                  purchaseOrderData?.status ===
                    PurchaseOrderStatus.PENDING_APPROVAL)
              "
              @click="() => approveItem(scope.$index)"
            >
              <el-icon class="me-2"><CircleCheck /></el-icon> Approve
            </el-button>
            <el-button
              type="danger"
              v-if="
                scope.row.status === PurchaseOrderItemStatus.PENDING_APPROVAL ||
                (scope.row.status === PurchaseOrderItemStatus.DRAFT &&
                  purchaseOrderData?.status ===
                    PurchaseOrderStatus.PENDING_APPROVAL)
              "
              @click="() => rejectItem(scope.$index)"
            >
              <el-icon class="me-2"><Close /></el-icon> Reject
            </el-button>
            <el-tag
              v-if="
                scope.row.status !== PurchaseOrderItemStatus.PENDING_APPROVAL
              "
              :type="getItemStatusTagType(scope.row.status)"
            >
              {{ formatStatusItem(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="mb-3" v-if="relatedDocuments.length > 0" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>Dokumen Terkait</span>
        </div>
      </template>
      <el-table :data="relatedDocuments" border>
        <el-table-column prop="document_type" label="Jenis Dokumen" />
        <el-table-column prop="document_number" label="Nomor Dokumen" />
        <el-table-column prop="status" label="Status" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ formatStatus(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="120" align="center">
          <template #default="scope">
            <NuxtLink
              :to="scope.row.link"
              class="el-button el-button--primary el-button--small"
            >
              View
            </NuxtLink>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <CustomPaymentTerm
      type="view"
      :data="purchaseOrderData?.payment_terms ?? []"
    />

    <el-card class="mb-3" shadow="hover">
      <el-table :data="summeryData ?? []" style="width: 100%">
        <el-table-column label="" prop="label" width="300">
          <template #default="{ row }">
            <div class="font-bold">{{ row.label }}</div>
          </template>
        </el-table-column>
        <el-table-column label="" prop="value" align="right" />
      </el-table>
    </el-card>

    <el-dialog
      v-model="visibleApproveDialog"
      title="Approve Purchase Order!"
      width="500"
    >
      <el-form :model="approveForm" :label-position="formApproveLabel">
        <el-form-item label="Catatan" prop="note">
          <el-input v-model="approveForm.note" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="visibleApproveDialog = false">Cancel</el-button>
          <el-button type="primary" @click="submitApproval">
            Approve
          </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog
      v-model="visibleRejectDialog"
      title="Reject Purchase Order!"
      width="500"
    >
      <el-form :model="approveForm" :label-position="formApproveLabel">
        <el-form-item label="Catatan" prop="note">
          <el-input v-model="approveForm.note" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="visibleApproveDialog = false">Cancel</el-button>
          <el-button type="danger" @click="rejectApproval"> Reject </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import {
  Delete,
  Edit,
  CircleCheck,
  Upload,
  Close,
  CircleClose,
} from "@element-plus/icons-vue";
import type { FormProps } from "element-plus";
import {
  PurchaseOrderStatus,
  PurchaseOrderItemStatus,
  type PurchaseOrder,
  type PurchaseOrderItem,
} from "~/types/scm/purchase_order";
import type { BaseResponse } from "~/types/response";
import {
  FeeType,
  type ReferenceTransactionAdjustment,
} from "~/types/attribute_adjustment";
import { formatLocalDate, currency, formattedText } from "#imports";
import CustomPaymentTerm from "~/components/trums/CustomPaymentTerm.vue";

definePageMeta({
  middleware: ["auth", "app"],
});

const props = defineProps<{
  purchaseOrder: PurchaseOrder;
}>();

const visibleApproveDialog = ref<boolean>(false);
const visibleRejectDialog = ref<boolean>(false);
const router = useRouter();
const route = useRoute();
const purchaseOrderId = ref<string>(route.params.id as string);

const formApproveLabel = ref<FormProps["labelPosition"]>("top");
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
const purchaseOrderData = ref<PurchaseOrder | null>(props.purchaseOrder);
const purchaseOrderItems = ref<PurchaseOrderItem[]>([]);
const relatedDocuments = ref<any[]>([]);
const approveForm = reactive({
  note: "",
});

const goBack = () => router.back();

// Fetch purchase order data
const fetchPurchaseOrder = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<PurchaseOrder>>(
      `/purchase-order-read/${purchaseOrderId.value}`,
      "detail-purchase-order",
      "get",
      null
    );

    if (response.status.value === "success") {
      purchaseOrderData.value = response.data.value!.data!;
      //   await fetchPurchaseOrderItems()
      //   await fetchRelatedDocuments()
    }
  } catch (error) {
    ElMessage.error("Gagal mengambil data purchase order");
    goBack();
  } finally {
    loading.value = false;
  }
};

const formatStatusItem = (status: PurchaseOrderItemStatus) => {
  if (status === PurchaseOrderItemStatus.DRAFT) {
    return "DRAFT";
  } else if (status === PurchaseOrderItemStatus.DONE) {
    return "APPROVE";
  } else if (status === PurchaseOrderItemStatus.CANCELLED) {
    return "REJECTED";
  } else {
    return status;
  }
};

// Fetch purchase order items
const fetchPurchaseOrderItems = async () => {
  if (!purchaseOrderData.value) return;

  try {
    const response = await useFetchApi<BaseResponse<PurchaseOrderItem[]>>(
      `/purchase-order-items/${purchaseOrderData.value.unique_id}`,
      "purchase-order-items",
      "get",
      null
    );

    if (response.status.value === "success") {
      purchaseOrderItems.value = response.data.value?.data || [];
    }
  } catch (error) {
    console.error("Failed to fetch purchase order items", error);
  }
};

const showTransactionAdjustmentValue = (
  ref: ReferenceTransactionAdjustment
) => {
  if (ref.include) {
    return 0;
  } else {
    if (
      (ref.adjustment ?? ref.adjustments_transaction!).category == "tax" &&
      (ref.adjustment ?? ref.adjustments_transaction!).name.toLowerCase() ===
        "ppn"
    ) {
      const dpp: ReferenceTransactionAdjustment | undefined = (
        purchaseOrderData.value?.reference_transaction ?? []
      ).find(
        (value) =>
          (value.adjustment ?? value.adjustments_transaction!).unique_code ==
          "DPPL"
      );
      if (dpp) {
        const dppValue = getDPPFormula(dpp, subtotal.value || 0);
        return getPPNFormula(ref, dppValue || subtotal.value);
      } else {
        return getPPNFormula(ref, subtotal.value);
      }
    } else {
      if (
        (ref.adjustment ?? ref.adjustments_transaction!).operator == "minus"
      ) {
        console.log("");
        return ref.type == "amount"
          ? ref.amount
          : displayAmount(ref, totalPrice.value || 0);
      } else if (
        (ref.adjustment ?? ref.adjustments_transaction!).operator == "plus"
      ) {
        return ref.type == "amount"
          ? ref.amount
          : displayAmount(ref, subtotal.value || 0);
      }
    }
  }
};

// Fetch related documents
const fetchRelatedDocuments = async () => {
  if (!purchaseOrderData.value) return;

  try {
    const response = await useFetchApi<BaseResponse<any[]>>(
      `/related-documents/${purchaseOrderData.value.unique_id}`,
      "related-documents",
      "get",
      null
    );

    if (response.status.value === "success") {
      relatedDocuments.value = response.data.value?.data || [];
    }
  } catch (error) {
    console.error("Failed to fetch related documents", error);
  }
};

const formatStatus = (status: string | undefined) => {
  if (!status) return "-";

  const statusMap: Record<string, string> = {
    [PurchaseOrderStatus.DRAFT]: "Draft",
    [PurchaseOrderStatus.PENDING_APPROVAL]: "Menunggu Persetujuan",
    [PurchaseOrderStatus.APPROVED]: "Disetujui",
    [PurchaseOrderStatus.CANCELLED]: "Dibatalkan",
    [PurchaseOrderStatus.COMPLETED]: "Selesai",
  };

  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
};

const formatItemStatus = (status: string | undefined) => {
  if (!status) return "-";

  const statusMap: Record<string, string> = {
    [PurchaseOrderItemStatus.DRAFT]: "Draft",
    [PurchaseOrderItemStatus.PENDING_APPROVAL]: "Menunggu Persetujuan",
    [PurchaseOrderItemStatus.CANCELLED]: "Dibatalkan",
    [PurchaseOrderItemStatus.DONE]: "Selesai",
  };

  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
};

const getStatusTagType = (
  status: string
): "success" | "info" | "danger" | "warning" | "primary" => {
  switch (status) {
    case PurchaseOrderStatus.DRAFT:
      return "info";
    case PurchaseOrderStatus.PENDING_APPROVAL:
      return "warning";
    case PurchaseOrderStatus.APPROVED:
      return "success";
    case PurchaseOrderStatus.CANCELLED:
      return "danger";
    case PurchaseOrderStatus.COMPLETED:
      return "primary";
    default:
      return "primary";
  }
};

const getItemStatusTagType = (
  status: string
): "success" | "info" | "danger" | "warning" | "primary" => {
  switch (status) {
    case PurchaseOrderItemStatus.DRAFT:
      return "info";
    case PurchaseOrderItemStatus.PENDING_APPROVAL:
      return "warning";
    case PurchaseOrderItemStatus.DONE:
      return "success";
    case PurchaseOrderItemStatus.CANCELLED:
      return "danger";
    default:
      return "primary";
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Actions
const updateStatus = async (status: PurchaseOrderStatus, note: string = "") => {
  if (!purchaseOrderData.value) return;

  loading.value = true;
  try {
    const formData = new FormData();
    formData.append("unique_id", purchaseOrderData.value.unique_id);
    formData.append("status", status);
    // if (note) {
    //   formData.append('additional_', note)
    // }

    (purchaseOrderData.value.purchase_order_item ?? []).forEach(
      (item: PurchaseOrderItem, index: number) => {
        formData.append(`item[${index}][unique_id]`, item.unique_id);
        formData.append(`item[${index}][quantity]`, `${item.quantity}`);
        formData.append(
          `item[${index}][item_request_trail_id]`,
          `${item.item_request_trail_id}`
        );

        if (status == PurchaseOrderStatus.PENDING_APPROVAL) {
          formData.append(
            `item[${index}][status]`,
            `${PurchaseOrderItemStatus.PENDING_APPROVAL}`
          );
        } else {
          formData.append(`item[${index}][status]`, `${item.status}`);
        }
      }
    );

    const response = await useFetchApi<BaseResponse<PurchaseOrder>>(
      "/purchase-order-create",
      "update-status",
      "post",
      formData
    );

    if (response.status.value === "success") {
      purchaseOrderData.value.status = status;
      ElMessage.success("Status berhasil diupdate");
      await fetchPurchaseOrder(); // Refresh data
    }
  } catch (error) {
    ElMessage.error("Gagal mengupdate status");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const approvePurchaseOrder = () => {
  visibleApproveDialog.value = true;
};
const rejectPurchaseOrder = () => {
  visibleRejectDialog.value = true;
};

const submitForApproval = async () => {
  await updateStatus(PurchaseOrderStatus.PENDING_APPROVAL);
};

const submitApproval = async () => {
  await updateStatus(PurchaseOrderStatus.APPROVED, approveForm.note);
  visibleApproveDialog.value = false;
  approveForm.note = "";
};
const rejectApproval = async () => {
  purchaseOrderData.value?.purchase_order_item.forEach((value) => {
    value.quantity = 0;
    value.status = PurchaseOrderItemStatus.DONE;
  });

  await updateStatus(PurchaseOrderStatus.CANCELLED, approveForm.note);
  visibleRejectDialog.value = false;
  approveForm.note = "";
};

const markAsCompleted = async () => {
  await updateStatus(PurchaseOrderStatus.COMPLETED);
};

const approveItem = async (itemIndex: number) => {
  purchaseOrderData.value!.purchase_order_item[itemIndex].status =
    PurchaseOrderItemStatus.DONE;
};

const rejectItem = async (itemIndex: number) => {
  purchaseOrderData.value!.purchase_order_item[itemIndex].status =
    PurchaseOrderItemStatus.CANCELLED;
};

const confirmDelete = () => {
  ElMessageBox.confirm(
    "Purchase order akan dihapus secara permanen. Lanjutkan?",
    "Warning",
    {
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      type: "warning",
    }
  )
    .then(async () => {
      await deletePurchaseOrder();
    })
    .catch(() => {
      // Cancel
    });
};

const deletePurchaseOrder = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<any>>(
      `/purchase-order-delete/${purchaseOrderData.value?.unique_id}`,
      "delete-purchase-order",
      "delete",
      null
    );

    if (response.status.value === "success") {
      ElMessage.success("Purchase order berhasil dihapus");
      router.push("/purchase-management/purchase-orders");
    }
  } catch (error) {
    ElMessage.error("Gagal menghapus purchase order");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const getMinus = computed(() => {
  var minus = 0;
  (purchaseOrderData?.value?.reference_transaction ?? [])
    .filter(
      (value) =>
        (value.adjustment ?? value.adjustments_transaction!).operator == "minus"
    )
    .forEach((ref) => {
      if (ref.include == false) {
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

  (purchaseOrderData?.value?.reference_transaction ?? [])
    .filter(
      (value) =>
        (value.adjustment ?? value.adjustments_transaction!).operator ==
          "plus" &&
        (value.adjustment ?? value.adjustments_transaction!).category ===
          "adjustment"
    )
    .forEach((ref) => {
      if (ref.include == false) {
        plus +=
          ref.type == FeeType.AMOUNT
            ? Number(ref.amount)
            : displayAmount(ref, subtotal.value);
      }
    });

  return plus;
});

const ppnComponent = computed(() => {
  const ppnComponentRef = getPPNComponent(
    purchaseOrderData.value?.reference_transaction ?? []
  );
  const dppComponent = getDppComponent(
    purchaseOrderData.value?.reference_transaction ?? []
  );
  console.log("ppn componen", ppnComponentRef);
  if (ppnComponentRef) {
    if (dppComponent) {
      const dppValue = getDPPFormula(dppComponent, subtotal.value || 0);
      if (ppnComponentRef.include) {
        return 0;
      } else {
        return getPPNFormula(ppnComponentRef, dppValue);
      }
    } else {
      if (ppnComponentRef.include) {
        return 0;
      } else {
        return getPPNFormula(ppnComponentRef, subtotal.value || 0);
      }
    }
  } else {
    return 0;
  }
});

const grandTotal = computed(() => {
  console.log("subtotal", subtotal.value);
  console.log("plus", getPlus.value);
  console.log("ppn", ppnComponent.value);
  return subtotal.value + getPlus.value + ppnComponent.value;
});

const totalPrice = computed(() => {
  return (purchaseOrderData.value?.purchase_order_item ?? []).reduce(
    (accumulator, currentValue) => {
      return accumulator + currentValue.total_price;
    },
    0
  );
});
const subtotal = computed(() => {
  const sum = totalPrice.value;
  console.log("get minus", getMinus.value);
  return sum - (getMinus.value || 0);
});

const summeryData = computed(() => {
  const tableData: any[] = [
    {
      label: "Subtotal",
      value: currency(subtotal.value),
    },
  ];

  (purchaseOrderData.value?.reference_transaction ?? []).forEach((element) => {
    tableData.push({
      label: element.adjustments_transaction?.name
        ? `${element.adjustments_transaction?.name} (${Number(
            displayPercentage(element, subtotal.value) || 0
          ).toFixed(2)}%)`
        : "-",
      value: currency(displayAmount(element, subtotal.value)),
    });
  });

  tableData.push({
    label: "Grand Total",
    value: currency(grandTotal.value || 0),
  });

  return tableData;
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flex {
  display: flex;
}

.justify-end {
  justify-content: flex-end;
}

.gap-3 {
  gap: 0.75rem;
}

.my-3 {
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.me-2 {
  margin-right: 0.5rem;
}

.text-large {
  font-size: 1.125rem;
}

.font-600 {
  font-weight: 600;
}

.mr-3 {
  margin-right: 0.75rem;
}
</style>
