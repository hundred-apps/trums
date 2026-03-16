<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import type { Team } from "~/types/maintenance";

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "maintenance-team-write",
  name: "Add Maintenance Team",
});

const route = useRoute();
const router = useRouter();
const goBack = () => router.back();
const loading = ref(false);

const form = ref<Team>({
  unique_id: "",
  name: "",
  note: "",
  maintenance_team_member: [],
  id: "",
  version: 0,
});

const isEdit = computed(() => !!route.query.unique_id);

const fetchDetail = async () => {
  if (!isEdit.value) return;

  const { data } = await useFetchApi<any>(
    `/maintenance-team-detail`,
    "maintenance-team-detail",
    "post",
    {
      unique_id: route.query.unique_id,
    }
  );

  if (data.value) {
    form.value = data.value;
  }
};

const submit = async () => {
  loading.value = true;

  try {
    const url = isEdit.value
      ? "/maintenance-team-update"
      : "/maintenance-team-create";

    const response = await useFetchApi<any>(url, url, "post", form.value);

    if (response.status.value === "success") {
      ElMessage.success("Data berhasil disimpan");
      router.push("/maintenance-team");
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDetail();
});
</script>

<template>
  <TrumsWrapper>
    <el-card>
      <el-form label-width="180px">
        <el-form-item label="Team Name">
          <el-input v-model="form.name" placeholder="Nama Team" />
        </el-form-item>

        <el-form-item label="Note">
          <el-input v-model="form.note" type="textarea" placeholder="Catatan" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="submit">
            Save
          </el-button>

          <el-button @click="goBack">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </TrumsWrapper>
</template>
