<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3"> Buat Memo Transaksi </span>
      </template>
    </el-page-header>
    <el-card
      class="my-3"
      shadow="hover"
      v-loading="loading"
      element-loading-text="Loading..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      element-loading-background="rgba(122, 122, 122, 0.8)"
      v-if="!loading && data"
    >
      <template #header>
        <div class="card-header flex justify-end">Memo Transaksi</div>
      </template>

      <div class="flex gap-3 my-3">
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="small" :label-width="200">
            <el-descriptions-item
              label="Nomor Referensi"
              label-class-name="font-bold"
            >
              {{ data?.sourcing_document || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label-class-name="font-bold" label="Nomor SO">
              {{ data?.unique_code || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label-class-name="font-bold" label="Kontak">
              {{ data?.vendor?.name || "-" }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="small" :label-width="200">
            <el-descriptions-item label-class-name="font-bold" label="PIC">
              {{ data?.pic_name || "-" }}
            </el-descriptions-item>
            <el-descriptions-item
              label-class-name="font-bold"
              label="Tanggal PO"
            >
              {{ data?.date != null ? formatLocalDate(data?.date) : "-" }}
            </el-descriptions-item>

            <el-descriptions-item
              label-class-name="font-bold"
              label="Estimasi Sampai"
            >
              {{
                data?.expected_arrival != null
                  ? formatLocalDate(data?.expected_arrival)
                  : "-"
              }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <!-- <div
        class="text-sm mt-1"
        v-if="data?.additional_information"
        v-html="`${extractDescription(data?.data?.additional_information)}`"
      ></div>
      <span v-else class="text-sm text-gray-400"
        >Tidak ada informasi tambahan</span
      > -->
    </el-card>

    <el-card class="mb-3" shadow="hover">
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
        <el-form-item label="Alamat Pengiriman" prop="address_view">
          <el-autocomplete
            v-model="ruleForm.address_view"
            :fetch-suggestions="querySearchAddress"
            :trigger-on-focus="false"
            clearable
            class="inline-input w-50"
            placeholder="Cari Alamat/Buat Baru"
            @select="(record) => handleSelectAddress(record)"
          >
            <template #default="{ item }">
              <div class="name">{{ item.name }}</div>
              <span class="street text-sm">{{ item.street }}</span>
            </template>
          </el-autocomplete>
        </el-form-item>

        <el-form-item v-if="ruleForm.address" label="Dikirim ke">
          <div>
            <div>{{ ruleForm.address.address_name }}</div>
            <div>
              {{ ruleForm.address.street }},
              {{ generateResultSearchAddress(ruleForm.address).name }}
            </div>
          </div>
        </el-form-item>
        <el-form-item label="Metode Pengiriman" prop="delivery_method">
          <el-radio-group v-model="ruleForm.delivery_method">
            <el-radio :value="DeliveryMethod.DIKIRIM" size="small">{{
              getDeliveryMethodLabel(DeliveryMethod.DIKIRIM)
            }}</el-radio>
            <el-radio :value="DeliveryMethod.PICKUP" size="small">{{
              getDeliveryMethodLabel(DeliveryMethod.PICKUP)
            }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Deskripsi Pengiriman" prop="delivery_description">
          <el-input
            class="mt-2"
            v-model="ruleForm.delivery_description"
            placeholder="Deskripsi Pengiriman"
            type="textarea"
            clearable
          />
        </el-form-item>
        <el-form-item label="Informasi Tambahan" prop="description">
          <el-input
            class="mt-2"
            v-model="ruleForm.description"
            placeholder="Informasi Tambahan"
            type="textarea"
            clearable
          />
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mb-3" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>Purchase Order Items</span>
        </div>
      </template>
      <TrumsDragScrollTable>
        <el-table
          :data="showItemMemo ?? []"
          row-key="unique_id"
          :expand-row-keys="getExpandRowKeys ?? []"
          border
        >
          <el-table-column prop="catalogue_name" label="Item" width="400">
            <template #default="{ row }">
              <div v-if="row.type == 'child'" class="flex items-center gap-2">
                <el-button
                  :disabled="row.po_id"
                  type="danger"
                  link
                  @click="
                    () =>
                      deleteITemMemoVendor(
                        row.parent_index,
                        parseInt(row.index)
                      )
                  "
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
                <span>{{ row.catalogue_name }}</span>
              </div>
              <span v-else>{{ row.catalogue_name }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="quantity"
            label="QTY"
            align="center"
            :width="200"
          >
            <template #default="{ row, $index }">
              <el-input-number
                v-if="row.type == 'child' && !row.po_id"
                v-model="row.quantity"
                :min="1"
                @blur="() => onChangeQuantity(row, $index)"
              />
              <span v-else>{{ row.quantity }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="unit_name"
            label="UOM"
            align="center"
            width="100"
          />
          <el-table-column
            prop="unit_name"
            label="UOM"
            align="center"
            width="100"
          />
          <el-table-column
            prop="status_stok"
            label="Stok"
            align="center"
            width="100"
          />
          <el-table-column
            prop="delivery"
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
                <el-icon
                  v-if="row.type == 'child' && !row.po_id"
                  color="#409efc"
                  @click="
                    () => changeItem(row.parent_index, parseInt(row.index))
                  "
                  ><Refresh
                /></el-icon>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="po_number"
            label="No.PO"
            align="center"
            width="200"
          >
            <template #default="{ row }">
              <span
                v-if="row.po_id"
                class="text-blue-600 cursor-pointer"
                @click="() => openDetailPoVendor(row.po_id)"
              >
                {{ row.po_number }}
              </span>
              <span v-else>N/A</span>
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
                :href="`/sales/quotation/${row.canvassing_id}`"
                class="text-blue-600"
                >{{ row.canvassing_number }}</NuxtLink
              >
              <span v-else></span>
            </template>
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
                  >{{ currencyWithoutSymbol((row as CanvassingItemMemoForm).unit_price, 0) }}</span
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
                  >{{ currencyWithoutSymbol((row as CanvassingItemMemoForm).total_price, 0) }}</span
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
                  >{{ currencyWithoutSymbol((row as CanvassingItemMemoForm).selling_price, 0) }}</span
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
                  >{{ currencyWithoutSymbol((row as CanvassingItemMemoForm).total_selling_price, 0) }}</span
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
                  >{{ currencyWithoutSymbol((row as CanvassingItemMemoForm).unit_po_price, 0) }}</span
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
                  >{{ currencyWithoutSymbol((row as CanvassingItemMemoForm).total_po_price, 0) }}</span
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
                >{{ currencyWithoutSymbol(calculateMarginNominal((row as CanvassingItemMemoForm).total_price, (row as CanvassingItemMemoForm).total_po_price), 0) }}</span
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
                >{{ customMathCeil(calculateMargin((row as CanvassingItemMemoForm).total_price, (row as CanvassingItemMemoForm).total_po_price))


























































































































































































                }}%</span
              >
            </template>
          </el-table-column>
        </el-table>
      </TrumsDragScrollTable>

      <div class="flex justify-end mt-3">
        <el-pagination
          background
          layout="prev, pager, next, sizes, total"
          :total="purchaseOrderItem?.total_data"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
    <el-card class="mb-3" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>Penerima Fee</span>
        </div>
      </template>
      <el-table :data="contactsFee" border style="width: 100%">
        <el-table-column label="Nama">
          <template #default="{ row, $index }">
            {{ row.party?.name || "N/A" }}
          </template>
        </el-table-column>

        <el-table-column label="No.RAB">
          <template #default="{ row }">
            {{ row.canvassing_code || "" }}
          </template>
        </el-table-column>

        <el-table-column :label="`Fee`" prop="amount">
          <template #default="{ row }">
            {{ currencyWithoutSymbol(row.amount, 0) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="mb-3" shadow="never">
      <template #header>
        <div class="card-header">
          <span>Daftar Penawaran Vendor</span>
        </div>
      </template>
      <div class="demo-collapse">
        <el-collapse v-model="activeCollapseVendor">
          <el-collapse-item
            v-for="vendor in pricetagList"
            :title="vendor.owner?.name ?? ''"
            :key="vendor.unique_id"
            :name="vendor.unique_id ?? ''"
          >
            <div>
              <el-descriptions title="" :column="1" size="small" border>
                <el-descriptions-item label="Nomor Penawaran">
                  <p
                    class="text-blue-600 cursor-pointer"
                    @click="() => openDetailVendor(vendor.unique_id)"
                  >
                    {{ vendor.unique_code ?? "N/A" }}
                  </p>
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

    <el-card class="mb-3" shadow="never" v-if="!loading">
      <template #header>
        <div class="card-header"><span>Biaya Lainya</span></div>
      </template>
      <div>
        <div
          class="flex justify-between items-center mb-4"
          v-for="({ ref, originalIndex }, index) in otherCost
            .map((ref, originalIndex) => ({ ref, originalIndex }))
            .filter(
              ({ ref }) => ref.adjustments_transaction?.category !== 'tax'
            )"
          :key="originalIndex"
        >
          <span class="flex flex-col">
            <span class="font-bold text-sm">{{
              ref.adjustment?.name
                ? ref.adjustment?.name
                : ref.adjustments_transaction?.name ?? ""
            }}</span>
            <div
              class="text-sm mt-1 italic text-gray-400"
              v-if="ref.description"
              v-html="`${extractDescription(ref.description)}`"
            ></div>
          </span>
          <span class="text-sm flex items-center gap-3">
            <span>{{
              ref.type == FeeType.AMOUNT
                ? currencyWithoutSymbol(ref.amount_nominal || 0, 0)
                : `${ref.value}%`
            }}</span>
            <el-button
              type="warning"
              :disabled="ref.reference_id != ''"
              link
              @click="() => openEditAdjustment(originalIndex)"
            >
              <el-icon><EditPen /></el-icon>
            </el-button>
            <!-- <el-input
              v-model="ref.tmp_amount_input"
              style="max-width: 300px"
              :disabled="false"
              placeholder="Masukan Nilai"
              @input="(value) => onInputAnotherCost(ref, value)"
              @blur="(value) => onBlurAntoherCost()"
            >
              <template #append>
                <el-select
                  v-model="ref.type"
                  :disabled="false"
                  style="width: 100px"
                >
                  <el-option label="%" value="percent" />
                  <el-option label="Rp" value="amount" />
                </el-select>
              </template>
            </el-input> -->
          </span>
        </div>
      </div>
      <el-button class="mt-4" style="width: 100%" @click="addAnotherCost">
        Tambah Item
      </el-button>
    </el-card>
    <el-card class="mb-3" shadow="never" v-if="!loading">
      <template #header>
        <div class="card-header"><span>Pajak</span></div>
      </template>
      <div>
        <div
          class="flex justify-between items-center mb-2"
          v-for="(ref, index) in otherCost.filter(
            (filter) => filter.adjustments_transaction?.category == 'tax'
          )"
        >
          <span class="font-bold text-sm">{{
            ref.adjustment?.name
              ? ref.adjustment?.name
              : ref.adjustments_transaction?.name ?? ""
          }}</span>
          <span class="text-sm flex items-center gap-3">
            <el-input
              v-model="ref.tmp_amount_input"
              style="max-width: 300px"
              :disabled="false"
              placeholder="Masukan Nilai"
              @input="
                (value) => {
                  // onInputAdjustment(ref);
                  ref.amount = Number(value);
                  console.log('ref', ref);
                }
              "
            >
              <template #append>
                <el-select
                  v-model="ref.type"
                  :disabled="false"
                  style="width: 100px"
                >
                  <el-option label="%" value="percent" />
                  <el-option label="Rp" value="amount" />
                </el-select>
              </template>
            </el-input>
          </span>
        </div>
      </div>
      <el-button class="mt-4" style="width: 100%" @click="addTax">
        Tambah Item
      </el-button>
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
    <el-card class="mb-3" shadow="never">
      <div class="flex justify-end">
        <el-button @click="cancellForm">Batal</el-button>
        <el-button type="primary" :loading="loading" @click="submitForm"
          >Simpan</el-button
        >
      </div>
    </el-card>

    <el-dialog
      v-model="modalSelectItem"
      title="Buat/Pilih Penawaran Baru"
      width="1000"
    >
      <PricetagItemSelect
        :customer_id="data?.vendor_id!"
        @on-selection="onSelectPricetagItem"
      />
    </el-dialog>
    <el-dialog
      v-model="modalEditAdjustment.modal"
      :title="`Edit Biaya ${
        modalEditAdjustment.index > 0
          ? otherCost[modalEditAdjustment.index].adjustments_transaction?.name
          : ''
      }`"
    >
      <el-form
        ref="formAdjustmentRef"
        :model="modelFormAdjustment"
        :rules="rulesFormAdjustment"
        label-position="top"
      >
        <el-form-item label="Amount" prop="modelAmount">
          <el-input
            v-model="modelFormAdjustment.modelAmount"
            :disabled="false"
            placeholder="Masukan Nilai"
          >
            <template #append>
              <el-select
                v-model="modelFormAdjustment.type"
                :disabled="false"
                style="width: 100px"
              >
                <el-option label="%" :value="FeeType.PERCENT" />
                <el-option label="Rp" :value="FeeType.AMOUNT" />
              </el-select>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="Deskripsi" prop="description">
          <el-input
            v-model="modelFormAdjustment.description"
            :disabled="false"
            type="textarea"
          />
        </el-form-item>
      </el-form>
      <div class="flex">
        <el-button type="info" @click="closeAdjustment">Batal</el-button>
        <el-button type="primary" @click="onSubmitAdjustment">Simpan</el-button>
      </div>
    </el-dialog>
    <ModalAdjustmentTransaction
      v-model:visible="visibleModalAdjustmentTransaction"
      @select-adjustment="handleSelectAdjustment"
      @create-new="visibleModalNewAdjustment = true"
      :data="adjustmentTransactions.data?.value?.data ?? []"
      :search-params="querySearchAdjustmentTransaction"
      @on-search="onSearchAdjsutment"
    />

    <el-dialog
      v-model="visibleModalNewAdjustment"
      title="Buat Biaya Lain"
      width="1000"
    >
      <AddAdjustment @submit="handleAdjustmentSubmit" />
    </el-dialog>

    <el-dialog
      v-model="offerDialogState"
      title="Detail Penawaran Vendor"
      width="80%"
    >
      <OfferDetail
        :data-interface="{
          code: 200,
          data:
            (offerDetail.data.value?.data || []).length > 0
              ? offerDetail.data.value!.data[0]
              : null,
          message: offerDetail?.data.value?.message ?? '',
          pending: offerDetail.status.value === 'pending',
          privilege: offerDetail?.data.value?.privilege ?? [],
        }"
      />
    </el-dialog>
    <el-dialog
      v-model="modalPOVendorDetail.modal"
      title="Detail Purchase Order"
      width="80%"
    >
      <PurchaseOrderDetailSCM
        mode="view"
        :order_id="modalPOVendorDetail.order_id!"
      />
    </el-dialog>
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import type { ResponsePagination } from "~/types/response_pagination";
import type {
  PurchaseOrder,
  PurchaseOrderItem,
} from "~/types/scm/purchase_order";
import { formatLocalDate, extractDescription } from "#imports";
import {
  CanvassingItemReference,
  CanvassingReference,
  CanvassingStatus,
  CanvassingVendorStatus,
  PaymentTerm,
  PaymentTermUnit,
  type Canvassing,
  type CanvassingForm,
  type CanvassingItem,
  type CanvassingItemForm,
  type CanvassingVendor,
} from "~/types/scm/canvasing";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import { currencyWithoutSymbol } from "#imports";
import {
  FeeType,
  ReferenceAdjustment,
  type AdjustmentTransaction,
  type ReferenceTransactionAdjustment,
} from "~/types/attribute_adjustment";
import { customMathCeil } from "#imports";
import { Delete, EditPen, Refresh } from "@element-plus/icons-vue";
import ModalSearchItemExample from "~/components/trums/ModalSearchItemExample.vue";
import {
  DeliveryMethod,
  type Pricetag,
  type Pricetag_item,
} from "~/types/pricetag";
import PricetagItemSelect from "~/components/trums/PricetagItemSelect.vue";
import ModalAdjustmentTransaction from "~/components/trums/ModalAdjustmentTransaction.vue";
import AddAdjustment from "~/components/trums/AddAdjustment.vue";
import type { Inquiry } from "~/types/inquiry";
import type { BaseResponse } from "~/types/response";
import type { ItemRequestTrail } from "~/types/item_request";
import type { PurchaseRequest } from "~/types/purchase_request";
import type { FormInstance, FormRules } from "element-plus";
import OfferDetail from "../../offer/components/OfferDetail.vue";
import { dayjs } from "element-plus";
import PurchaseOrderDetailSCM from "~/pages/supply-chain-management/purchase/order/components/PurchaseOrderDetailSCM.vue";
import type { TermOfPayment } from "~/types/payment_term";
import { getDeliveryMethodLabel } from "~/types/pricetag";
import type { AddressType } from "~/types/address";

type ReferenceTransactionAdjustmentMemo = ReferenceTransactionAdjustment & {
  canvassing_id: string;
  canvassing_code: string;
};

type FormTypeAdjustment = {
  amount: number;
  value: number;
  modelAmount: string;
  description: string;
  type: FeeType;
};

const contactsFee = ref<ReferenceTransactionAdjustmentMemo[]>([]);
const otherCost = ref<ReferenceTransactionAdjustment[]>([]);
const otherCostToSubmit = ref<ReferenceTransactionAdjustment[]>([]);

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

const router = useRouter();
const route = useRoute();
const { removeDuplicates } = useArray();
const config = useRuntimeConfig();

const baseImageURL = config.public.baseImageURL;

const goBack = () => router.back();

const purchaseOrderId = ref<string>(route.query.so_id as string);

const visibleModalNewAdjustment = ref<boolean>(false);
const visibleModalAdjustmentTransaction = ref(false);
const visibleModalSearchItemExample = ref(false);
const modalSelectItem = ref(false);
const modalPOVendorDetail = ref<{
  modal: boolean;
  order_id: string | null;
}>({
  modal: false,
  order_id: null,
});
const modalEditAdjustment = ref<{
  modal: boolean;
  index: number;
}>({
  modal: false,
  index: -1,
});

const activeCollapseVendor = ref<string[]>([""]);

const formAdjustmentRef = ref<FormInstance>();
const modelFormAdjustment = reactive<FormTypeAdjustment>({
  amount: 0,
  value: 0,
  modelAmount: "0",
  description: "",
  type: FeeType.AMOUNT,
});

const rulesFormAdjustment: FormRules = {
  modalAmount: [
    {
      required: true,
      message: "Amount Wajib Diisi!",
      trigger: "blur",
    },
  ],
};

const loading = ref(false);
const offerDialogState = ref<boolean>(false);

const parentIndexActive = ref<number>(-1);
const childIndexActive = ref<number>(-1);

const listPOitemVendor = ref<PurchaseOrderItem[]>([]);
const pricetagVendrorList = ref<Pricetag[]>([]);

const purchaseRequest = ref<PurchaseRequest | undefined>();
const inquiryData = ref<BaseResponse<Inquiry | undefined>>({
  success: false,
  message: "",
  privilege: [],
});

const request_search_pricetag_item = ref({
  keyword: "",
  catalogue_id: "",
  location: [],
  contact: [],
  quantity: 1,
  category: ["penawaran"],
  owner_id: "",
  type: "multi" as "single" | "multi",
  offset: 1,
  limit: 10,
  flag: "form",
});

const querySearchAdjustmentTransaction = ref<RequestSearch>({
  keyword: "",
  table: "adjustments_transaction",
  column: [],
  sort: null,
  limit: "10",
  offset: "1",
  flag: "form",
});

const request_search_vendor = ref<RequestSearch>({
  keyword: "",
  table: "pricetag",
  column: [],
  sort: null,
  offset: "1",
  limit: "1",
});

const priceTagItem = await useAsyncData("pricetag-search-items", async () => {
  const res = await useFetchApi<ResponsePagination<Pricetag_item[]>>(
    `/pricetag-item-read`,
    "pricetag-search-items",
    "post",
    request_search_pricetag_item.value
  );
  return res.data.value;
});

const offerDetail = await useAsyncData("pricetag-detail", async () => {
  const res = await useFetchApi<ResponsePagination<Pricetag[]>>(
    `/search/`,
    "pricetag-detail",
    "post",
    request_search_vendor.value
  );
  return res.data.value;
});

type PurchasOrderViewTree = {
  unique_id: string;
  item_name: string;
  item_id: string;
  quo_id: string;
  canvassing_id: string;
  canvassing_code: string;
  quantity: number;
  unit_name: string;
  quo_number: string;
  harga_quo: number;
  harga_po: number;
  total: number;
  children: PurchasOrderViewTree[];
};

const purchaseOrderItemsView = ref<PurchasOrderViewTree[]>([]);
const summeryView = ref<
  {
    label: string;
    amount: string;
    percent: string;
    description: string;
  }[]
>([]);

type CanvassingItemMemoForm = CanvassingItemForm & {
  unit_po_price: number;
  total_po_price: number;
  canvassing_number: string;
  canvassing_vendor_unique_id: string;
  po_number?: string;
  po_id?: string;
  status_stok?: string;
  delivery?: string;
};

type TotalPerRAB = {
  canvassing_id: string;
  total: number;
};

const payment_terms = ref<TermOfPayment[]>([]);
const item_memo = ref<CanvassingItemMemoForm[]>([]);
const list_canvassings = ref<string[]>([]);

const fee_canvassing = ref<
  {
    canvassing_id: string;
    canvassing_vendors: {
      unique_id: string;
      fee: ReferenceTransactionAdjustment[];
    }[];
  }[]
>([]);

const list_canvassing_vendors = ref<string[]>([]);
const total_per_RAB = ref<TotalPerRAB[]>([]);
const data = ref<PurchaseOrder | undefined>();

type FormMemo = {
  unique_id: string;
  description: string;
  delivery_id: string;
  delivery_version: number;
  address?: AddressType;
  address_view: string;
  delivery_method: DeliveryMethod;
  delivery_description: string;
  reference: CanvassingReference;
  reference_id: string;
};

const ruleForm = reactive<FormMemo>({
  unique_id: "",
  description: "",
  delivery_id: "",
  address_view: "",
  delivery_version: 0,
  reference: CanvassingReference.SO,
  reference_id: "",
  delivery_method: DeliveryMethod.DIKIRIM,
  delivery_description: "",
});

const rules: FormRules = {
  // source_document: [
  //   { required: true, message: "Nomor referensi wajib diisi", trigger: "blur" },
  // ],
  address_view: [
    {
      required: true,
      message: "Alamat pengiriman tidak boleh kosong!",
      trigger: "change",
    },
  ],
  delivery_method: [
    {
      required: true,
      message: "Metode Pengiriman tidak boleh kosong!",
      trigger: "change",
    },
  ],
};

const item_to_submit = ref<CanvassingItemForm[]>([]);

const closeAdjustment = () => {
  modalEditAdjustment.value = {
    modal: false,
    index: -1,
  };

  formAdjustmentRef.value?.resetFields();
};

const onSubmitAdjustment = () => {
  otherCost.value[modalEditAdjustment.value.index].type =
    modelFormAdjustment.type;
  if (modelFormAdjustment.type == FeeType.AMOUNT) {
    otherCost.value[modalEditAdjustment.value.index].amount = Number(
      modelFormAdjustment.modelAmount
    );
    otherCost.value[modalEditAdjustment.value.index].amount_nominal = Number(
      modelFormAdjustment.modelAmount
    );
  } else {
    otherCost.value[modalEditAdjustment.value.index].value = Number(
      modelFormAdjustment.modelAmount
    );
  }

  otherCost.value[
    modalEditAdjustment.value.index
  ].tmp_amount_input = `${modelFormAdjustment.amount}`;
  otherCost.value[modalEditAdjustment.value.index].description =
    modelFormAdjustment.description;

  closeAdjustment();
  calculateSummaryaData();
};

const openEditAdjustment = (index: number) => {
  modalEditAdjustment.value = {
    modal: true,
    index: index,
  };

  modelFormAdjustment.amount = otherCost.value[index].amount_nominal || 0;
  modelFormAdjustment.modelAmount = `${
    otherCost.value[index].type == FeeType.AMOUNT
      ? otherCost.value[index].amount_nominal || 0
      : otherCost.value[index].value
  }`;
  modelFormAdjustment.type = otherCost.value[index].type;
  modelFormAdjustment.value = otherCost.value[index].value || 0;
  modelFormAdjustment.description = otherCost.value[index].description || "";
};

const openDetailVendor = (unique_id: string) => {
  request_search_vendor.value.column = [
    {
      unique_id: [unique_id],
    },
  ];

  if (offerDetail.status.value !== "pending") {
    offerDialogState.value = true;
  }
};

const openDetailPoVendor = (unique_id: string) => {
  modalPOVendorDetail.value = {
    modal: true,
    order_id: unique_id,
  };
};

const fetchSoDetail = async () => {
  loading.value = true;
  try {
    // Fetch related purchase orders
    const response = await useFetchApi<ResponsePagination<PurchaseOrder>>(
      `/purchase-order-read/${purchaseOrderId.value}`,
      "fetch-po-detail",
      "get",
      null
    );

    if (response.status.value === "success") {
      data.value = response.data.value?.data;

      ruleForm.address = data.value?.address;
      ruleForm.delivery_id = data.value?.delivery_address_id || "";
      ruleForm.delivery_version = data.value?.delivery_address_version || 0;
      ruleForm.reference = CanvassingReference.SO;
      ruleForm.reference_id = data.value?.unique_id || "";
      ruleForm.address_view = data.value?.address?.address_name || "";

      await fetchPOItem();
      await fetchInquiry();
    }
  } catch (error) {
    console.error("Failed to fetch related data", error);
  } finally {
    loading.value = false;
  }
};

const fetchPOItem = async () => {
  try {
    // Fetch related purchase orders
    const response = await useFetchApi<ResponsePagination<PurchaseOrderItem[]>>(
      `/search`,
      "fetch-order-item",
      "post",
      request_search_po_item.value
    );

    if (response.status.value === "success") {
      if (response.data.value?.data) {
        purchaseOrderItem.value = response.data.value;
      }
    }
  } catch (error) {
    console.error("Failed to fetch related data", error);
  }
};

const fetchInquiry = async () => {
  try {
    const inquiry_request: RequestSearch = {
      keyword: "",
      table: "inquiries",
      column: [
        {
          reference: ["so"],
          reference_id: [data.value?.unique_id],
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

        console.log("data inquiry", inquiryDataValue);

        if (inquiryDataValue.length > 0) {
          inquiryData.value = {
            message: "",
            privilege: inquiry.data.value.privilege || [],
            success: true,
            data: inquiryDataValue[0],
          };

          await fetchPR();
          await fetchPOVendor();
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch related data", error);
  }
};
const fetchPR = async () => {
  try {
    const pr_request: RequestSearch = {
      keyword: "",
      table: "item_request_trail",
      column: [
        {
          reference: ["pr"],
          item_request_id: [inquiryData.value.data?.item_request[0].unique_id],
        },
      ],
      sort: null,
      offset: "1",
      limit: "1",
    };

    // Fetch related purchase orders
    const purchaseRequestResponse = await useFetchApi<
      ResponsePagination<ItemRequestTrail[]>
    >(`/search`, "fetch-inquiries", "post", pr_request);

    if (purchaseRequestResponse.status.value === "success") {
      if (purchaseRequestResponse.data.value?.data) {
        const item_request_trail: ItemRequestTrail[] =
          purchaseRequestResponse.data.value?.data ?? [];

        if (item_request_trail.length > 0) {
          purchaseRequest.value = item_request_trail[0]
            .data_reference as PurchaseRequest;
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch related data", error);
  }
};

const fetchPOVendor = async () => {
  try {
    const pr_request: RequestSearch = {
      keyword: "",
      table: "item_request_trail",
      column: [
        {
          reference: ["po"],
          item_request_id: [inquiryData.value.data?.item_request[0].unique_id],
        },
      ],
      sort: null,
      offset: "1",
      limit: "10",
    };

    // Fetch related purchase orders
    const purchaseRequestResponse = await useFetchApi<
      ResponsePagination<ItemRequestTrail[]>
    >(`/search`, "fetch-inquiries", "post", pr_request);

    if (purchaseRequestResponse.status.value === "success") {
      if (purchaseRequestResponse.data.value?.data) {
        const item_request_trail: ItemRequestTrail[] =
          purchaseRequestResponse.data.value?.data ?? [];

        if (item_request_trail.length > 0) {
          const list_po_vendor = item_request_trail.map(
            (map) => (map.data_reference as PurchaseOrder).unique_id
          );

          await fetchPOVendorItem(list_po_vendor);
          await fetchAdjustmentForPOVendor(list_po_vendor);
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch related data", error);
  }
};

const fetchAdjustmentForPOVendor = async (uniques: string[]) => {
  try {
    const request_search: RequestSearch = {
      keyword: "",
      column: [
        {
          reference: [ReferenceAdjustment.PURCHASEORDER],
          reference_id: uniques,
        },
      ],
      limit: "10",
      offset: "1",
      table: "reference_transaction_adjustment",
      sort: {
        column: "created_at",
        order: "DESC",
      },
      flag: "list",
    };

    const response = await useFetchApi<
      ResponsePagination<ReferenceTransactionAdjustment[]>
    >("/search", "fetch-reference-adjustment", "post", request_search);

    if (response.status.value == "success") {
      for (const refs of response.data.value?.data || []) {
        otherCost.value.push({
          ...refs,
          adjustment: refs.adjustments_transaction,
          unique_id: "",
          tmp_amount_input: `${refs.amount}`,
          amount_nominal: refs.amount,
          // reference: ReferenceAdjustment.CANVASSING,
          // reference_id: "",
          description: `${capitalizeWords(
            refs.adjustments_transaction?.name ?? ""
          )} ${(refs.data_reference as PurchaseOrder)?.vendor_name}`,
        });

        calculateSummaryaData();
      }
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  }
};

const fetchPOVendorItem = async (uniques: string[]) => {
  try {
    const request_search: RequestSearch = {
      keyword: "",
      column: [
        {
          purchase_order: {
            type: ["po"],
            unique_id: uniques,
          },
        },
      ],
      limit: "10",
      offset: "1",
      table: "purchase_order_item",
      sort: {
        column: "created_at",
        order: "DESC",
      },
      flag: "list",
    };

    const response = await useFetchApi<ResponsePagination<PurchaseOrderItem[]>>(
      "/search",
      "fetch-po-item",
      "post",
      request_search
    );
    if (response.status.value == "success") {
      listPOitemVendor.value = response.data.value?.data || [];
    }

    await initialItemMemo();
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  }
};

watch(
  () => listPOitemVendor.value,
  () => {
    console.log("po vendor item", listPOitemVendor.value);
  },
  { deep: true }
);

const adjustmentTransactions = await useAsyncData(
  "search-adjustment",
  async () => {
    const res = await useFetchApi<ResponsePagination<AdjustmentTransaction[]>>(
      `/search`,
      "search-adjustment",
      "post",
      querySearchAdjustmentTransaction.value
    );
    return res.data.value;
  }
);

const request_search_po_item = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      order_id: [purchaseOrderId.value],
    },
  ],
  limit: "10",
  offset: "1",
  table: "purchase_order_item",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
  flag: "list",
});

const purchaseOrderItem = ref<ResponsePagination<PurchaseOrderItem[]>>({
  success: false,
  current_page: 0,
  total_page: 0,
  total_data: 0,
  data: [],
});

const getContactsFee = async (
  reference: string[],
  reference_id: string[]
): Promise<ReferenceTransactionAdjustment[]> => {
  try {
    const request: RequestSearch = {
      keyword: "",
      column: [
        {
          reference: reference,
          reference_id: reference_id,
          adjustments_transaction: {
            name: ["Fee"],
          },
        },
      ],
      limit: "10",
      offset: "1",
      table: "reference_transaction_adjustment",
      sort: {
        column: "created_at",
        order: "DESC",
      },
      flag: "list",
    };

    const response = await useFetchApi<
      ResponsePagination<ReferenceTransactionAdjustment[]>
    >("/search", "search-ref-fee", "post", request);
    if (response.status.value == "success") {
      return response.data.value?.data || [];
    } else {
      return [];
    }
  } catch (error: any) {
    return [];
  }
};
const getPricetagItemDetail = async (
  unique_id: string
): Promise<Pricetag_item | undefined> => {
  try {
    const response = await useFetchApi<BaseResponse<Pricetag_item>>(
      `/pricetag-item-read/${unique_id}`,
      "detail-pricetag-item",
      "post",
      null
    );
    if (response.status.value == "success") {
      return response.data.value?.data;
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message || error);
  }
};

const onSelectPricetagItem = (item: Pricetag_item) => {
  const vendors =
    (item.data_reference as CanvassingItem | undefined)?.canvassing_vendor ??
    [];

  if (item.pricetag?.type == "in") {
    if (item.catalogue) {
      item_memo.value[parentIndexActive.value].children[
        childIndexActive.value
      ].catalogue = item.catalogue;
      item_memo.value[parentIndexActive.value].children[
        childIndexActive.value
      ].catalogue_name = displayCatalogueName(item.catalogue);
      item_memo.value[parentIndexActive.value].children[
        childIndexActive.value
      ].catalogue_id = item.catalogue_id || "";
    }

    item_memo.value[parentIndexActive.value].children[
      childIndexActive.value
    ].vendor_id = item.pricetag?.owner_id;
    item_memo.value[parentIndexActive.value].children[
      childIndexActive.value
    ].vendor_name = item.pricetag?.owner?.name || "";
    item_memo.value[parentIndexActive.value].children[
      childIndexActive.value
    ].quo_number = item.pricetag?.unique_code;
    item_memo.value[parentIndexActive.value].children[
      childIndexActive.value
    ].unit_id = item.unit_id;
    item_memo.value[parentIndexActive.value].children[
      childIndexActive.value
    ].unit_id = item.unit_name;
    item_memo.value[parentIndexActive.value].children[
      childIndexActive.value
    ].unit_price = item.price;
    item_memo.value[parentIndexActive.value].children[
      childIndexActive.value
    ].total_price =
      item_memo.value[parentIndexActive.value].children[childIndexActive.value]
        .quantity * item.price;
  } else {
    console.log("items", item);
    const match = vendors.findLast(
      (find) =>
        find.catalogue_id ==
        item_memo.value[parentIndexActive.value].children[
          childIndexActive.value
        ].catalogue_id
    );
    if (match) {
      item_memo.value[parentIndexActive.value].children[
        childIndexActive.value
      ].vendor_id = match.vendor_id;
      item_memo.value[parentIndexActive.value].children[
        childIndexActive.value
      ].vendor_name = match.vendor?.name || "";
      item_memo.value[parentIndexActive.value].children[
        childIndexActive.value
      ].quo_number = item.pricetag?.unique_code;
      item_memo.value[parentIndexActive.value].children[
        childIndexActive.value
      ].unit_id = item.unit_id;
      item_memo.value[parentIndexActive.value].children[
        childIndexActive.value
      ].unit_id = item.unit_name;
      item_memo.value[parentIndexActive.value].children[
        childIndexActive.value
      ].unit_price = match.unit_price;
      item_memo.value[parentIndexActive.value].children[
        childIndexActive.value
      ].total_price =
        item_memo.value[parentIndexActive.value].children[
          childIndexActive.value
        ].quantity * match.unit_price;
      item_memo.value[parentIndexActive.value].children[
        childIndexActive.value
      ].selling_price = item.price;
      item_memo.value[parentIndexActive.value].children[
        childIndexActive.value
      ].total_selling_price =
        item_memo.value[parentIndexActive.value].children[
          childIndexActive.value
        ].quantity * item.price;
    }
  }
  parentIndexActive.value = -1;
  childIndexActive.value = -1;
  modalSelectItem.value = false;

  calculateParentItem();
  findRecepientFee();
  calculateSummaryaData();
};

const generateFee = async () => {
  contactsFee.value = [];
  item_memo.value.forEach((element) => {
    (element.children || [])
      .filter((filter) => !filter.is_deleted)
      .forEach((child) => {
        child.contacts_fee.forEach((fee) => {
          if (fee.type == FeeType.PERCENT) {
            if (fee.value != null) {
              const totalProfitFee = Number(fee.value) + 100;
              const profit =
                child.selling_price - child.unit_price - child.ongkir;
              contactsFee.value.push({
                ...fee,
                amount: child.quantity * (profit / totalProfitFee) * fee.value,
                canvassing_id: element.canvassing_id || "",
                canvassing_code: element.canvassing_number,
              });
            }
          } else {
            contactsFee.value.push({
              ...fee,
              amount: fee.amount * child.quantity,
              canvassing_id: element.canvassing_id || "",
              canvassing_code: element.canvassing_number,
            });
          }
        });
      });
  });

  item_memo.value.forEach((element) => {
    const totalRAB = total_per_RAB.value.findLast(
      (find) => find.canvassing_id == element.canvassing_id
    );
    if (totalRAB) {
      element.contacts_fee.forEach((cFee) => {
        if (cFee.type == FeeType.PERCENT) {
          const feePercent = Number(cFee.value);
          cFee.amount = totalRAB.total * (feePercent / 100);
        }

        contactsFee.value.push({
          ...cFee,
          canvassing_id: element.canvassing_id || "",
          canvassing_code: element.canvassing_number,
        });
      });
    }
  });
};

const findRecepientFee = () => {
  item_memo.value = item_memo.value.map((parent) => {
    // Ambil semua party_id yang ada di fee child
    const childPartyIds = parent.children.flatMap((child) =>
      (child.contacts_fee || [])
        .filter((fee) => fee.reference === "canvassing_vendor")
        .map((fee) => fee.party_id)
    );

    return {
      ...parent,
      contacts_fee: (parent.contacts_fee || []).filter((fee) => {
        // Hapus fee parent jika party_id sama dengan fee child
        if (
          fee.reference === "canvassing" &&
          childPartyIds.includes(fee.party_id)
        ) {
          return false;
        }

        return true;
      }),
    };
  });

  generateFee();
};

const totalHargaBeli = computed(() => {
  return item_memo.value.reduce((sum, data) => sum + data.total_price, 0);
});
const totalHargaJual = computed(() => {
  return item_memo.value.reduce(
    (sum, data) => sum + data.total_selling_price,
    0
  );
});

const deleteITemMemoVendor = (parentIndex: number, childIndex: number) => {
  item_memo.value[parentIndex].children[childIndex].is_deleted = true;
  calculateParentItem();
  findRecepientFee();
  calculateReferences();
  calculateSummaryaData();
};

const showItemMemo = computed(() => {
  return item_memo.value.map((item) => ({
    ...item,
    children: item.children?.filter((child) => !child.is_deleted) ?? [],
  }));
});
const pricetagList = computed(() => {
  const list = removeDuplicates<Pricetag>(
    pricetagVendrorList.value,
    "unique_id"
  );
  return list;
});

const findChilds = async (
  element: PurchaseOrderItem,
  parentIndex: number
): Promise<CanvassingItemMemoForm[]> => {
  if (element.pricetag_item?.data_reference == undefined) {
    return [];
  } else {
    const memoChilds: CanvassingItemMemoForm[] = [];
    const canvVendor: CanvassingVendor[] = (
      (element.pricetag_item?.data_reference as CanvassingItem)
        .canvassing_vendor ?? []
    ).filter(
      (vendor) =>
        vendor.catalogue_id === element.catalogue_id &&
        vendor.status == CanvassingVendorStatus.SELECTED
    );

    let indexChild = 0;
    for (const vendor of canvVendor || []) {
      if (element.pricetag_item?.pricetag) {
        pricetagVendrorList.value.push(element.pricetag_item?.pricetag);
      }

      const unit_buy_price = vendor.unit_price || 0;
      const quantity = element.quantity;
      const total_buy_price = quantity * (vendor.unit_price || 0);

      const findPerRAB = total_per_RAB.value.findIndex(
        (find) =>
          find.canvassing_id ==
          (
            (element.pricetag_item?.data_reference as CanvassingItem) ||
            undefined
          )?.canvassing_id
      );

      if (findPerRAB >= 0) {
        total_per_RAB.value[findPerRAB].total += total_buy_price;
      } else {
        if (
          (
            (element.pricetag_item?.data_reference as CanvassingItem) ||
            undefined
          )?.canvassing_id
        ) {
          total_per_RAB.value.push({
            canvassing_id: (
              (element.pricetag_item?.data_reference as CanvassingItem) ||
              undefined
            )?.canvassing_id,
            total: total_buy_price,
          });
        }
      }

      let fees: ReferenceTransactionAdjustment[] = [];
      let pricetagItemDetail: Pricetag_item | undefined =
        await getPricetagItemDetail(vendor.pricetag_item_id || "");

      if (vendor.unique_id) {
        fees = await getContactsFee(["canvassing_vendor"], [vendor.unique_id!]);
      }

      const findPoItem: PurchaseOrderItem | undefined =
        listPOitemVendor.value.findLast(
          (find) =>
            find.purchase_order?.vendor_id == vendor.vendor_id &&
            find.catalogue_id == vendor.catalogue_id
        );

      memoChilds.push({
        index: `${indexChild}`,
        canvassing_id:
          (
            element.pricetag_item?.pricetag?.reference_data as
              | Canvassing
              | undefined
          )?.unique_id || "N/A",
        canvaasing_version: null,
        item_request_trail_version: null,
        item_request_trail_id: null,
        unique_id: vendor.unique_id,
        vendor_id:
          findPoItem?.purchase_order?.vendor?.unique_id ?? vendor.vendor_id,
        vendor_name:
          findPoItem?.purchase_order?.vendor?.name || vendor.vendor?.name || "",
        unit_id: vendor.unit_id,
        unit_name: vendor.unit_name,
        unit_version: vendor.unit_version,
        offer_item_id: null,
        offer_item_version: 0,
        catalogue_id: vendor.catalogue_id || "",
        catalogue_name: vendor.catalogue
          ? displayCatalogueName(vendor.catalogue)
          : vendor.catalogue_name,
        sn: "",
        quantity: findPoItem?.quantity || vendor.quantity,
        unit_price: findPoItem?.unit_price || vendor.unit_price,
        total_price:
          (findPoItem?.quantity || vendor.quantity) *
          (findPoItem?.unit_price || vendor.unit_price),
        status: CanvassingVendorStatus.SUBMITTED,
        taxes: [],
        editing: null,
        type: "child",
        type_item: "request",
        equivalent_id: null,
        children: [],
        selling_price: element.pricetag_item?.price || 0,
        total_selling_price:
          element.quantity * (element.pricetag_item?.price || 0),
        profit: vendor.profit_nominal || 0,
        profit_unit: "amount",
        fee: vendor.fee_nominal || 0,
        fee_unit: "amount",
        ongkir: vendor.ongkir,
        ongkir_unit: "amount",
        pricetag_item_id: vendor.pricetag_item_id || "",
        pricetag_item_version: vendor.pricetag_item_version,
        quo_number: element.pricetag_item?.pricetag?.unique_code || "",
        unit_po_price: element.po_unit_price || 0,
        total_po_price:
          (findPoItem?.quantity || vendor.quantity) *
          (element.po_unit_price || 0),
        contacts_fee: fees,
        canvassing_vendor_unique_id: vendor.unique_id || "",
        is_deleted: false,
        canvassing_number:
          (
            element.pricetag_item?.pricetag?.reference_data as
              | Canvassing
              | undefined
          )?.unique_code || "",
        parent_index: parentIndex,
        po_number: findPoItem?.purchase_order?.unique_code || "",
        po_id: findPoItem?.order_id,
        status_stok: pricetagItemDetail?.status_item,
        delivery: pricetagItemDetail?.delivery,
        expected_delivery: vendor.expected_delivery || "",
        reference: findPoItem
          ? CanvassingItemReference.PURCHASE_ORDER_ITEM
          : CanvassingItemReference.CANVASSING_VENDOR,
        reference_id: findPoItem
          ? findPoItem.unique_id
          : vendor.unique_id || "",
      });

      indexChild++;
    }

    return memoChilds;
  }
};

const initialItemMemo = async () => {
  item_memo.value = [];
  let parentIndex = 0;
  for (const element of purchaseOrderItem.value.data || []) {
    let childs: CanvassingItemMemoForm[] = [];

    childs = await findChilds(element, parentIndex);

    let feeAccum: ReferenceTransactionAdjustment[] = [];
    const canvassing_id = (
      element.pricetag_item?.pricetag?.reference_data as Canvassing | undefined
    )?.unique_id;
    if (canvassing_id) {
      feeAccum = await getContactsFee(["canvassing"], [canvassing_id]);
    }
    item_memo.value.push({
      index: "",
      canvassing_id:
        (
          element.pricetag_item?.pricetag?.reference_data as
            | Canvassing
            | undefined
        )?.unique_id || "",
      canvaasing_version: null,
      item_request_trail_version: null,
      item_request_trail_id: null,
      unique_id: element.unique_id,
      vendor_id: "",
      vendor_name: "",
      canvassing_vendor_unique_id: "",
      unit_id: element.unit_id,
      unit_name: element.unit_name,
      unit_version: null,
      offer_item_id: null,
      offer_item_version: 0,
      quo_number: element.pricetag_item?.pricetag?.unique_code || "",
      catalogue_id: element.catalogue_id || "",
      catalogue_name: element.catalogue
        ? displayCatalogueName(element.catalogue)
        : element.catalogue_name,
      sn: "",
      quantity: element.quantity,
      unit_price: childs.reduce((sum, data) => sum + (data.unit_price || 0), 0),
      total_price: childs.reduce((sum, data) => sum + data.total_price, 0),
      status: CanvassingVendorStatus.SUBMITTED,
      taxes: [],
      editing: null,
      type: "parent",
      type_item: "request",
      equivalent_id: null,
      children: childs,
      selling_price: element.unit_price || 0,
      total_selling_price: element.quantity * (element.unit_price || 0),
      profit: 0,
      profit_unit: "amount",
      fee: 0,
      fee_unit: "amount",
      ongkir: 0,
      ongkir_unit: "amount",
      pricetag_item_id: "",
      pricetag_item_version: 0,
      contacts_fee: feeAccum,
      unit_po_price: element.po_unit_price || 0,
      total_po_price: (element.po_unit_price || 0) * element.quantity,
      is_deleted: false,
      reference: CanvassingItemReference.SO_ITEM,
      reference_id: element.unique_id,
      canvassing_number:
        (
          element.pricetag_item?.pricetag?.reference_data as
            | Canvassing
            | undefined
        )?.unique_code || "N/A",
    });

    parentIndex++;
  }
  calculateParentItem();
  findRecepientFee();
  calculateReferences();
  activeCollapseVendor.value = pricetagList.value.map((map) => map.unique_id);
};

const calculateParentItem = () => {
  item_memo.value.forEach((element) => {
    element.total_price = (element.children || [])
      .filter((filter) => !filter.is_deleted)
      .reduce((sum, data) => sum + data.total_price, 0);
    element.total_selling_price = (element.children || [])
      .filter((filter) => !filter.is_deleted)
      .reduce((sum, data) => sum + data.total_selling_price, 0);
  });
};

const getDPPNilaiLain = computed(() => {
  let dpp = 0;

  data.value?.reference_transaction.forEach((element) => {
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

const getExpandRowKeys = computed(() => {
  const rowKeys = item_memo.value
    .filter((value) => value.children && value.children.length > 0)
    .map((value) => value.unique_id!);

  return rowKeys;
});
const changeItem = (parentIndex: number, childIndex: number) => {
  parentIndexActive.value = parentIndex;
  childIndexActive.value = childIndex;
  modalSelectItem.value = true;
};

const handlePageChange = (page: number) => {
  request_search_po_item.value.offset = `${page}`;
};

const handleSizeChange = (size: number) => {
  request_search_po_item.value.limit = `${size}`;
};

const calculateMargin = (beli: number, jual: number) => {
  return ((jual - beli) / beli) * 100;
};
const calculateMarginNominal = (beli: number, jual: number) => {
  return (jual || 0) - Number(beli);
};

// watch(
//   () => request_search_po_item.value,
//   () => purchaseOrderItem.refresh(),
//   { deep: true }
// );

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

const calculateReferences = () => {
  otherCost.value = [];
  (data.value?.reference_transaction || []).forEach((element) => {
    if (
      element.adjustments_transaction?.category == "tax" &&
      element.adjustments_transaction?.name.toLowerCase() == "ppn"
    ) {
      element.description = "PPN Keluaran";
    }
    element.unique_id = "";
    if (element.type == FeeType.PERCENT) {
      element.tmp_amount_input = `${element.value}`;
    } else {
      element.tmp_amount_input = `${element.amount}`;
    }

    otherCost.value.push({ ...element, reference_id: "" });
  });

  calculateSummaryaData();
};

const onChangeQuantity = (row: CanvassingItemMemoForm, index: number) => {
  if (row.type == "child") {
    const parentIndex = row.parent_index!;
    item_memo.value[parentIndex].children[index].total_price =
      row.quantity * item_memo.value[parentIndex].children[index].unit_price;
  }
};

const onInputAnotherCost = (
  item: ReferenceTransactionAdjustment,
  value: string
) => {
  const anotherCostIndex = otherCost.value.findIndex(
    (find) =>
      find.adjustments_transaction?.unique_id ==
      item.adjustments_transaction?.unique_id
  );
  if (anotherCostIndex >= 0) {
    if (item.type == FeeType.PERCENT) {
      otherCost.value[anotherCostIndex].value = parseInt(value);
      otherCost.value[anotherCostIndex].tmp_amount_input = value;
    } else {
      otherCost.value[anotherCostIndex].amount = parseInt(value);
      otherCost.value[anotherCostIndex].tmp_amount_input = value;
    }
  }
};
const onBlurAntoherCost = () => calculateSummaryaData();

const handleSelectAdjustment = (items: AdjustmentTransaction[]) => {
  items.forEach((element) => {
    otherCost.value.push({
      unique_id: "",
      reference: ReferenceAdjustment.CANVASSING,
      reference_id: "",
      adjustment_id: element.unique_id,
      type: element.type,
      amount: element.default_value,
      created_at: 0,
      value: element.default_value,
      adjustment: element,
      adjustments_transaction: element,
      changeType: true,
      tmp_amount_input: `${element.default_value}`,
    });
  });
  visibleModalAdjustmentTransaction.value = false;
  calculateSummaryaData();
};

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

const querySearchAddress = (queryString: string, cb: (arg: any) => void) => {
  const request_search_address: RequestSearch = {
    keyword: queryString,
    table: "address",
    column: [],
    sort: {
      column: "contact_name",
      order: OrderColumn.ASC,
    },
    offset: "1",
    limit: "100",
  };

  useFetchApi<ResponsePagination<AddressType[]>>(
    "/search",
    "address",
    "post",
    request_search_address
  ).then((response) => {
    if (response.status.value == "success") {
      const resultApi: AddressType[] = response.data.value?.data!;

      if (resultApi.length > 0) {
        cb(resultApi.map(generateResultSearchAddress));
      } else {
        cb([
          {
            value: `Buat Alamat Baru`,
            new: true,
            name: `Buat Alamat Baru`,
            street: "",
          },
        ]);
      }
    }
  });
};

const handleSelectAddress = (record: Record<string, any>) => {
  if (record.new) {
    // dialogNewAddress.value = true;
  } else {
    ruleForm.address = record.address as AddressType;
    ruleForm.delivery_id = record.address_id;
    ruleForm.delivery_version = record.address_version;
    ruleForm.address_view = record.name;
  }
};

const onSearchAdjsutment = (keyword: string) =>
  (querySearchAdjustmentTransaction.value.keyword = keyword);

const handleAdjustmentSubmit = () => {
  visibleModalNewAdjustment.value = false;
  adjustmentTransactions.refresh();
};

const addAnotherCost = () => {
  querySearchAdjustmentTransaction.value.column = [
    {
      category: ["adjustment", "transform", "attribute"],
    },
  ];

  visibleModalAdjustmentTransaction.value = true;
};
const addTax = () => {
  querySearchAdjustmentTransaction.value.column = [
    {
      category: ["tax"],
    },
  ];

  visibleModalAdjustmentTransaction.value = true;
};

watchDebounced(
  () => querySearchAdjustmentTransaction.value,
  () => {
    adjustmentTransactions.refresh();
  },
  { deep: true }
);

const parseToSubmit = () => {
  if (route.params.unique_id) {
  } else {
    item_to_submit.value = item_memo.value.map((map) => ({
      ...map,
      unique_id: "",
      canvassing_id: "",
      canvaasing_version: 0,
      selling_price: map.unit_po_price,
      total_selling_price: map.total_selling_price,
      is_deleted: map.is_deleted,
      children: map.children.map((child) => ({
        ...child,
        unique_id: "",
        canvassing_id: "",
        contacts_fee: child.contacts_fee.map((fee) => ({
          ...fee,
          reference_id: "",
          unique_id: "",
        })),
      })),
    }));

    payment_terms.value = (data.value?.payment_terms || []).map((value) => ({
      ...value,
      unique_id: "",
    }));

    otherCostToSubmit.value = otherCost.value.map((map) => ({
      ...map,
      reference: ReferenceAdjustment.CANVASSING,
      unique_id: "",
    }));

    contactsFee.value = contactsFee.value.map((map) => ({
      ...map,
      unique_id: "",
      reference: ReferenceAdjustment.CANVASSING,
      reference_id: "",
    }));
  }
};

const submitForm = async () => {
  const hasError = item_memo.value.some(
    (parent) =>
      parent.children?.some(
        (child) =>
          child.checked &&
          (!child.expected_delivery || child.expected_delivery.trim() === "")
      ) ?? false
  );

  if (hasError) {
    ElMessage.error("Estimasi pengiriman belum lengkap!");
    return;
  }

  loading.value = true;
  try {
    parseToSubmit();

    // Membuat FormData
    const formData = new FormData();

    // Menambahkan data utama
    formData.append("unique_id", ruleForm.unique_id || "");
    formData.append("description", `${ruleForm.description}`);
    formData.append(`address_id`, `${ruleForm.delivery_id}`);
    formData.append(`address_version`, `${ruleForm.delivery_version}`);
    formData.append(`delivery_method`, `${ruleForm.delivery_method}`);
    formData.append(`delivery_description`, `${ruleForm.delivery_description}`);
    formData.append(`reference`, `${ruleForm.reference}`);
    formData.append(`reference_id`, `${ruleForm.reference_id}`);

    // Append canvassing_items dengan individual fields
    item_to_submit.value.forEach((item: CanvassingItemForm, i: number) => {
      formData.append(`canvassing_items[${i}][unique_id]`, `${item.unique_id}`);
      formData.append(
        `canvassing_items[${i}][canvassing_id]`,
        `${item.canvassing_id}`
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
      formData.append(
        `canvassing_items[${i}][total_selling_price]`,
        `${item.total_selling_price}`
      );
      formData.append(`canvassing_items[${i}][type_item]`, `${item.type_item}`);
      formData.append(
        `canvassing_items[${i}][equivalent_id]`,
        `${item.equivalent_id}`
      );
      formData.append(`canvassing_items[${i}][reference]`, `${item.reference}`);
      formData.append(
        `canvassing_items[${i}][reference_id]`,
        `${item.reference_id}`
      );

      // Append canvassing_vendor
      // Append canvassing_vendor fields satu per satu
      item.children.forEach((vendor: CanvassingItemForm, j: any) => {
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][unique_id]`,
          `${vendor.unique_id}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][expected_delivery]`,
          `${vendor.expected_delivery}`
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
          `canvassing_items[${i}][canvassing_vendor][${j}][total_selling_price]`,
          `${vendor.total_selling_price}`
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
          `${vendor.total_price}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][profit]`,
          `${vendor.profit}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][profit_percent]`,
          `${vendor.profit_percent}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][profit_nominal]`,
          `${vendor.profit_nominal}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][profit_unit]`,
          `${vendor.profit_unit}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][fee]`,
          `${vendor.fee}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][fee_percent]`,
          `${vendor.fee_percent}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][fee_nominal]`,
          `${vendor.fee_nominal}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][fee_unit]`,
          `${vendor.fee_unit}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][ongkir]`,
          `${vendor.ongkir}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][ongkir_unit]`,
          `${vendor.ongkir_unit}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][reference]`,
          `${vendor.reference}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][reference_id]`,
          `${vendor.reference_id}`
        );

        let referenceCanvassingVendor: ReferenceTransactionAdjustment[] =
          vendor.contacts_fee;

        referenceCanvassingVendor.forEach(
          (ref: ReferenceTransactionAdjustment, refIndex: number) => {
            if (
              ref.value != null &&
              ref.value != undefined &&
              ref.amount != null &&
              ref.amount != undefined
            ) {
              formData.append(
                `canvassing_items[${i}][canvassing_vendor][${j}][reference_transaction][${refIndex}][unique_id]`,
                `${ref.unique_id}`
              );
              formData.append(
                `canvassing_items[${i}][canvassing_vendor][${j}][reference_transaction][${refIndex}][adjustment_id]`,
                `${ref.adjustment_id}`
              );
              formData.append(
                `canvassing_items[${i}][canvassing_vendor][${j}][reference_transaction][${refIndex}][value]`,
                `${ref.value}`
              );
              formData.append(
                `canvassing_items[${i}][canvassing_vendor][${j}][reference_transaction][${refIndex}][amount]`,
                `${ref.amount_nominal}`
              );
              formData.append(
                `canvassing_items[${i}][canvassing_vendor][${j}][reference_transaction][${refIndex}][type]`,
                `${ref.type}`
              );
              formData.append(
                `canvassing_items[${i}][canvassing_vendor][${j}][reference_transaction][${refIndex}][party_type]`,
                `${ref.party_type}`
              );
              formData.append(
                `canvassing_items[${i}][canvassing_vendor][${j}][reference_transaction][${refIndex}][party_id]`,
                `${ref.party_id}`
              );
              formData.append(
                `canvassing_items[${i}][canvassing_vendor][${j}][reference_transaction][${refIndex}][reference]`,
                `${ref.reference}`
              );
              formData.append(
                `canvassing_items[${i}][canvassing_vendor][${j}][reference_transaction][${refIndex}][reference_id]`,
                `${ref.reference_id}`
              );
            }
          }
        );
      });
    });

    // Append reference_transaction dengan individual fields
    [...otherCostToSubmit.value, ...contactsFee.value].forEach((ref, i) => {
      const refFields = {
        unique_id: ref.unique_id,
        adjustment_id: ref.adjustment_id,
        value: ref.value,
        amount: ref.amount,
        type: ref.type,
        party_type: ref.party_type,
        party_id: ref.party_id,
        reference: ref.reference,
        reference_id: ref.reference_id,
      };

      Object.entries(refFields).forEach(([key, value]) => {
        formData.append(`reference_transaction[${i}][${key}]`, `${value}`);
      });
    });

    (payment_terms.value || []).forEach((term, iterm) => {
      formData.append(`payment_terms[${iterm}][unique_id]`, term.unique_id);
      formData.append(`payment_terms[${iterm}][name]`, term.name);
      formData.append(`payment_terms[${iterm}][value]`, `${term.value}`);
      formData.append(`payment_terms[${iterm}][unit]`, `${term.unit}`);
      formData.append(
        `payment_terms[${iterm}][term_of_payment]`,
        `${term.term_of_payment}`
      );
      formData.append(`payment_terms[${iterm}][duration]`, `${term.duration}`);
    });

    // Untuk debugging: lihat semua entries FormData
    console.log("=== FORM DATA ENTRIES ===");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    // Append files
    // fileList.value.forEach((element, index) => {
    //   formData.append(`files[${index}]`, element.raw as Blob);
    // });

    const response = await useFetchApi<BaseResponse<Canvassing>>(
      "/canvassing-create",
      "create-canvasing",
      "post",
      formData
    );
    if (response.status.value === "success") {
      ElMessage.success(`Berhasil Membuat Data Canvasing!`);

      // router.push(`/sales/quotation/${response.data.value?.data?.unique_id}`);
    }
  } catch (error: any) {
    ElMessage.error(error.response?.message ?? error);
  } finally {
    loading.value = false;
  }
};

const cancellForm = async () => {
  window.location.href = "/sales/order/" + purchaseOrderId.value;
};

onMounted(() => {
  fetchSoDetail();
});
</script>
