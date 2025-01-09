<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useApi } from "~/composables/useApi";
import { useFlowbite } from "~/composables/useFlowbite";
import { initModals } from "flowbite";
import Swal from "sweetalert2";

// definePageMeta({
//   middleware: ["auth"],
// });

interface User {
  id: number;
  name: string;
  created_at?: string;
}

const posts = ref<User[]>([]);
const form = ref<User>({ id: 0, name: "" });
const isEditMode = ref(false);
const showModal = ref(false);

const api = useApi();

const fetchData = async () => {
  try {
    const response = await api.get("/user-read");
    posts.value = response.data.data;
  } catch (error) {
    console.error("Gagal memuat postingan:", error);
  }
};

// Fungsi membuka modal
const openModal = (user?: User) => {
  form.value = { id: 0, name: "" };
  isEditMode.value = false;

  if (user) {
    form.value = { ...user };
    isEditMode.value = true;
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveData = async () => {
  try {
    if (isEditMode.value) {
      await api.put(`user-update/${form.value.id}`, form.value);
      Swal.fire("Updated!", "The post has been updated.", "success");
    } else {
      // Add data
      const newUser = { name: form.value.name };
      const response = await api.post("user-create", newUser);
      Swal.fire("Added!", "The post has been added.", "success");
    }
    closeModal();
    await fetchData();
  } catch (error) {
    console.error("Gagal menyimpan data:", error);
    Swal.fire("Error", "Failed to save data.", "error");
  }
};

// Fungsi menghapus data
const deleteData = async (id: number) => {
  try {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      await api.delete(`user-delete/${id}`);
      Swal.fire("Deleted!", "The data has been deleted.", "success");
      await fetchData();
    }
  } catch (error) {
    console.error("Gagal menghapus data:", error);
    Swal.fire("Error", "Failed to delete data.", "error");
  }
};

onMounted(async () => {
  await fetchData();
  useFlowbite(() => {
    initModals();
  });
});
</script>

<template>
  <TrumsWrapper class="flex flex-col">
    <div class="container mx-auto p-4">
      <!-- Button to Open Modal -->
      <button
        @click="openModal()"
        data-modal-target="user-create"
        data-modal-toggle="user-create"
        class="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        type="button"
      >
        Add New User
      </button>

      <!-- Modal -->
      <div
        id="user-create"
        tabindex="-1"
        aria-hidden="true"
        class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
      >
        <div class="relative p-4 w-full max-w-md max-h-full">
          <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <div
              class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600"
            >
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ isEditMode ? "Edit User" : "Add User" }}
              </h3>
              <div class="flex gap-2 align-middle">
                <button
                  type="button"
                  class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  data-modal-toggle="user-create"
                >
                  <svg
                    class="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span class="sr-only">Close modal</span>
                </button>
              </div>
            </div>
            <!-- Modal body -->
            <form class="p-4 md:p-5" @submit.prevent="saveData">
              <div class="grid gap-4 mb-4 grid-cols-2">
                <div class="col-span-2">
                  <label
                    for="name"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >Name</label
                  >
                  <input
                    v-model="form.name"
                    type="text"
                    name="name"
                    id="name"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder="Name"
                    required
                  />
                </div>
              </div>
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 bg-gray-300 text-gray-700 rounded mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                <svg
                  class="me-1 -ms-1 w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                Add
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Table -->
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
                {{ post.id }}
              </th>
              <td class="px-6 py-4">{{ post.name }}</td>
              <td class="px-6 py-4">{{ post.created_at }}</td>
              <td class="px-6 py-4">
                <button
                  @click="openModal(post)"
                  class="px-4 py-2 bg-yellow-500 text-white rounded mr-2"
                >
                  Edit
                </button>
                <button
                  @click="deleteData(post.id)"
                  class="px-4 py-2 bg-red-500 text-white rounded"
                >
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
