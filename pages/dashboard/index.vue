<script lang="ts" setup>
import { onMounted } from "vue";
onMounted(() => {
  const user = useCookie("userdata");
  console.log(user.value);
});
</script>
<template>
  <TrumsWrapper> </TrumsWrapper>
</template>
