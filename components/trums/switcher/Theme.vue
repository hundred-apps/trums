<script lang="ts" setup>
const { t } = useI18n();
const colorMode = useColorMode();
const props = defineProps({
  type: {
    type: String,
    default: "dropdown-right-top",
  },
});
const currentStyle = toRef(props, "type");

const availableThemes = [
  {
    key: "light",
    text: "light",
  },
  {
    key: "dark",
    text: "dark",
  },
  {
    key: "system",
    text: "system",
  },
];

const handleThemeChange = (theme: string) => {
  colorMode.preference = theme;
};
</script>

<template>
  <div class="flex items-center">
    <HeadlessListbox
      v-if="currentStyle === 'dropdown-right-top'"
      v-model="$colorMode.preference"
      as="div"
      class="relative flex items-center"
    >
      <HeadlessListboxLabel class="sr-only">Theme</HeadlessListboxLabel>
      <HeadlessListboxButton type="template">
        <TrumsLink class="dark:text-gray-400 text-gray-600 text-xl">
          <span
            class="transition-all flex justify-center items-center dark:hidden"
          >
            <Icon name="uil:sun" />
          </span>
          <span
            class="transition-all justify-center items-center hidden dark:flex"
          >
            <Icon name="uil:moon" />
          </span>
        </TrumsLink>
      </HeadlessListboxButton>
      <HeadlessListboxOptions
        class="p-1 absolute z-50 origin-top-right top-full right-0 outline-none bg-white rounded-lg ring-1 ring-gray-900/10 shadow-lg overflow-hidden w-36 py-1 text-sm text-gray-700 font-semibold dark:bg-gray-800 dark:ring-0 dark:highlight-white/5 dark:text-gray-300"
      >
        <HeadlessListboxOption
          v-for="theme in availableThemes"
          :key="theme.key"
          :value="theme.key"
          :class="{
            'py-2 px-2 flex items-center cursor-pointer': true,
            'text-blue-500 bg-gray-100 dark:bg-gray-600/30':
              $colorMode.preference === theme.key,
            'hover:bg-gray-50 dark:hover:bg-gray-700/30':
              $colorMode.preference !== theme.key,
          }"
        >
          <span class="text-sm mr-2 flex items-center">
            <Icon v-if="theme.key === 'light'" name="uil:sun" />
            <Icon v-else-if="theme.key === 'dark'" name="uil:moon" />
            <Icon v-else-if="theme.key === 'system'" name="uil:laptop" />
          </span>
          {{ t(`mode.${theme.text}`) }}
        </HeadlessListboxOption>
      </HeadlessListboxOptions>
    </HeadlessListbox>
    <select
      v-if="currentStyle === 'select-box'"
      v-model="$colorMode.preference"
      class="w-full px-2 pr-3 py-1 outline-none rounded border bg-transparent text-gray-700 dark:text-gray-300 border-gray-900/10 dark:border-gray-50/[0.2]"
    >
      <option
        v-for="theme in availableThemes"
        :key="theme.key"
        :value="theme.key"
      >
        {{ t(`mode.${theme.text}`) }}
      </option>
    </select>
    <el-dropdown
      placement="bottom"
      v-if="currentStyle === 'element'"
      v-model="$colorMode.preference"
    >
      <TrumsLink
        class="dark:text-gray-400 text-gray-600 text-xl el-dropdown-link"
      >
        <span
          class="transition-all flex justify-center items-center dark:hidden"
        >
          <Icon name="uil:sun" />
        </span>
        <span
          class="transition-all justify-center items-center hidden dark:flex"
        >
          <Icon name="uil:moon" />
        </span>
      </TrumsLink>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="theme in availableThemes"
            :key="theme.key"
            :value="theme.key"
            @click="handleThemeChange(theme.key)"
            :class="{
              'py-2 px-2 flex items-center cursor-pointer': true,
              'text-blue-500 bg-gray-100 dark:bg-gray-600/30':
                $colorMode.preference === theme.key,
              'hover:bg-gray-50 dark:hover:bg-gray-700/30':
                $colorMode.preference !== theme.key,
            }"
          >
            <span class="text-sm mr-2 flex items-center">
              <Icon v-if="theme.key === 'light'" name="uil:sun" />
              <Icon v-else-if="theme.key === 'dark'" name="uil:moon" />
              <Icon v-else-if="theme.key === 'system'" name="uil:laptop" />
            </span>
            {{ t(`mode.${theme.text}`) }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>
