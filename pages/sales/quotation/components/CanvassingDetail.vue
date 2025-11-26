<template>
  <div>
    
    <el-card class="my-3" 
      shadow="never"
      v-loading="loading"
      element-loading-text="Loading..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      element-loading-background="rgba(122, 122, 122, 0.8)"
    >
      <template #header>
        <div class="card-header flex justify-end">
          <el-button type="danger" :icon="Delete" @click="confirmDelete">Hapus</el-button>
          <NuxtLink 
            :to="`/sales/quotation/add?id=${canvassingData?.unique_id}`" 
            class="el-button el-button--primary"
          >
            <el-icon class="me-2"><Edit /></el-icon> Edit
          </NuxtLink>
          <el-button 
            type="success" 
            v-if="canvassingData?.status === CanvassingStatus.RAB"
            @click="() => dialogSelectedItem = true"
          >
            <el-icon class="me-2"><CircleCheck /></el-icon> Submit for Approval
          </el-button>
          <el-button 
            type="success" 
            v-if="canvassingData?.status === CanvassingStatus.PENDING_APPROVAL && canAccess('canvassing-approve', privilages, 2)"
            
            @click="approve"
          >
            <el-icon class="me-2"><CircleCheck /></el-icon> Approve
          </el-button>
          <el-button 
            type="danger" 
            v-if="canvassingData?.status === CanvassingStatus.PENDING_APPROVAL && canAccess('canvassing-approve', privilages, 2)"
            
            @click="decline"
          >
            <el-icon class="me-2"><CircleClose /></el-icon> Tolak
          </el-button>
          <el-button 
            type="default" 
            v-if="canvassingData?.status === CanvassingStatus.PENDING_APPROVAL"
            
            @click="dialogCancelApproval = true"
          >
            Batalkan Pengajuan
          </el-button>
          <el-button
            v-if="canvassingData?.status === CanvassingStatus.PENDING_APPROVAL_RAB && editState == false"
            type="success"
            @click="editState = true"
          >
            <el-icon class="me-2"><CircleCheck /></el-icon> Approve dan Buat RAP
          </el-button>
          
          <!-- <NuxtLink
            :href="`sales/quotation/add?id=${canvassingData.unique_id}`"
            v-if="canvassingData?.status === CanvassingStatus.PENDING_APPROVAL_RAB"
            class="el-button el-button--success"
          >
            <el-icon class="me-2"><CircleCheck /></el-icon> Approve dan Buat RAP
          </NuxtLink> -->
          <NuxtLink v-if="canvassingData?.status === CanvassingStatus.DONE && permissionCreateOffer" :href="`/sales/offer/add?canvassing_id=${canvassingData?.unique_id}`" class="el-button el-button--default">
            Buat Penawaran
          </NuxtLink>
        </div>
      </template>

      <div class="flex gap-3 my-3">
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            <el-descriptions-item label="Canvassing Code">
              {{ canvassingData?.unique_code || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="Source Document">
              {{ canvassingData?.source_document || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="Description">
              {{ canvassingData?.description || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="Status">
              <div v-if="canvassingData">
                <el-tag :type="getStatusTagType(canvassingData.status)">
                    {{ formatStatus(canvassingData.status) }}
                </el-tag>
                
              </div>
              <span v-else>-</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            <el-descriptions-item v-if="canvassingData?.source" label="Diminta Oleh">
              {{ canvassingData?.source?.request_to?.name ?? '-' }}
            </el-descriptions-item>
            <el-descriptions-item v-if="canvassingData?.source" label="PIC">
              {{ canvassingData?.source?.request_by?.name ?? '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="Pembayaran">
              {{ paymentTermView(canvassingData?.payment_term) || '-' }} {{ canvassingData?.payment_term == PaymentTerm.TEMPO ? `${canvassingData?.tempo_value} Hari` : '' }}
            </el-descriptions-item>
            
            
            <el-descriptions-item label="Catatan">
              {{ canvassingData?.note ?? '' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        
      </div>

      <el-descriptions title="Dikirim Ke">
        <el-descriptions-item label="">{{ generateResultSearchAddress(canvassingData?.address ?? null).street }}</el-descriptions-item>
      </el-descriptions>
      
    </el-card>

    <el-card class="mb-3" v-if="canvassingData && editState">
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
          <el-form-item label="Pembayaran" prop="payment_term">
            <el-select v-model="canvassingData.payment_term" placeholder="Select" style="width: 240px">
              <el-option
                v-for="item in [{value: PaymentTerm.CASH, label: 'CASH'}, {value: PaymentTerm.COD, label: 'COD'}, {value: PaymentTerm.CBD, label: 'CBD'},{value: PaymentTerm.TEMPO, label: 'TEMPO'}]"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Durasi Tempo (Hari)" prop="tempo_value" v-if="canvassingData.payment_term === PaymentTerm.TEMPO">
            <el-input-number v-model="canvassingData.tempo_value" :min="1"  />
          </el-form-item>

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

          <el-form-item v-if="address" label="Dikirim ke">
            <div>
              <div>{{ address.address_name }}</div>
              <div>{{ address.street }}, {{ generateResultSearchAddress(address).name }}</div>
            </div>
          </el-form-item>

          
          
          <el-form-item label="Deskripsi" prop="description">
            <el-input v-model="canvassingData.description" type="textarea" placeholder="Masukkan deskripsi" />
          </el-form-item>
        </el-form>
        
    </el-card>

    
    <el-card class="mb-3" shadow="never">
      <template #header>
        <div class="card-header flex justify-between items-center">
            <p>Penerima Fee</p>
        </div>
      </template>
      <div class="flex justify-between items-center mb-3">
        <el-button type="primary" :disabled="!editState" @click="addContact" >
        + Tambah Kontak
        </el-button>
        <el-radio-group v-model="feeState" :disabled="!editState" @change="(val: any) => onChangeFeeState(val)">
          <el-radio value="minus" size="large">Akumulasi</el-radio>
          <el-radio value="plus" size="large">Per Item</el-radio>
        </el-radio-group>
      </div>
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
            <el-input v-if="editState" v-model="row.party.email" placeholder="Email" />
            <div v-else-if="!editState">{{ row.party.email }}</div>
          </template>
        </el-table-column>

        <el-table-column label="No. Telepon">
          <template #default="{ row }">
            <el-input v-if="editState" v-model="row.party.phone" placeholder="Phone" />
            <div v-else-if="!editState">{{ row.party.phone }}</div>
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
                :disabled="feeState === 'plus' || !editState"
                @change="changeFeeUnit"
              >
                <el-option label="%" value="percent" />
                <el-option label="Rp" value="amount" />
              </el-select>
            </div>
          </template>
          <template #default="{ row }">
            <el-input
              v-model="row.amount"
              placeholder="Atur fee..."
              :disabled="!editState || feeState === 'plus'"
            >
            <template #append>
                {{ row.type == FeeType.PERCENT ? '%' : 'Rp' }}
            </template>
            </el-input>
          </template>
        </el-table-column>

        <el-table-column  label="Aksi" width="100">
          <template #default="{ $index }">
            <el-button
              type="danger"
              link
              @click="removeContact($index)"
            >
              Hapus
            </el-button>
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

      <div v-if="editState" class="bulk-actions mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div class="flex flex-wrap gap-4 items-end">
          <!-- Bulk Profit -->
          <div class="bulk-input-group">
            <label class="block text-sm font-medium text-gray-700 mb-1">Profit</label>
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
            <label class="block text-sm font-medium text-gray-700 mb-1">Fee</label>
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
            <label class="block text-sm font-medium text-gray-700 mb-1">Ongkir</label>
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
            <el-button 
              type="danger" 
              size="default" 
              @click="resetAllBulk"
              plain
            >
              Reset All
            </el-button>
          </div>
        </div>
      </div>

      <el-table 
        ref="tableRef"
        :data="item_canvassing" 
        row-key="index"
        @select="handleSelect"
        @select-all="handleSelectAll"
        :tree-props="{ children: 'children' }"
        :row-class-name="tableRowClassName"
        :expand-row-keys="getExpandRowKeys ?? []"
        border 
      >
      
        <el-table-column prop="item_name" label="Item" width="400" fixed="left">
          <template #default="{ row }">
           {{row.catalogue_name}}
          </template>
        </el-table-column>

        <el-table-column prop="type_item" label="Item Type" width="100" fixed="left">
          <template #default="{ row }">
            <div v-if="row.type === 'parent'">{{row.type_item == 'request' ? 'Permintaan' : 'Equivalent'}}</div>
            <div v-else></div>
          </template>
        </el-table-column>

        <el-table-column prop="status" v-if="canvassingData?.status == CanvassingStatus.PENDING_APPROVAL" label="Status" width="130" fixed="left" align="center">
          <template #default="{ row }">
            <div v-if="row.type === 'child'">
              <el-tag :type="getStatusTagTypeItem(row.status)">
                {{ getStatusTabLabelItem(row.status) }}
              </el-tag>
            </div>
            <div v-else-if="row.type === 'parent'">
              
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="sn" label="SN/PN" width="150">
          <template #default="{row}">
            {{ row.sn ?? 'N/A' }}
          </template>
        </el-table-column>
        <el-table-column prop="qty" label="Qty" width="78">
          <template #default="{ row }">
            {{ row.quantity }}
          </template>
        </el-table-column>
        <el-table-column prop="unit_name" label="UOM" width="100">
          <template #default="{row}">
            {{row.unit_name}}
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
        
        <el-table-column label="Profit" width="200">
          <template #default="{ row }">
            <div v-if="row.type === 'child'">
              <el-input v-model="row.profit" placeholder="Masukan Profit" :disabled="!editState">
                <template #append>
                  <el-select v-model="row.profit_unit" style="width: 70px" @change="handleProfitUnitChange(row)">
                    <el-option label="%" value="percent" />
                    <el-option label="Rp" value="amount" />
                  </el-select>
                </template>
              </el-input>
              <div class="text-green-500 italic">{{ row.profit_unit == 'percent' ? currency(Math.round(row.profit_nominal || 0)) : row.profit }}</div>
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
                :disabled="!editState || feeState == 'minus'"
                @click="openFeeDrawer(row)"
              >
              <template #prepend>
                <el-button :icon="Operation" :disabled="!editState" @click="openFeeDrawer(row)"></el-button>
              </template>
              <template #append>
                <el-select v-model="row.fee_unit" style="width: 70px">
                  <el-option label="%" value="percent" />
                  <el-option label="Rp" value="amount" />
                </el-select>
              </template>
              </el-input>
              <div class="text-green-500 italic">{{ row.fee_unit == 'percent' ? currency(Math.round(row.fee_nominal || 0)) : row.fee }} {{row.fee_unit}}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Ongkir" width="200">
          <template #default="{ row }">
            <div v-if="row.type === 'child'">
              <el-input v-model="row.ongkir" placeholder="Masukan ongkir":disabled="!editState" >
                <template #append>
                  {{'Rp'}}
                </template>
              </el-input>
              <div></div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Harga Jual" width="200">
          <template #default="{ row }">
            <div v-if="row.type === 'parent'">
              {{currency(row.selling_price ?? 0)}}
            </div>
            
          </template>
        </el-table-column>

        <el-table-column label="Margin (%)" width="150">
          <template #default="{ row }">
            <div v-if="row.type === 'child' && row.unit_price">
              {{ calculateMargin(row).toFixed(2) }} %
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="Subtotal" width="200">
          <template #default="{ row }">
            
            
            <div v-if="row.type === 'parent'">
              {{ currency(row.total_price) }}
            </div>
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
          <el-collapse-item v-for="vendor in pricetagList" :title="vendor.owner?.name ?? ''" :key="vendor.unique_id" :name="vendor.unique_id ?? ''">
            <div>
              <el-descriptions title="" :column="1" size="small" border>
                <el-descriptions-item label="Nomor Penawaran">
                  {{ vendor.name ?? 'N/A' }}
                </el-descriptions-item>
                <el-descriptions-item label="Keterangan">
                  {{ vendor?.note ?? 'Tidak Ada Keterangan' }}
                </el-descriptions-item>

                <el-descriptions-item v-for="file, index in vendor.files" :label="`${index == 0 ? 'Lampiran' : ''}`">
                  <div class="flex items-center justify-between">
                    <span><NuxtLink target="__blank" class="text-blue-500" :href="`${baseImageURL}${file.image_path}/${file.filename}`">{{ file.filename_original ?? 'Tidak Ada Keterangan' }}</NuxtLink></span>
                    <span><el-button link type="primary"><el-icon><Download /></el-icon></el-button></span>
                  </div>
                </el-descriptions-item>
                
              </el-descriptions>
            </div>
            
          </el-collapse-item>
          
        </el-collapse>
      </div>
    </el-card>

    <el-card class="mb-3" shadow="never">
      <template #header>
        <div class="card-header"><span>Biaya Lainya</span></div>
      </template>
      <div>
        <div class="flex justify-between items-center mb-2" v-for="ref in [...references,adjustmentTransactionOngkirTotal]">
          <div v-if="ref.adjustment_id != ''">
            <span class="font-bold text-sm">{{ref.adjustments_transaction?.name ? ref.adjustments_transaction?.name : ref.adjustment?.name ? ref.adjustment?.name : ''}}</span>
            <span class="text-sm">
              <el-input
                :disabled="!editState"
                v-model="ref.amount"
                style="max-width: 300px"
                placeholder="Masukan Nilai"
                @change="(value) => onInputAdjustment(ref)"
              >
                <template #append>
                  <el-select v-model="ref.type" :disabled="ref.changeType == false || !editState" style="width: 100px">
                    <el-option label="%" value="percent" />
                    <el-option label="Rp" value="amount" />
                  </el-select>
                </template>
              </el-input>
            </span>
          </div>
        </div>
      </div>
      
      <el-button class="mt-4" :disabled="!editState" style="width: 100%" @click="visibleModalAdjustmentTransaction = true">
        Tambah Item
      </el-button>
    </el-card>
    

    <el-card class="mb-3" shadow="never">
      <el-table :data="summeryData ?? []" style="width: 100%">
        <el-table-column label="" prop="label" fixed="left" width="250">
          <template #default="{ row }">
            <div class="font-bold">{{ row.label }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Profit Maximum" prop="max" align="right" width="150"/>
        <el-table-column width="100" label="" prop="beli" />
        <el-table-column width="100" label="" prop="jual"/>
        <el-table-column label="Profit Minimum" prop="min" align="right" width="150"/>
        <el-table-column width="100" label="" prop="beliMin"/>
        <el-table-column width="100" label="" prop="jualMin"/>
        <el-table-column v-if="canvassingData?.status == CanvassingStatus.DONE || canvassingData?.status == CanvassingStatus.PENDING_APPROVAL" label="Profit Diajukan" prop="selected" align="right" width="150"/>
        <el-table-column v-if="canvassingData?.status == CanvassingStatus.DONE || canvassingData?.status == CanvassingStatus.PENDING_APPROVAL" width="100" label="" prop="selectedBeli"/>
        <el-table-column v-if="canvassingData?.status == CanvassingStatus.DONE || canvassingData?.status == CanvassingStatus.PENDING_APPROVAL" width="100" label="" prop="selectedJual"/>
      </el-table>
    </el-card>

    <el-dialog v-model="visibleApproveDialog" title="Approve Canvasing!" width="500">
      <el-form :model="canvassingData!" :label-position="formApproveLabel">
        <el-form-item label="Catatan" prop="note">
          <el-input v-model="canvassingData!.note" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="visibleApproveDialog = false">Cancel</el-button>
          <el-button type="primary" @click="submitApprove">
            Approve
          </el-button>
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
          <el-button type="primary" @click="submitDecline">
            Tolak
          </el-button>
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
        style="border:none;"
      ></iframe>

      <template #footer>
        <el-button @click="showPreview = false">Tutup</el-button>
        <el-button type="success" @click="() => {}">Download PDF</el-button>
      </template>
    </el-dialog>
    <FeeDrawer
      v-model="drawerFeeVisible"
      :item="selectedItemDrawer"
      :contacts="contactsFeeToEdit"
      :adjustment="adjustmentContact!"
      @save="handleSaveFee"
    />

    <transition name="el-fade-in">
      <div 
        v-if="editState" 
        class="floating-save-container"
      >
        <div class="floating-save-actions">
          <el-button 
            type="default" 
            size="default"
            @click="() => editState = false"
            class="mr-3"
          >
            Batal
          </el-button>
          <el-button 
            type="success" 
            size="default"
            @click="() => submitRAB(ruleFormRef)"
            :loading="loading"
          >
            <el-icon class="me-2"><CircleCheck /></el-icon>
            Simpan dan Lanjutkan
          </el-button>
        </div>
      </div>
    </transition>

    <el-dialog v-model="dialogSelectedItem" title="Pilih Item Yang Akan Diajukan!" width="1200">
      <el-table 
        ref="tableRef"
        :data="item_canvassing" 
        row-key="index"
        @select="handleSelect"
        @select-all="handleSelectAll"
        :tree-props="{ children: 'children' }"
        :row-class-name="tableRowClassName"
        :expand-row-keys="getExpandRowKeys ?? []"
        border 
      >
      
        <el-table-column prop="item_name" label="Item" width="400" fixed="left">
          <template #default="{ row }">
           {{row.catalogue_name}}
          </template>
        </el-table-column>

        <el-table-column prop="type_item" label="Item Type" width="100" fixed="left">
          <template #default="{ row }">
            <div v-if="row.type === 'parent'">{{row.type_item == 'request' ? 'Permintaan' : 'Equivalent'}}</div>
            <div v-else></div>
          </template>
        </el-table-column>
        
        <el-table-column prop="sn" label="SN/PN" width="150">
          <template #default="{row}">
            {{ row.sn ?? 'N/A' }}
          </template>
        </el-table-column>
        <el-table-column prop="qty" label="Qty" width="78">
          <template #default="{ row }">
            {{ row.quantity }}
          </template>
        </el-table-column>
        <el-table-column prop="unit_name" label="UOM" width="100">
          <template #default="{row}">
            {{row.unit_name}}
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
        
        <el-table-column label="Profit" width="200">
          <template #default="{ row }">
            <div v-if="row.type === 'child'">
              <div class="text-green-500 italic">{{ row.profit_unit == 'percent' ? currency(Math.round(row.profit_nominal || 0)) : row.profit }} ({{ row.profit }}%)</div>
            </div>
            
          </template>
        </el-table-column>
        <el-table-column label="Fee" width="200">
          <template #default="{ row }">
            <div v-if="row.type === 'child'">
              <div class="text-green-500 italic">{{ row.fee_unit == 'percent' ? currency(Math.round(row.fee_nominal || 0)) : row.fee }} ({{row.fee}}%)</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Ongkir" width="200">
          <template #default="{ row }">
            <div v-if="row.type === 'child'">
              {{currency(row.ongkir)}}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Harga Jual" width="200">
          <template #default="{ row }">
            <div v-if="row.type === 'parent'">
              {{currency(row.selling_price ?? 0)}}
            </div>
            
          </template>
        </el-table-column>

        <el-table-column label="Margin (%)" width="150">
          <template #default="{ row }">
            <div v-if="row.type === 'child' && row.unit_price">
              {{ calculateMargin(row!).toFixed(2) }} %
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="Subtotal" width="200">
          <template #default="{ row }">
            
            
            <div v-if="row.type === 'parent'">
              {{ currency(row.total_price) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column type="selection" width="55" :selectable="(row: any, index: any) => selectableCheckbox(row, index)" />
      </el-table>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogSelectedItem = false">Cancel</el-button>
          <el-button type="primary" @click="submitApproveRab">
            Simpan dan Ajukan
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="dialogNewAddress" title="Create New Address" width="500">
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

    <el-dialog v-model="visibleModalNewAdjustment" title="Buat Biaya Lain" width="1000">
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
          <el-button @click="dialogCancelApproval = false">Batal</el-button>
          <el-button type="primary" @click="cancelSubmissionApproval">
            Confirm
          </el-button>
        </div>
      </template>
    </el-dialog>
</div>
</template>

<script lang="ts" setup>

const props = defineProps<{
  canvassingData: Canvassing,
  privilages: Permission[],
}>()

import { Delete, Edit, CircleCheck, CircleClose, ArrowDown, Operation, Download } from '@element-plus/icons-vue'
import { CanvassingStatus, CanvassingVendorStatus, PaymentTerm, paymentTermView } from '~/types/scm/canvasing'
import type { Canvassing, CanvassingItem, CanvassingItemForm, CanvassingItemVendorSummery, CanvassingVendor } from '~/types/scm/canvasing'
import type { BaseResponse } from '~/types/response';
import type { ItemRequest, ItemRequestTrail } from '~/types/item_request';
import type { ElTable, FormInstance, FormProps, FormRules } from 'element-plus';
import { FeeType, PartyType, ReferenceAdjustment, type AdjustmentTransaction, type ReferenceTransactionAdjustment } from '~/types/attribute_adjustment';
import { OrderColumn, type RequestSearch } from '~/types/request_search';
import type { ResponsePagination } from '~/types/response_pagination';
import type { Contact } from '~/types/contact';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { OperationPriceTag, ReferencePriceTag, VariablePriceTag, type Pricetag, type Pricetag_item } from '~/types/pricetag';
import FeeDrawer from '~/components/trums/FeeDrawer.vue'
import type { AddressType } from '~/types/address';
import ModalAdjustmentTransaction from '~/components/trums/ModalAdjustmentTransaction.vue'
import AddAdjustment from '~/components/trums/AddAdjustment.vue'
import type { Permission } from '~/types/menu';

definePageMeta({
  middleware: ["auth", "app"],
  name: "Quotation component",
});

const router = useRouter()
const route = useRoute()
const canvassingId = ref<string>(route.params.id as string)

const { removeDuplicates } = useArray();

const selectedVendors = ref<Record<string, string>>({})

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
`

const dialogCancelApproval = ref(false);
const dialogNewAddress = ref(false)
const dialogSelectedItem = ref<boolean>(false);
const loading = ref(false)
const editState = ref<boolean>(false)
const editStateFee = ref<boolean>(false)
const visibleModalAdjustmentTransaction = ref(false)
const visibleModalNewAdjustment = ref(false)
const canvassingData = ref<Canvassing | null>(props.canvassingData)
const pricetags = ref<Pricetag[]>([])
const itemDialogVisible = ref(false)
const selectedItem = ref<CanvassingItem | null>(null)
const visibleApproveDialog = ref<boolean>(false);
const visibleDeclineDialog = ref<boolean>(false);
const drawerFeeVisible = ref(false)
const formApproveLabel = ref<FormProps['labelPosition']>('top')
const contactsFee = ref<ReferenceTransactionAdjustment[]>([]);
const itemIndex = ref<string>('')
const selectedItemDrawer = ref<{index: string,name: string, vendor_name: string}>({
  index: '',
  name: '',
  vendor_name: '',
})
const contactsFeeToEdit = ref<ReferenceTransactionAdjustment[]>([]);
const selectedChildren = ref<CanvassingItemForm[]>([])
const showPreview = ref(false)
const pdfUrl = ref<string | null>(null)

const feeState = ref<string>('minus');
const ongkirState = ref<string>('minus');
const unitFee = ref<FeeType>(FeeType.PERCENT);

const item_canvassing = ref<CanvassingItemForm[]>([]);

const references = ref<ReferenceTransactionAdjustment[]>([]);

const tableRef = ref<InstanceType<typeof ElTable>>()

const activeCollapseVendor = ref<string[]>([''])

const address = ref<AddressType>();

const config = useRuntimeConfig();
const baseImageURL = config.public.baseImageURL;

const ruleFormRef = ref<FormInstance>()
const bulkProfit = ref('')
const bulkProfitUnit = ref('percent')
const bulkFee = ref('')
const bulkFeeUnit = ref('percent')
const bulkOngkir = ref('')

const availableStatuses = [
  CanvassingStatus.DRAFT,
  CanvassingStatus.PENDING_APPROVAL,
  CanvassingStatus.CANCEL
]

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
})

const request_search_contact = ref<RequestSearch>({
  column: [],
  keyword: '',
  limit: '10',
  offset: '1',
  sort: null,
  table: 'contacts',
  flag: "form",
})
const request_search_pricetag_item = ref<RequestSearch>({
  column: [
    {
      unique_id: [],
    }
  ],
  keyword: '',
  limit: '10',
  offset: '1',
  sort: null,
  table: 'pricetag_item',
  flag: "form",
})

const permissionCreateOffer = false;

const rules: FormRules = {
  source_document: [
    { required: true, message: 'Nomor referensi wajib diisi', trigger: 'blur' }
  ],
  status: [
    { required: true, message: 'Status wajib dipilih', trigger: 'change' }
  ],
  address_view: [
    { required: true, message: 'Pengiriman wajib dipilih', trigger: 'change' }
  ],
  payment_term: [
    { required: true, message: 'Pembayaran wajib dipilih', trigger: 'change' }
  ],
  
}

const adjustmentTransactions = await useFetchApi<ResponsePagination<AdjustmentTransaction[]>>(
  '/search', 
  'search-adjustment', 
  'post', 
  querySearchAdjustmentTransaction
)



const pricetagList = computed(() => {
  const list = removeDuplicates<Pricetag>(pricetags.value, 'unique_id');
  return list;
})

const adjustmentContact = computed(() => {
  const data = adjustmentTransactions.data.value?.data || []
  return data.find((value: AdjustmentTransaction) => 
    value.name?.toLowerCase().includes('fee') && value.operator === feeState.value
  )
})

const adjustmentOngkir = computed(() => {
  
  const data = adjustmentTransactions.data.value?.data || []
  
  return data.find((value: AdjustmentTransaction) => 
    value.name?.toLowerCase().includes('ongkos kirim') && value.operator === ongkirState.value
  )
})

const adjustmentTransactionOngkirTotal = ref<ReferenceTransactionAdjustment>({
    unique_id: '',
    reference: ReferenceAdjustment.CANVASSING,
    reference_id: '',
    adjustment_id: `${adjustmentOngkir.value?.unique_id}`,
    adjustment: adjustmentOngkir.value,
    value: null,
    type: FeeType.AMOUNT,
    amount: 0,
    created_at: 0,
    changeType: false,
});

const handleAdjustmentSubmit = () => {
  visibleModalNewAdjustment.value = false
  refreshNuxtData('search-adjustment')
}

watch(() =>contactsFee.value, () => {
  adjustmentTransactionFeeTotal.value.amount = contactsFee.value.reduce((sum, c) => Number(sum) + Number((c.amount || 0)), 0);
}, {deep: true})


const changeDiscount = (vendor: CanvassingItemVendorSummery|null, price: number) => {
  if(vendor){
    if(vendor.discount_unit == 'percent'){
      return `${vendor.discount_value}%`;
    }else{
      return `${(vendor.discount_value / price) * 100}%`;
    }
  }else{
    return 0;
  }
}

const selectableCheckbox = (row: CanvassingItemForm, index: number) => {
  return canvassingData.value?.status != CanvassingStatus.PENDING_APPROVAL ? row.type === 'child' ? true : false : false;
}

const openFeeDrawer = (item: CanvassingItemForm) => {

  itemIndex.value = item.index;
  contactsFeeToEdit.value = [...item.contacts_fee];

  selectedItemDrawer.value = {
    index: item.index,
    vendor_name: item.vendor_name ?? '',
    name: item.catalogue_name,
  }

  
  drawerFeeVisible.value = true
}

const onInputAdjustment = (row:ReferenceTransactionAdjustment) => {
  if(row.adjustment?.name.toLowerCase() == 'ongkos kirim'){
    ongChangeGlobalDeliveryFee();
  }
}

const ongChangeGlobalDeliveryFee = () => {
  item_canvassing.value.forEach(element => {
    element.children.forEach(child => {
      child.ongkir = 0;
    });

    setProfit(element);
  });

  
}

const displayAmount = (ref: any, multiplier: number) => {
  
  if(ref !== undefined){
    if (ref.type === "percent") {
      return (multiplier || 0) * (ref.amount / 100)
    }
    return ref.amount
  }else{
    return 0;
  }
}

const displayPercentage = (ref: any, multiplier: number) => {
  if (ref.type === "amount") {
    return (ref.amount / multiplier)||0 * 100
  }
  return ref.amount
}

const onChangeFeeState = (val: string) => {
  contactsFee.value.forEach((value) => {
    value.amount = 0;
    value.type = val == 'plus' ? FeeType.AMOUNT : FeeType.PERCENT;
  })

  item_canvassing.value.forEach((value) => {
    value.children.forEach(child => {
      child.contacts_fee.forEach((fee) => fee.amount = 0);
      calculateSellingPrice(child)
      child.fee = 0;
      console.log('child fee', child)
    });

    value.fee = 0;
  })

  unitFee.value = val == 'plus' ? FeeType.AMOUNT : FeeType.PERCENT;
}


const handleSaveFee = ({ item, contacts, fee }: {item: { index: string; name: string; vendor_name: string };
  contacts: ReferenceTransactionAdjustment[];
  fee?: number}) => {
    
  const cleanContacts = JSON.parse(JSON.stringify(contacts));
  updateItemFee(item_canvassing.value, itemIndex.value,cleanContacts, (fee ?? 0));

  
  syncFeeAcumulation();

  item_canvassing.value.forEach(element => {
    setProfit(element)
  });
  
}

const syncFeeAcumulation = () => {
    

    if(feeState.value == 'plus'){
      contactsFee.value.forEach((value) => value.amount = 0);
      const newContactFee: ReferenceTransactionAdjustment[] = JSON.parse(JSON.stringify(contactsFee.value));
      item_canvassing.value.forEach((item) => {
        const selling_price = Number(item.selling_price || 0);

        item.children.forEach((child) => {
          const hargaBeli = Number(child.unit_price || 0);

          let ongkirNominal = child.ongkir;

          

          child.contacts_fee.forEach(contact => {
            const selisih = selling_price - hargaBeli - ongkirNominal;

            let profit = 100;
            let fee = 0;

            if(contact.type == 'percent'){
              fee = Number(contact.amount);
            }else{
              fee = Number(contact.amount) / hargaBeli * 100;
            }

            console.log('fee ', contact);


            if(child.profit_unit == 'amount'){
              profit = Number(child.profit) / hargaBeli * 100;
            }
            


            let profitAndFee = profit + fee;

            
            // contact.amount = fee;
            contact.amount_nominal = selisih * fee / profitAndFee;
            


            const findContactFee = newContactFee.findIndex((fee) => fee.party_id == contact.party_id);

            
            if(findContactFee >= 0){
              if(unitFee.value == FeeType.AMOUNT){
                newContactFee[findContactFee].amount += Number(contact.amount_nominal);
              }else{
                newContactFee[findContactFee].amount += Number(contact.amount);
              }
              newContactFee[findContactFee].amount = Math.round(newContactFee[findContactFee].amount);

              
            }
          });
        })
      })
      contactsFee.value = newContactFee;
    }
    

}

function updateItemFee(items: CanvassingItemForm[], index: string, contacts?: ReferenceTransactionAdjustment[], fee?: number) {
  
  for (const it of items) {
    if (it.index === index && it.type === 'child') {
      
      if(contacts){
        
        it.fee = contacts.reduce((sum, c) => sum + (c.amount || 0), 0);
        it.contacts_fee = contacts;
      }else{
        it.fee = fee ?? 0;
      }
    }else if(it.type === 'child'){
      
      if(contacts){
        if(it.contacts_fee.length > 0){

          const contactNotExist:ReferenceTransactionAdjustment[] = [];

          contacts.forEach(element => {
            // console.log()
            const findIndex = (it.contacts_fee ?? []).findIndex((c) => c.party_id == element.party_id);
            
            if(findIndex < 0){
              contactNotExist.push({...element, amount: 0, value: 0});
            }
          });
          
          console.log('contact fee exits', it.contacts_fee);
          console.log('contact not exits', contactNotExist);

          it.contacts_fee = [...it.contacts_fee, ...contactNotExist];


        }else{
          it.contacts_fee = contacts.map((value) => ({...value, amount: 0, value: 0}));
          
        }

        
      }
        
    }


    
    if(it.type == 'parent'){
      
      // setProfit(it);
    }

    if (it.children.length > 0) {
      updateItemFee(it.children, index, contacts, fee)
    }
  }

  
  
}

const removeContact = (index: number) => {
  contactsFee.value.splice(index, 1)
}

const hasBulkInput = computed(() => {
  return bulkProfit.value !== '' || bulkFee.value !== '' || bulkOngkir.value !== ''
})


const changeFeeUnitContacts = (row: CanvassingItemForm) => {
  row.contacts_fee.forEach(element => {
    element.type = row.fee_unit as FeeType;
  });
}

const handleSelectAdjustment = (items: AdjustmentTransaction[]) => {
  items.forEach(element => {
    references.value.push({
      unique_id: '',
      reference: ReferenceAdjustment.CANVASSING,
      reference_id: '',
      adjustment_id: element.unique_id,
      type: element.type,
      amount: element.default_value,
      created_at: 0,
      value: element.default_value,
      adjustment: element,
      changeType: true,
    })
  })
  visibleModalAdjustmentTransaction.value = false
}

const changeFeeUnit = (val: any) => {
  contactsFee.value.forEach(element => {
    element.type = val as FeeType;
  });
}

const applyAllBulk = () => {
  item_canvassing.value.forEach(item => {
    if (item.children && item.children.length) {
      item.children.forEach(child => {
        if (child.type === 'child') {
          // Apply profit jika diisi
          if (bulkProfit.value !== '') {
            child.profit = parseInt(bulkProfit.value)
            child.profit_unit = bulkProfitUnit.value as "amount"|"percent";
            child.profit_nominal = child.unit_price * (child.profit / 100)
          }
          
          // Apply fee jika diisi
          if (bulkFee.value !== '' && feeState.value !== 'minus') {
            child.fee = parseInt(bulkFee.value)
            child.fee_unit = bulkFeeUnit.value as "amount"|"percent";
            child.fee_nominal = (child.fee / 100) * child.profit;
            changeFeeUnitContacts(child)
          }else{
            
            // if(child.fee == ''){
            //   child.fee = 0;
            //   child.fee_unit = bulkFeeUnit.value as "amount"|"percent";
            //   child.fee_nominal = 0;
            // }
          }
          
          // Apply ongkir jika diisi
          if (bulkOngkir.value !== '') {
            child.ongkir = parseInt(bulkOngkir.value);
          }
          
          // Recalculate selling price
          calculateSellingPrice(child)

          
        }
      })

    }
  })

  item_canvassing.value.forEach(item => {
    setProfit(item);
  });

  
  
  // Show success message
  ElMessage.success('Berhasil menerapkan semua setting ke semua item')
}

const resetAllBulk = () => {
  // Reset bulk input fields
  bulkProfit.value = ''
  bulkFee.value = ''
  bulkOngkir.value = ''
  bulkProfitUnit.value = 'percent'
  bulkFeeUnit.value = 'percent'
  
  // Reset all items
  item_canvassing.value.forEach(item => {
    if (item.children && item.children.length) {
      item.children.forEach(child => {
        if (child.type === 'child') {
          child.profit = 0;
          child.fee = 0;
          child.ongkir = 0;
          child.profit_unit = 'percent'
          child.fee_unit = 'percent'
          child.selling_price = child.unit_price || 0
        }
      })
    }
  })
  
  ElMessage.info('Semua setting telah direset')
}

const calculateSellingPrice = (row: CanvassingItemForm) => {
  let basePrice = Number(row.unit_price || 0);
  

  // let sellingPrice = Number(basePrice);
  let profitAmount = Number(row.profit_nominal);
  let feeAmount = Number(row.fee_nominal);
  let ongkir = Number(row.ongkir || 0);

  // Update harga jual
  row.selling_price = basePrice + profitAmount + feeAmount + ongkir;

  
  
  if(feeState.value === 'plus'){
    // accumulateFee();
  }
  accumulateOngkir();


  if(row.type == 'child'){
    const parent = findParent(item_canvassing.value, row.index);
    if(parent){
      let selling_price = 0;
      parent.children.forEach(element => {
        if(element.selling_price > selling_price){
          selling_price = element.selling_price;
        }
      });

      parent.selling_price = selling_price;
      parent.total_price = Number(selling_price) * Number(parent.quantity);
    }
  }
}

const accumulateOngkir = () => {
  let ongkirAmount = 0;
  
  item_canvassing.value.forEach(element => {
      element.children.forEach(childs => {
        ongkirAmount += Number(childs.ongkir) * Number(childs.quantity);
      });
  });

  if(ongkirAmount > 0){
    adjustmentTransactionOngkirTotal.value.amount = ongkirAmount;
  }
}

function findParent(tree: CanvassingItemForm[], index: string): CanvassingItemForm|null {
  for (const node of tree) {
    // if (node.index === index) return node;
    // if (node.children) {
    //   const found = findParent(node.children, index);
    //   if (found) return found;
    // }

    let find = findChildIndex(node.children, index);
    
    if(find >= 0){
      return node;
    }

  }
  return null;
}

function findChildIndex(tree: CanvassingItemForm[], key: string): number {
  let index = 0;
  for (const node of tree) {
    if(node.index === key){
      return index;
    }

    index++;
  }
  return -1;
}

const addContact = () => {
  
  contactsFee.value.push({
      unique_id: '',
      reference: ReferenceAdjustment.CANVASSING,
      reference_id: '',
      adjustment_id: `${adjustmentContact.value?.unique_id}`,
      adjustment: adjustmentContact.value,
      value: null,
      type: FeeType.PERCENT,
      amount: 0,
      created_at: 0,
      changeType: true,
      party: {
        id: 0,
        unique_id: '',
        unique_code: '',
        is_personal: false,
        is_company: false,
        internal_id: '',
        name: '',
        email: '',
        phone: '',
        tax_id: '',
        website: '',
        title: '',
        tags: '',
        created_at: 0,
        created_by: '',
        updated_at: 0,
        version: 0,
        address: [],
      }
    
  })
}

async function getBase64ImageFromUrl(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

const generateQuotationPdf = async (items: CanvassingItem[]) => {
  const doc = new jsPDF()
  const today = new Date()
  const formatted = today.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  })

  // Logo
  const imgLogo = await getBase64ImageFromUrl("/images/trumecs-logo.png") // path logo (public/logo.png)
  const tmsLogo = await getBase64ImageFromUrl("/images/tms-logo.png") // path logo (public/logo.png)
  doc.addImage(imgLogo, "PNG", 160, 10, 40, 20)
  doc.addImage(tmsLogo, "PNG", 10, 10, 40, 20)

  // Header
  doc.setFontSize(18)
  doc.text("Quotation", 105, 20, { align: "center" })

  // Info
  doc.setFontSize(11)
  doc.text(`Number: ${canvassingData.value?.unique_code}`, 10, 40)
  doc.text(`Subject: -`, 10, 46)
  doc.text(`Jakarta, ${formatted}`, 160, 40)

  doc.text(`To: ${canvassingData.value?.source?.request_by?.name}`, 10, 60)
  doc.text(`PIC: ${canvassingData.value?.source?.request_by?.name}`, 10, 66)

  // Body text
  doc.text("Bersama ini kami kirimkan penawaran sebagai berikut:", 10, 80)

  // Table
  autoTable(doc, {
    startY: 90,
    head: [["No", "Item", "Qty", "Unit", "Price", "Total"]],
    body: items.map((item: CanvassingItem, i: number) => [
      i + 1,
      item.catalogue?.name ?? '',
      item.quantity,
      item.unit_name,
      `${currency(item.unit_selling_price || 0)}`,
      `${currency(item.quantity * (item.unit_selling_price || 0))}`
    ]),
    styles: { fontSize: 10 },
    margin: { left: 10 },
    headStyles: { fillColor: [200, 200, 200] }
  })

  // // Summary
  let finalY = (doc as any).lastAutoTable.finalY + 10
  // doc.text(`Total Price: Rp ${currency(grandTotal.value)}`, 140, finalY)

  // finalY += 10
  // doc.text(`Grand Total: Rp ${currency(grandTotal.value)}`, 140, finalY)

  // Notes
  doc.text("Notes:", 10, finalY + 20)
  doc.text(`${canvassingData.value?.description ?? '-'}`, 20, finalY + 30)
  
  

  // Signature
  doc.text("Best Regards,", 10, finalY + 60)
  doc.text("Stanislaus Adrian Pratama,", 10, finalY + 90)
  doc.text("Operation Manager", 10, finalY + 100)

  return doc
}



const generateResultSearchAddress = (address: AddressType|null) => {
    if(address){
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
      }
    }else{
      return {
          value: '',
          name: '',
          street: '',
          address_id: '',
          address_version: 0,
          address: null,
      }
    }
}

const querySearchAddress = (queryString: string, cb: (arg: any) => void) => {
    const newSearch = {...request_search_contact.value}
    newSearch.keyword = queryString;
    newSearch.table = 'address';
    newSearch.column = [
      // {
      //   contact_id: [ruleForm.request_by, ruleForm.to_unique_id]
      // }
    ];
    newSearch.limit = "10";
    newSearch.offset = "1";
    newSearch.flag = "form";

    
    useFetchApi<ResponsePagination<AddressType[]>>('/search', 'address', 'post', newSearch).then((response) => {
        if(response.status.value == 'success'){
            
            const resultApi: AddressType[]  = response.data.value?.data!;
            
            if(resultApi.length > 0){

                cb(resultApi.map(generateResultSearchAddress));
            }else{
                cb([{value: `Buat Alamat Baru`, new: true, name: `Buat Alamat Baru`, street: ''}]);
            }
        }
    })

}

const handleSelectAddress = (record: Record<string, any>) => {
    if(record.new){
        dialogNewAddress.value = true;
    }else{
        console.log(record);
        
        address.value = record.address as AddressType;
        canvassingData.value!.address_id = record.address_id;
        canvassingData.value!.address_version = record.address_version;
        canvassingData.value!.address_view = record.name;

    }
}

const onAddNewAddress = (address: AddressType) => {
  canvassingData.value!.address_id = address.unique_id;
  canvassingData.value!.address_view = address.address_name;
  canvassingData.value!.address_version = address.version || 1;
  dialogNewAddress.value = false
}

const handleProfitUnitChange = (row: CanvassingItemForm) => {
  const cost = Number(row.unit_price) || 0
  let profit = Number(row.profit) || 0

  if (row.profit_unit === 'percent') {
    // sebelumnya dalam nominal → ubah ke persen
    row.profit = cost > 0 ? (profit / cost) * 100 : 0
  } else if (row.profit_unit === 'amount') {
    // sebelumnya dalam persen → ubah ke nominal
    row.profit = cost * (profit / 100)
  }

  
}

const grandTotal = computed(() => {
  
  return item_canvassing.value.reduce((acc, row: CanvassingItemForm) => {
    if (row.type === "parent") {
      acc += Number((row.total_price || 0))
    }
    
    
    return acc
  }, 0)
})

const totalBuyingPrice = computed(() => {
  
  let total = 0;
  
  item_canvassing.value.forEach(element => {
    if(element.children.length > 0){
      let dataMin = (element.children).reduce((max, data) => data.total_price < max.total_price ? data : max);

      total += Number(dataMin.total_price);
    }
  });

  return total;
})
const totalBuyingPriceSelected = computed(() => {
  
  let total = 0;
  
  item_canvassing.value.forEach(element => {
    if(element.children.length > 0){
      let dataMin = (element.children).reduce((max, data) => {
                      if (data.status !== CanvassingVendorStatus.SUBMITTED && data.status !== CanvassingVendorStatus.SELECTED) {
                        return max;
                      }
                      return data.total_price < max.total_price ? data : max;
                    });

      total += Number(dataMin.total_price);
    }
  });

  return total;
})

const totalBuyingPriceMin = computed(() => {
  
  let total = 0;

  item_canvassing.value.forEach(element => {
    if(element.children.length > 0){
      let dataMin = (element.children).reduce((max, data) => data.unit_price > max.unit_price ? data : max);
  
      total += Number(dataMin.unit_price) * Number(element.quantity);
    }
  });

  return total;

})

const adjustmentTransactionFeeTotal = ref<ReferenceTransactionAdjustment>({
      unique_id: '',
      reference: ReferenceAdjustment.CANVASSING,
      reference_id: '',
      adjustment_id: `${adjustmentContact.value?.unique_id}`,
      adjustment: adjustmentContact.value,
      adjustments_transaction: adjustmentContact.value,
      value: null,
      type: unitFee.value,
      amount: 0,
      created_at: 0,
});


const netProfitForBuying = computed(() => {

  let fee = 0;

  

  if(adjustmentTransactionFeeTotal.value){
    if(adjustmentTransactionFeeTotal.value.type == FeeType.AMOUNT){
      fee = adjustmentTransactionFeeTotal.value.amount;
    }else if(adjustmentTransactionFeeTotal.value.type == FeeType.PERCENT){
      fee = (grandTotal.value * adjustmentTransactionFeeTotal.value.amount / 100)
    }

  }

  
  return Number(totalForGrossProfitForBuying.value || 0) - Number(fee || 0);
  
})
const netProfitForBuyingSelected = computed(() => {

  let fee = 0;

  

  if(adjustmentTransactionFeeTotal.value){
    if(adjustmentTransactionFeeTotal.value.type == FeeType.AMOUNT){
      fee = adjustmentTransactionFeeTotal.value.amount;
    }else if(adjustmentTransactionFeeTotal.value.type == FeeType.PERCENT){
      fee = (grandTotal.value * adjustmentTransactionFeeTotal.value.amount / 100)
    }

  }

  
  return Number(totalForGrossProfitForBuyingSelected.value || 0) - Number(fee || 0);
  
})

const getAnotherFee = computed(() => {
  return canvassingData.value?.reference_transaction?.filter((value) => value.adjustments_transaction?.name.toLowerCase() != 'fee' && value.adjustments_transaction?.name.toLowerCase() != 'ongkos kirim');
})

const grossProfit = computed(() => {
  return Number(grandTotal.value) - Number(totalBuyingPrice.value);
})

const grossProfitSelected = computed(() => {
  return Number(grandTotal.value) - Number(totalBuyingPriceSelected.value);
})

const totalForGrossProfitForBuyingMin = computed(() => {
  let gross = Number(grossProfitMin.value);

  gross -= Number(adjustmentTransactionOngkirTotal.value?.amount ?? 0);

  references.value.forEach(element => {
    if(element.type === FeeType.PERCENT){
      gross -= ((element.amount / totalBuyingPriceMin.value) * 100) 
    }else{
      gross -= element.amount;
    }
    
  });

  return gross;
})

const totalForGrossProfitForBuyingSelected = computed(() => {
  let gross = Number(grossProfitSelected.value);

  gross -= Number(adjustmentTransactionOngkirTotal.value?.amount ?? 0);

  references.value.forEach(element => {
    if(element.type === FeeType.PERCENT){
      gross -= ((element.amount / totalBuyingPriceSelected.value) * 100) 
    }else{
      gross -= element.amount;
    }
    
  });

  return gross;
})

const netProfitForBuyingMin = computed(() => {
  if(adjustmentTransactionFeeTotal.value){
  let fee = 0;
    
    if(adjustmentTransactionFeeTotal.value.type == FeeType.AMOUNT){
      fee = adjustmentTransactionFeeTotal.value.amount;
    }else if(adjustmentTransactionFeeTotal.value.type == FeeType.PERCENT){
      fee = (grandTotal.value * adjustmentTransactionFeeTotal.value.amount / 100)
    }
    return Number(totalForGrossProfitForBuyingMin.value || 0) - Number(fee || 0);
  }else{
    return Number(totalForGrossProfitForBuyingMin.value || 0) - Number(0);
  }
  
})
const grossProfitMin = computed(() => {
  return Number(grandTotal.value) - Number(totalBuyingPriceMin.value);
})

const totalForGrossProfitForBuying = computed(() => {
  let gross = Number(grossProfit.value);

  if(adjustmentTransactionOngkirTotal.value){
    gross -= Number(adjustmentTransactionOngkirTotal.value.amount);
  }

  

  if(getAnotherFee.value){
    getAnotherFee.value.forEach(element => {
      if(element.type === FeeType.PERCENT){
        gross -= ((element.amount / totalBuyingPrice.value) * 100) 
      }else{
        gross -= element.amount;
      }
      
    });
  }

  return gross;
})

const goBack = () => router.back()

const getExpandRowKeys = computed(() => {
  const rowKeys = item_canvassing.value
  .filter(value => value.children && value.children.length > 0)
  .map(value => value.index)

  return rowKeys;
})

const setProfit = (row: CanvassingItemForm) => {
  const selling_price = Number(row.selling_price || 0);
  
  if(row.type == 'parent'){
    row.children.forEach((child) => {
      
      const hargaBeli = Number(child.unit_price || 0);

      let ongkirNominal = child.ongkir_unit === 'percent'
      ? (hargaBeli * child.ongkir) / 100
      : Number(child.ongkir) || 0

      
      
      const selisih = selling_price - hargaBeli - ongkirNominal;

      // ganti 100
      let profit = 100;
      let fee = 0;

      if(child.fee_unit == 'percent'){
        fee = Number(child.fee);
      }else{
        
        fee = Number(child.fee) / hargaBeli * 100;
      }


      if(child.profit_unit == 'amount'){
        profit = Number(child.profit) / hargaBeli * 100;
      }

      

      let profitAndFee = profit + fee;
      
      child.fee = fee;
      child.fee_nominal = (selisih * fee / profitAndFee) < 0 ? 0 : (selisih * fee / profitAndFee);

      child.profit_nominal = (selisih < 0 ? 0 : selisih) * profit / profitAndFee;

      
      
      child.profit = Number((child.profit_nominal / hargaBeli * 100).toFixed(2));


      
    })
  }

  
}

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
        selected: currency(totalBuyingPriceSelected.value),
      },
      {
        label: "Gross Profit",
        max: currency(grossProfit.value),
        beli: `${safePercent(grossProfit.value, totalBuyingPrice.value)} %`,
        jual: `${grandTotal.value == 0 ? 0 : safePercent(grossProfit.value, grandTotal.value)} %`,
        min: currency(grossProfitMin.value),
        beliMin: `${safePercent(grossProfit.value, totalBuyingPriceMin.value)} %`,
        jualMin: `${grandTotal.value == 0 ? 0 : safePercent(grossProfitMin.value, grandTotal.value)} %`,
        selected: currency(grossProfitSelected.value),
        selectedBeli: `${safePercent(grossProfitSelected.value, totalBuyingPriceSelected.value)} %`,
        selectedJual: `${grandTotal.value == 0 ? 0 : safePercent(grossProfitSelected.value, grandTotal.value)} %`,
      },
      
    ];

    if(adjustmentTransactionOngkirTotal.value.adjustment_id != ''){
      tableData.push({
        label: "Ongkos Kirim",
        max: currency(adjustmentTransactionOngkirTotal.value?.amount ?? 0),
        beli: `${safePercent(adjustmentTransactionOngkirTotal.value?.amount ?? 0, totalBuyingPrice.value)} %`,
        jual: `${safePercent(adjustmentTransactionOngkirTotal.value?.amount ?? 0, grandTotal.value)} %`,
        min: currency(adjustmentTransactionOngkirTotal.value?.amount ?? 0),
        beliMin: `${safePercent(adjustmentTransactionOngkirTotal.value?.amount ?? 0, totalBuyingPriceMin.value)} %`,
        jualMax: `${safePercent(adjustmentTransactionOngkirTotal.value?.amount ?? 0, grandTotal.value)} %`,
        selected: currency(adjustmentTransactionOngkirTotal.value?.amount ?? 0),
        selectedBeli: `${safePercent(adjustmentTransactionOngkirTotal.value?.amount ?? 0, totalBuyingPriceSelected.value)} %`,
        selectedJual: `${safePercent(adjustmentTransactionOngkirTotal.value?.amount ?? 0, grandTotal.value)} %`,
      });
    }

    references.value.forEach((element) => {
      tableData.push({
        label: element.adjustments_transaction?.name ? element.adjustments_transaction?.name : element.adjustment?.name ? element.adjustment?.name : "-",
        max: currency(displayAmount(element, grandTotal.value)),
        beli: `${safePercent(displayAmount(element, grandTotal.value), totalBuyingPrice.value)}  %`,
        jual: `${safePercent(displayAmount(element, grandTotal.value), grandTotal.value)}  %`,
        min: currency(displayAmount(element, totalBuyingPriceMin.value)),
        beliMin: `${safePercent(displayAmount(element, grandTotal.value), totalBuyingPriceMin.value)}  %`,
        jualMin: `${safePercent(displayAmount(element, grandTotal.value), grandTotal.value)}  %`,
        selected: currency(displayAmount(element, grandTotal.value)),
        selectedBeli: `${safePercent(displayAmount(element, grandTotal.value), totalBuyingPriceSelected.value)}  %`,
        selectedJual: `${safePercent(displayAmount(element, grandTotal.value), grandTotal.value)}  %`,
      });
    });

    
    tableData.push(
      {
        label: adjustmentTransactionFeeTotal.value?.adjustments_transaction?.name,
        max: currency(displayAmount(adjustmentTransactionFeeTotal.value, grossProfit.value)),
        beli: `${safePercent(displayAmount(adjustmentTransactionFeeTotal.value, grossProfit.value), totalBuyingPrice.value)} %`,
        jual: `${safePercent(displayAmount(adjustmentTransactionFeeTotal.value, grossProfit.value), grandTotal.value)} %`,
        min: currency(displayAmount(adjustmentTransactionFeeTotal.value, grossProfitMin.value)),
        beliMin: `${safePercent(displayAmount(adjustmentTransactionFeeTotal.value, grossProfitMin.value), totalBuyingPriceMin.value)} %`,
        jualMin: `${safePercent(displayAmount(adjustmentTransactionFeeTotal.value, grossProfitMin.value), grandTotal.value)} %`,
        selected: currency(displayAmount(adjustmentTransactionFeeTotal.value, grossProfitSelected.value)),
        selectedBeli: `${safePercent(displayAmount(adjustmentTransactionFeeTotal.value, grossProfitSelected.value), totalBuyingPriceSelected.value)} %`,
        selectedJual: `${safePercent(displayAmount(adjustmentTransactionFeeTotal.value, grossProfitSelected.value), grandTotal.value)} %`,
      },
      
      {
        label: "Net Profit",
        max: currency(netProfitForBuying.value),
        beli: `${safePercent(netProfitForBuying.value, totalBuyingPrice.value)} %`,
        jual: `${safePercent(netProfitForBuying.value, grandTotal.value)} %`,
        min: currency(netProfitForBuyingMin.value),
        beliMin: `${safePercent(netProfitForBuying.value, totalBuyingPriceMin.value)} %`,
        jualMin: `${safePercent(netProfitForBuying.value, grandTotal.value)} %`,
        selected: currency(netProfitForBuyingSelected.value),
        selectedBeli: `${safePercent(netProfitForBuyingSelected.value, totalBuyingPriceSelected.value)} %`,
        selectedJual: `${safePercent(netProfitForBuyingSelected.value, grandTotal.value)} %`,
      }

    );
    

  return tableData;


})

const tableRowClassName = ({
  row,
  rowIndex,
}: {
  row: CanvassingItemForm
  rowIndex: number
}) => {
  console.log('row', row);
  if(row.type_item != 'request' && row.type_item != 'equivalent'){
    if (row.status === CanvassingVendorStatus.SELECTED) {
      return 'success-row'
    }else if(row.status === CanvassingVendorStatus.SUBMITTED){
      return 'primary-row'
    }
  }
  return ''
}

const querySearchContact = (queryString: string, cb: (arg: any) => void) => {
      
    request_search_contact.value.keyword = queryString,

    useFetchApi<ResponsePagination<Contact[]>>('/search','search-contact','post', request_search_contact.value).then((response) => {
      if(response.status.value === 'success'){
        const resultApi: Contact[] = response.data.value?.data ?? [];
        if(resultApi.length > 0){
          const results = resultApi.map((data: Contact) => {
              return {...data, value: `${data.name}`, isNew: false}
          });    
          cb(results)
        }else{
          cb([{value: `Tambahkan ${queryString}`, isNew: true, query: queryString, label: `Tambahkan ${queryString}`}])
        }
      }
      
    }).catch((error: any) => {
      ElMessage.error(error.response.data.message);
    });
}

const onHandleSelectContact = async (item: Record<string, any>, index: number) => {
  
  if(item.isNew){
    const contact: Contact|null = await createNewContact({name: item.query});
    if(contact !== null){
      contactsFee.value[index].reference = ReferenceAdjustment.CANVASSING;
      contactsFee.value[index].party_id = contact.unique_id;
      contactsFee.value[index].party = contact;
      contactsFee.value[index].party_type = PartyType.CONTACT;
      
    }
  }else{
    const contact: Contact = item as Contact;
    contactsFee.value[index].reference = ReferenceAdjustment.CANVASSING;
    contactsFee.value[index].party_id = contact.unique_id;
    contactsFee.value[index].party = contact;
    contactsFee.value[index].party_type = PartyType.CONTACT;
  }


  item_canvassing.value.forEach((value) => {
    const data: ReferenceTransactionAdjustment[] = JSON.parse(JSON.stringify(contactsFee.value));
    value.children.forEach((child) => child.contacts_fee = data);
  })
  
}

const createNewContact = async (data: any): Promise<Contact|null> => {
  try {
    const response = await useFetchApi<BaseResponse<Contact>>('/contact-create', 'create-customer', 'post', data);
    if(response.status.value == 'success'){
      return response.data.value?.data ?? null;
    }else{
      return null;
    }
  } catch (error: any) {
    ElMessage.error(error.response.message ?? error);
    return null;
  }
}

const fetchPriceTagWithItems = async () => {
  loading.value = true
  try {

    const uniques: string[] = [];

    item_canvassing.value.forEach((value) => {
      value.children.forEach((child) => {
        uniques.push(child.pricetag_item_id);
      })
    })


    const query = {...request_search_pricetag_item.value};
    query.column = [
      {
        unique_id: uniques,
      }
    ]
    const response = await useFetchApi<ResponsePagination<Pricetag_item[]>>(
      `/search`, 
      'fetch-price-tag-item', 
      'post', 
      query,
    );

    if(response.status.value == 'success'){
      const data: Pricetag_item[] = response.data.value?.data ?? [];

      data.forEach((pricetagItem) => {
        if(pricetagItem.pricetag){
          pricetags.value.push(pricetagItem.pricetag)
        }
      })

      if(pricetags.value.length > 0){
        activeCollapseVendor.value = pricetags.value.map((value) => value.unique_id);
      }



    }

  } catch (error: any) {
    ElMessage.error('Failed to fetch Pricetag')
  }finally {
    loading.value = false
  }
}

const initialCanvassing = (data: Canvassing) => {
  canvassingData.value = data;
      
console.log('reference ', canvassingData.value.reference_transaction);
  contactsFee.value = [];
  (canvassingData.value.reference_transaction ?? []).forEach(element => {
    if(element.party_type == PartyType.CONTACT){
      contactsFee.value.push(element);
    }
    if((element.adjustments_transaction?.name ?? '').toLowerCase() !== 'fee' && (element.adjustments_transaction?.name ?? '').toLowerCase() !== 'ongkos kirim'){
      references.value.push(element);
    }

    

    if((element.adjustments_transaction?.name ?? '').toLowerCase() == 'ongkos kirim'){
      adjustmentTransactionOngkirTotal.value = element;
    }

    if((element.adjustments_transaction?.name ?? '').toLowerCase() == 'fee'){
      adjustmentTransactionFeeTotal.value = element;
    }
  });

  (canvassingData.value.canvassing_item ?? []).forEach(element => {
    item_canvassing.value.push({
      
      index: `${element.unique_id}`,
      canvassing_id: element.canvassing_id,
      canvaasing_version: element.canvaasing_version,
      item_request_trail_version: element.item_request_trail_version,
      item_request_trail_id: element.item_request_trail_id,
      unique_id: element.unique_id,
      vendor_id: null,
      vendor_name: '',
      unit_id: element.unit_id,
      unit_name: element.unit_name,
      unit_version: null,
      offer_item_id: null,
      offer_item_version: 0,
      catalogue_id: element.catalogue_id ?? '',
      parent_catalogue_id: '',
      catalogue_name: element.catalogue_name ?? '',
      sn: element.catalogue?.sn ?? 'N/A',
      quantity: element.quantity ?? 1,
      unit_price: 0,
      total_price: Number(element.unit_selling_price) * Number(element.quantity),
      status: CanvassingVendorStatus.SUBMITTED,
      taxes: [],
      editing: null,
      type: 'parent',
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
        vendor_id: child.vendor_id ?? '',
        vendor_name: child.vendor?.name ?? '',
        unit_id: child.unit_id,
        unit_name: child.unit_name,
        unit_version: null,
        offer_item_id: null,
        offer_item_version: 0,
        catalogue_id: child.catalogue_id ?? '',
        parent_catalogue_id: child.catalogue_id,
        catalogue_name: child.catalogue?.name ?? '',
        sn: child.catalogue?.sn ?? '',
        quantity: child.quantity,
        unit_price: child.unit_price,
        total_price: child.total_price,
        status: child.status,
        checked: child.status == CanvassingVendorStatus.SUBMITTED ? true : false,
        taxes: [],
        editing: null,
        type: 'child',
        children: [],
        selling_price: child.selling_price ?? 0,
        profit: child.profit,
        profit_unit: child.profit_unit,
        fee: child.fee,
        fee_unit: child.fee_unit,
        ongkir: child.ongkir,
        ongkir_unit: child.ongkir_unit,
        pricetag_item_id: child.pricetag_item_id ?? '',
        pricetag_item_version: child.pricetag_item_version ?? 0,
        contacts_fee: child.reference_transaction.filter((value) => value.party_type == PartyType.CONTACT),
      })),
      selling_price: element.unit_selling_price,
      profit: 0,
      profit_unit: 'percent',
      fee: 0,
      fee_unit: 'percent',
      ongkir: 0,
      ongkir_unit: 'percent',
      pricetag_item_id: '',
      pricetag_item_version: 0,
      contacts_fee: [],
    })
  });

  
  item_canvassing.value.forEach((parent) => {
    console.log('child', parent.children);
    setProfit(parent);
  })

  fetchPriceTagWithItems();
}

// Fetch canvassing data
const fetchCanvassing = async () => {
  loading.value = true
  try {
    const response = await useFetchApi<BaseResponse<Canvassing>>(
      `/canvassing-read/${route.params.id}`, 
      'detail-canvassing', 
      'get', 
      null
    );

    if(response.status.value == 'success'){
      if(response.data.value?.data){
        initialCanvassing(response.data.value!.data)
      }

    }
  } catch (error) {
    ElMessage.error('Failed to fetch canvassing data')
    console.error(error)
    goBack();
  } finally {
    loading.value = false
  }
}

const disableButtonApprove = computed(() => {
  return Object.values(selectedVendors.value).every(v => v !== "")
})
const getSelectedVendorId = (itemId: string) => {
  return selectedVendors.value[itemId] || ''
}



function calculateMargin(row: CanvassingItemForm) {
  if(row.type == 'child'){
    const parent = findParent(item_canvassing.value, row.index);
    if(parent){
      // let sellingPrice = row.item.selling_price;
      let sellingPrice = parent.selling_price;
      let unit_price = row.unit_price;
      return ((sellingPrice - unit_price) / unit_price) * 100
    }
  }
  
  
  return 0;
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatStatus = (status: CanvassingStatus) => {
  switch (status) {
    case CanvassingStatus.DRAFT:
      return 'DRAFT';
    case CanvassingStatus.PENDING_APPROVAL:
      return 'Menunggu Di Setujui';
    case CanvassingStatus.RAB:
      return 'DRAFT';
    case CanvassingStatus.PENDING_APPROVAL_RAB:
      return 'Menunggu Di Setujui';
    case CanvassingStatus.DONE:
      return 'Di Setujui';
    case CanvassingStatus.CANCEL:
      return 'Tidak Di Setujui';
  
    default:
      break;
  }
}

const formatVendorStatus = (status: CanvassingVendorStatus) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const isRowSelected = (selection: CanvassingItemForm[], row: CanvassingItemForm): boolean => {
  return selection.some(selected => selected.index === row.index)
}

watch(() => item_canvassing.value, () => {
  updateSelectedChildrenFromChecked()
}, { deep: true })

watch(() => item_canvassing.value, () => {
  item_canvassing.value.forEach((element) => {
    const findCanvassingItem = (canvassingData.value?.canvassing_item ?? []).findIndex((item) => item.unique_id == element.unique_id);
    element.children.forEach(child => {
      if(findCanvassingItem >= 0){
        const vendorIndex = (canvassingData.value?.canvassing_item[findCanvassingItem].canvassing_vendor ?? []).findIndex((v) => v.unique_id == child.unique_id);

        if(vendorIndex >= 0){
          if(child.checked == true && CanvassingStatus.DONE) {
            canvassingData.value!.canvassing_item[findCanvassingItem].canvassing_vendor[vendorIndex].status = CanvassingVendorStatus.SELECTED;
          }else{
            canvassingData.value!.canvassing_item[findCanvassingItem].canvassing_vendor[vendorIndex].status = CanvassingVendorStatus.SUBMITTED;
          }
        }
      }
    });
  })

  
}, { deep: true })


watch(() => item_canvassing.value, () => {
  updateTableSelection()
}, { deep: true })

const handleSelect = (selection: CanvassingItemForm[], row: CanvassingItemForm): void => {
  const isSelected = selection.some(selected => selected.index === row.index)
  
  if (row.type === 'parent') {
    // Parent di-check/uncheck → update semua children
    if (isSelected) {
      // Check parent dan semua children
      row.checked = true
      row.children?.forEach(child => {
        child.checked = true
      })
    } else {
      // Uncheck parent dan semua children
      row.checked = false
      row.children?.forEach(child => {
        child.checked = false
      })
    }
  } else {
    // Child di-check/uncheck → update child saja
    row.checked = isSelected
    
    // Update parent state berdasarkan children
    updateParentCheckedState(row)
  }
  
  // Update selectedChildren array berdasarkan checked state
  updateSelectedChildrenFromChecked()
}

const updateParentCheckedState = (changedChild?: CanvassingItemForm): void => {
  item_canvassing.value.forEach(parent => {
    if (parent.children) {
      const allChildren = parent.children
      const checkedChildrenCount = allChildren.filter(child => child.checked).length
      
      if (checkedChildrenCount === allChildren.length) {
        // Semua children checked → parent fully checked
        parent.checked = true
      } else if (checkedChildrenCount > 0) {
        // Beberapa children checked → parent indeterminate
        parent.checked = false // Tapi visually Element Plus akan handle indeterminate
      } else {
        // Tidak ada children checked → parent unchecked
        parent.checked = false
      }
    }
  })
}

const updateSelectedChildrenFromChecked = (): void => {
  selectedChildren.value = []
  
  item_canvassing.value.forEach(parent => {
    if (parent.children) {
      parent.children.forEach(child => {
        if (child.checked) {
          selectedChildren.value.push(child)
        }
      })
    }
  })
}

const updateTableSelection = (): void => {
  nextTick(() => {
    if (!tableRef.value) return
    
    // Clear semua selection
    tableRef.value.clearSelection()
    
    // Set selection berdasarkan checked state
    item_canvassing.value.forEach(parent => {
      if (parent.checked) {
        tableRef.value!.toggleRowSelection(parent, true)
      }
      
      parent.children?.forEach(child => {
        if (child.checked) {
          tableRef.value!.toggleRowSelection(child, true)
        }
      })
    })
  })
}

const updateParentSelectionState = (changedChild?: CanvassingItemForm): void => {
  console.log('🔄 updateParentSelectionState called')
  
  nextTick(() => {
    console.log('⏰ nextTick executed')
    if (!tableRef.value) {
      console.log('❌ tableRef is null')
      return
    }
    
    console.log('Updating parent selection state...')
    
    // JANGAN clearSelection() di sini!
    // tableRef.value.clearSelection() ← HAPUS JIKA ADA
    
    // Hanya update parent states, jangan sentuh child selections
    item_canvassing.value.forEach(parent => {
      if (parent.children) {
        const selectedCount = parent.children.filter(child => 
          selectedChildren.value.some(selected => selected.index === child.index)
        ).length
        
        
        
        if (selectedCount === parent.children.length) {
          // All children selected → check parent
          tableRef.value!.toggleRowSelection(parent, true)
        } else if (selectedCount > 0) {
          // Some children selected → indeterminate (uncheck visually)
          tableRef.value!.toggleRowSelection(parent, false)
        } else {
          // No children selected → uncheck parent
          tableRef.value!.toggleRowSelection(parent, false)
        }
      }
    })
  })
}

const submitApproveRab = async() => {
  loading.value = true
  try {

    

    const referenceAdjustment: ReferenceTransactionAdjustment[] = [...references.value, ...contactsFee.value, adjustmentTransactionOngkirTotal.value as ReferenceTransactionAdjustment];
    const referenceAdjustmentVendor: ReferenceTransactionAdjustment[] = [];
    

    item_canvassing.value.forEach(element => {
      element.children.forEach((child) => {
        child.contacts_fee.forEach((fee) => {
          fee.reference_id = child.unique_id ?? '';
          referenceAdjustmentVendor.push(fee);
        })
        referenceAdjustmentVendor.push({
              unique_id: '',
              reference: ReferenceAdjustment.CANVASSINGVENDOR,
              reference_id: child.unique_id ?? '',
              adjustment_id: `${adjustmentOngkir.value?.unique_id}`,
              adjustment: adjustmentOngkir.value,
              value: child.ongkir,
              type: child.ongkir_unit as FeeType,
              amount: child.ongkir,
          });
      })
    });
    
        // Membuat FormData
    const formData = new FormData();

    // Menambahkan data utama
    formData.append('unique_id', canvassingData.value?.unique_id || '');
    formData.append('source_document', canvassingData.value?.source_document || '');
    formData.append('description', canvassingData.value?.description || '');
    formData.append('status', CanvassingStatus.PENDING_APPROVAL || '');
    formData.append(`payment_term`, `${canvassingData.value?.payment_term}`)
    formData.append(`tempo_value`, `${canvassingData.value?.tempo_value}`)
    formData.append(`tempo_unit`, `${canvassingData.value?.tempo_unit}`)
    formData.append(`address_id`, `${canvassingData.value?.address_id}`)
    formData.append(`address_version`, `${canvassingData.value?.address_version}`)

    // Append canvassing_items dengan individual fields
    item_canvassing.value.forEach((item: CanvassingItemForm, i: number) => {
      formData.append(`canvassing_items[${i}][unique_id]`, `${item.unique_id}`)
      formData.append(`canvassing_items[${i}][canvassing_id]`, `${canvassingData.value?.unique_id}`)
      formData.append(`canvassing_items[${i}][quantity]`, `${item.quantity}`)
      formData.append(`canvassing_items[${i}][catalogue_id]`, `${item.catalogue_id}`)
      formData.append(`canvassing_items[${i}][catalogue_name]`, `${item.catalogue_name}`)
      formData.append(`canvassing_items[${i}][unit_id]`, `${item.unit_id}`)
      formData.append(`canvassing_items[${i}][unit_name]`, `${item.unit_name}`)
      formData.append(`canvassing_items[${i}][unit_selling_price]`, `${item.selling_price}`)
      formData.append(`canvassing_items[${i}][type_item]`, `${item.type_item}`)
      formData.append(`canvassing_items[${i}][equivalent_id]`, `${item.equivalent_id}`)

      // const valueSelected = selectedVendors.value[item.unique_id];

      // Append canvassing_vendor
      // Append canvassing_vendor fields satu per satu
      item.children.forEach((vendor: CanvassingItemForm, j: any) => {
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][unique_id]`, `${vendor.unique_id}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][pricetag_item_id]`, `${vendor.pricetag_item_id}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][pricetag_item_version]`, `${vendor.pricetag_item_version}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][vendor_id]`, `${vendor.vendor_id}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][canvassing_item_id]`, `${item.unique_id}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][catalogue_id]`, `${vendor.catalogue_id}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][catalogue_name]`, `${vendor.catalogue_name}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][type_item]`, `${vendor.type_item}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][equivalent_id]`, `${vendor.equivalent_id}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][quantity]`, `${vendor.quantity}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][unit_price]`, `${vendor.unit_price}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][selling_price]`, `${vendor.selling_price}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][unit_id]`, `${item.unit_id}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][unit_name]`, `${item.unit_name}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][total_price]`, `${Number(vendor.quantity) * Number(vendor.unit_price)}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][profit]`, `${vendor.profit}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][profit_unit]`, `${vendor.profit_unit}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][fee]`, `${vendor.fee}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][fee_unit]`, `${vendor.fee_unit}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][ongkir]`, `${vendor.ongkir}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][ongkir_unit]`, `${vendor.ongkir_unit}`)

        

        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][status]`, `${vendor.checked ? CanvassingVendorStatus.SUBMITTED : CanvassingVendorStatus.REJECTED }`)
      
        
        let referenceCanvassingVendor: ReferenceTransactionAdjustment[] = vendor.contacts_fee;

        referenceCanvassingVendor.push({
          unique_id: '',
          reference: ReferenceAdjustment.CANVASSINGVENDOR,
          reference_id: vendor.unique_id ?? '',
          adjustment_id: `${adjustmentOngkir.value?.unique_id}`,
          adjustment: adjustmentOngkir.value,
          value: vendor.ongkir,
          type: vendor.ongkir_unit as FeeType,
          amount: vendor.ongkir,
        })


      })
    })

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
      }

      Object.entries(refFields).forEach(([key, value]) => {
        formData.append(`reference_transaction[${i}][${key}]`, `${value}`)
      })
    })
    

    // Untuk debugging: lihat semua entries FormData
    console.log('=== FORM DATA ENTRIES ===')
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value)
    }
    

    const response = await useFetchApi<BaseResponse<Canvassing>>('/canvassing-create', 'create-canvasing', 'post', formData)
    if (response.status.value === 'success') {
      ElMessage.success(`Berhasil Membuat Data Canvasing!`)
      item_canvassing.value = [];
      contactsFee.value = [];
      editState.value = false;
      fetchCanvassing();
    }  
  } catch (error: any) {
    ElMessage.error(error.response?.message ?? error)
  } finally {
    loading.value = false
  }
}
const cancelSubmissionApproval = async() => {
  loading.value = true
  try {

    

    const referenceAdjustment: ReferenceTransactionAdjustment[] = [...references.value, ...contactsFee.value, adjustmentTransactionOngkirTotal.value as ReferenceTransactionAdjustment];
    const referenceAdjustmentVendor: ReferenceTransactionAdjustment[] = [];
    

    item_canvassing.value.forEach(element => {
      element.children.forEach((child) => {
        child.contacts_fee.forEach((fee) => {
          fee.reference_id = child.unique_id ?? '';
          referenceAdjustmentVendor.push(fee);
        })
        referenceAdjustmentVendor.push({
              unique_id: '',
              reference: ReferenceAdjustment.CANVASSINGVENDOR,
              reference_id: child.unique_id ?? '',
              adjustment_id: `${adjustmentOngkir.value?.unique_id}`,
              adjustment: adjustmentOngkir.value,
              value: child.ongkir,
              type: child.ongkir_unit as FeeType,
              amount: child.ongkir,
          });
      })
    });
    
        // Membuat FormData
    const formData = new FormData();

    // Menambahkan data utama
    formData.append('unique_id', canvassingData.value?.unique_id || '');
    formData.append('status', CanvassingStatus.RAB || '');

    const response = await useFetchApi<BaseResponse<Canvassing>>('/canvassing-create', 'create-canvasing', 'post', formData)
    if (response.status.value === 'success') {
      ElMessage.success(`Berhasil Membatalkan RAB!`)
      item_canvassing.value = [];
      contactsFee.value = [];
      editState.value = false;
      dialogCancelApproval.value = false;
      fetchCanvassing();
    }  
  } catch (error: any) {
    ElMessage.error(error.response?.message ?? error)
  } finally {
    loading.value = false
  }
}

const submit = async () => {
  loading.value = true
  try {

    

    const referenceAdjustment: ReferenceTransactionAdjustment[] = [...references.value, ...contactsFee.value, adjustmentTransactionOngkirTotal.value as ReferenceTransactionAdjustment];
    const referenceAdjustmentVendor: ReferenceTransactionAdjustment[] = [];
    

    item_canvassing.value.forEach(element => {
      element.children.forEach((child) => {
        child.contacts_fee.forEach((fee) => {
          fee.reference_id = child.unique_id ?? '';
          referenceAdjustmentVendor.push(fee);
        })
        referenceAdjustmentVendor.push({
              unique_id: '',
              reference: ReferenceAdjustment.CANVASSINGVENDOR,
              reference_id: child.unique_id ?? '',
              adjustment_id: `${adjustmentOngkir.value?.unique_id}`,
              adjustment: adjustmentOngkir.value,
              value: child.ongkir,
              type: child.ongkir_unit as FeeType,
              amount: child.ongkir,
          });
      })
    });
    
        // Membuat FormData
    const formData = new FormData();

    // Menambahkan data utama
    formData.append('unique_id', canvassingData.value?.unique_id || '');
    formData.append('source_document', canvassingData.value?.source_document || '');
    formData.append('description', canvassingData.value?.description || '');
    formData.append('status', CanvassingStatus.PENDING_APPROVAL || '');
    formData.append(`payment_term`, `${canvassingData.value?.payment_term}`)
    formData.append(`tempo_value`, `${canvassingData.value?.tempo_value}`)
    formData.append(`tempo_unit`, `${canvassingData.value?.tempo_unit}`)
    formData.append(`address_id`, `${canvassingData.value?.address_id}`)
    formData.append(`address_version`, `${canvassingData.value?.address_version}`)

    // Append canvassing_items dengan individual fields
    item_canvassing.value.forEach((item: CanvassingItemForm, i: number) => {
      formData.append(`canvassing_items[${i}][unique_id]`, `${item.unique_id}`)
      formData.append(`canvassing_items[${i}][canvassing_id]`, `${canvassingData.value?.unique_id}`)
      formData.append(`canvassing_items[${i}][quantity]`, `${item.quantity}`)
      formData.append(`canvassing_items[${i}][catalogue_id]`, `${item.catalogue_id}`)
      formData.append(`canvassing_items[${i}][catalogue_name]`, `${item.catalogue_name}`)
      formData.append(`canvassing_items[${i}][unit_id]`, `${item.unit_id}`)
      formData.append(`canvassing_items[${i}][unit_name]`, `${item.unit_name}`)
      formData.append(`canvassing_items[${i}][unit_selling_price]`, `${item.selling_price}`)
      formData.append(`canvassing_items[${i}][type_item]`, `${item.type_item}`)
      formData.append(`canvassing_items[${i}][equivalent_id]`, `${item.equivalent_id}`)

      // const valueSelected = selectedVendors.value[item.unique_id];

      // Append canvassing_vendor
      // Append canvassing_vendor fields satu per satu
      item.children.forEach((vendor: CanvassingItemForm, j: any) => {
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][unique_id]`, `${vendor.unique_id}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][pricetag_item_id]`, `${vendor.pricetag_item_id}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][pricetag_item_version]`, `${vendor.pricetag_item_version}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][vendor_id]`, `${vendor.vendor_id}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][canvassing_item_id]`, `${item.unique_id}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][catalogue_id]`, `${vendor.catalogue_id}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][catalogue_name]`, `${vendor.catalogue_name}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][type_item]`, `${vendor.type_item}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][equivalent_id]`, `${vendor.equivalent_id}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][quantity]`, `${vendor.quantity}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][unit_price]`, `${vendor.unit_price}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][selling_price]`, `${vendor.selling_price}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][unit_id]`, `${item.unit_id}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][unit_name]`, `${item.unit_name}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][total_price]`, `${Number(vendor.quantity) * Number(vendor.unit_price)}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][profit]`, `${vendor.profit}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][profit_unit]`, `${vendor.profit_unit}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][fee]`, `${vendor.fee}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][fee_unit]`, `${vendor.fee_unit}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][ongkir]`, `${vendor.ongkir}`)
        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][ongkir_unit]`, `${vendor.ongkir_unit}`)

        

        formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][status]`, `${vendor.checked ? CanvassingVendorStatus.SUBMITTED : CanvassingVendorStatus.REJECTED }`)
      
        
        let referenceCanvassingVendor: ReferenceTransactionAdjustment[] = vendor.contacts_fee;

        referenceCanvassingVendor.push({
          unique_id: '',
          reference: ReferenceAdjustment.CANVASSINGVENDOR,
          reference_id: vendor.unique_id ?? '',
          adjustment_id: `${adjustmentOngkir.value?.unique_id}`,
          adjustment: adjustmentOngkir.value,
          value: vendor.ongkir,
          type: vendor.ongkir_unit as FeeType,
          amount: vendor.ongkir,
        })



        referenceCanvassingVendor.forEach((ref: ReferenceTransactionAdjustment, refIndex: number) => {
          formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][reference_transaction][${refIndex}][unique_id]`, `${ref.unique_id}`)
          formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][reference_transaction][${refIndex}][adjustment_id]`, `${ref.adjustment_id}`)
          formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][reference_transaction][${refIndex}][value]`, `${ref.value}`)
          formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][reference_transaction][${refIndex}][amount]`, `${ref.amount}`)
          formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][reference_transaction][${refIndex}][type]`, `${ref.type}`)
          formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][reference_transaction][${refIndex}][party_type]`, `${ref.party_type}`)
          formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][reference_transaction][${refIndex}][party_id]`, `${ref.party_id}`)
          formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][reference_transaction][${refIndex}][reference]`, `${ref.reference}`)
          formData.append(`canvassing_items[${i}][canvassing_vendor][${j}][reference_transaction][${refIndex}][reference_id]`, `${ref.reference_id}`)
        })
      })
    })

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
      }

      Object.entries(refFields).forEach(([key, value]) => {
        formData.append(`reference_transaction[${i}][${key}]`, `${value}`)
      })
    })

    // Untuk debugging: lihat semua entries FormData
    console.log('=== FORM DATA ENTRIES ===')
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value)
    }
    

    const response = await useFetchApi<BaseResponse<Canvassing>>('/canvassing-create', 'create-canvasing', 'post', formData)
    if (response.status.value === 'success') {
      ElMessage.success(`Berhasil Membuat Data Canvasing!`)
      item_canvassing.value = [];
      contactsFee.value = [];
      editState.value = false;
      fetchCanvassing();
    }  
  } catch (error: any) {
    ElMessage.error(error.response?.message ?? error)
  } finally {
    loading.value = false
  }
}

const selectAllChildren = (parentRow: CanvassingItemForm): void => {
  if (parentRow.children) {
    parentRow.children.forEach(child => {
      // Tambah ke selectedChildren jika belum ada
      if (!selectedChildren.value.find(selected => selected.index === child.index)) {
        selectedChildren.value.push(child)
      }
    })
    updateTableSelection()
  }
}

const unselectAllChildren = (parentRow: CanvassingItemForm): void => {
  if (parentRow.children) {
    parentRow.children.forEach(child => {
      // Hapus dari selectedChildren
      const index = selectedChildren.value.findIndex(selected => selected.index === child.index)
      if (index !== -1) {
        selectedChildren.value.splice(index, 1)
      }
    })
    updateTableSelection()
  }
}

const findRowById = (id: string): CanvassingItemForm | null => {
  const findRecursive = (items: CanvassingItemForm[]): CanvassingItemForm | null => {
    for (const item of items) {
      if (item.index === id) return item  // ← Cari by ID
      if (item.children) {
        const found = findRecursive(item.children)
        if (found) return found
      }
    }
    return null
  }
  
  return findRecursive(item_canvassing.value)
}

const handleSelectAll = (selection: CanvassingItemForm[]): void => {
  if (selection.length === 0) {
    // Unselect all
    selectedChildren.value = []
  } else {
    // Select all children
    selectedChildren.value = []
    item_canvassing.value.forEach(parent => {
      if (parent.children) {
        parent.children.forEach(child => {
          if (!selectedChildren.value.find(selected => selected.sn === child.sn)) {
            selectedChildren.value.push(child)
          }
        })
      }
    })
  }
}

const getStatusTagType = (status: CanvassingStatus): 'success' | 'info' | 'danger' | 'warning' | 'primary' => {
  switch (status) {
    case CanvassingStatus.DRAFT || CanvassingStatus.RAB || CanvassingStatus.CANVASSING: return 'info'
    case CanvassingStatus.PENDING_APPROVAL|| CanvassingStatus.PENDING_APPROVAL_RAB: return 'warning'
    case CanvassingStatus.CANCEL: return 'danger'
    default: return 'primary'
  }
}
const getStatusTagTypeItem = (status: CanvassingVendorStatus): 'success' | 'info' | 'danger' | 'warning' | 'primary' => {
  switch (status) {
    case CanvassingVendorStatus.SUBMITTED: return 'primary'
    case CanvassingVendorStatus.REJECTED: return 'danger'
    case CanvassingVendorStatus.SELECTED: return 'success'
    default: return 'primary'
  }
}
const getStatusTabLabelItem = (status: CanvassingVendorStatus) => {
  switch (status) {
    case CanvassingVendorStatus.SUBMITTED: return 'Diajukan'
    case CanvassingVendorStatus.REJECTED: return 'Tidak Di Ajukan'
    case CanvassingVendorStatus.SELECTED: return 'Di Pilih'
    default: return 'primary'
  }
}

const getVendorStatusTagType = (status: CanvassingVendorStatus): 'success' | 'info' | 'danger' | 'warning' | 'primary' => {
  switch (status) {
    case CanvassingVendorStatus.SUBMITTED: return 'info'
    case CanvassingVendorStatus.SELECTED: return 'success'
    case CanvassingVendorStatus.REJECTED: return 'danger'
    default: return 'primary'
  }
}

const initializeSelectedVendors = () => {
  if (!canvassingData.value) return


  canvassingData.value.canvassing_item.forEach(item => {
    selectedVendors.value[item.unique_id] = '';
  })
  
  
  
  canvassingData.value.canvassing_item.forEach(item => {
    if (item.canvassing_vendor) {
      const selectedVendor = item.canvassing_vendor.find(
        vendor => vendor.status === CanvassingVendorStatus.SELECTED
      )
      
      if (selectedVendor) {
        selectedVendors.value[item.unique_id] = selectedVendor.unique_id!;
      }
    }
  })
}

const canUpdateStatus = (newStatus: CanvassingStatus): boolean => {
  if (!canvassingData.value) return false
  
  const currentStatus = canvassingData.value.status
  
  // Define allowed status transitions
  const allowedTransitions: any = {
    [CanvassingStatus.DRAFT]: [CanvassingStatus.PENDING_APPROVAL, CanvassingStatus.CANCEL],
    [CanvassingStatus.PENDING_APPROVAL]: [CanvassingStatus.CANCEL],
    [CanvassingStatus.CANCEL]: [CanvassingStatus.DRAFT]
  }
  
  return allowedTransitions[currentStatus]?.includes(newStatus) || false
}

// Actions
const updateStatus = async (status: CanvassingStatus) => {
  if (!canvassingData.value) return
  
  loading.value = true
  try {
    const formData = new FormData()
    formData.append("unique_id", canvassingData.value.unique_id || '')
    formData.append("status", status)
    formData.append("note", canvassingData.value.note ?? '')

    canvassingData.value.canvassing_item.forEach((element, i) => {
      formData.append(`canvassing_items[${i}][unique_id]`, `${element.unique_id}`);

      element.canvassing_vendor.forEach((vendor, vI) => {
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${vI}][unique_id]`,
          `${vendor.unique_id}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${vI}][status]`,
          `${vendor.status}`
        );
      });

    })
    
    
    
    const response = await useFetchApi<BaseResponse<Canvassing>>(
      '/canvassing-create', 
      'update-canvassing-status', 
      'post', 
      formData
    )
    
    if(response.status.value == 'success'){
      canvassingData.value.status = status;

      ElMessage.success('Canvassing status updated')
    }  
  } catch (error) {
    ElMessage.error('Failed to update status')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const createQuotationPrice = async (data: any) => {
    
  loading.value = true;
  try {
    const response = await useFetchApi('/pricetag-create', 'pricelist-create', 'post', data);

    if(response.status.value == 'success'){
      ElMessage.success("Berhasil");
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message ?? error);
  } finally {
    loading.value = false;
  }
}

const submitForApproval = async () => {
  await updateStatus(CanvassingStatus.PENDING_APPROVAL)
}
const approve = async () => {
  
  visibleApproveDialog.value = true;
}

const decline = async () => {
  
  visibleDeclineDialog.value = true;
}

const submitApprove = async() => {

  canvassingData.value?.canvassing_item.forEach(element => {
    
    
    element.canvassing_vendor.forEach(element => {
      if(element.status === CanvassingVendorStatus.SUBMITTED || element.status === CanvassingVendorStatus.SELECTED){
        element.status = CanvassingVendorStatus.SELECTED;
      }else{
        element.status = CanvassingVendorStatus.REJECTED;
      }
    });
  });

  

  await updateStatus(CanvassingStatus.DONE);

  

  visibleApproveDialog.value = false;
}
const submitDecline = async() => {

  canvassingData.value?.canvassing_item.forEach(element => {
    
    
    element.canvassing_vendor.forEach(element => {
      element.status = CanvassingVendorStatus.REJECTED;
    });
  });

  

  await updateStatus(CanvassingStatus.CANCEL);

  

  visibleApproveDialog.value = false;
}

const viewItemDetails = (item: CanvassingItem) => {
  selectedItem.value = item
  itemDialogVisible.value = true
}

const selectVendor = async (item: CanvassingItem, vendor: CanvassingVendor) => {
  if (!selectedItem.value) return
  
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
    ElMessage.error('Failed to select vendor')
    console.error(error)
  }
}

const confirmDelete = () => {
  ElMessageBox.confirm(
    'This will permanently delete the canvassing. Continue?',
    'Warning',
    {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  ).then(async () => {
    await deleteCanvassing()
  }).catch(() => {
    // Cancel
  })
}

const deleteCanvassing = async () => {
  loading.value = true
  try {
    const response = await useFetchApi<BaseResponse<any>>(
      `/canvassing/${canvassingId.value}`, 
      'delete-canvassing', 
      'delete', 
      null
    )
    
    if(response.status.value == 'success'){
      ElMessage.success('Canvassing deleted')
      router.push('/purchasing/canvassing')
    }  
  } catch (error) {
    ElMessage.error('Failed to delete canvassing')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const getContacts = async (): Promise<Contact|null> => {
  try {
    const request_search: RequestSearch = {
      keyword: '',
      table: 'contacts',
      column: [
        {
          ownership: [true]
        }
      ],
      sort: null,
      offset: '1',
      limit: '10'
    };
    const response = await useFetchApi<ResponsePagination<Contact[]>>('/search', 'get-contacts', 'post', request_search);
    if(response.status.value == 'success'){
      return response.data.value?.data[0] ?? null;
    }else{
      return null;
    }
  } catch (error: any) {
    return null;
  }
}

const generateQuotation = async () => {
      

      const items: any[] = [];
      const itemsVendor: CanvassingVendor[] = [];

      (canvassingData.value?.canvassing_item ?? []).forEach(element => {
        (element.canvassing_vendor ?? []).forEach((vendor) => {
          items.push({
            "unique_id": null,
            "tag_id": null,
            "catalogue_id": vendor.catalogue_id,
            "inventory_id": null,
            "price": parseInt(`${vendor.selling_price}`),
            "unit_id": vendor.unit_id,
            "unit_name": vendor.unit_name,
          });
          itemsVendor.push(vendor);
        });
      });
      

      // const response = await useFetchApi('/pricetag-create', 'pricelist-create', 'post', data_price_tag);

      // if(response.status.value == 'success'){
      //   ElMessage.success("Berhasil");
      //   formEl.resetFields();
      // }

      const doc = await generateQuotationPdf(canvassingData.value?.canvassing_item ?? [])
      const blob = doc.output("blob")
      pdfUrl.value = URL.createObjectURL(blob)
      showPreview.value = true
}

const submitRAB = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  
  await formEl.validate(async (valid) => {
    if (valid) {
       dialogSelectedItem.value = true;
    }
  })
}




watch(() => props.canvassingData, (newData) => {
  if (newData) {
    initialCanvassing(newData)
  }
}, { immediate: true })

onMounted(() => {
    
})
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
</style>