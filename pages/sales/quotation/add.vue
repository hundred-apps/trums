<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3"> RAB </span>
      </template>
    </el-page-header>

    <el-card class="my-3">
      <template #header>
        <div class="card-header">
          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              @click="submitForm(ruleFormRef)"
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
        <el-form-item label="Nomor Referensi" prop="source_document">
          <div class="flex gap-2">
            <el-input
              v-model="ruleForm.source_document"
              :readonly="true"
              placeholder="Masukkan nomor referensi"
            />
            <el-button
              :icon="Plus"
              type="primary"
              size="default"
              @click="visibleModalRequest = true"
            />
          </div>
        </el-form-item>

        <el-form-item prop="expired_price_view" label="Masa Berlaku Harga">
          <el-date-picker
            v-model="ruleForm.expired_price_view"
            type="date"
            aria-label="Tanggal Berakhir"
            placeholder="Tanggal Berakhir"
            style="width: 100%"
          />
        </el-form-item>
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

        <el-form-item v-if="address" label="Dikirim ke">
          <div>
            <div>{{ address.address_name }}</div>
            <div>
              {{ address.street }},
              {{ generateResultSearchAddress(address).name }}
            </div>
          </div>
        </el-form-item>

        <el-form-item label="Deskripsi" prop="description">
          <el-input
            v-model="ruleForm.description"
            type="textarea"
            placeholder="Masukkan deskripsi"
          />
        </el-form-item>

        <el-form-item label="Status" prop="status">
          <el-select v-model="ruleForm.status" style="width: 100%">
            <el-option
              v-for="status in canvassingStatusOptions"
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

    <!-- Detail Permintaan -->
    <div v-if="ruleForm.inquiry">
      <el-card class="my-3">
        <template #header>Detail Permintaan</template>
        <div class="flex gap-3 my-3">
          <div class="flex-1">
            <el-descriptions :column="1" size="large" border>
              <el-descriptions-item label="Prioritas Permintaan">
                {{ ruleForm.inquiry?.priority?.toUpperCase() }}
              </el-descriptions-item>
              <el-descriptions-item label="Tanggal Permintaan">
                {{ formatLocalDate(ruleForm.inquiry?.date!) }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
          <div class="flex-1">
            <el-descriptions :column="1" size="large" border>
              <el-descriptions-item label="Lokasi">
                {{ ruleForm.inquiry.location?.name ?? "Tidak Ada" }}
              </el-descriptions-item>
              <el-descriptions-item label="Diminta Oleh">
                {{ ruleForm.inquiry?.request_to?.name ?? "-" }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
        <el-descriptions title="Note">
          <el-descriptions-item label="">{{
            ruleForm.inquiry?.description
          }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>

    <el-card class="mb-4" header="Penerima Fee">
      <div class="flex justify-between items-center">
        <el-button type="primary" @click="addContact" class="mb-3">
          + Tambah Kontak
        </el-button>
        <el-radio-group
          v-model="feeState"
          @change="(val) => onChangeFeeState(val as string)"
        >
          <el-radio value="minus" size="large">Akumulasi</el-radio>
          <el-radio value="plus" size="large">Per Item</el-radio>
        </el-radio-group>
      </div>

      <el-table :data="contactsFee" border style="width: 100%">
        <el-table-column label="Nama">
          <template #default="{ row, $index }">
            <el-autocomplete
              v-model="row.party.name"
              :fetch-suggestions="querySearchContact"
              placeholder="Cari nama..."
              @select="(item) => onHandleSelectContact(item, $index)"
              style="width: 100%"
            />
          </template>
        </el-table-column>

        <el-table-column label="Email">
          <template #default="{ row }">
            <el-input v-model="row.party.email" placeholder="Email" />
          </template>
        </el-table-column>

        <el-table-column label="No. Telepon">
          <template #default="{ row }">
            <el-input v-model="row.party.phone" placeholder="No. Telepon" />
          </template>
        </el-table-column>

        <el-table-column :label="`Fee`">
          <template #header>
            <div class="flex items-center gap-2">
              <span>Fee</span>
              <el-select
                v-model="unitFee"
                size="small"
                style="width: 80px"
                :disabled="feeState === 'plus'"
                @change="changeFeeUnit"
              >
                <el-option label="%" value="percent" />
                <el-option label="Rp" value="amount" />
              </el-select>
            </div>
          </template>
          <template #default="{ row }">
            <el-input
              v-model="row.tmp_amount_input"
              placeholder="Atur fee..."
              :disabled="feeState === 'plus'"
              @input="
                (value) => {
                  if (unitFee == FeeType.PERCENT) {
                    row.amount = (Number(value) * grandTotal) / 100;
                    row.amount_nominal = (Number(value) * grandTotal) / 100;
                    row.value = value;
                  } else {
                    row.amount_nominal = value;
                    row.amount = Number(value);
                    row.value = (Number(value) / grandTotal) * 100;
                  }
                }
              "
            >
              <template #append>
                {{ unitFee == FeeType.PERCENT ? "%" : "Rp" }}
              </template>
            </el-input>
          </template>
        </el-table-column>

        <el-table-column label="Aksi" width="100">
          <template #default="{ $index }">
            <el-button type="danger" link @click="removeContact($index)">
              Hapus
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Items Section -->
    <el-card class="mb-3">
      <template #header>
        <div class="card-header">
          <span>Items</span>
          <el-button
            type="primary"
            :icon="Search"
            @click="() => (dialogItemRequest = true)"
            >Cari Item Permintaan</el-button
          >
        </div>
      </template>

      <div class="bulk-actions mb-4 p-4 el-card el-card__body">
        <div class="flex flex-wrap gap-4 items-end">
          <!-- Bulk Profit -->
          <div class="bulk-input-group">
            <label class="block el-text font-bold">Profit</label>
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

          <!-- Bulk Ongkir -->
          <div class="bulk-input-group">
            <label class="block el-text font-bold">Ongkir</label>
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
          :tree-props="{ children: 'children' }"
          :expand-row-keys="getExpandRowKeys ?? []"
          border
        >
          <el-table-column
            label="Actions"
            width="190"
            align="center"
            fixed="left"
          >
            <template #default="scope">
              <div class="flex items-center justify-between">
                <el-button
                  type="danger"
                  :icon="Delete"
                  circle
                  @click="removeItem(scope.row)"
                />
                <el-button
                  type="primary"
                  :icon="Plus"
                  v-if="scope.row.type === 'parent'"
                  circle
                  @click="addItemVendor(scope.row)"
                />
                <el-button
                  type="default"
                  :icon="Plus"
                  v-if="
                    scope.row.type === 'parent' &&
                    scope.row.type_item == 'request'
                  "
                  @click="addEquivalent(scope.row)"
                  >EQ</el-button
                >
                <el-checkbox
                  v-if="scope.row.type === 'child'"
                  :model-value="
                    selectedRowsVendors.some(
                      (item) => item.index === scope.row.index
                    )
                  "
                  @change="(val) => handleCheck(val, scope.row)"
                />
              </div>
            </template>
          </el-table-column>

          <el-table-column
            prop="item_name"
            label="Item"
            width="400"
            fixed="left"
          >
            <template #default="{ row }">
              <div class="flex items-center">
                <el-icon
                  v-if="row.children && row.children.length"
                  class="cursor-pointer mr-2"
                  @click="toggleExpand(row)"
                >
                  <component :is="row._expanded ? ArrowDown : ArrowRight" />
                </el-icon>
                <div v-if="row.type == 'parent'">
                  {{ row.catalogue_name }}
                </div>
                <div style="width: 100%" v-else>
                  <el-autocomplete
                    v-if="row.type == 'child'"
                    :disabled="loading"
                    :fetch-suggestions="querySearchCatalogue"
                    v-model="row.catalogue_name"
                    placeholder="Cari item"
                    @select="(item: Record<string, any>) => onHandleSelectItemAutocompleteItem(item, row.index, row)"
                  >
                    <template #default="{ item }">
                      <div
                        v-if="item.isNew"
                        class="flex items-center text-blue-500"
                      >
                        <el-icon><Plus /></el-icon>
                        <span class="ml-2">Tambahkan "{{ item.value }}"</span>
                      </div>
                      <div v-else>
                        <div class="flex justify-between items-center">
                          <p style="line-height: 15px" class="font-bold">
                            {{ item.catalogue?.name }}
                          </p>
                          <p class="font-bold">Harga: {{ item.price }}</p>
                        </div>
                        <p>
                          PN/SN: {{ item.catalogue?.sn ?? "Tidak Ada" }} |
                          Vendor:
                          {{ item.pricetag?.owner?.name ?? "Tidak Ada" }}
                        </p>
                      </div>
                    </template>
                    <template #prepend>
                      <el-button
                        @click="() => showPricetag(row)"
                        :icon="Search"
                      />
                    </template>
                  </el-autocomplete>
                  <el-autocomplete
                    v-else-if="
                      row.type == 'parent' && row.type_item == 'equivalent'
                    "
                    :disabled="loading"
                    :fetch-suggestions="querySearchCatalogueEquivalent"
                    v-model="row.catalogue_name"
                    placeholder="Cari item"
                    @select="(item: Record<string, any>) => onHandleSelectItemAutocompleteItemEquivalent(item, row.index, row)"
                  >
                    <template #default="{ item }">
                      <div
                        v-if="item.isNew"
                        class="flex items-center text-blue-500"
                      >
                        <el-icon><Plus /></el-icon>
                        <span class="ml-2">Tambahkan "{{ item.value }}"</span>
                      </div>
                      <div v-else>
                        <p style="line-height: 15px" class="font-bold">
                          {{ item.value }}
                        </p>
                        <p v-if="item.type === 'inventory'">
                          PN/SN: {{ item.sn_number ?? "Tidak Ada" }} | Lokasi:
                          {{ item.location_name ?? "Tidak Ada" }} | Available
                          Stok: {{ item.available }}
                        </p>
                        <p v-if="item.type === 'catalogue'">
                          PN/SN: {{ item.sn_number ?? "Tidak Ada" }}
                        </p>
                      </div>
                    </template>
                    <template #prepend>
                      <el-button
                        @click="() => showPricetag(row)"
                        :icon="Search"
                      />
                    </template>
                  </el-autocomplete>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="Type" width="280">
            <template #default="{ row }">
              <el-select
                v-model="row.type_item"
                :disabled="row.type == 'parent'"
                placeholder="Select"
                style="width: 240px"
              >
                <el-option :label="`Subtitution`" :value="'quotation'" />
                <el-option :label="`Equivalent`" :value="'equivalent'" />
                <el-option :label="`AS Requested`" :value="'original'" />
              </el-select>
            </template>
          </el-table-column>

          <el-table-column prop="sn" label="SN/PN" width="150">
            <template #default="{ row }">
              {{ row.sn }}
            </template>
          </el-table-column>
          <el-table-column prop="qty" label="QTY" width="200">
            <template #default="{ row }">
              <div v-if="row.type == 'parent' && row.type_item == 'request'">
                {{ row.quantity }}
              </div>
              <el-input-number
                v-else
                v-model="row.quantity"
                :min="1"
                @change="calculateSellingPrice(row)"
                @input="calculateSellingPrice(row)"
              />
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
          <el-table-column
            prop=""
            label="Ketersediaan Barang"
            width="200"
            align="center"
          >
            <template #default="{ row }">
              {{ (row.pricetag_item_data?.status_item ?? "").toUpperCase() }}
            </template>
          </el-table-column>
          <el-table-column
            prop=""
            label="Pengiriman"
            width="200"
            align="center"
          >
            <template #default="{ row }">
              {{ (row.pricetag_item_data?.delivery ?? "").toUpperCase() }}
            </template>
          </el-table-column>
          <el-table-column
            prop="expected_delivery"
            label="Estimasi Pengiriman"
            width="200"
          >
            <template #default="{ row }">
              <el-input
                v-if="row.type != 'parent'"
                v-model="row.expected_delivery"
                placeholder="Detail Estimasi Pengiriman"
              />
            </template>
          </el-table-column>

          <el-table-column label="Harga Beli" width="400" align="center">
            <el-table-column label="Harga Beli" width="200">
              <template #default="{ row }">
                <span v-if="row.type == 'child'">{{
                  currency(row.unit_price)
                }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Total Harga" width="200">
              <template #default="{ row }">
                {{ currency(row.total_price) }}
              </template>
            </el-table-column>
          </el-table-column>

          <el-table-column label="Profit" width="200">
            <template #default="{ row }">
              <div v-if="row.type === 'child'">
                <el-input
                  v-model="row.profit"
                  placeholder="Masukan Profit"
                  @blur="
                    (val) => {
                      console.log('input', val);
                      if (row.profit_unit == 'percent') {
                        row.profit_percent = val;
                      } else {
                        row.profit_nominal = val;
                      }
                      calculatePricing(row, 'profit');
                    }
                  "
                >
                  <template #append>
                    <el-select
                      v-model="row.profit_unit"
                      style="width: 70px"
                      @change="(val) => handleProfitUnitChange(row, val)"
                    >
                      <el-option label="%" value="percent" />
                      <el-option label="Rp" value="amount" />
                    </el-select>
                  </template>
                </el-input>
                <div class="text-green-500 italic">
                  {{
                    row.profit_unit == "percent"
                      ? currency(row.profit_nominal)
                      : (row.profit_percent || 0) + " %"
                  }}
                </div>
              </div>
              <!-- <el-input v-else v-model="row.profit" placeholder="Masukan Profit" @input="handleParentChange(row)">
              <template #append>
                <el-select v-model="row.profit_unit" style="width: 70px" @change="handleProfitUnitChangeParent(row)">
                  <el-option label="%" value="percent" />
                  <el-option label="Rp" value="amount" />
                </el-select>
              </template>
            </el-input> -->
            </template>
          </el-table-column>
          <el-table-column label="Fee" width="200">
            <template #default="{ row }">
              <div v-if="row.type === 'child'">
                <el-input
                  v-model="row.fee"
                  placeholder="Atur fee..."
                  :disabled="feeState == 'minus'"
                  @click="openFeeDrawer(row)"
                >
                  <template #prepend>
                    <el-button
                      :icon="Operation"
                      :disabled="feeState == 'minus'"
                      @click="openFeeDrawer(row)"
                    ></el-button>
                  </template>
                  <template #append>
                    <el-select
                      v-model="row.fee_unit"
                      style="width: 70px"
                      @change="
                        (val) => {
                          changeFeeUnitContacts(row, val);
                          // calculatePricing(row, 'selling_price');
                        }
                      "
                    >
                      <el-option label="%" value="percent" />
                      <el-option label="Rp" value="amount" />
                    </el-select>
                  </template>
                </el-input>
                <div class="text-green-500 italic">
                  {{
                    row.fee_unit == "percent"
                      ? currency(row.fee_nominal || 0)
                      : (row.fee_percent || 0) + " %"
                  }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Ongkir" width="200">
            <template #default="{ row }">
              <div v-if="row.type === 'child'">
                <el-input
                  v-model="row.ongkir"
                  placeholder="Masukan ongkir"
                  @change="onChangeChild(row)"
                >
                  <template #append>
                    {{ "Rp" }}
                  </template>
                </el-input>
                <div></div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="Harga Jual" width="400" align="center">
            <el-table-column label="Harga Jual" width="200">
              <template #default="{ row }">
                <div
                  v-if="(row as CanvassingItemForm).type_item === 'request' || (row as CanvassingItemForm).type_item === 'equivalent' || (row as CanvassingItemForm).type_item === 'quotation'"
                >
                  <el-input-number
                    v-model="row.selling_price"
                    :min="0"
                    @change="
                      (value) => {
                        // (row as CanvassingItemForm).children?.forEach((child: CanvassingItemForm) => {
                        //   if (child.type_item == 'original') {
                        //     child.selling_price = value || 0;

                        //     child.total_selling_price =
                        //       (child.quantity || 0) * (child.selling_price || 0);

                        //     calculatePricing(child, 'selling_price');
                        //   }
                        // });
                        calculatePricing(row, 'selling_price');
                      }
                    "
                  />
                </div>
                <div v-else class="flex">
                  {{ currencyWithoutSymbol(row.selling_price) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="Total Harga" width="200">
              <template #default="{ row }">
                {{ currency(row.total_selling_price) }}
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column label="Margin" width="150">
            <template #default="{ row }">
              {{ currency(calculateMarginNominal(row)) }}
            </template>
          </el-table-column>
          <el-table-column label="Margin (%)" width="150">
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

    <!-- Biaya Lainnya -->
    <el-card class="mb-3">
      <template #header>
        <div class="card-header"><span>Biaya Lainya</span></div>
      </template>
      <div>
        <div
          class="flex justify-between items-center mb-2"
          v-for="(ref, index) in [
            adjustmentTransactionOngkirTotal,
            ...references,
          ]"
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
              :disabled="ref.disabled || false"
              placeholder="Masukan Nilai"
              @input="
                (value) => {
                  onInputAdjustment(ref);
                  ref.amount = Number(value);
                  console.log('ref', ref);
                }
              "
            >
              <template #append>
                <el-select
                  v-model="ref.type"
                  :disabled="ref.changeType == false || ref.disabled"
                  style="width: 100px"
                >
                  <el-option label="%" value="percent" />
                  <el-option label="Rp" value="amount" />
                </el-select>
              </template>
            </el-input>
            <el-button
              type="danger"
              :icon="Delete"
              circle
              :disabled="index === 0 || ref.disabled"
              @click="removeAnotherCost(ref.adjustment_id)"
            />
          </span>
        </div>
      </div>

      <el-button
        class="mt-4"
        style="width: 100%"
        @click="visibleModalAdjustmentTransaction = true"
      >
        Tambah Item
      </el-button>
    </el-card>

    <el-card
      class="mb-4"
      header="Informasi Pembayaran"
      :class="{ 'error-card': paymentTermError }"
    >
      <el-table :data="payment_terms" border style="width: 100%">
        <el-table-column label="Nama">
          <template #default="scope">
            <el-input v-model="scope.row.name" placeholder="TOP 1" />
          </template>
        </el-table-column>

        <el-table-column label="Jumlah">
          <template #default="scope">
            <el-input
              v-model="scope.row.value"
              style="max-width: 300px"
              placeholder="Jumlah"
            >
              <template #append>
                <el-select v-model="scope.row.unit" style="width: 100px">
                  <el-option label="%" value="percentage" />
                  <el-option label="Rp" value="nominal" />
                </el-select>
              </template>
            </el-input>
          </template>
        </el-table-column>

        <el-table-column label="TOP">
          <template #default="scope">
            <el-select
              v-model="scope.row.term_of_payment"
              placeholder="Select"
              style="width: 240px"
            >
              <el-option
                v-for="item in [
                  { value: PaymentTerm.COD, label: 'COD' },
                  { value: PaymentTerm.CBD, label: 'CBD' },
                  { value: PaymentTerm.TEMPO, label: 'TEMPO' },
                ]"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column :label="`Durasi Tempo`">
          <template #default="scope">
            <el-input
              :step="1"
              :min="0"
              v-model="scope.row.duration"
              placeholder="Masukkan Durasi Tempo"
              :disabled="scope.row.term_of_payment !== PaymentTerm.TEMPO"
            />
          </template>
        </el-table-column>

        <el-table-column label="Aksi" width="60">
          <template #default="scope">
            <el-button
              type="danger"
              :icon="Delete"
              circle
              @click="() => removePaymentTerm(scope.row)"
            />
          </template>
        </el-table-column>
      </el-table>
      <el-button class="mt-4" style="width: 100%" @click="addNewPaymentTerm">
        Add New Item
      </el-button>
    </el-card>

    <!-- Summary -->
    <el-card class="mb-3" shadow="hover">
      <el-table :data="summeryView ?? []" style="width: 100%">
        <el-table-column label="" prop="label" width="300">
          <template #default="{ row }">
            <div class="font-bold">{{ row.label }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Profit" prop="max" align="right" />
        <el-table-column label="% Beli" prop="beli" width="200" align="right" />
        <el-table-column label="% Jual" prop="jual" width="200" align="right" />
        <!-- <el-table-column
          label="Profit"
          prop="min"
          width="200"
          align="right"
        />
        <el-table-column label="% Beli" prop="beliMin" />
        <el-table-column label="% Jual" prop="jualMin" /> -->
      </el-table>
    </el-card>

    <!-- Modals -->
    <ModalAdjustmentTransaction
      v-model:visible="visibleModalAdjustmentTransaction"
      @select-adjustment="handleSelectAdjustment"
      @create-new="visibleModalNewAdjustment = true"
      :data="adjustmentTransactions.data?.value?.data ?? []"
      :search-params="querySearchAdjustmentTransaction"
      @on-search="onSearchAdjsutment"
    />

    <el-dialog
      v-model="visibleModalRequest"
      title="Cari Permintaan"
      width="1000"
    >
      <el-tabs type="border-card">
        <el-tab-pane label="RFQ">
          <TableSelectionRFQ
            :data="inquiry.data.value?.data ?? []"
            :search-params="request_search_inquiry"
            :total-data="inquiry.data.value?.total_data ?? 0"
            @select-request="addToForm"
          />
        </el-tab-pane>
        <el-tab-pane label="Canvassing"
          ><TableSelectionCanvassing
            :fetch-key="'fetch-canvassing'"
            :request_search="request_search_canvassing"
            :refresh-trigger="refreshTriggerCanvassing"
            @select-canvassing="
              (val) => {
                setDataEdit(val);
                visibleModalRequest = false;
              }
            "
            :type="'CANASSING'"
        /></el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- <ModalRequest
      v-model:visible="visibleModalRequest"
      :search-params="request_search_inquiry"
      :data="inquiry?.data ?? []"
      :total-data="inquiry?.total_data ?? 0"
      @select-request="addToForm"
      @pagination-change="paginationClick"
    /> -->

    <ModalSearchItemExample
      v-model:visible="visibleModalSearchItemExample"
      :search-params="request_search_pricetag_item"
      :data="priceTagItem.data.value?.data ?? []"
      :total-data="priceTagItem.data.value?.total_data ?? 0"
      :selected-items="itemChecked"
      @select-items="addToOfferVendor"
      @on-search="onSearch"
      @create-new="visibleModalPricetagNewItem = true"
      @pagination-change="paginationClickPriceTag"
      :current-item-name="
        item_canvassing.find((value) => value.index == itemIndex)
          ?.catalogue_name ?? ''
      "
    />

    <ModalContact
      v-model:visible="visibleModalContact"
      :search-params="request_search_contact"
      :data="contacts?.data ?? []"
      :total-data="contacts?.total_data ?? 0"
      @select-contacts="addVendor"
      @pagination-change="paginationClickContact"
    />

    <el-dialog
      v-model="visibleModalPricetagNewItem"
      title="Buat Penawaran Baru"
      width="1000"
    >
      <AddPriceTagComponent @submit="handlePriceTagSubmit" />
    </el-dialog>

    <el-dialog
      v-model="visibleModalNewAdjustment"
      title="Buat Biaya Lain"
      width="1000"
    >
      <AddAdjustment @submit="handleAdjustmentSubmit" />
    </el-dialog>

    <FeeDrawer
      v-model="drawerFeeVisible"
      :item="selectedItem"
      :contacts="contactsFeeToEdit"
      :adjustment="adjustmentContact!"
      @save="handleSaveFee"
    />
    <el-dialog
      v-model="dialogNewAddress"
      title="Create New Address"
      width="500"
    >
      <FormAddress
        :onSetInitital="{ contact_id: '', contact_name: '' }"
        :onSuccess="onAddNewAddress"
        :use-tmp="false"
      />
    </el-dialog>
    <TrumsModalItemRequest
      v-model:visible="dialogItemRequest"
      @selected-submit="addItemRequestToCanvassing"
    />

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
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import {
  Delete,
  Plus,
  ArrowDown,
  ArrowRight,
  Operation,
  Search,
} from "@element-plus/icons-vue";
import {
  ElButton,
  ElIcon,
  ElInput,
  ElSelect,
  ElOption,
  type FormInstance,
  type FormRules,
  type UploadUserFile,
  valueEquals,
  ElTable,
  DEFAULT_VALUE_ON_CLEAR,
  dayjs,
} from "element-plus";
import {
  CanvassingStatus,
  CanvassingVendorStatus,
  PaymentTerm,
  PaymentTermUnit,
} from "~/types/scm/canvasing";
import type {
  CanvassingForm,
  QuotationItemInterface,
  QuatotationVendorEquivalent,
  QuotationVendor,
  CanvassingItemForm,
  Canvassing,
} from "~/types/scm/canvasing";
import type { Contact } from "~/types/contact";
import { TypeInquiry, type Inquiry } from "~/types/inquiry";
import {
  FeeType,
  PartyType,
  ReferenceAdjustment,
  type AdjustmentTransaction,
  type ReferenceTransactionAdjustment,
} from "~/types/attribute_adjustment";
import type { Pricetag, Pricetag_item } from "~/types/pricetag";
import type { ResponsePagination } from "~/types/response_pagination";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import { currencyWithoutSymbol } from "#imports";

// Components
import AddPriceTagComponent from "~/components/trums/AddPriceTagComponent.vue";
import AddAdjustment from "~/components/trums/AddAdjustment.vue";
import TrumsUploadFile from "~/components/trums/form/TrumsUploadFile.vue";
import ModalAdjustmentTransaction from "~/components/trums/ModalAdjustmentTransaction.vue";
import ModalRequest from "~/components/trums/ModalRequest.vue";
import ModalSearchItemExample from "~/components/trums/ModalSearchItemExample.vue";
import ModalContact from "~/components/trums/ModalContact.vue";
import type { BaseResponse } from "~/types/response";
import FeeDrawer from "~/components/trums/FeeDrawer.vue";
import type { ItemSearch } from "~/types/item_search";
import type { Pagination } from "~/types/pagination";
import type { Catalogue } from "~/types/catalogue";
import type { Unit } from "~/types/unit";
import FormAddress from "~/components/trums/FormAddress.vue";
import type { AddressType } from "~/types/address";
import { formatLocalDate } from "#imports";
import { currency } from "#imports";
import {
  TermOfPaymentReference,
  type TermOfPayment,
} from "~/types/payment_term";

import TableSelectionRFQ from "~/components/trums/TableSelectionRFQ.vue";
import TableSelectionCanvassing from "~/components/trums/TableSelectionCanvassing.vue";
import { handleInput } from "#imports";
import type { ItemRequest } from "~/types/item_request";
import OfferDetail from "../offer/components/OfferDetail.vue";

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "canvassing-create",
  name: "Create RAB",
});

const { removeDuplicates } = useArray();
const router = useRouter();
const config = useRuntimeConfig();
const baseImageURL = config.public.baseImageURL;

const route = useRoute();
const id = computed(() => route.query.id as string);
const inquiry_id = computed(() => route.query.inquiry_id as string);

// Refs
const ruleFormRef = ref<FormInstance>();
const tableRef = ref();
const loading = ref(false);

// Modal States
const visibleModalSearchItemExample = ref(false);
const visibleModalRequest = ref(false);
const visibleModalAdjustmentTransaction = ref(false);
const visibleModalPricetagNewItem = ref(false);
const visibleModalNewAdjustment = ref(false);
const visibleModalContact = ref(false);
const drawerFeeVisible = ref(false);
const dialogNewAddress = ref(false);
const dialogItemRequest = ref(false);

// Index References
const itemStartIndex = ref<string>("");
const itemChecked = ref<any[]>([]);
const itemIndex = ref<string>("");
const selectedItem = ref<{
  index: string;
  name: string;
  vendor_name: string;
  unit_fee: FeeType;
}>({
  index: "",
  name: "",
  vendor_name: "",
  unit_fee: FeeType.AMOUNT,
});

// Data
const fileList = ref<UploadUserFile[]>([]);
const references = ref<ReferenceTransactionAdjustment[]>([]);
const quotationItems = ref<QuotationItemInterface[]>([]);
const contacts = ref<ResponsePagination<Contact[]>>({
  current_page: 0,
  data: [],
  success: true,
  total_data: 0,
  total_page: 1,
});
const pricetags = ref<Pricetag[]>([]);

const payment_terms = ref<TermOfPayment[]>([]);

const summeryView = ref<
  {
    label: string;
    max: string;
    beli: string;
    jual: string;
    min: string;
    beliMin: string;
    jualMin: string;
  }[]
>([]);

// Bulk input data
const bulkProfit = ref("");
const bulkProfitUnit = ref("percent");
const bulkFee = ref("");
const bulkFeeUnit = ref("percent");
const bulkOngkir = ref("");
const activeCollapseVendor = ref<string[]>([""]);

// Computed untuk check apakah ada input bulk
const hasBulkInput = computed(() => {
  return (
    bulkProfit.value !== "" || bulkFee.value !== "" || bulkOngkir.value !== ""
  );
});

const feeState = ref<string>("minus");
const ongkirState = ref<string>("minus");
const unitFee = ref<FeeType>(FeeType.PERCENT);

const item_canvassing = ref<CanvassingItemForm[]>([]);
const selectedRowsVendors = ref<CanvassingItemForm[]>([]);
const handleCheck = (checked: any, row: CanvassingItemForm) => {
  if (checked) {
    const exists = selectedRowsVendors.value.some(
      (item) => item.index === row.index
    );

    if (!exists) {
      selectedRowsVendors.value.push(row);
    }
  } else {
    selectedRowsVendors.value = selectedRowsVendors.value.filter(
      (item) => item.index !== row.index
    );
  }

  // console.log('row', row);
  if (row.type_item === "original") {
    item_canvassing.value[row.parent_index!].selling_price = row.selling_price;
    item_canvassing.value[row.parent_index!].total_selling_price =
      row.total_selling_price;
    // calculatePricing(item_canvassing.value[row.parent_index!], 's')

    // console.log("row", row);
    // const parent = item_canvassing.value.findIndex(
    //   (parent) => parent.catalogue_id == row.parent_catalogue_id
    // );
    // console.log("parent", parent);
  }

  calculateSummaryaData();
};

const autoSelectSingleChild = (parentRow: any) => {
  const children = parentRow.children || [];

  if (children.length === 1) {
    const child = children[0];

    const exists = selectedRowsVendors.value.some(
      (item) => item.index === child.index
    );

    if (!exists) {
      selectedRowsVendors.value.push(child);
    }
  }
};

watch(
  () => selectedRowsVendors.value,
  () => {
    (item_canvassing.value || []).forEach((element) => {
      let total_price = 0;

      if (element.children.length == 1) {
        total_price += element.children[0].total_price;
      } else {
        element.children.forEach((child) => {
          if (child.type_item == "original") {
            const find = selectedRowsVendors.value.find(
              (value) => value.index === child.index
            );
            if (find) {
              total_price += find.total_price;
            }
          }
        });
      }
      element.total_price = total_price;
    });
  },
  { deep: true }
);

// Search Parameters
const request_search_inquiry = ref<RequestSearch>({
  column: [
    {
      type: [TypeInquiry.SALES_INQUIRY],
    },
  ],
  keyword: "",
  limit: "10",
  offset: "1",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
  table: "inquiries",
  flag: "form",
});

const refreshTriggerCanvassing = ref<number>(0);
const request_search_canvassing = ref<RequestSearch>({
  column: [
    {
      status: [CanvassingStatus.PENDING_APPROVAL_RAB],
    },
  ],
  keyword: "",
  limit: "10",
  offset: "1",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
  table: "canvassing",
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

const query_search_pricetag_item = ref<RequestSearch>({
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

const priceTagItem = await useAsyncData("pricetag-search-items", async () => {
  const res = await useFetchApi<ResponsePagination<Pricetag_item[]>>(
    `/pricetag-item-read`,
    "pricetag-search-items",
    "post",
    request_search_pricetag_item.value
  );
  return res.data.value;
});

const inquiry = await useFetchApi<ResponsePagination<Inquiry[]>>(
  "/search",
  "search-request-inquiry",
  "post",
  request_search_inquiry.value
);
const canvassing = ref<ResponsePagination<Canvassing[]>>();

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

const offerDialogState = ref<boolean>(false);
const offerDetail = await useAsyncData("pricetag-detail", async () => {
  const res = await useFetchApi<ResponsePagination<Pricetag[]>>(
    `/search/`,
    "pricetag-detail",
    "post",
    request_search_vendor.value
  );
  return res.data.value;
});

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

const onSearchAdjsutment = (keyword: string) =>
  (querySearchAdjustmentTransaction.value.keyword = keyword);

const adjustmentContact = computed(() => {
  const data = adjustmentTransactions.data.value?.data || [];
  return data.find((value: AdjustmentTransaction) =>
    value.name?.toLowerCase().includes("fee")
  );
});

const adjustmentOngkir = computed(() => {
  const data = adjustmentTransactions.data.value?.data || [];

  return data.find((value: AdjustmentTransaction) =>
    value.name?.toLowerCase().includes("ongkos kirim")
  );
});

const pricetagList = computed(() => {
  const list = removeDuplicates<Pricetag>(pricetags.value, "unique_id");
  return list;
});

const adjustmentTransactionFeeTotal = ref<ReferenceTransactionAdjustment>({
  unique_id: "",
  reference: ReferenceAdjustment.CANVASSING,
  reference_id: "",
  adjustment_id: ``,
  adjustment: undefined,
  value: null,
  type: unitFee.value,
  amount: 0,
  created_at: 0,
});

const adjustmentTransactionOngkirTotal = ref<ReferenceTransactionAdjustment>({
  unique_id: "",
  reference: ReferenceAdjustment.CANVASSING,
  reference_id: "",
  adjustment_id: ``,
  adjustment: undefined,
  value: null,
  type: FeeType.AMOUNT,
  amount: 0,
  created_at: 0,
  changeType: false,
});

const updateAllFeeType = () => {
  contactsFee.value.map((value) => (value.type = unitFee.value));

  item_canvassing.value.forEach((element) => {
    element.fee_unit = unitFee.value as "percent" | "amount";
    element.children.map(
      (value) => (value.fee_unit = unitFee.value as "percent" | "amount")
    );
  });
};

const address = ref<AddressType>();
const contactsFee = ref<ReferenceTransactionAdjustment[]>([]);
const contactsFeeToEdit = ref<ReferenceTransactionAdjustment[]>([]);
// Form Data
const ruleForm = reactive<CanvassingForm>({
  unique_id: "",
  source_document: "",
  description: "",
  status: CanvassingStatus.RAB,
  canvassing_item: [],
  inquiry: null,
  payment_term: PaymentTerm.COD,
  tempo_value: 30,
  tempo_unit: PaymentTermUnit.DAY,
  address_id: "",
  address_version: 0,
  address_view: "",
  expired_price: 0,
  expired_price_view: "",
});

// Constants
const canvassingStatusOptions = [
  { value: CanvassingStatus.DRAFT, label: "Draft" },
  { value: CanvassingStatus.RAB, label: "RAB" },
  { value: CanvassingStatus.PENDING_APPROVAL, label: "Pending Approval" },
  { value: CanvassingStatus.DONE, label: "Done" },
  { value: CanvassingStatus.CANCEL, label: "Cancel" },
];

const netProfitForBuying = computed(() => {
  let fee = 0;
  let ongkir = 0;

  if (adjustmentTransactionFeeTotal.value.type == FeeType.AMOUNT) {
    fee = adjustmentTransactionFeeTotal.value.amount;
  } else if (adjustmentTransactionFeeTotal.value.type == FeeType.PERCENT) {
    fee = (grandTotal.value * adjustmentTransactionFeeTotal.value.amount) / 100;
  }
  if (adjustmentTransactionOngkirTotal.value.type == FeeType.AMOUNT) {
    ongkir = adjustmentTransactionOngkirTotal.value.amount;
  } else if (adjustmentTransactionOngkirTotal.value.type == FeeType.PERCENT) {
    ongkir =
      (grandTotal.value * adjustmentTransactionOngkirTotal.value.amount) / 100;
  }

  return (
    Number(totalForGrossProfitForBuying.value || 0) -
    Number(fee || 0) -
    Number(ongkir || 0)
  );
});
const netProfitForBuyingMin = computed(() => {
  let fee = 0;

  if (adjustmentTransactionFeeTotal.value.type == FeeType.AMOUNT) {
    fee = adjustmentTransactionFeeTotal.value.amount;
  } else if (adjustmentTransactionFeeTotal.value.type == FeeType.PERCENT) {
    fee = (grandTotal.value * adjustmentTransactionFeeTotal.value.amount) / 100;
  }
  return Number(totalForGrossProfitForBuyingMin.value || 0) - Number(fee || 0);
});
const grossProfitMin = computed(() => {
  return Number(grandTotal.value) - Number(totalBuyingPriceMin.value);
});
const grossProfit = computed(() => {
  return Number(grandTotal.value) - Number(totalBuyingPrice.value);
});

const totalForGrossProfitForBuying = computed(() => {
  let gross = Number(grossProfit.value);

  gross -= Number(adjustmentTransactionOngkirTotal.value.amount);

  references.value.forEach((element) => {
    if (element.type === FeeType.PERCENT) {
      gross -= (element.amount / totalBuyingPrice.value) * 100;
    } else {
      gross -= element.amount;
    }
  });

  return gross;
});
const totalForGrossProfitForBuyingMin = computed(() => {
  let gross = Number(grossProfitMin.value);

  gross -= Number(adjustmentTransactionOngkirTotal.value.amount);

  references.value.forEach((element) => {
    if (element.type === FeeType.PERCENT) {
      gross -= (element.amount / totalBuyingPriceMin.value) * 100;
    } else {
      gross -= element.amount;
    }
  });

  return gross;
});

const totalBuyingPrice = computed(() => {
  return selectedRowsVendors.value.reduce(
    (acc, row: CanvassingItemForm) => (acc += Number(row.total_price)),
    0
  );
});

const totalBuyingPriceMin = computed(() => {
  let total = 0;

  item_canvassing.value.forEach((element) => {
    console.log("total Min", total);
    if (element.children.length > 0) {
      let dataMin = element.children.reduce((max, data) =>
        data.unit_price > max.unit_price ? data : max
      );
      total += Number(dataMin.unit_price) * Number(element.quantity);
    }
  });

  return total;
});

const grandTotal = computed(() => {
  let total = selectedRowsVendors.value.reduce(
    (acc, sum) => acc + (sum.total_selling_price || 0),
    0
  );
  // (item_canvassing.value || []).forEach((element) => {
  //   if (element.children.length > 1) {
  //     total += element.total_selling_price || 0;
  //     total += element.children
  //       .filter(
  //         (cv) => cv.type_item === "equivalent" || cv.type_item == "quotation"
  //       )
  //       .reduce((acc, sum) => acc + (sum.total_selling_price || 0), 0);
  //   } else if (element.children.length === 1) {
  //     total += element.children[0].total_selling_price || 0;
  //   }
  // });

  return total;
});

const finalTotal = computed(() => {
  let total = Number(grandTotal.value || 0);

  references.value.forEach((ref) => {
    let adjustmentValue = 0;

    if (ref.type === "percent") {
      adjustmentValue = total * (ref.amount / 100);
    } else {
      adjustmentValue = ref.amount;
    }

    if (ref.adjustment?.operator === "minus") {
      total -= Number(adjustmentValue);
    } else if (ref.adjustment?.operator === "plus") {
      total += Number(adjustmentValue);
    }
  });

  let fee = 0;

  if (adjustmentTransactionFeeTotal.value.type === FeeType.PERCENT) {
    fee = total * (adjustmentTransactionFeeTotal.value.amount / 100);
  } else {
    fee = adjustmentTransactionFeeTotal.value.amount;
  }
  if (adjustmentTransactionFeeTotal.value.adjustment?.operator === "minus") {
    total -= Number(fee);
  } else if (
    adjustmentTransactionFeeTotal.value.adjustment?.operator === "plus"
  ) {
    total += Number(fee);
  }

  // total -= transaction

  return total;
});

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
    value.tmp_amount_input = "0";
    value.value = 0;
    value.amount_nominal = 0;
  });

  item_canvassing.value.forEach((value) => {
    value.children.forEach((child) => {
      if (child.contacts_fee.length == 0) {
        child.contacts_fee = contactsFee.value.map((contact) => ({
          ...contact,
          amount: 0,
          value: 0,
          unique_id: "",
        }));
      } else {
        child.contacts_fee.forEach((fee) => (fee.amount = 0));
      }
      calculateSellingPrice(child);
      child.fee = 0;
    });

    value.fee = 0;
  });

  references.value.forEach((ref) => {
    if (ref.adjustments_transaction?.name.toLowerCase() == "fee") {
      ref.value = 0;
      ref.amount = 0;
      ref.type = val == "plus" ? FeeType.AMOUNT : FeeType.PERCENT;
    }
  });

  unitFee.value = val == "plus" ? FeeType.AMOUNT : FeeType.PERCENT;
};

function findItemByIndex(
  items: CanvassingItemForm[],
  targetIndex: string
): CanvassingItemForm | null {
  for (const item of items) {
    if (item.index === targetIndex) {
      return item;
    }

    if (item.children && item.children.length > 0) {
      const found = findItemByIndex(item.children, targetIndex);
      if (found) return found;
    }
  }
  return null;
}

// Methods
const goBack = () => router.back();

const openFeeDrawer = (item: CanvassingItemForm) => {
  itemIndex.value = item.index;
  contactsFeeToEdit.value = item.contacts_fee;

  selectedItem.value = {
    index: item.index,
    vendor_name: item.vendor_name ?? "",
    name: item.catalogue_name,
    unit_fee: item.fee_unit as FeeType,
  };

  drawerFeeVisible.value = true;
};
const openDetailVendor = (unique_id: string) => {
  console.log("open detail vendor", unique_id);
  request_search_vendor.value.column = [
    {
      unique_id: [unique_id],
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

  item_canvassing.value.forEach((element) => {
    (element.children || []).forEach((child) => {
      child.fee_nominal = customMathCeil(child.fee_nominal ?? 0);
      child.profit_nominal = customMathCeil(child.profit_nominal ?? 0);
      child.ongkir_nominal = customMathCeil(child.ongkir_nominal ?? 0);
      calculatePricing(child, "selling_price");
    });
  });

  syncFeeAcumulation();

  const feeAccumulation = (references.value || []).filter(
    (filter) =>
      filter.adjustments_transaction?.name.toLowerCase() == "fee" &&
      filter.disabled
  );

  if (feeAccumulation.length > 0) {
    const feeAccumulationAmount = (contactsFee.value || []).reduce(
      (acc, data) => acc + (data.amount_nominal || 0),
      0
    );
    feeAccumulation[0].amount = feeAccumulationAmount;
    feeAccumulation[0].amount_nominal = feeAccumulationAmount;
    feeAccumulation[0].amount_nominal_display = handleInput(
      `${feeAccumulationAmount}`
    );
    feeAccumulation[0].tmp_amount_input = handleInput(
      `${feeAccumulationAmount}`
    );
  }
};

const syncFeeAcumulation = () => {
  if (feeState.value == "plus") {
    contactsFee.value.forEach((value) => {
      value.amount = 0;
      value.value = 0;
      value.amount_nominal = 0;
      value.amount_nominal_display = "0";
      value.tmp_amount_input = "0";
    });
    const newContactFee: ReferenceTransactionAdjustment[] = JSON.parse(
      JSON.stringify(contactsFee.value)
    );

    item_canvassing.value.forEach((item) => {
      item.children.forEach((child: CanvassingItemForm) => {
        child.contacts_fee.forEach(
          (contact: ReferenceTransactionAdjustment) => {
            const findContactFee = newContactFee.findIndex(
              (fee) => fee.party_id == contact.party_id
            );
            console.log("New Contact Fee", contact);
            const {
              fee_nominal,
              fee_percent,
              ongkir_nominal,
              ongkir_percent,
              profit_nominal,
              profit_percent,
            } = calculateProfitAndFee(
              child,
              contact.value || 0,
              "selling_price"
            );
            contact.value = contact.value;
            contact.amount_nominal = fee_nominal;
            contact.type = child.fee_unit as FeeType;
            contact.tmp_amount_input = `${formatCurrencyID(fee_nominal, 2)}`;
            if (findContactFee >= 0) {
              if (unitFee.value == FeeType.AMOUNT) {
                const tmpValue = newContactFee[findContactFee].value ?? 0;
                const currentValue = tmpValue + (fee_nominal || 0);

                newContactFee[findContactFee].value = currentValue;

                newContactFee[findContactFee].type = unitFee.value;
                newContactFee[findContactFee].amount = currentValue;
                newContactFee[findContactFee].amount_nominal = currentValue;
                newContactFee[
                  findContactFee
                ].tmp_amount_input = `${formatCurrencyID(currentValue, 2)}`;

                // console.log("masuk ke sini fee nominal", fee_nominal);
              }
            } else {
              const tmpValue = 0;
              const currentValue = tmpValue + (fee_nominal || 0);

              newContactFee.push({
                ...contact,
                value: currentValue,
                amount: currentValue,
                type: unitFee.value,
                amount_nominal: currentValue,
                tmp_amount_input: `${formatCurrencyID(currentValue, 2)}`,
              });

              // newContactFee[findContactFee].value = currentValue;

              //   newContactFee[findContactFee].type = unitFee.value;
              //   newContactFee[findContactFee].amount = currentValue;
              //   newContactFee[findContactFee].amount_nominal = currentValue;
              //   newContactFee[
              //     findContactFee
              //   ].tmp_amount_input = `${formatCurrencyID(currentValue, 2)}`;
            }
          }
        );
      });
    });

    newContactFee.forEach((contact) => {
      const total = sumFeePerItem(contact.party_id || "");

      contact.value = total;
      contact.amount = total;
      contact.amount_nominal = total;
      contact.tmp_amount_input = `${formatCurrencyID(total, 2)}`;
    });

    contactsFee.value = newContactFee;
  }
};

const sumFeePerItem = (unique_id: string) => {
  let total = 0;
  item_canvassing.value.forEach((item) => {
    item.children.forEach((child) => {
      const findContact = child.contacts_fee.findIndex(
        (find) => find.party_id == unique_id
      );

      if (
        findContact >= 0 &&
        child.contacts_fee[findContact].amount_nominal! > 0
      ) {
        total +=
          child.contacts_fee[findContact].amount_nominal! * child.quantity;
      }
    });
  });

  return total;
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
        if (it.fee_unit == "percent") {
          it.fee_percent = contacts.reduce((sum, c) => sum + (c.value || 0), 0);
          it.fee = it.fee_percent;
        } else {
          it.fee_nominal = contacts.reduce((sum, c) => sum + (c.value || 0), 0);
          it.fee = it.fee_nominal;
        }

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

    if (it.children.length > 0) {
      updateItemFee(it.children, index, contacts, fee);
    }
  }
}

const accumulateOngkir = () => {
  let ongkirAmount = 0;

  item_canvassing.value.forEach((element) => {
    element.children.forEach((childs) => {
      if (element.tmp_child_selected === childs.index) {
        ongkirAmount = Number(childs.ongkir) * Number(childs.quantity);
      }
    });
  });

  if (ongkirAmount > 0) {
    adjustmentTransactionOngkirTotal.value.amount = ongkirAmount;
    adjustmentTransactionOngkirTotal.value.tmp_amount_input = handleInput(
      `${ongkirAmount}`
    );
  }
};

const submitRemoveCost = async (ids: string[]) => {
  loading.value = true;
  try {
    const response = await useFetchApi(
      "/reference-transaction-delete",
      "remove-cost",
      "post",
      ids
    );
    if (response.status.value == "success") {
      ElMessage.success("Biaya Lainya Berhasil Dihapus!");
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  } finally {
    loading.value = false;
  }
};

const removeAnotherCost = async (adj_id: string) => {
  const findIndex = references.value.findIndex(
    (ref) => ref.adjustment_id === adj_id
  );
  const unique_id = references.value[findIndex].unique_id;
  if (unique_id != "") {
    await submitRemoveCost([unique_id]);
  }

  references.value.splice(findIndex, 1);
};

const addItemVendor = (row: CanvassingItemForm) => {
  itemIndex.value = row.index;

  const data: ReferenceTransactionAdjustment[] = JSON.parse(
    JSON.stringify(contactsFee.value)
  );
  // visibleModalSearchItemExample.value = true
  item_canvassing.value.forEach((item, index) => {
    if (item.index == itemIndex.value) {
      const startIndex = item.children.length;
      item.children.push({
        type_item: "original",
        index: `${item.index}-${startIndex}`,
        canvassing_id: null,
        canvaasing_version: null,
        item_request_trail_version: null,
        item_request_trail_id: null,
        unique_id: null,
        vendor_id: null,
        vendor_name: "",
        unit_id: "",
        unit_name: "",
        unit_version: 1,
        offer_item_id: null,
        offer_item_version: 0,
        catalogue_id: "0",
        parent_catalogue_id: "",
        catalogue_name: "",
        sn: "N/A",
        quantity: item.quantity,
        unit_price: 0,
        total_price: 0,
        total_selling_price: 0,
        status: CanvassingVendorStatus.SUBMITTED,
        taxes: [],
        editing: null,
        type: "child",
        children: [],
        selling_price: 0,
        profit: 0,
        profit_unit: "percent",
        fee: 0,
        fee_unit: "percent",
        ongkir: 0,
        ongkir_unit: "amount",
        pricetag_item_id: "",
        pricetag_item_version: 0,
        contacts_fee: data.map((c) => ({
          ...c,
          amount: 0,
          value: 0,
          type: FeeType.PERCENT,
        })),
        equivalent_id: null,
        parent_index: index,
      });
    }
  });

  const findParent = item_canvassing.value.find(
    (find) => find.index == itemIndex.value
  );

  if (findParent) {
    autoSelectSingleChild(findParent);
  }
};

const addEquivalent = (row: CanvassingItemForm) => {
  const indexParent = item_canvassing.value.findIndex(
    (value) => value.index == row.index
  );

  const equivalentItem: CanvassingItemForm = {
    type_item: "equivalent",
    equivalent_id: `${item_canvassing.value[indexParent].catalogue_id}`,
    index: `${item_canvassing.value[indexParent]}-${
      item_canvassing.value.length + 1
    }`,
    canvassing_id: null,
    canvaasing_version: null,
    item_request_trail_version: null,
    item_request_trail_id: null,
    unique_id: null,
    vendor_id: null,
    vendor_name: "",
    unit_id: "",
    unit_name: "",
    unit_version: 1,
    offer_item_id: null,
    offer_item_version: 0,
    catalogue_id: "0",
    parent_catalogue_id: "",
    catalogue_name: "",
    sn: "N/A",
    quantity: item_canvassing.value[indexParent].quantity,
    unit_price: 0,
    total_price: 0,
    total_selling_price: 0,
    status: CanvassingVendorStatus.SUBMITTED,
    taxes: [],
    editing: null,
    type: "parent",
    children: [],
    selling_price: 0,
    profit: 0,
    profit_unit: "percent",
    fee: 0,
    fee_unit: "percent",
    ongkir: 0,
    ongkir_unit: "amount",
    pricetag_item_id: "",
    pricetag_item_version: 0,
    contacts_fee: contactsFee.value,
  };

  item_canvassing.value.splice(indexParent + 1, 0, equivalentItem);

  if (indexParent >= 0) {
    autoSelectSingleChild(item_canvassing.value[indexParent]);
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

const showPricetag = (row: CanvassingItemForm) => {
  const parent = findParent(item_canvassing.value, row.index);
  if (parent != null) {
    itemIndex.value = parent.index;
    itemStartIndex.value = row.index;
    visibleModalSearchItemExample.value = true;
  }
};

const toggleExpand = (row: any) => {
  row._expanded = !row._expanded;
  const table = tableRef.value as any;
  table.toggleRowExpansion(row, row._expanded);
};

const calculateMargin = (row: CanvassingItemForm) => {
  return ((row.selling_price - row.unit_price) / row.unit_price) * 100;
};
const calculateMarginNominal = (row: CanvassingItemForm) => {
  return (row.total_selling_price || 0) - Number(row.total_price);
};

const changeFeeUnitContacts = (row: CanvassingItemForm, unit: string) => {
  row.contacts_fee.forEach((element) => {
    // console.log("element", element);
    element.type = row.fee_unit as FeeType;
    if (unit == "percent") {
      element.value = element.amount;
    } else {
      element.value = element.amount_nominal || 0;
    }
  });
  if (unit == "percent") {
    row.fee = row.fee_percent ?? 0;
  } else {
    row.fee = row.fee_nominal ?? 0;
  }
  // row.
};
const changeFeeUnit = (val: any) => {
  contactsFee.value.forEach((element) => {
    element.type = val as FeeType;
  });
};

const getProfit = (row: CanvassingItemForm) => {
  if (row.profit_unit == "percent") {
    const profit = Number(row.unit_price) * (Number(row.profit) / 100);
    return currency(profit || 0);
  } else if (row.profit_unit == "amount") {
    const profit = (Number(row.profit) / Number(row.unit_price)) * 100;
    return `${profit.toFixed(2)}%`;
  }
};

const onChangeChild = (row: CanvassingItemForm) => {
  // if (row.type == "child") {
  //   const parent = findParent(item_canvassing.value, row.index);
  //   if (parent != null) {
  //     setProfit(parent);
  //   }
  // }
  // setProfit(row);
  calculatePricing(row, "selling_price");
};

const calculateSellingPriceSelected = (
  row: CanvassingItemForm,
  parentIndex: number
) => {
  item_canvassing.value[parentIndex].selling_price = row.selling_price;
  item_canvassing.value[parentIndex].total_selling_price =
    Number(row.selling_price) * Number(row.quantity);
  item_canvassing.value[parentIndex].total_price = row.total_price;
  item_canvassing.value[parentIndex].unit_price = row.unit_price;

  // if()
  adjustmentTransactionOngkirTotal.value.type = row.ongkir_unit as FeeType;
  adjustmentTransactionOngkirTotal.value.amount = row.ongkir;
  adjustmentTransactionOngkirTotal.value.amount_nominal = row.ongkir_nominal;
};

const setProfit = (row: CanvassingItemForm) => {
  // const selling_price = Number(child.selling_price || 0);
  if (row.type == "parent") {
    row.children.forEach((child) => {
      const selling_price = Number(child.selling_price || 0);
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

      // let newProfitAndFee = child.profit + fee;
      // child.fee_nominal = selisih * fee / newProfitAndFee;

      calculateSellingPrice(child);
    });
  } else {
    const selling_price = Number(row.selling_price || 0);
    const hargaBeli = Number(row.unit_price || 0);

    let ongkirNominal =
      row.ongkir_unit === "percent"
        ? (hargaBeli * row.ongkir) / 100
        : Number(row.ongkir) || 0;

    const selisih = selling_price - hargaBeli - ongkirNominal;

    // ganti 100
    let profit = 100;
    let fee = 0;

    if (row.fee_unit == "percent") {
      fee = Number(row.fee);
    } else {
      fee = (Number(row.fee) / hargaBeli) * 100;
    }

    if (row.profit_unit == "amount") {
      profit = (Number(row.profit) / hargaBeli) * 100;
    }

    let profitAndFee = profit + fee;

    row.fee = fee;
    row.fee_nominal =
      (selisih * fee) / profitAndFee < 0 ? 0 : (selisih * fee) / profitAndFee;

    row.profit_nominal = ((selisih < 0 ? 0 : selisih) * profit) / profitAndFee;

    console.log("profit nominal", row.profit_nominal);

    row.profit = Number(((row.profit_nominal / hargaBeli) * 100).toFixed(2));

    // let newProfitAndFee = child.profit + fee;
    // child.fee_nominal = selisih * fee / newProfitAndFee;

    calculateSellingPrice(row);
  }
};

const calculateProfitAndFee = (
  row: CanvassingItemForm,
  fee: number,
  activeField: "profit" | "selling_price"
): {
  fee_nominal: number;
  fee_percent: number;
  profit_nominal: number;
  profit_percent: number;
  ongkir_nominal: number;
  ongkir_percent: number;
} => {
  const hargaBeli = Number(row.unit_price || 0);
  let profitPercent = 0;
  let profitNominal = 0;

  if (row.profit_unit == "percent") {
    profitPercent = parseFloat((Number(row.profit) ?? 0).toFixed(2));
    profitNominal = (hargaBeli * Number(row.profit || 0)) / 100;
  } else {
    profitPercent = parseFloat(
      ((Number(row.profit) / hargaBeli) * 100).toFixed(2)
    );
    profitNominal = row.profit;
  }

  let ongkirPercent = 0;
  let ongkirNominal = 0;

  if (row.ongkir_unit == "percent") {
    ongkirPercent = parseFloat((row.ongkir ?? 0).toFixed(2));
    ongkirNominal = (hargaBeli * Number(row.ongkir || 0)) / 100;
  } else {
    ongkirNominal = row.ongkir;
    ongkirPercent = parseFloat(((row.ongkir / hargaBeli) * 100).toFixed(2));
  }

  let feePercent = Number(row.fee_percent || 0);
  let feeNominal = Number(row.fee_nominal || 0);

  // if (row.fee_unit == "percent") {
  //   feePercent = Number(fee || 0);
  //   feeNominal = customMathCeil((profitNominal * Number(fee || 0)) / 100);
  // } else {
  //   feePercent = ((fee || 0) / profitNominal) * 100;
  //   feeNominal = customMathCeil(fee || 0);
  // }

  console.log("row", row.catalogue_name);
  console.log("active field", activeField);
  if (activeField == "selling_price") {
    let selisih = row.selling_price - (hargaBeli + ongkirNominal);

    if (selisih < 0) {
      selisih = 0;
    }

    const tmpProfit = 100;
    const tmpFee = feePercent;

    const profitAndFee = tmpProfit + Number(tmpFee);

    profitNominal = customMathCeil(selisih / (profitAndFee / 100));

    profitPercent = parseFloat(((profitNominal / hargaBeli) * 100).toFixed(2));

    feeNominal = customMathCeil(selisih - profitNominal) as number;

    console.log("tmpFee", tmpFee);
    console.log("tmpFeeNominal", feeNominal);
    console.log("profitAndFee", profitAndFee);
    console.log("selisih", selisih);
    console.log("fee nominal selling price", profitNominal);
  }

  console.log("selling price", row.selling_price);
  console.log("ongkir %", ongkirPercent);
  console.log("ongkir Rp", ongkirNominal);
  console.log("=======");
  console.log("profit %", profitPercent);
  console.log("profit Rp", profitNominal);
  console.log("=======");
  console.log("fee %", feePercent);
  console.log("fee Rp", feeNominal);

  // row.fee = feePercent;
  // row.fee_nominal = feeNominal;
  // row.ongkir = row.ongkir_unit == "percent" ? ongkirPercent : ongkirNominal;
  // row.ongkir_nominal = ongkirNominal;
  // row.profit = row.profit_unit == "percent" ? profitPercent : profitNominal;
  // row.profit_percent = profitPercent;
  // row.profit_nominal = profitNominal;

  return {
    profit_nominal: profitNominal,
    profit_percent: profitPercent,
    fee_nominal: feeNominal,
    fee_percent: feePercent,
    ongkir_nominal: ongkirNominal,
    ongkir_percent: ongkirPercent,
  };
};

function calculatePricing(
  row: CanvassingItemForm,
  activeField: "profit" | "selling_price"
) {
  if (row.type == "parent" && activeField == "selling_price") {
    row.children.forEach((child) => {
      if (child.type_item == "original") {
        child.selling_price = row.selling_price;
        const {
          fee_nominal,
          fee_percent,
          ongkir_nominal,
          ongkir_percent,
          profit_nominal,
          profit_percent,
        } = calculateProfitAndFee(
          child,
          child.fee_unit == "amount" ? child.fee_nominal! : child.fee_percent!,
          activeField
        );

        child.profit_nominal = profit_nominal;
        child.profit_percent = profit_percent;
        child.profit =
          child.profit_unit == "percent"
            ? child.profit_percent
            : child.profit_nominal;
        child.fee_nominal = fee_nominal;
        child.fee_percent = fee_percent;
        child.fee =
          child.fee_unit == "percent" ? child.fee_percent : child.fee_nominal;
        child.ongkir_nominal = ongkir_nominal;
        child.ongkir = ongkir_nominal;

        child.selling_price =
          child.unit_price +
          (child.profit_nominal || 0) +
          (child.fee_nominal || 0) +
          (child.ongkir_nominal || 0);

        child.total_selling_price = child.selling_price * child.quantity;
      }
    });
  } else {
    const {
      fee_nominal,
      fee_percent,
      ongkir_nominal,
      ongkir_percent,
      profit_nominal,
      profit_percent,
    } = calculateProfitAndFee(
      row,
      row.fee_unit == "amount" ? row.fee_nominal! : row.fee_percent!,
      activeField
    );

    console.log("else fee nominal atas", customMathCeil(fee_nominal));

    row.profit_nominal = profit_nominal;
    row.profit_percent = profit_percent;
    row.profit =
      row.profit_unit == "percent" ? row.profit_percent : row.profit_nominal;
    row.fee_nominal = fee_nominal;
    row.fee_percent = fee_percent;
    row.fee = row.fee_unit == "percent" ? row.fee_percent : row.fee_nominal;
    row.ongkir_nominal = ongkir_nominal;
    row.ongkir = ongkir_nominal;

    row.selling_price =
      row.unit_price +
      (row.profit_nominal || 0) +
      (row.fee_nominal || 0) +
      (row.ongkir_nominal || 0);
    row.total_selling_price = row.selling_price * row.quantity;
    const parent = item_canvassing.value[row.parent_index || 0];

    if (parent.children.length === 1) {
      parent.selling_price = row.selling_price;
      parent.total_selling_price = row.total_selling_price;
    } else {
      console.log("calculate pricing", parent);
      if (row.type_item == "original") {
        // if (parent.tmp_child_selected == row.index) {
        parent.selling_price = row.selling_price;
        parent.total_selling_price = row.total_selling_price;
        // }
      }

      calculatePricing(parent, "selling_price");
    }
  }

  // // ==============================
  // // PROFIT INPUT → PERSEN
  // // ==============================
  // const profitInputPercent =
  //   row.profit_unit === "percent"
  //     ? Number(row.profit || 0)
  //     : (Number(row.profit || 0) / hargaBeli) * 100;

  // let sellingPrice = Number(row.selling_price || 0);
  // let selisih = 0;

  // // ==============================
  // // MODE 1: PROFIT DIINPUT → HITUNG SELLING PRICE
  // // ==============================
  // if (activeField === "profit") {
  //   if (profitInputPercent <= 0) return;

  //   // profit nominal
  //   const profitNominal = (hargaBeli * profitInputPercent) / 100;

  //   const totalWeight = profitInputPercent + fee;
  //   if (totalWeight <= 0) return;

  //   // profit hanya bagian dari selisih
  //   selisih = profitNominal * (totalWeight / profitInputPercent);

  //   sellingPrice = hargaBeli + ongkirNominal + selisih;
  //   row.selling_price = Math.round(sellingPrice);
  // }

  // row.total_selling_price = Number(row.quantity) * Number(row.selling_price);

  // // ==============================
  // // MODE 2: SELLING PRICE DIINPUT → HITUNG PROFIT
  // // ==============================
  // if (activeField === "selling_price") {
  //   console.log("selling price", sellingPrice);
  //   selisih = sellingPrice - hargaBeli - ongkirNominal;
  // }

  // if (selisih <= 0) {
  //   row.fee_nominal = 0;
  //   row.profit_nominal = 0;
  //   row.profit = 0;
  //   return;
  // }

  // const profitWeight = profitInputPercent > 0 ? profitInputPercent : 100;
  // const profitAndFee = profitWeight + fee;

  // row.fee_nominal = profitAndFee > 0 ? (selisih * fee) / profitAndFee : 0;

  // row.profit_nominal =
  //   profitAndFee > 0 ? (selisih * profitWeight) / profitAndFee : 0;

  // row.profit = Number(((row.profit_nominal / hargaBeli) * 100).toFixed(2));
}

const handleProfitUnitChange = (row: CanvassingItemForm, val: string) => {
  if (val == "percent") {
    row.profit = row.profit_percent || 0;
  } else {
    row.profit = row.profit_nominal || 0;
  }
};

// const handleProfitChange = (row: CanvassingItemForm) => {
//   const cost = Number(row.unit_price) || 0
//   let profit = Number(row.profit) || 0

//   if (row.profit_unit === 'percent') {
//     // sebelumnya dalam nominal → ubah ke persen
//     row.profit = cost > 0 ? (profit / cost) * 100 : 0
//   } else if (row.profit_unit === 'amount') {
//     // sebelumnya dalam persen → ubah ke nominal
//     row.profit = cost * (profit / 100)
//   }

//   calculateSellingPrice(row)
// }

const handleProfitUnitChangeParent = (row: CanvassingItemForm) => {
  const cost = Number(row.unit_price) || 0;
  let profit = Number(row.profit) || 0;

  if (row.profit_unit === "percent") {
    // sebelumnya dalam nominal → ubah ke persen
    row.profit = cost > 0 ? (profit / cost) * 100 : 0;
  } else if (row.profit_unit === "amount") {
    // sebelumnya dalam persen → ubah ke nominal
    row.profit = cost * (profit / 100);
  }

  calculateSellingPrice(row);
};
const handleParentChange = (row: CanvassingItemForm) => {
  row.children.forEach((child) => {
    child.profit = row.profit;
    child.profit_unit = row.profit_unit;
    child.fee = row.fee;
    child.fee_unit = row.fee_unit;
    child.ongkir = row.ongkir;
    child.ongkir_unit = row.ongkir_unit;
  });

  calculateSellingPrice(row);
};

const calculateSellingPrice = (row: CanvassingItemForm) => {
  let basePrice = Number(row.unit_price || 0);

  // let sellingPrice = Number(basePrice);
  let profitAmount = Number(row.profit_nominal);
  let feeAmount = Number(row.fee_nominal);
  let ongkir = Number(row.ongkir || 0);

  row.total_price = Number(row.unit_price) * Number(row.quantity);

  // Update harga jual
  row.selling_price = basePrice + profitAmount + feeAmount + ongkir;

  if (feeState.value === "plus") {
    // accumulateFee();
  }
  accumulateOngkir();

  row.total_selling_price = Number(row.selling_price) * Number(row.quantity);

  const parent = findParent(item_canvassing.value, row.index);

  // if (parent && parent.tmp_child_selected == row.index) {
  //   console.log("parent", parent);

  //   parent.unit_price = row.unit_price;
  //   parent.total_price = row.total_price;
  //   parent.selling_price = row.selling_price;
  //   parent.total_selling_price = row.total_selling_price;
  // }
};

const removeItem = async (item: CanvassingItemForm) => {
  if (item.type === "parent") {
    if (item.unique_id) {
      const deleted: boolean = await canvasingItemRemove([item.unique_id]);
      if (deleted) {
        item_canvassing.value = item_canvassing.value.filter(
          (value) => value.index !== item.index
        );
      }
    }
  } else if (item.type === "child") {
    if (item.unique_id) {
      const deleted: boolean = await canvasingItemVendorRemove([
        item.unique_id,
      ]);
      if (deleted) {
        item_canvassing.value.forEach(
          (parent) =>
            (parent.children = parent.children.filter(
              (child) => child.index != item.index
            ))
        );
      }
    }

    // removeVendor(item.vendor_id)
  }
};

const canvasingItemRemove = async (ids: string[]): Promise<boolean> => {
  try {
    const response = await useApiFetch<BaseResponse<any>>(
      "/canvassing-item-delete",
      {
        method: "POST",
        body: ids,
      }
    );

    return response.success;
  } catch (error: any) {
    ElMessage.error(`${error?.response?.data?.message ?? error}`);
    return false;
  }
};
const canvasingItemVendorRemove = async (ids: string[]): Promise<boolean> => {
  try {
    const response = await useApiFetch<BaseResponse<any>>(
      "/canvassing-vendor-delete",
      {
        method: "POST",
        body: ids,
      }
    );

    return response.success;
  } catch (error: any) {
    ElMessage.error(`${error?.response?.data?.message ?? error}`);
    return false;
  }
};

const removeVendor = (vendorId: string) => {
  quotationItems.value = quotationItems.value.map((item) => {
    return {
      ...item,
      equivalents: item.equivalents.map((eq) => {
        return {
          ...eq,
          vendors: eq.vendors.filter((v) => v.vendor_id !== vendorId), // hanya filter vendors
        };
      }),
    };
  });
};

const removeReference = (index: number) => {
  references.value.splice(index, 1);
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
            changeFeeUnitContacts(child, feeState.value);
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

          console.log("builk", bulkOngkir.value);

          // Recalculate selling price
          calculatePricing(child, "profit");
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

// Form Operations
const addToForm = (val: Inquiry) => {
  ruleForm.source_document = val.unique_code;
  ruleForm.inquiry = val;
  ruleForm.address_id = val.address_id;
  ruleForm.address_version = val.address_version;
  ruleForm.address_view = generateResultSearchAddress(val.address ?? null).name;
  address.value = val.address;

  val.item_request.forEach((item, index) => {
    item_canvassing.value.push({
      type_item: "request",
      index: `${index}`,
      canvassing_id: null,
      canvaasing_version: null,
      item_request_trail_version: null,
      item_request_trail_id: null,
      unique_id: null,
      vendor_id: null,
      vendor_name: "",
      unit_id: item.unit_id,
      unit_name: item.unit_name,
      unit_version: 1,
      offer_item_id: null,
      offer_item_version: 0,
      catalogue_id: item.catalogue_id ?? "",
      parent_catalogue_id: "",
      catalogue_name: item.catalogue_name ?? "",
      sn: item.sn ?? "N/A",
      quantity: item.request_qty ?? 1,
      unit_price: 0,
      total_price: 0,
      total_selling_price: 0,
      status: CanvassingVendorStatus.SUBMITTED,
      taxes: [],
      editing: null,
      type: "parent",
      children: [],
      selling_price: 0,
      profit: 0,
      profit_unit: "percent",
      fee: 0,
      fee_unit: "percent",
      ongkir: 0,
      ongkir_unit: "percent",
      pricetag_item_id: "",
      pricetag_item_version: 0,
      contacts_fee: contactsFee.value,
      equivalent_id: null,
    });
  });

  visibleModalRequest.value = false;
};

const addItemRequestToCanvassing = (item: ItemRequest) => {
  item_canvassing.value.push({
    type_item: "request",
    index: `${item_canvassing.value.length + 1}`,
    canvassing_id: null,
    canvaasing_version: null,
    item_request_trail_version: null,
    item_request_trail_id: null,
    unique_id: null,
    vendor_id: null,
    vendor_name: "",
    unit_id: item.unit_id,
    unit_name: item.unit_name,
    unit_version: 1,
    offer_item_id: null,
    offer_item_version: 0,
    catalogue_id: item.catalogue_id ?? "",
    parent_catalogue_id: "",
    catalogue_name: item.catalogue_name ?? "",
    sn: item.sn ?? "N/A",
    quantity: item.request_qty ?? 1,
    unit_price: 0,
    total_price: 0,
    total_selling_price: 0,
    status: CanvassingVendorStatus.SUBMITTED,
    taxes: [],
    editing: null,
    type: "parent",
    children: [],
    selling_price: 0,
    profit: 0,
    profit_unit: "percent",
    fee: 0,
    fee_unit: "percent",
    ongkir: 0,
    ongkir_unit: "percent",
    pricetag_item_id: "",
    pricetag_item_version: 0,
    contacts_fee: contactsFee.value,
    equivalent_id: null,
  });

  dialogItemRequest.value = false;
};

const addNewPaymentTerm = () => {
  payment_terms.value.push({
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
      payment_terms.value = (payment_terms.value ?? []).filter(
        (term) => term.unique_id !== data.unique_id
      );
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  }
};

const removePaymentTerm = async (data: TermOfPayment) => {
  await ElMessageBox.confirm("Yakin ingin menghapus TOP ini?", "Warning", {
    confirmButtonText: "Hapus",
    cancelButtonText: "Batal",
    type: "warning",
  });
  console.log("masuk", data);
  if (!data.unique_id) {
    payment_terms.value = (payment_terms.value ?? []).filter(
      (term) => term.unique_id !== data.unique_id
    );
  } else {
    submitDeletePaymentTerm(data);
  }
};

const findTotalBuyPrice = (row: CanvassingItemForm) => {
  let total = 0;
  const exist = (item_canvassing.value || []).find(
    (value) => row.index == value.index
  );
  if (exist) {
    exist.children.forEach((element) => {
      const isChecked = selectedRowsVendors.value.find(
        (value) => value.index == element.index
      );
      if (isChecked) {
        total += isChecked.total_price;
      }
    });
  }

  return total;
};

const addNewItem = () => {
  item_canvassing.value.push({
    type_item: "equivalent",
    index: `${item_canvassing.value.length + 1}`,
    canvassing_id: null,
    canvaasing_version: null,
    item_request_trail_version: null,
    item_request_trail_id: null,
    unique_id: null,
    vendor_id: null,
    vendor_name: "",
    unit_id: null,
    unit_name: null,
    unit_version: 1,
    offer_item_id: null,
    offer_item_version: 0,
    catalogue_id: "",
    parent_catalogue_id: "",
    catalogue_name: "",
    sn: "N/A",
    quantity: 1,
    unit_price: 0,
    total_price: 0,
    total_selling_price: 0,
    status: CanvassingVendorStatus.SUBMITTED,
    taxes: [],
    editing: null,
    type: "parent",
    children: [],
    selling_price: 0,
    profit: 0,
    profit_unit: "percent",
    fee: 0,
    fee_unit: "percent",
    ongkir: 0,
    ongkir_unit: "percent",
    pricetag_item_id: "",
    pricetag_item_version: 0,
    contacts_fee: contactsFee.value,
    equivalent_id: null,
  });
};

const addToOfferVendor = (val: Pricetag_item[]) => {
  const getIndex = item_canvassing.value.findIndex(
    (value) => value.index == itemIndex.value
  );

  let startIndex = 0;

  if (itemStartIndex.value !== "") {
    startIndex = findChildIndex(
      item_canvassing.value[getIndex].children,
      itemStartIndex.value
    );
  }

  val.forEach((item: Pricetag_item, index: number) => {
    const child: CanvassingItemForm = {
      index: `${itemIndex.value}-${index}`,
      type_item: "original",
      canvassing_id: null,
      canvaasing_version: null,
      item_request_trail_version: null,
      item_request_trail_id: null,
      unique_id: null,
      vendor_id: item.pricetag?.owner?.unique_id ?? "",
      vendor_name: item.pricetag?.owner?.name ?? "",
      unit_id: item.unit_id,
      unit_name: item.unit_name,
      unit_version: null,
      offer_item_id: null,
      offer_item_version: 0,
      catalogue_id: item.catalogue_id ?? "",
      parent_catalogue_id: item_canvassing.value[getIndex].catalogue_id,
      catalogue_name: item.catalogue?.name ?? "",
      sn: item.catalogue?.sn ?? "",
      quantity: item_canvassing.value[getIndex].quantity,
      unit_price: item.price,
      total_price:
        Number(item.price) *
        Number(item_canvassing.value[getIndex].quantity || 0),
      total_selling_price: 0,
      status: CanvassingVendorStatus.SUBMITTED,
      taxes: [],
      editing: null,
      type: "child",
      children: [],
      selling_price: 0,
      profit: 0,
      profit_unit: "percent",
      fee: 0,
      fee_unit: "percent",
      ongkir: 0,
      ongkir_unit: "amount",
      pricetag_item_id: item.unique_id ?? "",
      pricetag_item_version: item.version ?? 0,
      contacts_fee: contactsFee.value,

      equivalent_id: null,
    };

    const clones = contactsFee.value;

    child.contacts_fee = clones.map((value) => {
      return {
        ...value,
        reference: ReferenceAdjustment.CANVASSINGVENDOR,
        amount: 0,
        type: FeeType.PERCENT,
      };
    });

    if (item_canvassing.value[getIndex].children[startIndex]) {
      item_canvassing.value[getIndex].children[startIndex] = child;
    } else {
      item_canvassing.value[getIndex].children.splice(startIndex, 0, child);
    }

    startIndex++;
  });

  visibleModalSearchItemExample.value = false;

  fetchPriceTagWithItems();
};

const addVendor = (val: Contact[]) => {
  // Implementation for adding vendors
  visibleModalContact.value = false;
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

// const removeFee = async (index: number): Promise<boolean> => {
//   loading.value = true;
//   try {
//     const response = await useFetchApi('/')
//   } catch (error: any) {
//     console.log(`${error?.response?.message ?? error}`);
//   } finally {
//     loading.value = false;
//     return false;
//   }

// };

const removeContact = async (index: number) => {
  submitRemoveCost([contactsFee.value[index].unique_id]).then((response) => {
    contactsFee.value.splice(index, 1);
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
      contactsFee.value[index].type = FeeType.PERCENT;
    }
  } else {
    const contact: Contact = item as Contact;
    contactsFee.value[index].reference = ReferenceAdjustment.CANVASSING;
    contactsFee.value[index].party_id = contact.unique_id;
    contactsFee.value[index].party = contact;
    contactsFee.value[index].party_type = PartyType.CONTACT;
    contactsFee.value[index].type = FeeType.PERCENT;
  }

  item_canvassing.value.forEach((value) => {
    const data: ReferenceTransactionAdjustment[] = JSON.parse(
      JSON.stringify(contactsFee.value)
    );
    value.children.forEach((child) => (child.contacts_fee = data));
  });

  const fee = (adjustmentTransactions.data.value?.data || []).filter(
    (filter) => filter.name.toLocaleLowerCase() == "fee"
  );
  const feeExist = (references.value || []).filter(
    (filter) =>
      filter.adjustments_transaction?.name.toLocaleLowerCase() == "fee"
  );

  if (fee.length > 0 && feeExist.length == 0) {
    references.value.push({
      unique_id: "",
      reference: ReferenceAdjustment.CANVASSING,
      reference_id: ruleForm.unique_id || "",
      adjustment_id: fee[0].unique_id,
      value: 0,
      type: FeeType.PERCENT,
      adjustment: fee[0],
      adjustments_transaction: fee[0],
      amount: 0,
      disabled: true,
    });
  }
};
const onHandleSelectVendor = async (
  record: Record<string, any>,
  index: string
) => {
  const parentIndex = findParent(item_canvassing.value, index);
  if (parentIndex) {
    const childIndex = parentIndex.children.findIndex(
      (value) => value.index == index
    );
    if (childIndex >= 0) {
      if (record.isNew) {
        const contact: Contact | null = await createNewContact({
          name: record.query,
        });
        if (contact != null) {
          parentIndex.children[childIndex].vendor_id = contact.unique_id!;
          parentIndex.children[childIndex].vendor_name = contact.name!;
        }
      } else {
        const contact: Contact = record as Contact;
        parentIndex.children[childIndex].vendor_id = contact.unique_id!;
        parentIndex.children[childIndex].vendor_name = contact.name!;
      }
    }
  }
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

const create_catalogue = async (
  catalogue: Catalogue
): Promise<Catalogue | null> => {
  loading.value = true;
  try {
    const formData = new FormData();

    formData.append("unique_id", catalogue.unique_id ?? "");
    formData.append("name", catalogue.name ?? "");
    formData.append("brand_id", catalogue.brand_id ?? "");
    formData.append("year", catalogue.year ?? "");
    formData.append("sn", catalogue.sn ?? "");
    formData.append("description", catalogue.description ?? "");
    formData.append("berat", (catalogue.berat ?? 0).toString());
    formData.append(
      "volume",
      `${catalogue.length}x${catalogue.width}x${catalogue.height}`
    );
    formData.append(
      "is_asset",
      (catalogue.tmp_asset == "1" ? true : false).toString()
    );
    formData.append("type", catalogue.type);

    const response = await useFetchApi<BaseResponse<Catalogue>>(
      "/catalogues-create",
      "catalogue-create",
      "post",
      formData
    );
    if (response.status.value == "success") {
      const catalogue_result: Catalogue | null =
        response.data.value?.data ?? null;
      return catalogue_result;
    } else {
      return null;
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
    return null;
  } finally {
    loading.value = false;
    return null;
  }
};

const handleNewUnit = async (data: any): Promise<Unit | null> => {
  try {
    const response = await useFetchApi<BaseResponse<Unit>>(
      "/unit-create",
      "createUnit",
      "post",
      data
    );
    if (response.status.value == "success") {
      return response.data.value?.data ?? null;
    } else {
      return null;
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.message ?? error}`);
    return null;
  }
};

const querySearchUnit = (queryString: string, cb: (arg: any) => void) => {
  var params = { ...request_search_contact.value };
  params.keyword = queryString;
  params.table = "units";
  params.column = [];
  useFetchApi<ResponsePagination<Unit[]>>(
    "/search",
    "search-unit",
    "post",
    params
  ).then((response) => {
    if (response.status.value == "success") {
      const resultApi: Unit[] = response.data.value?.data ?? [];

      if (resultApi.length > 0) {
        cb(
          resultApi.map((value) => ({
            ...value,
            value: value.name,
            isNew: false,
          }))
        );
      } else {
        cb([
          {
            value: `Tambahkan ${queryString}`,
            label: `${queryString}`,
            isNew: true,
          },
        ]);
      }
    }
  });
};

const handleSelectUnit = async (
  record: Record<string, any>,
  index: string,
  row: CanvassingItemForm
) => {
  if (row.type == "parent") {
    item_canvassing.value.forEach((item) => {
      if (item.index === index) {
        const unit: Unit = record as Unit;
        item.unit_id = unit.unique_id!;
        item.unit_name = unit.name!;
      }
    });
  } else {
    const parentIndex = findParent(item_canvassing.value, index);
    if (parentIndex) {
      const childIndex = parentIndex.children.findIndex(
        (value) => value.index == index
      );
      if (childIndex >= 0) {
        if (record.isNew) {
          const unit: Unit | null = await handleNewUnit({ name: record.id });
          if (unit != null) {
            parentIndex.children[childIndex].unit_id = unit.unique_id!;
            parentIndex.children[childIndex].unit_name = unit.name!;
          }
        } else {
          const unit: Unit = record as Unit;
          parentIndex.children[childIndex].unit_id = unit.unique_id!;
          parentIndex.children[childIndex].unit_name = unit.name!;
        }
      }
    }
  }
};

const querySearchCatalogue = (queryString: string, cb: (arg: any) => void) => {
  request_search_pricetag_item.value.keyword = queryString;

  useFetchApi<ResponsePagination<Pricetag_item[]>>(
    `/pricetag-item-read`,
    "pricetag-search-items",
    "post",
    request_search_pricetag_item.value
  ).then((response) => {
    if (response.status.value == "success") {
      const resultApi: Pricetag_item[] = response.data.value?.data ?? [];
      if (resultApi.length > 0) {
        const results = resultApi.map((data: Pricetag_item) => {
          return {
            ...data,
            value: `${data.catalogue?.name} ${
              data.catalogue?.sn ? " - " + data.catalogue?.sn : ""
            }`,
          };
        });
        cb([
          ...results,
          {
            value: `${queryString}`,
            label: `Tambahkan ${queryString}`,
            isNew: true,
          },
        ]);
      } else {
        cb([
          {
            value: `${queryString}`,
            label: `Tambahkan ${queryString}`,
            isNew: true,
          },
        ]);
      }
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
  });
};

const onHandleSelectItemAutocompleteItem = async (
  item: Record<string, any>,
  itemIndex: string,
  row: CanvassingItemForm
) => {
  if (item.isNew) {
    visibleModalPricetagNewItem.value = true;
  } else {
    const selected: Pricetag_item = item as Pricetag_item;
    if (row.type === "parent") {
      item_canvassing.value.forEach((item) => {
        if (item.index == itemIndex) {
          item.catalogue_id = selected.catalogue_id ?? "";
          item.catalogue_name = selected.catalogue?.name ?? "";
          item.sn = selected.catalogue?.sn ?? "";
          item.unit_id = selected.unit_id ?? "";
          item.unit_name = selected.unit_name ?? "";
          item.quantity = 1;
        }
      });

      // item_canvassing.value.forEach((element) => setProfit(element));
    } else {
      item_canvassing.value.forEach((item) => {
        // const existSelected =
        item.children.forEach((child) => {
          if (child.index == itemIndex) {
            child.catalogue_id = selected.catalogue_id ?? "";
            child.catalogue_name = selected.catalogue?.name ?? "";
            child.sn = selected.catalogue?.sn ?? "";
            child.unit_id = selected.unit_id ?? "";
            child.unit_name = selected.unit_name ?? "";
            child.unit_price = selected.price ?? 0;
            child.vendor_id = selected.pricetag?.owner?.unique_id ?? "";
            child.vendor_name = selected.pricetag?.owner?.name ?? "";
            child.quantity = item.quantity;
            child.pricetag_item_id = selected.unique_id ?? "";
            child.pricetag_item_version = selected.version ?? 0;
            child.total_price = Number(item.quantity) * Number(selected.price);
            child.selling_price = child.unit_price;
            child.total_selling_price = child.total_price;
            child.pricetag_item_data = selected;
            if (!item.tmp_child_selected) {
              item.tmp_child_selected = child.index;
            }

            calculatePricing(child, "selling_price");
          }
        });

        // autoSelectSingleChild(item);
      });

      // item_canvassing.value.forEach((element) => setProfit(element));
    }
    fetchPriceTagWithItems();
  }
};

const querySearchCatalogueEquivalent = (
  queryString: string,
  cb: (arg: any) => void
) => {
  useFetchApi<Pagination<ItemSearch[]>>(
    "/catalogues-inventory",
    "search-catalogues-inventory",
    "post",
    {
      keyword: queryString,
      limit: 10,
    }
  ).then((response) => {
    if (response.status.value == "success") {
      const resultApi: ItemSearch[] = response.data.value?.query ?? [];
      if (resultApi.length > 0) {
        const results = resultApi.map((data: ItemSearch) => {
          return {
            ...data,
            value: `${data.catalogue_name} ${
              data.sn_number ? " - " + data.sn_number : ""
            }`,
          };
        });
        cb([
          ...results,
          {
            value: `${queryString}`,
            label: `Tambahkan ${queryString}`,
            isNew: true,
          },
        ]);
      } else {
        cb([
          {
            value: `${queryString}`,
            label: `Tambahkan ${queryString}`,
            isNew: true,
          },
        ]);
      }
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
  });
};

const onHandleSelectItemAutocompleteItemEquivalent = async (
  item: Record<string, any>,
  itemIndex: string,
  row: CanvassingItemForm
) => {
  if (item.isNew) {
    const catalogueInsert: Catalogue = {
      name: item.value,
      id: null,
      unique_id: null,
      unique_code: null,
      brand_id: null,
      brand_name: null,
      year: null,
      sn: null,
      description: null,
      berat: null,
      volume: null,
      length: null,
      width: null,
      height: null,
      is_asset: null,
      tmp_asset: null,
      version: null,
      type: "item",
      created_at: null,
      created_by: null,
      updated_at: null,
      file_catalogues: [],
    };
    const selected: Catalogue | null =
      (await create_catalogue(catalogueInsert)) ?? null;

    if (selected != null) {
      item_canvassing.value.forEach((item) => {
        if (item.index == itemIndex) {
          item.catalogue_id = selected.unique_id ?? "";
          item.catalogue_name = selected.name ?? "";
        }
      });
    } else {
      ElMessage.error(`Ops, Something wrong!!`);
    }
  } else {
    const selected: ItemSearch = item as ItemSearch;
    item_canvassing.value.forEach((item) => {
      if (item.index == itemIndex) {
        item.catalogue_id = selected.catalogue_id;
        item.catalogue_name = selected.catalogue_name;
        item.sn = selected.sn_number ?? "";
        item.unit_id = selected.unit_id ?? "";
        item.unit_name = selected.unit_name ?? "";
      }
    });
  }
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

const fetchPriceTagWithItems = async () => {
  loading.value = true;
  try {
    const uniques: string[] = [];

    item_canvassing.value.forEach((value) => {
      value.children.forEach((child) => {
        uniques.push(child.pricetag_item_id);
      });
    });

    const query = { ...query_search_pricetag_item.value };
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

      console.log("pricetag value", pricetags.value);
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

// API Methods
const fetchContact = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<ResponsePagination<Contact[]>>(
      `/search`,
      "contact-search",
      "post",
      request_search_contact.value
    );

    if (response.status.value === "success") {
      contacts.value = response.data.value ?? {
        current_page: 0,
        data: [],
        success: true,
        total_data: 0,
        total_page: 0,
      };
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.message ?? error}`);
  } finally {
    loading.value = false;
  }
};

const fetchInquiryDetail = async (inquiry_id: string) => {
  loading.value = true;
  try {
    // Fetch related purchase orders
    const inquiry = await useFetchApi<BaseResponse<Inquiry>>(
      `/inquiries-read/${inquiry_id}`,
      "inquiry",
      "get",
      null
    );

    if (inquiry.status.value === "success") {
      if (inquiry.data.value?.data) {
        addToForm(inquiry.data.value!.data);
      }
    }
  } catch (error) {
    console.error("Failed to fetch related data", error);
  } finally {
    loading.value = false;
  }
};

const getExpandRowKeys = computed(() => {
  const rowKeys = item_canvassing.value
    .filter((value) => value.children && value.children.length > 0)
    .map((value) => value.index);
  return rowKeys;
});
const fetchDataEdit = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<Canvassing>>(
      `/canvassing-read/${id.value}`,
      "detail-canvassing",
      "get",
      null
    );

    if (response.status.value === "success") {
      const canvasing: Canvassing | null = response.data.value?.data ?? null;
      setDataEdit(canvasing);
      ruleForm.status = CanvassingStatus.RAB;
      // (canvasing?.reference_transaction || []).forEach((element) => {
      //   console.log("references", element);
      // });
    }
  } catch (error: any) {
    ElMessage.error(error);
  } finally {
    loading.value = false;
  }
};

const setDataEdit = (dataCanvassing: Canvassing | null) => {
  if (dataCanvassing) {
    address.value = dataCanvassing.address;

    // Populate form data
    Object.assign(ruleForm, {
      unique_id: dataCanvassing.unique_id,
      description: dataCanvassing.description,
      status: dataCanvassing.status,
      source_document: dataCanvassing.source_document,
      inquiry: dataCanvassing.source,
      payment_term: dataCanvassing.payment_term,
      tempo_value: dataCanvassing.tempo_value,
      tempo_unit: dataCanvassing.tempo_unit,
      address_id: dataCanvassing.address_id,
      expired_price: dataCanvassing.expired_price,
      expired_price_view:
        (dataCanvassing.expired_price ?? 0) > 0
          ? dayjs.unix(dataCanvassing.expired_price!).format("YYYY-MM-DD")
          : "",
      address_view: generateResultSearchAddress(dataCanvassing.address ?? null)
        .name,
    });

    if (dataCanvassing.status == CanvassingStatus.PENDING_APPROVAL_RAB) {
      ruleForm.status = CanvassingStatus.RAB;
    }

    contactsFee.value = [];
    (dataCanvassing.reference_transaction ?? []).forEach((element) => {
      if (element.party_type == PartyType.CONTACT) {
        console.log("reference transaction", element);
        if (element.type == FeeType.AMOUNT) {
          const amount_nominal =
            (grandTotal.value / (element.value ?? 0)) * 100;
          contactsFee.value.push({
            ...element,
            amount: element.amount,
            amount_nominal: element.amount,
            tmp_amount_input: handleInput(`${element.amount}`),
          });
        } else {
          contactsFee.value.push({
            ...element,
            amount: element.amount,
            amount_nominal: element.amount,
            tmp_amount_input: `${element.value}`,
          });
        }

        // unitFee.value = val == "plus" ? FeeType.AMOUNT : FeeType.PERCENT;
        if ((element.type as FeeType) === FeeType.AMOUNT) {
          unitFee.value = FeeType.AMOUNT;
          feeState.value = "plus";
        } else {
          unitFee.value = FeeType.PERCENT;
          feeState.value = "minus";
        }
      }

      if (
        (element.adjustments_transaction?.name ?? "").toLowerCase() !==
        "ongkos kirim"
      ) {
        if (
          (element.adjustments_transaction?.name ?? "").toLowerCase() != "fee"
        ) {
          references.value.push(element);
        } else {
          if (!element.party) {
            console.log("masuk reference", element);

            references.value.push({
              ...element,
              tmp_amount_input: handleInput(`${element.amount}`),
            });
          }
        }
      }

      // if (
      //   (element.adjustments_transaction?.name ?? "").toLowerCase() !== "fee" &&
      //   (element.adjustments_transaction?.name ?? "").toLowerCase() !==
      //     "ongkos kirim"
      // ) {
      //   references.value.push(element);
      // }

      if (
        (element.adjustments_transaction?.name ?? "").toLowerCase() ==
        "ongkos kirim"
      ) {
        adjustmentTransactionOngkirTotal.value = element;
        adjustmentTransactionOngkirTotal.value.amount = toNumber(
          handleInput(`${element.amount}`)
        );
        adjustmentTransactionOngkirTotal.value.tmp_amount_input = handleInput(
          `${element.amount}`
        );
        adjustmentTransactionOngkirTotal.value = element;

        adjustmentTransactionOngkirTotal.value.adjustment =
          element.adjustments_transaction;
      }
    });

    payment_terms.value = dataCanvassing.payment_terms ?? [];

    dataCanvassing.canvassing_item.forEach((value, index) => {
      let canvassingItemTmp = {
        type_item: value.type_item,
        index: `${value.unique_id}`,
        canvassing_id: value.canvassing_id,
        canvaasing_version: value.canvaasing_version,
        item_request_trail_version: null,
        item_request_trail_id: null,
        unique_id: value.unique_id,
        vendor_id: null,
        vendor_name: "",
        unit_id: value.unit_id,
        unit_name: value.unit_name,
        unit_version: 1,
        offer_item_id: null,
        offer_item_version: 0,
        catalogue_id: value.catalogue_id ?? "",
        parent_catalogue_id: "",
        catalogue_name: value.catalogue_name ?? "",
        sn: value.catalogue?.sn ?? "N/A",
        quantity: value.quantity ?? 1,
        unit_price: 0,
        total_price: 0,

        total_selling_price: value.total_selling_price || 0,
        status: CanvassingVendorStatus.SUBMITTED,
        taxes: [],
        editing: null,
        type: "parent" as "parent" | "child",
        children: (value.canvassing_vendor || []).map((vendor) => ({
          type_item: vendor.type_item,
          index: `${vendor.unique_id}`,
          canvassing_id: null,
          canvaasing_version: null,
          item_request_trail_version: null,
          item_request_trail_id: null,
          unique_id: vendor.unique_id,
          vendor_id: vendor.vendor_id,
          vendor_name: vendor.vendor?.name ?? "",
          unit_id: vendor.unit_id,
          unit_name: vendor.unit_name,
          unit_version: vendor.unit_version,
          offer_item_id: null,
          offer_item_version: 0,
          catalogue_id: vendor.catalogue_id ?? "",
          parent_catalogue_id: "",
          catalogue_name: vendor.catalogue?.name ?? "",
          sn: vendor.catalogue?.sn ?? "N/A",
          quantity: vendor.quantity ?? 1,
          unit_price: vendor.unit_price,
          total_price: vendor.total_price,
          status: vendor.status,
          taxes: [],
          editing: null,
          type: "child" as "parent" | "child",
          children: [],
          selling_price: Number(
            vendor.selling_price == 0 ? vendor.unit_price : vendor.selling_price
          ),
          total_selling_price: vendor.total_selling_price
            ? Number(vendor.total_selling_price)
            : Number(vendor.unit_price) * Number(vendor.quantity),
          profit: vendor.profit,
          profit_nominal: vendor.profit_nominal,
          profit_percent: vendor.profit_percent,
          profit_unit: vendor.profit_unit,
          fee: vendor.fee,
          fee_nominal: vendor.fee_nominal ?? 0,
          fee_percent: vendor.fee_percent ?? 0,
          fee_unit: vendor.fee_unit,
          ongkir: vendor.ongkir,
          ongkir_unit: vendor.ongkir_unit,
          pricetag_item_id: vendor.pricetag_item_id ?? "",
          pricetag_item_version: vendor.pricetag_item_version ?? "",
          contacts_fee: [],
          equivalent_id: vendor.equivalent_id ?? "",
          parent_index: index,
          tmp_child_selected: "",
          expected_delivery: vendor.expected_delivery,
        })),
        selling_price: value.unit_selling_price,
        tmp_child_selected: "",
        profit: 0,
        profit_unit: "percent" as "amount" | "percent",
        fee: 0,
        fee_unit: "percent" as "amount" | "percent",
        ongkir: 0,
        ongkir_unit: "percent" as "amount" | "percent",
        pricetag_item_id: "",
        pricetag_item_version: 0,
        contacts_fee: [],
        equivalent_id: value.equivalent_id,
      };

      // if (value.canvassing_vendor.length == 1) {
      //   canvassingItemTmp.selling_price =
      //     value.canvassing_vendor[0].selling_price ?? 0;
      //   canvassingItemTmp.total_selling_price =
      //     value.canvassing_vendor[0].total_selling_price ?? 0;
      // }

      // console.log("tmp ", value.canvassing_vendor[0].selling_price);

      item_canvassing.value.push(canvassingItemTmp);
      // if (dataCanvassing.status == CanvassingStatus.PENDING_APPROVAL_RAB) {
      //   value.canvassing_vendor.forEach((element) => {
      //     if (element.type_item == "equivalent") {
      //       let canvassingItemTmpEq = {
      //         catalogue_id: element.catalogue_id,
      //         type_item: element.type_item,
      //         index: `${element.unique_id}`,
      //         canvassing_id: value.canvassing_id,
      //         canvaasing_version: value.canvaasing_version,
      //         item_request_trail_version: null,
      //         item_request_trail_id: null,
      //         unique_id: element.unique_id,
      //         vendor_id: null,
      //         vendor_name: "",
      //         unit_id: element.unit_id,
      //         unit_name: element.unit_name,
      //         unit_version: 1,
      //         offer_item_id: null,
      //         offer_item_version: 0,
      //         parent_catalogue_id: "",
      //         catalogue_name: element.catalogue?.name ?? "",
      //         sn: element.catalogue?.sn ?? "N/A",
      //         quantity: element.quantity ?? 1,
      //         unit_price: 0,
      //         total_price: 0,
      //         total_selling_price: element.total_selling_price || 0,
      //         status: CanvassingVendorStatus.SUBMITTED,
      //         taxes: [],
      //         editing: null,
      //         type: "parent" as "parent" | "child",
      //         children: [],
      //         selling_price: 0,
      //         tmp_child_selected: "",
      //         profit: 0,
      //         profit_unit: "percent" as "amount" | "percent",
      //         fee: 0,
      //         fee_unit: "percent" as "amount" | "percent",
      //         ongkir: 0,
      //         ongkir_unit: "percent" as "amount" | "percent",
      //         pricetag_item_id: "",
      //         pricetag_item_version: 0,
      //         contacts_fee: [],
      //         equivalent_id: element.equivalent_id,
      //       };
      //       console.log("item equivalent", canvassingItemTmpEq);
      //       console.log("item", element);
      //       item_canvassing.value.push(canvassingItemTmpEq);
      //     }
      //   });

      //   // value.canvassing_vendor = value.canvassing_vendor.filter(
      //   //   (value) => value.type_item != "equivalent"
      //   // );
      // }
      // references.value = (canvassingItemTmp. || [])
      //   .filter(
      //     (value) =>
      //       value.adjustments_transaction?.name?.toLowerCase() != "ongkos kirim"
      //   )
      //   .map((ref) => ({
      //     ...ref,
      //     tmp_amount_input: handleInput(`${ref.amount}`),
      //     amount: toNumber(handleInput(`${ref.amount}`)),
      //   }));
    });

    const equivalent: CanvassingItemForm[] = item_canvassing.value.filter(
      (value) => value.type_item === "equivalent"
    );

    // item_canvassing.value = item_canvassing.value.filter(
    //   (value) => value.type_item !== "equivalent"
    // );

    // equivalent.forEach((element) => {
    //   const indexParent = item_canvassing.value.findIndex(
    //     (data) => data.unique_id === element.equivalent_id
    //   );
    //   if (indexParent >= 0) {
    //     item_canvassing.value.splice(indexParent + 1, 0, element);
    //   }
    // });

    // item_canvassing.value.forEach((element) => {
    //   element.children.forEach((child) => {
    //     if (child.selling_price == element.selling_price) {
    //       element.tmp_child_selected = child.index;
    //       element.unit_price = child.unit_price;
    //       element.total_price = child.total_price;
    //     }
    //   });
    // });

    // item_canvassing.value.forEach((element) => );

    item_canvassing.value.forEach((element) => {
      element.children.forEach((child) => {
        if (child.status == CanvassingVendorStatus.SELECTED) {
          handleCheck(true, child);
        }
      });
    });
  }

  item_canvassing.value.forEach((element) => {
    autoSelectSingleChild(element);
  });

  item_canvassing.value.forEach((item) => {
    item.children.forEach((child) => {
      calculatePricing(child, "selling_price");
    });
  });
};

// Form Submission
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const invalidFee = (contactsFee.value || []).some(
          (fee) =>
            fee.amount === null ||
            fee.amount === undefined ||
            Number(fee.amount) === 0
        );

        if (invalidFee) {
          ElMessage.warning("Lengkapi Data Penerima Fee");
          return;
        }

        await submit(formEl);
      } catch (error) {
        ElMessage.error("Failed to create canvassing");
        console.error(error);
      } finally {
        loading.value = false;
      }
    }
  });
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
  const newSearch = unref(request_search_inquiry);
  newSearch.keyword = queryString;
  newSearch.table = "address";
  newSearch.column = [
    // {
    //   contact_id: [ruleForm.request_by, ruleForm.to_unique_id]
    // }
  ];
  newSearch.limit = "10";
  newSearch.offset = "1";

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
    ruleForm.address_id = record.address_id;
    ruleForm.address_version = record.address_version;
    ruleForm.address_view = record.name;
  }
};

const onAddNewAddress = (address: AddressType) => {
  ruleForm.address_id = address.unique_id;
  ruleForm.address_view = address.address_name;
  ruleForm.address_version = address.version || 1;
  dialogNewAddress.value = false;
};

watch(
  payment_terms,
  (val) => {
    if (val.length > 0) {
      paymentTermError.value = false;
    }
  },
  { deep: true }
);

const submit = async (formEl: FormInstance | undefined) => {
  paymentTermError.value = false;

  if (!payment_terms.value || payment_terms.value.length === 0) {
    paymentTermError.value = true;

    ElMessage.warning("Informasi pembayaran wajib diisi");
    return;
  }

  // const hasError = item_canvassing.value.some((element) => {
  //   return (
  //     !element.expected_delivery || element.expected_delivery.trim() === ""
  //   );
  // });

  const hasError = item_canvassing.value.some(
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
    formData.append("unique_id", ruleForm.unique_id || "");
    formData.append("source_document", ruleForm.source_document || "");
    formData.append("description", ruleForm.description || "");
    formData.append("status", ruleForm.status || "");
    formData.append(`payment_term`, `${ruleForm.payment_term}`);
    formData.append(`tempo_value`, `${ruleForm.tempo_value}`);
    formData.append(`tempo_unit`, `${ruleForm.tempo_unit}`);
    formData.append(`address_id`, `${ruleForm.address_id}`);
    formData.append(`address_version`, `${ruleForm.address_version}`);
    formData.append(
      `expired_price`,
      `${dayjs(ruleForm.expired_price_view).unix()}`
    );

    // Append canvassing_items dengan individual fields
    item_canvassing.value.forEach((item: CanvassingItemForm, i: number) => {
      formData.append(`canvassing_items[${i}][unique_id]`, `${item.unique_id}`);
      formData.append(
        `canvassing_items[${i}][canvassing_id]`,
        `${ruleForm.unique_id}`
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

      // Append canvassing_vendor
      // Append canvassing_vendor fields satu per satu
      item.children.forEach((vendor: CanvassingItemForm, j: any) => {
        const isSelected = selectedRowsVendors.value.find(
          (find) =>
            find.vendor_id == vendor.vendor_id &&
            find.catalogue_id == vendor.catalogue_id
        );

        if (isSelected) {
          formData.append(
            `canvassing_items[${i}][canvassing_vendor][${j}][status]`,
            CanvassingVendorStatus.SELECTED
          );
        } else {
          formData.append(
            `canvassing_items[${i}][canvassing_vendor][${j}][status]`,
            CanvassingVendorStatus.SUBMITTED
          );
        }

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

    payment_terms.value.forEach((term, iterm) => {
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
    fileList.value.forEach((element, index) => {
      formData.append(`files[${index}]`, element.raw as Blob);
    });

    const response = await useFetchApi<BaseResponse<Canvassing>>(
      "/canvassing-create",
      "create-canvasing",
      "post",
      formData
    );
    if (response.status.value === "success") {
      ElMessage.success(`Berhasil Membuat Data Canvasing!`);
      formEl?.resetFields();
      resetFormState();
      router.push(`/sales/quotation/${response.data.value?.data?.unique_id}`);
    }
  } catch (error: any) {
    ElMessage.error(error.response?.message ?? error);
  } finally {
    loading.value = false;
  }
};

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  resetFormState();
};

const resetFormState = () => {
  quotationItems.value = [];
  references.value = [];
  fileList.value = [];
};

// Event Handlers
const handlePriceTagSubmit = () => {
  visibleModalPricetagNewItem.value = false;
  refreshNuxtData("pricetag-search-items");
};

const handleAdjustmentSubmit = () => {
  visibleModalNewAdjustment.value = false;
  refreshNuxtData("search-adjustment");
};

// Pagination Handlers
const paginationClick = (val: number) => {
  request_search_inquiry.value.offset = val.toString();
};

const paginationClickPriceTag = (val: number) => {
  request_search_pricetag_item.value.offset = val;
};

const paginationClickContact = (val: number) => {
  request_search_contact.value.offset = val.toString();
};

// Form Validation Rules
const validateChildren = (
  _rule: any,
  value: any[],
  callback: (error?: Error) => void
) => {
  if (!value || value.length < 1) {
    callback(new Error("Minimal harus ada 1 children"));
  } else {
    callback();
  }
};

const paymentTermError = ref(false);
const rules: FormRules = {
  // source_document: [
  //   { required: true, message: "Nomor referensi wajib diisi", trigger: "blur" },
  // ],
  status: [
    { required: true, message: "Status wajib dipilih", trigger: "change" },
  ],
  expired_price_view: [
    {
      required: true,
      message: "Masa berlaku harga wajib diisi!",
      trigger: "change",
    },
  ],
  address_view: [
    { required: true, message: "Pengiriman wajib dipilih", trigger: "change" },
  ],
  canvassing_item: [{ validator: validateChildren, trigger: "change" }],
};

watchDebounced(
  () => request_search_inquiry.value,
  () => refreshNuxtData("request-search-inquiry"),
  {
    debounce: 500,
  }
);

watchDebounced(
  () => querySearchAdjustmentTransaction.value,
  () => {
    adjustmentTransactions.refresh();
  },
  { deep: true }
);

watchDebounced(request_search_contact.value, () => fetchContact(), {
  debounce: 500,
});

watch(
  () => contactsFee.value,
  () => {
    const totalFee = contactsFee.value.reduce(
      (acc, item) => Number(acc) + toNumber(handleInput(`${item.amount}`)),
      0
    );

    references.value.forEach((ref) => {
      if (
        (ref.adjustments_transaction || ref.adjustment)?.name.toLowerCase() ==
        "fee"
      ) {
        if (ref.party_id != null) {
          ref.type = FeeType.AMOUNT;

          let amount = 0;
          let value = 0;

          if (unitFee.value == FeeType.PERCENT) {
            value = totalFee;
            amount = displayAmount(totalFee, totalBuyingPrice.value);
          } else {
            value = totalFee;
            amount = totalFee;
          }

          ref.amount = toNumber(handleInput(`${amount}`));
          ref.tmp_amount_input = handleInput(`${amount.toFixed(2)}`);
        }
      }
    });
  },
  { deep: true }
);

// watchDebounced(
//   contactsFee.value,
//   () => {
//     const data = contactsFee.value || [];
//     item_canvassing.value.forEach((value) => {
//       value.children.forEach((child) => {
//         child.contacts_fee = data;
//       })
//     })
//   },
//   { debounce: 500 }
// )

const onSearch = (value: string) => {
  request_search_pricetag_item.value.keyword = value;
};

watchDebounced(
  () => request_search_pricetag_item.value,
  () => priceTagItem.refresh(),
  { deep: true }
);

watch(item_canvassing.value, (newValue) => calculateSummaryaData());
watch(adjustmentTransactionFeeTotal, (newValue) => calculateSummaryaData(), {
  deep: true,
});
watch(
  () => adjustmentTransactionOngkirTotal.value,
  (newValue) => calculateSummaryaData(),
  { deep: true }
);

watch(
  contactsFee,
  (newValue) => {
    adjustmentTransactionFeeTotal.value = {
      unique_id: "",
      reference: ReferenceAdjustment.CANVASSING,
      reference_id: "",
      adjustment_id: `${adjustmentContact.value?.unique_id}`,
      adjustment: adjustmentContact.value,
      adjustments_transaction: adjustmentContact.value,
      value: null,
      type: unitFee.value,
      amount: contactsFee.value.reduce(
        (sum, c) => Number(sum) + toNumber(`${c.amount || 0}`),
        0
      ),
      created_at: 0,
    };
  },
  { deep: true }
);

watch(
  () => references.value,
  () => {
    calculateSummaryaData();
  },
  { deep: true }
);

watch(
  () => adjustmentTransactions.data.value,
  (newValue) => {
    const data = adjustmentTransactions.data.value?.data || [];
    const trxFee = data.find(
      (value: AdjustmentTransaction) =>
        value.name?.toLowerCase().includes("fee") &&
        value.operator === feeState.value
    );

    if (trxFee) {
      adjustmentTransactionFeeTotal.value = {
        unique_id: "",
        reference: ReferenceAdjustment.CANVASSING,
        reference_id: "",
        adjustment_id: `${trxFee?.unique_id}`,
        adjustment: trxFee,
        adjustments_transaction: trxFee,
        value: null,
        type: unitFee.value,
        amount: contactsFee.value.reduce(
          (sum, c) => Number(sum) + toNumber(`${c.amount || 0}`),
          0
        ),
        created_at: 0,
      };
    }

    const trxOngkir = data.find((value: AdjustmentTransaction) =>
      value.name?.toLowerCase().includes("ongkos kirim")
    );

    if (!adjustmentTransactionOngkirTotal.value.adjustment_id) {
      adjustmentTransactionOngkirTotal.value = {
        unique_id: "",
        reference: ReferenceAdjustment.CANVASSING,
        reference_id: "",
        adjustment_id: `${trxOngkir?.unique_id}`,
        adjustment: trxOngkir,
        value: null,
        type: FeeType.AMOUNT,
        amount: 0,
        created_at: 0,
        changeType: false,
      };
    }
  },
  {
    deep: true,
    immediate: true,
  }
);

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
    },
  ];

  if (adjustmentTransactionOngkirTotal.value.adjustment_id != "") {
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
    });
  }

  references.value.forEach((element) => {
    console.log("reference", element.adjustments_transaction?.name);
    console.log("reference value", displayAmount(element, grandTotal.value));

    tableData.push({
      label: element.adjustments_transaction?.name
        ? element.adjustments_transaction?.name
        : element.adjustment?.name
        ? element.adjustment?.name
        : "-",
      max: currency(displayAmount(element, grandTotal.value)),
      beli: `${safePercent(
        displayAmount(element, grandTotal.value),
        totalBuyingPrice.value
      )}  %`,
      jual: `${safePercent(
        displayAmount(element, grandTotal.value),
        grandTotal.value
      )}  %`,
      min: currency(displayAmount(element, totalBuyingPriceMin.value)),
      beliMin: `${safePercent(
        displayAmount(element, grandTotal.value),
        totalBuyingPriceMin.value
      )}  %`,
      jualMin: `${safePercent(
        displayAmount(element, grandTotal.value),
        grandTotal.value
      )}  %`,
    });
  });

  tableData.push(
    {
      label: adjustmentTransactionFeeTotal.value?.adjustments_transaction?.name,
      max: currency(
        displayAmount(adjustmentTransactionFeeTotal.value, grandTotal.value)
      ),
      beli: `${safePercent(
        displayAmount(adjustmentTransactionFeeTotal.value, grandTotal.value),
        totalBuyingPrice.value
      )} %`,
      jual: `${safePercent(
        displayAmount(adjustmentTransactionFeeTotal.value, grandTotal.value),
        grandTotal.value
      )} %`,
      min: currency(
        displayAmount(adjustmentTransactionFeeTotal.value, grandTotal.value)
      ),
      beliMin: `${safePercent(
        displayAmount(adjustmentTransactionFeeTotal.value, grandTotal.value),
        totalBuyingPriceMin.value
      )} %`,
      jualMin: `${safePercent(
        displayAmount(adjustmentTransactionFeeTotal.value, grandTotal.value),
        grandTotal.value
      )} %`,
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

const calculateSummaryaData = () => {
  const grandTotalValue = grandTotal.value;

  const grossProfit = Number(grandTotalValue) - Number(totalBuyingPrice.value);

  let fee = 0;
  let ongkir = 0;

  if (adjustmentTransactionFeeTotal.value.type == FeeType.AMOUNT) {
    fee = adjustmentTransactionFeeTotal.value.amount;
  } else if (adjustmentTransactionFeeTotal.value.type == FeeType.PERCENT) {
    fee = (grandTotalValue * adjustmentTransactionFeeTotal.value.amount) / 100;
  }
  if (adjustmentTransactionOngkirTotal.value.type == FeeType.AMOUNT) {
    ongkir = adjustmentTransactionOngkirTotal.value.amount;
  } else if (adjustmentTransactionOngkirTotal.value.type == FeeType.PERCENT) {
    ongkir =
      (grandTotalValue * adjustmentTransactionOngkirTotal.value.amount) / 100;
  }

  var tmp_gross = grossProfit;

  references.value.forEach((element) => {
    if (element.type === FeeType.PERCENT) {
      tmp_gross -= displayAmount(element, grandTotalValue);
    } else {
      tmp_gross -= element.amount;
    }
  });

  let netProfit = Number(tmp_gross) - Number(ongkir);
  summeryView.value = [];

  const data: {
    label: string;
    max: string;
    beli: string;
    jual: string;
    min: string;
    beliMin: string;
    jualMin: string;
  }[] = [
    {
      label: "Total Harga Jual",
      max: currency(grandTotalValue),
      beli: "",
      jual: "",
      min: currency(grandTotalValue),
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
      label: "Gross Profit",
      max: currency(grossProfit),
      beli: `${safePercent(grossProfit, totalBuyingPrice.value)} %`,
      jual: `${
        grandTotalValue == 0 ? 0 : safePercent(grossProfit, grandTotalValue)
      } %`,
      min: currency(0),
      beliMin: ``,
      jualMin: ``,
    },
    {
      label: "Ongkos Kirim",
      max: currency(adjustmentTransactionOngkirTotal.value?.amount ?? 0),
      beli: `${safePercent(
        adjustmentTransactionOngkirTotal.value.amount,
        totalBuyingPrice.value
      )} %`,
      jual: `${safePercent(
        adjustmentTransactionOngkirTotal.value.amount,
        grandTotalValue
      )} %`,
      min: currency(adjustmentTransactionOngkirTotal.value.amount),
      beliMin: `${safePercent(
        adjustmentTransactionOngkirTotal.value.amount,
        totalBuyingPriceMin
      )} %`,
      jualMin: `${safePercent(
        adjustmentTransactionOngkirTotal.value.amount,
        grandTotalValue
      )} %`,
    },
  ];

  references.value.forEach((element) => {
    console.log("ref", element.adjustments_transaction?.name);
    console.log("ref type", element.type);
    console.log("value", safePercent(element.amount, totalBuyingPrice.value));
    data.push({
      label: element.adjustment?.name
        ? element.adjustment?.name
        : element.adjustments_transaction?.name ?? "-",
      max: currency(displayAmount(element, grandTotalValue)),
      beli: `${safePercent(element.amount, totalBuyingPrice.value)} %`,
      jual: `${safePercent(element.amount, grandTotalValue)} %`,
      min: currency(0),
      beliMin: `${safePercent(0, 1)}`,
      jualMin: `${safePercent(displayPercentage(element, grandTotalValue), 1)}`,
    });
  });

  // const totalFeeRecive = contactsFee.value.reduce(
  //   (acc, sum) => acc + (sum.amount_nominal || 0),
  //   0
  // );

  // if (totalFeeRecive > 0) {
  //   data.push({
  //     label: "Total Penerima Fee",
  //     max: currency(totalFeeRecive),
  //     beli: `${safePercent(totalFeeRecive, totalBuyingPrice.value)} %`,
  //     jual: `${safePercent(totalFeeRecive, grandTotalValue)} %`,
  //     min: currency(0),
  //     beliMin: ``,
  //     jualMin: ``,
  //   });
  // }

  // netProfit -= totalFeeRecive;

  data.push({
    label: "Net Profit",
    max: currency(netProfit),
    beli: `${safePercent(netProfit, totalBuyingPrice.value)} %`,
    jual: `${safePercent(netProfit, grandTotalValue)} %`,
    min: currency(0),
    beliMin: ``,
    jualMin: ``,
  });

  summeryView.value = data;
};

// Lifecycle
onMounted(async () => {
  if (id.value) {
    await fetchDataEdit();
    fetchPriceTagWithItems();
  }

  // if (inquiry_id.value) {
  //   fetchInquiryDetail(inquiry_id.value);
  // }
  // fetchInquiry();
  // fetchContact();

  // remove
  // initItemCanvassing();
});
</script>

<style scoped>
:deep(.el-table__placeholder),
:deep(.el-table__indent),
:deep(.el-table__expand-icon--expanded),
:deep(.el-table__expand-icon) {
  display: none !important;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
:deep(.error-card) {
  border: 1px solid #f56c6c !important;
  box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.2);
}
:deep(.el-text) {
  margin-bottom: 2px;
}
/* :deep(.el-table__cell .cell) {
  display: flex;
  align-items: end;
} */
</style>
