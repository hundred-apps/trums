<template>
  <div class="common-layout">
    <HeaderFeature />
    <TrumsContentDefault>
      <slot />
    </TrumsContentDefault>
  </div>
</template>

<script lang="tsx" setup>
import HeaderFeature from "~/components/trums/HeaderFeature.vue";
</script>
