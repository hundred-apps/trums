<template>
    <TrumsWrapper>

        <el-page-header @back="goBack">
    <template #content>
        <span class="text-large font-600 mr-3"> Detail - {{ data?.data.name }} </span>
    </template>
    </el-page-header>
    <el-card class="my-3">
        <template #header>
        <div class="card-header flex justify-end">
          <el-button 
              type="primary" 
              @click="modalSelectContact = true"
            >
            Cetak Penawaran
          </el-button>
          
        </div>
      </template>
        <!-- <el-button type="primary" @click="onCheckout" :loading="loading">Proses</el-button> -->
        <div class="flex gap-3 my-3">
            <div class="flex-1">
                <el-descriptions
                    title=""
                    :column="1"
                    size="large"
                    border
                >
                <el-descriptions-item label="Nama">{{data?.data.name}}</el-descriptions-item>
                <el-descriptions-item label="Gudang">{{ data?.data.location?.name }}</el-descriptions-item>
                <el-descriptions-item label="Berlaku Mulai Tanggal">{{formatLocalDate(data?.data.start_date ?? 0)}}</el-descriptions-item>
                <el-descriptions-item label="Berakhir Tanggal">{{formatLocalDate(data?.data.end_date ?? 0)}}</el-descriptions-item>
                </el-descriptions>
            </div>
        </div>
        
        <h1 class="font-bold">Note</h1>
        <div class="text-sm" v-html="getNote"></div>
    </el-card>
    <el-card class="mb-3">
      <el-row :gutter="20" class="mb-3">
        <el-col :span="6"><el-input v-model="request_search_pricelist_item.keyword" size="large" placeholder="Type to search" /></el-col>
        
      </el-row>
      
      <el-table :data="data?.data.pricetag_item">
          <el-table-column prop="name" label="item">
              <template #default="scope">
                  {{ scope.row.catalogue.name }}
              </template>
          </el-table-column>
          <el-table-column prop="catalogue.sn" label="SN/PN" width="250"/>
          <el-table-column prop="quantity" label="QTY"width="70"/>
          <el-table-column prop="unit_name" label="UOM" width="100"/>
          <el-table-column prop="price" label="Harga Jual" width="140">
              <template #default="scope">
                {{ currency(scope.row.price) }}
              </template>
          </el-table-column>
      </el-table>
      <!-- <el-button class="mt-4" style="width: 100%" @click="addNewLine">
          Tambahkan Item
      </el-button> -->
        
    </el-card>
   
    <el-card class="mb-3">
        <template #header>
            <div class="card-header">
                <p>Terms & Condition</p>
            </div>
        </template>
        <span class="font-bold">Location</span>
        <div class="flex gap-2 my-3" v-if="data != null">
            <el-tag v-for="item in data.data.pricetag_condition.filter((value) => value.variable_pricetag!.name == VariablePriceTag.LOCATION)" v-bind:key="item.unique_id!" type="primary">{{item.value_data?.name}}</el-tag>
        </div>
        <span class="font-bold">Contact</span>
        <div class="flex gap-2 my-3" v-if="data != null">
            <el-tag v-for="item in data.data.pricetag_condition.filter((value) => value.variable_pricetag!.name == VariablePriceTag.KONTAK)" v-bind:key="item.unique_id!" type="primary">{{item.value_data?.name}}</el-tag>
        </div>
        <span class="font-bold">Item Quantity</span>
        <div class="flex gap-2 my-3" v-if="data != null">
            <el-tag v-for="item in data.data.pricetag_condition.filter((value) => value.variable_pricetag!.name == VariablePriceTag.ITEM_QUANTITY)" v-bind:key="item.unique_id!" type="primary">{{item.value}}</el-tag>
        </div>
    </el-card>

    <el-dialog
      v-model="showPreviewQuotation"
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
        <el-button @click="showPreviewQuotation = false">Tutup</el-button>
        <el-button type="success" @click="() => {}">Download PDF</el-button>
      </template>
    </el-dialog>
    <el-dialog
      v-model="modalSelectContact"
      title="Kontak"
      width="80%"
      destroy-on-close
    >
        <div class="mb-4">
            <el-form label-position="top" class="w-1/3">
                <el-form-item label="Nomor Quotation">
                    <el-input v-model="quotationNumber" placeholder="Masukkan nomor quotation" />
                </el-form-item>
                <el-form-item label="PIC">
                    <el-radio-group v-for="contact in getContactPricetag" v-model="quotationToId">
                        <el-radio :value="contact.value_data?.unique_id ?? ''" @change="() => handleSelectContact(contact)">{{contact.value_data?.name}}</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
        </div>

        
        
      <template #footer>
        <el-button @click="modalSelectContact = false">Tutup</el-button>
        <el-button type="success" @click="generateQuotation">Cetak</el-button>
      </template>
    </el-dialog>
    </TrumsWrapper>
</template>

<script lang="tsx" setup>
import { TrumsWrapper } from '#components';
import type { ComponentSize } from 'element-plus';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Inventory } from '~/types/inventory';
import type { Pricelist, Pricelist_item } from '~/types/pricelist';
import { VariablePriceTag, type Pricetag, type Pricetag_condition, type Pricetag_item } from '~/types/pricetag';
import { OrderColumn, type RequestSearch } from '~/types/request_search';
import type { BaseResponse } from '~/types/response';
import type { ResponsePagination } from '~/types/response_pagination';


definePageMeta({
    middleware:['auth', 'app'],
    name: "Trums Pricelist",
})

const router = useRouter();
const loading = ref<boolean>(false);    
const goBack = () => router.back();

const quotationToId = ref<string>('');
const quotationToName = ref<string>('');
const quotationNumber = ref<string>('');
const showPreviewQuotation = ref(false);
const pdfUrl = ref<string | null>(null);

const modalSelectContact = ref<boolean>(false);

const request_search_pricelist_item = ref<RequestSearch>({
  keyword: "",
  column: [],
  limit: "10",
  offset: "1",
  table: "pricelist",
  sort: {
    column: "created_at",
    order: OrderColumn.ASC,
  },
});

const id = ref<string>((router.currentRoute.value.params.id as string) ?? '')
const {data} = await useFetchApi<BaseResponse<Pricetag>>(`/pricetag-read/${id.value}`, 'pricetag-detail', 'get', null);

const pricelist_item_new = ref<Pricelist_item[]>([]);  

const size = ref<ComponentSize>('default')



const addNewLine = () => {
    console.log(data.value!.data.pricetag_item);
    // data.value!.data.pricetag_item = [...data.value!.data.pricetag_item, {
    //     catalogue: {
    //         id: null,
    //         unique_id: null,
    //         unique_code: null,
    //         name: '',
    //         brand_id: null,
    //         brand_name: null,
    //         year: null,
    //         sn: null,
    //         description: null,
    //         berat: null,
    //         volume: null,
    //         panjang: null,
    //         lebar: null,
    //         tinggi: null,
    //         is_asset: null,
    //         tmp_asset: null,
    //         version: null,
    //         type: 'item',
    //         created_at: null,
    //         created_by: null,
    //         updated_at: null,
    //         file_catalogues: []
    //     },
    //     catalogue_id: '',
    //     inventory: null,
    //     inventory_id: '',
    //     price: 0,
    //     tag_id: data.value!.data.unique_id,
    //     unique_id: '',
    // }]
}

const getContactPricetag = computed(() => {
    return data.value?.data.pricetag_condition.filter((value) => value.variable_pricetag!.name == VariablePriceTag.KONTAK);
})

function handleSelectContact(row: Pricetag_condition) {
console.log(row);
  quotationToId.value = row.value_data?.unique_id ?? '';
  quotationToName.value = row.value_data?.name ?? '';
}

const getNote = computed(() => {
    let message = data.value?.data.note ?? '';
    message = message.replace(/\r?\n/g, '<br>');
    return message;
})

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

const generateQuotationPdf = async () => {
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
  doc.addImage(imgLogo, "PNG", 160, 10, 40, 30)
  doc.addImage(tmsLogo, "PNG", 10, 10, 40, 30)

  // Header
  doc.setFontSize(18)
  doc.text("Quotation", 105, 50, { align: "center" })

  // Info
  doc.setFontSize(11)
  doc.text(`Number: ${quotationNumber.value}`, 10, 60)
  doc.text(`Subject: -`, 10, 66)
  doc.text(`Jakarta, ${formatted}`, 160, 60)

  doc.text(`To: ${quotationToName.value}`, 10, 70)
  doc.text(`PIC: ${quotationToName.value}`, 10, 77)

  // Body text
  doc.text("Bersama ini kami kirimkan penawaran sebagai berikut:", 10, 90)

  // Table
  autoTable(doc, {
    startY: 90,
    head: [["No", "Item", "Qty", "Unit", "Price", "Total"]],
    body: (data.value?.data.pricetag_item ?? []).map((item: Pricetag_item, i: number) => [
      i + 1,
      item.catalogue?.name ?? '',
      item.quantity,
      item.unit_name,
      `${currency(item.price || 0)}`,
      `${currency(item.quantity * (item.price || 0))}`
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
  doc.text(`${data.value?.data?.note ?? '-'}`, 20, finalY + 30)
  
  

  // Signature
  doc.text("Best Regards,", 10, finalY + 60)
  doc.text("Stanislaus Adrian Pratama,", 10, finalY + 90)
  doc.text("Operation Manager", 10, finalY + 100)

  return doc
}

const generateQuotation = async () => {
    const doc = await generateQuotationPdf()
    const blob = doc.output("blob")
    pdfUrl.value = URL.createObjectURL(blob)
    showPreviewQuotation.value = true
}

const querySearchAsyncInventories = (queryString: string, cb: (arg: any) => void) => {
    const query_search: RequestSearch = {
        table: 'inventories',
        column: [
            {
                location_id: [data.value?.data.location_id],
            },
        ],
        keyword: queryString,
        limit: "20",
        offset: "1",
        sort: null,
    }
    useFetchApi<ResponsePagination<Inventory[]>>('/search', 'inventories', 'post', query_search).then((response) => {
        if(response.status.value == 'success'){
            const inventories: Inventory[] = response.data?.value?.data ?? [];

            const results = inventories.map((data: Inventory) => {
                return {value: `${data.catalogue.name}-${data.location?.name}`, unique_id: data.unique_id, object: data};
            });    
            cb(results)
        }
    }).catch((error: any) => {
        ElMessage.error(`${error.response?.data?.message ?? error}`);
    })
}

const onHandleSelectItemAutocomplete = (record: Record<string, any>, scope: any) => {
    console.log(record)
    if(record.object != undefined){
        const inventory: Inventory = record.object as Inventory;
        data.value!.data.pricetag_item[scope.$index].inventory_id = inventory.unique_id!;
        data.value!.data.pricetag_item[scope.$index].price = inventory.selling_price ?? 0;
    }

}

const onChangeQuantity = (e: string, scope: any) => {
    // data.value!.data.items[scope.$index]. = parseInt(e);
}

const onChangeSellingPrice = (e: string, scope: any) => {
    data.value!.data.pricetag_item[scope.$index].price = parseInt(e ?? '0');
}


</script>