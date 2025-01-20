<script lang="ts" setup>
import { ref, onMounted } from 'vue'

// Use SSR-safe IDs for Headless UI
provideHeadlessUseId(() => useId());

const theme = ref('')

const mode = useCookie('color-mode')

console.log(mode);

// onMounted(() => {
//   const savedTheme = localStorage.getItem('theme')
  // if (savedTheme) {
  //   theme.value = savedTheme
  //   document.documentElement.classList.toggle('dark', savedTheme === 'dark')
  // } else {
  //   const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  //   theme.value = prefersDark ? 'dark' : 'light'
  //   document.documentElement.classList.toggle('dark', prefersDark)
  // }
  
// })

</script>


<template>
  <Body
    class="antialiased duration-300 transition-colors text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-950"
  >
    <NuxtLayout>
      <NuxtLoadingIndicator />
      <NuxtPage />
    </NuxtLayout>
  </Body>
</template>
