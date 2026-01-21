<template>
    <div class="">
        <el-form :inline="true" ref="ruleFormRef" :disabled="loading" :model="formInline" class="demo-form-inline" :rules="rules" label-width="auto" >
            <div class="flex">
                <div class="flex flex-1">
                    <el-form-item>
                        <el-button type="primary" @click="() => submitForm(ruleFormRef)">Simpan</el-button>
                    </el-form-item>
                </div>
                <div class="flex flex-1">
                    <el-form-item label="Status" prop="status">
                        <el-radio-group
                            v-model="formInline.status"
                            aria-label="status"
                            size="small"
                        >
                            <el-radio-button value="draft">Draft</el-radio-button>
                            <el-radio-button value="waiting">Waiting</el-radio-button>
                            <el-radio-button value="ready">Book</el-radio-button>
                            <el-radio-button value="delivery">Delivery</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                </div>
            </div>
            
            <div class="flex">
                <div class="flex flex-col flex-1">
                    <el-form-item label="Type" prop="type">
                        <el-radio-group v-model="formInline.type" aria-label="label position">
                            <el-radio-button value="in">Check In</el-radio-button>
                            <el-radio-button value="out">Check Out</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="Reference" prop="reference">
                        <el-select v-model="formInline.reference!" style="width: 100%" @change="(val) => requestSearchSalesOrder.column = [
                            {
                                type: [val]
                            }
                        ]">
                            <el-option 
                                v-for="status in [{label: 'Purchase Order', value: 'po'},{label: 'Sales Order', value: 'so'}]" 
                                :key="status.value" 
                                :label="status.label" 
                                :value="status.value" 
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Nomor Reference" prop="reference_id">
                        <div class="flex gap-2">
                            <el-input v-model="formInline.reference_view" placeholder="Pilih Nomor Referensi" :disabled="true"/>
                            <el-button :icon="Search" type="primary" size="default" @click="() => dialogSalesOrder = true"/>
                        </div> 
                    </el-form-item>
                    <el-form-item label="Lokasi Awal" prop="location">
                        <el-input
                            v-model="formInline.location"
                            style="max-width: 600px"
                            placeholder="Masukan Lokasi Awal"
                            class="input-with-select"
                            >
                            <template #append>
                                <el-button :icon="Search" @click="() => showModal(0)" />
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Tujuan" prop="to_name">
                        <el-input
                            v-model="formInline.to_name"
                            style="max-width: 600px"
                            placeholder="Masukan Tujuan"
                            class="input-with-select"
                            >
                            <template #append>
                                <el-button :icon="Search" @click="() => showModal(1)" />
                            </template>
                        </el-input>
                    </el-form-item>
                </div>
                <div class="flex flex-col flex-1 justify-start">
                    
                    <el-form-item label="Alamat" prop="address_name">
                        <el-autocomplete
                            v-model="formInline.address_name"
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
                    <el-form-item label="Nomor Dokumen" prop="source_document">
                        <el-input v-model="formInline.source_document" placeholder="Nomor Dokumen" clearable />
                    </el-form-item>
                    <el-form-item label="Upload Dokumen" prop="source_document">
                        <el-upload
                            v-model:file-list="fileList"
                            class="upload-demo"
                            action=""
                            multiple
                            :on-preview="handlePreview"
                            :on-remove="handleRemove"
                            :before-remove="beforeRemove"
                            :limit="1"
                            :on-exceed="handleExceed"
                        >
                            <el-button type="primary">Click to upload</el-button>
                            <template #tip>
                                <div class="el-upload__tip">
                                    jpg/png files with a size less than 500KB.
                                </div>
                            </template>
                        </el-upload>
                    </el-form-item>
                </div>
            </div>
            
            
        </el-form>

        <div class="mb-3">
            <el-table :data="tableItem" border>
                <el-table-column prop="item_name" label="item"/>
                <el-table-column prop="sn" label="Serial Number" width="180"/>
                <el-table-column prop="is_traceable" label="Track Inventory" width="200">
                    <template #default="scope">
                        <el-radio-group v-model="scope.row.is_traceable" @change="(value) => console.log(value)">
                            <el-radio value="1">Ya</el-radio>
                            <el-radio value="0">Tidak</el-radio>
                        </el-radio-group>
                    </template>
                </el-table-column>
                <el-table-column prop="quantity" label="QTY" width="100"/>
                <el-table-column prop="unit_name" label="Unit" width="180"/>
                <el-table-column prop="cost" label="Harga" width="180">
                    <template #default="scope">
                        {{currencyWithoutSymbol(scope.row.cost|0)}}
                    </template>
                </el-table-column>
            </el-table>
            
        </div>
    </div>




    <!-- Modal -->
     <el-dialog v-model="dialog" title="Cari" width="800">
        <el-tabs type="border-card">
            <el-tab-pane label="Gudang">
                <el-input
                    v-model="requestSearchLocation.keyword"
                    style="width: 240px"
                    size="default"
                    placeholder="Cari Lokasi"
                    :suffix-icon="Search"
                />
                <trums-table-custom-table :columns="columnLocation" :data="locations?.data.value?.data ?? []" />
                <div class="flex justify-end mt-3">
                    <el-pagination background layout="prev, pager, next" :total="locations?.data.value?.total_data"  @change="(val: number) => paginationClick(val, 'location')" />
                </div>
            </el-tab-pane>
            <el-tab-pane label="Kontak">
                <el-input
                    v-model="requestSearchContact.keyword"
                    style="width: 240px"
                    size="default"
                    placeholder="Cari Kontak"
                    :suffix-icon="Search"
                />
                <trums-table-custom-table :columns="columnContact" :data="contacts?.data.value?.data ?? []" />
                <div class="flex justify-end mt-3">
                    <el-pagination background layout="prev, pager, next" :page-size="Number(requestSearchContact.limit)" :total="contacts?.data.value?.total_data"  @change="(val: number) => paginationClick(val, 'contact')" />
                </div>
            </el-tab-pane>
        </el-tabs>
    </el-dialog>

    <el-dialog v-model="dialogSalesOrder" title="Daftar SO" width="1200">
        <el-row :gutter="20" class="mb-3">
          <el-col :span="6">
            <el-input
                v-model="requestSearchSalesOrder.keyword"
                class="responsive-input"
                placeholder="Cari Sales/Purchase Order"
                width="50%"
                :prefix-icon="Search"
              />
          </el-col>
        </el-row>
        
        <el-table :data="sales_order.data.value?.data ?? []" border>
          <el-table-column label="Unique Code" width="150">
            <template #default="scope">
              <NuxtLink :href="`/sales/order/${scope.row.unique_code}`" class="text-blue-600">{{ scope.row.unique_code }}</NuxtLink>
            </template>
          </el-table-column>
          <el-table-column label="Customer">
              <template #default="scope">
                {{ scope.row.vendor_name }}
              </template>
          </el-table-column>
          <el-table-column label="Tanggal SO">
            <template #default="scope">
                {{ formatLocalDate(scope.row.date) }}
            </template>
          </el-table-column>
          <el-table-column label="Total" align="right">
            <template #default="scope">
                {{ currency(scope.row.total_price) }}
            </template>
          </el-table-column>
          <el-table-column label="Aksi" align="right" width="100">
            <template #default="scope">
                <el-button type="primary" size="small" @click="() => onSelectReference_id(scope.row)">pilih</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="flex justify-end mt-3">
          <el-pagination background layout="prev, pager, next" :total="sales_order?.data.value?.total_data" @next-click="(val: number) => paginationClick(val, 'sales_order')" @prev-click="(val: number) => paginationClick(val, 'sales_order')" @change="(val: number) => handleSizeChange(val, 'sales_order')" />
        </div>
      </el-dialog>

    <el-dialog v-model="dialogNewAddress" title="Create New Address" width="500">
        <FormAddress 
            :onSetInitital="{ contact_id: formInline.location_id, contact_name: formInline.location }" 
            :onSuccess="onAddNewAddress" 
        />
    </el-dialog>
</template>

<script lang="tsx" setup>
import { ElButton, type Column, type FormInstance, type FormRules, type UploadProps, type UploadUserFile } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import type { Catalogue } from '~/types/catalogue';
import type { Contact } from '~/types/contact';
import type { ResponsePagination } from '~/types/response_pagination';
import type { RequestSearch } from '~/types/request_search';
import type { PurchaseOrder } from '~/types/scm/purchase_order';
import type { AddressType } from '~/types/address';
import FormAddress from '~/components/trums/FormAddress.vue';
import { currency, currencyWithoutSymbol, formatLocalDate } from '#imports';
interface formCheckInOut {
    type: string,
    location: string,
    location_id: string,
    version: number,
    reference: string|null,
    reference_id: string|null,
    reference_from: string,
    reference_view: string,
    to: string,
    reference_to: string,
    to_name: string,
    to_version: number,
    address_id: string,
    address_version: number|null,
    address_name: string,
    schedule_date: string|null,
    source_document: string|null,
    status: string,
}
const loading = ref<boolean>(false);
const dialog = ref<boolean>(false);
const dialogSalesOrder = ref<boolean>(false);
const dialogNewAddress = ref<boolean>(false);
const fromOrTo = ref<number>(0);
const ruleFormRef = ref<FormInstance>()
const tableItem = ref<inititalTable[]>([]);
const fileList = ref<UploadUserFile[]>([]);

const requestSearchLocation = ref<RequestSearch>({
    keyword: '',
    table: 'catalogues',
    column: [
        {
            type: ["place"]
        }
    ],
    sort: null,
    limit: '10',
    offset: '1',
})
const requestSearchContact = ref<RequestSearch>({
    keyword: '',
    table: 'contacts',
    column: [],
    sort: null,
    limit: '10',
    offset: '1',
})

const locations = await useFetchApi<ResponsePagination<Catalogue[]>>('/search', 'fetch-locations', 'post', requestSearchLocation.value);
// watcher
watch(requestSearchLocation.value, () => refreshNuxtData('fetch-locations'), {immediate: true});

const contacts = await useFetchApi<ResponsePagination<Contact[]>>('/search', 'fetch-contacts', 'post', requestSearchContact.value);
// watcher
watch(requestSearchContact.value, () => refreshNuxtData('fetch-contacts'), {immediate: true});



let formInline = reactive<formCheckInOut>({
    type: useCookie('type').value ?? 'in',
    location: '',
    location_id: '',
    version: 0,
    reference_from: '',
    reference: null,
    reference_view: '',
    to: '',
    reference_to: '',
    to_name: '',
    to_version: 0,
    address_id: '',
    address_version: null,
    address_name: '',
    schedule_date: null,
    source_document: null,
    status: 'draft',
    reference_id: null
});

const requestSearch = ref<RequestSearch>({
    keyword: '',
    table: 'catalogues',
    column: [],
    sort: null,
    limit: '10',
    offset: '1',
})
const requestSearchSalesOrder = ref<RequestSearch>({
    keyword: '',
    table: 'purchase_order',
    column: [
        {
            type: ["so"]
        }
    ],
    sort: null,
    limit: '10',
    offset: '1',
})

const sales_order = await useFetchApi<ResponsePagination<Catalogue[]>>('/search', 'sales-order', 'post', requestSearchSalesOrder.value);
// watcher
watch(requestSearchSalesOrder.value, () => refreshNuxtData('sales-order'), {immediate: true});

const showModal = (arg: number) => {
    fromOrTo.value = arg;
    dialog.value = true;
}

const columnLocation: Column<Catalogue>[] = [
    {
        title: 'Item', 
        dataKey: 'name',
        key: 'name',
        width: 200,
    },
    {
        title: 'Operasi', 
        dataKey: '',
        key: '',
        width: 200,
        cellRenderer: ({rowData: row}) => <><ElButton type='primary' onClick={() => selectedModal('catalogue', row, fromOrTo.value == 0? setFrom : setTo)}>Pilih</ElButton></>
    }
]

const columnContact: Column<Contact>[] = [
    {
        title: 'Item', 
        dataKey: 'name',
        key: 'name',
        width: 200,
    },
    {
        title: 'Operasi', 
        dataKey: '',
        key: '',
        width: 200,
        cellRenderer: ({rowData: row}) => <><ElButton type='primary' onClick={() => selectedModal('contact',row, fromOrTo.value == 0? setFrom : setTo)}>Pilih</ElButton></>
    }
]

const selectedModal = (reference_to: string, value: any, cb: (reference_to: string,args: any) => void) => {
    dialog.value = false;
    cb(reference_to, value);
}

const querySearchAddress = (queryString: string, cb: (arg: any) => void) => {
    const newSearch = unref(requestSearch);
    newSearch.keyword = queryString;
    newSearch.table = 'address';
    newSearch.column = []
    newSearch.limit = "10";
    newSearch.offset = "1";
    newSearch.flag = 'form';

    
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

const generateResultSearchAddress = (address: AddressType) => {
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
    }
}

const handleSelectAddress = (record: Record<string, any>) => {
    if(record.new){
        dialogNewAddress.value = true;
    }else{
        console.log(record);
        // const address: AddressType = record as AddressType;
        formInline.address_id = record.address_id;
        formInline.address_version = record.address_version;
        formInline.address_name = record.name;

    }
}

const onSelectReference_id = async (data: PurchaseOrder) => {

    console.log('reference', formInline.reference);
    console.log('data', data);

    tableItem.value = [];
    if(formInline.reference === 'po'){
        formInline.reference_view = data.unique_code ?? '';
        formInline.reference_id = data.unique_id ?? '';
        formInline.reference_from = 'contact';
        formInline.location = data.vendor?.name ?? '';
        formInline.location_id = data.vendor?.unique_id ?? '';
        formInline.version = data.vendor?.version ?? 0;
        dialogSalesOrder.value = false;

        
    }else if(formInline.reference === 'so'){
        formInline.reference_view = data.unique_code ?? '';
        formInline.reference_id = data.unique_id ?? '';
        formInline.reference_to = 'contact';
        // formInline.location = data.vendor?.name ?? '';
        // formInline.location_id = data.vendor?.unique_id ?? '';
        // formInline.version = data.vendor?.version ?? 0;
        formInline.to = data.vendor?.unique_id ?? '';
        formInline.to_name = data.vendor?.name ?? '';
        formInline.to_version = data.vendor?.version ?? 0;
        dialogSalesOrder.value = false;
    }

    data.purchase_order_item.forEach(element => {
        console.log('po item', element);
        tableItem.value.push({
            unique_id: '',
            id: 0,
            item_request: '',
            reference: null,
            reference_id: null,
            reference_view: null,
            reference_item: null,
            item_name: element.catalogue_name ?? '',
            catalogue_id: element.catalogue_id ?? '',
            inventory_id: '',
            quantity: element.quantity ?? 0,
            cost: element.unit_price ?? 0,
            selling_price: null,
            sn: element.catalogue?.sn ?? '',
            unit_id: element.unit_id ?? '',
            unit_name: element.unit_name ?? '',
            contact_id: '',
            contact_name: '',
            contact_version: 0,
            request_qty: 0,
            is_traceable: '',
            quantity_to_in: null
        });
    });


}

const setFrom = (reference_from: string,value: any) => {
    formInline.reference_from = reference_from;
    formInline.location = value.name;
    formInline.location_id = value.unique_id;
    formInline.version = value.version;
    
    // requestSearchPricelist.value.column![0].location_id = [value.unique_id];
}

const setTo = (reference_to: string, value: any) => {
    formInline.to_name = value.name;
    formInline.to = value.unique_id;
    formInline.to_version = value.version;
    formInline.reference_to = reference_to;
    
}

const rules = reactive<FormRules<formCheckInOut>>({
      location: [
        {
          required: true,
          message: 'Masukan lokasi awal',
          trigger: 'change',
        },
      ],
      to_name: [
        {
          required: true,
          message: 'Masukan Nama Customer',
          trigger: 'change',
        },
      ],
      to: [
        {
          required: true,
          message: 'Masukan Customer',
          trigger: 'change',
        },
      ],
      type: [
        {
          required: true,
          message: 'Masukan Type',
          trigger: 'change',
        },
      ],
      
})

interface inititalTable {
    id: number,
    unique_id: string,
    item_request: string|null,
    reference: string|null,
    reference_id: string|null,
    reference_view: string|null,
    reference_item: string|null,
    item_name: string,
    catalogue_id: string|null,
    inventory_id: string,
    quantity: number|null,
    cost: number|null,
    selling_price: number|null,
    sn: string,
    unit_id: string,
    unit_name: string,
    contact_id: string,
    contact_name: string,
    contact_version: number,
    inventory_version?: number,
    request_qty: number,
    is_traceable: string,
    quantity_to_in: number|null,
}

const handleRemove: UploadProps['onRemove'] = (file, uploadFiles) => {
    console.log(file, uploadFiles)
}

const handlePreview: UploadProps['onPreview'] = (uploadFile) => {
    console.log(uploadFile)
}

const handleExceed: UploadProps['onExceed'] = (files, uploadFiles) => {
    ElMessage.warning(
        `The limit is 3, you selected ${files.length} files this time, add up to ${
            files.length + uploadFiles.length
        } totally`
    )
}

const beforeRemove: UploadProps['beforeRemove'] = (uploadFile, uploadFiles) => {
    return ElMessageBox.confirm(
        `Cancel the transfer of ${uploadFile.name} ?`
    ).then(
        () => true,
        () => false
    )
}

const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
        if (valid) {
            onSubmit();
        } else {
        console.log('error submit!', fields)
        }
    })
}

const onSubmit = async () => {
    loading.value = true;
    try {
        
        const data = {
            type: formInline.type,
            from_name: formInline.location,
            from: formInline.location_id,
            from_version: formInline.version,
            reference_id: formInline.reference_id,
            reference: formInline.reference,
            address_id: formInline.address_id,
            address_version: formInline.address_version,
            schedule_date: null,
            source_document: formInline.source_document,
            status: formInline.status,
            movement_item: tableItem.value.map((value) => {
                return {
                    'reference': value.reference,
                    'reference_id': value.reference_id,
                    'inventory_id': value.inventory_id,
                    'quantity': parseInt(value.quantity?.toString() ?? "1"),
                    'cost': value.cost,
                    'selling_price': value.selling_price ?? 0,
                    'sn': value.sn,
                }
            }),
        }

        const formData = new FormData();

        formData.append('type', formInline.type)
        formData.append('from_name', formInline.location)
        formData.append('from', formInline.location_id)
        formData.append('from_version', formInline.version.toString())

        formData.append('reference_id', `${formInline.reference_id}`)
        if(formInline.reference != null){
            formData.append('reference', formInline.reference)
        }
        formData.append('reference_from', formInline.reference_from)
        formData.append('reference_to', formInline.reference_to)
        formData.append('to', formInline.to)
        formData.append('to_name', formInline.to_name)
        formData.append('to_version', formInline.to_version.toString())
        formData.append('address_id', formInline.address_id)
        formData.append('address_version', (formInline.address_version ?? 0).toString())
        formData.append('source_document', formInline.source_document ?? '')
        formData.append('status', formInline.status)

        tableItem.value.forEach((element, index) => {

            if(element.catalogue_id != null){
                formData.append(`movement_item[${index}][catalogue_id]`, element.catalogue_id)
            }
            formData.append(`movement_item[${index}][unit_name]`, element.unit_name)
            formData.append(`movement_item[${index}][name]`, element.item_name)
            formData.append(`movement_item[${index}][unit_id]`, element.unit_id)

            if(element.inventory_id != ''){
                formData.append(`movement_item[${index}][inventory_id]`, element.inventory_id)
            }

            formData.append(`movement_item[${index}][quantity]`, element.quantity?.toString()!)
            formData.append(`movement_item[${index}][cost]`, (element.cost ?? 0).toString())
            formData.append(`movement_item[${index}][selling_price]`, (element.selling_price ?? 0).toString());
            formData.append(`movement_item[${index}][sn]`, element.sn)
            formData.append(`movement_item[${index}][is_traceable]`, (element.is_traceable == "1" ? true : false).toString())

            if(element.contact_id != ''){
                formData.append(`movement_item[${index}][contact_id]`, element.contact_id)
                formData.append(`movement_item[${index}][contact_name]`, element.contact_name)
                formData.append(`movement_item[${index}][contact_version]`, element.contact_version.toString())
            }

            


        });

        fileList.value.forEach((element, index) => {
            formData.append(`files[${index}]`, element.raw as Blob);
        });


        
        console.log(data);

        const response = await useFetchApi('/inventory-movement-create', 'inventory-movement-create', 'post', formData);

        if(response.status.value == 'success'){
            ElMessage.success('Berhasil!');
            tableItem.value = [];
            ruleFormRef.value?.resetFields();
        }
    } catch (error: any) {
        ElMessage.error(`${error.response?.data?.message ?? error}`);
    } finally {
        loading.value = false;
    }
}

const paginationClick = (val: number, type: "contact"|"location"|"sales_order") => {
    if(type === "contact"){
        const data:RequestSearch = {...requestSearchContact.value};
        data.offset = val.toString();
        requestSearchContact.value = data;
    }else if(type === "location"){
        const data:RequestSearch = {...requestSearchLocation.value};
        data.offset = val.toString();
        requestSearchLocation.value = data;
    }else if(type == "sales_order"){
        const data:RequestSearch = {...requestSearchSalesOrder.value};
        data.offset = val.toString();
        requestSearchSalesOrder.value = data;
    }

}

const handleSizeChange = (size: number, type: "contact"|"location"|"sales_order") => {
    if(type === 'contact'){
        requestSearchContact.value.limit = `${size}`
    }else if(type === "location"){
        requestSearchLocation.value.limit = `${size}`
    }else if(type == "sales_order"){
        requestSearchSalesOrder.value.limit = `${size}`
    }
    
}

const onAddNewAddress = (address: AddressType) => {
    formInline.address_id = address.unique_id;
    formInline.address_name = address.address_name;
    formInline.address_version = address.version || 1;
    dialogNewAddress.value = false
}


</script>