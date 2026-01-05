<template>
    <TrumsWrapper>
        
        <div v-if="!props.dataInterface.pending && props.dataInterface.data">
            <el-card class="my-3" shadow="never">
                <template #header>
                    <div class="flex justify-end">
                        <el-button type="default" :icon="Refresh" :disabled="loading" :loading="loading" @click="fetchInquiry">Reload</el-button>
                        <el-button type="danger" :disabled="loading" :loading="loading" :icon="Delete" @click="confirmDelete">Hapus</el-button>
                        <NuxtLink 
                            :disabled="loading" :loading="loading"
                            :to="`/sales/inquiry/add?id=${inquiryData?.unique_id}`" 
                            class="el-button el-button--warning"
                        >
                            <el-icon class="me-2"><Edit /></el-icon> Edit
                        </NuxtLink>
                       
                        <NuxtLink 
                            :href="`/sales/canvassing/add?inquiry_id=${inquiryData?.unique_id}`"
                            class="el-button el-button--primary" 
                            :disabled="loading" :loading="loading"
                        >
                            Canvassing
                        </NuxtLink>
                        <el-button 
                            type="primary" 
                            :disabled="loading" :loading="loading"
                            v-if="inquiryData?.status === InquiryStatus.APPROVE"
                            @click="markAsCompleted"
                        >
                            <el-icon class="me-2"><CircleCheck /></el-icon> Mark as Completed
                        </el-button>
                    </div>
                </template>
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
                        
                        
                        </el-descriptions>
                    </div>
                    <div class="flex-1">
                        <el-descriptions
                            title=""
                            :column="1"
                            size="large"
                            border
                        >
                            <el-descriptions-item label="Diminta Oleh">{{ inquiryData?.request_to?.name ?? '-' }} </el-descriptions-item>
                            <el-descriptions-item label="PIC">{{ inquiryData?.request_by?.name ?? '-' }}</el-descriptions-item>
                           
                        </el-descriptions>
                    </div>
                </div>

                

                <el-descriptions title="Alamat">
                    <el-descriptions-item label="">{{generateResultSearchAddress(inquiryData?.address ?? null).street}}</el-descriptions-item>
                </el-descriptions>
                <el-descriptions title="Note">
                    <el-descriptions-item label="">
                        <div v-html="`${formattedText(inquiryData?.description ?? '')}`"></div>
                    </el-descriptions-item>
                </el-descriptions>


            </el-card>
            <el-card shadow="never">
                <h1 class="mb-4">Item Permintaan</h1>
                <el-table :data="inquiryData?.item_request ?? []" style="width: 100%" border>
                   
                    
                    <el-table-column prop="catalogue_name" label="Nama Item" />
                    <el-table-column prop="sn" label="Serial/Part Number" width="180" />
                    <el-table-column prop="request_qty" label="Request QTY" width="150"/>
                    
                    <el-table-column prop="unit_name" label="UOM" width="100" />
                    <el-table-column label="Status" width="100">
                        <template #default="scope">
                            <el-tag :type="scope.row.remaining_qty == 0 ? 'primary' : 'warning'">
                                {{scope.row.remaining_qty == 0 ? 'Selesai' : 'Diproses'}}
                            </el-tag>
                        </template>
                    </el-table-column>
                </el-table>
            </el-card>
        </div>
        
    </TrumsWrapper>

    <el-dialog v-model="visibleApproveDialog" title="Approve Inquiry!" width="500">
      <el-form :model="approveForm" :label-position="formApproveLabel">
        <el-form-item label="Catatan" prop="note">
          <el-input v-model="approveForm.note" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="visibleApproveDialog = false">Cancel</el-button>
          <el-button type="primary" @click="submitApproval">
            Approve
          </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="visibleRejectDialog" title="Reject Inquiry!" width="500">
      <el-form :model="approveForm" :label-position="formApproveLabel">
        <el-form-item label="Catatan" prop="note">
          <el-input v-model="approveForm.note" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="visibleApproveDialog = false">Cancel</el-button>
          <el-button type="danger" @click="rejectApproval">
            Submit
          </el-button>
        </div>
      </template>
    </el-dialog>
</template>

<script lang="tsx" setup>

    import { NuxtLink } from '#components';
    import type { CheckboxValueType, Column, FormProps, SortBy } from 'element-plus';
    import { ref, onMounted } from 'vue';
    import SelectionCell from '~/components/trums/table/SelectionCell.vue';
    import type { Contact } from '~/types/contact';
    import { InquiryStatus, type Inquiry } from '~/types/inquiry';
    import { ItemRequestTrailStatus, type ItemRequest, type ItemRequestTrail } from '~/types/item_request';
    import type { Maintenance } from '~/types/maintenance';
    import type { BaseResponse, DataInterface } from '~/types/response';
    import ErrorPage from '~/components/trums/ErrorPage.vue';
    import type { RequestSearch } from '~/types/request_search';
    import type { ResponsePagination } from '~/types/response_pagination';
    import type { Inventory } from '~/types/inventory';
    import { Delete, Upload, CircleClose, CircleCheck, Edit, Refresh } from '@element-plus/icons-vue';
    import type { PurchaseOrder } from '~/types/scm/purchase_order';
    import type { AddressType } from '~/types/address';

    const props = defineProps<{
        dataInterface: DataInterface<Inquiry>
    }>()

    definePageMeta({
        middleware: ["auth", "app"],
    });
    const router = useRouter();

    const errorPage = ref<boolean>(false);
    const activeCollapse = ref<string[]>(['RAB', 'SO']);
    const activeNameTab = ref('inquiry')

    const visibleApproveDialog = ref<boolean>(false);
    const visibleRejectDialog = ref<boolean>(false);
    const formApproveLabel = ref<FormProps['labelPosition']>('top')
    const approveForm = reactive({
        note: ''
    })
    
    const goBack = () => router.back();

    onMounted(() => {
        console.log('prop', props.dataInterface);
    })
    

    const request_sugestion_item = ref<RequestSearch>({
        table: "inventories",
        keyword: "",
        column: [],
        sort: null,
        offset: '1',
        limit: '10'
    });

    const releatedItemRequest = ref<ResponsePagination<Inventory[]>>({
        currentPage: 0,
        data: [],
        success: true,
        total_data: 0,
        total_page: 0,
        privilege: []
    });
    

    const inquiryData = ref<Inquiry>(props.dataInterface.data!);
    const loading = ref<boolean>(false);
    const loadingBook = ref<boolean>(false);
    
    const confirmDelete = () => {
        ElMessageBox.confirm(
            'Inquiry akan dihapus secara permanen. Lanjutkan?',
            'Warning',
            {
            confirmButtonText: 'Hapus',
            cancelButtonText: 'Batal',
            type: 'warning',
            }
        ).then(async () => {
            handleSubmitDelete([inquiryData.value?.unique_id ?? ''])
        }).catch(() => {
            // Cancel
        })
    }

    const generateResultSearchAddress = (address: AddressType|null) => {
        if(address){
            const name = `(${address.contact_name})`;
            const street = `${address.street}, ${address.village}, ${address.city}, ${address.regency}, ${address.province}`;
            const address_id = address.unique_id;
            const address_version = address.version;
            return {
                value: name,
                name: name,
                street: street,
                address_id: address_id,
                address_version: address.version,
            }
        }else{
            return {
                value: '',
                name: '',
                street: '',
                address_id: '',
                address_version: 0,
            }
        }
    }

    const handleSubmitDelete = async (values: string[]) => {
        try {
            const response = await useFetchApi(
                "/inquiries-delete",
                "delete_data",
                "post",
                values
                );
            if (response.status.value == "success") {
                goBack();
            }
        } catch (error: any) {
            ElMessage.error(`${error?.response?.data?.message ?? error}`);
        }
    };


    const onSort = (sortBy: SortBy) => {
       
        // const data:RequestSearch = {...request_search.value};
        // data.sort = {
        //     column: sortBy.key.toString(),
        //     order: request_search.value.sort?.order == OrderColumn.ASC ? OrderColumn.DESC : OrderColumn.ASC
        // };
        // request_search.value = data;

    }

    const findRelatedByRequest = (catalogue_id: string): Inventory[] => {
        console.log("catalogue : ", catalogue_id);
        return releatedItemRequest.value.data.filter((value) => value.catalogue_id === catalogue_id);
    }


    watchDebounced(
        request_sugestion_item.value,
        () => {
            // invoices.value.currentPage = 1
            fetchRelatedData()
        },
        { debounce: 500 }
    )

    const approveInquiry = () => {
        visibleApproveDialog.value = true;
    }
    const cancelInquiry = () => {
        visibleRejectDialog.value = true;
    }

    const submitForApproval = async () => {
        await updateStatus(InquiryStatus.WAITING)
    }

    const submitApproval = async () => {
        await updateStatus(InquiryStatus.APPROVE, approveForm.note)
        visibleApproveDialog.value = false
        approveForm.note = ''
    }
    const rejectApproval = async () => {
        await updateStatus(InquiryStatus.CANCEL, approveForm.note)
        visibleRejectDialog.value = false
        approveForm.note = ''
    }

    const markAsCompleted = async () => {
        await updateStatus(InquiryStatus.DONE)
    }

    const updateStatus = async (status: InquiryStatus, note: string = '') => {
        if (!inquiryData.value) return
        
        loading.value = true
        try {
            const formData = new FormData()
            formData.append('unique_id', `${inquiryData.value.unique_id}`);
            formData.append('status', status);
            // if (note) {
            //   formData.append('additional_', note)
            // }

            // (inquiryData.value.purchase_order_item ?? []).forEach((item: PurchaseOrderItem, index: number) => {
            // formData.append(`item[${index}][unique_id]`, item.unique_id)
            // formData.append(`item[${index}][quantity]`, `${item.quantity}`)
            // formData.append(`item[${index}][item_request_trail_id]`, `${item.item_request_trail_id}`)

            // if(status == PurchaseOrderStatus.PENDING_APPROVAL){
            //     formData.append(`item[${index}][status]`, `${PurchaseOrderItemStatus.PENDING_APPROVAL}`)
            // }else{
            //     formData.append(`item[${index}][status]`, `${item.status}`)
            // }
            

            
            // })

            const response = await useFetchApi<BaseResponse<Inquiry>>(
                '/inquiries-create',
                'update-status',
                'post',
                formData
            )
            
            if (response.status.value === 'success') {
                inquiryData.value.status = status
                ElMessage.success('Status berhasil diupdate')
                // await fetchInquiry() // Refresh data
            }
        } catch (error) {
            ElMessage.error('Gagal mengupdate status')
            console.error(error)
        } finally {
            loading.value = false
        }
        }

const formattedText = (text: string) => {
        return text.replace(/\n/g, '<br>');
    }

    const fetchRelatedData = async () => {
        console.log('call');
        if (!inquiryData) return

        
        
        try {
            // Fetch related purchase orders
            const inventoriesResponse = await useFetchApi<ResponsePagination<Inventory[]>>(
                `/search`,
                'related-item-request',
                'post',
                request_sugestion_item,
            )
            
            if (inventoriesResponse.status.value === 'success') {
                releatedItemRequest.value = inventoriesResponse.data.value || {
                    currentPage: 0,
                    data: [],
                    success: true,
                    total_data: 0,
                    total_page: 0,
                }
            }
        } catch (error) {
            console.error('Failed to fetch related data', error)
        }
    }

    const fetchInquiry = async () => {
       
        loading.value = true;
        try {
            // Fetch related purchase orders
            const inquiry = await useFetchApi<BaseResponse<Inquiry>>(`/inquiries-read/${inquiryData.value.unique_id}`, 'inquiry', 'get', null);
            
            if (inquiry.status.value === 'success') {
                if(inquiry.data.value?.data){
                    inquiryData.value = inquiry.data.value!.data;
    
                    request_sugestion_item.value.column = [
                        {
                            "catalogue_id": (inquiryData.value?.item_request ?? []).map((value) => value.catalogue_id),
                        }
                    ];
                }
            }
        } catch (error) {
            console.error('Failed to fetch related data', error)
        } finally {
            loading.value = false;
        }
    }

    const onCheckout = async () => {
        loading.value = true;
        try {
            const to: {name: string, version: number, unique_id: string} = {name: '', unique_id: '', version: 1};
            if(inquiryData.value!.reference == 'non_maintenance'){
                to.name = (inquiryData.value!.reference_data as Contact).name;
                to.version = (inquiryData.value!.reference_data as Contact).version;
                to.unique_id = (inquiryData.value!.reference_data as Contact).unique_id;
            }else if(inquiryData.value!.reference == 'maintenance'){
                to.name = (inquiryData.value!.reference_data as Maintenance).inspection_item?.inventories?.catalogue?.name ?? '';
                to.version = (inquiryData.value!.reference_data as Maintenance).version;
                to.unique_id = (inquiryData.value!.reference_data as Maintenance).unique_id;
            }
            const data = {
                'type': 'out',
                'reference': 'inquiry',
                'reference_id': inquiryData.value!.unique_id,
                'from': inquiryData.value!.location_id,
                'from_name': inquiryData.value!.location?.name,
                'from_version': inquiryData.value!.location?.version,
                'to': to.unique_id,
                'to_name': to.name,
                'to_version': to.version,
                'status': 'waiting',
                // "address_id": "",
                // "address_version": 0,
                // "delivery_id": "",
                // "schedule_date": 0,
                // "source_document": "",
                "movement_item": inquiryData.value!.item_request.map((value) => {
                    return {
                        'inventory_id': value.inventory_id,
                        'quantity': value.request_qty,
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


    const formatItemStatus = (status: string | undefined) => {
        if (!status) return '-'
        
        const statusMap: Record<string, string> = {
            [ItemRequestTrailStatus.WAITING]: 'Menunggu Persetujuan',
            [ItemRequestTrailStatus.REJECT]: 'Dibatalkan',
            [ItemRequestTrailStatus.DONE]: 'Selesai'
        }
        
        return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1)
    }

    const getItemStatusTagType = (status: string): 'success' | 'info' | 'danger' | 'warning' | 'primary' => {
      switch (status) {
        case ItemRequestTrailStatus.WAITING: return 'warning'
        case ItemRequestTrailStatus.WAITING: return 'warning'
        case ItemRequestTrailStatus.DONE: return 'success'
        case ItemRequestTrailStatus.REJECT: return 'danger'
        default: return 'primary'
      }
    }

    const toBooking = async (inventory: Inventory, quantity: number, item_request_id: string) => {
        loadingBook.value = true;
        try {
            const response = await useFetchApi<BaseResponse<ItemRequestTrail>>('/item-request-trail-create', 'item-request-trail-create', 'post', {
                "item_request_id": item_request_id,
                "reference": "inventory",
                "reference_id": inventory.unique_id,
                "quantity": quantity,
                "status": "done"
            });

            if(response.status.value === 'success'){
                ElMessage.error(`Item Berhasil Di Booking!`)
                fetchRelatedData();
            }
        } catch (error: any) {
            ElMessage.error(`${error.response?.message ?? error}`)
        } finally {
            loadingBook.value = false;
        }
    }

    const getSourceRequestLabel = () => {
        if(inquiryData.value!.reference == 'non_maintenance'){
            return 'Non-maintenance';
        }else if(inquiryData.value!.reference == 'maintenance'){
            return 'Maintenance';
        }else if(inquiryData.value!.reference == 'so'){
            return 'Sales Order';
        }
    }
    const getSourceRequestLink = () => {
        if(inquiryData.value!.reference == 'non-maintenance'){
            return `/contact/${(inquiryData.value!.reference_data as Contact).unique_id}`;
        }else if(inquiryData.value!.reference == 'maintenance'){
            return `/maintenance/${(inquiryData.value!.reference_data as Maintenance).unique_id}`;
        }else if(inquiryData.value!.reference == 'so'){
            return `/sales/order/${(inquiryData.value!.reference_data as PurchaseOrder).unique_id}`;
        }
    }
    const getSourceRequestNumber = () => {
        if(inquiryData.value!.reference == 'non-maintenance'){
            return (inquiryData.value!.reference_data as Contact).unique_code;
        }else if(inquiryData.value!.reference == 'maintenance'){
            return (inquiryData.value!.reference_data as Maintenance).unique_code;
        }else if(inquiryData.value!.reference == 'so'){
            return (inquiryData.value!.reference_data as PurchaseOrder).unique_code;
        }
    }

    
</script>