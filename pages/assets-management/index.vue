<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useApi } from "~/composables/useApi";

const showTable = ref(true);

const toggleView = () => {
  showTable.value = !showTable.value;
};

interface Catalogue {
  id: number;
  name: string;
  created_at?: string;
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
});

console.log("assets :", assets);
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
            ><Icon name="mdi:plus" size="20" /> Asset</TrumsButtons
          >
        </div>
        <div class="flex gap-4 w-full justify-end items-center">
          <TrumsButtons
            type="secondary"
            padding="sm"
            size="sm"
            @click="toggleView"
          >
            {{ showTable ? "Grid" : "Tabel" }}
          </TrumsButtons>
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
          :image="asset.image"
          :price="asset.price"
          :text="asset.name"
          :type="asset.type"
        >
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
              <th
                scope="row"
                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
              >
                <img
                  :src="`/images/logo/${asset.image}`"
                  :alt="asset.image"
                  width="50"
                />
              </th>
              <td class="px-6 py-4">{{ asset.name }}</td>
              <td class="px-6 py-4">{{ asset.type }}</td>
              <td class="px-6 py-4">{{ asset.price }}</td>
              <td class="px-6 py-4">
                <button class="px-4 py-2 bg-yellow-500 text-white rounded mr-2">
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
  </TrumsWrapper>
</template>
