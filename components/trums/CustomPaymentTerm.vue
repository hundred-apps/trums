<template>
  <el-card
    class="mb-4"
    header="Informasi Pembayaran"
    :class="{ 'error-card': paymentTermError }"
    shadow="never"
  >
    <el-table :data="termOfPayments" border style="width: 100%">
      <el-table-column label="Nama">
        <template #default="{ row, $index }">
          <el-input
            v-if="type == 'input'"
            v-model="row.name"
            placeholder="TOP 1"
          />
          <div v-else>{{ row.name }}</div>
        </template>
      </el-table-column>

      <el-table-column label="Jumlah">
        <template #default="{ row, $index }">
          <el-input
            v-model="row.value"
            style="max-width: 300px"
            placeholder="Jumlah"
            v-if="type == 'input'"
          >
            <template #append>
              <el-select v-model="row.unit" style="width: 100px">
                <el-option label="%" value="percentage" />
                <el-option label="Rp" value="nominal" />
              </el-select>
            </template>
          </el-input>
          <div v-else>
            {{
              row.unit == "percentage"
                ? row.value + "%"
                : currencyWithoutSymbol(row.value)
            }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="TOP">
        <template #default="{ row }">
          <el-select
            v-model="row.term_of_payment"
            placeholder="Select"
            style="width: 240px"
            v-if="type === 'input'"
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
          <div v-else>{{ row.term_of_payment.toUpperCase() }}</div>
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
            v-if="type == 'input'"
          />
          <div v-else>
            {{
              scope.row.term_of_payment !== PaymentTerm.TEMPO
                ? ""
                : scope.row.duration + "D"
            }}
          </div>
        </template>
      </el-table-column>

      <el-table-column v-if="type == 'input'" label="Aksi" width="60">
        <template #default="{ $index }">
          <el-button
            type="danger"
            :icon="Delete"
            circle
            @click="() => removePaymentTerm($index)"
          />
        </template>
      </el-table-column>
    </el-table>
    <el-button
      v-if="type == 'input'"
      class="mt-4"
      style="width: 100%"
      @click="addNewPaymentTerm"
    >
      Add New Item
    </el-button>
  </el-card>
</template>

<script lang="tsx" setup>
import { Delete } from "@element-plus/icons-vue";
import {
  TermOfPaymentReference,
  type TermOfPayment,
} from "~/types/payment_term";
import type { BaseResponse } from "~/types/response";
import { PaymentTerm } from "~/types/scm/canvasing";
import { currencyWithoutSymbol } from "#imports";

const props = defineProps<{
  type: "input" | "view";
  data?: TermOfPayment[];
}>();

const emit = defineEmits<{
  (e: "update:termOfPayments", value: TermOfPayment[]): void;
}>();

const paymentTermError = ref(false);
const termOfPayments = ref<TermOfPayment[]>([]);

const addNewPaymentTerm = () => {
  termOfPayments.value.push({
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
      termOfPayments.value = (termOfPayments.value ?? []).filter(
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

  if (data.unique_id) {
    termOfPayments.value = (termOfPayments.value ?? []).filter(
      (term) => term.unique_id !== data.unique_id
    );
  } else {
    submitDeletePaymentTerm(data);
  }
};
watch(
  termOfPayments,
  (val) => {
    emit("update:termOfPayments", val);
  },
  { deep: true }
);

onMounted(() => {
  console.log("props.data", props.data);
  if (props.data) {
    termOfPayments.value = props.data;
  }
});
</script>
