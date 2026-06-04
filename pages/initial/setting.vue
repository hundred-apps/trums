<template>
  <NuxtLayout :name="layout">
    <div class="w-full h-screen flex items-center justify-center">
      <SettingComponen v-on:save-setting="saveSetting" />
    </div>
  </NuxtLayout>
</template>

<script lang="tsx" setup>
import SettingComponen from "~/components/trums/SettingComponen.vue";
definePageMeta({
  layout: false,
});

const saveSetting = () => {
  window.location.href = "/dashboard";
};

const layout = "authcallback";
</script>
