<script lang="ts" setup>
import { ref, toRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

const { t } = useI18n();

const props = defineProps({
  type: {
    type: String,
    default: "dropdown-right-top",
  },
});

const currentStyle = toRef(props, "type");

const availableLang = [
  { key: "en", text: "en" },
  { key: "id", text: "id" },
];

const { locale, setLocaleCookie } = useI18n(); // Ambil locale dari i18n
const selectedLang = ref(locale.value);
// Inisialisasi dengan locale saat ini

// Ambil fungsi untuk mengganti locale
const switchLocalePath = useSwitchLocalePath();
const router = useRouter(); // Dapatkan instance router

// Update locale ketika selectedLang berubah
watch(selectedLang, (newLang) => {
  locale.value = newLang; // Mengatur locale baru
});

// Sinkronisasi selectedLang jika locale diubah
watch(locale, (newLocale) => {
  selectedLang.value = newLocale; // Mengatur locale baru
});
</script>

<template>
  <div class="flex items-center">
    <HeadlessListbox
      v-if="currentStyle === 'dropdown-right-top'"
      v-model="selectedLang"
      as="div"
      class="relative flex items-center"
    >
      <HeadlessListboxLabel class="sr-only">
        Select Language
      </HeadlessListboxLabel>
      <HeadlessListboxButton type="template">
        <TrumsLink class="dark:text-gray-400 text-gray-600">
          <span class="flex justify-center items-center text-xl">
            <Icon name="uil:language" />
          </span>
        </TrumsLink>
      </HeadlessListboxButton>
      <HeadlessListboxOptions
        class="p-1 absolute z-50 origin-top-right top-full right-0 outline-none bg-white rounded-lg ring-1 ring-gray-900/10 shadow-lg overflow-hidden w-36 py-1 text-sm text-gray-700 font-semibold dark:bg-gray-800 dark:ring-0 dark:highlight-white/5 dark:text-gray-300"
      >
        <HeadlessListboxOption
          v-for="lang in availableLang"
          :key="lang.key"
          :value="lang.key"
          :class="{
            'py-2 px-2 flex items-center cursor-pointer': true,
            'text-blue-500 bg-gray-100 dark:bg-gray-600/30':
              selectedLang === lang.key,
            'hover:bg-gray-50 dark:hover:bg-gray-700/30':
              selectedLang !== lang.key,
          }"
          @click="
            () => {
              setLocaleCookie(lang.key);
              router.push(switchLocalePath(lang.key));
            }
          "
        >
          {{ t(`languages.${lang.text}`) }}
        </HeadlessListboxOption>
      </HeadlessListboxOptions>
    </HeadlessListbox>

    <select
      v-if="currentStyle === 'select-box'"
      v-model="selectedLang"
      @change="() => router.push(switchLocalePath(selectedLang))"
      class="w-full px-2 pr-3 py-1 outline-none rounded border bg-transparent text-gray-700 dark:text-gray-300 border-gray-900/10 dark:border-gray-50/[0.2]"
    >
      <option
        v-for="lang in availableLang"
        :key="lang.key"
        :value="lang.key"
        @click.prevent.stop="setLocaleCookie(lang.key)"
      >
        {{ t(`languages.${lang.text}`) }}
      </option>
    </select>
    <el-dropdown
      placement="bottom"
      v-if="currentStyle === 'element'"
      v-model="selectedLang"
    >
      <TrumsLink class="dark:text-gray-400 text-gray-600">
        <span class="flex justify-center items-center text-xl">
          <Icon name="uil:language" />
        </span>
      </TrumsLink>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="lang in availableLang"
            :key="lang.key"
            :value="lang.key"
            :class="{
              'py-2 px-2 flex items-center cursor-pointer': true,
              'text-blue-500 bg-gray-100 dark:bg-gray-600/30':
                selectedLang === lang.key,
              'hover:bg-gray-50 dark:hover:bg-gray-700/30':
                selectedLang !== lang.key,
            }"
            @click="
              () => {
                setLocaleCookie(lang.key);
                router.push(switchLocalePath(lang.key));
                console.log('pushed to');
              }
            "
          >
            {{ t(`languages.${lang.text}`) }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>
