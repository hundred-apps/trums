<script lang="ts" setup>
const route = useRequestURL();
const base_url = route.origin;
</script>

<template>
    <div>
        <nav class="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
            <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <NuxtLink :to="base_url" class="flex items-center space-x-3 rtl:space-x-reverse">
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
                    <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Trums</span>
                </NuxtLink>
                <div class="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
                    <TrumsButtons @click="$oidc.logout()"  type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Keluar</TrumsButtons>
                </div>
                
            </div>
        </nav>
        <slot />
    </div>
</template>