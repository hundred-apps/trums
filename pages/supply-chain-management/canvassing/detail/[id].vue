<template>
    <el-page-header @back="goBack">
        <template #content>
            <span class="text-large font-600 mr-3"> Canvassing - {{ id }} </span>
        </template>
    </el-page-header>
    <el-card class="my-3">
        <div class="flex">
            <div class="flex flex-1 shadow-none dark:border-slate-500" style="border: 1px solid;">
                <div class="flex flex-1 justify-between">
                    <p>Nomor Canvassing</p>
                    <p>{{id}}</p>
                </div>
            </div>
            <div class="flex flex-1 shadow-none dark:border-slate-500" style="border: 1px solid;">
                <div class="flex flex-1 justify-between">
                    <p>Nomor Canvassing</p>
                    <p>{{id}}</p>
                </div>
            </div>
        </div>
    </el-card>
</template>

<script lang="tsx" setup>
    import { ref, onMounted } from 'vue';

    definePageMeta({
        middleware:['auth', 'app'],
        name: "Canvassing",
    })
    const router = useRouter();
    
    const goBack = () => router.back();
    const id = ref<string>((router.currentRoute.value.params.id as string) ?? '')

    onMounted(() => {
        
    })

</script>