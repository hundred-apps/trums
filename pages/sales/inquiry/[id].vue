<template>
    <TrumsWrapper>
        <el-page-header @back="goBack">
            
            <template #content>
                <span class="text-large font-600 mr-3"> Request - {{ !inquiryData.pending && inquiryData.data ? inquiryData?.data?.unique_code : '' }} </span>
            </template>
        </el-page-header>
      
        <el-tabs
            v-model="activeNameTab"
            
            class="demo-tabs mt-5"
            v-if="!loading"
            type="border-card"
        >
            <el-tab-pane label="Inquiry" name="inquiry">
                <InquiryDetail v-if="!inquiryData.pending && inquiryData.data" :data-interface="inquiryData!"/>
            </el-tab-pane>
            <el-tab-pane label="RAB" name="rab">
                <div v-if="canvassing.pending">
                    Loading.....
                </div>
                <div v-else-if="!canvassing.pending && canvassing.data">
                    <CanvassingDetail :canvassing-data="canvassing.data" :privilages="privilages"/>
                </div>
                <div v-else-if="canvassing.code === 403">
                    <ActionNotPermitted button-label="Kembali" redirect-to="/sales/inquiry" />
                </div>
                <el-result
                    v-else
                    icon="warning"
                    title="Belum ada RAB Terkait!"
                    sub-title="Data RAB yang terkait dengan inquiry ini belum ada!"
                >
                    <template #extra>
                    <el-button type="primary">Buat RAB</el-button>
                    </template>
                </el-result>
            </el-tab-pane>
            <el-tab-pane label="SO" name="so">
                <div v-if="!salesOrder.pending && salesOrder.data">
                    <SalesOrderDetail :purchase-order="salesOrder.data"/>
                </div>
                <el-result
                    v-else
                    icon="warning"
                    title="Belum ada SO Terkait!"
                    sub-title="Data SO yang terkait dengan inquiry ini belum ada!"
                >
                    <template #extra>
                    <el-button type="primary">Buat SO</el-button>
                    </template>
                </el-result>
            </el-tab-pane>
            
        </el-tabs>
        
    </TrumsWrapper>

    
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
    import ActionNotPermitted from '~/components/trums/ActionNotPermitted.vue';
    import CanvassingDetail from '../quotation/components/CanvassingDetail.vue';
    import InquiryDetail from './components/InquiryDetail.vue';
import type { Canvassing } from '~/types/scm/canvasing';
import type { Permission } from '~/types/menu';

    definePageMeta({
        middleware: ["auth", "check-access"],
        name: "Detail Permintaan SI",
        requiredPermission: "canvassing-read",
    });
    const router = useRouter();

    const errorPage = ref<boolean>(false);
    
    const activeNameTab = ref('inquiry')
    
    const goBack = () => router.back();
    const id = ref<string>((router.currentRoute.value.params.id as string) ?? '')

    
    

    const inquiryData = ref<DataInterface<Inquiry>>({
        code: 200,
        data: null,
        pending: true,
        message: '',
    });
    const loading = ref<boolean>(false);
    
    const loadingRAB = ref<boolean>(false);
    const canvassing = ref<DataInterface<Canvassing>>({
        code: 200,
        data: null,
        message: '',
        pending: true,
    })

    const privilages = ref<Permission[]>([]);

    const loadingPenawaran = ref<boolean>(false);
    const loadingSO = ref<boolean>(false);
    const salesOrder = ref<DataInterface<PurchaseOrder>>({
        code: 200,
        data: null,
        message: '',
        pending: true,
    })

    const fetchInquiry = async () => {
       
        inquiryData.value.pending = true;
        try {

            // Fetch related purchase orders
            const inquiry = await useFetchApi<BaseResponse<Inquiry>>(`/inquiries-read/${id.value}`, 'inquiry', 'get', null);
            
            if (inquiry.status.value === 'success') {
                inquiryData.value = {
                    code: 200,
                    data: inquiry.data.value?.data ?? null,
                    message: '',
                    pending: false,
                };
                
                fetchCanvassing();
                
            }


        } catch (error) {
            console.error('Failed to fetch related data', error)
        } finally {
            inquiryData.value.pending = false;
        }
    }

    

    const fetchCanvassing = async () => {
        loadingRAB.value = true;
        try {
            const request_search: RequestSearch = {
                column: [
                    {
                        source_document: [inquiryData.value?.data?.unique_code ?? '']
                    }
                ],
                keyword: '',
                limit: '1',
                offset: '1',
                table: 'canvassing',
                sort: null,
            }
            const response = await useFetchApi<BaseResponse<Canvassing[]>>('/search', 'get-rab', 'post', request_search);

            if(response.status.value == 'success'){
                canvassing.value = {
                    code: response.code || 201,
                    data: (response.data.value?.data ?? []).length > 0 ? response.data.value!.data![0] : null,
                    message: response.status.value,
                    pending: response.pending.value,
                };
                privilages.value = response.data.value?.privilege ?? [];
            }

            if(response.code == 403){
                canvassing.value = {
                    code: response.code,
                    data: null,
                    message: response.error.value?.data?.message ?? 'Action Not Permited',
                    pending: response.pending.value,
                }
            }

            console.log(response);
        } catch (error: any) {
            ElMessage.error(error.response?.message ?? error);
        } finally {
            loadingRAB.value = false;
        }
    }
    
    // watch(inquiryData.value!, fetchCanvassing, {immediate: true});

    onMounted(() => {
        if(id.value){
            fetchInquiry();
        }
    })
</script>