<script lang="tsx" setup>
import { onMounted } from "vue";
import hutangPiutang from "./hutangPiutang.vue";
import umurHutang from "./umurHutang.vue";
import pengeluaran from "./pengeluaran.vue";
definePageMeta({
  middleware: ["auth", "app"],
});




onMounted(() => {
  const user = useCookie("userdata");
  console.log(user.value);
});
</script>
<template>
  <TrumsWrapper> 
    <h3 class="text-lg font-semibold">Hutang & Piutang</h3>
   
    <ElCard class="mt-2">
      <hutangPiutang />
    </ElCard>
    <h3 class="text-lg font-semibold mt-6">Umur Hutang & Piutang</h3>
    
    <ElCard class="mt-2">
      
      <umurHutang/>
    </ElCard>
    <h3 class="text-lg font-semibold mt-6">Pengeluaran</h3>
    
    <ElCard class="mt-2">
      <pengeluaran/>
    </ElCard>
    
    
  </TrumsWrapper>
</template>
