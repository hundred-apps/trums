<template>
    <TrumsWrapper>
        <el-page-header @back="goBack">
            <template #content>
                <span class="text-large font-600 mr-3"> Detail - {{ checkData?.unique_code }} </span>
            </template>
        </el-page-header>
        <el-card class="my-3">
            <!-- <el-button type="primary" @click="onCheckout" :loading="loading">Proses</el-button> -->
            <div class="flex gap-3 my-3">
                <div class="flex-1">
                    <el-descriptions
                        title=""
                        :column="1"
                        size="large"
                        border
                    >
                    <el-descriptions-item label="Lokasi Awal">{{checkData?.from_name}}</el-descriptions-item>
                    <el-descriptions-item label="Tanggal">{{formatLocalDate(checkData?.created_at ?? 0)}}</el-descriptions-item>
                    <el-descriptions-item label="Status">
                        <el-tag :type="getStatusTagType(checkData!.status)">
                            {{ formatStatus(checkData!.status) }}
                        </el-tag>
                    </el-descriptions-item>
                    </el-descriptions>
                </div>
                <div class="flex-1">
                    <el-descriptions
                        title=""
                        :column="1"
                        size="large"
                        border
                    >
                        
                        <el-descriptions-item v-if="checkData!.reference == 'inquiry' || checkData!.reference == 'receives'" label="Nomor Permintaan">{{checkData?.reference ?? '-'}}</el-descriptions-item>
                        <el-descriptions-item v-if="checkData!.reference == 'so' || checkData!.reference == 'po'" label="Nomor SO/PO">{{checkData?.data_reference?.unique_code ?? '-'}}</el-descriptions-item>
                        <el-descriptions-item label="Nomor Dokumen">{{checkData?.source_document ?? '-'}}</el-descriptions-item>
                        <!-- <el-descriptions-item label="Alamat">
                            -
                        </el-descriptions-item> -->
                        <el-descriptions-item label="Tujuan">{{checkData?.to_name}}</el-descriptions-item>
                    </el-descriptions>
                </div>
            </div>
            <div class="mb-5">
                <h1 class="text-lg font-bold">Lampiran</h1>
                <div class="flex gap-3 items-center" v-for="file in checkData?.files">
                    <p>{{file.filename}}</p>
                    <el-button @click="() => {}"><el-icon><Download /></el-icon> Download</el-button>
                </div>
            </div>
            <el-descriptions title="Note">
                <el-descriptions-item label="">{{ `Tidak Ada Catatan` }}</el-descriptions-item>
            </el-descriptions>
        </el-card>
        <el-card>
            <h1 class="mb-4">Item Permintaan</h1>
            <el-table :data="checkData?.inventory_movement_item" style="width: 100%" border>
                <el-table-column prop="inventory.catalogue.name" label="Nama Item"  />
                <el-table-column prop="sn" label="Serial/Part Number" width="180" />
                <el-table-column prop="quantity" label="QTY" width="100" />
                <el-table-column prop="cost" label="Harga Beli" width="200" align="right">
                    <template #default="scope">
                        {{ currencyWithoutSymbol(scope.row.cost) }}
                    </template>
                </el-table-column>
                <el-table-column prop="inventory.unit_name" label="UOM" width="100" />
            </el-table>
        </el-card>
    </TrumsWrapper>
</template>

<script lang="tsx" setup>
    import { Download } from '@element-plus/icons-vue'
import type { InventoryMovement } from '~/types/inventory_movement';
    import type { BaseResponse } from '~/types/response';

    definePageMeta({
        middleware:['auth', 'app'],
        name: "Detail Check In/Out",
    })
    const router = useRouter();
    
    const goBack = () => router.back();

    const id = ref<string>((router.currentRoute.value.params.id as string) ?? '')
    const {data} = await useFetchApi<BaseResponse<InventoryMovement>>(`/inventory-movement-read/${id.value}`, 'movement', 'get', null);
    const checkData = (data as Ref<BaseResponse<InventoryMovement> | null>).value?.data;
    const formInline = reactive({
        user: '',
        region: '',
        date: '',
    })

    const onSubmit = () => {
        console.log('submit!')
    }

    const getStatusTagType = (status: string): 'success' | 'info' | 'danger' | 'warning' | 'primary' => {
        switch (status) {
            case 'draft': return 'info'
            case 'waiting': return 'warning'
            case 'delivery': return 'primary'
            case 'ready': return 'primary'
            case 'done': return 'success'
            default: return 'primary'
        }
    }

    const formatStatus = (status: string) => {
        switch (status) {
            case 'draft':
                return 'DRAFT';
            case 'waiting':
                return 'WAITING';
            case 'delivery':
                return 'ON DELIVERY';
            case 'ready':
                return 'READY';
            case 'done':
                return 'DONE';
            default:
                return status;
            
        }
    }

    onMounted(() => {
        if(data.value?.data){
            console.log(data.value?.data);
        }
    })

</script>