<template>
    <el-page-header @back="goBack">
        <template #content>
            <span class="text-large font-600 mr-3"> Request - {{ inquiryData?.unique_code }} </span>
        </template>
    </el-page-header>
    <el-card class="my-3">
        <el-button type="primary" @click="onCheckout" :loading="loading">Proses</el-button>
        <div class="flex gap-3 my-3">
            <div class="flex-1">
                <el-descriptions
                    title=""
                    :column="1"
                    size="large"
                    border
                >
                <el-descriptions-item label="Prioritas Permintaan">{{ inquiryData?.priority.toUpperCase() }}</el-descriptions-item>
                <el-descriptions-item label="Tanggal Permintaan">{{ formatLocalDate(inquiryData!.date!) }}</el-descriptions-item>
                <el-descriptions-item label="Permintaan">{{ inquiryData!.reference }}</el-descriptions-item>
                </el-descriptions>
            </div>
            <div class="flex-1">
                <el-descriptions
                    title=""
                    :column="1"
                    size="large"
                    border
                >
                    <el-descriptions-item label="Sumber Permintaan">{{ getSourceRequestLabel() }} - (<NuxtLink :href="getSourceRequestLink()">{{ getSourceRequestNumber() }}</NuxtLink>)</el-descriptions-item>
                    <el-descriptions-item label="Alamat">
                        -
                    </el-descriptions-item>
                    <el-descriptions-item label="Diminta Oleh">{{ inquiryData?.people.name }}</el-descriptions-item>
                </el-descriptions>
            </div>
        </div>
        <el-descriptions title="Note">
            <el-descriptions-item label="">{{inquiryData?.description}}</el-descriptions-item>
        </el-descriptions>
    </el-card>
    <el-card>
        <h1 class="mb-4">Item Permintaan</h1>
        <el-table :data="inquiryData?.item_request ?? []" style="width: 100%">
            <el-table-column prop="catalogue_name" label="Nama Item" width="180" />
            <el-table-column prop="sn" label="Serial/Part Number" width="180" />
            <el-table-column prop="quantity" label="Quantity" />
            <el-table-column prop="unit_name" label="UOM" />
        </el-table>
    </el-card>
</template>

<script lang="tsx" setup>

    import { NuxtLink } from '#components';
    import type { CheckboxValueType, Column, SortBy } from 'element-plus';
    import { ref, onMounted } from 'vue';
    import SelectionCell from '~/components/trums/table/SelectionCell.vue';
    import type { Contact } from '~/types/contact';
    import type { Inquiry } from '~/types/inquiry';
    import type { ItemRequest } from '~/types/item_request';
    import type { Maintenance } from '~/types/maintenance';
    import type { BaseResponse } from '~/types/response';
    definePageMeta({
        middleware:['auth', 'app'],
        name: "Detail Request",
    })
    const router = useRouter();
    
    const goBack = () => router.back();
    const id = ref<string>((router.currentRoute.value.params.id as string) ?? '')

    const {data} = await useFetchApi<BaseResponse<Inquiry>>(`/inquiries-read/${id.value}`, 'inquiry', 'get', null);
    const inquiryData = (data as Ref<BaseResponse<Inquiry> | null>).value?.data; 
    const loading = ref<boolean>(false);
    const columns: Column<ItemRequest>[] = [
        {
            title: '', 
            dataKey: '',
            key: 'selection',
            width: 50,
            cellRenderer: ({ rowData }) => {
                const onChange = (value: CheckboxValueType) => (rowData.checked = value)
                return <SelectionCell value={rowData.checked} onChange={onChange} />
            },
            maxWidth: 50,

            headerCellRenderer: () => {
                const _data = unref(data)
                const onChange = (value: CheckboxValueType) =>
                (data.value = {success: true, message: _data?.message ?? '', data: {..._data?.data!, item_request: _data?.data?.item_request.map((row: any) => {
                    row.checked = value
                    return row
                })!}})
                const allSelected = _data!.data.item_request.every((row) => row.checked)
                const containsChecked = _data?.data.item_request.some((row) => row.checked)

                return (
                <SelectionCell
                    style={{width: 50}}
                        value={allSelected}
                        interminate={(containsChecked && !allSelected)}
                        onChange={onChange}
                    />
                )
            },
        },
        {
            title: 'Nama Item', 
            dataKey: 'catalogue_name',
            key: 'catalogue_name',
            width: 200,
            cellRenderer: ({rowData: row}) => <NuxtLink href={`inqueiries/${row.unique_id}`} class={'text-blue-600'}>{row.unique_code}</NuxtLink>
        },
        {
            title: 'Serial/Part Number', 
            dataKey: 'sn',
            key: 'sn',
            width: 200,
        },
        {
            title: 'Quantity', 
            dataKey: 'quantity',
            key: 'quantity',
            width: 200,
        },
        {
            title: 'UOM', 
            dataKey: 'unit_name',
            key: 'unit_name',
            width: 200,
        },
        {
            title: 'Operasi',
            key: '',
            width: 250,
            cellRenderer: ({rowData: row}) => (
                <>
                {/* <ElButton size="small" onClick={() => handleEdit(row)}>
                    Edit
                </ElButton>
                <DeleteButton  onConfirm={() => handleDelete(row)} onCancel={() => {}} /> */}
                
                </>
            ),
        }
    ]

    const onSort = (sortBy: SortBy) => {
       
        // const data:RequestSearch = {...request_search.value};
        // data.sort = {
        //     column: sortBy.key.toString(),
        //     order: request_search.value.sort?.order == OrderColumn.ASC ? OrderColumn.DESC : OrderColumn.ASC
        // };
        // request_search.value = data;

    }

    const onCheckout = async () => {
        loading.value = true;
        try {
            const to: {name: string, version: number, unique_id: string} = {name: '', unique_id: '', version: 1};
            if(inquiryData?.reference == 'internal'){
                to.name = (inquiryData.reference_data as Contact).name;
                to.version = (inquiryData.reference_data as Contact).version;
                to.unique_id = (inquiryData.reference_data as Contact).unique_id;
            }else if(inquiryData?.reference == 'repair'){
                to.name = (inquiryData.reference_data as Maintenance).inspection_item?.inventories?.catalogue?.name ?? '';
                to.version = (inquiryData.reference_data as Maintenance).version;
                to.unique_id = (inquiryData.reference_data as Maintenance).unique_id;
            }
            const data = {
                'type': 'out',
                'reference': 'inquiry',
                'reference_id': inquiryData?.unique_id,
                'from': inquiryData?.location_id,
                'from_name': inquiryData?.location?.name,
                'from_version': inquiryData?.location?.version,
                'to': to.unique_id,
                'to_name': to.name,
                'to_version': to.version,
                'status': 'waiting',
                // "address_id": "",
                // "address_version": 0,
                // "delivery_id": "",
                // "schedule_date": 0,
                // "source_document": "",
                "movement_item": inquiryData?.item_request.map((value) => {
                    return {
                        'inventory_id': value.inventory_id,
                        'quantity': value.quantity,
                    }
                }),
            }

            console.log(data);

            // const response = await useFetchApi('/inventory-movement-create', 'inquiry_create', 'post', data);

            const response = await useFetchApi('/inventory-movement-create', 'inquiry_create', 'post', data);

            if(response.status.value == 'success'){
                ElMessage.success('Berhasil!');
                await refreshNuxtData('inquiry');
            }


        } catch (error: any) {
            ElMessage.error(`${error.respose?.data?.message}`);
        } finally {
            loading.value = false;
        }
    }

    const getSourceRequestLabel = () => {
        if(inquiryData?.reference == 'internal'){
            return (inquiryData.reference_data as Contact).name;
        }else if(inquiryData?.reference == 'repair'){
            return (inquiryData.reference_data as Maintenance).inspection_item?.inventories?.catalogue?.name ?? '';
        }
    }
    const getSourceRequestLink = () => {
        if(inquiryData?.reference == 'internal'){
            return `/contact/${(inquiryData.reference_data as Contact).unique_id}`;
        }else if(inquiryData?.reference == 'repair'){
            return `/maintenance/${(inquiryData.reference_data as Maintenance).catalogues?.name}`;
        }
    }
    const getSourceRequestNumber = () => {
        if(inquiryData?.reference == 'internal'){
            return (inquiryData.reference_data as Contact).unique_code;
        }else if(inquiryData?.reference == 'repair'){
            return (inquiryData.reference_data as Maintenance).unique_code;
        }
    }
</script>