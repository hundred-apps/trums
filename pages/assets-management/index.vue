<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useApi } from "~/composables/useApi";
import { useRouter } from "vue-router";
import { initFlowbite } from "flowbite";

const router = useRouter();

const navigateToForm = (mode = "", id = null, unique_id = null) => {
  const path = id
    ? `/assets-management/form/${id}`
    : "/assets-management/form/new";
  router.push({ path, query: { mode, unique_id } });
};

const showTable = ref(true);

const toggleView = () => {
  showTable.value = !showTable.value;
};

interface Catalogue {
  id: number;
  unique_id?: string;
  unique_code?: string;
  name: string;
  filename: string;
  file_catalogues: [];
}
const assets = ref<Catalogue[]>([]);

const api = useApi();

const fetchData = async () => {
  try {
    const response = await api.get(`/catalogues-read`);
    assets.value = response.data.data;
  } catch (error) {
    console.error("Gagal memuat postingan:", error);
  }
};

onMounted(async () => {
  await fetchData();
  initFlowbite();
});
</script>
<template>
  <TrumsWrapper>
    <div class="flex flex-col gap-4">
      <div class="flex justify-between items-center w-full pb-4">
        <div class="flex gap-4 items-center">
          <h2 class="text-gray-700 dark:text-white text-4xl">Asset</h2>
          <TrumsButtons
            type="primary"
            padding="sm"
            size="sm"
            class="flex gap-1 items-center"
            @click="navigateToForm('insert')"
            ><Icon name="mdi:plus" size="20" /> Asset</TrumsButtons
          >
        </div>
        <div class="flex gap-4 w-full justify-end items-center">
          <TrumsButtons
            type="secondary"
            padding="sm"
            size="sm"
            data-tooltip-target="tooltip-show"
            data-tooltip-placement="left"
            @click="toggleView"
          >
            <Icon
              :name="
                showTable ? 'si:grid-view-fill' : 'material-symbols:data-table'
              "
              size="30"
            />
          </TrumsButtons>

          <div
            id="tooltip-show"
            role="tooltip"
            class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
          >
            Show {{ showTable ? "Grid" : "Table" }}
            <div class="tooltip-arrow" data-popper-arrow></div>
          </div>
        </div>
      </div>
      <div id="search-asset">
        <label for="table-search" class="sr-only">Search</label>
        <div class="relative mt-1">
          <div
            class="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none"
          >
            <svg
              class="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="text"
            id="table-search"
            class="block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search for items"
          />
        </div>
      </div>
      <div v-if="!showTable" class="grid grid-cols-6 gap-4 w-full h-full pb-4">
        <TrumsCardAsset
          v-for="asset in assets"
          :key="asset.id"
          :price="asset.price"
          :text="asset.name"
          :type="asset.type"
        >
          <div
            v-for="(image, index) in asset.file_catalogues"
            :class="[
              'duration-700 ease-in-out',
              { block: index === 0 },
              { hidden: index !== 0 },
            ]"
            :data-carousel-item="index === 0 ? 'active' : ''"
          >
            <img
              class="rounded-t-lg h-[150px]"
              :src="`http://192.168.1.228:9008/files/${image.filename}`"
              :alt="image.filename"
            />
          </div>
        </TrumsCardAsset>
      </div>
      <div v-else class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table
          class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
        >
          <thead
            class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
          >
            <tr>
              <th scope="col" class="px-6 py-3">Image</th>
              <th scope="col" class="px-6 py-3">Name</th>
              <th scope="col" class="px-6 py-3">Type</th>
              <th scope="col" class="px-6 py-3">Price</th>
              <th scope="col" class="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
              v-for="asset in assets"
              :key="asset.id"
            >
              <td
                scope="row"
                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
              >
                <div v-for="(image, index) in asset.file_catalogues">
                  <img
                    v-if="index === 0"
                    :src="`http://192.168.1.228:9008/files/${image.filename}`"
                    :alt="image.filename"
                    width="50"
                  />
                </div>
              </td>
              <td class="px-6 py-4">{{ asset.name }}</td>
              <td class="px-6 py-4">{{ asset.unique_code }}</td>
              <td class="px-6 py-4">{{ asset.price }}</td>
              <td class="px-6 py-4">
                <button
                  class="px-4 py-2 bg-yellow-500 text-white rounded mr-2"
                  @click="navigateToForm('update', asset.id, asset.unique_id)"
                >
                  Edit
                </button>
                <button class="px-4 py-2 bg-red-500 text-white rounded">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      id="indicators-carousel"
      class="relative w-full"
      data-carousel="static"
    >
      <!-- Carousel wrapper -->
      <div class="relative h-56 overflow-hidden rounded-lg md:h-96">
        <!-- Item 1 -->
        <div
          class="hidden duration-700 ease-in-out"
          data-carousel-item="active"
        >
          <img
            src="/public/favicon.ico"
            class="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
            alt="..."
          />
        </div>
      </div>
      <!-- Slider indicators -->
      <div
        class="absolute z-30 flex -translate-x-1/2 space-x-3 rtl:space-x-reverse bottom-5 left-1/2"
      >
        <div v-for="asset in assets">
          <button
            v-for="(button, index) in asset.file_catalogues"
            type="button"
            class="w-3 h-3 rounded-full"
            aria-current="true"
            :aria-label="`Slide ${index}`"
            :data-carousel-slide-to="index"
          ></button>
        </div>
      </div>
      <!-- Slider controls -->
      <button
        type="button"
        class="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
        data-carousel-prev
      >
        <span
          class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none"
        >
          <svg
            class="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 6 10"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 1 1 5l4 4"
            />
          </svg>
          <span class="sr-only">Previous</span>
        </span>
      </button>
      <button
        type="button"
        class="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
        data-carousel-next
      >
        <span
          class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none"
        >
          <svg
            class="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 6 10"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 9 4-4-4-4"
            />
          </svg>
          <span class="sr-only">Next</span>
        </span>
      </button>
    </div>
  </TrumsWrapper>
</template>
