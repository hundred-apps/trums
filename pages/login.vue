<script lang="ts" setup>
definePageMeta({
  layout: "login",
});
const { t } = useI18n();
const localePath = useLocalePath();
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
          {{ t("title.signIn") }}
        </h5>
        <div>
          <label
            for="email"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >{{ t("form.label.email") }}</label
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
        <div>
          <label
            for="password"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >{{ t("form.label.password") }}</label
          >
          <input
            type="password"
            name="password"
            id="password"
            :placeholder="t('form.placeholder.password')"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-300 focus:border-primary-300 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
            autocomplete="off"
            required
          />
        </div>
        <div class="flex items-start">
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input
                id="remember"
                type="checkbox"
                value=""
                class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-100 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-400 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 text-primary-500"
                required
              />
            </div>
            <label
              for="remember"
              class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >{{ t("form.label.rememberMe") }}</label
            >
          </div>
          <TrumsLink
            :to="localePath('/forgot')"
            class="ms-auto text-sm text-primary-500 hover:underline dark:text-primary-500"
            >{{ t("form.label.forgotPassword") }}</TrumsLink
          >
        </div>
        <div class="flex justify-center">
          <TrumsButtons
            type="submit"
            :to="localePath('/')"
            class="w-full text-white bg-primary-500 hover:bg-primary-600 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-500 dark:hover:bg-primary-600 dark:focus:ring-primary-600"
          >
            {{ t("buttons.login") }}
          </TrumsButtons>
        </div>
        <div
          class="text-sm font-medium text-gray-500 dark:text-gray-300 text-center"
        >
          {{ t("form.label.notRegistered") }}
          <a
            href="#"
            class="text-primary-500 hover:underline dark:text-primary-500"
            >{{ t("form.label.createAccount") }}</a
          >
        </div>
        <div class="flex gap-2 justify-center items-center">
          <TrumsSwitcherTheme />
          <TrumsSwitcherLang />
        </div>
      </form>
    </div>
  </TrumsWrapper>
</template>
