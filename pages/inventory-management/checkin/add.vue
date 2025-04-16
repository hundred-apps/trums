<template>
    <el-page-header @back="goBack">
        <template #content>
            <span class="text-large font-600 mr-3"> Check In/Out </span>
        </template>
    </el-page-header>
    <el-card class="my-3">
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
                            <el-radio-button value="ready">Ready</el-radio-button>
                            <el-radio-button value="delivery">Delivery</el-radio-button>
                            <el-radio-button value="done">Done</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                </div>
            </div>
            
            <div class="flex">
                <div class="flex flex-col flex-1">
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
                    <el-form-item label="Cari Permintaan" prop="reference_view"  >
                        <el-autocomplete
                            v-model="formInline.reference_view"
                            :fetch-suggestions="querySearchRequest"
                            :trigger-on-focus="false"
                            clearable
                            class="inline-input w-50"
                            placeholder="Cari Permintaan"
                            @select="(record) => handleSelectInquiries(record)"
                        />
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
    </el-card>
    <el-card class="mb-3">
        <el-table :data="tableItem">
            <el-table-column prop="name" label="item" >
                <template #default="scope">
                    <el-autocomplete
                        :disabled="loading"
                        :fetch-suggestions="querySearchAsyncInventories"
                        v-model="scope.row.name"
                        
                        placeholder="Cari item"
                        @select="(item: Record<string, any>) => onHandleSelectItemAutocomplete(item, scope)"
                    />
                </template>
            </el-table-column>
            <el-table-column prop="sn" label="Serial Number">
                <template #default="scope">
                    <el-input v-model="scope.row.sn" @change="(e) => onChangeSerialNumber(e, scope)" :disabled="loading" placeholder="Masukan Serial Number" />
                </template>
            </el-table-column>
            <el-table-column prop="quantity" label="Quantity">
                <template #default="scope">
                    <el-input v-model="scope.row.quantity" @change="(e) => onChangeQuantity(e, scope)" :disabled="loading" placeholder="Masukan quantity" />
                </template>
            </el-table-column>
            <el-table-column prop="cost" label="Harga Beli">
                <template #default="scope">
                    <el-input v-model="scope.row.cost" @change="(e) => onChangeCost(e, scope)" :disabled="loading" placeholder="Masukan Harga Beli" />
                </template>
            </el-table-column>
            <el-table-column prop="selling_price" label="Harga Jual">
                <template #default="scope">
                    <el-input v-model="scope.row.selling_price" @change="(e) => onChangeCost(e, scope)" :disabled="loading" placeholder="Masukan Harga Jual" />
                </template>
            </el-table-column>
            <el-table-column prop="unit_name" label="Unit">
                <template #default="scope">
                <el-input
                    :disabled="loading"
                    v-model="scope.row.unit_name"
                    placeholder="Masukkan unit"
                    :readonly=true
                />
                </template>
            </el-table-column>
        </el-table>
        <el-button class="mt-4" style="width: 100%" @click="addNewLine">
            Tambahkan Baris Baru
        </el-button>
    </el-card>
    <el-dialog v-model="dialog" title="Cari" width="800">
        <el-tabs type="border-card">
            <el-tab-pane label="Gudang">
                <trums-table-custom-table :columns="columnLocation" :data="locations?.data ?? []" />
                
            </el-tab-pane>
            <el-tab-pane label="Kontak">
                <trums-table-custom-table :columns="columnContact" :data="contacts?.data ?? []" />
            </el-tab-pane>
        </el-tabs>
    </el-dialog>
</template>
<script lang="tsx" setup>
    import { Search } from '@element-plus/icons-vue'
    import type { Catalogue } from '~/types/catalogue';
    import type { RequestSearch } from '~/types/request_search';
    import type { ResponsePagination } from '~/types/response_pagination';
    import type { Inquiry } from '~/types/inquiry';
    import { ElButton, ElTag, type Column, type FormInstance, type FormRules } from 'element-plus';
    import type { CellRendererParams } from 'element-plus/es/components/table-v2/src/types.mjs';
    import type { Contact } from '~/types/contact';
    import type { Maintenance } from '~/types/maintenance';
    import type { Inventory } from '~/types/inventory';
    import type { UploadProps, UploadUserFile } from 'element-plus'

    definePageMeta({
        middleware:['auth', 'app'],
        name: "Check In/Out",
    })
    const router = useRouter();
    
    const goBack = () => router.back();
    const loading = ref<boolean>(false);


    const requestSearch = ref<RequestSearch>({
        keyword: '',
        table: 'catalogues',
        column: [],
        sort: null,
        limit: '10',
        offset: '1',
    })

    
    interface inititalTable {
        id: number,
        inventory_id: string,
        quantity: number|null,
        cost: number|null,
        selling_price: number|null,
        sn: string,
        unit_name: string,
    }


    const dialogRequest = ref<boolean>(false);
    const dialog = ref<boolean>(false);
    const tableItem = ref<inititalTable[]>([]);
    const fromOrTo = ref<number>(0);
    const locations = ref<ResponsePagination<Catalogue[]>>();
    const contacts = ref<ResponsePagination<Contact[]>>();

    interface formCheckInOut {
        location: string,
        location_id: string,
        version: number,
        reference: string|null,
        reference_view: string,
        to: string,
        to_name: string,
        to_version: number,
        address_id: string|null,
        address_version: string|null,
        schedule_date: string|null,
        source_document: string|null,
        status: string,
    }

    const fileList = ref<UploadUserFile[]>([])

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

    const querySearchAsyncInventories = (queryString: string, cb: (arg: any) => void) => {
        const data: RequestSearch = {
            table: 'inventories',
            column: [
                {
                    location_id: formInline.location_id,
                },
                {
                    catalogues: {
                        type: ['item']
                    }
                }
            ],
            keyword: queryString,
            limit: "20",
            offset: "1",
            sort: null,
        }
        useFetchApi<ResponsePagination<Inventory[]>>('/search', 'inventories', 'post', data).then((response) => {
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
    const ruleFormRef = ref<FormInstance>()
    let formInline = reactive<formCheckInOut>({
        location: '',
        location_id: '',
        version: 0,
        reference: null,
        reference_view: '',
        to: '',
        to_name: '',
        to_version: 0,
        address_id: null,
        address_version: null,
        schedule_date: null,
        source_document: null,
        status: 'draft',
    });

    const rules = reactive<FormRules<formCheckInOut>>({
      location: [
        {
          required: true,
          message: 'Masukan lokasi awal',
          trigger: 'change',
        },
      ],
    //   reference_view: [
    //     {
    //       required: true,
    //       message: 'Masukan Sumber Permintaan',
    //       trigger: 'change',
    //     },
    //   ],
    //   to_name: [
    //     {
    //       required: true,
    //       message: 'Masukan Tujuan',
    //       trigger: 'change',
    //     },
    //   ],
    })




    const fetchLocation = async (search: string) => {
        try {
            const request = {...requestSearch.value};
            request.table = 'catalogues';
            request.column = [
                {
                    type: ['place']
                }
            ]
            request.keyword = search;
            const response = await useFetchApi<ResponsePagination<Catalogue[]>>('/search', 'locations', 'post', request);
            if(response.status.value == 'success'){
                locations.value = response.data.value as ResponsePagination<Catalogue[]>;
            }
        } catch (error: any) {
            ElMessage.error(`${error.response?.data?.message ?? error}`);
        }
    }
    const fetchContact = async (search: string) => {
        try {
            const request = {...requestSearch.value};
            request.table = 'contacts';
            request.keyword = search;
            const response = await useFetchApi<ResponsePagination<Contact[]>>('/search', 'contacts', 'post', request);
            if(response.status.value == 'success'){
                contacts.value = response.data.value as ResponsePagination<Contact[]>;
            }
        } catch (error: any) {
            ElMessage.error(`${error.response?.data?.message ?? error}`);
        }
    }
    
    const columnItem: Column<inititalTable>[] = [
        {
            title: 'Item', 
            dataKey: 'name',
            key: 'name',
            width: 200,
        },
        {
            title: 'Quantity', 
            dataKey: 'quantity',
            key: 'quantity',
            width: 200,
        },
        {
            title: 'Unit', 
            dataKey: 'unit',
            key: 'unit',
            width: 200,
        },
    ];

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
            cellRenderer: ({rowData: row}) => <><ElButton type='primary' onClick={() => selectedModal(row, fromOrTo.value == 0? setFrom : setTo)}>Pilih</ElButton></>
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
            cellRenderer: ({rowData: row}) => <><ElButton type='primary' onClick={() => selectedModal(row, fromOrTo.value == 0 ? setFrom : setTo)}>Pilih</ElButton></>
        }
    ]

    const selectedModal = (value: any, cb: (args: any) => void) => {
        dialog.value = false;
        cb(value);
    }

    const setFrom = (value: any) => {
        formInline.location = value.name;
        formInline.location_id = value.unique_id;
        formInline.version = value.version;
    }

    const setTo = (value: any) => {
        formInline.to_name = value.name;
        formInline.to = value.unique_id;
        formInline.to_version = value.version;
    }

    const getReference = (data: Inquiry) => {
        if(data.reference == 'internal'){
            const contact: Contact|null = data.reference_data as Contact;
            return (
                <div>{contact?.name}</div>
            );
        }else{
            const maintenance: Maintenance|null = data.reference_data as Maintenance;
            return (
                <div>{maintenance?.unique_code}</div>
            );
        }
    }

    const querySearchLocation = (queryString: string, cb: (arg: any) => void) => {
        requestSearch.value.keyword = queryString;
        requestSearch.value.table = 'catalogues';
        requestSearch.value.column = [
            {
                "type": ['place']
            }
        ]
        
        useFetchApi<ResponsePagination<Catalogue[]>>('/search', 'location_search', 'post', requestSearch.value).then((response) => {
            if(response.status.value == 'success'){
                
                const resultApi: Catalogue[]  = response.data.value?.data!;
                
                if(resultApi.length > 0){
                    cb(resultApi.map((value) => ({...value, value: value.name})));
                }else{
                    cb([{value: `Tambahkan ${queryString}`, new: true, unique_id: `${queryString}`}]);
                }
            }
        })

    }
    const querySearchRequest = (queryString: string, cb: (arg: any) => void) => {
        requestSearch.value.keyword = queryString;
        requestSearch.value.table = 'inquiries';
        requestSearch.value.column = [
            {
                "unique_code": [`${queryString}`]
            }
        ]
        
        useFetchApi<ResponsePagination<Catalogue[]>>('/search', 'inquiries', 'post', requestSearch.value).then((response) => {
            if(response.status.value == 'success'){
                
                const resultApi: Catalogue[]  = response.data.value?.data!;
                
                if(resultApi.length > 0){
                    cb(resultApi.map((value) => ({...value, value: value.name})));
                }else{
                    cb([{value: `Tambahkan ${queryString}`, new: true, unique_id: `${queryString}`}]);
                }
            }
        })

    }

    const onChangeQuantity = (e: string, scope: any) => {

    }
    const onChangeSerialNumber = (e: string, scope: any) => {
        tableItem.value[scope.$index].sn = e;
    }
    const onChangeSellingPrice = (e: string, scope: any) => {
        tableItem.value[scope.$index].selling_price = parseInt(e ?? '0');
    }
    const onChangeCost = (e: string, scope: any) => {
        tableItem.value[scope.$index].cost = parseInt(e ?? '0');
    }

    const handleSelectInquiries = (record: Record<string, any>) => {
        console.log(record);
    }

    const handleSelectLocation = (record: Record<string, any>) => {
        if(record.new != undefined){
            formInline.location_id = record.unique_id;
            formInline.location = record.unique_id;
        }else{
            formInline.location_id = record.unique_id;
            formInline.location = record.value;
            requestSearch.value.keyword = '';
            requestSearch.value.table = 'inquiries';
            requestSearch.value.column = [
                {
                    location_id: [formInline.location_id]
                }
            ];
            requestSearch.value.limit = "10";
            requestSearch.value.offset = "1";
        }


    }

    const onHandleSelectItemAutocomplete = (record: Record<string, any>, scope: any) => {
        console.log(record)
        if(record.object != undefined){
            const inventory: Inventory = record.object as Inventory;
            tableItem.value[scope.$index].inventory_id = inventory.unique_id!;
            tableItem.value[scope.$index].quantity = 1;
            tableItem.value[scope.$index].unit_name = inventory.unit?.name ?? '';
        }

    }

    const selectRequest = (record: Inquiry) => {
        console.log(record);
    }

    const onSubmit = async () => {
        loading.value = true;
        try {
            const type = useCookie('type');
            const data = {
                type: type.value,
                from_name: formInline.location,
                from: formInline.location_id,
                from_version: formInline.version,
                reference_id: formInline.reference_view,
                reference: formInline.reference,
                to: formInline.to,
                to_name: formInline.to_name,
                to_version: formInline.to_version,
                address_id: formInline.address_id,
                address_version: formInline.address_version,
                schedule_date: null,
                source_document: formInline.source_document,
                status: formInline.status,
                movement_item: tableItem.value.map((value) => {
                    return {
                        'inventory_id': value.inventory_id,
                        'quantity': parseInt(value.quantity?.toString() ?? "1"),
                        'cost': value.cost,
                        'selling_price': value.selling_price,
                        'sn': value.sn,
                    }
                }),
            }

            console.log(data);

            const response = await useFetchApi('/inventory-movement-create', 'inquiry_create', 'post', data);

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

    const initialTableItem = () => {
        tableItem.value = Array.from({ length: 1 }, (_, i) => ({
            id: i,
            inventory_id: '',
            quantity: 1,
            unit_name: '',
            cost: 0,
            selling_price: 0,
            sn: '',
        }));
    }

    const addNewLine = () => {
        const newItem = [...tableItem.value, {
            id: tableItem.value.length + 1,
            inventory_id: '',
            quantity: 1,
            unit_name: '',
            cost: 0,
            selling_price: 0,
            sn: '',
        }];

        tableItem.value = newItem;

    }

    onMounted(() => {
        initialTableItem();
        fetchContact('');
        fetchLocation('');
    })
</script>