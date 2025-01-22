<template>
    <el-page-header @back="goBack">
        <template #content>
        <span class="text-large font-600 mr-3"> New Inventory </span>
        </template>
    </el-page-header>
    
</template>

<script lang="ts" setup>

    const goBack = () => $router.back();

</script>