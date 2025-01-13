<script lang="ts" setup>
const props = defineProps({
  text: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "",
  },
  price: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <div
    class="w-full max-w-sm flex flex-col h-fit gap-4 pb-4 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
  >
    <div id="controls-carousel" class="relative w-full" data-carousel="static">
      <div class="relative h-56 overflow-hidden rounded-lg md:h-96">
        <div class="hidden duration-700 ease-in-out" data-carousel-item>
          <img
            class="rounded-t-lg h-[150px]"
            :src="`/images/logo/${image}`"
            alt="product image"
          />
        </div>
      </div>
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

    <div class="flex flex-col gap-3 px-4">
      <div class="flex flex-col gap-1">
        <span
          class="bg-blue-100 w-fit text-blue-800 text-xs font-semibold px-1.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800"
          >{{ type }}</span
        >
        <h5
          class="text-md font-semibold tracking-tight text-gray-900 dark:text-white truncate"
        >
          {{ text }}
        </h5>
      </div>

      <div class="flex items-center justify-between">
        <span class="text-xl font-bold text-gray-900 dark:text-white">{{
          price
        }}</span>
      </div>
    </div>
  </div>
</template>
