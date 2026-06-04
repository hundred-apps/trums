<template>
  <el-card class="mb-3">
    <template #header>
      <div class="card-header flex items-center justify-between">
        <span>Items</span>
        <el-button type="primary" :icon="Search" @click="onAddItemRFQ"
          >Cari Item</el-button
        >
      </div>
    </template>

    <el-table
      ref="tableRef"
      :data="item_canvassing"
      row-key="index"
      :tree-props="{ children: 'children' }"
      :loading="loading"
      :expand-row-keys="expandRowKey ?? []"
      :size="'small'"
      :row-class-name="tableRowClassName"
      border
    >
      <el-table-column label="" align="center" width="50">
        <template #default="scope">
          <div class="flex items-center">
            <!-- <el-button
              type="primary"
              :icon="Plus"
              v-if="scope.row.type === 'parent'"
              circle
              @click="() => onAddItemVendor(scope.row)"
            /> -->
            <el-button
              type="danger"
              :icon="Delete"
              circle
              @click="() => onRemoveItem(scope.row)"
            />
          </div>
        </template>
      </el-table-column>

      <!-- <el-table-column label="Image" width="70">
        <template #default="scope">
          <ItemImageUpload
            v-model="scope.row.files"
            :image-url="scope.row.image"
            :show-text="false"
            @open-modal="() => onImageModal(scope.row, scope.$index)"
          />
        </template>
      </el-table-column> -->
      <el-table-column prop="item_name" label="Item" width="200">
        <template #default="{ row }">
          <div class="flex items-center">
            <!-- <el-icon
                v-if="row.children && row.children.length"
                class="cursor-pointer mr-2"
                @click="toggleExpand(row)"
              >
                <component :is="row._expanded ? ArrowDown : ArrowRight" />
              </el-icon> -->
            <div v-if="row.type == 'parent' && row.type_item == 'request'">
              {{ row.catalogue_name }}
            </div>
            <div style="width: 100%" v-else>
              <el-autocomplete
                v-if="row.type == 'child'"
                :disabled="loading"
                :fetch-suggestions="querySearchCatalogue"
                v-model="row.catalogue_name"
                placeholder="Cari item"
                popper-class="mobile-autocomplete"
                :size="'small'"
                :trigger-on-focus="false"
                :autofocus="true"
                @select="(item: Record<string, any>) => onSelectItemComplete(item, row.index, row)"
              >
                <template #default="{ item }">
                  <div
                    v-if="item.isNew"
                    class="flex items-center text-blue-500"
                  >
                    <el-icon><Search /></el-icon>
                    <span class="ml-2">Tambahkan "{{ item.value }}"</span>
                  </div>
                  <div v-else class="flex items-center gap-2" width="10">
                    <div class="flex-shrink-0 mt-1">
                      <div
                        v-if="item.files && item.files.length > 0"
                        class="w-10 h-10 rounded overflow-hidden border"
                      >
                        <img
                          :src="getFirstFileUrl(item.files)"
                          :alt="item.catalogue_name"
                          class="w-full h-full object-cover"
                        />
                      </div>
                      <div
                        v-else
                        class="w-10 h-10 rounded border flex items-center justify-center text-gray-400"
                      >
                        <el-icon><Picture /></el-icon>
                      </div>
                    </div>
                    <div class="flex flex-col">
                      <el-text line-clamp="2" class="font-bold">
                        {{ item.catalogue?.name }}
                      </el-text>
                      <div class="flex gap-2">
                        <span class="font-bold"> Harga: {{ item.price }} </span>
                        <span>
                          Vendor:
                          {{ item.pricetag?.owner?.name ?? "Tidak Ada" }}
                        </span>
                      </div>
                    </div>
                  </div>
                </template>
                <template #prepend>
                  <el-button @click="() => showPricetag(row)" :icon="Search" />
                </template>
              </el-autocomplete>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Type" width="150">
        <template #default="{ row }">
          <el-select
            v-model="row.type_item"
            v-if="row.type != 'parent'"
            placeholder="Select"
          >
            <el-option :label="`Subtitution`" :value="'quotation'" />
            <el-option :label="`Equivalent`" :value="'equivalent'" />
            <el-option :label="`AS Requested`" :value="'original'" />
          </el-select>
          <div v-else>Permintaan</div>
        </template>
      </el-table-column>

      <el-table-column prop="sn" label="SN/PN" align="center">
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
            @change="(value) => onCalcullateSellingPrice(row)"
            @input="(value) => onCalcullateSellingPrice(row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="unit_name" label="UOM" width="100">
        <template #default="{ row }">
          <div v-if="row.type == 'parent' && row.type_item == 'request'">
            {{ row.unit_name }}
          </div>
          <el-autocomplete
            v-else
            :fetch-suggestions="querySearchUnit"
            v-model="row.unit_name"
            placeholder="Input Units"
            @select="(item: Record<string, any>) => handleSelectUnit(item, row.index, row)"
            :disabled="true"
          />
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
  </el-card>
</template>

<script lang="tsx" setup>
import { Search, Delete, Plus, Picture } from "@element-plus/icons-vue";
import type { CanvassingItemForm } from "~/types/scm/canvasing";
import { getFirstFileUrl, formatLocalDate, currency } from "#imports";
import { FeeType } from "~/types/attribute_adjustment";
import ItemImageUpload from "../../inquiry/components/ItemImageUpload.vue";

interface Props {
  item_canvassing: CanvassingItemForm[];
  loading: boolean;
  expandRowKey: string[];
  querySearchCatalogue: (queryString: string, cb: (arg: any) => void) => void;
  querySearchUnit: (queryString: string, cb: (arg: any) => void) => void;
}

interface Emits {
  (e: "onRemoveItem", value: CanvassingItemForm): void;
  (e: "onAddItemVendor", value: CanvassingItemForm): void;
  (e: "onImageModal", value: CanvassingItemForm, index: number): void;
  (
    e: "onSelectItemComplete",
    value: Record<string, any>,
    index: string,
    row: CanvassingItemForm
  ): void;
  (
    e: "onSelectUnit",
    value: Record<string, any>,
    index: string,
    row: CanvassingItemForm
  ): void;
  (
    e: "onSelectItemComplete",
    value: Record<string, any>,
    index: string,
    row: CanvassingItemForm
  ): void;
  (e: "showPricetag", value: CanvassingItemForm): void;
  (e: "calculateSellingPrice", value: CanvassingItemForm): void;
  (e: "onAddItemRFQ"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const feeState = ref<string>("minus");
const ongkirState = ref<string>("minus");
const unitFee = ref<FeeType>(FeeType.PERCENT);

const tableRowClassName = ({ row }: { row: CanvassingItemForm }) => {
  if (row.type === "child" && row.has_different_unit) {
    return "different-unit-row";
  }
  return "";
};

const onRemoveItem = (row: CanvassingItemForm) => {
  emit("onRemoveItem", row);
};
const onAddItemVendor = (row: CanvassingItemForm) => {
  emit("onAddItemVendor", row);
};

const onImageModal = (row: CanvassingItemForm, index: number) => {
  emit("onImageModal", row, index);
};

const onSelectItemComplete = (
  item: Record<string, any>,
  index: string,
  row: CanvassingItemForm
) => {
  emit("onSelectItemComplete", item, index, row);
};

const showPricetag = (row: CanvassingItemForm) => {
  emit("showPricetag", row);
};

const onCalcullateSellingPrice = (row: CanvassingItemForm) => {
  emit("calculateSellingPrice", row);
};

const handleSelectUnit = (
  item: Record<string, any>,
  index: string,
  row: CanvassingItemForm
) => {
  emit("onSelectUnit", item, index, row);
};

const onAddItemRFQ = () => emit("onAddItemRFQ");
</script>

<style scoped>
:deep(.mobile-autocomplete) {
  position: fixed !important;

  left: 10px !important;
  right: 10px !important;

  width: auto !important;
  max-width: unset !important;

  transform: none !important;
}
</style>
