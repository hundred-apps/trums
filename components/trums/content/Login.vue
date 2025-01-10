<template>
  <div
    class="flex w-full h-screen lg:px-10 md:px-6 sm:px-2"
    :style="{ 'min-height': 'var(--layout-page-content-min-height)' }"
  >
    <slot />
  </div>
</template>
