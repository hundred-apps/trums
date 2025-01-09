<script lang="ts" setup>
const { t } = useI18n();
</script>

<style scoped>
.router-link-active {
  @apply text-primary-500;
}
.router-link-active:hover {
  @apply text-primary-600;
}
</style>

<template>
  <footer
    class="flex border-t border-gray-900/10 dark:border-gray-50/[0.2] lg:px-10 md:px-4 w-screen"
  >
    <div
      class="flex-1 justify-between max-w-screen-2xl mx-auto px-4 flex flex-col-reverse gap-1 md:flex-row py-2 space-y-2 md:space-y-0 items-center text-xs text-center md:text-left text-gray-400"
    >
      <div>
        Copyright ©
        {{ new Date().getFullYear() }}
        {{ "Togu Inovasi Teknologi" }}. All rights reserved.
      </div>
      <div class="flex gap-3">
        <TrumsLink to="about">
          <span class="text-gray-700 dark:text-gray-300">{{}}</span>
        </TrumsLink>
        <TrumsLink to="about">
          <span class="text-gray-700 dark:text-gray-300">Privacy Policy</span>
        </TrumsLink>
        <TrumsLink to="about">
          <span class="text-gray-700 dark:text-gray-300">Terms Of Use</span>
        </TrumsLink>
      </div>
    </div>
  </footer>
</template>
