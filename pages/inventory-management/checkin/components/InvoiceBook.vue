<template></template>

<script lang="tsx" setup>
import { PaymentMethod, PaymentStatus } from "~/types/finance/bill";
import {
  FinanceReference,
  type Invoice,
  type InvoiceItem,
} from "~/types/finance/invoice";
import { PaymentTerm } from "~/types/scm/canvasing";

const isTermin = ref<boolean>(false);
const isLoading = ref<boolean>(false);

const ruleForm = reactive<Invoice>({
  unique_id: "",
  source_document: null,
  unique_code: "",

  customer_id: "",
  customer_name: "",
  customer_version: 1,
  payment_term_id: "",
  payment_term_view: "",
  billing_address_id: "",
  billing_address_version: 1,
  billing_address_view: "",

  invoice_date: Date.now(),
  due_date: null,

  is_tempo: false,
  payment_term: PaymentTerm.CASH,
  payment_term_value: 30,
  payment_term_unit: "day",
  payment_method: PaymentMethod.BankTransfer,
  recipient_bank: "",
  account_bank_name: null,
  account_bank_number: null,
  subject: "",
  pic_id: "",
  pic_name: "",
  pic_version: 0,
  type: "out",
  status: PaymentStatus.DRAFT,

  invoice_item: [
    {
      unique_id: "",
      unique_code: "",
      item_version: 1,
      item_name: "",
      unit_id: "",
      unit_name: "",
      quantity: 1,
      price: 0,
      total_amount: 0,
      created_at: Date.now(),
      created_by: 0,
      updated_at: Date.now(),
      item_id: null,
      version: 0,
      invoice_version: 0,
      invoice_id: null,
    },
  ],

  created_at: Date.now(),
  created_by: 0,
  updated_at: Date.now(),
  received_date: Date.now(),
  account_id: null,
  account_name: null,
  notes: null,
  reference: FinanceReference.OTHER,
  reference_id: null,
  reference_number: null,
  total_amount: 0,
  tmp_round: 0,
  display_total_amount: formatCurrencyID(0),
  subtotal: 0,
  paid_amount: 0,
  invoice_date_view: Date.now().toString(),
  due_date_view: Date.now().toString(),
  vendor_id: null,
  vendor_name: "",
  vendor_version: 0,
  vendor_address_id: "",
  vendor_address_view: "",
  vendor_address_version: 0,
  is_performa: false,
  is_termin: isTermin.value,
});

const rules = reactive({
  customer_name: [
    { required: true, message: "Please select customer", trigger: "blur" },
  ],
  vendor_name: [
    { required: true, message: "Please select a publisher", trigger: "blur" },
  ],
  // pic_name: [
  //   { required: true, message: "Please select a PIC", trigger: "blur" },
  // ],
  payment_term_id: [
    { required: true, message: "Please select a TOP", trigger: "blur" },
  ],
  vendor_address_view: [
    {
      required: true,
      message: "Please select a publisher address",
      trigger: "blur",
    },
  ],
  invoice_date: [
    {
      required: true,
      message: "Please select invoice date",
      trigger: "change",
    },
  ],
  payment_method: [
    {
      required: true,
      message: "Please select payment method",
      trigger: "change",
    },
  ],
  billing_address_view: [
    {
      required: true,
      message: "Please select billing address",
      trigger: "change",
    },
  ],
  invoice_item: [
    {
      validator: (
        _: any,
        value: InvoiceItem[],
        callback: (error?: Error) => void
      ) => {
        const messages: string[] = [];

        value.forEach((item, index) => {
          const rowNum = index + 1;
          if (!item.item_id)
            messages.push(`Item #${rowNum} tidak boleh kosong`);
          if (!item.unit_name)
            messages.push(`Item #${rowNum} belum memiliki UOM`);
          if (!item.price || item.price <= 0)
            messages.push(`Item #${rowNum} harga harus lebih dari 0`);
          if (!item.quantity || item.quantity < 1)
            messages.push(`Item #${rowNum} quantity minimal 1`);
        });

        if (messages.length > 0) {
          callback(new Error(messages.join("\n")));
        } else {
          callback();
        }
      },
      trigger: ["blur", "change"],
    },
  ],
});
</script>
