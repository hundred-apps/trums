<script lang="ts" setup>
definePageMeta({
    middleware: ["auth", "app"],
});

import { ref, onMounted, type FunctionalComponent } from 'vue';

</script>
<template>
  <TrumsWrapper>
    <div>Ini adalah delivery</div>
  </TrumsWrapper>
</template>
