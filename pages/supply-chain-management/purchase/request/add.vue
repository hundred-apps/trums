<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3"> New Purchase Request </span>
      </template>
    </el-page-header>

    <el-card class="my-3">
      <template #header>
        <div class="card-header">
          <el-form-item>
            <el-button type="primary" @click="submitForm(ruleFormRef)"
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
        <!-- Purchase Request Header Information -->
        <el-form-item label="Nomor Referensi" prop="source_document">
          <el-input
            v-model="ruleForm.source_document"
            placeholder="Masukkan nomor referensi"
          />
        </el-form-item>

        <el-form-item label="Diminat Oleh" prop="requester_name">
          <AutocompleteContact
            v-model="ruleForm.requester_name!"
            :contact="ruleForm.requester"
            :fetch-suggestions="(queryString: string, cb: (arg: any) => void) => querySearchContact(queryString, cb)"
            @save-contact="(data: Contact) => onHandleSelectContact(data)"
          />
          <!-- <el-autocomplete
            :fetch-suggestions="querySearchContact"
            v-model="ruleForm.requester_name"
            placeholder="Cari Kontak"
            @select="(item: Record<string, any>) => onHandleSelectContact(item, 'to')"
          /> -->
        </el-form-item>

        <el-form-item label="Status" prop="status">
          <el-select v-model="ruleForm.status" style="width: 100%">
            <el-option
              v-for="status in purchaseRequestStatusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="File Lampiran" prop="files">
          <TrumsUploadFile v-model:file-list="fileList" />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Purchase Request Items Section -->
    <el-card class="mb-3">
      <template #header>
        <div class="card-header">
          <span>Items</span>
        </div>
      </template>

      <el-table :data="ruleForm.items" border>
        <el-table-column prop="item_name" label="Item" />
        <el-table-column
          prop="request_number"
          label="Nomor Permintaan"
          width="200"
        />
        <el-table-column
          prop="quantity"
          label="Request QTY"
          align="right"
          width="200"
        />
        <el-table-column
          prop="request_quantity"
          label="QTY Purchase"
          width="200"
          align="right"
        >
          <template #default="scope">
            <el-input-number v-model="scope.row.request_quantity" :min="1" />
          </template>
        </el-table-column>

        <el-table-column label="Actions" width="100">
          <template #default="scope">
            <div class="flex">
              <el-button
                type="danger"
                :icon="Delete"
                circle
                @click="removeItem(scope.$index)"
                :disabled="ruleForm.items.length <= 1"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-button
        class="mt-4"
        style="width: 100%"
        @click="visibleModalItemRequest = true"
      >
        Tambah Item
      </el-button>
    </el-card>

    <!-- Modal untuk mencari Item Request -->
    <el-dialog
      v-model="visibleModalItemRequest"
      title="Cari Item Request"
      width="1000"
    >
      <el-row :gutter="20" class="mb-3">
        <el-col :span="6">
          <el-input
            v-model="itemRequestSearch.keyword"
            size="default"
            placeholder="Type to search"
          />
        </el-col>
        <el-button
          size="default"
          type="primary"
          @click="addItemsToForm(selectedItemRequests)"
          :disabled="selectedItemRequests.length === 0"
        >
          Tambahkan ({{ selectedItemRequests.length }})
        </el-button>
      </el-row>

      <el-table
        :data="itemRequests.data"
        style="width: 100%"
        @selection-change="handleItemRequestSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="Nama Item" width="300">
          <template #default="scope">
            <NuxtLink
              class="text-blue-500"
              :to="`/inventory-management/item-requests/${scope.row.unique_id}`"
            >
              {{ scope.row.catalogue_name }}
            </NuxtLink>
          </template>
        </el-table-column>
        <el-table-column label="Nomor Permintaan" width="200">
          <template #default="scope">
            <p>{{ scope.row.inquiry?.unique_code || "-" }}</p>
          </template>
        </el-table-column>
        <el-table-column label="Request QTY" width="100">
          <template #default="scope">
            <p>{{ scope.row.request_qty }}</p>
          </template>
        </el-table-column>
        <el-table-column label="Approved QTY" width="100">
          <template #default="scope">
            <p>{{ scope.row.approved_qty }}</p>
          </template>
        </el-table-column>
        <el-table-column label="Rejected QTY" width="100">
          <template #default="scope">
            <p>{{ scope.row.rejected_qty }}</p>
          </template>
        </el-table-column>
        <el-table-column label="Pending QTY" width="100">
          <template #default="scope">
            <p>{{ scope.row.remaining_qty }}</p>
          </template>
        </el-table-column>
        <el-table-column label="UOM" prop="unit_name" width="100" />
      </el-table>

      <div class="flex justify-end mt-3">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="itemRequests.total_data"
          :page-size="parseInt(itemRequestSearch.limit)"
          @current-change="handleItemRequestPageChange"
        />
      </div>
    </el-dialog>

    <el-dialog v-model="dialogContact" title="Detail Kontak">
      <AddContact
        ref="formFieldsRefContact"
        :contact-data="ruleForm.requester!"
        :loading="loading"
        @submit="handleSubmitContact"
        @reset="handleResetContact"
      />
    </el-dialog>
  </TrumsWrapper>
</template>

<script lang="ts" setup>
import { Delete } from "@element-plus/icons-vue";
import type { FormInstance, FormRules, UploadUserFile } from "element-plus";
import {
  PurchaseRequestStatus,
  type PurchaseRequest,
  type PurchaseRequestItem,
} from "~/types/purchase_request";
import {
  ItemRequestTrailReference,
  ItemRequestTrailStatus,
  type ItemRequest,
  type ItemRequestTrail,
} from "~/types/item_request";
import type { Contact } from "~/types/contact";
import type { ResponsePagination } from "~/types/response_pagination";
import type { RequestSearch } from "~/types/request_search";
import type { BaseResponse } from "~/types/response";
import TrumsUploadFile from "~/components/trums/form/TrumsUploadFile.vue";
import type { Inquiry } from "~/types/inquiry";
import AddContact from "~/components/trums/AddContact.vue";
import AutocompleteContact from "~/components/trums/AutocompleteContact.vue";

const fileList = ref<UploadUserFile[]>([]);

const router = useRouter();
const route = useRoute();
const ruleFormRef = ref<FormInstance>();
const loading = ref(false);
const loadingContacts = ref(false);
const dialogContact = ref(false);
const visibleModalItemRequest = ref(false);

const formFieldsRefContact = ref();

const id = computed(() => route.query.id as string);
const inquiry_id = computed(() => route.query.inquiry_id as string);

// Status options
const purchaseRequestStatusOptions = [
  { value: "draft", label: "Draft" },
  { value: "waiting_approval", label: "Waiting Approval" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "canvassing", label: "Canvassing" },
];

const requesters = ref<Contact[]>([]);
const selectedItemRequests = ref<ItemRequest[]>([]);

// Form data
const ruleForm = reactive<
  Omit<PurchaseRequest, "created_at" | "updated_at" | "version"> & {
    items: ItemRequestTrail[];
    items_request_trail: ItemRequestTrail[];
  }
>({
  unique_id: "",
  requester_name: "",
  source_document: "",
  unique_code: "",
  requester_id: null,
  requester_version: 1,
  status: PurchaseRequestStatus.DRAFT,
  created_by: "", // Will be set from auth
  items: [],
  items_request_trail: [],
  note: null,
});

// Search configuration
const itemRequestSearch = reactive<RequestSearch>({
  column: [
    {
      inquiry: {
        type: ["internal"],
      },
    },
  ],
  keyword: "",
  limit: "10",
  offset: "1",
  sort: {
    column: "created_at",
    order: "asc",
  },
  filter: {
    remaining_qty: {
      min: 0,
    },
  },
  table: "item_request",
});

// Data from API
const itemRequests = ref<ResponsePagination<ItemRequest[]>>({
  current_page: 0,
  data: [],
  success: true,
  total_data: 0,
  total_page: 1,
});

// Form validation rules
const rules: FormRules = reactive({
  requester_name: [
    { required: true, message: "Requester wajib diisi", trigger: "blur" },
  ],
  status: [
    { required: true, message: "Status wajib dipilih", trigger: "change" },
  ],
  items: [
    {
      validator: (_, value, callback) => {
        if (!value || value.length < 1) {
          callback(new Error("Minimal harus ada 1 item"));
        } else {
          callback();
        }
      },
      trigger: "change",
    },
  ],
});

// Methods
const goBack = () => router.back();

const searchRequesters = async (query: string) => {
  if (!query) {
    requesters.value = [];
    return;
  }

  loadingContacts.value = true;
  try {
    const searchParams: RequestSearch = {
      column: [],
      keyword: query,
      limit: "10",
      offset: "1",
      sort: { column: "name", order: "asc" },
      table: "contacts",
    };

    const response = await useFetchApi<ResponsePagination<Contact[]>>(
      "/search",
      "search-requesters",
      "post",
      searchParams
    );

    if (response.status.value === "success") {
      requesters.value = response.data.value?.data || [];
    }
  } catch (error) {
    console.error("Failed to search requesters", error);
  } finally {
    loadingContacts.value = false;
  }
};

const fetchItemRequests = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<ResponsePagination<ItemRequest[]>>(
      "/search",
      "search-item-requests",
      "post",
      itemRequestSearch
    );

    if (response.status.value === "success") {
      itemRequests.value = response.data.value!;
    }
  } catch (error) {
    console.error("Failed to fetch item requests", error);
    ElMessage.error("Gagal mengambil data item requests");
  } finally {
    loading.value = false;
  }
};

const handleItemRequestSelectionChange = (items: ItemRequest[]) => {
  selectedItemRequests.value = items;
};

const handleItemRequestPageChange = (page: number) => {
  itemRequestSearch.offset = page.toString();
  fetchItemRequests();
};

const addItemsToForm = (items: ItemRequest[], inqNumber: string | null) => {
  items.forEach((item) => {
    // Check if item already exists in the form
    const exists = ruleForm.items.some(
      (existingItem) => existingItem.unique_id === item.unique_id
    );

    if (!exists) {
      ruleForm.items.push({
        unique_id: "",
        item_request_id: item.unique_id ?? "",
        reference: ItemRequestTrailReference.PR,
        quantity: item.request_qty,
        request_quantity: item.request_qty,
        status: ItemRequestTrailStatus.WAITING,
        created_at: 0,
        created_by: "",
        updated_at: 0,
        item_name: item.catalogue_name ?? "",
        request_number: inqNumber ?? "Tidak Ada",
        item_request_version: item.version ?? 1,
      });
    }
  });

  visibleModalItemRequest.value = false;
  selectedItemRequests.value = [];
};

const removeItem = (index: number) => {
  ruleForm.items.splice(index, 1);
};

const getItemRequestStatusType = (
  status: string
): "success" | "info" | "danger" | "warning" | "primary" => {
  const statusTypes: Record<
    string,
    "success" | "info" | "danger" | "warning" | "primary"
  > = {
    draft: "info",
    waiting_approval: "warning",
    approved: "success",
    rejected: "danger",
    canvassing: "primary",
  };
  return statusTypes[status] || "info";
};

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        await submitPurchaseRequest();
      } catch (error) {
        ElMessage.error("Gagal membuat purchase request");
        console.error(error);
      } finally {
        loading.value = false;
      }
    }
  });
};

const querySearchContact = (queryString: string, cb: (arg: any) => void) => {
  console.log("masuk search", queryString);
  const request_search: RequestSearch = {
    keyword: queryString,
    table: "contacts",
    column: [],
    limit: "100",
    offset: "1",
    sort: null,
  };

  useFetchApi<ResponsePagination<Contact[]>>(
    "/search",
    "search-contact",
    "post",
    request_search
  )
    .then((response) => {
      if (response.status.value == "success") {
        const resultApi: Contact[] = response.data.value?.data ?? [];
        if (resultApi.length > 0) {
          const results = resultApi.map((data: Contact) => {
            return { data: data, value: `${data.name}` };
          });
          cb(results);
        } else {
          cb([
            {
              value: `Tambahkan ${queryString}`,
              isNew: true,
              query: queryString,
              label: `Tambahkan ${queryString}`,
            },
          ]);
        }
      } else {
        ElMessage.error(response.error.value ?? "");
      }
    })
    .catch((error: any) => {
      ElMessage.error(error.response.data.message);
    });
};

const createNewContact = async (data: any): Promise<Contact | null> => {
  try {
    const response = await useFetchApi<BaseResponse<Contact>>(
      "/contact-create",
      "create-customer",
      "post",
      data
    );
    if (response.status.value == "success") {
      return response.data.value?.data ?? null;
    } else {
      return null;
    }
  } catch (error: any) {
    ElMessage.error(error.response.message ?? error);
    return null;
  }
};

const handleSubmitContact = async (formData: Contact) => {
  try {
    const contact: Contact | null = await createNewContact({
      parent_id: formData.parent_id,
      parent_version: formData.parent_version,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      tax_id: formData.tax_id,
      website: formData.website,
      title: formData.title,
      is_personal: formData.is_personal,
      is_company: formData.is_company,
      tags: formData.tags?.toString(),
      unique_id: formData.unique_id,
      ownership: formData.ownership,
    });
    if (contact !== null) {
      ruleForm.requester_id = contact.unique_id;
      ruleForm.requester_version = contact.version;
      ruleForm.requester_name = contact.name ?? "";
      ruleForm.requester = contact;
    }
    dialogContact.value = false;
  } catch (error) {
    console.log("eror", error);
  }
};

const handleResetContact = () => {
  formFieldsRefContact.value?.resetForm();
  dialogContact.value = false;
};

const onHandleSelectContact = async (data: Contact) => {
  console.log("masuk select");
  ruleForm.requester_id = data.unique_id;
  ruleForm.requester_version = data.version;
  ruleForm.requester_name = data.name ?? "";
  ruleForm.requester = data;

  console.log("ruleForm", ruleForm);
};

const submitPurchaseRequest = async () => {
  try {
    const formData = new FormData();

    // Append main purchase request data
    formData.append("unique_id", `${ruleForm.unique_id}`);
    formData.append("source_document", `${ruleForm.source_document}`);
    formData.append("unique_code", ruleForm.unique_code);
    formData.append("requester_id", ruleForm.requester_id || "");
    formData.append("status", ruleForm.status);

    // Append items
    ruleForm.items.forEach((item, index) => {
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
        `${item.reference}`.toLocaleLowerCase()
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
      formData.append(`item_request_trail[${index}][status]`, `${item.status}`);
    });

    // Append files
    fileList.value.forEach((file, index) => {
      if (file.raw) {
        formData.append(`files[${index}]`, file.raw);
      }
    });

    const response = await useFetchApi<BaseResponse<PurchaseRequest>>(
      "/purchase-request-create",
      "create-purchase-request",
      "post",
      formData
    );

    if (response.status.value === "success") {
      ElMessage.success("Purchase request berhasil dibuat");
      router.push(
        `/supply-chain-management/purchase/request/${response.data.value?.data?.unique_id}`
      );
    }
  } catch (error: any) {
    ElMessage.error(
      error.response?.data?.message || "Gagal membuat purchase request"
    );
    throw error;
  }
};

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  formEl.resetFields();
  ruleForm.items = [];
  fileList.value = [];
};

// Watch for search changes
watchDebounced(
  () => itemRequestSearch.keyword,
  () => {
    itemRequestSearch.offset = "1";
    fetchItemRequests();
  },
  { debounce: 500 }
);

const fetchInquiryDetail = async () => {
  loading.value = true;
  try {
    // Fetch related purchase orders
    const inquiry = await useFetchApi<BaseResponse<Inquiry>>(
      `/inquiries-read/${inquiry_id.value}`,
      "inquiry",
      "get",
      null
    );

    if (inquiry.status.value === "success") {
      if (inquiry.data.value?.data) {
        const inquiryData: Inquiry = inquiry.data.value.data;
        ruleForm.requester_id = inquiryData.request_to_id;
        ruleForm.requester_name = inquiryData.request_to?.name ?? "";
        ruleForm.requester_version = inquiryData.request_to?.version ?? 0;
        ruleForm.source_document = inquiryData.unique_code;
        addItemsToForm(inquiryData.item_request, inquiryData.unique_code);
      }
    }
  } catch (error) {
    console.error("Failed to fetch related data", error);
  } finally {
    loading.value = false;
  }
};

const fetchDataEdit = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<PurchaseRequest>>(
      `/purchase-request-read/${id.value}`,
      "detail-canvassing",
      "get",
      null
    );

    if (response.status.value == "success") {
      const request: PurchaseRequest | null = response.data.value?.data ?? null;
      if (request != null) {
        (ruleForm.source_document = request.source_document),
          (ruleForm.unique_id = request.unique_id);
        ruleForm.unique_code = request.unique_code;
        ruleForm.requester_id = request.requester_id;
        ruleForm.requester_version = request.requester_version;
        ruleForm.status = request.status;
        // ruleForm.items = request.purchase_request_items.map((value) => ({
        //     unique_id: value.unique_id,
        //     unique_code: value.unique_code,
        //     purchase_request_id: value.purchase_request_id,
        //     item_request_id: value.item_request_id,
        //     catalogue_name: value.catalogue_name,
        //     item_request_number: value.item_request_number,
        //     request_quantity: value.request_quantity,
        //     request_purchase_quantity: value.request_purchase_quantity, // Default to same as request quantity
        //     purchase_request_version: value.purchase_request_version,
        //     item_request_version: value.item_request_version ?? 1,
        //     status: value.status,
        // }));
      }
    }
  } catch (error: any) {
    ElMessage.error(error.response?.message ?? error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (id.value) {
    fetchDataEdit();
  }
  if (inquiry_id.value) {
    fetchInquiryDetail();
  }
  fetchItemRequests();
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
</style>
