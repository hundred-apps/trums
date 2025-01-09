<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useApi } from "~/composables/useApi";
import { useFlowbite } from "~/composables/useFlowbite";

definePageMeta({
  name: "Setting",
});

interface User {
  id: number;
  name: string;
  created_at?: string;
}

const posts = ref<User[]>([]);
const form = ref<User>({ id: 0, name: "" });

const api = useApi();

const fetchData = async () => {
  try {
    const response = await api.get(`/user-read`);
    posts.value = response.data.data;
  } catch (error) {
    console.error("Gagal memuat postingan:", error);
  }
};

onMounted(async () => {
  await fetchData();
  useFlowbite(() => {});
});
</script>
<template>
  <TrumsWrapper>
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table
        class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
      >
        <thead
          class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
        >
          <tr>
            <th scope="col" class="px-6 py-3">Id</th>
            <th scope="col" class="px-6 py-3">Name</th>
            <th scope="col" class="px-6 py-3">Created At</th>
            <th scope="col" class="px-6 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr
            class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
            v-for="post in posts"
            :key="post.id"
          >
            <th
              scope="row"
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              <TrumsLink to="setting/detail/${post.id}">
                {{ post.id }}
              </TrumsLink>
            </th>
            <td class="px-6 py-4">{{ post.name }}</td>
            <td class="px-6 py-4">{{ post.created_at }}</td>
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
  </TrumsWrapper>
</template>
