<template>
    <el-card class="my-3" shadow="never">
          <template #header>
            <div class="card-header flex justify-between">
              <el-form-item label="Tipe Summery" style="margin: 0 !important">
                <el-radio-group v-model="typeSummery">
                  <el-radio value="satuan">Satuan</el-radio>
                  <el-radio value="total">Total</el-radio>
                </el-radio-group>
              </el-form-item>
              <div>
                <NuxtLink 
                  v-if="canAccess('pricetag-update', dataInterface?.privilege ?? [])"
                  :href="`/sales/offer/add?id=${dataInterface?.data?.unique_id}`"
                  class="el-button el-button--defult"
                >
                Edit
              </NuxtLink>
              <el-button 
                  type="primary" 
                  @click="generateQuotation"
                >
                Cetak Penawaran
              </el-button>
              </div>
              
            </div>
          </template>
            <!-- <el-button type="primary" @click="onCheckout" :loading="loading">Proses</el-button> -->
            <div class="flex gap-3 my-3">
                <div class="flex-1">
                    <el-descriptions
                        title=""
                        :column="1"
                        size="small"
                        border
                    >
                    <el-descriptions-item label="Nomor Penawaran">{{dataInterface?.data?.name}}</el-descriptions-item>
                    <el-descriptions-item label="Dari">{{dataInterface?.data?.owner?.name ?? 'N/A'}}</el-descriptions-item>
                    <el-descriptions-item label="Kepada">{{dataInterface?.data?.to?.name ?? 'N/A'}}</el-descriptions-item>
                    <el-descriptions-item label="Subject">{{dataInterface?.data?.subject ?? 'N/A'}}</el-descriptions-item>
                    <el-descriptions-item label="Berlaku Mulai Tanggal">{{formatLocalDate(dataInterface?.data?.start_date ?? 0)}}</el-descriptions-item>
                    <el-descriptions-item label="Berakhir Tanggal">{{formatLocalDate(dataInterface?.data?.end_date ?? 0)}}</el-descriptions-item>
                    </el-descriptions>
                </div>
            </div>
            
            <h1 class="font-bold">Note</h1>
            <div class="text-sm" v-html="getNote"></div>
        </el-card>
        <el-card class="mb-3" shadow="never">
          <el-row :gutter="20" class="mb-3">
            <el-col :span="6"><el-input v-model="request_search_pricelist_item.keyword" size="small" placeholder="Type to search" /></el-col>
            
          </el-row>
          
          <el-table :data="dataInterface?.data?.pricetag_item" size="small" border>
              <el-table-column prop="name" label="item" width="300">
                  <template #default="scope">
                      {{ scope.row.catalogue.name }}
                  </template>
              </el-table-column>
              <el-table-column prop="catalogue.sn" label="SN/PN"/>
              <el-table-column prop="quantity" label="QTY"width="70"/>
              <el-table-column prop="unit_name" label="UOM" width="100"/>
              <el-table-column prop="price" label="Harga Jual" width="140" align="right">
                  <template #default="scope">
                    {{ currency(scope.row.price) }}
                  </template>
              </el-table-column>
          </el-table>
          <!-- <el-button class="mt-4" style="width: 100%" @click="addNewLine">
              Tambahkan Item
          </el-button> -->
            
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
            <el-button type="success" @click="downloadPdf">Download PDF</el-button>
          </template>
        </el-dialog>
</template>

<script lang="tsx" setup>
import { TrumsWrapper } from '#components';
import { Edit } from '@element-plus/icons-vue';
import type { ComponentSize } from 'element-plus';
import jsPDF from 'jspdf';
import autoTable, { type CellDef, type CellInput, type RowInput } from 'jspdf-autotable';
import type { AddressType } from '~/types/address';
import type { Inventory } from '~/types/inventory';
import type { Pricelist, Pricelist_item } from '~/types/pricelist';
import { VariablePriceTag, type Pricetag, type Pricetag_condition, type Pricetag_item } from '~/types/pricetag';
import { OrderColumn, type RequestSearch } from '~/types/request_search';
import type { BaseResponse, DataInterface } from '~/types/response';
import type { ResponsePagination } from '~/types/response_pagination';
import { PaymentTerm, paymentTermView, type Canvassing } from '~/types/scm/canvasing';
import { formatLocalDate, currency, canAccess } from '#imports';


const router = useRouter();
const loading = ref<boolean>(false);    
const goBack = () => router.back();

const quotationToId = ref<string>('');
const quotationToName = ref<string>('');
const quotationNumber = ref<string>('');
const showPreviewQuotation = ref(false);
const pdfUrl = ref<string | null>(null);
const typeSummery = ref<"satuan"|"total">("satuan");
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

const props = defineProps<{
    dataInterface: DataInterface<Pricetag>
}>()

const pricelist_item_new = ref<Pricelist_item[]>([]);  

const size = ref<ComponentSize>('default')

const pdfBlob = ref<Blob | null>(null);


const addNewLine = () => {
    
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


function handleSelectContact(row: Pricetag_condition) {
console.log(row);
  quotationToId.value = row.value_data?.unique_id ?? '';
  quotationToName.value = row.value_data?.name ?? '';
}

const getNote = computed(() => {
    let message = props.dataInterface?.data?.note ?? '';
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
  doc.addImage(imgLogo, "PNG", 160, 15, 40, 20)
  doc.addImage(tmsLogo, "PNG", 10, 10, 40, 30)

  // Header
  doc.setFontSize(18)
  doc.text("Quotation", 105, 50, { align: "center" })

  // Info
  doc.setFontSize(11)
  doc.text(`Number: ${props.dataInterface?.data?.name}`, 10, 60)
  doc.text(`Subject: ${props.dataInterface?.data?.subject ?? '-'}`, 10, 66)
  doc.text(`Jakarta, ${formatted}`, 160, 60)

  doc.text(`To: ${props.dataInterface?.data?.to?.name ?? '-'}`, 10, 72)
  // doc.text(`PIC: ${quotationToName.value}`, 10, 77)

  // Body text
  doc.text("Bersama ini kami kirimkan penawaran sebagai berikut:", 10, 90)

  const grandTotal = (props.dataInterface?.data?.pricetag_item ?? []).reduce((acc, item) => {
    return acc + (item.quantity * item.price);
  }, 0);

  

  let rowData: RowInput[] = (props.dataInterface?.data?.pricetag_item ?? []).map((item: Pricetag_item, i: number) => [
    { content: `${i + 1}`, styles: { halign: 'left' } },
    { content: `${item.catalogue?.name}`, styles: { halign: 'left' } },
    { content: `${item.quantity}`, styles: { halign: 'right' } },
    { content: `${item.unit_name}`, styles: { halign: 'left' } },
    { content: `${currencyWithoutSymbol(item.price)}`, styles: { halign: 'right' } },
    { content: `${currencyWithoutSymbol(item.quantity * (item.price || 0))}`, styles: { halign: 'right' } },
  ])

  // console.log(rowData);
  // rowData.push(['','','','','Total Price',grandTotal])
  // rowData.push(['','','','','PPN','11%'])


  if(typeSummery.value === 'total'){
    rowData.push([{content: `Total Price`, styles: { halign: 'right', fontStyle: "bold" }, colSpan: 5}, {content: `${currencyWithoutSymbol(grandTotal)}`, styles: { halign: 'right' }}])
    rowData.push([{content: `PPN (11%)`, styles: { halign: 'right', fontStyle: "bold" }, colSpan: 5}, {content: `${currencyWithoutSymbol((grandTotal * 0.11))}`, styles: { halign: 'right' }}])
    rowData.push([{content: `Total`, styles: { halign: 'right', fontStyle: "bold" }, colSpan: 5}, {content: `${currencyWithoutSymbol(grandTotal + (grandTotal * 0.11))}`, styles: { halign: 'right' }}])
  }
  // Table
  autoTable(doc, {
    startY: 96,
    head: [["No", "Item", "Qty", "Unit", "Price", "Total"]],
    body: rowData,
    styles: { fontSize: 10 },
    margin: { left: 10 },
    headStyles: { fillColor: [200, 200, 200] }
  })

  

  // // Summary
  let finalY = (doc as any).lastAutoTable.finalY + 10
  // doc.text(`Total Price: Rp ${currency(grandTotal)}`, 140, finalY)
  // doc.text(`PPN: Rp ${currency(grandTotal)}`, 140, finalY + 10)

  // finalY += 10
  // doc.text(`Grand Total: Rp ${currency(grandTotal.value)}`, 140, finalY)


  const canvassing: Canvassing|undefined = props.dataInterface?.data?.reference_data;

  // Notes
  doc.text("Notes:", 10, finalY + 5)

  if(canvassing){
    doc.text(`\u2022 Dikirim ke ${generateResultSearchAddress(canvassing?.address ?? null).name}`, 20, finalY + 15)
    doc.text(`\u2022 ${canvassing.payment_term == PaymentTerm.TEMPO ? `${paymentTermView(canvassing.payment_term)} ${canvassing.tempo_value} Hari` : paymentTermView(canvassing.payment_term)}`, 20, finalY + 20)
  }
  
  if(props.dataInterface?.data?.note){
    const splits = `${props.dataInterface?.data?.note}`.split('\n');

    let yFinal = Number(finalY) + Number(20);
    splits.forEach((value) => {
      yFinal = yFinal + Number(5);
      console.log('final Y', yFinal);
      doc.text(`\u2022 ${value ?? '-'}`, 20, yFinal);
    })

  }
  
  

  // Signature
  doc.text("Best Regards,", 10, finalY + 80)

  if(props.dataInterface?.data?.type === "in"){
    doc.text(props.dataInterface?.data?.owner?.name ?? '', 10, finalY + 110)
  }else{
    doc.text("Stanislaus Adrian Pratama,", 10, finalY + 110)
    doc.text("Operation Manager", 10, finalY + 120)
  }

  const blob = doc.output("blob")
  pdfBlob.value = blob;
  pdfUrl.value = URL.createObjectURL(blob);


  return { doc, blob }
}

const generateQuotation = async () => {
    const {doc} = await generateQuotationPdf()
    const blob = doc.output("blob")
    pdfUrl.value = URL.createObjectURL(blob)
    showPreviewQuotation.value = true
}

const downloadPdf = () => {
  if (!pdfBlob.value) {
    ElMessage.warning('Tidak ada PDF untuk di-download')
    return
  }
  
  const filename = `Quotation-${props.dataInterface?.data?.name || 'document'}.pdf`
  
  // Buat URL object untuk blob
  const url = URL.createObjectURL(pdfBlob.value)
  
  // Buat anchor element untuk download
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  
  // Cleanup
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  // ElMessage.success('PDF berhasil di-download')
}

const querySearchAsyncInventories = (queryString: string, cb: (arg: any) => void) => {
    const query_search: RequestSearch = {
        table: 'inventories',
        column: [
            {
                location_id: [props.dataInterface?.data?.location_id],
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



</script>