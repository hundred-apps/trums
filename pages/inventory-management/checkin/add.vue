<template>
    <TrumsWrapper>
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
                        <el-form-item label="Type" prop="type">
                            <el-radio-group v-model="formInline.type" aria-label="label position">
                                <el-radio-button value="in">Check In</el-radio-button>
                                <el-radio-button value="out">Check Out</el-radio-button>
                            </el-radio-group>
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
        </el-card>
        <el-card class="mb-3">
            <el-table :data="tableItem">
                <el-table-column prop="item_name" label="item" >
                    <template #default="scope">
                        <el-autocomplete
                            :disabled="loading"
                            :fetch-suggestions="querySearchAsyncInventories"
                            v-model="scope.row.item_name"
                            
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
                <el-table-column prop="is_traceable" label="Track Inventory" width="200">
                    <template #default="scope">
                        <el-radio-group v-model="scope.row.is_traceable" @change="(value) => console.log(value)">
                            <el-radio value="1">Ya</el-radio>
                            <el-radio value="0">Tidak</el-radio>
                        </el-radio-group>
                    </template>
                </el-table-column>
                <el-table-column prop="quantity" label="Quantity">
                    <template #default="scope">
                        <el-input v-model="scope.row.quantity" @change="(e) => onChangeQuantity(e, scope)" :disabled="loading" placeholder="Masukan quantity" >
                            <template v-if="scope.row.quantity_to_in > 0" #append > <el-button @click="() => scope.row.quantity = scope.row.quantity_to_in">/{{ scope.row.quantity_to_in }}</el-button> </template>
                        </el-input>
                    </template>
                </el-table-column>
                <el-table-column v-if="formInline.reference_to == 'catalogue'" prop="cost" label="Harga Beli">
                    <template #default="scope">
                        <el-input v-model="scope.row.cost" @change="(e) => onChangeCost(e, scope)" :disabled="loading" placeholder="Masukan Harga Beli" />
                    </template>
                </el-table-column>
                <el-table-column v-if="formInline.reference_to == 'contact'" prop="selling_price" label="Harga Jual">
                    <!-- <template #default="scope"> -->
                        <!-- <el-input v-model="scope.row.selling_price" @change="(e) => onChangeSellingPrice(e, scope)" :disabled="loading" placeholder="Masukan Harga Jual" /> -->
                            <!-- <el-autocomplete
                                v-model="scope.row.selling_price"
                                :fetch-suggestions="createPricelistOverlay"
                                :trigger-on-focus="false"
                                clearable
                                class="inline-input w-50"
                                placeholder="Cari brand"
                                @select="(record) => handleCreatePriceList(record, scope)"
                            > -->
                            <!-- <template #append>
                                <el-button :icon="Search" />
                            </template> -->
                        <!-- </el-autocomplete> -->
                    <!-- </template> -->
                </el-table-column>
               
                <el-table-column v-if="formInline.reference_to != 'contact'" prop="contact_name" label="Customer" >
                    <template #default="scope">
                        <el-autocomplete
                            :disabled="loading"
                            :fetch-suggestions="querySearchContact"
                            v-model="scope.row.contact_name"
                            
                            placeholder="Cari Customer"
                            @select="(item: Record<string, any>) => onHandleSelectCustomer(item, scope)"
                        />
                    </template>
                </el-table-column>
                <el-table-column prop="unit_name" label="Unit">
                    <template #default="scope">
                        <el-autocomplete
                            :disabled="loading"
                            :fetch-suggestions="querySearchUnit"
                            v-model="scope.row.unit_name"
                            
                            placeholder="Cari Customer"
                            @select="(item: Record<string, any>) => handleSelectUnit(item, scope)"
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

        <el-dialog v-model="dialogNewAddress" title="Buat Alamat Baru" width="500">
            <el-form 
            :model="ruleFormAddress" 
            ref="ruleFormRefAddress"
            :rules="rulesAddress"
            label-width="auto">
                <el-form-item label="Kontak" prop="contact_name">
                    <el-autocomplete
                        v-model="ruleFormAddress.contact_name"
                        :fetch-suggestions="querySearchContact"
                        :trigger-on-focus="false"
                        clearable
                        class="inline-input w-50"
                        placeholder="Cari Nama Kontak"
                        @select="handleSelectContact"
                    />
                </el-form-item>
                <el-form-item label="Nama/Label Alamat" prop="address_name">
                    <el-input v-model="ruleFormAddress.address_name" autocomplete="off"/>
                </el-form-item>
                <el-form-item label="Alamat" prop="village">
                    <el-autocomplete
                        v-model="ruleFormAddress.address_id"
                        :fetch-suggestions="querySearchGeolocation"
                        :trigger-on-focus="false"
                        clearable
                        class="inline-input w-50"
                        placeholder="Cari Kelurahan/Desa, Kecamatan, Kabupaten/Kota atau provinsi"
                        @select="handleSelectGeoLocation"
                    />
                </el-form-item>
                <el-form-item label="Detail Alamat" prop="street">
                    <el-input v-model="ruleFormAddress.street" autocomplete="off"/>
                </el-form-item>
                <el-form-item label="Latitude" prop="lat">
                    <el-input v-model="ruleFormAddress.lat" autocomplete="off"/>
                </el-form-item>
                <el-form-item label="Longitude" prop="lng">
                    <el-input v-model="ruleFormAddress.lng" autocomplete="off"/>
                </el-form-item>
                
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="dialogNewAddress = false">Batal</el-button>
                    <el-button type="primary" @click="() => submitFormAddress(ruleFormRefAddress)">
                    Simpan
                    </el-button>
                </div>
            </template>
        </el-dialog>
        <el-drawer v-model="form_catalogue" :direction="form_catalogue_direction" size="40%">
            <template #header>
                <h4>Detail Item</h4>
            </template>
            <template #default>
                <el-form :model="catalogue_form" ref="catalogue_form_ref" label-width="auto" :rules="rule_form_catalogue">
                    <el-form-item label="Nama Item" prop="name">
                        <el-input v-model="catalogue_form.name" />
                    </el-form-item>
                    <el-form-item label="Serial Number" prop="sn">
                        <el-input v-model="catalogue_form.sn" />
                    </el-form-item>
                    <el-form-item label="Deskripsi">
                        <el-input v-model="catalogue_form.description" type="textarea" />
                    </el-form-item>
                    <el-form-item label="Brand" prop="brand_name">
                        <el-autocomplete
                            v-model="catalogue_form.brand_name"
                            :fetch-suggestions="querySearchBrand"
                            :trigger-on-focus="false"
                            clearable
                            class="inline-input w-50"
                            placeholder="Cari brand"
                            @select="(value) => {}"
                        />
                    </el-form-item>
                    <el-form-item label="Tahun" prop="year">
                        <el-input v-model="catalogue_form.year" />
                    </el-form-item>
                    <el-form-item label="Tandai Sebagai Asset" prop="tmp_asset">
                        <el-radio-group v-model="catalogue_form.tmp_asset">
                            <el-radio value="1">Ya</el-radio>
                            <el-radio value="0">Bukan</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="Berat" prop="berat">
                        <el-input v-model="catalogue_form.berat" />
                    </el-form-item>
                    <el-form-item label="Volume" prop="volume">
                        <el-col :span="4">
                            <el-input v-model="catalogue_form.panjang" placeholder="Panjang" />
                        </el-col>
                        <el-col class="text-center" :span="1" style="margin: 0 0.5rem">x</el-col>
                        <el-col :span="4">
                            <el-input v-model="catalogue_form.lebar" placeholder="Lebar" />
                        </el-col>
                        <el-col class="text-center" :span="1" style="margin: 0 0.5rem" >x</el-col>
                        <el-col :span="4">
                            <el-input v-model="catalogue_form.tinggi"placeholder="Tinggi" />
                        </el-col>
                    </el-form-item>
                    
                </el-form>
            </template>
            <template #footer>
            <div style="flex: auto">
                <el-button @click="() => resetFormCatalogue(catalogue_form_ref)">cancel</el-button>
                <el-button type="primary" @click="() => submitFormCatalogue(catalogue_form_ref)">confirm</el-button>
            </div>
            </template>
        </el-drawer>
        <el-drawer v-model="dialogNewPrice" :direction="form_catalogue_direction" size="50%">
            <template #header>
                <h4>Detail Item</h4>
            </template>
            <template #default>
                <!-- <PricelistAdd v-if="!loading" v-on:submit-pricelist="(value) => {
                    console.log(value);
                }" v-on:cancel="() => {}" :pricelist="null" /> -->
            </template>
            <template #footer>
                <div style="flex: auto">
                    <el-button @click="() => resetFormCatalogue(catalogue_form_ref)">cancel</el-button>
                    <el-button type="primary" @click="() => submitFormCatalogue(catalogue_form_ref)">confirm</el-button>
                </div>
            </template>
        </el-drawer>
    </TrumsWrapper>
</template>
<script lang="tsx" setup>
    import { Search, Plus } from '@element-plus/icons-vue'
    import type { Catalogue } from '~/types/catalogue';
    import type { RequestSearch } from '~/types/request_search';
    import type { ResponsePagination } from '~/types/response_pagination';
    import type { Inquiry } from '~/types/inquiry';
    import { ElButton, ElTag, type Column, type FormInstance, type FormRules } from 'element-plus';
    import type { CellRendererParams } from 'element-plus/es/components/table-v2/src/types.mjs';
    import type { Contact } from '~/types/contact';
    import type { Maintenance } from '~/types/maintenance';
    import type { Inventory } from '~/types/inventory';
    import type { DrawerProps, UploadProps, UploadUserFile } from 'element-plus'
    import type { AddressSearch, AddressType } from '~/types/address';
    import type { BaseResponse } from '~/types/response';
    import type { Unit } from '~/types/unit';
    import type { InventoryMovement } from '~/types/inventory_movement';
    import type { Brands } from '~/types/brand';
    import PricelistAdd from '~/components/trums/PricelistAdd.vue';
import type { Pricelist } from '~/types/pricelist';

    definePageMeta({
        middleware:['auth', 'app'],
        name: "Check In/Out",
    })
    const router = useRouter();
    
    const goBack = () => router.back();
    const loading = ref<boolean>(false);
    const form_catalogue = ref<boolean>(false);
    const form_catalogue_direction = ref<DrawerProps['direction']>('rtl')

    const requestSearch = ref<RequestSearch>({
        keyword: '',
        table: 'catalogues',
        column: [],
        sort: null,
        limit: '10',
        offset: '1',
    })

    const requestSearchPricelist = ref<RequestSearch>({
        keyword: '',
        table: 'pricelist',
        column: [
            {
                location_id: [""],
                contact_id: [""],
            }
        ],
        sort: null,
        limit: '10',
        offset: '1',
    })

    

    
    interface inititalTable {
        id: number,
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
        is_traceable: string,
        quantity_to_in: number|null,
    }


    const dialogNewPrice = ref<boolean>(false);

    const dialogRequest = ref<boolean>(false);
    const dialogNewAddress = ref<boolean>(false);
    const dialog = ref<boolean>(false);
    const tableItem = ref<inititalTable[]>([]);
    const fromOrTo = ref<number>(0);
    const locations = ref<ResponsePagination<Catalogue[]>>();
    const contacts = ref<ResponsePagination<Contact[]>>();

    // const fetchData = async () => {
    //     loading.value = true;
    //     try {
    //     const response = await useFetchApi<ResponsePagination<Pricelist[]>>(`/search`, 'pricelist-read', 'post', requestSearchPricelist.value);

    
    //     if(response.status.value == 'success'){
    //         pricelistdata.value = response.data.value!.data[0];
    //     }
    //     } catch (error: any) {
    //         ElMessage.error(`${error.response?.data?.message ?? 'Gagal Mengambil Data!'}`);
    //     return [];
    //     } finally {
    //         loading.value = false;
    //     }
        
    // }
    
    // const pricelistdata = ref<Pricelist>();

    // watch(requestSearchPricelist, fetchData, {immediate: true});

    interface formCheckInOut {
        type: string,
        location: string,
        location_id: string,
        version: number,
        reference: string|null,
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

    interface formAddress {
        contact_id?: string,
        contact_name?: string,
        contact_version?: number,
        address_id?: string,
        address_name?: string,
        street?: string,
        village_id?: string,
        village?: string,
        city?: string,
        regency?: string,
        province?: string,
        country?: string,
        lat?: string,
        lng?: string,
        
    }

    const catalogue_form_ref = ref<FormInstance>();
    const catalogue_form = reactive<Catalogue>({
        id: null,
        unique_id: null,
        unique_code: null,
        name: null,
        brand_id: null,
        brand_name: null,
        year: null,
        sn: null,
        description: null,
        berat: null,
        volume: null,
        is_asset: null,
        version: null,
        created_at: null,
        created_by: null,
        updated_at: null,
        panjang: null,
        lebar: null,
        tinggi: null,
        tmp_asset: "0",
        file_catalogues: [],
        type: ''
    });

    const ruleFormRefAddress = ref<FormInstance>();
    const ruleFormAddress = reactive<formAddress>({});

    const rulesAddress = reactive<FormRules<formAddress>>({
        address_name: [{ required: true, message: "Masukan Nama/Label Alamat", trigger: "blur" }],
        street: [{ required: true, message: "Masukan Detail", trigger: "blur" }],
        village_id: [
            { required: true, message: "Masukan Desa/Kelurahan", trigger: "blur" },
        ],
        village: [{ required: true, message: "Masukan Desa/Kelurahan", trigger: "blur" }],
        city: [{ required: true, message: "Masukan Kecamatan", trigger: "blur" }],
        regency: [{ required: true, message: "Masukan Kota/Kabupaten", trigger: "blur" }],
        province: [{ required: true, message: "Masukan Provinsi", trigger: "blur" }],
        lat: [{ required: true, message: "Masukan Latitude", trigger: "blur" }],
        lng: [{ required: true, message: "Masukan Longitude", trigger: "blur" }],
        
    });
    const rule_form_catalogue = reactive<FormRules<Catalogue>>({
        name: [{ required: true, message: "Masukan Nama", trigger: "blur" }],
        
    });

    const fileList = ref<UploadUserFile[]>([])

    const open_form_catalogue = () => {
        form_catalogue.value = true;
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

    const querySearchAsyncInventories = (queryString: string, cb: (arg: any) => void) => {
        const type = formInline.type;
        

        const location_search = [formInline.location_id];

        if(type == 'in' && formInline.reference_to == 'catalogue'){
            location_search.push(formInline.to);
        }
        

        const data: RequestSearch = formInline.reference_to == 'catalogue' ? {
            table: 'catalogues',
            column: [
                {
                    type: ['item'],
                    
                },
                {
                    inventories_location: {
                        location_id: location_search,
                    }
                }
            ],
            keyword: queryString,
            limit: "20",
            offset: "1",
            sort: null,
        } : {
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
        };

        var endpoint = '/search';

        // if(formInline.reference_to == 'contact'){
        //     endpoint = '/pricelist-read?contact=' + formInline.to + '&location=' + formInline.location_id;
        // }

        if(formInline.reference_to == 'contact'){
            // endpoint = '/pricelist-read?contact=' + formInline.to;
            useFetchApi<ResponsePagination<Inventory[]>>(endpoint, 'pricelist', 'post', {keyword: queryString}).then((response) => {
                if(response.status.value == 'success'){
                    const inventories: Inventory[] = response.data?.value?.data ?? [];

                    const results = inventories.map((data: Inventory) => {
                        return {value: `(${data.sn})-${data.catalogue.name}`, unique_id: data.unique_id, object: data};
                    });    
                    cb(results)
                }else{
                    cb([{value: `Tambahkan ${queryString}`, is_new: true, object: {name: queryString}}]);
                }
            }).catch((error: any) => {
                ElMessage.error(`${error.response?.data?.message ?? error}`);
            })
        }else if(formInline.reference_to == 'catalogue'){
            useFetchApi<ResponsePagination<Catalogue[]>>(endpoint, 'inventories', 'post', data).then((response) => {
                if(response.status.value == 'success'){
                    const inventories: Catalogue[] = response.data?.value?.data ?? [];

                    if(inventories.length > 0){
                        const results = inventories.map((data: Catalogue) => {
                            return {value: `(${data.sn})-${data.name}-${data.brand_name}`, unique_id: data.unique_id, object: data};
                        });    
                        cb(results)
                    }else{
                        cb([{value: `Tambahkan ${queryString}`, is_new: true, object: {name: queryString}}]);
                    }
                }
            }).catch((error: any) => {
                ElMessage.error(`${error.response?.data?.message ?? error}`);
            })
        }



        
    }

    const querySearchContact = (queryString: string, cb: (arg: any) => void) => {
        const data: RequestSearch = {
            table: 'contacts',
            column: [],
            keyword: queryString,
            limit: "20",
            offset: "1",
            sort: null,
        }
        useFetchApi<ResponsePagination<Contact[]>>('/search', 'contacts', 'post', data).then((response) => {
            if(response.status.value == 'success'){
                const inventories: Contact[] = response.data?.value?.data ?? [];

                const results = inventories.map((data: Contact) => {
                    return {...data, value: data.name};
                });    
                cb(results)
            }
        }).catch((error: any) => {
            ElMessage.error(`${error.response?.data?.message ?? error}`);
        })
    }

    const querySearchUnit = async (queryString: string, cb: (arg: any) => void) => {
        try {
            const request = {...requestSearch.value};
            request.table = 'units';
            request.column = []
            request.keyword = queryString;
            const response = await useFetchApi<ResponsePagination<Unit[]>>('/search', 'units', 'post', request);
            if(response.status.value == 'success'){
                const units: Unit[] = response.data?.value?.data ?? [];

                const results = units.map((data: Unit) => {
                    return {...data, value: data.name};
                });    
                cb(results)
            }
        } catch (error: any) {
            ElMessage.error(`${error.response?.data?.message ?? error}`);
        }
    };


    const ruleFormRef = ref<FormInstance>()
    let formInline = reactive<formCheckInOut>({
        type: useCookie('type').value ?? 'in',
        location: '',
        location_id: '',
        version: 0,
        reference_from: '',
        reference: null,
        reference_view: '',
        reference_to: 'catalogue',
        to: '',
        to_name: '',
        to_version: 0,
        address_id: '',
        address_version: null,
        address_name: '',
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
      type: [
        {
          required: true,
          message: 'Masukan Type',
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
            cellRenderer: ({rowData: row}) => <><ElButton type='primary' onClick={() => selectedModal('contact',row, fromOrTo.value == 0 ? setFrom : setTo)}>Pilih</ElButton></>
        }
    ]

    const selectedModal = (reference_to: string, value: any, cb: (reference_to: string,args: any) => void) => {
        dialog.value = false;
        cb(reference_to, value);
    }

    const setFrom = (reference_from: string,value: any) => {
        formInline.reference_from = reference_from;
        formInline.location = value.name;
        formInline.location_id = value.unique_id;
        formInline.version = value.version;
        
        requestSearchPricelist.value.column![0].location_id = [value.unique_id];
    }

    const setTo = (reference_to: string, value: any) => {
        formInline.to_name = value.name;
        formInline.to = value.unique_id;
        formInline.to_version = value.version;
        formInline.reference_to = reference_to;

        if(reference_to == 'contact'){
            requestSearchPricelist.value.column![0].contact_id = [value.unique_id];
        }
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
    const querySearchRequest = async (queryString: string, cb: (arg: any) => void) => {
        

        if(formInline.type == 'in'){
            const data: InventoryMovement[] = await query_search_checkout(queryString);
            cb(data.map((value) => ({...value, value: value.to_name})));
        }else{
            const data: Inquiry[] = await query_search_inquiry(queryString);
            cb(data.map((value) => ({...value, value: value.unique_code})));
        }

    }

    const query_search_inquiry = async (keyword: string) => {
        requestSearch.value.keyword = keyword;
        requestSearch.value.table = 'inquiries';
        requestSearch.value.column = [
            {
                "unique_code": [`${keyword}`]
            }
        ]
        
        const response = await useFetchApi<ResponsePagination<Inquiry[]>>('/search', 'inquiries', 'post', requestSearch.value);
        if(response.status.value == 'success'){
            
            const resultApi: Inquiry[]  = response.data.value?.data!;
            
            return resultApi;
        }else{
            return [];
        }
    }
    const query_search_checkout = async (keyword: string) => {
        requestSearch.value.keyword = keyword;
        requestSearch.value.table = 'inventory_movement';
        requestSearch.value.column = []
        
        const response = await useFetchApi<ResponsePagination<InventoryMovement[]>>('/search', 'inventory_movement', 'post', requestSearch.value);
        if(response.status.value == 'success'){
            
            const resultApi: InventoryMovement[]  = response.data.value?.data!;
            return resultApi;
        }else{
            return [];
        }
    }

    const createPricelistOverlay = (queryString: string, cb: (arg: any) => void) => {
        cb([{value: `Buat Price List`, new: true, price: queryString}]);
    }

    // const handleCreatePriceList = async (record: Record<string, any>, scope: any) => {
        
    //     tableItem.value[scope.$index].selling_price = record.price;
    //     if(record.new){
    //         // dialogNewPrice.value = true;
    //         loading.value = true;
    //         try {
    //             const dateObject = new Date();
                


        
                


    //             var data_pricelist = {...pricelistdata.value};
                
    //             if(data_pricelist.unique_id){
    //                 data_pricelist.pricelist_item?.push({
    //                     inventory_id: tableItem.value[scope.$index].inventory_id,
    //                     inventory_version: tableItem.value[scope.$index].inventory_version ?? 0,
    //                     selling_price: parseInt(record.price),
    //                     stok: tableItem.value[scope.$index].quantity ?? 0,
    //                     unique_id: '',
    //                     inventories: null,
    //                     created_at: 0,
    //                     updated_at: 0,
    //                     created_by: 0
    //                 });
    //             }else{
    //                 data_pricelist = {
    //                     starting_date: dateObject.getTime() / 1000,
    //                     location_id: formInline.location_id,
    //                     location_version: formInline.version,
    //                     contact_id: formInline.to,
    //                     contact_name: formInline.to_name,
    //                     contact_version: formInline.to_version,
    //                     pricelist_item: [{
    //                         inventory_id: tableItem.value[scope.$index].inventory_id,
    //                         inventory_version: tableItem.value[scope.$index].inventory_version,
    //                         selling_price: parseInt(record.price),
    //                         stok: tableItem.value[scope.$index].quantity ?? 0,
    //                         unique_id: '',
    //                         inventories: null,
    //                         created_at: 0,
    //                         updated_at: 0,
    //                         created_by: 0
    //                     }]
    //                 }
    //             }


    //             const pricelistObj = {
    //                 starting_date: data_pricelist.starting_date,
    //                 location_id: data_pricelist.location_id,
    //                 location_version: data_pricelist.location_version,
    //                 contact_id: data_pricelist.contact_id,
    //                 contact_name: data_pricelist.contact_name,
    //                 contact_version: data_pricelist.contact_version,
    //                 pricelist_item: data_pricelist.pricelist_item!.map((value) => ({
    //                     inventory_id: value.inventory_id,
    //                     inventory_version: value.inventory_version,
    //                     selling_price: value.selling_price,
    //                     stok: value.stok,
    //                 })),
    //             }

                
        
    //             const response = await useFetchApi<BaseResponse<Pricelist>>('/pricelist-create', 'pricelist-create', 'post', pricelistObj);
        
    //             if(response.status.value == 'success'){
    //                 dialogNewPrice.value = true;
    //                 fetchData();
    //             }
    //         } catch (error: any) {
    //             ElMessage.error(`${error.response?.data?.message}`);
    //         } finally {
    //             loading.value = false;
    //         }
    //     }
    // }


    const querySearchAddress = (queryString: string, cb: (arg: any) => void) => {
        const newSearch = unref(requestSearch);
        newSearch.keyword = queryString;
        newSearch.table = 'address';
        newSearch.column = []
        newSearch.limit = "500";
        newSearch.offset = "1";

        
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

    const querySearchGeolocation = (queryString: string, cb: (arg: any) => void) => {
       
        

        
        useFetchApi<ResponsePagination<AddressSearch[]>>('/search-indonesia', 'address', 'post', {keyword: queryString, limit: 500, offset: 1}).then((response) => {
            if(response.status.value == 'success'){
                
                const resultApi: AddressSearch[]  = response.data.value?.data!;
                
                if(resultApi.length > 0){

                    cb(resultApi.map((value) => ({ ...value, value: value.name })));
                }
            }
        })

    }
    const querySearchBrand = (queryString: string, cb: (arg: any) => void) => {
       
        

        
        useFetchApi<BaseResponse<Brands[]>>('/brands-read', 'brand', 'get', null).then((response) => {
            // if(response.status.value == 'success'){
                
            //     const resultApi: AddressSearch[]  = response.data.value?.data!;
                
            //     if(resultApi.length > 0){

            //         cb(resultApi.map((value) => ({ ...value, value: value.name })));
            //     }
            // }
            cb([{value: `Tambahkan ${queryString}`}]);
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
        
        if(formInline.type == 'in'){
            const movement: InventoryMovement = record as InventoryMovement;
            
            formInline.location = movement.from_name;
            formInline.location_id = movement.from;
            
            formInline.to = movement.to;
            formInline.to_name = movement.to_name;
            formInline.address_name = `(${movement.address?.address_name}) - ${movement.address?.village}, ${movement.address?.city}, ${movement.address?.regency}, ${movement.address?.province}`;
            formInline.address_id = movement.address_id ?? '';
            formInline.reference_to = 'catalogue';
            formInline.source_document = movement.source_document;
            tableItem.value = movement.inventory_movement_item.map((value) => ({
                id: tableItem.value.length + 1,
                inventory_id: '',
                quantity: 0,
                unit_name: value.inventory?.unit_name ?? '',
                cost: value.cost,
                selling_price: value.selling_price,
                sn: value.sn,
                contact_id: value.contact_id ?? '',
                contact_name: value.contact_name ?? '',
                contact_version: value.contact_version ?? 0,
                catalogue_id: null,
                unit_id: value.inventory?.unique_id ?? '',
                item_name: value.inventory?.catalogue?.name ?? '',
                is_traceable: value.inventory?.is_traceable ? '1' : '0',
                quantity_to_in: value.quantity,
            }));

            console.log(movement.inventory_movement_item);
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
    const handleSelectGeoLocation = (record: Record<string, any>) => {
        if(record.new){
            dialogNewAddress.value = true;
        }else{
            console.log(record);
            const address: AddressSearch = record as AddressSearch;
            const names = address.name.split(', ');

            ruleFormAddress.village_id = address.id;
            ruleFormAddress.village = names[1];
            ruleFormAddress.city = names[2];
            ruleFormAddress.regency = names[3];
            ruleFormAddress.province = names[4];
        }
    }
    const handleSelectContact = (record: Record<string, any>) => {
        if(record.new){
            dialogNewAddress.value = true;
        }else{
            console.log(record);
            const contact: Contact = record as Contact;
            
            ruleFormAddress.contact_id = contact.unique_id;
            ruleFormAddress.contact_name = contact.name;
            ruleFormAddress.contact_version = contact.version;
            ruleFormAddress.address_name = contact.name;
        }
    }
    const handleSelectUnit = (record: Record<string, any>,scope: any) => {
        console.log(record);
        const unit: Unit = record as Unit;
        tableItem.value[scope.$index].unit_id = unit.unique_id!;
        tableItem.value[scope.$index].unit_name = unit.name!;
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

    const create_catalogue = async (catalogue: Catalogue) => {
        loading.value = true;
        try {

            const formData = new FormData();

            formData.append('unique_id', (catalogue.unique_id ?? ''));
            formData.append('name', (catalogue.name ?? ''));
            formData.append('brand_id', (catalogue.brand_id ?? ''));
            formData.append('year', (catalogue.year ?? ''));
            formData.append('sn', (catalogue.sn ?? ''));
            formData.append('description', (catalogue.description ?? ''));
            formData.append('berat', (catalogue.berat ?? 0).toString());
            formData.append('volume', `${catalogue.panjang}x${catalogue.lebar}x${catalogue.tinggi}`);
            formData.append('is_asset', (catalogue.tmp_asset == '1' ? true : false).toString());
            formData.append('type', catalogue.type);

            const response = await useFetchApi<BaseResponse<Catalogue>>('/catalogues-create', 'catalogue-create', 'post', formData);
            if(response.status.value == 'success'){
                const catalogue_result: Catalogue = response.data.value!.data;
                return catalogue_result;
            }
        } catch (error: any) {
            ElMessage.error(error?.response?.message ?? error);
        } finally {
            loading.value = false;
        }
    }

    const onHandleSelectItemAutocomplete = async (record: Record<string, any>, scope: any) => {
        console.log(record)
        if(record.is_new){
            
            loading.value = true;
            try {
                const catalogue_result = await create_catalogue({
                    name: record.object.name, type: "item",
                    id: null,
                    unique_id: null,
                    unique_code: null,
                    brand_id: null,
                    brand_name: null,
                    year: null,
                    sn: null,
                    description: null,
                    berat: null,
                    volume: null,
                    panjang: null,
                    lebar: null,
                    tinggi: null,
                    is_asset: null,
                    tmp_asset: null,
                    version: null,
                    created_at: null,
                    created_by: null,
                    updated_at: null,
                    file_catalogues: []
                });
                if(catalogue_result){
                    
                    tableItem.value[scope.$index].item_name = catalogue_result.name!;
                    tableItem.value[scope.$index].catalogue_id = catalogue_result.unique_id;
                    catalogue_form.name = record.object.name;
                    catalogue_form.unique_id = catalogue_result.unique_id;
                    open_form_catalogue();
                }
            } catch (error: any) {
                ElMessage.error(error?.response?.message ?? error);
            } finally {
                loading.value = false;
            }
        }else {
            if(record.object != undefined){

                const inventory: Inventory = record.object as Inventory;
                const type = formInline.type;

                const location_search = [formInline.location_id];

                if(type == 'in' && formInline.reference_to == 'catalogue' && inventory.location_id != formInline.to){
                    tableItem.value[scope.$index].catalogue_id = inventory.catalogue_id!;
                }else{
                    tableItem.value[scope.$index].inventory_id = inventory.unique_id!;
                }
                

                if(formInline.reference_to == 'contact'){
                    tableItem.value[scope.$index].selling_price = inventory.pricelist_item?.selling_price ?? 0;
                }

                tableItem.value[scope.$index].item_name = inventory.catalogue.name ?? '';
                tableItem.value[scope.$index].sn = inventory.sn!;
                tableItem.value[scope.$index].is_traceable = inventory.is_traceable == true ? '1' : '0';
                tableItem.value[scope.$index].quantity = inventory.quantity;
                tableItem.value[scope.$index].unit_name = inventory.unit_name ?? '';
                tableItem.value[scope.$index].cost = inventory.cost ?? 0;
                tableItem.value[scope.$index].contact_id = inventory.contact_id ?? '';
                tableItem.value[scope.$index].contact_name = inventory.contact_name ?? '';
                tableItem.value[scope.$index].contact_version = inventory.contact_version ?? 1;
                tableItem.value[scope.$index].unit_id = inventory.unit_id ?? '';
                tableItem.value[scope.$index].inventory_version = inventory.version ?? 1;
                
            }
        }

        fetchPriceTag(scope.$index);
    }

    const fetchPriceTag = async (index: number) => {
        // '/pricetag-item-read'
        try {
            const data = {
                "catalogue_id": tableItem.value[index].catalogue_id,
                "location": formInline.location_id,
                "contact": formInline.reference_to == 'contact' ? formInline.to : null,
                "quantity": tableItem.value[index].quantity,
                "owner_id": null
            }
            const response = await useFetchApi<BaseResponse<any>>(`/pricetag-item-read`, 'pricetag-search', 'post', data);
            
            if(response.status.value == 'success'){
                console.log(response.data);
            }
            
        } catch (error: any) {
          ElMessage.error(`${error.response?.message ?? error}`);  
        } 
    }

    const onHandleSelectCustomer = (record: Record<string, any>, scope: any) => {
        console.log(record)
        const contact: Contact = record as Contact;
        tableItem.value[scope.$index].contact_id = contact.unique_id;
        tableItem.value[scope.$index].contact_name = contact.name;
        tableItem.value[scope.$index].contact_version = contact.version;
    }

    const selectRequest = (record: Inquiry) => {
        console.log(record);
    }

    const onSubmit = async () => {
        loading.value = true;
        try {
           
            const data = {
                type: formInline.type,
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

            if(formInline.reference_view != null && formInline.reference_view != ''){
                formData.append('reference_id', formInline.reference_view)
            }
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

            const response = await useFetchApi('/inventory-movement-create', 'inquiry_create', 'post', formData);

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

    const onSubmitFormCatalogue = async (formEl: FormInstance | undefined) => {
        const catalogue: Catalogue = {...catalogue_form, type: 'item'};
        const result = await create_catalogue(catalogue);
        if(result){
            form_catalogue.value = false;
        }
    }

    const submitFormAddress = async (formEl: FormInstance | undefined) => {
        if (!formEl) return
        await formEl.validate((valid, fields) => {
            if (valid) {
                onSubmitAddress();
            } else {
                console.log('error submit!', fields)
            }
        })
    }

    const resetFormCatalogue = async (formEl: FormInstance | undefined) => {
        formEl?.resetFields();
        form_catalogue.value = false;
    }
    const submitFormCatalogue = async (formEl: FormInstance | undefined) => {
        if (!formEl) return
        await formEl.validate((valid, fields) => {
            if (valid) {
                onSubmitFormCatalogue(formEl);
            } else {
                console.log('error submit!', fields)
            }
        })
    }

    const onSubmitAddress = async () => {
        console.log(ruleFormAddress)
        const data = {
            "contact_id": ruleFormAddress.contact_id,
            "contact_name": ruleFormAddress.contact_name,
            "contact_version": ruleFormAddress.contact_version,
            "address_name": ruleFormAddress.address_name,
            "street": ruleFormAddress.street,
            "village_id": ruleFormAddress.village_id,
            "village": ruleFormAddress.village,
            "city": ruleFormAddress.city,
            "regency": ruleFormAddress.regency,
            "province": ruleFormAddress.province,
            "country": "indonesia",
            "lat": ruleFormAddress.lat,
            "lng": ruleFormAddress.lng,
            
        }

        try {
            const response = await useFetchApi<ResponsePagination<BaseResponse<AddressType>>>('/address-create', 'address-create', 'post', data);
            if(response.status.value == 'success'){
                ElMessage.success('Berhasil!');
                const address:AddressType = (response.data.value as unknown as BaseResponse<AddressType>).data;
                formInline.address_id = address.unique_id;
                formInline.address_version = address.version;
                formInline.address_name = `(${address.contact_name}) - ${address.village}, ${address.city}, ${address.regency}, ${address.province}`;
                dialogNewAddress.value = false;
            }
        } catch (error: any) {
            ElMessage.success(error?.response?.messaage ?? error);
        }
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
            contact_id: '',
            contact_name: '',
            contact_version: 0,
            is_traceable: "1",
            catalogue_id: null,
            item_name: '',
            quantity_to_in: 0,
            unit_id: '',
            inventory_version: 0,
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
            contact_id: '',
            contact_name: '',
            contact_version: 0,
            catalogue_id: null,
            item_name: '',
            is_traceable: "0",
            quantity_to_in: 0,
            unit_id: '',
            inventory_version: 0,
        }];

        tableItem.value = newItem;

    }

    onMounted(() => {
        initialTableItem();
        fetchContact('');
        fetchLocation('');
    })
</script>