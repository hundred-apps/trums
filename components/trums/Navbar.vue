<script lang="ts" setup>
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
      <NuxtLink
        :to="localePath('/')"
        class="font-bold w-full text-xl text-primary-500 flex gap-2 items-center"
      >
        <img src="/images/logo/logo.png" alt="logo Trums" class="w-9" />
        <span class="capitalize">Trums</span>
      </NuxtLink>
      <div class="flex gap-5 w-full justify-center">
        <TrumsLink :to="localePath('about')">{{ $t("menu.about") }}</TrumsLink>
        <TrumsLink :to="localePath('feature')">{{
          $t("menu.feature")
        }}</TrumsLink>
      </div>
      <div class="flex gap-4 w-full justify-end">
        <TrumsSwitcherTheme />
        <TrumsSwitcherLang />
        <TrumsButtons size="sm">{{ $t("buttons.getstarted") }}</TrumsButtons>
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
        <img src="/images/logo/logo.png" alt="logo Trums" class="w-9" />
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
