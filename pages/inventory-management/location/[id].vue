<template>
    <el-page-header @back="goBack">
        <template #content>
            <span class="text-large font-600 mr-3"> {{ detail?.name }} </span>
        </template>
    </el-page-header>
    <el-card class="my-3">
        <!-- <el-button type="primary" @click="() => {}" :loading="loading">Proses</el-button> -->
        <div class="flex gap-3 my-3">
            <div class="flex-1">
                <el-descriptions
                    title=""
                    :column="1"
                    size="large"
                    border
                >
                    <el-descriptions-item label="Unique Code">{{ detail?.unique_code }}</el-descriptions-item>
                    <el-descriptions-item label="Nama">{{ detail?.name }}</el-descriptions-item>
                    
                </el-descriptions>
            </div>
            <div class="flex-1">
                <el-descriptions
                    title=""
                    :column="1"
                    size="large"
                    border
                >
                    <el-descriptions-item label="Asset">{{ detail?.is_asset ? 'YA' : 'TIDAK' }}</el-descriptions-item>
                    <el-descriptions-item label="SN">{{ detail?.sn ?? '-'}}</el-descriptions-item>
                    
                </el-descriptions>
            </div>
        </div>
        <el-descriptions title="Deskripsi">
            <el-descriptions-item label="">{{ detail?.description ?? '' }}</el-descriptions-item>
        </el-descriptions>
    </el-card>
    <el-card>
        <h1 class="mb-4">Daftar Inventori</h1>
        <CustomTable :column-sort="onSort" :columns="filteredColumn" :data="data?.data ?? []"  />
    </el-card>
</template>

<script lang="tsx" setup>
import { ElButton, ElCheckbox, ElIcon, ElPopover, ElTag, TableV2FixedDir, type CheckboxValueType, type Column, type SortBy } from 'element-plus';
import type { Catalogue } from '~/types/catalogue';
import type { Inventory } from '~/types/inventory';
import { OrderColumn, type RequestSearch } from '~/types/request_search';
import type { BaseResponse } from '~/types/response';
import type { ResponsePagination } from '~/types/response_pagination';
import type { Unit } from '~/types/unit';
import { Filter, SetUp } from '@element-plus/icons-vue'
import type { FunctionalComponent } from 'vue';
import CustomTable from '~/components/trums/table/customTable.vue';

    definePageMeta({
        middleware:['auth', 'app'],
        name: "Detail Request",
    })
    const router = useRouter();
    
    const goBack = () => router.back();
    const id = ref<string>((router.currentRoute.value.params.id as string) ?? '')
    const loading = ref<boolean>(false);
    const column_selected = ref<string[]>(['selection', 'sn', 'catalogue.name', 'location.name', 'quantity', 'setup']);
    const popoverRef = ref();
    const request_search = ref<RequestSearch>({
        keyword: '',
        column: [
            {
                location_id: [id.value],
            }
        ],
        limit: "10",
        offset: "1",
        table: 'inventories',
        sort: {
            column: 'created_at',
            order: OrderColumn.ASC,
        }
    });

    const filteredColumn = computed(() => {
        return availableColumn.filter(col => column_selected.value.includes(col.key!.toString()));
    });

    const fetchDetail = async () => {
        loading.value = true;
        try {
        const response = await useFetchApi<BaseResponse<Catalogue>>(`/catalogues-read/${id.value}`, 'catalogue', 'get', null);

    
        if(response.status.value == 'success'){
            detail.value = (response.data.value as BaseResponse<Catalogue>).data;
        }
        } catch (error: any) {
            ElMessage.error(error.response?.data?.message ?? error);
            return [];
        } finally {
            loading.value = false;
        }
        
    }
    const fetchData = async () => {
        loading.value = true;
        try {
            const response = await useFetchApi<ResponsePagination<Inventory[]>>(`/search`, 'inventories', 'post', request_search.value);

        
            if(response.status.value == 'success'){
                data.value = response.data.value as ResponsePagination<Inventory[]>;
            }
        } catch (error: any) {
            ElMessage.error(`${error.response?.data?.message ?? 'Gagal Mengambil Data!'}`);
            return [];
        } finally {
            loading.value = false;
        }
        
    }

    const fetchLocation = async () => {
        loading.value = true;
        try {
        const response = await useFetchApi<ResponsePagination<Catalogue[]>>(`/search`, 'location', 'post', {
            keyword: '',
            column: [
            {
                type: ["place"],
            }
            ],
            limit: "10",
            offset: "1",
            table: 'catalogues',
            sort: {
            column: 'created_at',
            order: OrderColumn.ASC,
            }
        });

        
        if(response.status.value == 'success'){
            
            locations.value = (response.data.value as ResponsePagination<Catalogue[]>).data;
            console.log(locations.value);
        }
        } catch (error: any) {
        
        ElMessage.error(error.response?.data?.message ?? error);
        return [];
        } finally {
        loading.value = false;
        }
        
    }
    const fetchUnits = async () => {
        loading.value = true;
        try {
        const response = await useFetchApi<ResponsePagination<Unit[]>>(`/search`, 'units', 'post', {
            keyword: '',
            column: [],
            limit: "50",
            offset: "1",
            table: 'units',
            sort: {
            column: 'created_at',
                order: OrderColumn.ASC,
            }
        });

        
        if(response.status.value == 'success'){
            
            units.value = (response.data.value as ResponsePagination<Unit[]>).data;
        }
        } catch (error: any) {
        
            ElMessage.error(error.response?.data?.message ?? error);
            return [];
        } finally {
            loading.value = false;
        }
        
    }
    const detail = ref<Catalogue|null>(null);
    const { data } = await useFetchApi<ResponsePagination<Inventory[]>>(`/search`, 'inventories', 'post', request_search.value);
    const locations = ref<Catalogue[]>([]);
    const units = ref<Unit[]>([]);

    const availableColumn: Column<Inventory>[] = [
        {
        title: 'Serial Number',
        key: 'sn',
        dataKey: 'sn',
        width: 200,
        },
        {
        title: 'Item', 
        key: 'catalogue.name',
        dataKey: 'catalogue.name',
        width: 200,
        },
        {
        title: 'Location', 
        key: 'location.name',
        dataKey: 'location.name',
        width: 200,
        headerCellRenderer: () => (
            <div class="flex items-center justify-center">
            <span class="mr-2 text-xs">Location</span>
            <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
                {{
                default: () => (
                    <div class="filter-wrapper">
                    <div class="filter-group flex flex-col">
                        <el-checkbox-group v-model={request_search.value.column[0].location_id}>
                        {
                        locations.value.map((location: Catalogue) => (
                            <ElCheckbox 
                            key={location.unique_id!} 
                            value={location.unique_id!} 
                            >
                            {location.name}
                            </ElCheckbox>
                        ))
                        }
                    </el-checkbox-group>
                    </div>
                    </div>
                ),
                reference: () => (
                    <ElIcon class="cursor-pointer">
                        <Filter />
                    </ElIcon>
                ),
                }}
            </ElPopover>
            </div>
        )
        },
        {
        title: 'Quantity', 
        key: 'quantity',
        dataKey: 'quantity',
        sortable: true,
        width: 100,
        cellRenderer: ({rowData: row}) => (<>
            <p>{row.quantity}</p>
        </>)
        },
        {
        title: 'Satuan', 
        key: 'unit_name',
        dataKey: 'unit_name',
        sortable: false,
        width: 100,
        cellRenderer: ({rowData: row}) => (<>
            <p>{row.unit_name}</p>
        </>),
        headerCellRenderer: () => (
            <div class="flex items-center justify-center">
            <span class="mr-2 text-xs">Satuan</span>
            <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
                {{
                default: () => (
                    <div class="filter-wrapper">
                    <div class="filter-group flex flex-col">
                        <el-checkbox-group v-model={request_search.value.column[0].unit_id}>
                        {
                        units.value.map((unit: Unit) => (
                            <ElCheckbox 
                            key={unit.unique_id!} 
                            value={unit.unique_id!} 
                            >
                            {unit.name}
                            </ElCheckbox>
                        ))
                        }
                    </el-checkbox-group>
                    </div>
                    </div>
                ),
                reference: () => (
                    <ElIcon class="cursor-pointer">
                    <Filter />
                    </ElIcon>
                ),
                }}
            </ElPopover>
            </div>
        )
        },
        {
        title: 'Cost', 
        key: 'cost',
        dataKey: 'cost',
        sortable: true,
        width: 100,
        cellRenderer: ({rowData: row}) => (<>
            <p>{currency(row.cost)}</p>
        </>)
        }, 
        {
        title: 'Traceable',
        key: 'is_traceable',
        dataKey: 'is_traceable',
        width: 100,
        cellRenderer: ({rowData: row}) => (
            row.is_traceable ? 
            <ElTag type="primary">{'Yes'}</ElTag> : 
            <ElTag type="info">{'No'}</ElTag>
        ),
        headerCellRenderer: () => (
            <div class="flex items-center justify-center">
            <span class="mr-2 text-xs">Traceable</span>
            <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
                {{
                default: () => (
                    <div class="filter-wrapper">
                    <div class="filter-group flex flex-col">
                        <ElCheckbox value={true} v-model={request_search.value.column[0].is_traceable}>
                        Traceable
                        </ElCheckbox>
                        <ElCheckbox value={false} v-model={request_search.value.column[0].is_traceable}>
                        Not Traceable
                        </ElCheckbox>
                    </div>
                    </div>
                ),
                reference: () => (
                    <ElIcon class="cursor-pointer">
                    <Filter />
                    </ElIcon>
                ),
                }}
            </ElPopover>
            </div>
        )
        },
        {
        title: 'Operasi',
        key: 'operasi',
        width: 250,
        cellRenderer: ({rowData: row}) => (
            <>
            <ElButton size="small" onClick={() => handleEdit(row)}>
                Edit
            </ElButton>
            <ElButton size="small" type="danger" onClick={() => handleDelete(row)}>Delete</ElButton>
            
            </>
        ),
        },
        {
        title: '',
        key: 'setup',
        width: 50,
        fixed: TableV2FixedDir.RIGHT,
        
        }
    ]
    

    availableColumn[availableColumn.length - 1].headerCellRenderer = () => {
        const filters = availableColumn.filter((value) => value.key != 'selection' && value.key != 'setup');
        return (<div class="flex items-center justify-center">
        <span class="mr-2 text-xs"></span>
        <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
            {{
            default: () => (
                <div class="filter-wrapper">
                <div class="filter-group flex flex-col">
                    <el-checkbox-group v-model={column_selected.value}>
                    {
                        filters.map((value) => (
                        <ElCheckbox onChange={() => console.log("ok")} value={value.key!.toString()} >
                            {value.title}
                        </ElCheckbox>
                    ))
                    }
                    </el-checkbox-group>
                </div>
                </div>
            ),
            reference: () => (
                <ElIcon class="cursor-pointer">
                    <SetUp />
                </ElIcon>
            ),
            }}
        </ElPopover>
        </div>)
    }

    type SelectionCellProps = {
        value: boolean
        intermediate?: boolean
        onChange: (value: CheckboxValueType) => void
    }

    const SelectionCell: FunctionalComponent<SelectionCellProps> = ({
        value,
        intermediate = false,
        onChange,
    }) => {
        return (
        <ElCheckbox
            onChange={onChange}
            modelValue={value}
            indeterminate={intermediate}
        />
        )
    }

    availableColumn.unshift({
        key: 'selection',
        width: 50,
        cellRenderer: ({ rowData }) => {
        const onChange = (value: CheckboxValueType) => (rowData.checked = value)
        return <SelectionCell value={rowData.checked} onChange={onChange} />
        },

        headerCellRenderer: () => {
        const _data = unref(data)
        const onChange = (value: CheckboxValueType) =>
            (data.value = {success: true, currentPage: _data?.currentPage ?? 0, total_data: _data?.total_data ?? 0, total_page: _data?.total_data ?? 0, data: _data?.data?.map((row: any) => {
            row.checked = value
            return row
            })!})
        const allSelected = _data!.data.every((row) => row.checked)
        const containsChecked = _data?.data.some((row) => row.checked)

        return (
            <SelectionCell
            value={allSelected}
            intermediate={containsChecked && !allSelected}
            onChange={onChange}
            />
        )
        },
    })

    const handleEdit = (row: any) => {
        console.log("Editing:", row);
    };

    const handleDelete = (row: Inventory) => {
        handleSubmitDelete([row.unique_id!]);
    };

    const handleSubmitDelete = async (values: string[]) => {
        try {
            const response = await useFetchApi(`/inventories-delete`, "delete_data", 'delete', [values]);
            if(response.status.value == 'success'){
                await refreshNuxtData('inventories');
            }
        } catch (error: any) {
            ElMessage.error(`${error?.response?.data?.message ?? error}`);
        }
    }

    const onSort = (sortBy: SortBy) => {
        const data:RequestSearch = {...request_search.value};
        data.sort = {
        column: sortBy.key.toString(),
        order: request_search.value.sort?.order == OrderColumn.ASC ? OrderColumn.DESC : OrderColumn.ASC
        };
        request_search.value = data;
    }

    watch(request_search, fetchData, {immediate: true});  

    onMounted(() => {
        fetchDetail();
        fetchLocation();
        fetchUnits();
    })
</script>