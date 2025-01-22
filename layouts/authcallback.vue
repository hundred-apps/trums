<script lang="ts" setup>
const route = useRequestURL();
const base_url = route.origin;
</script>

<template>
  <div>
    <nav
      class="flex fixed backdrop-filter backdrop-blur-md top-0 z-40 w-full flex-none transition-colors duration-300 lg:z-50 border-b border-gray-950/10 dark:border-gray-50/[0.2] bg-white/[0.5] dark:bg-gray-950/[0.5] lg:px-2 py-2 md:px-1 h-[64px] max-h-[64px]"
    >
      <div
        class="flex-1 flex items-center justify-between w-screen mx-auto px-4"
      >
        <NuxtLink
          :to="base_url"
          class="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <img
            v-if="$colorMode.value === 'dark'"
            src="/images/logo/logo-white.png"
            alt="logo Trums"
            class="w-9"
          />
          <img
            v-if="$colorMode.value === 'light'"
            src="/images/logo/logo-black.png"
            alt="logo Trums"
            class="w-9"
          />
          <span
            class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white"
            >Trums</span
          >
        </NuxtLink>
        <div
          class="flex gap-3 md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse"
        >
          <TrumsSwitcherTheme />
          <TrumsSwitcherLang />
          <TrumsButtons
            @click="$oidc.logout()"
            type="button"
            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >Keluar</TrumsButtons
          >
        </div>
      </div>
    </nav>
    <slot />
  </div>
</template>
