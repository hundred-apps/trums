<template>
  <div
    :class="`flex-1 py-2 ${
      isMobile ? '' : 'px-4'
    } w-full mx-auto overflow-y-scroll`"
  >
    <slot />
  </div>
</template>

<script lang="tsx" setup>
const { isMobile } = useDevice();
</script>
