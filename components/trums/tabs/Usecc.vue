<script setup>
import { ref, onMounted } from "vue";
const dataTab = ref([]);

const fetchData = async () => {
  const json = await import("@/assets/data/tabsContent.json");
  dataTab.value = json.dataTabUsecc;
  activeTab.value = dataTab.value[0]?.id || null;
};

onMounted(fetchData);

const activeTab = ref(null);

function openTab(tabId) {
  activeTab.value = tabId;
}
</script>

<template>
  <div class="tabs">
    <div class="flex justify-between items-end w-full">
      <button
        v-for="tab in dataTab"
        :key="tab.id"
        class="transition-all w-full flex justify-center items-center py-4 max-sm:py-2 px-4 -mb-px border-b-0 shadow-up dark:shadow-primaryUp rounded-t-xl text-blue-500"
        :class="{
          'font-semibold': activeTab === tab.id,
          'bg-blue-100 dark:bg-black dark:text-white': activeTab !== tab.id,
          'mx-4': tab.id === 'tab2',
        }"
        @click="openTab(tab.id)"
      >
        <div class="flex flex-row gap-2 align-middle items-center">
          <Icon
            :name="tab.button.icon"
            class="transition-all lg:text-[34px] md:text-[26px] sm:text-[18px] max-sm:text-[14px]"
          />
          <p
            class="transition-all lg:text-lg md:text-md sm:text-sm max-sm:text-[9px]"
          >
            {{ $t(`tabs.usecc.${tab.button.label}.button`) }}
          </p>
        </div>
      </button>
    </div>
    <div
      v-for="tab in dataTab"
      :key="tab.id"
      class="shadow-down dark:shadow-primaryDown w-full py-2 px-4 border-t-0 rounded-b-xl"
      :class="{ hidden: activeTab !== tab.id }"
    >
      <div
        id="header"
        class="flex flex-col justify-center align-middle items-center py-4"
      >
        <p
          class="transition-all lg:text-3xl md:text-xl text-center text-md font-semibold"
        >
          {{ tab.contents.header.title }}
        </p>
        <p
          class="transition-all text-gray-500 lg:text-md md:text-sm text-xs px-10 lg:px-0 text-center"
        >
          {{ tab.contents.header.subtitle }}
        </p>
      </div>

      <div
        v-for="(bodyItem, index) in tab.contents.body"
        :key="index"
        id="body"
      >
        <h1>{{ bodyItem.title }}</h1>
        <p>{{ bodyItem.text }}</p>
      </div>

      <div id="footer">
        <h1>{{ tab.contents.footer.title }}</h1>
        <h4>{{ tab.contents.footer.subtitle }}</h4>
      </div>

      <div class="flex justify-center lg:gap-3 md:gap-2 sm:gap-1 py-3">
        <button
          v-for="innerTab in dataTab"
          :key="innerTab.id"
          class="transition-all items-center py-2 max-sm:py-2 px-4 -mb-px rounded-md text-blue-700"
          :class="{
            'font-semibold bg-blue-100': activeTab === innerTab.id,
            'bg-gray-50 dark:bg-black dark:shadow-primaryUp':
              activeTab !== innerTab.id,
            'mx-4': innerTab.id === 'tab2',
          }"
          @click="openTab(innerTab.id)"
        >
          <div class="flex flex-row gap-2 align-middle items-center">
            <Icon
              :name="innerTab.button.icon"
              class="transition-all lg:text-[26px] md:text-[18px] sm:text-[14px] max-sm:text-[12px]"
            />
            <p
              class="transition-all lg:text-md md:text-sm sm:text-xs max-sm:text-[9px]"
            >
              {{ $t(`tabs.usecc.${innerTab.button.label}.button`) }}
            </p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
