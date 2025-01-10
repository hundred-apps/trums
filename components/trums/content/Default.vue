<template>
  <div
    class="flex w-full h-screen pt-[64px] pb-[-52px] lg:px-2 md:px-1 sm:px-1"
    :style="{ 'min-height': 'var(--layout-page-content-min-height)' }"
  >
    <slot />
  </div>
</template>
