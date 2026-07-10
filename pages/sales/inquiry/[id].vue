<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3">
          Request -
          {{
            !inquiryData.pending && inquiryData.data
              ? inquiryData?.data?.unique_code
              : ""
          }}
        </span>
      </template>
    </el-page-header>

    <el-tabs
      v-model="activeNameTab"
      class="demo-tabs mt-5"
      v-if="!loading"
      type="border-card"
    >
      <el-tab-pane label="Inquiry" name="inquiry">
        <InquiryDetail
          v-if="!inquiryData.pending && inquiryData.data"
          :data-interface="inquiryData!"
          @on-canvassing-click="onCanvassingClick"
        />
      </el-tab-pane>
      <el-tab-pane label="CANVASSING" name="canvassing" class="h-full">
        <div v-if="loading">Loading.....</div>
        <div
          v-else-if="!loading && !inquiryData.pending && inquiryData.data"
          class="h-full"
        >
          <div v-if="canvassing.pending == true" class="flex justify-center">
            Menunggu Data....
          </div>
          <div v-else>
            <CanvassingDetail
              v-if="canvassing.data"
              :canvassingData="canvassing.data!"
              :privilages="canvassing.privilege ?? []"
              :itemHighlights="[]"
            />
            <NuxtLink v-else href="">Buat Canvassing</NuxtLink>
          </div>
        </div>

        <el-result
          v-else
          icon="warning"
          title="Belum ada Canvassing Terkait!"
          sub-title="Data Canvassing yang terkait dengan inquiry ini belum ada!"
        >
          <template #extra>
            <NuxtLink
              class="el-button el-button--primary"
              :href="`/sales/canvassing/add?inquiry_id=${inquiryData?.data?.unique_id}`"
              >Buat Canvassing</NuxtLink
            >
          </template>
        </el-result>
      </el-tab-pane>
      <el-tab-pane label="RAB" name="rab">
        <div v-if="loading">Loading.....</div>
        <div v-else-if="!loading && !inquiryData.pending && inquiryData.data">
          <el-row :gutter="20" class="mb-3">
            <el-col :span="6">
              <el-input
                v-model="canvassing_search.keyword"
                size="default"
                placeholder="Cari canvassing..."
                clearable
              />
            </el-col>
            <NuxtLink
              class="el-button el-button--primary el-button--default"
              href="/sales/quotation/add"
            >
              Buat Canvassing Baru
            </NuxtLink>
            <el-button
              size="default"
              :loading-icon="Eleme"
              :loading="loading"
              @click="
                () => {
                  rabRefreshTrigger++;
                }
              "
            >
              Muat Ulang
            </el-button>
          </el-row>
          <CanvassingTable
            :refresh-trigger="rabRefreshTrigger"
            :request_search="rab_search"
            :fetch-key="'get-rab-inquiry'"
            :type="'RAB'"
            @selection-change="(value) => {}"
          />
        </div>
        <el-result
          v-else
          icon="warning"
          title="Belum ada RAB Terkait!"
          sub-title="Data RAB yang terkait dengan inquiry ini belum ada!"
        >
          <template #extra v-if="canvassing.data">
            <el-button type="primary">Buat RAB</el-button>
          </template>
        </el-result>
      </el-tab-pane>
      <el-tab-pane label="Penawaran" name="offer">
        <div v-if="loading">Loading.....</div>
        <div v-else-if="!loading && !inquiryData.pending && inquiryData.data">
          <OfferTable
            :refresh_trigger="refreshTrigger"
            :request_search="offer_search"
            :fetch-key="'get-offer-to-customer'"
            v-on:has-bulk="(value) => {}"
            :type="'out'"
          />
        </div>
        <el-result
          v-else
          icon="warning"
          title="Belum ada Penawaran Terkait!"
          sub-title="Data Penawaran yang terkait dengan inquiry ini belum ada!"
        >
          <template #extra v-if="rab.data">
            <NuxtLink
              class="el-button el-button--primary"
              :href="`/sales/offer/add?canvassing_id=${canvassing?.data?.unique_id}&type=out`"
              >Buat Penawaran</NuxtLink
            >
          </template>
        </el-result>
      </el-tab-pane>
      <el-tab-pane label="SO" name="so">
        <div v-if="!loading && !inquiryData.pending && inquiryData.data">
          <OrderTable
            :request_search="so_search"
            :refresh-key="'get-sales-order'"
            :refresh-trigger="refreshTrigger"
            @has-bulk="(value) => {}"
            v-on:on-pending="(value) => (loading = value)"
            @on-success="
              (value) => {
                console.log('purchase order data ', value);
              }
            "
          />
        </div>
      </el-tab-pane>
    </el-tabs>
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import { Eleme } from "@element-plus/icons-vue";
import { NuxtLink } from "#components";
import { ElLoading } from "element-plus";
import { ref, onMounted } from "vue";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";
import type { Contact } from "~/types/contact";
import { InquiryStatus, type Inquiry } from "~/types/inquiry";
import {
  ItemRequestTrailStatus,
  type ItemRequest,
  type ItemRequestTrail,
} from "~/types/item_request";
import type { Maintenance } from "~/types/maintenance";
import type { BaseResponse, DataInterface } from "~/types/response";
import ErrorPage from "~/components/trums/ErrorPage.vue";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { PurchaseOrder } from "~/types/scm/purchase_order";
import type { AddressType } from "~/types/address";
import ActionNotPermitted from "~/components/trums/ActionNotPermitted.vue";
import RABDetail from "../quotation/components/CanvassingDetail.vue";
import CanvassingDetail from "../canvassing/components/CanvassingDetail.vue";
import InquiryDetail from "./components/InquiryDetail.vue";
import { CanvassingStatus, type Canvassing } from "~/types/scm/canvasing";
import type { Permission } from "~/types/menu";
import { ReferencePriceTag, type Pricetag } from "~/types/pricetag";
import OfferDetail from "../offer/components/OfferDetail.vue";
import CanvassingTable from "../canvassing/components/CanvassingTable.vue";
import OfferTable from "../offer/components/OfferTable.vue";
import OrderTable from "../order/components/OrderTable.vue";
import type { ResponsePagination } from "~/types/response_pagination";
import { fa } from "element-plus/es/locale/index.mjs";

definePageMeta({
  middleware: ["auth", "check-access"],
  name: "Detail Permintaan SI",
  requiredPermission: "canvassing-read",
});
const router = useRouter();

const errorPage = ref<boolean>(false);
const refreshTrigger = ref<number>(0);

const activeNameTab = ref("inquiry");

const goBack = () => router.back();
const id = ref<string>((router.currentRoute.value.params.id as string) ?? "");

const loadingInquiry = ref<boolean>(true);

const inquiryData = ref<DataInterface<Inquiry>>({
  code: 200,
  data: null,
  pending: true,
  message: "",
});
const loading = ref<boolean>(false);
const loadingService = ElLoading.service({
  lock: true,
  text: "Loading",
  background: "rgba(0, 0, 0, 0.7)",
});
const loadingRAB = ref<boolean>(false);
const canvassing = ref<DataInterface<Canvassing>>({
  code: 200,
  data: null,
  message: "",
  pending: true,
});

const canvassingRefreshTrigger = ref<number>(0);
const canvassing_search = ref<RequestSearch>({
  column: [],
  keyword: "",
  limit: "1",
  offset: "1",
  table: "canvassing",
  sort: null,
});

const rabRefreshTrigger = ref<number>(0);
const rab_search = ref<RequestSearch>({
  column: [],
  keyword: "",
  limit: "1",
  offset: "1",
  table: "canvassing",
  sort: null,
});
const offer_search = ref<RequestSearch>({
  keyword: "",
  table: "pricetag",
  column: [
    {
      pricetag_item: {
        catalogue_id: [],
      },
    },
  ],
  sort: null,
  offset: "1",
  limit: "1",
});

const so_search = ref<RequestSearch>({
  keyword: "",
  table: "purchase_order",
  column: [
    {
      purchase_order_item: {
        catalogue_id: [],
      },
    },
  ],
  sort: null,
  offset: "1",
  limit: "1",
});

const rab = ref<DataInterface<Canvassing>>({
  code: 200,
  data: null,
  message: "",
  pending: true,
});

const penawaran = ref<DataInterface<Pricetag>>({
  code: 200,
  data: null,
  message: "",
  pending: true,
});

const privilages = ref<Permission[]>([]);

const loadingPenawaran = ref<boolean>(false);
const loadingSO = ref<boolean>(false);
const salesOrder = ref<DataInterface<PurchaseOrder>>({
  code: 200,
  data: null,
  message: "",
  pending: true,
});

// const query_search_item_request = ref<RequestSearch>({
//   column: [],
//   keyword: "",
//   limit: "10",
//   offset: "1",
//   sort: {
//     column: "created_at",
//     order: OrderColumn.DESC,
//   },
//   table: "item_request",
//   flag: "form",
// });

// const item_request = await useAsyncData("fetch-item-request", async () => {
//   if (query_search_item_request.value.column.length > 0) {
//     const res = await useFetchApi<ResponsePagination<ItemRequest[]>>(
//       `/search`,
//       "fetch-item-request-in-id",
//       "post",
//       query_search_item_request.value
//     );
//     return res.data.value;
//   }
// });

// watch(
//   () => query_search_item_request.value,
//   () => item_request.refresh(),
//   { deep: true }
// );
// watch(
//   () => item_request.data.value?.data,
//   (newValue) => {
//     const inquiry: Inquiry = inquiryData.value.data!;

//     inquiry.item_request = [
//       ...(inquiryData.value.data?.item_request ?? []),
//       ...(newValue || []).map((element) => ({
//         ...element,
//         files: [...(element.catalogue?.files ?? []), ...(element.files ?? [])],
//       })),
//     ];

//     inquiryData.value = {
//       code: 200,
//       data: inquiry,
//       message: "",
//       pending: false,
//     };
//     console.log("currentPage", item_request.data.value?.current_page);
//     console.log("total_page", item_request.data.value?.total_page);
//     if (
//       item_request.status.value != "pending" &&
//       item_request.data.value?.data
//     ) {
//       if (
//         item_request.data.value?.current_page! <
//         item_request.data.value?.total_page
//       ) {
//         query_search_item_request.value.offset = `${
//           Number(query_search_item_request.value.offset) + 1
//         }`;
//       } else {
//         loadingInquiry.value = false;
//       }
//     }
//   }
// );

const fetchInquiry = async () => {
  inquiryData.value.pending = true;
  try {
    // Fetch related purchase orders
    const inquiry = await useFetchApi<BaseResponse<Inquiry>>(
      `/inquiries-read/${id.value}`,
      "inquiry",
      "get",
      null
    );

    if (inquiry.status.value === "success") {
      if (inquiry.data.value?.data) {
        const inquiryDataValue: Inquiry = inquiry.data.value!.data!;

        (inquiryDataValue.item_request || []).forEach((element) => {
          element.files = [
            ...(element.catalogue?.files ?? []),
            ...(element.files ?? []),
          ];
        });

        inquiryData.value = {
          code: 200,
          data: inquiryDataValue,
          message: "",
          pending: false,
        };

        // query_search_item_request.value.column = [
        //   {
        //     inquiry_id: [inquiryDataValue.unique_id],
        //   },
        // ];

        canvassing_search.value.column = [
          {
            source_document: [inquiryData.value.data?.unique_code],
            status: [
              CanvassingStatus.DRAFT,
              CanvassingStatus.PENDING_APPROVAL_RAB,
              CanvassingStatus.CANVASSING,
              CanvassingStatus.DONE,
            ],
          },
        ];

        rab_search.value.column = [
          {
            canvassing_item: {
              catalogue_id: (inquiryData.value.data?.item_request ?? []).map(
                (value) => value.catalogue_id
              ),
            },
            status: [
              CanvassingStatus.PENDING_APPROVAL,
              CanvassingStatus.RAB,
              CanvassingStatus.DONE,
            ],
          },
        ];
        offer_search.value.column = [
          {
            pricetag_item: {
              catalogue_id: (inquiryData.value.data?.item_request ?? []).map(
                (value) => value.catalogue_id
              ),
            },
            category: ["penawaran"],
            type: "out",
          },
        ];

        so_search.value.column = [
          {
            purchase_order_item: {
              catalogue_id: (inquiryData.value.data?.item_request ?? []).map(
                (value) => value.catalogue_id
              ),
            },
            type: "so",
          },
        ];

        fetchCanvassing();
        // fetchRAB();
      } else {
        inquiryData.value = {
          code: 200,
          data: null,
          message: "",
          pending: false,
        };
      }
    }
  } catch (error) {
    console.error("Failed to fetch related data", error);
  } finally {
    inquiryData.value.pending = false;
    loadingService.close();
  }
};
const fetchCanvassing = async () => {
  canvassing.value.pending = true;
  try {
    // Fetch related purchase orders
    const response = await useFetchApi<BaseResponse<Canvassing[]>>(
      `/search`,
      "fetch-canvassing",
      "post",
      canvassing_search.value
    );

    if (response.status.value == "success") {
      if (response.data.value?.data) {
        const canvassingList: Canvassing[] = response.data.value?.data ?? [];
        if (canvassingList.length > 0) {
          canvassing.value = {
            code: 200,
            data: canvassingList[0],
            message: response.data.value.message ?? "",
            pending: false,
            privilege: response.data.value.privilege ?? [],
          };
        }
      } else {
        canvassing.value = {
          code: 200,
          data: null,
          message: "",
          pending: false,
        };
      }
    }
  } catch (error) {
    console.error("Failed to fetch related data", error);
  } finally {
    canvassing.value.pending = false;
  }
};

const onCanvassingClick = () => {
  let url = `/sales/canvassing/add?inquiry_id=${inquiryData?.value.data?.unique_id}`;

  if (canvassing.value.data) {
    // url = `/sales/canvassing/add?id=${canvassing.value.data.unique_id}`;
    activeNameTab.value = "canvassing";
    return;
  }

  window.location.href = url;
};

// watch(inquiryData.value!, fetchCanvassing, {immediate: true});

onMounted(() => {
  if (id.value) {
    fetchInquiry();
  }
});
</script>
