<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useApi } from "~/composables/useApi";

definePageMeta({
  name: "Detail User",
});

interface User {
  id: number;
  name: string;
  created_at?: string;
}

const route = useRoute();
const id = route.params.id;

const users = ref<User[]>([]);

const api = useApi();

const fetchData = async () => {
  try {
    const response = await api.get(`/user-read/${id}`);
    users.value = response.data.data;
  } catch (error) {
    console.error("Gagal memuat postingan:", error);
  }
};

onMounted(async () => {
  await fetchData();
});
console.log(users);
</script>
<template>
  <TrumsWrapper>
    <div>
      <ul>
        <li>
          {{ users.name }}
        </li>
      </ul>
    </div>
  </TrumsWrapper>
</template>
