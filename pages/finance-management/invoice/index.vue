<template>
  <TrumsWrapper>
    <InvoiceTable type="finance" />
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import InvoiceTable from "./components/InvoiceTable.vue";

onMounted(() => {
  // fetchData();
});
</script>
