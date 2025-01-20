<script lang="ts" setup>
definePageMeta({
  layout: "login",
});
const { t } = useI18n();
const oidc = useOidc();
const { $oidc } = useNuxtApp();
console.log("(composable) isLoggedIn:", oidc.isLoggedIn);
console.log("(injected) isLoggedIn:", $oidc.isLoggedIn);
</script>
<template>
  <TrumsWrapper class="content-center flex items-center justify-center">
    <div
      class="w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700 bg-opacity-60 dark:bg-opacity-50"
    >
      <form class="space-y-3" action="#">
        <div class="w-full flex items-center justify-center">
          <img
            v-if="$colorMode.value === 'dark'"
            src="/images/logo/logo-white.png"
            alt="Logo Trums"
            width="100"
          />
          <img
            v-if="$colorMode.value === 'light'"
            src="/images/logo/logo-black.png"
            alt="Logo Trums"
            width="100"
          />
        </div>
        <h5
          class="text-xl font-medium text-center text-gray-900 dark:text-white"
        >
          {{ $t("title.welcome") }} <Twemoji emoji="1F44B" />
        </h5>
        <div class="flex justify-center">
          <TrumsButtons
            to="/auth/callback"
            class="w-full text-white bg-primary-500 hover:bg-primary-600 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-500 dark:hover:bg-primary-600 dark:focus:ring-primary-600"
          >
            {{ $t("buttons.getstarted") }}
          </TrumsButtons>
        </div>
        <div class="flex gap-2 justify-center items-center">
          <TrumsSwitcherTheme />
          <TrumsSwitcherLang />
        </div>
      </form>
    </div>
  </TrumsWrapper>
</template>
