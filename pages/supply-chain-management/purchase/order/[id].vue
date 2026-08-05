<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3"> Detail Purchase Order </span>
      </template>
    </el-page-header>

    <PurchaseOrderDetailSCM :mode="'edit'" :order_id="purchaseOrderId" />
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import PurchaseOrderDetailSCM from "./components/PurchaseOrderDetailSCM.vue";

const router = useRouter();
const route = useRoute();
const purchaseOrderId = ref<string>(route.params.id as string);

const goBack = () => router.back();
</script>
