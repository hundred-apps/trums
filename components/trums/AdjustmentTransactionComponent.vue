<template>
  <el-card class="mb-3" shadow="never">
    <template #header>
      <div class="card-header"><span>Biaya Lainya</span></div>
    </template>
    <div>
      <div
        class="flex justify-between items-center mb-2"
        v-for="(ref, index) in references.filter(
          (value) =>
            value.adjustment?.operator == 'plus' &&
            value.adjustment?.category == 'adjustment'
        )"
      >
        <span class="font-bold text-sm">{{ ref.adjustment?.name ?? "" }}</span>
        <span class="text-sm flex flex-1 justify-end items-center gap-2">
          <el-radio-group
            v-model="ref.include"
            @change="(value) => onIncExcChange(ref, value)"
          >
            <el-radio :value="false" size="large">Exc</el-radio>
            <el-radio :value="true" size="large">Inc</el-radio>
          </el-radio-group>
          <el-input
            :disabled="ref.include"
            v-model="ref.amount"
            style="max-width: 300px"
            placeholder="Masukan Nilai"
          >
            <template #append>
              <el-select
                v-model="ref.type"
                :disabled="ref.changeType == false"
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
            @click="removeAnotherCost(ref.adjustment_id)"
          />
        </span>
      </div>
    </div>

    <el-button
      class="mt-4"
      style="width: 100%"
      @click="
        () => {
          querySearchAdjustmentTransaction.column = [
            {
              operator: ['plus'],
              category: ['adjustment'],
            },
          ];
          visibleModalAdjustmentTransaction = true;
        }
      "
    >
      Tambah Biaya Lain
    </el-button>
  </el-card>
  <el-card class="mb-3" shadow="never">
    <template #header>
      <div class="card-header"><span>Potongan</span></div>
    </template>
    <div>
      <div
        class="flex justify-between items-center mb-2"
        v-for="(ref, index) in references.filter(
          (value) => value.adjustment?.operator == 'minus'
        )"
      >
        <span class="font-bold text-sm">{{ ref.adjustment?.name ?? "" }}</span>
        <span class="text-sm flex flex-1 justify-end items-center gap-2">
          <el-radio-group
            v-model="ref.include"
            @change="(value) => onIncExcChange(ref, value)"
          >
            <el-radio :value="false" size="large">Exc</el-radio>
            <el-radio :value="true" size="large">Inc</el-radio>
          </el-radio-group>
          <el-input
            :disabled="ref.include"
            v-model="ref.amount"
            style="max-width: 300px"
            placeholder="Masukan Nilai"
          >
            <template #append>
              <el-select
                v-model="ref.type"
                :disabled="ref.changeType == false"
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
            @click="removeAnotherCost(ref.adjustment_id)"
          />
        </span>
      </div>
    </div>

    <el-button
      class="mt-4"
      style="width: 100%"
      @click="
        () => {
          querySearchAdjustmentTransaction.column = [
            {
              operator: ['minus'],
              category: ['adjustment'],
            },
          ];
          visibleModalAdjustmentTransaction = true;
        }
      "
    >
      Tambah Potongan
    </el-button>
  </el-card>

  <el-card class="mb-3" shadow="never">
    <template #header>
      <div class="card-header"><span>PAJAK</span></div>
    </template>
    <div>
      <div
        class="flex justify-between items-center mb-2"
        v-for="(ref, index) in references.filter(
          (value) =>
            value.adjustment?.category == 'tax' ||
            value.adjustment?.category == 'transform'
        )"
      >
        <span class="font-bold text-sm">{{ ref.adjustment?.name ?? "" }}</span>
        <span class="text-sm flex flex-1 justify-end items-center gap-2">
          <el-radio-group
            v-if="ref.adjustment?.category == 'tax'"
            v-model="ref.include"
            @change="(value) => onIncExcChange(ref, value)"
          >
            <el-radio :value="false" size="large">Exc</el-radio>
            <el-radio :value="true" size="large">Inc</el-radio>
          </el-radio-group>
          <el-input
            :disabled="ref.include"
            v-model="ref.amount"
            style="max-width: 300px"
            placeholder="Masukan Nilai"
            type="number"
          >
            <template #append>
              <el-select
                v-model="ref.type"
                :disabled="ref.changeType == false"
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
            @click="removeAnotherCost(ref.adjustment_id)"
          />
        </span>
      </div>
    </div>

    <el-button
      class="mt-4"
      style="width: 100%"
      @click="
        () => {
          querySearchAdjustmentTransaction.column = [
            {
              category: ['tax'],
            },
          ];
          visibleModalAdjustmentTransaction = true;
        }
      "
    >
      Tambah Pajak
    </el-button>
  </el-card>

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
</template>
<script lang="tsx" setup>
import { Delete } from "@element-plus/icons-vue";
import {
  ReferenceAdjustment,
  type AdjustmentTransaction,
  type ReferenceTransactionAdjustment,
} from "~/types/attribute_adjustment";
import type { RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import ModalAdjustmentTransaction from "./ModalAdjustmentTransaction.vue";
import AddAdjustment from "./AddAdjustment.vue";

const props = defineProps<{
  references: ReferenceTransactionAdjustment[];
}>();

const emit = defineEmits<{
  (
    e: "update:total",
    payload: {
      totalBiayaTambahan: number;
      totalPotongan: number;
      totalPajak: number;
    }
  ): void;
}>();

const visibleModalAdjustmentTransaction = ref(false);
const visibleModalNewAdjustment = ref(false);

const loading = ref<boolean>(false);

const querySearchAdjustmentTransaction = ref<RequestSearch>({
  keyword: "",
  table: "adjustments_transaction",
  column: [
    {
      operator: ["plus"],
    },
  ],
  sort: null,
  limit: "10",
  offset: "1",
  flag: "form",
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

const handleAdjustmentSubmit = () => {
  visibleModalNewAdjustment.value = false;
  adjustmentTransactions.refresh();
};

const removeAnotherCost = async (adj_id: string) => {
  const findIndex = props.references.findIndex(
    (ref) => ref.adjustment_id === adj_id
  );
  const unique_id = props.references[findIndex].unique_id;
  if (unique_id != "") {
    await submitRemoveCost([unique_id]);
  }

  props.references.splice(findIndex, 1);
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

const handleSelectAdjustment = (items: AdjustmentTransaction[]) => {
  items.forEach(async (element) => {
    // if (
    //   element.category == "tax" &&
    //   element.name.toLocaleLowerCase() === "ppn"
    // ) {
    //   const adj = await getDPP();
    //   if (adj) {
    //     props.references.push({
    //       unique_id: "",
    //       reference: ReferenceAdjustment.OFFER,
    //       reference_id: "",
    //       adjustment_id: adj.unique_id,
    //       type: adj.type,
    //       amount: adj.default_value,
    //       created_at: 0,
    //       value: adj.default_value,
    //       adjustment: adj,
    //       changeType: true,
    //       inc_tmp: "0",
    //       include: false,
    //     });
    //   }
    // }

    props.references.push({
      unique_id: "",
      reference: ReferenceAdjustment.OFFER,
      reference_id: "",
      adjustment_id: element.unique_id,
      type: element.type,
      amount: element.default_value,
      created_at: 0,
      value: element.default_value,
      adjustment: element,
      changeType: true,
      inc_tmp: "0",
      include: false,
    });
  });
  visibleModalAdjustmentTransaction.value = false;
};

const getDPP = async (): Promise<AdjustmentTransaction | undefined> => {
  loading.value = true;
  try {
    querySearchAdjustmentTransaction.value.column = [
      {
        category: ["transform"],
        unique_code: ["DPPL"],
      },
    ];
    const response = await useFetchApi<
      ResponsePagination<AdjustmentTransaction[]>
    >("/search", "search-adjustment", "post", querySearchAdjustmentTransaction);

    if (response.status.value === "success") {
      if (
        response.data.value?.data != null &&
        response.data.value?.data != undefined &&
        response.data.value!.data.length > 0
      )
        return response.data.value!.data[0];
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  } finally {
    loading.value = false;
  }
};

const totalBiayaTambahan = computed(() => {
  return props.references
    .filter(
      (ref) =>
        ref.adjustment?.operator === "plus" &&
        ref.adjustment?.category === "adjustment"
    )
    .reduce((total, ref) => {
      return total + Number(ref.amount || 0);
    }, 0);
});

const totalPotongan = computed(() => {
  return props.references
    .filter((ref) => ref.adjustment?.operator === "minus")
    .reduce((total, ref) => {
      return total + Number(ref.amount || 0);
    }, 0);
});

const totalPajak = computed(() => {
  return props.references
    .filter(
      (ref) =>
        ref.adjustment?.category === "tax" ||
        ref.adjustment?.category === "transform"
    )
    .reduce((total, ref) => {
      return total + Number(ref.amount || 0);
    }, 0);
});

const onIncExcChange = (
  ref: ReferenceTransactionAdjustment,
  value: string | number | boolean | undefined
) => {
  props.references.forEach((element) => {
    if (element.adjustment_id == ref.adjustment_id) {
      if (value) {
        element.value = 0;
        element.amount = 0;
      }
    }
  });
};

watch(
  () => querySearchAdjustmentTransaction.value,
  () => adjustmentTransactions.refresh(),
  { deep: true }
);

watch(
  props.references,
  () => {
    emit("update:total", {
      totalBiayaTambahan: totalBiayaTambahan.value,
      totalPotongan: totalPotongan.value,
      totalPajak: totalPajak.value,
    });
  },
  { deep: true }
);
</script>
