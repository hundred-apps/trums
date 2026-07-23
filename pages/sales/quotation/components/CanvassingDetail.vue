<template>
  <div>
    <el-card
      class="my-3"
      shadow="never"
      v-loading="loading"
      element-loading-text="Loading..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      element-loading-background="rgba(122, 122, 122, 0.8)"
    >
      <template #header>
        <div v-if="isMobile">
          <div
            v-if="canvassingData?.status === CanvassingStatus.RAB"
            class="card-header flex justify-center gap-2"
          >
            <el-button
              type="success"
              style="width: 100%"
              v-if="canvassingData?.status === CanvassingStatus.RAB"
              @click="() => submitApproveRab(CanvassingStatus.PENDING_APPROVAL)"
            >
              <el-icon class="me-2"><CircleCheck /></el-icon> Ajukan RAB
            </el-button>
            <el-dropdown placement="bottom" @command="handleCommand">
              <el-button>
                <el-icon><Tools /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">Edit</el-dropdown-item>
                  <el-dropdown-item command="delete" class="dropdown-delete"
                    >Hapus</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div
            v-if="canvassingData?.status === CanvassingStatus.DONE"
            class="card-header flex justify-center gap-2"
          >
            <el-button type="primary" :icon="Printer" @click="printSCMMemo">
              Cetak SCM Memo
            </el-button>
            <el-button type="danger" :icon="Close" @click="backToRab">
              Batalkan RAB
            </el-button>
          </div>
          <div
            v-if="
              canvassingData?.status === CanvassingStatus.PENDING_APPROVAL_RAB
            "
            class="card-header flex justify-center gap-2"
          >
            <NuxtLink
              class="el-button el-button--success w-full"
              :href="`/sales/quotation/add?id=${canvassingData?.unique_id}`"
            >
              Setuju & Buat RAB
            </NuxtLink>
            <el-button type="danger" :icon="Close" @click="backToRab">
              Tolak
            </el-button>
          </div>
          <div
            v-if="canvassingData?.status === CanvassingStatus.PENDING_APPROVAL"
            class="card-header flex justify-center gap-2"
          >
            <el-button
              v-if="canAccess('canvassing-approve', privilages, 2)"
              type="success"
              class="w-full"
              :icon="Check"
              @click="approve"
            >
              Setujui
            </el-button>
            <el-button
              v-if="canAccess('canvassing-approve', privilages, 2)"
              type="danger"
              :icon="Close"
              @click="decline"
            >
              Tolak
            </el-button>
            <el-button
              type="primary"
              class="w-full"
              v-if="
                (canvassingData?.status === CanvassingStatus.PENDING_APPROVAL ||
                  canvassingData?.status == CanvassingStatus.DONE) &&
                canvassingData?.status_cek == 'pending' &&
                canCheck
              "
              @click="
                () =>
                  confirmCheck(
                    'Mulai Pengecekan?',
                    'Ketika ada mulai pengecekan, RAB ini akan di tandai bahwa sedang dilakukan pengecekan!',
                    'progress'
                  )
              "
              >Mulai Pengecekan</el-button
            >
            <el-button
              type="success"
              v-if="
                (canvassingData?.status === CanvassingStatus.PENDING_APPROVAL ||
                  canvassingData?.status == CanvassingStatus.DONE) &&
                canvassingData?.status_cek == 'progress' &&
                canCheck
              "
              @click="
                () =>
                  confirmCheck(
                    'Selesai Pengecekan?',
                    'RAB ini akan di tandai bahwa telah di lakukan pengecekan!',
                    'completed'
                  )
              "
              >Selesaikan Pengecekan</el-button
            >
            <el-button
              type="danger"
              v-if="
                (canvassingData?.status === CanvassingStatus.PENDING_APPROVAL ||
                  canvassingData?.status == CanvassingStatus.DONE) &&
                (canvassingData?.status_cek == 'progress' ||
                  canvassingData?.status_cek == 'completed') &&
                canCheck
              "
              @click="
                () =>
                  confirmCheck(
                    'Batalkan Pengecekan?',
                    'RAB ini akan di tandai bahwa belum dilakukan pengecekan!',
                    'pending'
                  )
              "
              >Batalkan Pengecekan</el-button
            >
          </div>
        </div>
        <div v-else>
          <div class="card-header flex justify-end">
            <el-button
              type="primary"
              v-if="
                (canvassingData?.status === CanvassingStatus.PENDING_APPROVAL ||
                  canvassingData?.status == CanvassingStatus.DONE) &&
                canvassingData?.status_cek == 'pending' &&
                canCheck
              "
              @click="
                () =>
                  confirmCheck(
                    'Mulai Pengecekan?',
                    'Ketika ada mulai pengecekan, RAB ini akan di tandai bahwa sedang dilakukan pengecekan!',
                    'progress'
                  )
              "
              >Mulai Check</el-button
            >
            <el-button
              type="success"
              v-if="
                (canvassingData?.status === CanvassingStatus.PENDING_APPROVAL ||
                  canvassingData?.status == CanvassingStatus.DONE) &&
                canvassingData?.status_cek == 'progress' &&
                canCheck
              "
              @click="
                () =>
                  confirmCheck(
                    'Selesai Pengecekan?',
                    'RAB ini akan di tandai bahwa telah di lakukan pengecekan!',
                    'completed'
                  )
              "
              >Selesaikan Pengecekan</el-button
            >
            <el-button
              type="danger"
              v-if="
                (canvassingData?.status === CanvassingStatus.PENDING_APPROVAL ||
                  canvassingData?.status == CanvassingStatus.DONE) &&
                (canvassingData?.status_cek == 'progress' ||
                  canvassingData?.status_cek == 'completed') &&
                canCheck
              "
              @click="
                () =>
                  confirmCheck(
                    'Batalkan Pengecekan?',
                    'RAB ini akan di tandai bahwa belum dilakukan pengecekan!',
                    'pending'
                  )
              "
              >Batalkan Pengecekan</el-button
            >
            <el-button
              type="danger"
              v-if="
                canDelete &&
                (canvassingData?.status === CanvassingStatus.RAB ||
                  canvassingData?.status === CanvassingStatus.DRAFT)
              "
              :icon="Delete"
              @click="confirmDelete"
              >Hapus</el-button
            >
            <NuxtLink
              :to="`/sales/quotation/add?id=${canvassingData?.unique_id}`"
              class="el-button el-button--default"
              v-if="
                canEdit &&
                (canvassingData?.status === CanvassingStatus.RAB ||
                  canvassingData?.status === CanvassingStatus.DRAFT)
              "
            >
              <el-icon class="me-2"><Edit /></el-icon> Edit
            </NuxtLink>
            <el-button
              type="success"
              v-if="
                canvassingData?.status === CanvassingStatus.RAB ||
                canvassingData?.status === CanvassingStatus.DRAFT
              "
              @click="() => submitApproveRab(CanvassingStatus.PENDING_APPROVAL)"
            >
              <el-icon class="me-2"><CircleCheck /></el-icon> Ajukan RAB
            </el-button>
            <el-button
              type="success"
              v-if="
                canvassingData?.status === CanvassingStatus.PENDING_APPROVAL &&
                canAccess('canvassing-approve', privilages, 2)
              "
              @click="approve"
            >
              <el-icon class="me-2"><CircleCheck /></el-icon> Setujui
            </el-button>
            <el-button
              type="danger"
              v-if="
                canvassingData?.status === CanvassingStatus.PENDING_APPROVAL &&
                canAccess('canvassing-approve', privilages, 2)
              "
              @click="decline"
            >
              <el-icon class="me-2"><CircleClose /></el-icon> Tolak
            </el-button>
            <el-button
              type="default"
              @click="printSCMMemo"
              v-if="
                canvassingData?.status === CanvassingStatus.PENDING_APPROVAL ||
                canvassingData?.status === CanvassingStatus.DONE
              "
            >
              Cetak SCM Memo
            </el-button>
            <el-button
              type="default"
              v-if="
                canvassingData?.status === CanvassingStatus.PENDING_APPROVAL ||
                canvassingData?.status === CanvassingStatus.DONE
              "
              @click="dialogCancelApproval = true"
            >
              Batalkan Pengajuan
            </el-button>

            <NuxtLink
              v-if="
                canvassingData?.status ===
                  CanvassingStatus.PENDING_APPROVAL_RAB && editState == false
              "
              class="el-button el-button--success el-button--default"
              :href="`/sales/quotation/add?id=${canvassingData?.unique_id}`"
            >
              <el-icon class="me-2"><CircleCheck /></el-icon> Approve dan Buat
              RAB
            </NuxtLink>

            <!-- <NuxtLink
            :href="`sales/quotation/add?id=${canvassingData.unique_id}`"
            v-if="canvassingData?.status === CanvassingStatus.PENDING_APPROVAL_RAB"
            class="el-button el-button--success"
          >
            <el-icon class="me-2"><CircleCheck /></el-icon> Approve dan Buat RAP
          </NuxtLink> -->
            <NuxtLink
              v-if="canvassingData?.status === CanvassingStatus.DONE"
              :href="`/sales/offer/add?canvassing_id=${canvassingData?.unique_id}&type=out`"
              class="el-button el-button--default"
            >
              Buat Penawaran
            </NuxtLink>
            <el-button
              v-if="editState"
              type="default"
              size="default"
              @click="() => (editState = false)"
              class="mr-3"
            >
              Batal
            </el-button>
            <el-button
              v-if="editState"
              type="success"
              size="default"
              @click="() => submitRAB(ruleFormRef)"
              :loading="loading"
            >
              <el-icon class="me-2"><CircleCheck /></el-icon>
              Simpan dan Lanjutkan
            </el-button>
            <el-button
              v-if="editState"
              type="primary"
              size="default"
              @click="() => submitApproveRab(CanvassingStatus.RAB)"
              :loading="loading"
            >
              <el-icon class="me-2"><CircleCheck /></el-icon>
              Simpan
            </el-button>
          </div>
        </div>
      </template>

      <div class="flex gap-3 my-3">
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            <el-descriptions-item label="No Ref">
              {{ canvassingData?.source_document || "-" }}
            </el-descriptions-item>

            <el-descriptions-item
              v-if="canvassingData?.source"
              label="Diminta Oleh"
            >
              <p
                class="text-blue-600 cursor-pointer"
                @click="() => (dialogCustomerOverview = true)"
              >
                {{ canvassingData?.source?.request_to?.name ?? "-" }}
              </p>
            </el-descriptions-item>
            <el-descriptions-item v-if="canvassingData?.source" label="PIC">
              {{ canvassingData?.source?.request_by?.name ?? "-" }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            <el-descriptions-item label="Status">
              <div v-if="canvassingData">
                <el-tag :type="getStatusTagType(canvassingData.status)">
                  {{ formatStatus(canvassingData.status) }}
                </el-tag>
              </div>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="Berlaku Hingga">
              {{
                canvassingData?.expired_price
                  ? dayjs
                      .unix(canvassingData?.expired_price)
                      .format("YYYY-MM-DD")
                  : ""
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
      <h5 class="font-bold text-black text-1xl mt-6">Lampiran</h5>
      <div v-for="(file, key) in canvassingData?.files" :key="key">
        <NuxtLink
          class="text-blue-600 text-sm"
          :href="`${baseImageURL}/${file.image_path}/${file.filename}`"
          target="_blank"
          >{{ file.filename_original }}</NuxtLink
        >
      </div>
    </el-card>

    <el-card
      class="mb-3"
      shadow="never"
      v-if="
        statusRAB().includes(
          canvassingData?.status ?? CanvassingStatus.DRAFT
        ) || editState
      "
    >
      <template #header>
        <div class="card-header flex justify-between items-center">
          <p>Penerima Fee</p>
        </div>
      </template>
      <el-table :data="contactsFee" style="width: 100%" border>
        <el-table-column label="Nama">
          <template #default="{ row, $index }">
            <el-autocomplete
              v-if="editState"
              v-model="row.party.name"
              :fetch-suggestions="querySearchContact"
              placeholder="Cari nama..."
              @select="(item: any) => onHandleSelectContact(item, $index)"
              style="width: 100%"
            />
            <div v-else-if="!editState">{{ row.party.name }}</div>
          </template>
        </el-table-column>

        <el-table-column label="Email">
          <template #default="{ row }">
            <el-input
              v-if="editState"
              v-model="row.party.email"
              placeholder="Email"
            />
            <div v-else-if="!editState">{{ row.party.email }}</div>
          </template>
        </el-table-column>

        <el-table-column label="No. Telepon">
          <template #default="{ row }">
            <el-input
              v-if="editState"
              v-model="row.party.phone"
              placeholder="Phone"
            />
            <div v-else-if="!editState">{{ row.party.phone }}</div>
          </template>
        </el-table-column>

        <el-table-column :label="`Fee`">
          <template #default="{ row }">
            {{ row.type == "percent" ? row.value + "%" : currency(row.amount) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="mb-3" shadow="never">
      <template #header>
        <div class="card-header">
          <span>Canvassing Items</span>
        </div>
      </template>

      <div
        v-if="editState"
        class="bulk-actions mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50"
      >
        <div class="flex flex-wrap gap-4 items-end">
          <!-- Bulk Profit -->
          <div class="bulk-input-group">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Profit</label
            >
            <div class="flex gap-2">
              <el-input
                v-model="bulkProfit"
                placeholder="Profit"
                size="default"
                style="width: 200px"
              >
                <template #append>
                  <el-select
                    v-model="bulkProfitUnit"
                    size="default"
                    style="width: 70px"
                  >
                    <el-option label="%" value="percent" />
                    <el-option label="Rp" value="amount" />
                  </el-select>
                </template>
              </el-input>
            </div>
          </div>

          <!-- Bulk Fee -->
          <div class="bulk-input-group">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Fee</label
            >
            <div class="flex gap-2">
              <el-input
                v-model="bulkFee"
                placeholder="Fee"
                size="default"
                style="width: 200px"
                :disabled="feeState === 'minus'"
              >
                <template #append>
                  <el-select
                    v-model="bulkFeeUnit"
                    size="default"
                    style="width: 70px"
                  >
                    <el-option label="%" value="percent" />
                    <el-option label="Rp" value="amount" />
                  </el-select>
                </template>
              </el-input>
            </div>
          </div>

          <!-- Bulk Ongkir -->
          <div class="bulk-input-group">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Ongkir</label
            >
            <div class="flex gap-2">
              <el-input
                v-model="bulkOngkir"
                placeholder="Ongkir"
                size="default"
                style="width: 200px"
              >
                <template #append>
                  <span class="px-2 text-xs">Rp</span>
                </template>
              </el-input>
            </div>
          </div>

          <!-- Apply All Button -->
          <div class="bulk-input-group">
            <el-button
              type="primary"
              size="default"
              @click="applyAllBulk"
              :disabled="!hasBulkInput"
            >
              Terapkan Semua
            </el-button>
          </div>

          <!-- Reset All -->
          <div class="bulk-input-group">
            <el-button type="danger" size="default" @click="resetAllBulk" plain>
              Reset All
            </el-button>
          </div>
        </div>
      </div>

      <TrumsDragScrollTable>
        <el-table
          ref="tableRef"
          :data="item_canvassing"
          row-key="index"
          @select="handleSelect"
          @select-all="handleSelectAll"
          :tree-props="{ children: 'children' }"
          :row-class-name="tableRowClassName"
          :expand-row-keys="getExpandRowKeys ?? []"
          :size="'small'"
          border
        >
          <el-table-column
            v-if="
              statusRAB().includes(
                canvassingData?.status ?? CanvassingStatus.DRAFT
              ) || editState
            "
            prop="item_name"
            label="Item"
            width="500"
            fixed="left"
          >
            <template #default="{ row }">
              {{ displayCatalogueName(row.catalogue) }}
            </template>
          </el-table-column>
          <el-table-column v-else prop="item_name" label="Item" fixed="left">
            <template #default="{ row }">
              {{ row.catalogue_name }}
            </template>
          </el-table-column>

          <el-table-column
            prop="vendor_name"
            label="Vendor"
            :width="isMobile ? 100 : 200"
            :fixed="isMobile ? false : 'left'"
            align="center"
          >
            <template #default="{ row }">
              <span
                class="text-blue-600 cursor-pointer"
                @click="() => openDetailVendor(row.pricetag_item_id)"
                >{{ row.vendor_name || "" }}</span
              >
            </template>
          </el-table-column>

          <el-table-column
            prop="type_item"
            label="Item Type"
            width="150"
            fixed="left"
          >
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

          <el-table-column
            prop="status"
            v-if="
              canvassingData?.status == CanvassingStatus.PENDING_APPROVAL ||
              canvassingData?.status == CanvassingStatus.DONE
            "
            label="Status"
            width="130"
            fixed="left"
            align="center"
          >
            <template #default="{ row }">
              <div v-if="row.type === 'child'">
                <el-tag :type="getStatusTagTypeItem(row.status)">
                  {{ getStatusTabLabelItem(row.status) }}
                </el-tag>
              </div>
              <div v-else-if="row.type === 'parent'"></div>
            </template>
          </el-table-column>

          <el-table-column
            prop=""
            label="Ketersediaan"
            width="150"
            align="center"
          >
            <template #default="{ row }">
              <p v-if="row.type == 'child'">
                {{ (row.pricetag_item_data.status_item ?? "").toUpperCase() }}
              </p>
              <p v-else></p>
            </template>
          </el-table-column>
          <el-table-column
            prop=""
            label="Pengiriman"
            width="150"
            align="center"
          >
            <template #default="{ row }">
              <p v-if="row.type == 'child'">
                {{ (row.pricetag_item_data.delivery ?? "").toUpperCase() }}
              </p>
              <p v-else></p>
            </template>
          </el-table-column>
          <el-table-column
            prop=""
            label="Est Pengiriman"
            width="150"
            align="center"
          >
            <template #default="{ row }">
              <p v-if="row.type == 'child'">
                {{ row.expected_delivery ?? "" }}
              </p>
              <p v-else></p>
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
          <el-table-column label="Harga Beli" width="300" align="center">
            <el-table-column label="Harga" width="150" align="center">
              <template #default="{ row }">
                <div v-if="row.type === 'child'" class="text-right">
                  {{ currency(row.unit_price) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="Total" width="150" align="center">
              <template #default="{ row }">
                <div v-if="row.type === 'child'" class="text-right">
                  {{ currency(Number(row.unit_price) * Number(row.quantity)) }}
                </div>
              </template>
            </el-table-column>
          </el-table-column>

          <el-table-column
            v-if="
              statusRAB().includes(
                canvassingData?.status ?? CanvassingStatus.DRAFT
              ) || editState
            "
            label="Profit"
            width="200"
          >
            <template #default="{ row }">
              <div v-if="row.type == 'child'">
                {{
                  `${currency(row.profit_nominal)} (${row.profit_percent} %)`
                }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            v-if="
              statusRAB().includes(
                canvassingData?.status ?? CanvassingStatus.DRAFT
              ) || editState
            "
            label="Fee"
            width="200"
          >
            <template #default="{ row }">
              <div v-if="row.type === 'child'">
                {{ `${currency(row.fee_nominal) || 0} (${row.fee_percent} %)` }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            v-if="
              statusRAB().includes(
                canvassingData?.status ?? CanvassingStatus.DRAFT
              ) || editState
            "
            label="Ongkir"
            width="200"
          >
            <template #default="{ row }">
              <div v-if="row.type === 'child'">
                {{
                  `${currency(row.ongkir) || 0} (${(
                    (row.ongkir / row.selling_price) *
                    100
                  ).toFixed(2)} %)`
                }}
              </div>
            </template>
          </el-table-column>

          <el-table-column
            v-if="
              statusRAB().includes(
                canvassingData?.status ?? CanvassingStatus.DRAFT
              ) || editState
            "
            label="Harga Jual"
            width="200"
            align="center"
          >
            <el-table-column label="Harga Jual" width="150" align="center">
              <template #default="{ row }">
                <div class="text-right">
                  {{ currency(row.selling_price ?? 0) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="Total Harga" width="150" align="center">
              <template #default="{ row }">
                <div class="text-right">
                  {{ currency(row.total_selling_price ?? 0) }}
                </div>
              </template>
            </el-table-column>
          </el-table-column>

          <el-table-column
            v-if="
              statusRAB().includes(
                canvassingData?.status ?? CanvassingStatus.DRAFT
              ) || editState
            "
            label="Margin (%)"
            width="150"
          >
            <template #default="{ row }">
              <div v-if="row.type === 'child' && row.unit_price">
                {{ calculateMargin(row).toFixed(2) }} %
              </div>
            </template>
          </el-table-column>
        </el-table>
      </TrumsDragScrollTable>
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
              <el-descriptions
                title=""
                :label-width="200"
                :column="1"
                size="small"
                border
              >
                <el-descriptions-item label="Nomor Penawaran">
                  <NuxtLink
                    class="text-blue-600"
                    :href="`/supply-chain-management/offer/${vendor.unique_id}`"
                    >{{ vendor.unique_code ?? "N/A" }}</NuxtLink
                  >
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

    <el-card
      class="mb-4"
      header="Informasi Pembayaran"
      :class="{ 'error-card': paymentTermError }"
      shadow="never"
      v-if="
        statusRAB().includes(
          canvassingData?.status ?? CanvassingStatus.DRAFT
        ) || editState
      "
    >
      <el-table
        :data="canvassingData?.payment_terms ?? []"
        border
        style="width: 100%"
      >
        <el-table-column label="Nama" prop="name" />

        <el-table-column label="Jumlah" prop="value">
          <template #default="{ row }">
            {{
              row.unit == "percentage" ? row.value + "%" : currency(row.value)
            }}
          </template>
        </el-table-column>

        <el-table-column label="TOP" prop="term_of_payment" width="100">
          <template #default="{ row }">
            {{ row.term_of_payment.toUpperCase() }}
          </template>
        </el-table-column>

        <el-table-column :label="`Durasi`" prop="duration" width="100">
          <template #default="{ row }">
            {{
              row.term_of_payment.toUpperCase() == "TEMPO"
                ? row.duration + "D"
                : ""
            }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="never" class="mb-3" v-if="canvassingData && editState">
      <el-form
        ref="ruleFormRef"
        style="max-width: 600px"
        :model="canvassingData"
        :rules="rules"
        label-width="auto"
        class="demo-ruleForm"
        size="default"
        status-icon
      >
        <el-form-item label="Alamat Pengiriman" prop="address_view">
          <el-autocomplete
            v-model="canvassingData.address_view"
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

        <!-- <el-form-item v-if="address && " label="Dikirim ke">
          <div>
            <div>{{ address.address_name }}</div>
            <div>
              {{ address.street }},
              {{ generateResultSearchAddress(address).name }}
            </div>
          </div>
        </el-form-item> -->

        <el-form-item label="Deskripsi" prop="description">
          <el-input
            v-model="canvassingData.description"
            type="textarea"
            placeholder="Masukkan deskripsi"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <el-card
      class="mb-3"
      shadow="never"
      v-if="
        statusRAB().includes(
          canvassingData?.status ?? CanvassingStatus.DRAFT
        ) || editState
      "
    >
      <el-table :data="summeryData ?? []" style="width: 100%">
        <el-table-column label="" prop="label" fixed="left">
          <template #default="{ row }">
            <div class="font-bold">{{ row.label }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Profit" prop="max" align="right" width="200">
          <template #default="scope">
            {{ scope.row.max }}
          </template>
        </el-table-column>
        <el-table-column label="% Beli" prop="beli" width="150" align="right">
          <template #default="{ row }">
            <div>{{ row.beli }}</div>
          </template>
        </el-table-column>
        <el-table-column label="% Jual" prop="jual" width="150" align="right">
          <template #default="{ row }">
            <div>{{ row.jual }}</div>
          </template>
        </el-table-column>
        <!-- <el-table-column label="Profit Minimum" prop="min" align="right">
          <template #default="scope">
            <div
              v-if="scope.$index <= 1"
              :class="`${
                scope.$index == 0 ? 'text-green-600' : 'text-red-600'
              }`"
            >
              {{ scope.row.min }}
            </div>
            <div v-else class="">
              {{ scope.row.min }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="" prop="beliMin">
          <template #default="{ row }">
            <div class="text-red-600">{{ row.beliMin }}</div>
          </template>
        </el-table-column>
        <el-table-column label="" prop="jualMin">
          <template #default="{ row }">
            <div class="text-green-600">{{ row.jualMin }}</div>
          </template>
        </el-table-column>
        <el-table-column
          v-if="
            canvassingData?.status == CanvassingStatus.DONE ||
            canvassingData?.status == CanvassingStatus.PENDING_APPROVAL
          "
          label="Profit Diajukan"
          prop="selected"
          align="right"
        >
          <template #default="scope">
            <div
              v-if="scope.$index <= 1"
              :class="`${
                scope.$index == 0 ? 'text-green-600' : 'text-red-600'
              }`"
            >
              {{ scope.row.selected }}
            </div>
            <div v-else class="">
              {{ scope.row.selected }}
            </div>
          </template></el-table-column
        >
        <el-table-column
          v-if="
            canvassingData?.status == CanvassingStatus.DONE ||
            canvassingData?.status == CanvassingStatus.PENDING_APPROVAL
          "
          label=""
          prop="selectedBeli"
        >
          <template #default="{ row }">
            <div class="text-red-600">{{ row.selectedBeli }}</div>
          </template>
        </el-table-column>
        <el-table-column
          v-if="
            canvassingData?.status == CanvassingStatus.DONE ||
            canvassingData?.status == CanvassingStatus.PENDING_APPROVAL
          "
          label=""
          prop="selectedJual"
        >
          <template #default="{ row }">
            <div class="text-green-600">{{ row.selectedJual }}</div>
          </template>
        </el-table-column> -->
      </el-table>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <div class="card-header flex justify-between items-center">
          <p>Komentar</p>
        </div>
      </template>
      <div class="flex gap-5">
        <el-avatar
          v-if="authStore.userInfo?.photo"
          :src="`${imageUrl}/${authStore.userInfo?.photo.image_path}/${authStore.userInfo?.photo.filename}`"
        />
        <el-avatar v-else :icon="UserFilled" />
        <div class="flex flex-col w-full">
          <el-form
            :model="commentForm"
            ref="ruleFormRefComment"
            :rules="rulesComment"
          >
            <el-form-item prop="comment" label="">
              <el-input
                v-model="commentForm.comment"
                :rows="3"
                type="textarea"
                placeholder="Tulis Komentar...."
              />
            </el-form-item>
          </el-form>
          <TrumsCustomButton
            style="width: 10%"
            :disabled="loadingComment"
            type="primary"
            v-on:click="() => submitComment(ruleFormRefComment)"
            :is-circle="false"
            :loading="loadingComment"
          >
            Kirim
          </TrumsCustomButton>
        </div>
      </div>
      <div class="mt-10">
        <div
          class="flex gap-5 mb-5"
          v-for="(comment, index) in comments.data.value?.data ?? []"
        >
          <el-avatar
            v-if="comment.people?.photo"
            :src="`${imageUrl}/${comment.people?.photo.image_path}/${comment.people?.photo.filename}`"
          />
          <el-avatar v-else :icon="UserFilled" />
          <div class="flex flex-col w-full gap-1">
            <div class="flex gap-2">
              <p class="text-sm font-bold">{{ comment.people?.name }}</p>
              <span class="text-sm text-gray-500">{{
                formatLocalDateTime(comment.created_at)
              }}</span>
              <el-button
                v-if="editCommentIndex != index"
                type="warning"
                @click="() => onCommentEdit(index)"
                link
              >
                Edit
              </el-button>
              <el-popconfirm
                width="220"
                :icon="InfoFilled"
                icon-color="#626AEF"
                title="Anda yakin ingin menghapus komentar ini?"
                @confirm="() => onDeleteComment(comment)"
              >
                <template #reference>
                  <el-button
                    style="margin-left: 0"
                    v-if="editCommentIndex != index"
                    type="danger"
                    link
                  >
                    Hapus
                  </el-button>
                </template>
                <template #actions="{ confirm, cancel }">
                  <el-button size="small" @click="cancel">Batal!</el-button>
                  <el-button type="danger" size="small" @click="confirm">
                    Hapus
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
            <div
              v-if="editCommentIndex != index"
              class="text-sm"
              v-html="extractDescription(comment.comment)"
            ></div>
            <div v-if="editCommentIndex == index" class="flex flex-col gap-2">
              <el-input
                v-model="comment.comment"
                :rows="3"
                type="textarea"
                placeholder="Tulis Komentar...."
              />
              <TrumsCustomButton
                style="width: 10%"
                :disabled="loadingComment"
                type="primary"
                v-on:click="() => submitCommentEdit()"
                :is-circle="false"
                :loading="loadingComment"
              >
                Simpan
              </TrumsCustomButton>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <el-dialog
      v-model="visibleApproveDialog"
      title="Approve Canvasing!"
      style="width: 100%"
    >
      <el-form :model="canvassingData!" :label-position="formApproveLabel">
        <el-form-item label="Catatan" prop="note">
          <el-input v-model="canvassingData!.note" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="visibleApproveDialog = false">Batal</el-button>
          <el-button type="primary" @click="submitApprove"> Setujui </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="visibleDeclineDialog" title="Tolak RAB!" width="500">
      <el-form :model="canvassingData!" :label-position="formApproveLabel">
        <el-form-item label="Catatan" prop="note">
          <el-input v-model="canvassingData!.note" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="visibleDeclineDialog = false">Cancel</el-button>
          <el-button type="primary" @click="submitDecline"> Tolak </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog
      v-model="showPreview"
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
        <el-button @click="showPreview = false">Tutup</el-button>
        <el-button type="success" @click="() => {}">Download PDF</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="dialogSelectedItem"
      title="Pilih Item Yang Akan Diajukan!"
      width="1200"
    >
      <TrumsDragScrollTable>
        <el-table
          ref="tableRef"
          :data="item_canvassing"
          row-key="index"
          @select="handleSelect"
          @select-all="handleSelectAll"
          :tree-props="{ children: 'children' }"
          :row-class-name="tableRowClassName"
          :expand-row-keys="getExpandRowKeys ?? []"
          :size="'small'"
          border
        >
          <el-table-column
            type="selection"
            width="55"
            :selectable="(row: any, index: any) => selectableCheckbox(row, index)"
          />
          <el-table-column
            prop="item_name"
            label="Item"
            width="400"
            fixed="left"
          >
            <template #default="{ row }">
              {{ row.catalogue_name }}
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

          <el-table-column label="Harga Beli" width="200" align="center">
            <el-table-column label="Harga Beli" width="150" align="center">
              <template #default="{ row }">
                <div v-if="row.type === 'child'" class="text-right">
                  {{ currency(row.unit_price) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="Total Harga" width="150" align="center">
              <template #default="{ row }">
                <div v-if="row.type === 'child'" class="text-right">
                  {{ currency(row.total_price) }}
                </div>
              </template>
            </el-table-column>
          </el-table-column>

          <el-table-column label="Profit" width="200">
            <template #default="{ row }">
              <div v-if="row.type === 'child'">
                <div class="text-right">
                  {{
                    row.profit_unit == "percent"
                      ? currency(Math.round(row.profit_nominal || 0))
                      : row.profit
                  }}
                  ({{ row.profit }}%)
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Fee" width="200">
            <template #default="{ row }">
              <div v-if="row.type === 'child'">
                <div class="text-right">
                  {{
                    row.fee_unit == "percent"
                      ? currency(Math.round(row.fee_nominal || 0))
                      : row.fee
                  }}
                  ({{ row.fee }}%)
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Ongkir" width="200">
            <template #default="{ row }">
              <div v-if="row.type === 'child'" class="text-right">
                {{ currency(row.ongkir) }}
              </div>
            </template>
          </el-table-column>

          <el-table-column label="Harga Jual" width="200" align="center">
            <el-table-column label="Harga Jual" width="150" align="center">
              <template #default="{ row }">
                <div class="text-right">
                  {{ currency(row.selling_price ?? 0) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="Total Harga" width="150" align="center">
              <template #default="{ row }">
                <div class="text-right">
                  {{ currency(row.total_selling_price ?? 0) }}
                </div>
              </template>
            </el-table-column>
          </el-table-column>

          <el-table-column label="Margin (%)" width="100" align="center">
            <template #default="{ row }">
              <div
                v-if="row.type === 'child' && row.unit_price"
                class="text-right"
              >
                {{ calculateMargin(row!).toFixed(2) }} %
              </div>
            </template>
          </el-table-column>
        </el-table>
      </TrumsDragScrollTable>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogSelectedItem = false">Cancel</el-button>
          <el-button
            type="primary"
            :loading="loading"
            @click="() => submitApproveRab(CanvassingStatus.PENDING_APPROVAL)"
          >
            Simpan dan Ajukan
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="dialogNewAddress"
      title="Create New Address"
      width="500"
    >
      <FormAddress
        :onSetInitital="{ contact_id: '', contact_name: '' }"
        :onSuccess="onAddNewAddress"
      />
    </el-dialog>

    <ModalAdjustmentTransaction
      v-model:visible="visibleModalAdjustmentTransaction"
      @select-adjustment="handleSelectAdjustment"
      @create-new="visibleModalNewAdjustment = true"
      :data="adjustmentTransactions.data?.value?.data ?? []"
      :search-params="querySearchAdjustmentTransaction"
    />

    <el-dialog
      v-model="visibleModalNewAdjustment"
      title="Buat Biaya Lain"
      width="1000"
    >
      <AddAdjustment @submit="handleAdjustmentSubmit" />
    </el-dialog>

    <el-dialog
      v-model="dialogCancelApproval"
      title="Batalkan pengajuan?"
      width="500"
    >
      <span>Apakah anda yakin ingin membatalkan pengajuan?</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogCancelApproval = false">Tutup</el-button>
          <el-button
            type="primary"
            @click="
              () => cancelSubmissionApproval(CanvassingStatus.CANCEL, false)
            "
          >
            Batalkan
          </el-button>
          <el-button
            type="success"
            @click="
              () => cancelSubmissionApproval(CanvassingStatus.CANCEL, true)
            "
          >
            Batal & Buat Baru
          </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog
      v-model="dialogCustomerOverview"
      title="Customer Review"
      width="500"
    >
      <el-descriptions title="" :column="1">
        <el-descriptions-item label="Total Tagihan" :label-width="200">{{
          currencyWithoutSymbol(
            customerOverview.data.value?.data?.total_invoices_nominal || 0,
            0
          )
        }}</el-descriptions-item>

        <el-descriptions-item label="Total Telah Dibayar" :label-width="200">{{
          customerOverview.data.value?.data?.total_paid_nominal
        }}</el-descriptions-item>
        <el-descriptions-item label="Total Belum Dibayar" :label-width="200">
          <div class="flex">
            <span>{{
              currencyWithoutSymbol(
                customerOverview.data.value?.data?.total_unpaid_nominal || 0,
                0
              )
            }}</span>
            <el-icon><ArrowRight /></el-icon>
          </div>
        </el-descriptions-item>
        <el-descriptions-item
          label="Rata-rata Durasi Bayar (Hari)"
          :label-width="200"
          >{{
            customerOverview.data.value?.data?.average_payment_duration
          }}</el-descriptions-item
        >
      </el-descriptions>
    </el-dialog>
    <el-dialog
      v-model="dialogDetailInvoiceUnpaid"
      title="UNPAID INVOICE"
      width="500"
    >
      <el-table
        :data="customerOverview.data.value?.data?.unpaid_invoices || []"
      >
        <el-table-column label="INV.NO" width="100">
          <template #default="{ row }">
            {{ row.unique_code }}
          </template>
        </el-table-column>
        <el-table-column label="Total Invoice" width="100">
          <template #default="{ row }">
            {{ row.nominal }}
          </template>
        </el-table-column>
        <el-table-column label="Total Tagihan" width="100">
          <template #default="{ row }">
            {{ currencyWithoutSymbol(row.remaining_nominal, 0) }}
          </template>
        </el-table-column>
        <el-table-column label="Pending" width="100">
          <template #default="{ row }"> {{ row.aging_days }} Hari </template>
        </el-table-column>
      </el-table>
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
      v-model="previewSCMMemoDialog"
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
        <el-button @click="previewSCMMemoDialog = false">Tutup</el-button>
        <el-button type="success" @click="downloadSCMMemo"
          >Download PDF</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  canvassingData: Canvassing;
  privilages: Permission[];
}>();

import {
  Delete,
  Edit,
  CircleCheck,
  CircleClose,
  ArrowDown,
  Operation,
  Download,
  ArrowRight,
  UserFilled,
  InfoFilled,
  Tools,
  Printer,
  Close,
  Check,
} from "@element-plus/icons-vue";
import {
  CanvassingStatus,
  CanvassingVendorStatus,
  PaymentTerm,
  paymentTermView,
  statusRAB,
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
import {
  rowContextKey,
  type ElTable,
  type FormInstance,
  type FormProps,
  type FormRules,
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
import type { Contact, CustomerOverView } from "~/types/contact";
import jsPDF from "jspdf";
import autoTable, { type RowInput } from "jspdf-autotable";
import { type Pricetag, type Pricetag_item } from "~/types/pricetag";
import FeeDrawer from "~/components/trums/FeeDrawer.vue";
import type { AddressType } from "~/types/address";
import ModalAdjustmentTransaction from "~/components/trums/ModalAdjustmentTransaction.vue";
import AddAdjustment from "~/components/trums/AddAdjustment.vue";
import type { Permission } from "~/types/menu";
import { canAccess, currency, currencyWithoutSymbol } from "#imports";
import FormAddress from "~/components/trums/FormAddress.vue";
import OfferDetail from "../../offer/components/OfferDetail.vue";
import { generateAddressViewName } from "#imports";
import {
  TermOfPaymentReference,
  type TermOfPayment,
} from "~/types/payment_term";
import { dayjs } from "element-plus";
import { extractDescription } from "#imports";
import { displayCatalogueName } from "#imports";
import { CommentReference, type CommentData } from "~/types/comment";
import { formatLocalDateTime } from "#imports";
import { PDFDocument, PDFFont, rgb, StandardFonts } from "pdf-lib";
import ExcelJS from "exceljs";

definePageMeta({
  middleware: ["auth", "app"],
  name: "Quotation Component Approve",
});

const { isMobile } = useDevice();

const router = useRouter();
const route = useRoute();
const canvassingId = ref<string>(route.params.id as string);

const pdfBlob = ref<Blob | null>(null);

const { removeDuplicates } = useArray();

const selectedVendors = ref<Record<string, string>>({});

const canEdit = canAccess("canvassing-update", props.privilages);
const canDelete = canAccess("canvassing-delete", props.privilages);
const approveRAB = canAccess("approve-rab", props.privilages);
const canCheck = canAccess("canvassing-rab-checker", props.privilages);

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
const paymentTermError = ref(false);
const dialogCancelApproval = ref(false);
const dialogNewAddress = ref(false);
const dialogSelectedItem = ref<boolean>(false);
const loading = ref(false);
const loadingComment = ref(false);
const editState = ref<boolean>(false);
const editStateFee = ref<boolean>(false);
const visibleModalAdjustmentTransaction = ref(false);
const visibleModalNewAdjustment = ref(false);
const canvassingData = ref<Canvassing | null>(props.canvassingData);
const pricetags = ref<Pricetag[]>([]);
const itemDialogVisible = ref(false);
const selectedItem = ref<CanvassingItem | null>(null);
const visibleApproveDialog = ref<boolean>(false);
const visibleDeclineDialog = ref<boolean>(false);
const drawerFeeVisible = ref(false);
const dialogCustomerOverview = ref<boolean>(false);
const dialogDetailInvoiceUnpaid = ref<boolean>(false);
const previewSCMMemoDialog = ref<boolean>(false);

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
const pdfUrl = ref<string | null>(null);

const feeState = ref<string>("minus");
const ongkirState = ref<string>("minus");
const unitFee = ref<FeeType>(FeeType.PERCENT);

const item_canvassing = ref<CanvassingItemForm[]>([]);

const references = ref<ReferenceTransactionAdjustment[]>([]);

const tableRef = ref<InstanceType<typeof ElTable>>();

const activeCollapseVendor = ref<string[]>([""]);

const address = ref<AddressType>();

const config = useRuntimeConfig();
const authStore = useAuthStore();

const imageUrl = config.public.baseImageURL;
const baseImageURL = config.public.baseImageURL;

const ruleFormRefComment = ref<FormInstance>();
const commentForm = reactive<CommentData>({
  unique_id: null,
  comment: "",
  reference: CommentReference.CANVASSING,
  reference_id: canvassingData.value?.unique_id!,
  created_by: authStore.userInfo?.unique_id!,
  created_at: 0,
  updated_at: 0,
  version: 0,
});

const rulesComment: FormRules = {
  comment: [
    { required: true, message: "Tulis komentar anda!", trigger: "change" },
  ],
};

const ruleFormRef = ref<FormInstance>();
const bulkProfit = ref("");
const bulkProfitUnit = ref("percent");
const bulkFee = ref("");
const bulkFeeUnit = ref("percent");
const bulkOngkir = ref("");

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

const querySearchAdjustmentTransaction = ref<RequestSearch>({
  keyword: "",
  table: "adjustments_transaction",
  column: [],
  sort: null,
  limit: "10",
  offset: "1",
  flag: "form",
});

const request_search_contact = ref<RequestSearch>({
  column: [],
  keyword: "",
  limit: "10",
  offset: "1",
  sort: null,
  table: "contacts",
  flag: "form",
});
const request_search_pricetag_item = ref<RequestSearch>({
  column: [
    {
      unique_id: [],
    },
  ],
  keyword: "",
  limit: "10",
  offset: "1",
  sort: null,
  table: "pricetag_item",
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

const request_search_comments = ref<RequestSearch>({
  keyword: "",
  table: "comments",
  column: [
    {
      reference: ["canvassing"],
      reference_id: [canvassingData.value?.unique_id],
    },
  ],
  sort: {
    column: "created_at",
    order: "DESC",
  },
  offset: "1",
  limit: "50",
});
const offerDialogState = ref<boolean>(false);
const offerDetail = await useAsyncData("pricetag-detail", async () => {
  const res = await useFetchApi<ResponsePagination<Pricetag[]>>(
    `/search`,
    "pricetag-detail",
    "post",
    request_search_vendor.value
  );
  return res.data.value;
});

const editCommentIndex = ref<number>(-1);
const comments = await useAsyncData("fetch-comments", async () => {
  const res = await useFetchApi<ResponsePagination<CommentData[]>>(
    `/search`,
    "fetch-comments",
    "post",
    request_search_comments.value
  );
  return res.data.value;
});

const permissionCreateOffer = false;

const rules: FormRules = {
  source_document: [
    { required: true, message: "Nomor referensi wajib diisi", trigger: "blur" },
  ],
  status: [
    { required: true, message: "Status wajib dipilih", trigger: "change" },
  ],
  address_view: [
    { required: true, message: "Pengiriman wajib dipilih", trigger: "change" },
  ],
};

const adjustmentTransactions = await useFetchApi<
  ResponsePagination<AdjustmentTransaction[]>
>(
  "/search",
  "search-adjustment",
  "post",
  querySearchAdjustmentTransaction.value
);

const customerOverview = await useAsyncData("customer-overview", async () => {
  const res = await useFetchApi<BaseResponse<CustomerOverView>>(
    `/contact-paid-read/${canvassingData.value?.source?.request_to_id}`,
    "customer-overview",
    "get",
    null
  );
  return res.data.value;
});

const getReferences = computed(() => {
  return [...references.value, adjustmentTransactionOngkirTotal.value];
});

const pricetagList = computed(() => {
  const list = removeDuplicates<Pricetag>(pricetags.value, "unique_id");

  return list;
});

const openDetailVendor = (item_id: string) => {
  request_search_vendor.value.column = [
    {
      pricetag_item: {
        unique_id: [item_id],
      },
    },
  ];

  if (offerDetail.status.value !== "pending") {
    offerDialogState.value = true;
  }
};

watch(
  () => request_search_vendor.value,
  () => offerDetail.refresh(),
  { deep: true }
);

const adjustmentContact = computed(() => {
  const data = adjustmentTransactions.data.value?.data || [];
  return data.find(
    (value: AdjustmentTransaction) =>
      value.name?.toLowerCase().includes("fee") &&
      value.operator === feeState.value
  );
});

const adjustmentOngkir = computed(() => {
  const data = adjustmentTransactions.data.value?.data || [];

  return data.find((value: AdjustmentTransaction) =>
    value.name?.toLowerCase().includes("ongkos kirim")
  );
});

const adjustmentTransactionOngkirTotal = ref<ReferenceTransactionAdjustment>({
  unique_id: "",
  reference: ReferenceAdjustment.CANVASSING,
  reference_id: "",
  adjustment_id: `${adjustmentOngkir.value?.unique_id}`,
  adjustment: adjustmentOngkir.value,
  value: null,
  type: FeeType.AMOUNT,
  amount: 0,
  created_at: 0,
  changeType: false,
});

watch(
  adjustmentOngkir,
  () => {
    if (adjustmentTransactionOngkirTotal.value.reference_id === "") {
      adjustmentTransactionOngkirTotal.value = {
        unique_id: "",
        reference: ReferenceAdjustment.CANVASSING,
        reference_id: "",
        adjustment_id: `${adjustmentOngkir.value?.unique_id}`,
        adjustment: adjustmentOngkir.value,
        value: null,
        type: FeeType.AMOUNT,
        amount: 0,
        created_at: 0,
        changeType: false,
      };
    }
  },
  { immediate: true }
);

const handleAdjustmentSubmit = () => {
  visibleModalNewAdjustment.value = false;
  refreshNuxtData("search-adjustment");
};

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

const submitDeletePaymentTerm = async (data: TermOfPayment) => {
  try {
    const response = await useFetchApi<BaseResponse<any>>(
      "/payment-terms-delete",
      "delete-top",
      "post",
      [data.unique_id]
    );
    if (response.status.value === "success") {
      canvassingData.value!.payment_terms = (
        canvassingData.value?.payment_terms ?? []
      ).filter((term) => term.unique_id !== data.unique_id);
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  }
};

const submitComment = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        await sendComment();
      } catch (error) {
        ElMessage.error("Failed to comment!");
      }
    }
  });
};

const sendComment = async () => {
  loadingComment.value = true;

  try {
    const formData = new FormData();

    formData.append("unique_id", commentForm.unique_id ?? "");
    formData.append("reference", commentForm.reference);
    formData.append("reference_id", commentForm.reference_id);
    formData.append("comment", commentForm.comment);

    const response = await useFetchApi<BaseResponse<CommentData>>(
      "/comments-create",
      "create-comment",
      "post",
      formData
    );
    if (response.status.value === "success") {
      comments.refresh();
      resetComment();
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  } finally {
    loadingComment.value = false;
  }
};

const removePaymentTerm = async (data: TermOfPayment) => {
  await ElMessageBox.confirm("Yakin ingin menghapus TOP ini?", "Warning", {
    confirmButtonText: "Hapus",
    cancelButtonText: "Batal",
    type: "warning",
  });

  if (data.unique_id) {
    canvassingData.value!.payment_terms = (
      canvassingData.value?.payment_terms ?? []
    ).filter((term) => term.unique_id !== data.unique_id);
  } else {
    submitDeletePaymentTerm(data);
  }
};

const addNewPaymentTerm = () => {
  if (props.canvassingData.payment_terms) {
    props.canvassingData.payment_terms.push({
      duration: 0,
      name: "",
      reference: TermOfPaymentReference.RAB,
      reference_id: "",
      term_of_payment: PaymentTerm.CBD,
      unique_code: "",
      unique_id: "",
      unit: "percentage",
      value: 0,
    });
  } else {
    props.canvassingData.payment_terms = [
      {
        duration: 0,
        name: "",
        reference: TermOfPaymentReference.RAB,
        reference_id: "",
        term_of_payment: PaymentTerm.CBD,
        unique_code: "",
        unique_id: "",
        unit: "percentage",
        value: 0,
      },
    ];
  }

  console.log("payment terms", props.canvassingData.payment_terms);
};

const approveWithCreateRAB = () => {
  editState.value = true;
  refreshNuxtData("search-adjustment");
};

const selectableCheckbox = (row: CanvassingItemForm, index: number) => {
  return canvassingData.value?.status != CanvassingStatus.PENDING_APPROVAL
    ? row.type === "child"
      ? true
      : false
    : false;
};

const openFeeDrawer = (item: CanvassingItemForm) => {
  itemIndex.value = item.index;
  contactsFeeToEdit.value = [...item.contacts_fee];

  selectedItemDrawer.value = {
    index: item.index,
    vendor_name: item.vendor_name ?? "",
    name: item.catalogue_name,
  };

  drawerFeeVisible.value = true;
};

const onInputAdjustment = (row: ReferenceTransactionAdjustment) => {
  if (row.adjustment?.name.toLowerCase() == "ongkos kirim") {
    ongChangeGlobalDeliveryFee();
  }
};

const ongChangeGlobalDeliveryFee = () => {
  item_canvassing.value.forEach((element) => {
    element.children.forEach((child) => {
      child.ongkir = 0;
    });

    setProfit(element);
  });
};

const onChangeFeeState = (val: string) => {
  contactsFee.value.forEach((value) => {
    value.amount = 0;
    value.type = val == "plus" ? FeeType.AMOUNT : FeeType.PERCENT;
  });

  item_canvassing.value.forEach((value) => {
    value.children.forEach((child) => {
      child.contacts_fee.forEach((fee) => (fee.amount = 0));
      calculateSellingPrice(child);
      child.fee = 0;
      console.log("child fee", child);
    });

    value.fee = 0;
  });

  unitFee.value = val == "plus" ? FeeType.AMOUNT : FeeType.PERCENT;
};

const handleSaveFee = ({
  item,
  contacts,
  fee,
}: {
  item: { index: string; name: string; vendor_name: string };
  contacts: ReferenceTransactionAdjustment[];
  fee?: number;
}) => {
  const cleanContacts = JSON.parse(JSON.stringify(contacts));
  updateItemFee(
    item_canvassing.value,
    itemIndex.value,
    cleanContacts,
    fee ?? 0
  );

  syncFeeAcumulation();

  item_canvassing.value.forEach((element) => {
    setProfit(element);
  });
};

const syncFeeAcumulation = () => {
  if (feeState.value == "plus") {
    contactsFee.value.forEach((value) => (value.amount = 0));
    const newContactFee: ReferenceTransactionAdjustment[] = JSON.parse(
      JSON.stringify(contactsFee.value)
    );
    item_canvassing.value.forEach((item) => {
      const selling_price = Number(item.selling_price || 0);

      item.children.forEach((child) => {
        const hargaBeli = Number(child.unit_price || 0);

        let ongkirNominal = child.ongkir;

        child.contacts_fee.forEach((contact) => {
          const selisih = selling_price - hargaBeli - ongkirNominal;

          let profit = 100;
          let fee = 0;

          if (contact.type == "percent") {
            fee = Number(contact.amount);
          } else {
            fee = (Number(contact.amount) / hargaBeli) * 100;
          }

          console.log("fee ", contact);

          if (child.profit_unit == "amount") {
            profit = (Number(child.profit) / hargaBeli) * 100;
          }

          let profitAndFee = profit + fee;

          // contact.amount = fee;
          contact.amount_nominal = (selisih * fee) / profitAndFee;

          const findContactFee = newContactFee.findIndex(
            (fee) => fee.party_id == contact.party_id
          );

          if (findContactFee >= 0) {
            if (unitFee.value == FeeType.AMOUNT) {
              newContactFee[findContactFee].amount += Number(
                contact.amount_nominal
              );
            } else {
              newContactFee[findContactFee].amount += Number(contact.amount);
            }
            newContactFee[findContactFee].amount = Math.round(
              newContactFee[findContactFee].amount
            );
          }
        });
      });
    });
    contactsFee.value = newContactFee;
  }
};

function updateItemFee(
  items: CanvassingItemForm[],
  index: string,
  contacts?: ReferenceTransactionAdjustment[],
  fee?: number
) {
  for (const it of items) {
    if (it.index === index && it.type === "child") {
      if (contacts) {
        it.fee = contacts.reduce((sum, c) => sum + (c.amount || 0), 0);
        it.contacts_fee = contacts;
      } else {
        it.fee = fee ?? 0;
      }
    } else if (it.type === "child") {
      if (contacts) {
        if (it.contacts_fee.length > 0) {
          const contactNotExist: ReferenceTransactionAdjustment[] = [];

          contacts.forEach((element) => {
            // console.log()
            const findIndex = (it.contacts_fee ?? []).findIndex(
              (c) => c.party_id == element.party_id
            );

            if (findIndex < 0) {
              contactNotExist.push({ ...element, amount: 0, value: 0 });
            }
          });

          console.log("contact fee exits", it.contacts_fee);
          console.log("contact not exits", contactNotExist);

          it.contacts_fee = [...it.contacts_fee, ...contactNotExist];
        } else {
          it.contacts_fee = contacts.map((value) => ({
            ...value,
            amount: 0,
            value: 0,
          }));
        }
      }
    }

    if (it.type == "parent") {
      // setProfit(it);
    }

    if (it.children.length > 0) {
      updateItemFee(it.children, index, contacts, fee);
    }
  }
}

const removeContact = (index: number) => {
  contactsFee.value.splice(index, 1);
};

const hasBulkInput = computed(() => {
  return (
    bulkProfit.value !== "" || bulkFee.value !== "" || bulkOngkir.value !== ""
  );
});

const changeFeeUnitContacts = (row: CanvassingItemForm) => {
  row.contacts_fee.forEach((element) => {
    element.type = row.fee_unit as FeeType;
  });
};

const handleSelectAdjustment = (items: AdjustmentTransaction[]) => {
  items.forEach((element) => {
    references.value.push({
      unique_id: "",
      reference: ReferenceAdjustment.CANVASSING,
      reference_id: "",
      adjustment_id: element.unique_id,
      type: element.type,
      amount: element.default_value,
      created_at: 0,
      value: element.default_value,
      adjustment: element,
      changeType: true,
    });
  });
  visibleModalAdjustmentTransaction.value = false;
};

const changeFeeUnit = (val: any) => {
  contactsFee.value.forEach((element) => {
    element.type = val as FeeType;
  });
};

const applyAllBulk = () => {
  item_canvassing.value.forEach((item) => {
    if (item.children && item.children.length) {
      item.children.forEach((child) => {
        if (child.type === "child") {
          // Apply profit jika diisi
          if (bulkProfit.value !== "") {
            child.profit = parseInt(bulkProfit.value);
            child.profit_unit = bulkProfitUnit.value as "amount" | "percent";
            child.profit_nominal = child.unit_price * (child.profit / 100);
          }

          // Apply fee jika diisi
          if (bulkFee.value !== "" && feeState.value !== "minus") {
            child.fee = parseInt(bulkFee.value);
            child.fee_unit = bulkFeeUnit.value as "amount" | "percent";
            child.fee_nominal = (child.fee / 100) * child.profit;
            changeFeeUnitContacts(child);
          } else {
            // if(child.fee == ''){
            //   child.fee = 0;
            //   child.fee_unit = bulkFeeUnit.value as "amount"|"percent";
            //   child.fee_nominal = 0;
            // }
          }

          // Apply ongkir jika diisi
          if (bulkOngkir.value !== "") {
            child.ongkir = parseInt(bulkOngkir.value);
          }

          // Recalculate selling price
          calculateSellingPrice(child);
        }
      });
    }
  });

  item_canvassing.value.forEach((item) => {
    setProfit(item);
  });

  // Show success message
  ElMessage.success("Berhasil menerapkan semua setting ke semua item");
};

const resetAllBulk = () => {
  // Reset bulk input fields
  bulkProfit.value = "";
  bulkFee.value = "";
  bulkOngkir.value = "";
  bulkProfitUnit.value = "percent";
  bulkFeeUnit.value = "percent";

  // Reset all items
  item_canvassing.value.forEach((item) => {
    if (item.children && item.children.length) {
      item.children.forEach((child) => {
        if (child.type === "child") {
          child.profit = 0;
          child.fee = 0;
          child.ongkir = 0;
          child.profit_unit = "percent";
          child.fee_unit = "percent";
          child.selling_price = child.unit_price || 0;
        }
      });
    }
  });

  ElMessage.info("Semua setting telah direset");
};

const calculateSellingPrice = (row: CanvassingItemForm) => {
  let basePrice = Number(row.unit_price || 0);

  // let sellingPrice = Number(basePrice);
  let profitAmount = Number(row.profit_nominal);
  let feeAmount = Number(row.fee_nominal);
  let ongkir = Number(row.ongkir || 0);

  // Update harga jual
  row.selling_price = basePrice + profitAmount + feeAmount + ongkir;

  if (feeState.value === "plus") {
    // accumulateFee();
  }
  accumulateOngkir();

  if (row.type == "child") {
    const parent = findParent(item_canvassing.value, row.index);
    if (parent) {
      let selling_price = 0;
      parent.children.forEach((element) => {
        if (element.selling_price > selling_price) {
          selling_price = element.selling_price;
        }
      });

      parent.selling_price = selling_price;
      parent.total_price = Number(selling_price) * Number(parent.quantity);
    }
  }
};

const accumulateOngkir = () => {
  let ongkirAmount = 0;

  item_canvassing.value.forEach((element) => {
    element.children.forEach((childs) => {
      ongkirAmount += Number(childs.ongkir) * Number(childs.quantity);
    });
  });

  if (ongkirAmount > 0) {
    adjustmentTransactionOngkirTotal.value.amount = ongkirAmount;
  }
};

function findParent(
  tree: CanvassingItemForm[],
  index: string
): CanvassingItemForm | null {
  for (const node of tree) {
    // if (node.index === index) return node;
    // if (node.children) {
    //   const found = findParent(node.children, index);
    //   if (found) return found;
    // }

    let find = findChildIndex(node.children, index);

    if (find >= 0) {
      return node;
    }
  }
  return null;
}

function findChildIndex(tree: CanvassingItemForm[], key: string): number {
  let index = 0;
  for (const node of tree) {
    if (node.index === key) {
      return index;
    }

    index++;
  }
  return -1;
}

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

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;

    reader.readAsDataURL(blob);
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

const onDeleteComment = async (comment: CommentData) => {
  loadingComment.value = true;
  try {
    const response = await useFetchApi(
      "/comments-delete",
      "delete-comment",
      "post",
      [comment.unique_id]
    );
    if (response.status.value == "success") {
      comments.refresh();
    }
  } catch (error) {
    ElMessage.error("Gagal Menghapus Komentar!");
  } finally {
    loadingComment.value = false;
  }
};

const onCommentEdit = (index: number) => {
  editCommentIndex.value = index;
};

const submitCommentEdit = async () => {
  commentForm.comment =
    comments.data.value?.data[editCommentIndex.value].comment!;
  commentForm.unique_id =
    comments.data.value?.data[editCommentIndex.value].unique_id!;

  await sendComment();

  editCommentIndex.value = -1;

  resetComment();
};

const resetComment = () => {
  commentForm.unique_id = null;
  commentForm.comment = "";
  commentForm.reference = CommentReference.CANVASSING;
  commentForm.reference_id = canvassingData.value?.unique_id!;
  commentForm.created_by = authStore.userInfo?.unique_id!;
  commentForm.created_at = 0;
  commentForm.updated_at = 0;
  commentForm.version = 0;
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
  const newSearch = { ...request_search_contact.value };
  newSearch.keyword = queryString;
  newSearch.table = "address";
  newSearch.column = [
    // {
    //   contact_id: [ruleForm.request_by, ruleForm.to_unique_id]
    // }
  ];
  newSearch.limit = "10";
  newSearch.offset = "1";
  newSearch.flag = "form";

  useFetchApi<ResponsePagination<AddressType[]>>(
    "/search",
    "address",
    "post",
    newSearch
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
    dialogNewAddress.value = true;
  } else {
    console.log(record);

    address.value = record.address as AddressType;
    canvassingData.value!.address_id = record.address_id;
    canvassingData.value!.address_version = record.address_version;
    canvassingData.value!.address_view = record.name;
  }
};

const onAddNewAddress = (address: AddressType) => {
  canvassingData.value!.address_id = address.unique_id;
  canvassingData.value!.address_view = address.address_name;
  canvassingData.value!.address_version = address.version || 1;
  dialogNewAddress.value = false;
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
  let total = 0;

  (item_canvassing.value || []).forEach((element) => {
    total += element.children
      .filter((cv) => cv.status == CanvassingVendorStatus.SELECTED)
      .reduce((acc, sum) => acc + (sum.total_selling_price || 0), 0);
  });

  return total;
});

const totalBuyingPrice = computed(() => {
  let totalBuy = 0;
  item_canvassing.value.forEach((item) => {
    // totalBuy += item.total_price;
    totalBuy += item.children
      .filter((child) => child.status == CanvassingVendorStatus.SELECTED)
      .reduce(
        (acc, row: CanvassingItemForm) => (acc += Number(row.total_price)),
        0
      );
  });
  return totalBuy;
});
const totalBuyingPriceSelected = computed(() => {
  let total = 0;

  item_canvassing.value.forEach((element) => {
    if (element.children.length > 0) {
      let dataMin = element.children.reduce((max, data) => {
        if (
          data.status !== CanvassingVendorStatus.SUBMITTED &&
          data.status !== CanvassingVendorStatus.SELECTED
        ) {
          return max;
        }
        return data.total_price < max.total_price ? data : max;
      });

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

const adjustmentTransactionFeeTotal = ref<ReferenceTransactionAdjustment>({
  unique_id: "",
  reference: ReferenceAdjustment.CANVASSING,
  reference_id: "",
  adjustment_id: `${adjustmentContact.value?.unique_id}`,
  adjustment: adjustmentContact.value,
  adjustments_transaction: adjustmentContact.value,
  value: null,
  type: unitFee.value,
  amount: 0,
  created_at: 0,
});

watch(
  () => unitFee.value,
  (newValue) => {
    adjustmentTransactionFeeTotal.value.type = newValue;
  },
  { deep: true }
);

const netProfitForBuying = computed(() => {
  let fee = 0;

  if (
    adjustmentTransactionFeeTotal.value &&
    adjustmentTransactionFeeTotal.value.reference_id != ""
  ) {
    if (adjustmentTransactionFeeTotal.value.type == FeeType.AMOUNT) {
      fee = adjustmentTransactionFeeTotal.value.amount;
    } else if (adjustmentTransactionFeeTotal.value.type == FeeType.PERCENT) {
      fee =
        (grandTotal.value * adjustmentTransactionFeeTotal.value.amount) / 100;
    }
  }

  return Number(totalForGrossProfitForBuying.value || 0) - Number(fee || 0);
});
const netProfitForBuyingSelected = computed(() => {
  let fee = 0;

  if (adjustmentTransactionFeeTotal.value) {
    if (adjustmentTransactionFeeTotal.value.type == FeeType.AMOUNT) {
      fee = adjustmentTransactionFeeTotal.value.amount;
    } else if (adjustmentTransactionFeeTotal.value.type == FeeType.PERCENT) {
      fee =
        (grandTotal.value * adjustmentTransactionFeeTotal.value.amount) / 100;
    }
  }

  return (
    Number(totalForGrossProfitForBuyingSelected.value || 0) - Number(fee || 0)
  );
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

const grossProfitSelected = computed(() => {
  return Number(grandTotal.value) - Number(totalBuyingPriceSelected.value);
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

const totalForGrossProfitForBuyingSelected = computed(() => {
  let gross = Number(grossProfitSelected.value);

  gross -= Number(adjustmentTransactionOngkirTotal.value?.amount ?? 0);

  references.value.forEach((element) => {
    if (element.type === FeeType.PERCENT) {
      gross -= (element.amount / totalBuyingPriceSelected.value) * 100;
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

const getExpandRowKeys = computed(() => {
  const rowKeys = item_canvassing.value
    .filter((value) => value.children && value.children.length > 0)
    .map((value) => value.index);

  return rowKeys;
});

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
  let netProfit = grossProfit.value;
  const tableData: any[] = [
    {
      label: "Total Harga Jual",
      max: currency(grandTotal.value),
      beli: "",
      jual: "",
      min: currency(grandTotal.value),
      beliMin: "",
      jualMin: "",
      selected: currency(grandTotal.value),
    },
    {
      label: "Total Harga Beli",
      max: currency(totalBuyingPrice.value),
      beli: "",
      jual: "",
      min: currency(totalBuyingPriceMin.value),
      beliMin: "",
      jualMin: "",
      selected: currency(totalBuyingPriceSelected.value),
    },
    {
      label: "Gross Profit",
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
      selected: currency(grossProfitSelected.value),
      selectedBeli: `${safePercent(
        grossProfitSelected.value,
        totalBuyingPriceSelected.value
      )} %`,
      selectedJual: `${
        grandTotal.value == 0
          ? 0
          : safePercent(grossProfitSelected.value, grandTotal.value)
      } %`,
    },
  ];

  if (adjustmentTransactionOngkirTotal.value.adjustment_id != "") {
    netProfit -= adjustmentTransactionOngkirTotal.value?.amount;
    tableData.push({
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
      jualMin: `${safePercent(
        adjustmentTransactionOngkirTotal.value?.amount ?? 0,
        grandTotal.value
      )} %`,
      selected: currency(adjustmentTransactionOngkirTotal.value?.amount ?? 0),
      selectedBeli: `${safePercent(
        adjustmentTransactionOngkirTotal.value?.amount ?? 0,
        totalBuyingPriceSelected.value
      )} %`,
      selectedJual: `${safePercent(
        adjustmentTransactionOngkirTotal.value?.amount ?? 0,
        grandTotal.value
      )} %`,
    });
  }

  let fee = 0;
  if (
    adjustmentTransactionFeeTotal.value.type == FeeType.AMOUNT &&
    adjustmentTransactionFeeTotal.value.reference_id != ""
  ) {
    fee = adjustmentTransactionFeeTotal.value.amount;
  } else if (
    adjustmentTransactionFeeTotal.value.type == FeeType.PERCENT &&
    adjustmentTransactionFeeTotal.value.reference_id != ""
  ) {
    fee = (grandTotal.value * adjustmentTransactionFeeTotal.value.amount) / 100;
  }

  if (adjustmentTransactionFeeTotal.value.reference_id != "") {
    netProfit -= fee;
    tableData.push({
      label: adjustmentTransactionFeeTotal.value.adjustments_transaction?.name,
      max: currency(fee),
      beli: `${safePercent(fee ?? 0, totalBuyingPrice.value)} %`,
      jual: `${safePercent(fee ?? 0, grandTotal.value)} %`,
      min: currency(fee ?? 0),
      beliMin: `${safePercent(fee ?? 0, totalBuyingPriceMin.value)} %`,
      jualMin: `${safePercent(fee ?? 0, grandTotal.value)} %`,
      selected: currency(fee ?? 0),
      selectedBeli: `${safePercent(
        fee ?? 0,
        totalBuyingPriceSelected.value
      )} %`,
      selectedJual: `${safePercent(fee ?? 0, grandTotal.value)} %`,
    });
  }
  console.log("gross profit", netProfit);
  references.value.forEach((element) => {
    if (
      element.adjustments_transaction?.name.toLowerCase() != "fee" &&
      element.party_type != PartyType.CONTACT
    ) {
      console.log(
        "reference name",
        element.adjustments_transaction?.name
          ? element.adjustments_transaction?.name
          : element.adjustment?.name
          ? element.adjustment?.name
          : "-"
      );

      netProfit -= displayAmount(element, grandTotal.value);

      tableData.push({
        label: element.adjustments_transaction?.name
          ? element.adjustments_transaction?.name
          : element.adjustment?.name
          ? element.adjustment?.name
          : "-",
        max: currency(displayAmount(element, grandTotal.value)),
        beli: `${safePercent(
          displayAmount(element, grandTotal.value) ?? 0,
          totalBuyingPrice.value
        )} %`,
        jual: `${safePercent(
          displayAmount(element, grandTotal.value) ?? 0,
          grandTotal.value
        )} %`,
        // beli: `${safePercent(
        //   displayAmount(element, totalBuyingPrice.value),
        //   totalBuyingPrice.value
        // )}  %`,
        // jual: `${safePercent(
        //   displayAmount(element, grandTotal.value),
        //   grandTotal.value
        // )}  %`,
        min: currency(displayAmount(element, totalBuyingPriceMin.value)),
        beliMin: `${safePercent(
          displayAmount(element, grandTotal.value),
          totalBuyingPriceMin.value
        )}  %`,
        jualMin: `${safePercent(
          displayAmount(element, grandTotal.value),
          grandTotal.value
        )}  %`,
        selected: currency(displayAmount(element, grandTotal.value)),
        selectedBeli: `${safePercent(
          displayAmount(element, grandTotal.value),
          totalBuyingPriceSelected.value
        )}  %`,
        selectedJual: `${safePercent(
          displayAmount(element, grandTotal.value),
          grandTotal.value
        )}  %`,
      });
    }
  });

  const totalFeeRecive = (canvassingData.value?.reference_transaction || [])
    .filter(
      (ref) =>
        ref.adjustments_transaction?.name.toLowerCase() == "fee" &&
        ref.party_type == PartyType.CONTACT
    )
    .reduce((acc, sum) => acc + (sum.amount ?? 0), 0);

  if (totalFeeRecive > 0) {
    tableData.push({
      label: "Total Penerima Fee",
      max: currency(totalFeeRecive),
      beli: `${safePercent(totalFeeRecive, totalBuyingPrice.value)} %`,
      jual: `${safePercent(totalFeeRecive, grandTotal.value)} %`,
      min: currency(0),
      beliMin: ``,
      jualMin: ``,
    });
  }
  console.log("gross profit", totalFeeRecive);
  netProfit -= totalFeeRecive;
  const netProfitSelected = netProfitForBuyingSelected.value - totalFeeRecive;

  tableData.push({
    label: "Net Profit",
    max: currency(netProfit),
    beli: `${safePercent(netProfit, totalBuyingPrice.value)} %`,
    jual: `${safePercent(netProfit, grandTotal.value)} %`,
    min: currency(netProfitForBuyingMin.value),
    beliMin: `${safePercent(netProfit, totalBuyingPriceMin.value)} %`,
    jualMin: `${safePercent(netProfit, grandTotal.value)} %`,
    selected: currency(netProfitSelected),
    selectedBeli: `${safePercent(
      netProfitSelected,
      totalBuyingPriceSelected.value
    )} %`,
    selectedJual: `${safePercent(netProfitSelected, grandTotal.value)} %`,
  });

  return tableData;
});

const tableRowClassName = ({
  row,
  rowIndex,
}: {
  row: CanvassingItemForm;
  rowIndex: number;
}) => {
  if (row.type_item != "request") {
    if (row.status === CanvassingVendorStatus.SELECTED) {
      return "success-row";
    } else if (row.status === CanvassingVendorStatus.SUBMITTED) {
      return "";
    }
  }
  return "";
};

const querySearchContact = (queryString: string, cb: (arg: any) => void) => {
  (request_search_contact.value.keyword = queryString),
    useFetchApi<ResponsePagination<Contact[]>>(
      "/search",
      "search-contact",
      "post",
      request_search_contact.value
    )
      .then((response) => {
        if (response.status.value === "success") {
          const resultApi: Contact[] = response.data.value?.data ?? [];
          if (resultApi.length > 0) {
            const results = resultApi.map((data: Contact) => {
              return { ...data, value: `${data.name}`, isNew: false };
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
        }
      })
      .catch((error: any) => {
        ElMessage.error(error.response.data.message);
      });
};

const onHandleSelectContact = async (
  item: Record<string, any>,
  index: number
) => {
  if (item.isNew) {
    const contact: Contact | null = await createNewContact({
      name: item.query,
    });
    if (contact !== null) {
      contactsFee.value[index].reference = ReferenceAdjustment.CANVASSING;
      contactsFee.value[index].party_id = contact.unique_id;
      contactsFee.value[index].party = contact;
      contactsFee.value[index].party_type = PartyType.CONTACT;
    }
  } else {
    const contact: Contact = item as Contact;
    contactsFee.value[index].reference = ReferenceAdjustment.CANVASSING;
    contactsFee.value[index].party_id = contact.unique_id;
    contactsFee.value[index].party = contact;
    contactsFee.value[index].party_type = PartyType.CONTACT;
  }

  item_canvassing.value.forEach((value) => {
    const data: ReferenceTransactionAdjustment[] = JSON.parse(
      JSON.stringify(contactsFee.value)
    );
    value.children.forEach((child) => (child.contacts_fee = data));
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

const fetchPriceTagWithItems = async () => {
  loading.value = true;
  try {
    const uniques: string[] = [];

    item_canvassing.value.forEach((value) => {
      value.children.forEach((child) => {
        uniques.push(child.pricetag_item_id);
      });
    });

    const query = { ...request_search_pricetag_item.value };
    query.column = [
      {
        unique_id: uniques,
      },
    ];
    const response = await useFetchApi<ResponsePagination<Pricetag_item[]>>(
      `/search`,
      "fetch-price-tag-item",
      "post",
      query
    );

    if (response.status.value == "success") {
      const data: Pricetag_item[] = response.data.value?.data ?? [];

      data.forEach((pricetagItem) => {
        if (pricetagItem.pricetag) {
          pricetags.value.push(pricetagItem.pricetag);
        }
      });

      if (pricetags.value.length > 0) {
        activeCollapseVendor.value = pricetags.value.map(
          (value) => value.unique_id
        );
      }
    }
  } catch (error: any) {
    ElMessage.error("Failed to fetch Pricetag");
  } finally {
    loading.value = false;
  }
};

const initialCanvassing = (data: Canvassing) => {
  canvassingData.value = data;

  contactsFee.value = [];
  (canvassingData.value.reference_transaction ?? []).forEach((element) => {
    console.log("masuk fee total", element);
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

    if (
      (element.adjustments_transaction?.name ?? "").toLowerCase() ==
      "ongkos kirim"
    ) {
      adjustmentTransactionOngkirTotal.value = element;
    }

    if (
      (element.adjustments_transaction?.name ?? "").toLowerCase() == "fee" &&
      element.party_type != PartyType.CONTACT
    ) {
      adjustmentTransactionFeeTotal.value = element;
    }
  });

  (canvassingData.value.canvassing_item ?? []).forEach((element) => {
    if (element.type_item !== "equivalent") {
      const toItemCanvassing = {
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
        total_price: 0,
        total_selling_price: element.total_selling_price ?? 0,
        status: CanvassingVendorStatus.SUBMITTED,
        taxes: [],
        editing: null,
        type: "parent" as "parent" | "child",
        type_item: element.type_item,
        equivalent_id: element.equivalent_id,
        catalogue: element.catalogue,
        children: element.canvassing_vendor.map((child) => {
          return {
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
            total_selling_price: child.total_selling_price ?? 0,
            status: child.status,
            checked:
              child.status == CanvassingVendorStatus.SUBMITTED ? true : false,
            taxes: [],
            editing: null,
            type: "child" as "parent" | "child",
            children: [],
            selling_price: child.selling_price ?? 0,
            profit: child.profit,
            profit_unit: child.profit_unit,
            profit_nominal: child.profit_nominal,
            profit_percent: child.profit_percent,
            fee: child.fee,
            fee_unit: child.fee_unit,
            fee_nominal: child.fee_nominal,
            fee_percent: child.fee_percent,
            ongkir: child.ongkir,
            ongkir_unit: child.ongkir_unit,
            ongkir_nominal: child.ongkir,
            pricetag_item_id: child.pricetag_item_id ?? "",
            pricetag_item_data: child.pricetag_item,
            pricetag_item_version: child.pricetag_item_version ?? 0,
            catalogue: child.catalogue,
            contacts_fee: (child.reference_transaction ?? []).filter(
              (value) => value.party_type == PartyType.CONTACT
            ),
            expected_delivery: child.expected_delivery,
          };
        }),
        selling_price: element.unit_selling_price,
        profit: 0,
        profit_unit: "percent" as "amount" | "percent",
        fee: 0,
        fee_unit: "percent" as "amount" | "percent",
        ongkir: 0,
        ongkir_unit: "percent" as "amount" | "percent",
        pricetag_item_id: "",
        pricetag_item_version: 0,
        contacts_fee: [],
      };

      const vSelected = (toItemCanvassing.children || []).filter(
        (child) =>
          child.status == CanvassingVendorStatus.SELECTED &&
          child.type_item == "original"
      );

      toItemCanvassing.unit_price = vSelected.reduce(
        (acc, item) => acc + item.unit_price,
        0
      );
      toItemCanvassing.total_price = vSelected.reduce(
        (acc, item) => acc + item.total_price,
        0
      );
      toItemCanvassing.selling_price = vSelected.reduce(
        (acc, item) => acc + item.selling_price,
        0
      );

      console.log("to item canvassing", toItemCanvassing);
      item_canvassing.value.push(toItemCanvassing);
    }
  });

  const equivalent: CanvassingItemForm[] = [];

  (canvassingData.value.canvassing_item ?? []).forEach((element) => {
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
        total_price: element.total_selling_price ?? 0,
        total_selling_price: element.total_selling_price ?? 0,
        status: CanvassingVendorStatus.SUBMITTED,
        taxes: [],
        editing: null,
        type: "parent",
        type_item: element.type_item,
        equivalent_id: element.equivalent_id,
        catalogue: element.catalogue,
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
          catalogue: child.catalogue,
          parent_catalogue_id: child.catalogue_id,
          catalogue_name: child.catalogue?.name ?? "",
          sn: child.catalogue?.sn ?? "",
          quantity: child.quantity,
          unit_price: child.unit_price,
          total_price: child.total_price,
          total_selling_price: child.total_selling_price ?? 0,
          status: child.status,
          checked:
            child.status == CanvassingVendorStatus.SELECTED ? true : false,
          taxes: [],
          editing: null,
          type: "child",
          children: [],
          selling_price: child.selling_price ?? 0,
          profit: child.profit,
          profit_nominal:
            child.profit_unit == "percent"
              ? percentToNominal(child.profit, child.unit_price || 0)
              : child.profit,
          profit_unit: child.profit_unit,
          fee: child.fee,
          fee_unit: child.fee_unit,
          ongkir: child.ongkir,
          ongkir_unit: child.ongkir_unit,
          pricetag_item_id: child.pricetag_item_id ?? "",
          pricetag_item_data: child.pricetag_item,
          pricetag_item_version: child.pricetag_item_version ?? 0,
          contacts_fee: (child.reference_transaction ?? []).filter(
            (value) => value.party_type == PartyType.CONTACT
          ),
          expected_delivery: child.expected_delivery,
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
        type_item: "equivalent" as "request" | "equivalent" | "quotation",
        equivalent_id: element.equivalent_id,
      }));
      item_canvassing.value[indexParent].children = [
        ...item_canvassing.value[indexParent].children,
        ...eq,
      ];
    }
  });

  console.log("fee total", adjustmentTransactionFeeTotal.value);

  fetchPriceTagWithItems();
};

// Fetch canvassing data
const fetchCanvassing = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<Canvassing>>(
      `/canvassing-read/${route.params.id}`,
      "detail-canvassing",
      "get",
      null
    );

    if (response.status.value == "success") {
      if (response.data.value?.data) {
        initialCanvassing(response.data.value!.data);
      }
    }
  } catch (error) {
    ElMessage.error("Failed to fetch canvassing data");
    console.error(error);
    goBack();
  } finally {
    loading.value = false;
  }
};

const disableButtonApprove = computed(() => {
  return Object.values(selectedVendors.value).every((v) => v !== "");
});
const getSelectedVendorId = (itemId: string) => {
  return selectedVendors.value[itemId] || "";
};

function calculateMargin(row: CanvassingItemForm) {
  return ((row.selling_price - row.unit_price) / row.unit_price) * 100;
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatStatus = (status: CanvassingStatus) => {
  switch (status) {
    case CanvassingStatus.DRAFT:
      return "DRAFT";
    case CanvassingStatus.PENDING_APPROVAL:
      return "Menunggu Di Setujui";
    case CanvassingStatus.RAB:
      return "RAB";
    case CanvassingStatus.PENDING_APPROVAL_RAB:
      return "Menunggu Di Setujui";
    case CanvassingStatus.DONE:
      return "Di Setujui";
    case CanvassingStatus.CANCEL:
      return "Tidak Di Setujui";

    default:
      break;
  }
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
    // item_canvassing.value.forEach((element) => {
    //   const findCanvassingItem = (
    //     canvassingData.value?.canvassing_item ?? []
    //   ).findIndex((item) => item.unique_id == element.unique_id);
    //   element.children.forEach((child) => {
    //     if (findCanvassingItem >= 0) {
    //       const vendorIndex = (
    //         canvassingData.value?.canvassing_item[findCanvassingItem]
    //           .canvassing_vendor ?? []
    //       ).findIndex((v) => v.unique_id == child.unique_id);
    //       if (vendorIndex >= 0) {
    //         if (child.checked == true && CanvassingStatus.DONE) {
    //           canvassingData.value!.canvassing_item[
    //             findCanvassingItem
    //           ].canvassing_vendor[vendorIndex].status =
    //             CanvassingVendorStatus.SELECTED;
    //         } else {
    //           canvassingData.value!.canvassing_item[
    //             findCanvassingItem
    //           ].canvassing_vendor[vendorIndex].status =
    //             CanvassingVendorStatus.SUBMITTED;
    //         }
    //       }
    //     }
    //   });
    // });
  },
  { deep: true }
);

watch(
  () => item_canvassing.value,
  () => {
    updateTableSelection();
  },
  { deep: true }
);

const handleSelect = (
  selection: CanvassingItemForm[],
  row: CanvassingItemForm
): void => {
  const isSelected = selection.some((selected) => selected.index === row.index);

  // Parent
  if (row.type === "parent") {
    row.children?.forEach((child) => {
      tableRef.value?.toggleRowSelection(child, isSelected);
    });
  }

  // Child
  else {
    const parent = item_canvassing.value.find(
      (item) => item.index === row.index
    );

    if (parent) {
      const allChildrenSelected = parent.children?.every((child) =>
        selection.some((selected) => selected.index === child.index)
      );

      tableRef.value?.toggleRowSelection(parent, !!allChildrenSelected);
    }
  }

  updateSelectedChildrenFromChecked(selection);
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

const updateSelectedChildrenFromChecked = (selection: CanvassingItemForm[]) => {
  selectedChildren.value = selection.filter((item) => item.type === "child");
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

const submitApproveRab = async (status: CanvassingStatus) => {
  // console.log("selected", selectedChildren.value);
  loading.value = true;
  try {
    const referenceAdjustment: ReferenceTransactionAdjustment[] = [
      ...references.value,
      ...contactsFee.value,
      adjustmentTransactionOngkirTotal.value as ReferenceTransactionAdjustment,
    ];
    const referenceAdjustmentVendor: ReferenceTransactionAdjustment[] = [];

    item_canvassing.value.forEach((element) => {
      element.children.forEach((child) => {
        child.contacts_fee.forEach((fee) => {
          fee.reference_id = child.unique_id ?? "";
          referenceAdjustmentVendor.push(fee);
        });
        referenceAdjustmentVendor.push({
          unique_id: "",
          reference: ReferenceAdjustment.CANVASSINGVENDOR,
          reference_id: child.unique_id ?? "",
          adjustment_id: `${adjustmentOngkir.value?.unique_id}`,
          adjustment: adjustmentOngkir.value,
          value: child.ongkir,
          type: child.ongkir_unit as FeeType,
          amount: child.ongkir,
        });
      });
    });

    // Membuat FormData
    const formData = new FormData();

    // Menambahkan data utama
    formData.append("unique_id", canvassingData.value?.unique_id || "");
    formData.append(
      "source_document",
      canvassingData.value?.source_document || ""
    );
    formData.append("description", canvassingData.value?.description || "");
    formData.append("status", status || "");
    formData.append(`payment_term`, `${canvassingData.value?.payment_term}`);
    formData.append(`tempo_value`, `${canvassingData.value?.tempo_value}`);
    formData.append(`tempo_unit`, `${canvassingData.value?.tempo_unit}`);
    formData.append(`address_id`, `${canvassingData.value?.address_id}`);
    formData.append(
      `address_version`,
      `${canvassingData.value?.address_version}`
    );

    // Append canvassing_items dengan individual fields
    item_canvassing.value.forEach((item: CanvassingItemForm, i: number) => {
      formData.append(`canvassing_items[${i}][unique_id]`, `${item.unique_id}`);
      formData.append(
        `canvassing_items[${i}][canvassing_id]`,
        `${canvassingData.value?.unique_id}`
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

      // const valueSelected = selectedVendors.value[item.unique_id];

      // Append canvassing_vendor
      // Append canvassing_vendor fields satu per satu
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
          `${item.unit_id}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][unit_name]`,
          `${item.unit_name}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][total_price]`,
          `${Number(vendor.quantity) * Number(vendor.unit_price)}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][profit]`,
          `${vendor.profit}`
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

        console.log("in selected", selectedChildren.value);
        console.log("vendor ID", vendor.unique_id);
        console.log(
          "hasSelected",
          selectedChildren.value.find(
            (child) => child.unique_id == vendor.unique_id
          )
            ? true
            : false
        );

        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][status]`,
          `${vendor.status}`
        );

        let referenceCanvassingVendor: ReferenceTransactionAdjustment[] =
          vendor.contacts_fee;

        referenceCanvassingVendor.push({
          unique_id: "",
          reference: ReferenceAdjustment.CANVASSINGVENDOR,
          reference_id: vendor.unique_id ?? "",
          adjustment_id: `${adjustmentOngkir.value?.unique_id}`,
          adjustment: adjustmentOngkir.value,
          value: vendor.ongkir,
          type: vendor.ongkir_unit as FeeType,
          amount: vendor.ongkir,
        });
      });
    });

    referenceAdjustment.forEach((ref, i) => {
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

    (props.canvassingData.payment_terms ?? []).forEach((term, iterm) => {
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

    const response = await useFetchApi<BaseResponse<Canvassing>>(
      "/canvassing-create",
      "create-canvasing",
      "post",
      formData
    );
    if (response.status.value === "success") {
      ElMessage.success(`Berhasil Membuat Data Canvasing!`);
      item_canvassing.value = [];
      contactsFee.value = [];
      editState.value = false;
      dialogSelectedItem.value = false;
      fetchCanvassing();
    }
  } catch (error: any) {
    ElMessage.error(error.response?.message ?? error);
  } finally {
    loading.value = false;
  }
};
const cancelSubmissionApproval = async (
  status: CanvassingStatus,
  withCreate: boolean | false
) => {
  loading.value = true;
  try {
    const referenceAdjustment: ReferenceTransactionAdjustment[] = [
      ...references.value,
      ...contactsFee.value,
      adjustmentTransactionOngkirTotal.value as ReferenceTransactionAdjustment,
    ];
    const referenceAdjustmentVendor: ReferenceTransactionAdjustment[] = [];

    item_canvassing.value.forEach((element) => {
      element.children.forEach((child) => {
        child.contacts_fee.forEach((fee) => {
          fee.reference_id = child.unique_id ?? "";
          referenceAdjustmentVendor.push(fee);
        });
        referenceAdjustmentVendor.push({
          unique_id: "",
          reference: ReferenceAdjustment.CANVASSINGVENDOR,
          reference_id: child.unique_id ?? "",
          adjustment_id: `${adjustmentOngkir.value?.unique_id}`,
          adjustment: adjustmentOngkir.value,
          value: child.ongkir,
          type: child.ongkir_unit as FeeType,
          amount: child.ongkir,
        });
      });
    });

    // Membuat FormData
    const formData = new FormData();

    // Menambahkan data utama
    formData.append("unique_id", canvassingData.value?.unique_id || "");
    formData.append("status", status);

    const response = await useFetchApi<BaseResponse<Canvassing>>(
      "/canvassing-create",
      "create-canvasing",
      "post",
      formData
    );
    if (response.status.value === "success") {
      ElMessage.success(`Berhasil Membatalkan RAB!`);
      item_canvassing.value = [];
      contactsFee.value = [];
      editState.value = false;
      dialogCancelApproval.value = false;
      fetchCanvassing();

      if (withCreate) {
        window.location.href = `/sales/quotation/add?id=${canvassingData.value?.unique_id}&new=true`;
      }
    }
  } catch (error: any) {
    ElMessage.error(error.response?.message ?? error);
  } finally {
    loading.value = false;
  }
};

const submit = async () => {
  loading.value = true;
  try {
    const referenceAdjustment: ReferenceTransactionAdjustment[] = [
      ...references.value,
      ...contactsFee.value,
      adjustmentTransactionOngkirTotal.value as ReferenceTransactionAdjustment,
    ];
    const referenceAdjustmentVendor: ReferenceTransactionAdjustment[] = [];

    item_canvassing.value.forEach((element) => {
      element.children.forEach((child) => {
        child.contacts_fee.forEach((fee) => {
          fee.reference_id = child.unique_id ?? "";
          referenceAdjustmentVendor.push(fee);
        });
        referenceAdjustmentVendor.push({
          unique_id: "",
          reference: ReferenceAdjustment.CANVASSINGVENDOR,
          reference_id: child.unique_id ?? "",
          adjustment_id: `${adjustmentOngkir.value?.unique_id}`,
          adjustment: adjustmentOngkir.value,
          value: child.ongkir,
          type: child.ongkir_unit as FeeType,
          amount: child.ongkir,
        });
      });
    });

    // Membuat FormData
    const formData = new FormData();

    // Menambahkan data utama
    formData.append("unique_id", canvassingData.value?.unique_id || "");
    formData.append(
      "source_document",
      canvassingData.value?.source_document || ""
    );
    formData.append("description", canvassingData.value?.description || "");
    formData.append("status", CanvassingStatus.PENDING_APPROVAL || "");
    formData.append(`payment_term`, `${canvassingData.value?.payment_term}`);
    formData.append(`tempo_value`, `${canvassingData.value?.tempo_value}`);
    formData.append(`tempo_unit`, `${canvassingData.value?.tempo_unit}`);
    formData.append(`address_id`, `${canvassingData.value?.address_id}`);
    formData.append(
      `address_version`,
      `${canvassingData.value?.address_version}`
    );

    // Append canvassing_items dengan individual fields
    item_canvassing.value.forEach((item: CanvassingItemForm, i: number) => {
      formData.append(`canvassing_items[${i}][unique_id]`, `${item.unique_id}`);
      formData.append(
        `canvassing_items[${i}][canvassing_id]`,
        `${canvassingData.value?.unique_id}`
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

      // const valueSelected = selectedVendors.value[item.unique_id];

      // Append canvassing_vendor
      // Append canvassing_vendor fields satu per satu
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
          `${item.unit_id}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][unit_name]`,
          `${item.unit_name}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][total_price]`,
          `${Number(vendor.quantity) * Number(vendor.unit_price)}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][profit]`,
          `${vendor.profit}`
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
          `canvassing_items[${i}][canvassing_vendor][${j}][status]`,
          `${
            vendor.checked
              ? CanvassingVendorStatus.SUBMITTED
              : CanvassingVendorStatus.REJECTED
          }`
        );

        let referenceCanvassingVendor: ReferenceTransactionAdjustment[] =
          vendor.contacts_fee;

        referenceCanvassingVendor.push({
          unique_id: "",
          reference: ReferenceAdjustment.CANVASSINGVENDOR,
          reference_id: vendor.unique_id ?? "",
          adjustment_id: `${adjustmentOngkir.value?.unique_id}`,
          adjustment: adjustmentOngkir.value,
          value: vendor.ongkir,
          type: vendor.ongkir_unit as FeeType,
          amount: vendor.ongkir,
        });

        referenceCanvassingVendor.forEach(
          (ref: ReferenceTransactionAdjustment, refIndex: number) => {
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
              `${ref.amount}`
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
        );
      });
    });

    // Append reference_transaction dengan individual fields
    referenceAdjustment.forEach((ref, i) => {
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

    // Untuk debugging: lihat semua entries FormData
    console.log("=== FORM DATA ENTRIES ===");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    const response = await useFetchApi<BaseResponse<Canvassing>>(
      "/canvassing-create",
      "create-canvasing",
      "post",
      formData
    );
    if (response.status.value === "success") {
      ElMessage.success(`Berhasil Membuat Data Canvasing!`);
      item_canvassing.value = [];
      contactsFee.value = [];
      editState.value = false;
      fetchCanvassing();
    }
  } catch (error: any) {
    ElMessage.error(error.response?.message ?? error);
  } finally {
    loading.value = false;
  }
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

const handleSelectAll = (selection: CanvassingItemForm[]) => {
  const isChecked = selection.length > 0;

  item_canvassing.value.forEach((parent) => {
    // select parent
    tableRef.value?.toggleRowSelection(parent, isChecked);

    // select children
    parent.children?.forEach((child) => {
      tableRef.value?.toggleRowSelection(child, isChecked);
    });
  });

  selectedChildren.value = isChecked
    ? item_canvassing.value.flatMap((parent) => parent.children || [])
    : [];
};

const getStatusTagType = (
  status: CanvassingStatus
): "success" | "info" | "danger" | "warning" | "primary" => {
  switch (status) {
    case CanvassingStatus.DRAFT ||
      CanvassingStatus.RAB ||
      CanvassingStatus.CANVASSING:
      return "info";
    case CanvassingStatus.PENDING_APPROVAL ||
      CanvassingStatus.PENDING_APPROVAL_RAB:
      return "warning";
    case CanvassingStatus.CANCEL:
      return "danger";
    default:
      return "primary";
  }
};
const getStatusTagTypeItem = (
  status: CanvassingVendorStatus
): "success" | "info" | "danger" | "warning" | "primary" => {
  switch (status) {
    case CanvassingVendorStatus.SUBMITTED:
      return "primary";
    case CanvassingVendorStatus.REJECTED:
      return "danger";
    case CanvassingVendorStatus.SELECTED:
      return "success";
    default:
      return "primary";
  }
};
const getStatusTabLabelItem = (status: CanvassingVendorStatus) => {
  switch (status) {
    case CanvassingVendorStatus.SUBMITTED:
      return "Diajukan";
    case CanvassingVendorStatus.REJECTED:
      return "Tidak Di Ajukan";
    case CanvassingVendorStatus.SELECTED:
      return "Di Pilih";
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

    canvassingData.value.canvassing_item.forEach((element, i) => {
      formData.append(
        `canvassing_items[${i}][unique_id]`,
        `${element.unique_id}`
      );

      element.canvassing_vendor.forEach((vendor, vI) => {
        console.log("vendor", vendor.status);
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${vI}][unique_id]`,
          `${vendor.unique_id}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${vI}][status]`,
          `${vendor.status}`
        );
      });
    });

    const response = await useFetchApi<BaseResponse<Canvassing>>(
      "/canvassing-create",
      "update-canvassing-status",
      "post",
      formData
    );

    if (response.status.value == "success") {
      canvassingData.value.status = status;

      ElMessage.success("Canvassing status updated");
    }
  } catch (error) {
    ElMessage.error("Failed to update status");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const statusCheck = async (status: "progress" | "completed" | "pending") => {
  if (!canvassingData.value) return;

  loading.value = true;
  try {
    const formData = new FormData();
    formData.append("unique_id", canvassingData.value.unique_id || "");
    formData.append("status_cek", status);

    const response = await useFetchApi<BaseResponse<Canvassing>>(
      "/canvassing-create",
      `update-canvassing-checked-${status}`,
      "post",
      formData
    );

    if (response.status.value == "success") {
      canvassingData.value.status_cek = status;

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

const generateSCMMemo = async () => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });
  const today = new Date();
  let pageWidth = doc.internal.pageSize.getWidth();
  let pageHeight = doc.internal.pageSize.getHeight();

  const marginX = 10;

  const marginTop = 10;
  const marginBottom = 55; // sisakan ruang footer
  const footerHeight = 35;

  let currentY = 0;

  const ensureSpace = (heightNeeded: number) => {
    if (currentY + heightNeeded > pageHeight - marginBottom) {
      doc.addPage();
      currentY = marginTop;
    }
  };

  const formatted = today.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Logo
  const imgLogo = await getBase64ImageFromUrl("/images/trumecs-logo.png"); // path logo (public/logo.png)
  const tmsLogo = await getBase64ImageFromUrl("/images/tms-logo.png"); // path logo (public/logo.png)
  const headerTop = 10;
  const headerHeight = 25;
  const headerCenterY = headerTop + headerHeight / 2;

  const leftLogoWidth = 40;
  const leftLogoHeight = 35;

  const rightLogoWidth = 40;
  const rightLogoHeight = 14;

  // Logo kiri
  doc.addImage(
    tmsLogo,
    "PNG",
    marginX,
    headerCenterY - leftLogoHeight / 2,
    leftLogoWidth,
    leftLogoHeight
  );

  // Logo kanan
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
  doc.text("SCM MEMO", pageWidth / 2, 50, { align: "center" });

  // ================= INFO =================

  const labelX = marginX;
  const colonX = marginX + 28;
  const valueX = marginX + 32;

  doc.setFontSize(8);
  doc.text("Customer", labelX, 60);
  doc.text(":", colonX, 60);
  doc.text(`${canvassingData?.value?.source?.request_to?.name}`, valueX, 60);
  // doc.text(`Jakarta, ${formatted}`, pageWidth - marginX, 60, {
  //   align: "right",
  // });

  // doc.text("Supplier", labelX, 66);
  // doc.text(":", colonX, 66);
  // doc.text(`${currentCompany().name ?? "-"}`, valueX, 66);

  doc.text("Alamat Pengiriman", labelX, 66);
  doc.text(":", colonX, 66);
  doc.text(`${canvassingData.value!.address?.street}`, valueX, 66);
  doc.text("", labelX, 72);
  doc.text("", colonX, 72);
  doc.text(
    `${generateAddressView(canvassingData.value!.address!) ?? "-"}`,
    valueX,
    72
  );

  doc.text("RFQ Number", labelX, 80);
  doc.text(":", colonX, 80);
  doc.text(`${canvassingData?.value?.source_document ?? "-"}`, valueX, 80);

  const calculateMargin = (totalBuy: number, totalSell: number) => {
    // const totalBuy = Number(getTotalBuyingPrice(row));
    // const totalSell = Number(getTotalSellingPrice(row));

    // Hindari division by zero
    if (totalSell === 0) {
      return 0;
    }

    return ((totalSell - totalBuy) / totalBuy) * 100;
  };

  const getSellingPrice = (row: CanvassingItem) => {
    if (
      row.canvassing_vendor.length == 1 &&
      (row.canvassing_vendor[0].type_item === "equivalent" ||
        row.canvassing_vendor[0].type_item === "quotation")
    ) {
      return 0;
    } else {
      return row.unit_selling_price || 0;
    }
  };
  const getTotalSellingPrice = (row: CanvassingItem) => {
    if (
      row.canvassing_vendor.length == 1 &&
      (row.canvassing_vendor[0].type_item === "equivalent" ||
        row.canvassing_vendor[0].type_item === "quotation")
    ) {
      return 0;
    } else {
      return row.total_selling_price || 0;
    }
  };

  const getTotalBuyingPrice = (row: CanvassingItem) => {
    if (
      row.canvassing_vendor.length == 1 &&
      row.canvassing_vendor[0].type_item == "equivalent"
    ) {
      return 0;
    } else {
      return row.canvassing_vendor.reduce((sum, vendor) => {
        if (
          vendor.status === CanvassingVendorStatus.SELECTED &&
          vendor.type_item !== "equivalent"
        ) {
          return sum + vendor.total_price;
        }

        return sum;
      }, 0);
    }
  };

  const generateRowData = () => {
    const rows: RowInput[] = [];

    (canvassingData.value?.canvassing_item ?? []).forEach(
      (item: CanvassingItem, index: number) => {
        // =========================
        // ORIGINAL ITEM
        // =========================
        rows.push([
          {
            content: `${index + 1}`,
            styles: {
              halign: "center",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
              fillColor: [255, 255, 255],
            },
          },
          {
            content: `${item.catalogue?.name}`,
            styles: {
              halign: "left",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
              fillColor: [255, 255, 255],
            },
          },
          {
            content: ``,
            styles: {
              halign: "left",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
              fillColor: [255, 255, 255],
            },
          },
          {
            content: ``,
            styles: {
              halign: "left",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
              fillColor: [255, 255, 255],
            },
          },
          {
            content: ``,
            styles: {
              halign: "left",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
              fillColor: [255, 255, 255],
            },
          },
          {
            content: ``,
            styles: {
              halign: "left",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
              fillColor: [255, 255, 255],
            },
          },
          {
            content: ``,
            styles: {
              halign: "center",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
              fillColor: [255, 255, 255],
            },
          },
          {
            content: ``,
            styles: {
              halign: "center",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
              fillColor: [255, 255, 255],
            },
          },
          {
            content: ``,
            styles: {
              halign: "center",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
              fillColor: [255, 255, 255],
            },
          },
          {
            content: ``,
            styles: {
              halign: "right",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
              fillColor: [255, 255, 255],
            },
          },
          {
            content: ``,
            styles: {
              halign: "right",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
              fillColor: [255, 255, 255],
            },
          },
          {
            content: ``,
            styles: {
              halign: "right",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
              fillColor: [255, 255, 255],
            },
          },
          {
            content: ``,
            styles: {
              halign: "right",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
              fillColor: [255, 255, 255],
            },
          },
          {
            content: ``,
            styles: {
              halign: "right",
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
              fillColor: [255, 255, 255],
            },
          },
        ]);

        // =========================
        // EQUIVALENT ITEM
        // =========================
        // const equivalentItems = item.canvassing_vendor.filter(
        //   (vendor) => vendor.type_item === "equivalent"
        // );

        item.canvassing_vendor.forEach((vendor, eqIndex) => {
          let delimiter = "";

          if (vendor.type_item == "equivalent") {
            delimiter = "EQ - ";
          } else if (vendor.type_item == "original") {
            delimiter = "REQ - ";
          } else if (vendor.type_item == "quotation") {
            delimiter = "SUB - ";
          }

          let checked = "";

          if (vendor.status == CanvassingVendorStatus.SELECTED) {
            checked = "V";
          }

          rows.push([
            {
              content: `${checked}`,
              styles: {
                halign: "center",
                fontStyle: "italic",
                textColor: [120, 120, 120],
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
                fillColor: [245, 245, 245],
              },
            },
            {
              content: `${delimiter}${displayCatalogueName(vendor.catalogue!)}`,
              styles: {
                halign: "left",
                fontStyle: "italic",
                textColor: [120, 120, 120],
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
                fillColor: [245, 245, 245],
              },
            },
            {
              content: `${vendor.vendor?.name || "-"}`,
              styles: {
                halign: "left",
                fontStyle: "italic",
                textColor: [120, 120, 120],
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
                fillColor: [245, 245, 245],
              },
            },
            {
              content: `${vendor.pricetag_item.status_item}`,
              styles: {
                halign: "left",
                textColor: [120, 120, 120],
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
                fillColor: [245, 245, 245],
              },
            },
            {
              content: `${vendor.pricetag_item.delivery}`,
              styles: {
                halign: "left",
                textColor: [120, 120, 120],
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
                fillColor: [245, 245, 245],
              },
            },
            {
              content: `${vendor.expected_delivery}`,
              styles: {
                halign: "left",
                textColor: [120, 120, 120],
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
                fillColor: [245, 245, 245],
              },
            },

            {
              content: `${vendor.quantity}`,
              styles: {
                halign: "center",
                fontStyle: "italic",
                textColor: [120, 120, 120],
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
                fillColor: [245, 245, 245],
              },
            },
            {
              content: `${vendor.unit_name}`,
              styles: {
                halign: "center",
                fontStyle: "italic",
                textColor: [120, 120, 120],
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
                fillColor: [245, 245, 245],
              },
            },
            {
              content: `${currencyWithoutSymbol(vendor.unit_price || 0)}`,
              styles: {
                halign: "right",
                fontStyle: "italic",
                textColor: [120, 120, 120],
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
                fillColor: [245, 245, 245],
              },
            },
            {
              content: `${currencyWithoutSymbol(
                vendor.unit_price! * vendor.quantity
              )}`,
              styles: {
                halign: "right",
                fontStyle: "italic",
                textColor: [120, 120, 120],
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
                fillColor: [245, 245, 245],
              },
            },
            {
              content: `${currencyWithoutSymbol(vendor.selling_price || 0)}`,
              styles: {
                halign: "right",
                fontStyle: "italic",
                textColor: [120, 120, 120],
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
                fillColor: [245, 245, 245],
              },
            },
            {
              content: `${currencyWithoutSymbol(
                vendor.total_selling_price || 0
              )}`,
              styles: {
                halign: "right",
                fontStyle: "italic",
                textColor: [120, 120, 120],
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
                fillColor: [245, 245, 245],
              },
            },
            {
              content: `${currencyWithoutSymbol(
                Number(vendor.total_selling_price || 0) -
                  Number(vendor.total_price || 0)
              )}`,
              styles: {
                halign: "right",
                fontStyle: "italic",
                textColor: [120, 120, 120],
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
                fillColor: [245, 245, 245],
              },
            },
            {
              content: `${calculateMargin(
                vendor.total_price,
                vendor.total_selling_price || 0
              ).toFixed(2)}`,
              styles: {
                halign: "right",
                fontStyle: "italic",
                textColor: [120, 120, 120],
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
                fillColor: [245, 245, 245],
              },
            },
          ]);
        });
      }
    );

    return rows;
  };

  let rowData: RowInput[] = generateRowData();

  // console.log(rowData);
  // rowData.push(['','','','','Total Price',grandTotal])
  // rowData.push(['','','','','PPN','11%'])

  let summeryNumber = (canvassingData.value?.canvassing_item ?? []).length + 1;

  const subtotalUnitSellingPrice = () => {
    let total = 0;
    canvassingData.value?.canvassing_item.forEach((element) => {
      total += element.canvassing_vendor.reduce(
        (sum, acc) => sum + (acc.selling_price || 0),
        0
      );
    });

    return total;
  };
  const subtotalSellingPrice = () => {
    let total = 0;
    canvassingData.value?.canvassing_item.forEach((element) => {
      total += element.canvassing_vendor.reduce(
        (sum, acc) => sum + (acc.total_selling_price || 0),
        0
      );
    });

    return total;
  };
  const subtotalMarginNominal =
    subtotalSellingPrice() - subtotalBuyTotalPrice.value;
  const subtotalMargin =
    (subtotalMarginNominal / subtotalBuyTotalPrice.value) * 100;

  let grandTotalPrint = subtotalSellingPrice() - subtotalBuyTotalPrice.value;

  grandTotalPrint -= adjustmentTransactionOngkirTotal.value?.amount || 0;

  summeryNumber++;
  rowData.push([
    {
      content: `Subtotal`,
      colSpan: 8,
      styles: {
        halign: "right",
        fontStyle: "bold",
        cellWidth: 0.0,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        fillColor: [255, 255, 255],
      },
    },
    {
      content: `${currencyWithoutSymbol(subtotalBuyPrice.value)}`,
      styles: {
        halign: "right",
        cellWidth: 0.0,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        fillColor: [255, 255, 255],
      },
    },
    {
      content: `${currencyWithoutSymbol(subtotalBuyTotalPrice.value)}`,
      styles: {
        halign: "right",
        cellWidth: 0.0,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        fillColor: [255, 255, 255],
      },
    },
    {
      content: `${currencyWithoutSymbol(subtotalUnitSellingPrice())}`,
      styles: {
        halign: "right",
        cellWidth: 0.0,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        fillColor: [255, 255, 255],
      },
    },
    {
      content: `${currencyWithoutSymbol(subtotalSellingPrice())}`,
      styles: {
        halign: "right",
        cellWidth: 0.0,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        fillColor: [255, 255, 255],
      },
    },
    {
      content: `${currencyWithoutSymbol(subtotalMarginNominal)}`,
      styles: {
        halign: "right",
        cellWidth: 0.0,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        fillColor: [255, 255, 255],
      },
    },
    {
      content: `${currencyWithoutSymbol(subtotalMargin)}`,
      styles: {
        halign: "right",
        cellWidth: 0.0,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        fillColor: [255, 255, 255],
      },
    },
  ]);

  rowData.push([
    {
      content: `${adjustmentTransactionOngkirTotal?.value.adjustments_transaction?.name}`,
      colSpan: 8,
      styles: {
        halign: "right",
        fontStyle: "bold",
        cellWidth: 0.0,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        fillColor: [255, 255, 255],
      },
    },
    {
      content: `${currencyWithoutSymbol(
        adjustmentTransactionOngkirTotal.value?.amount ?? 0
      )}`,
      colSpan: 5,
      styles: {
        halign: "right",
        cellWidth: 0.0,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        fillColor: [255, 255, 255],
      },
    },
    {
      content: `${safePercent(
        adjustmentTransactionOngkirTotal.value?.amount ?? 0,
        subtotalBuyTotalPrice.value
      )}`,

      styles: {
        halign: "right",
        cellWidth: 0.0,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        fillColor: [255, 255, 255],
      },
    },
  ]);

  let fee = 0;
  if (
    adjustmentTransactionFeeTotal.value.type == FeeType.AMOUNT &&
    adjustmentTransactionFeeTotal.value.reference_id != ""
  ) {
    fee = adjustmentTransactionFeeTotal.value.amount;
  } else if (
    adjustmentTransactionFeeTotal.value.type == FeeType.PERCENT &&
    adjustmentTransactionFeeTotal.value.reference_id != ""
  ) {
    fee =
      (Number(grandTotal.value) * adjustmentTransactionFeeTotal.value.amount) /
      100;
  }

  if (adjustmentTransactionFeeTotal.value.reference_id != "") {
    grandTotalPrint -= fee;
    rowData.push([
      {
        content: `${adjustmentTransactionFeeTotal.value.adjustments_transaction?.name}`,
        colSpan: 8,
        styles: {
          halign: "right",
          fontStyle: "bold",
          cellWidth: 0.0,
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          fillColor: [255, 255, 255],
        },
      },
      {
        content: `${currencyWithoutSymbol(fee)}`,
        colSpan: 5,
        styles: {
          halign: "right",
          cellWidth: 0.0,
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          fillColor: [255, 255, 255],
        },
      },
      {
        content: `${safePercent(fee ?? 0, totalBuyingPrice.value)}`,

        styles: {
          halign: "right",
          cellWidth: 0.0,
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          fillColor: [255, 255, 255],
        },
      },
    ]);
  }

  (references.value ?? []).forEach((element) => {
    if (
      element.adjustments_transaction?.name.toLowerCase() != "fee" &&
      element.party_type != PartyType.CONTACT
    ) {
      grandTotalPrint -= element.amount;
      rowData.push([
        {
          content: `${element.adjustments_transaction?.name}`,
          colSpan: 5,
          styles: {
            halign: "right",
            fontStyle: "bold",
            cellWidth: 0.0,
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
            fillColor: [255, 255, 255],
          },
        },
        {
          content: `${currencyWithoutSymbol(
            showTransactionAdjustmentValue(element)
          )}`,
          colSpan: 4,
          styles: {
            halign: "right",
            cellWidth: 0.0,
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
            fillColor: [255, 255, 255],
          },
        },
        {
          content: `${safePercent(
            displayAmount(element, subtotalBuyTotalPrice.value),
            subtotalBuyTotalPrice.value
          )}`,
          styles: {
            halign: "right",
            cellWidth: 0.0,
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
            fillColor: [255, 255, 255],
          },
        },
      ]);
    }
  });

  const totalFeeRecive = (canvassingData.value?.reference_transaction || [])
    .filter(
      (ref) =>
        ref.adjustments_transaction?.name.toLowerCase() == "fee" &&
        ref.party_type == PartyType.CONTACT
    )
    .reduce((acc, sum) => acc + (sum.amount ?? 0), 0);

  rowData.push([
    {
      content: `Total Fee`,
      colSpan: 8,
      styles: {
        halign: "right",
        fontStyle: "bold",
        cellWidth: 0.0,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        fillColor: [255, 255, 255],
      },
    },
    {
      content: `${currencyWithoutSymbol(totalFeeRecive || 0)}`,
      colSpan: 5,
      styles: {
        halign: "right",
        cellWidth: 0.0,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        fillColor: [255, 255, 255],
      },
    },
    {
      content: `${safePercent(totalFeeRecive, subtotalBuyTotalPrice.value)}`,
      styles: {
        halign: "right",
        cellWidth: 0.0,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        fillColor: [255, 255, 255],
      },
    },
  ]);
  summeryNumber++;
  grandTotalPrint -= totalFeeRecive;

  rowData.push([
    {
      content: `Grand Total`,
      colSpan: 8,
      styles: {
        halign: "right",
        fontStyle: "bold",
        cellWidth: 0.0,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        fillColor: [255, 255, 255],
      },
    },
    {
      content: `${currencyWithoutSymbol(grandTotalPrint || 0)}`,
      colSpan: 5,
      styles: {
        halign: "right",
        cellWidth: 0.0,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        fillColor: [255, 255, 255],
      },
    },
    {
      content: `${safePercent(grandTotalPrint, subtotalBuyTotalPrice.value)}`,
      styles: {
        halign: "right",
        cellWidth: 0.0,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        fillColor: [255, 255, 255],
      },
    },
  ]);

  // Table

  autoTable(doc, {
    startY: 86,
    theme: "grid",
    head: [
      [
        {
          content: "No",
          rowSpan: 2,
        },
        {
          content: "Nama Barang",
          rowSpan: 2,
        },
        {
          content: "Vendor",
          rowSpan: 2,
        },
        {
          content: "Ketersediaan",
          rowSpan: 2,
        },
        {
          content: "Pengiriman",
          rowSpan: 2,
        },
        {
          content: "Est.Pengiriman",
          rowSpan: 2,
        },
        {
          content: "Jml Order",
          rowSpan: 2,
        },
        {
          content: "Kemasan",
          rowSpan: 2,
        },
        {
          content: "Harga Beli",
          colSpan: 2,
        },
        {
          content: "Harga Jual",
          colSpan: 2,
        },
        {
          content: "Margin",
          rowSpan: 2,
        },
        {
          content: "% Margin",
          rowSpan: 2,
        },
      ],
      [
        {
          content: "Harga Beli",
        },
        {
          content: "Total Harga",
        },
        {
          content: "Harga Jual",
        },
        {
          content: "Total Harga",
        },
      ],
    ],
    body: rowData,
    styles: {
      fontSize: 6,
    },
    margin: { left: marginX, right: marginX },
    headStyles: {
      fillColor: [248, 248, 248], // background
      textColor: [0, 0, 0], // warna text
      fontStyle: "bold", // bold
      halign: "center", // center text
      valign: "middle", // vertical align
      lineWidth: 0.1, // border
      lineColor: [0, 0, 0], // warna border
    },
  });

  // // Summary
  currentY = (doc as any).lastAutoTable.finalY + 10;
  // doc.text(`Total Price: Rp ${currency(grandTotal)}`, 140, finalY)
  // doc.text(`PPN: Rp ${currency(grandTotal)}`, 140, finalY + 10)

  // finalY += 10
  // doc.text(`Grand Total: Rp ${currency(grandTotal.value)}`, 140, finalY)
  // Notes
  ensureSpace(10);

  doc.text("Notes:", 10, currentY);

  currentY += 8;

  doc.setFontSize(8);
  const writeWrappedText = (text: string, x = 20, lineHeight = 5) => {
    const lines = doc.splitTextToSize(text, pageWidth - 30);

    ensureSpace(lines.length * lineHeight);

    doc.text(lines, x, currentY);

    currentY += lines.length * lineHeight;
  };

  writeWrappedText(
    `\u2022 Dikirim ke ${
      generateResultSearchAddress(canvassingData?.value?.address ?? null).name
    }`
  );

  (canvassingData.value?.payment_terms ?? []).forEach((element) => {
    writeWrappedText(
      `\u2022 ${element.name} ${
        element.term_of_payment == PaymentTerm.TEMPO
          ? `${element.duration}D`
          : ""
      }`
    );
  });

  if (canvassingData.value?.description) {
    const splits = `${canvassingData.value?.description}`.split("\n");

    splits.forEach((value) => {
      writeWrappedText(`\u2022 ${value ?? "-"}`);
      // yFinal = yFinal + Number(5);
      // console.log("final Y", yFinal);
      // doc.text(`\u2022 ${value ?? "-"}`, 20, yFinal);
    });
  }

  currentY += 8;
  const drawFooter = async () => {
    let approvedSignBase64 = "";
    let requestSignBase64 = "";

    if (
      canvassingData.value?.approved_by?.files &&
      canvassingData.value.approved_by.files.length > 0
    ) {
      approvedSignBase64 = await getBase64ImageFromUrl(
        `${imageUrl}/${canvassingData.value.approved_by.files[0].image_path}/${canvassingData.value.approved_by.files[0].filename}`
      );
    }

    if (
      canvassingData.value?.request_by?.files &&
      canvassingData.value.request_by.files.length > 0
    ) {
      requestSignBase64 = await getBase64ImageFromUrl(
        `${imageUrl}/${canvassingData.value.request_by.files[0].image_path}/${canvassingData.value.request_by.files[0].filename}`
      );
    }

    const lastPage = doc.getNumberOfPages();

    doc.setPage(lastPage);

    const footerY = pageHeight - footerHeight;

    // =========================
    // Titik tengah masing-masing kolom
    // =========================
    const leftX = pageWidth * 0.12;
    const middleX = pageWidth * 0.55;
    const rightX = pageWidth * 0.84;

    // =========================
    // Layout
    // =========================
    const signWidth = 35;
    const signHeight = 20;

    const titleY = footerY - 30;
    const imageY = titleY + 8;
    const nameY = imageY + signHeight + 8;
    const positionY = nameY + 6;

    const drawSignature = (
      centerX: number,
      title: string,
      name: string,
      position: string,
      image?: {
        base64: string;
        type: string;
      }
    ) => {
      if (title) {
        doc.text(title, centerX, titleY, {
          align: "center",
        });
      }

      if (image) {
        doc.addImage(
          image.base64,
          image.type,
          centerX - signWidth / 2,
          imageY,
          signWidth,
          signHeight
        );
      }

      doc.text(name, centerX, nameY, {
        align: "center",
      });

      doc.text(position, centerX, positionY, {
        align: "center",
      });
    };

    // =========================
    // Tanggal
    // =========================

    // doc.text(
    //   `Jakarta, ${formatLocalDate(canvassingData.value!.created_at!)}`,
    //   marginX,
    //   titleY
    // );

    // =========================
    // Operation
    // =========================

    drawSignature(
      leftX,
      `Jakarta, ${formatLocalDate(canvassingData.value!.created_at!)}`,
      canvassingData.value?.request_by
        ? capitalizeWords(canvassingData.value.request_by?.name ?? "")
        : "Stanislaus Adrian Pratama",
      "Operation",
      requestSignBase64
        ? {
            base64: requestSignBase64,
            type: "PNG",
          }
        : undefined
    );

    // =========================
    // Finance
    // =========================

    drawSignature(middleX, "Diketahui Oleh,", "Nina", "Finance");

    // =========================
    // Direktur
    // =========================

    drawSignature(
      rightX,
      "Disetujui Oleh,",
      canvassingData.value?.approved_by
        ? capitalizeWords(canvassingData.value.approved_by?.name ?? "")
        : "Chairil Juwono",
      "Direktur",
      approvedSignBase64
        ? {
            base64: approvedSignBase64,
            type: canvassingData.value!.approved_by!.files![0].mime_type.split(
              "/"
            )[1],
          }
        : undefined
    );
  };
  await drawFooter();

  doc.addPage("a4", "portrait");

  pageWidth = doc.internal.pageSize.getWidth();
  pageHeight = doc.internal.pageSize.getHeight();

  currentY = 20;
  let vendorY = currentY;

  doc.setFontSize(12);
  doc.setFont(StandardFonts.Helvetica, "bold");
  doc.text("Pembayaran Customer", marginX, vendorY);

  vendorY += 8;

  doc.setFont(StandardFonts.Helvetica, "normal");
  doc.setFontSize(9);

  (canvassingData.value?.payment_terms ?? []).forEach((payment) => {
    const duration =
      payment.term_of_payment === PaymentTerm.TEMPO
        ? ` ${payment.duration}D`
        : "";

    const paymentText =
      payment.name.toUpperCase() === payment.term_of_payment.toUpperCase()
        ? `${payment.name} ${payment.value}%`
        : `${payment.name} ${
            payment.value
          }% ${payment.term_of_payment.toUpperCase()}${duration}`;

    doc.text(`• ${paymentText}`, marginX + 4, vendorY);

    vendorY += 6;
  });

  vendorY += 20;

  doc.setFontSize(12);
  doc.setFont(StandardFonts.Helvetica, "bold");
  doc.text("Penerima Fee", marginX, vendorY);

  vendorY += 8;

  autoTable(doc, {
    startY: vendorY,
    theme: "grid",
    head: [
      [
        {
          content: "Nama",
        },
        {
          content: "Nomor Telepon",
        },
        {
          content: "Email",
        },
        {
          content: "Fee",
        },
      ],
    ],
    body:
      (contactsFee.value ?? []).map((item) => [
        (item.party as Contact).name ?? "-",
        (item.party as Contact).phone ?? "-",
        (item.party as Contact).email ?? "-",
        currencyWithoutSymbol(item.amount ?? 0),
      ]) || [],
    styles: {
      fontSize: 8,
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      cellPadding: 2,
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
    bodyStyles: {
      valign: "middle",
    },
    columnStyles: {
      3: {
        halign: "right",
      },
    },
    margin: {
      left: marginX,
      right: marginX,
    },
  });

  vendorY = (doc as any).lastAutoTable.finalY + 12;

  doc.setFontSize(12);
  doc.setFont(StandardFonts.Helvetica, "bold");
  doc.text("Daftar Vendor", marginX, vendorY);
  vendorY += 10;

  for (const vendor of pricetagList.value) {
    // Cek apakah masih muat
    if (vendorY > 240) {
      doc.addPage();
      vendorY = 20;

      doc.setFont(StandardFonts.Helvetica, "bold");
      doc.setFontSize(12);
      doc.text("Daftar Vendor", marginX, vendorY);

      vendorY += 10;

      doc.setFont(StandardFonts.Helvetica, "normal");
      doc.setFontSize(9);
    }

    doc.setFontSize(9);
    // =========================
    // Nama Vendor
    // =========================
    doc.setFont(StandardFonts.Helvetica, "bold");
    doc.text("Nama Vendor", marginX, vendorY);
    doc.setFont(StandardFonts.Helvetica, "normal");
    doc.text(`: ${vendor.owner?.name ?? "-"}`, marginX + 30, vendorY);

    vendorY += 6;

    // =========================
    // Berlaku S/D
    // =========================
    doc.setFont(StandardFonts.Helvetica, "bold");
    doc.text("Berlaku S/d", marginX, vendorY);
    doc.setFont(StandardFonts.Helvetica, "normal");
    doc.text(`: ${formatLocalDate(vendor.end_date)}`, marginX + 30, vendorY);

    vendorY += 10;

    // =========================
    // Pembayaran
    // =========================
    doc.setFont(StandardFonts.Helvetica, "bold");
    doc.text("Pembayaran", marginX, vendorY);

    vendorY += 6;

    doc.setFont(StandardFonts.Helvetica, "normal");

    (vendor.payment_terms ?? []).forEach((payment) => {
      const duration =
        payment.term_of_payment === PaymentTerm.TEMPO
          ? ` ${payment.duration}D`
          : "";

      const paymentText =
        payment.name.toUpperCase() === payment.term_of_payment.toUpperCase()
          ? `${payment.name} ${payment.value}%`
          : `${payment.name} ${payment.value}% ${payment.term_of_payment}${duration}`;

      doc.text(`• ${paymentText}`, marginX + 4, vendorY);

      vendorY += 5;
    });

    vendorY += 4;

    // =========================
    // Catatan
    // =========================
    doc.setFont(StandardFonts.Helvetica, "bold");
    doc.text("Catatan", marginX, vendorY);

    vendorY += 6;

    doc.setFont(StandardFonts.Helvetica, "normal");

    if (vendor.note?.trim()) {
      const notes = vendor.note.split("\n").filter((v) => v.trim() !== "");

      notes.forEach((note) => {
        const lines = doc.splitTextToSize(`• ${note}`, pageWidth - 25);

        doc.text(lines, marginX + 4, vendorY);

        vendorY += lines.length * 5;
      });
    } else {
      doc.text("Tidak Ada Catatan", marginX + 4, vendorY);
      vendorY += 5;
    }

    vendorY += 8;

    // Garis pemisah antar vendor
    doc.setDrawColor(180);
    doc.line(marginX, vendorY, pageWidth - marginX, vendorY);

    vendorY += 10;
  }

  doc.setFontSize(8);

  const appendVendorImages = async (doc: jsPDF) => {
    const hasImage = pricetagList.value.some((vendor) =>
      vendor.files?.some((file) => {
        const filename = file.filename.toLowerCase();

        return (
          filename.endsWith(".jpg") ||
          filename.endsWith(".jpeg") ||
          filename.endsWith(".png") ||
          filename.endsWith(".webp")
        );
      })
    );

    if (!hasImage) return;

    doc.addPage("a4", "portrait");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const marginTop = 15;
    const marginBottom = 15;

    let currentY = marginTop;

    const imageWidth = 85;
    const imageHeight = 85;

    const columnGap = 15;
    const rowGap = 15;

    const leftX = 10;
    const rightX = leftX + imageWidth + columnGap;

    const getImageFitSize = (
      base64: string,
      maxWidth: number,
      maxHeight: number
    ): Promise<{ width: number; height: number }> => {
      return new Promise((resolve) => {
        const img = new Image();

        img.onload = () => {
          const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);

          resolve({
            width: img.width * ratio,
            height: img.height * ratio,
          });
        };

        img.src = base64;
      });
    };

    for (const vendor of pricetagList.value) {
      if (!vendor.files?.length) continue;

      const imageFiles = vendor.files.filter((file) => {
        const filename = file.filename.toLowerCase();

        return (
          filename.endsWith(".jpg") ||
          filename.endsWith(".jpeg") ||
          filename.endsWith(".png") ||
          filename.endsWith(".webp")
        );
      });

      if (!imageFiles.length) continue;

      // jika label vendor + minimal 1 baris gambar tidak muat
      if (currentY + 15 + imageHeight > pageHeight - marginBottom) {
        doc.addPage("a4", "portrait");
        currentY = marginTop;
      }

      doc.setFontSize(11);
      doc.setFont(StandardFonts.Helvetica, "bold");
      doc.text(`Vendor : ${vendor.owner?.name ?? "-"}`, 10, currentY);

      currentY += 8;

      doc.setFont(StandardFonts.Helvetica, "normal");
      doc.setFontSize(8);

      let column = 0;
      let row = 0;

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];

        // setiap 4 gambar pindah halaman
        if (i > 0 && i % 4 === 0) {
          doc.addPage("a4", "portrait");

          currentY = marginTop;

          doc.setFontSize(11);
          doc.setFont(StandardFonts.Helvetica, "bold");
          doc.text(`Vendor : ${vendor.owner?.name ?? "-"}`, 10, currentY);

          currentY += 8;

          doc.setFont(StandardFonts.Helvetica, "normal");
          doc.setFontSize(8);

          column = 0;
          row = 0;
        }

        const imageUrl = `${baseImageURL}/${file.image_path}/${file.filename}`;

        const response = await fetch(imageUrl);

        if (!response.ok) continue;

        const blob = await response.blob();

        const base64 = await blobToBase64(blob);

        const x = column === 0 ? leftX : rightX;
        const y = currentY + row * (imageHeight + rowGap);

        const { width, height } = await getImageFitSize(
          base64,
          imageWidth,
          imageHeight
        );

        // supaya berada di tengah kotak
        const offsetX = (imageWidth - width) / 2;
        const offsetY = (imageHeight - height) / 2;

        doc.addImage(
          base64,
          file.filename.toLowerCase().endsWith(".png") ? "PNG" : "JPEG",
          x + offsetX,
          y + offsetY,
          width,
          height
        );

        column++;

        if (column === 2) {
          column = 0;
          row++;
        }
      }

      const rowsUsed = Math.ceil(Math.min(imageFiles.length, 4) / 2);

      currentY += rowsUsed * (imageHeight + rowGap) + 10;
    }
  };
  await appendVendorImages(doc);

  const blob = doc.output("blob");

  const mergedPdf = await PDFDocument.create();

  const memoBytes = await blob.arrayBuffer();

  const memoPdf = await PDFDocument.load(memoBytes);

  const memoPages = await mergedPdf.copyPages(
    memoPdf,
    memoPdf.getPageIndices()
  );

  memoPages.forEach((page) => {
    mergedPdf.addPage(page);
  });

  for (const vendor of pricetagList.value) {
    if (!vendor.files?.length) continue;

    for (const file of vendor.files) {
      try {
        const response = await fetch(
          `${baseImageURL}/${file.image_path}/${file.filename}`
        );

        if (!response.ok) continue;

        // Cek apakah benar PDF
        const contentType = response.headers.get("content-type") ?? "";

        if (!contentType.includes("application/pdf")) {
          continue;
        }

        const bytes = await response.arrayBuffer();

        const vendorPdf = await PDFDocument.load(bytes);

        const vendorPages = await mergedPdf.copyPages(
          vendorPdf,
          vendorPdf.getPageIndices()
        );

        vendorPages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      } catch (err) {
        console.error("Gagal membaca file vendor", err);
      }
    }
  }

  if ((comments.data?.value?.data || []).length > 0) {
    let historyPage = mergedPdf.addPage([595.28, 841.89]);

    const { width, height } = historyPage.getSize();

    const font = await mergedPdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);

    currentY = height - 40;

    if ((comments.data.value?.data || []).length > 0) {
      historyPage.drawText("Riwayat Komentar", {
        x: 40,
        y: currentY,
        size: 16,
        font: fontBold,
      });
    }

    currentY -= 25;

    const maxWidth = width - 90;

    const writeWrappedComment = (
      text: string,
      x: number,
      font: PDFFont,
      size: number
    ) => {
      const normalizedText = (text ?? "").replace(/\r/g, "");

      const paragraphs = normalizedText.split("\n");

      for (const paragraph of paragraphs) {
        // Jika memang baris kosong, beri jarak lalu lanjut
        if (paragraph.trim() === "") {
          currentY -= 14;

          if (currentY < 60) {
            historyPage = mergedPdf.addPage();

            currentY = height - 40;

            historyPage.drawText("Riwayat Komentar", {
              x: 40,
              y: currentY,
              size: 16,
              font: fontBold,
            });

            currentY -= 25;
          }

          continue;
        }

        const words = paragraph.split(" ");

        let line = "";

        for (const word of words) {
          const testLine = line ? `${line} ${word}` : word;

          const textWidth = font.widthOfTextAtSize(testLine, size);

          if (textWidth > maxWidth) {
            if (currentY < 60) {
              historyPage = mergedPdf.addPage();

              currentY = height - 40;

              historyPage.drawText("Riwayat Komentar", {
                x: 40,
                y: currentY,
                size: 16,
                font: fontBold,
              });

              currentY -= 25;
            }

            historyPage.drawText(line, {
              x,
              y: currentY,
              size,
              font,
              color: rgb(0, 0, 0),
            });

            currentY -= 14;

            line = word;
          } else {
            line = testLine;
          }
        }

        if (line) {
          if (currentY < 60) {
            historyPage = mergedPdf.addPage();

            currentY = height - 40;

            historyPage.drawText("Riwayat Komentar", {
              x: 40,
              y: currentY,
              size: 16,
              font: fontBold,
            });

            currentY -= 25;
          }

          historyPage.drawText(line, {
            x,
            y: currentY,
            size,
            font,
            color: rgb(0, 0, 0),
          });

          currentY -= 14;
        }

        // Jarak antar paragraph
        currentY -= 4;
      }
    };

    for (const comment of comments.data.value?.data ?? []) {
      // kalau sudah mentok bawah, tambah halaman
      if (currentY < 60) {
        const page = mergedPdf.addPage();

        currentY = height - 40;

        page.drawText("Riwayat Komentar", {
          x: 40,
          y: currentY,
          size: 16,
          font: fontBold,
        });

        currentY -= 25;

        // ganti halaman aktif
        historyPage = page;
      }

      historyPage.drawText(
        `${comment.people?.name ?? "-"} ${formatLocalDateTime(
          comment.created_at
        )}`,
        {
          x: 40,
          y: currentY,
          size: 10,
          color: rgb(0.45, 0.45, 0.45),
        }
      );

      currentY -= 15;

      writeWrappedComment(comment.comment ?? "-", 40, font, 10);

      currentY -= 10;

      const lines = Math.ceil((comment.comment?.length ?? 0) / 90);

      currentY -= lines * 14 + 15;
    }
  }

  const mergedBytes = await mergedPdf.save();
  const mergedBlob = new Blob([new Uint8Array(mergedBytes)], {
    type: "application/pdf",
  });

  pdfBlob.value = mergedBlob;
  pdfUrl.value = URL.createObjectURL(blob);

  return {
    blob: mergedBlob,
  };
};

const generateSCMMemoExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Trumecs";
  workbook.created = new Date();

  // =========================
  // WORKSHEET : SCM MEMO
  // =========================
  const ws = workbook.addWorksheet("SCM MEMO", {
    pageSetup: {
      paperSize: 9, // A4
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.3,
        right: 0.3,
        top: 0.5,
        bottom: 0.5,
        header: 0,
        footer: 0,
      },
    },
  });

  // Lebar kolom mengikuti tabel PDF
  ws.columns = [
    { width: 5 }, // A No
    { width: 32 }, // B Nama Barang
    { width: 25 }, // C Vendor
    { width: 15 }, // D Ketersediaan
    { width: 15 }, // E Pengiriman
    { width: 18 }, // F Est. Pengiriman
    { width: 10 }, // G Qty
    { width: 10 }, // H Unit
    { width: 15 }, // I Harga Beli
    { width: 18 }, // J Total Beli
    { width: 15 }, // K Harga Jual
    { width: 18 }, // L Total Jual
    { width: 15 }, // M Margin
    { width: 12 }, // N % Margin
  ];

  // =========================
  // HEADER
  // =========================
  ws.mergeCells("A1:N1");
  ws.getCell("A1").value = "SCM MEMO";
  ws.getCell("A1").font = { bold: true, size: 18 };
  ws.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  ws.getRow(1).height = 30;

  // Informasi customer
  ws.getCell("A3").value = "Customer";
  ws.getCell("B3").value = ":";
  ws.getCell("C3").value =
    canvassingData.value?.source?.request_to?.name || "-";

  ws.getCell("A4").value = "Alamat Pengiriman";
  ws.getCell("B4").value = ":";
  ws.getCell("C4").value = generateAddressView(
    canvassingData.value!.address! ?? "-"
  );

  ws.getCell("A5").value = "RFQ Number";
  ws.getCell("B5").value = ":";
  ws.getCell("C5").value = canvassingData.value?.source_document || "-";

  ["A3", "A4", "A5"].forEach((c) => {
    ws.getCell(c).font = { bold: true };
  });

  // =========================
  // TABLE HEADER
  // =========================
  const headerRow = 8;

  ws.mergeCells(`A${headerRow}:A${headerRow + 1}`);
  ws.mergeCells(`B${headerRow}:B${headerRow + 1}`);
  ws.mergeCells(`C${headerRow}:C${headerRow + 1}`);
  ws.mergeCells(`D${headerRow}:D${headerRow + 1}`);
  ws.mergeCells(`E${headerRow}:E${headerRow + 1}`);
  ws.mergeCells(`F${headerRow}:F${headerRow + 1}`);
  ws.mergeCells(`G${headerRow}:G${headerRow + 1}`);
  ws.mergeCells(`H${headerRow}:H${headerRow + 1}`);
  ws.mergeCells(`I${headerRow}:J${headerRow}`);
  ws.mergeCells(`K${headerRow}:L${headerRow}`);
  ws.mergeCells(`M${headerRow}:M${headerRow + 1}`);
  ws.mergeCells(`N${headerRow}:N${headerRow + 1}`);

  ws.getCell(`A${headerRow}`).value = "No";
  ws.getCell(`B${headerRow}`).value = "Nama Barang";
  ws.getCell(`C${headerRow}`).value = "Vendor";
  ws.getCell(`D${headerRow}`).value = "Ketersediaan";
  ws.getCell(`E${headerRow}`).value = "Pengiriman";
  ws.getCell(`F${headerRow}`).value = "Est. Pengiriman";
  ws.getCell(`G${headerRow}`).value = "Jml Order";
  ws.getCell(`H${headerRow}`).value = "Kemasan";
  ws.getCell(`I${headerRow}`).value = "Harga Beli";
  ws.getCell(`K${headerRow}`).value = "Harga Jual";
  ws.getCell(`M${headerRow}`).value = "Margin";
  ws.getCell(`N${headerRow}`).value = "% Margin";

  ws.getCell(`I${headerRow + 1}`).value = "Harga Beli";
  ws.getCell(`J${headerRow + 1}`).value = "Total Harga";
  ws.getCell(`K${headerRow + 1}`).value = "Harga Jual";
  ws.getCell(`L${headerRow + 1}`).value = "Total Harga";

  // Style header
  for (let r = headerRow; r <= headerRow + 1; r++) {
    ws.getRow(r).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "F2F2F2" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  }

  // =========================
  // DATA ITEM & VENDOR
  // =========================
  let currentRow = headerRow + 2;

  (canvassingData.value?.canvassing_item || []).forEach((item, index) => {
    // Parent row
    ws.addRow([
      index + 1,
      item.catalogue
        ? displayCatalogueName(item.catalogue)
        : item.catalogue_name,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);

    const parentRow = ws.getRow(currentRow);
    parentRow.font = { bold: true };
    currentRow++;

    // Child/vendor rows
    (item.canvassing_vendor || []).forEach((vendor) => {
      let delimiter = "";
      if (vendor.type_item === "equivalent") delimiter = "EQ - ";
      else if (vendor.type_item === "original") delimiter = "REQ - ";
      else if (vendor.type_item === "quotation") delimiter = "SUB - ";

      const totalBuy = vendor.total_price || 0;
      const totalSell = vendor.total_selling_price || 0;
      const marginNominal = totalSell - totalBuy;
      const marginPercent = totalBuy > 0 ? marginNominal / totalBuy : 0;

      ws.addRow([
        vendor.status === CanvassingVendorStatus.SELECTED ? "V" : "",
        `${delimiter}${
          vendor.catalogue
            ? displayCatalogueName(vendor.catalogue)
            : vendor.catalogue_name
        }`,
        vendor.vendor?.name || "-",
        vendor.pricetag_item?.status_item || "-",
        vendor.pricetag_item?.delivery || "-",
        vendor.expected_delivery || "-",
        vendor.quantity,
        vendor.unit_name,
        vendor.unit_price || 0,
        totalBuy,
        vendor.selling_price || 0,
        totalSell,
        marginNominal,
        marginPercent,
      ]);

      const childRow = ws.getRow(currentRow);
      childRow.font = {
        italic: true,
        color: { argb: "666666" },
      };

      currentRow++;
    });
  });

  // =========================
  // SUMMARY
  // =========================

  const subtotalSellingPrice = () => {
    let total = 0;
    canvassingData.value?.canvassing_item.forEach((element) => {
      total += element.canvassing_vendor.reduce(
        (sum, acc) => sum + (acc.total_selling_price || 0),
        0
      );
    });

    return total;
  };

  const totalFeeRecive = (canvassingData.value?.reference_transaction || [])
    .filter(
      (ref) =>
        ref.adjustments_transaction?.name.toLowerCase() == "fee" &&
        ref.party_type == PartyType.CONTACT
    )
    .reduce((acc, sum) => acc + (sum.amount ?? 0), 0);

  const subtotalSelling = subtotalSellingPrice();
  const subtotalBuy = subtotalBuyTotalPrice.value;
  const grossProfit = subtotalSelling - subtotalBuy;
  const ongkir = adjustmentTransactionOngkirTotal.value?.amount || 0;
  const totalFee = totalFeeRecive || 0;
  const grandTotal = grossProfit - ongkir - totalFee;
  const netProfitPercent = subtotalBuy > 0 ? grandTotal / subtotalBuy : 0;

  currentRow += 2;

  const addSummary = (label: string, value: number, bold = false) => {
    ws.mergeCells(`A${currentRow}:L${currentRow}`);
    ws.getCell(`A${currentRow}`).value = label;
    ws.getCell(`M${currentRow}`).value = value;

    ws.getCell(`A${currentRow}`).font = { bold };
    ws.getCell(`M${currentRow}`).font = { bold };

    ws.getCell(`M${currentRow}`).numFmt = "#,##0";
    ws.getCell(`M${currentRow}`).alignment = {
      horizontal: "right",
    };

    currentRow++;
  };

  addSummary("Subtotal / Gross Profit", grossProfit, true);
  addSummary("Ongkos Kirim", ongkir);
  addSummary("Total Fee", totalFee);
  addSummary("Grand Total / Net Profit", grandTotal, true);

  ws.mergeCells(`A${currentRow}:L${currentRow}`);
  ws.getCell(`A${currentRow}`).value = "% Net Profit";
  ws.getCell(`M${currentRow}`).value = netProfitPercent;
  ws.getCell(`M${currentRow}`).numFmt = "0.00%";
  ws.getCell(`A${currentRow}`).font = { bold: true };
  ws.getCell(`M${currentRow}`).font = { bold: true };

  // =========================
  // NOTES
  // =========================
  currentRow += 3;
  ws.getCell(`A${currentRow}`).value = "Notes:";
  ws.getCell(`A${currentRow}`).font = { bold: true };
  currentRow++;

  ws.getCell(`A${currentRow}`).value = `• Dikirim ke ${
    generateResultSearchAddress(canvassingData.value?.address || null).name
  }`;

  // =========================
  // TANDA TANGAN
  // =========================
  currentRow += 5;

  ws.mergeCells(`B${currentRow}:D${currentRow}`);
  ws.mergeCells(`F${currentRow}:H${currentRow}`);
  ws.mergeCells(`J${currentRow}:M${currentRow}`);

  ws.getCell(`B${currentRow}`).value = "Operation";
  ws.getCell(`F${currentRow}`).value = "Finance";
  ws.getCell(`J${currentRow}`).value = "Direktur";

  ["B", "F", "J"].forEach((col) => {
    ws.getCell(`${col}${currentRow}`).alignment = {
      horizontal: "center",
    };
    ws.getCell(`${col}${currentRow}`).font = {
      bold: true,
    };
  });

  // =========================
  // WORKSHEET TAMBAHAN
  // =========================

  // Pembayaran Customer
  const paymentSheet = workbook.addWorksheet("Pembayaran Customer");
  paymentSheet.addRow(["Tahap", "Persentase", "Keterangan"]);

  (canvassingData.value?.payment_terms || []).forEach((payment) => {
    paymentSheet.addRow([
      payment.name,
      `${payment.value}%`,
      payment.term_of_payment,
    ]);
  });

  // Penerima Fee
  const feeSheet = workbook.addWorksheet("Penerima Fee");
  feeSheet.addRow(["Nama", "Telepon", "Email", "Fee"]);

  (contactsFee.value || []).forEach((item) => {
    feeSheet.addRow([
      (item.party as Contact).name || "-",
      (item.party as Contact).phone || "-",
      (item.party as Contact).email || "-",
      item.amount || 0,
    ]);
  });

  // =========================
  // EXPORT FILE
  // =========================
  const buffer = await workbook.xlsx.writeBuffer();

  // saveAs(
  //   new Blob([buffer]),
  //   `SCM-MEMO-${
  //     canvassingData.value?.unique_code || "export"
  //   }.xlsx`
  // );
};

const backToRab = async () => {
  ElMessageBox.confirm("Yakin Ingin Membatalkan RAB?", "Warning", {
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
    type: "warning",
  })
    .then(async () => {
      loading.value = true;

      try {
        // Membuat FormData
        const formData = new FormData();

        // Menambahkan data utama
        formData.append("unique_id", canvassingData.value?.unique_id || "");
        formData.append("status", CanvassingStatus.RAB || "");

        const response = await useFetchApi<BaseResponse<Canvassing>>(
          "/canvassing-create",
          "create-canvasing",
          "post",
          formData
        );
        if (response.status.value === "success") {
          ElMessage.success(`Berhasil Membatalkan RAB!`);
          item_canvassing.value = [];
          contactsFee.value = [];
          editState.value = false;
          dialogCancelApproval.value = false;
          fetchCanvassing();
        }
      } catch (error: any) {
        ElMessage.error(error.response?.message ?? error);
      } finally {
        loading.value = false;
      }
    })
    .catch(() => {
      // Cancel
    });
};

const printSCMMemo = async () => {
  const { blob } = await generateSCMMemo();

  pdfBlob.value = blob;
  pdfUrl.value = URL.createObjectURL(blob);

  previewSCMMemoDialog.value = true;
};

const downloadSCMMemo = () => {
  if (!pdfBlob.value) {
    ElMessage.warning("Tidak ada PDF untuk di-download");
    return;
  }

  const filename = `SCM-MEMO-${
    canvassingData.value?.unique_code || "document"
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

const submitForApproval = async () => {
  await updateStatus(CanvassingStatus.PENDING_APPROVAL);
};
const approve = async () => {
  visibleApproveDialog.value = true;
};

const decline = async () => {
  visibleDeclineDialog.value = true;
};

const submitApprove = async () => {
  canvassingData.value?.canvassing_item.forEach((element) => {
    element.canvassing_vendor.forEach((element) => {
      if (element.status === CanvassingVendorStatus.SELECTED) {
        element.status = CanvassingVendorStatus.SELECTED;
      } else if ((element.status = CanvassingVendorStatus.SUBMITTED)) {
        element.status = CanvassingVendorStatus.SUBMITTED;
      } else {
        element.status = CanvassingVendorStatus.REJECTED;
      }
    });
  });

  await updateStatus(CanvassingStatus.DONE);

  visibleApproveDialog.value = false;
};
const submitDecline = async () => {
  canvassingData.value?.canvassing_item.forEach((element) => {
    element.canvassing_vendor.forEach((element) => {
      element.status = CanvassingVendorStatus.REJECTED;
    });
  });

  await updateStatus(CanvassingStatus.CANCEL);

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
const showTransactionAdjustmentValue = (
  ref: ReferenceTransactionAdjustment
) => {
  if (ref.include) {
    return 0;
  } else {
    return ref.type == "amount"
      ? ref.amount
      : displayAmount(ref, grandTotal.value || 0);
  }
};
const subtotalBuyPrice = computed(() => {
  let subtotalBeli = 0;
  (canvassingData.value?.canvassing_item || []).forEach((element) => {
    const totalBuyPrice = element.canvassing_vendor.reduce((sum, item) => {
      return sum + item.unit_price;

      return sum;
    }, 0);
    subtotalBeli += Number(totalBuyPrice);
  });

  return subtotalBeli;
});
const subtotalBuyTotalPrice = computed(() => {
  let subtotalBeli = 0;
  (canvassingData.value?.canvassing_item || []).forEach((element) => {
    const totalBuyPrice = element.canvassing_vendor.reduce((sum, item) => {
      return sum + item.unit_price * item.quantity;

      return sum;
    }, 0);
    subtotalBeli += Number(totalBuyPrice);
  });

  return subtotalBeli;
});

const handleCommand = (command: string) => {
  if (command == "edit") {
    window.location.href = `/sales/quotation/add?id=${canvassingData?.value?.unique_id}`;
  } else if (command == "delete") {
    confirmDelete();
  } else if (command == "submit_approval") {
    submitForApproval();
  } else if (command == "approve") {
    approve();
  } else if (command == "decline") {
    decline();
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
const confirmCheck = (
  title: string,
  text: string,
  value: "progress" | "completed" | "pending"
) => {
  ElMessageBox.confirm(text, {
    confirmButtonText: "Ok",
    cancelButtonText: "Batal",
    type: "info",
    title: title,
  })
    .then(async () => {
      await statusCheck(value);
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
      window.location.href = "/sales/quotation";
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

const submitRAB = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  paymentTermError.value = false;

  if (
    !canvassingData.value?.payment_terms ||
    canvassingData.value?.payment_terms.length === 0
  ) {
    paymentTermError.value = true;

    ElMessage.warning("Informasi pembayaran wajib diisi");
    return;
  }

  await formEl.validate(async (valid) => {
    if (valid) {
      dialogSelectedItem.value = true;
    }
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

:deep(.el-table .warning-row) {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}
:deep(.el-table .success-row) {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}
:deep(.el-table .primary-row) {
  --el-table-tr-bg-color: var(--el-color-primary-light-9);
}
</style>

<style scoped>
.floating-save-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 16px 24px;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.1);
  border-top: 1px solid #e4e7ed;
  z-index: 1000;
  display: flex;
  justify-content: center;
}

.floating-save-actions {
  display: flex;
  gap: 12px;
  max-width: 1200px;
  width: 100%;
  justify-content: flex-end;
}

/* Animation for smooth appearance */
.el-fade-in-enter-active,
.el-fade-in-leave-active {
  transition: all 0.3s ease;
}

.el-fade-in-enter-from,
.el-fade-in-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

:deep(.dropdown-delete) {
  color: red;
}
</style>
