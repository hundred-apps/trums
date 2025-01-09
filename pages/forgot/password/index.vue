<script lang="ts" setup>
definePageMeta({
  layout: "login",
});
const { t } = useI18n();
</script>
<template>
  <TrumsWrapper class="content-center flex items-center justify-center">
    <div
      class="w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700 bg-opacity-60 dark:bg-opacity-50"
    >
      <form class="space-y-3" action="#">
        <div>
          <label
            for="email"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >{{ $t("form.label.email") }}</label
          >
          <input
            type="email"
            name="email"
            id="email"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-300 focus:border-primary-300 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
            :placeholder="t('form.placeholder.email')"
            required
          />
        </div>
        <div class="flex justify-center">
          <TrumsButtons
            type="submit"
            to="forgot-notification"
            class="w-full text-white bg-primary-500 hover:bg-primary-600 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-500 dark:hover:bg-primary-600 dark:focus:ring-primary-600"
          >
            {{ $t("buttons.send") }}
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
