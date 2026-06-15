<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from "vue";
import {
  type AdjustmentTransaction,
  FeeType,
  type ReferenceTransactionAdjustment,
  ReferenceAdjustment,
  PartyType,
} from "~/types/attribute_adjustment";
import type { Contact } from "~/types/contact";
import type { RequestSearch } from "~/types/request_search";
import type { BaseResponse } from "~/types/response";
import type { ResponsePagination } from "~/types/response_pagination";
const request_search_contact = ref<RequestSearch>({
  column: [],
  keyword: "",
  limit: "10",
  offset: "1",
  sort: null,
  table: "contacts",
});

const props = defineProps<{
  modelValue: boolean;
  item: {
    index: string;
    name: string;
    vendor_name: string;
    unit_fee: FeeType;
  };
  contacts: ReferenceTransactionAdjustment[];
  adjustment: AdjustmentTransaction;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (
    e: "save",
    payload: { item: any; contacts: ReferenceTransactionAdjustment[] }
  ): void;
}>();

const visible = ref(props.modelValue);
watch(
  () => props.modelValue,
  (v) => (visible.value = v)
);
watch(visible, (v) => emit("update:modelValue", v));

const contactsFee = ref<ReferenceTransactionAdjustment[]>([]);

watch(
  () => props.contacts,
  (newVal) => {
    // clone data biar tidak ubah props langsung
    contactsFee.value = (newVal ?? []).map((contact) => ({
      ...contact,
      party: contact.party, // Clone party object juga
    }));

    console.log(props.contacts);
  },
  { immediate: true }
);

// tambah kontak baru
const addContact = (contact?: ReferenceTransactionAdjustment) => {
  contactsFee.value.push({
    unique_id: "",
    reference: ReferenceAdjustment.CANVASSINGVENDOR,
    reference_id: "",
    adjustment_id: `${props.adjustment.unique_id}`,
    adjustment: props.adjustment,
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
      internal_id: "0",
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
    party_type: PartyType.CONTACT,
  });
};

// hapus kontak
const removeContact = (index: number) => {
  contactsFee.value.splice(index, 1);
};

const onHandleSelectContact = async (
  item: Record<string, any>,
  index: number
) => {
  console.log(item);
  if (item.isNew) {
    const contact: Contact | null = await createNewContact({
      name: item.query,
    });
    if (contact !== null) {
      contactsFee.value[index].reference = ReferenceAdjustment.CONTACT;
      contactsFee.value[index].reference_id = contact.unique_id;
      contactsFee.value[index].reference_view = contact.name;
      contactsFee.value[index].party_id = contact.unique_id;
      contactsFee.value[index].party = contact;
    }
  } else {
    const contact: Contact = item as Contact;
    contactsFee.value[index].reference = ReferenceAdjustment.CONTACT;
    contactsFee.value[index].reference_id = contact.unique_id;
    contactsFee.value[index].reference_view = contact.name;
    contactsFee.value[index].party_id = contact.unique_id;
    contactsFee.value[index].party = contact;
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

const handleSave = () => {
  console.log("handle save", contactsFee.value);

  emit("save", {
    item: props.item,
    contacts: contactsFee.value,
  });
  visible.value = false;
};
</script>

<template>
  <el-drawer v-model="visible" title="Pembagian Fee" size="60%">
    <div v-if="item">
      <p><b>Item:</b> {{ item.name }}</p>
      <p><b>Vendor:</b> {{ item.vendor_name }}</p>

      <el-divider />

      <div class="mb-3">
        <el-button type="primary" @click="addContact()"
          >+ Tambah Kontak</el-button
        >
      </div>

      <el-table :data="contactsFee" border style="width: 100%">
        <el-table-column label="Nama">
          <template #default="{ row, $index }">
            <el-autocomplete
              v-model="row.party.name"
              :disabled="readonly == true"
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

        <el-table-column
          :label="`Fee (${item.unit_fee == FeeType.PERCENT ? '%' : 'Rp'})`"
        >
          <template #default="{ row }">
            <el-input-number
              :disabled="readonly == true"
              v-model="row.amount"
              :min="0"
              :max="100"
            />
          </template>
        </el-table-column>

        <el-table-column label="Aksi" width="100">
          <template #default="{ $index }">
            <el-button
              type="danger"
              link
              :disabled="readonly == true"
              @click="removeContact($index)"
            >
              Hapus
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2 mt-4">
        <el-button @click="visible = false">Batal</el-button>
        <el-button type="primary" @click="handleSave">Simpan</el-button>
      </div>
    </template>
  </el-drawer>
</template>
