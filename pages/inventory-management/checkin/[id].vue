<template>
    <el-page-header @back="goBack">
        <template #content>
            <span class="text-large font-600 mr-3"> Detail </span>
        </template>
    </el-page-header>
    <el-card class="my-3">
        <el-form :inline="true" :model="formInline" class="demo-form-inline">
            <el-form-item label="Approved by">
                <el-input v-model="formInline.user" placeholder="Approved by" clearable />
            </el-form-item>
            <el-form-item label="Activity zone">
                <el-select
                    v-model="formInline.region"
                    placeholder="Activity zone"
                    clearable
                >
                    <el-option label="Zone one" value="shanghai" />
                    <el-option label="Zone two" value="beijing" />
                </el-select>
            </el-form-item>
            <el-form-item label="Activity time">
                <el-date-picker
                    v-model="formInline.date"
                    type="date"
                    placeholder="Pick a date"
                    clearable
                />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onSubmit">Query</el-button>
            </el-form-item>
        </el-form>
    </el-card>
</template>

<script lang="tsx" setup>
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

    const formInline = reactive({
        user: '',
        region: '',
        date: '',
    })

    const onSubmit = () => {
        console.log('submit!')
    }
</script>