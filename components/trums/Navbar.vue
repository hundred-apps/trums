<script lang="ts" setup>
import { useFlowbite } from "~/composables/useFlowbite";

const localePath = useLocalePath();
const $screen = useScreen();
const showDrawer = ref(false);
const route = useRoute();

const availableOs = [
  {
    key: "ios",
    text: "iOS",
    to: "https://www.apple.com/ios/app-store/", // URL untuk navigasi eksternal
    icon: "ri:apple-fill",
  },
  {
    key: "android",
    text: "Android",
    to: "https://play.google.com/store/apps", // URL untuk navigasi eksternal
    icon: "uiw:android",
  },
];
onMounted(async () => {
  useFlowbite(() => {
    initFlowbite();
  });
});
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
  <header
    class="flex fixed backdrop-filter backdrop-blur-md top-0 z-40 w-full flex-none transition-colors duration-300 lg:z-50 border-b border-gray-950/10 dark:border-gray-50/[0.2] bg-white/[0.5] dark:bg-gray-950/[0.5] lg:px-10 md:px-6"
  >
    <div
      class="flex-1 flex items-center justify-between w-screen mx-auto px-4"
      v-if="$screen.higherThan('lg', $screen.current.value)"
    >
      <div class="text-center w-full flex gap-2 items-center">
        <TrumsButtons
          type="primary"
          size="sm"
          data-drawer-target="drawer-navigation"
          data-drawer-show="drawer-navigation"
          aria-controls="drawer-navigation"
        >
          <Icon name="material-symbols:lists" size="20"></Icon>
        </TrumsButtons>

        <NuxtLink
          :to="localePath('/')"
          class="font-bold text-xl flex gap-2 items-center"
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
          <span class="dark:text-white text-black">Trums</span>
        </NuxtLink>
      </div>
      <div
        id="drawer-navigation"
        class="fixed top-0 left-0 z-40 w-64 h-screen p-4 overflow-y-auto transition-transform -translate-x-full bg-white dark:bg-gray-800"
        tabindex="-1"
        aria-labelledby="drawer-navigation-label"
      >
        <NuxtLink
          :to="localePath('/')"
          class="font-bold text-xl flex gap-2 items-center"
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
          <span class="dark:text-white text-black">Trums</span>
        </NuxtLink>
        <button
          type="button"
          data-drawer-hide="drawer-navigation"
          aria-controls="drawer-navigation"
          class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 absolute top-2.5 end-2.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
        >
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <span class="sr-only">Close menu</span>
        </button>
        <div class="py-4 overflow-y-auto">
          <ul class="space-y-2 font-medium">
            <li>
              <TrumsLink
                :to="localePath('about')"
                class="flex gap-2 items-center"
              >
                <Icon name="ix:about"></Icon> {{ $t("menu.about") }}</TrumsLink
              >
            </li>
            <li>
              <TrumsLink :to="localePath('feature')">{{
                $t("menu.feature")
              }}</TrumsLink>
            </li>
          </ul>
        </div>
      </div>
      <div class="flex gap-4 w-full justify-end">
        <TrumsSwitcherTheme />
        <TrumsSwitcherLang />
        <TrumsButtons :to="localePath('login')" size="sm" type="danger">{{
          $t("buttons.logout")
        }}</TrumsButtons>
      </div>
    </div>
    <div
      class="flex-1 flex items-center justify-between w-screen mx-auto px-4"
      v-else
    >
      <NuxtLink
        :to="localePath('/')"
        class="font-bold text-xl text-primary-500 flex gap-2 items-center"
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
        <span class="capitalize">Trums</span>
      </NuxtLink>
      <div class="pl-4 flex space-x-3 text-xl">
        <TrumsLink
          class="text-gray-600 dark:text-white hover:text-primary-500"
          @click.prevent="() => (showDrawer = !showDrawer)"
        >
          <Icon name="heroicons:bars-3-bottom-right-20-solid" />
        </TrumsLink>
      </div>
    </div>
    <TrumsSheet
      v-if="!$screen.higherThan('lg', $screen.current.value) && showDrawer"
      @close="() => (showDrawer = false)"
    >
      <TrumsSheetGroup>
        <TrumsSheetHeader>
          <TrumsSheetHeaderTitle text="Menu" />
        </TrumsSheetHeader>
        <!-- dynamic menus -->
        <TrumsSheetItem>
          <div class="flex flex-col text-md items-start gap-2">
            <TrumsLink :to="localePath('about')">{{
              $t("menu.about")
            }}</TrumsLink>
            <TrumsLink :to="localePath('feature')">{{
              $t("menu.feature")
            }}</TrumsLink>
          </div>
        </TrumsSheetItem>
        <TrumsSheetHeader>
          <TrumsSheetHeaderTitle text="Download" />
        </TrumsSheetHeader>
        <TrumsSheetItem
          class="flex flex-row justify-between gap-3 text-sm items-start"
        >
          <a
            v-for="os in availableOs"
            :key="os.key"
            :href="os.to"
            target="_blank"
            rel="noopener noreferrer"
            class="w-full py-1 px-2 flex items-center gap-1 border border-gray-600 justify-center rounded-sm"
          >
            <span class="text-sm items-center flex">
              <Icon :name="os.icon" />
            </span>
            {{ os.text }}
          </a>
        </TrumsSheetItem>
        <TrumsSheetItem class="flex flex-col">
          <div class="flex gap-3 justify-between pb-2">
            <div class="w-full">
              <div class="mt-2 mb-2 text-sm font-bold capitalize">
                Change Theme
              </div>
              <TrumsSwitcherTheme type="select-box" />
            </div>
            <div class="w-full">
              <div class="mt-2 mb-2 text-sm font-bold capitalize">
                Change Language
              </div>
              <TrumsSwitcherLang type="select-box" />
            </div>
          </div>
        </TrumsSheetItem>
      </TrumsSheetGroup>
    </TrumsSheet>
  </header>
</template>
