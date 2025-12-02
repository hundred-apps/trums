<template>
 <NuxtLayout :name="layout">
    <div class="w-full h-screen flex items-center justify-center">
        <div class="w-1/2 mt-48">
            <SettingComponen v-on:save-setting="saveSetting"/>
        </div>
    </div>
 </NuxtLayout>
</template>

<script lang="tsx" setup>
import SettingComponen from '~/components/trums/SettingComponen.vue';
definePageMeta({
  layout: false,
});

const saveSetting = () => {
    window.location.href = '/dashboard';
}

const layout = "authcallback";
</script>