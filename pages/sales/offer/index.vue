<template>
  <TrumsWrapper>
    <el-tabs type="border-card" v-model="activeName">
        <el-tab-pane label="Dari Vendor" name="vendor"><from-vendor/></el-tab-pane>
        <el-tab-pane label="Ke Customer" name="customer"><toCustomer/></el-tab-pane>
    </el-tabs>
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
    import { TrumsWrapper } from '#components';
    import fromVendor from './fromVendor.vue';
    import toCustomer from './toCustomer.vue';
    definePageMeta({
        middleware: ["auth", "check-access"],
        requiredPermission: "pricetag-read",
        name: "Daftar Penawaran",
    });

    const activeName = ref('vendor')

</script>