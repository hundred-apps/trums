<template>
    <TrumsWrapper>
        <el-page-header @back="goBack">
              <template #content>
                  <span class="text-large font-600 mr-3"> Buat Template </span>
              </template>
        </el-page-header>
        <el-card class="my-3">
            <template #header>
                <div class="card-header">
                <el-form-item>
                    <el-button type="primary" @click="submitForm(formTemplateRef)">Simpan</el-button>
                    <el-button @click="resetForm(formTemplateRef)">Batal</el-button>
                </el-form-item>
                </div>
            </template>
            <el-form
                ref="formTemplateRef"
                style="max-width: 600px"
                :model="formTemplate"
                :rules="formTemplateRules"
                label-width="auto"
                class="demo-ruleForm"
                :size="formSize"
                status-icon
                :disabled="loading"
            >

                <el-form-item label="Nama Template" prop="name">
                    <el-input v-model="formTemplate.name" placeholder="Masukan nama template"/>
                </el-form-item>
                <el-form-item label="Meter" name="meter">
                    <el-checkbox-group v-model="formTemplate.meter" @change="onCheckMeter">
                        <el-checkbox value="is_hour_meter" name="is_hour_meter">
                            Hour Meter
                        </el-checkbox>
                        <el-checkbox value="is_kilo_meter" name="is_kilo_meter">
                            Kilo Meter
                        </el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item v-if="formTemplate.meter.includes('is_hour_meter')" label="Hour Meter" prop="hour_meter">
                    <el-input v-model="formTemplate.hour_meter" />
                </el-form-item>
                <el-form-item v-if="formTemplate.meter.includes('is_kilo_meter')" label="Kilo Meter" prop="kilo_meter">
                    <el-input v-model="formTemplate.kilo_meter" />
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="mb-3">
            <el-table :data="formTemplate.template_checklist_item">
                <el-table-column prop="checklist_name" label="Checklist" >
                    <template #default="scope">
                        <el-form-item label="" style="margin-bottom: 0px !important" :prop="`items.${scope.index}.checklist_name`">
                            <el-autocomplete
                                :disabled="loading"
                                :fetch-suggestions="querySearchAsyncChecklist"
                                v-model="scope.row.checklist_name"
                                
                                placeholder="Cari Checklist"
                                @select="(item: Record<string, any>) => handleSelectSearchChecklist(item, scope)"
                            />
                        </el-form-item>
                        
                    </template>
                </el-table-column>
                <el-table-column fixed="right" label="Operations" min-width="120">
                    <template #default="scope">
                        <el-button type="primary" @click="() => openDrawer(scope.row.checklist)" :icon="Operation" circle />
                        <el-popconfirm
                            
                            confirm-button-text="Yes"
                            cancel-button-text="No"
                            :icon="InfoFilled"
                            icon-color="#626AEF"
                            title="Are you sure to delete this?"
                            @confirm="() => confirmEvent(scope.row, scope)"
                            @cancel="cancelEvent"
                        >
                            <template #reference>
                                <el-button type="danger" :icon="Delete" circle />
                            </template>
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>
            <el-button class="mt-4" style="width: 100%" @click="addNewLine">
                Tambahkan Baris Baru
            </el-button>
        </el-card>
        <el-card class="mb-3">
            <template #header>
                <div class="card-header">
                    <p>Daftar Inventory</p>
                </div>
            </template>
            <el-table :data="formTemplate.template_checklist_inventory">
                <el-table-column prop="inventory_name" label="Nama Inventory"  >
                    <template #default="scope">
                        <el-form-item label="" style="margin-bottom: 0px !important;" class="mb-0" :prop="`inventories.${scope.index}.inventory_name`">
                            <el-autocomplete
                                :disabled="loading"
                                :fetch-suggestions="querySearchInventories"
                                v-model="scope.row.inventory_name"
                                class="mb-0"
                                placeholder="Cari nama inventory"
                                @select="(item: Record<string, any>) => selectInventories(item, scope)"
                            />
                        </el-form-item>
                        
                    </template>
                </el-table-column>
                <el-table-column prop="inventory.sn" label="Serial Number"/>
                <el-table-column prop="inventory.location.name" label="Lokasi"/>
                <el-table-column fixed="right" label="Operations" min-width="120">
                    <template #default="scope">
                        
                        <el-popconfirm
                            confirm-button-text="Yes"
                            cancel-button-text="No"
                            :icon="InfoFilled"
                            icon-color="#626AEF"
                            title="Are you sure to delete this?"
                            @confirm="() => deleteInventories(scope.row, scope)"
                            @cancel="cancelEvent"
                        >
                            <template #reference>
                                <el-button type="danger" :icon="Delete" circle />
                            </template>
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>
            <el-button class="mt-4" style="width: 100%" @click="addNewLineInventory">
                Tambahkan Baris Baru
            </el-button>
        </el-card>
    </TrumsWrapper>

    <el-drawer v-model="drawer_checklist" title="Detail Checklist" :with-header="false">
        <FormCheckList :rule-form="checklistEdit!" v-on:success="(value) => console.log(value)" v-on:back="closeDrawer" />
    </el-drawer>
</template>
<script lang="tsx" setup>
import type { ComponentSize, FormInstance, FormRules } from 'element-plus';
import { InfoFilled, Delete, Operation } from '@element-plus/icons-vue'
import type { ChecklistAttribute } from '~/types/checklist';
import type { Inventory } from '~/types/inventory';
import type { RequestSearch } from '~/types/request_search';
import type { BaseResponse } from '~/types/response';
import type { ResponsePagination } from '~/types/response_pagination';
import type { TemplateChecklist, TemplateChecklistItem, TemplateInventories } from '~/types/template_checklist';
import MasterChecklistAdd from '~/pages/master/checklist/add.vue';
import FormCheckList from '~/components/trums/FormCheckList.vue';
import { SetOperationEnum } from 'element-plus/es/components/tree-v2/src/virtual-tree.mjs';
    definePageMeta({
      middleware: ["auth", "app"],
    });

    const goBack = () => router.back();
    const router = useRouter();
    const loading = ref<boolean>(false);
    const drawer_checklist = ref<boolean>(false);

    const formSize = ref<ComponentSize>("default");
    const formTemplateRef = ref<FormInstance>();
    const formTemplate = reactive<TemplateChecklist>({
        unique_id: null,
        is_hour_meter: false,
        is_kilo_meter: false,
        meter: [],
        created_at: 0,
        created_by: 0,
        name: "",
        updated_at: 0,
        version: 0,
        template_checklist_item: [
            {
                unique_id: null,
                template_checklist_id: null,
                checklist_id: '',
                checklist_version: 0,
                checklist_name: '',
                checklist: null,
                is_new: true,
            }
        ],
        hour_meter: 0,
        kilo_meter: 0,
        template_checklist_inventory: [{
            unique_id: null,
            template_checklist_id: null,
            inventory_id: null,
            inventory_name: '',
            inventory_version: 0,
            inventory: null,
            is_new: true,
        }]
    });

    const formTemplateRules = reactive<FormRules<TemplateChecklist>>({
        name: [
            { required: true, message: "Lokasi Tidak Boleh Kosong!", trigger: "blur" },
        ],
        
        template_checklist_item: {
            type: 'array',
            required: true,
            min: 1,
            message: 'Item Penawaran Tidak Boleh Kosong!',
            trigger: 'change'
        },
        meter: {
            type: 'array',
            required: true,
            min: 1,
            message: 'Item Penawaran Tidak Boleh Kosong!',
            trigger: 'change'
        },
        hour_meter: [
            {
            validator: (_, value, callback) => {
                if (formTemplate.meter.includes('is_hour_meter') && (value === null || value === '')) {
                callback(new Error('Hour Meter harus diisi'))
                } else {
                callback()
                }
            },
            trigger: 'blur',
            },
        ],
        kilo_meter: [
            {
            validator: (_, value, callback) => {
                if (formTemplate.meter.includes('is_kilo_meter') && (value === null || value === '')) {
                callback(new Error('Kilo Meter harus diisi'))
                } else {
                callback()
                }
            },
            trigger: 'blur',
            },
        ],
    });

    const checklistEdit = ref<ChecklistAttribute>();

    const confirmEvent = (data: TemplateChecklistItem, scope: any) => {
        console.log(data);
        if(data.is_new){
            deleteChecklistItemNew(scope.$index);
        }else{
            deleteChecklistItemServer([data.unique_id!]).then((is_deleted) => {
                if(is_deleted){
                    deleteChecklistItemNew(scope.$index);
                }
            })
            
        }
      
    }

    const deleteChecklistItemNew = (index: number) => {
            if(index == 0){
                formTemplate.template_checklist_item[index].checklist = null;
                formTemplate.template_checklist_item[index].checklist_id = '';
                formTemplate.template_checklist_item[index].checklist_name = '';
                formTemplate.template_checklist_item[index].checklist_version = 0;
                formTemplate.template_checklist_item[index].is_new = true;
                formTemplate.template_checklist_item[index].template_checklist_id = '';
                formTemplate.template_checklist_item[index].unique_id = '';
            }else{
                const newItem = formTemplate.template_checklist_item.splice(index, 1);
            }
    }


    const deleteChecklistItemServer = async (ids: string[]) => {
        loading.value = true;
        try {
            const response = await useFetchApi<BaseResponse<any>>(`/template-checklist-item-delete`, 'delete-checklist-item', 'post', ids);
            if(response.status.value == 'success'){
                return true;
            }
        } catch (error: any) {
            ElMessage.error(`${error.response?.message ?? error}`);
            return false;
        } finally {
            loading.value = false;
        }
    }
    


    const deleteInventories = (data: TemplateInventories, scope: any) => {
        // const newItem = formTemplate.template_checklist_inventory.splice(scope.$index, 1);
        console.log(data);
        if(data.is_new){
            deleteChecklistInventoryNew(scope.$index);
        }else{
            deleteChecklistInventoryServer([data.unique_id!]).then((value) => {
                deleteChecklistInventoryNew(scope.$index);
            })
        }
    }

    const deleteChecklistInventoryNew = (index: number) => {
            if(index == 0){
                formTemplate.template_checklist_inventory[index].inventory = null;
                formTemplate.template_checklist_inventory[index].inventory_id = '';
                formTemplate.template_checklist_inventory[index].inventory_name = '';
                formTemplate.template_checklist_inventory[index].inventory_version = 0;
                formTemplate.template_checklist_inventory[index].is_new = true;
                formTemplate.template_checklist_inventory[index].template_checklist_id = '';
                formTemplate.template_checklist_inventory[index].unique_id = '';
            }else{
                const newItem = formTemplate.template_checklist_inventory.splice(index, 1);
            }
    }

    const deleteChecklistInventoryServer = async (ids: string[]) => {
        loading.value = true;
        try {
            const response = await useFetchApi<BaseResponse<any>>(`/template-checklist-inventory-delete`, 'delete-checklist-inventory', 'post', ids);
            if(response.status.value == 'success'){
                return true;
            }
        } catch (error: any) {
            ElMessage.error(`${error.response?.message ?? error}`);
            return false;
        } finally {
            loading.value = false;
        }
    }

    const cancelEvent = () => {
        console.log('cancel!')
    }

    const onSubmitTemplate = async (formEl: FormInstance | undefined) => {
        
        loading.value = true;
        try {
            const data = {
                "unique_id": formTemplate.unique_id,
                "name": formTemplate.name,
                "is_hour_meter": formTemplate.is_hour_meter,
                "is_kilo_meter": formTemplate.is_kilo_meter,
                "hour_meter": formTemplate.hour_meter.toString(),
                "kilo_meter": formTemplate.kilo_meter.toString(),
                "template_checklist_item": formTemplate.template_checklist_item.map((value) => ({
                    "unique_id": value.unique_id,
                    "template_checklist_id": value.template_checklist_id,
                    "checklist_id": value.checklist_id,
                    "checklist_version": value.checklist_version,
                })),
                "template_checklist_inventory": formTemplate.template_checklist_inventory.map((value) => ({
                    'inventory_id': value.inventory_id,
                    'inventory_version': value.inventory_version,
                }))
            }

            const response = await useFetchApi<BaseResponse<any>>('/template-checklist-create', 'template-checklist-create', 'post', data);
            
            if(response.status.value == 'success'){
                console.log(response.data.value);
            }
            
        } catch (error: any) {
            ElMessage.error(`${error.response?.message ?? error}`);
        } finally {
            loading.value = false;
        }
    }

    const onCheckMeter = (value: string[]) => {
        if(value.includes("is_hour_meter")){
            formTemplate.is_hour_meter = true;
            console.log(formTemplate);
        }else{
            formTemplate.is_hour_meter = false;
        }
        if(value.includes("is_kilo_meter")){
            formTemplate.is_kilo_meter = true;
        }else{
            formTemplate.is_kilo_meter = false;
        }
    }

    const submitForm = async (formEl: FormInstance | undefined) => {
    
        if (!formEl) return
        await formEl.validate((valid, fields) => {
            if (valid) {
                onSubmitTemplate(formEl);
            } else {
                console.log('error submit!', fields)
            }
        })
    }

    const resetForm = (formEl: FormInstance | undefined) => {
        if (!formEl) return
        formEl.resetFields();
    }

    const addNewLine = () => {
        const add = [...formTemplate.template_checklist_item, {
            unique_id: null,
            template_checklist_id: null,
            checklist_id: '',
            checklist_version: 0,
            checklist_name: '',
            checklist: null,
            is_new: true,
        }];

        formTemplate.template_checklist_item = add;

    }

    const addNewLineInventory = () => {
        const add = [...formTemplate.template_checklist_inventory, {
            unique_id: null,
            template_checklist_id: null,
            inventory_id: null,
            inventory_name: '',
            inventory_version: 0,
            inventory: null,
            is_new: true,
        }];

        formTemplate.template_checklist_inventory = add;

    }

    const querySearchInventories = (queryString: string, cb: (arg: any) => void) => {
        const data: RequestSearch = {
            table: 'inventories',
            column: [],
            keyword: queryString,
            limit: "20",
            offset: "1",
            sort: null,
        }
        useFetchApi<ResponsePagination<Inventory[]>>('/search', 'search-inventories', 'post', data).then((response) => {
            if(response.status.value == 'success'){
                const inventories: Inventory[] = response.data?.value?.data ?? [];
                if(inventories.length > 0){
                    console.log(inventories);
                    cb(inventories.map((value) => ({ ...value, value: value.catalogue?.name ?? '', is_new: false })));
                }
            }
        }).catch((error: any) => {
            ElMessage.error(`${error.response?.data?.message ?? error}`);
        })
    }

    const selectInventories = (item: Record<string, any>, scope: any) => {
        const inventory: Inventory = item as Inventory;
        formTemplate.template_checklist_inventory[scope.$index].inventory = inventory;
        formTemplate.template_checklist_inventory[scope.$index].inventory_name = inventory.catalogue?.name ?? '';
        formTemplate.template_checklist_inventory[scope.$index].inventory_id = inventory.unique_id;
        formTemplate.template_checklist_inventory[scope.$index].inventory_version = inventory.version;
    }

    const querySearchAsyncChecklist = (queryString: string, cb: (arg: any) => void) => {
        const data: RequestSearch = {
            table: 'maintenance_checklist',
            column: [],
            keyword: queryString,
            limit: "20",
            offset: "1",
            sort: null,
        }
        useFetchApi<ResponsePagination<ChecklistAttribute[]>>('/search', 'maintenance_checklist', 'post', data).then((response) => {
            if(response.status.value == 'success'){
                const catalogues: ChecklistAttribute[] = response.data?.value?.data ?? [];
                if(catalogues.length > 0){
                    cb(catalogues.map((value) => ({ ...value, value: value.name, is_new: false })));
                }else{
                    cb([{value: `Tambahkan ${queryString}`, is_new: true, label: queryString}]);
                }
            }
        }).catch((error: any) => {
            ElMessage.error(`${error.response?.data?.message ?? error}`);
        })
    }

    const handleSelectSearchChecklist = (item: Record<string, any>, scope: any) => {
        
        
        if(item.is_new){
            formTemplate.template_checklist_item[scope.$index].checklist_name = item.label ?? '';
            useFetchApi<BaseResponse<ChecklistAttribute>>('/maintenance-checklist-create', 'create-checklist', 'post', {name: item.label ?? '', value_type: 'text'}).then((response) => {
                if(response.status.value == 'success'){
                    const new_checklist = response.data.value?.data as ChecklistAttribute;
                    formTemplate.template_checklist_item[scope.$index].checklist_id = new_checklist.unique_id!;
                    formTemplate.template_checklist_item[scope.$index].checklist_name = new_checklist.name!;
                    formTemplate.template_checklist_item[scope.$index].checklist_version = new_checklist.version!;
                    formTemplate.template_checklist_item[scope.$index].checklist = new_checklist;
                    
                }
            });
        }else{
            const checklist: ChecklistAttribute = item as ChecklistAttribute;
            formTemplate.template_checklist_item[scope.$index].checklist_name = checklist.name ?? '';
            formTemplate.template_checklist_item[scope.$index].checklist_id = checklist.unique_id ?? '';
            formTemplate.template_checklist_item[scope.$index].checklist_version = checklist.version!;
            formTemplate.template_checklist_item[scope.$index].checklist = checklist;
        }
    }

    const closeDrawer = () => {
        drawer_checklist.value = false;
    }

    const openDrawer = (data: ChecklistAttribute) => {
        console.log(data);
        if(data != null){
            checklistEdit.value = data;
            drawer_checklist.value = true;
        }else{
            ElMessage.error(`Pilih Checklist Terlebih Dahulu!`);
        }
    }


    const getUpdateData = async () => {
        loading.value = false;
        try {
            const template_id = useCookie('template_id');
            const unique_id = template_id.value;
            const response = await useFetchApi<BaseResponse<TemplateChecklist>>(`/template-checklist-read/${unique_id}`, 'get-update-data', 'get', null);

            if(response.status.value == 'success'){
                const dataTemplate: TemplateChecklist|undefined = response.data.value?.data;

                if(dataTemplate != undefined){
                    formTemplate.unique_id = dataTemplate.unique_id;
                    formTemplate.is_hour_meter = dataTemplate.is_hour_meter;
                    formTemplate.is_kilo_meter = dataTemplate.is_kilo_meter;
                    
                    const meters = [];
                    
                    if(dataTemplate.is_hour_meter){
                        meters.push('is_hour_meter');
                    }
                    if(dataTemplate.is_kilo_meter){
                        meters.push('is_kilo_meter');
                    }
                    
                    formTemplate.meter = meters;


                    formTemplate.created_at = dataTemplate.created_at;
                    formTemplate.created_by = dataTemplate.created_by;
                    formTemplate.name = dataTemplate.name;
                    formTemplate.updated_at = dataTemplate.updated_at;
                    formTemplate.version = dataTemplate.version;
                    if(dataTemplate.template_checklist_item.length > 0){
                        formTemplate.template_checklist_item = dataTemplate.template_checklist_item.map((value) => ({
                            unique_id: value.unique_id,
                            template_checklist_id: value.template_checklist_id,
                            checklist_id: value.checklist_id,
                            checklist: value.checklist,
                            checklist_name: value.checklist?.name ?? '',
                            checklist_version: value.checklist?.version ?? 0,
                            is_new: false,
                        }));
                    }else{
                        // addNewLine();
                    }
                    formTemplate.hour_meter = dataTemplate.hour_meter;
                    formTemplate.kilo_meter = dataTemplate.kilo_meter;
                    if(dataTemplate.template_checklist_inventory.length > 0){
                        formTemplate.template_checklist_inventory = dataTemplate.template_checklist_inventory.map((value) => ({
                            unique_id: value.unique_id,
                            template_checklist_id: value.template_checklist_id,
                            inventory_id: value.inventory_id,
                            inventory_name: value.inventory?.catalogue?.name ?? '',
                            inventory_version: value.inventory?.version ?? 0,
                            inventory: value.inventory,
                            is_new: false,
                        }));
                    }else{
                        // addNewLineInventory();
                    }
                }else{
                    ElMessage.error(`Data Tidak Di Temukan!`);
                }
            }

        } catch (error: any) {
            ElMessage.error(`${error.response?.message ?? error}`);
        } finally {
            loading.value = false;
        }
    }

    onMounted(() => {
        const template_id = useCookie('template_id');
        if(template_id.value != null){
            getUpdateData();
        }
    })
</script>