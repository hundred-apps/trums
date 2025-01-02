<script lang="ts" setup>
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

<template>
  <div class="flex items-center">
    <HeadlessListbox as="div" class="relative flex items-center">
      <HeadlessListboxLabel class="sr-only">Download App</HeadlessListboxLabel>
      <HeadlessListboxButton type="template">
        <TrumsLink>
          <span class="flex justify-center items-center">
            {{ $t("menu.download") }}
          </span>
        </TrumsLink>
      </HeadlessListboxButton>
      <HeadlessListboxOptions
        class="p-1 absolute z-50 origin-top-right top-full right-0 outline-none bg-white rounded-lg ring-1 ring-gray-900/10 shadow-lg overflow-hidden w-36 py-1 text-sm text-gray-700 font-semibold dark:bg-gray-800 dark:ring-0 dark:highlight-white/5 dark:text-gray-300"
      >
        <a
          v-for="os in availableOs"
          :key="os.key"
          :href="os.to"
          target="_blank"
          rel="noopener noreferrer"
          class="py-2 px-2 flex items-center cursor-pointer hover:bg-gray-50 hover:text-primary-500 dark:hover:bg-gray-700/30"
        >
          <span class="text-sm mr-2 flex items-center">
            <Icon :name="os.icon" />
          </span>
          {{ os.text }}
        </a>
      </HeadlessListboxOptions>
    </HeadlessListbox>
  </div>
</template>
