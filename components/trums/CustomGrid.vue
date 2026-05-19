<template>
  <div :class="`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-4 gap-4'}`">
    <slot />
  </div>
</template>
<script lang="tsx" setup>
const { isMobile } = useDevice();
</script>
