<template>
  <div class="common-layout">
    <HeaderFeature />
    <TrumsContentDefault>
      <TrumsWrapper>
        <slot />
      </TrumsWrapper>
    </TrumsContentDefault>
  </div>
</template>

<script lang="tsx" setup>
import HeaderFeature from "~/components/trums/HeaderFeature.vue";
</script>
