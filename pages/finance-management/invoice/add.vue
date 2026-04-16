<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3"> New Invoice </span>
      </template>
    </el-page-header>

    <AddInvoice />
  </TrumsWrapper>
</template>

<script lang="ts" setup>
import AddInvoice from "./components/AddInvoice.vue";

const router = useRouter();
const goBack = () => router.back();
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
:deep(.el-input-number) {
  width: 100% !important;
}
</style>
