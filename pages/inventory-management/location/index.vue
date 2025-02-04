<template>
  <TrumsWrapper>
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6"
        ><el-input v-model="search" size="large" placeholder="Type to search"
      /></el-col>
      <el-button size="large" @click="() => (dialogFormVisible = true)"
        >New Location</el-button
      >
    </el-row>
    <el-table
      class="w-screen"
      @selection-change="handleSelectionChange"
      :lazy="true"
      :loading="disable"
      :data="filterTableData"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column
        v-for="col in columns"
        :key="col.prop || col.label"
        :prop="col.prop"
        :label="col.label"
        :sortable="col.sortable"
      >
      </el-table-column>
      <el-table-column label="Operations">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">
            Edit
          </el-button>
          <el-popconfirm
            confirm-button-text="Yes"
            cancel-button-text="No"
            :icon="InfoFilled"
            icon-color="#626AEF"
            title="Are you sure to delete this?"
            @confirm="handleDelete(scope.row)"
            @cancel="() => {}"
          >
            <template #reference>
              <el-button size="small" type="danger">Delete</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <div class="flex justify-end">
      <el-pagination
        class="my-3"
        background
        layout="prev, pager, next"
        :total="locations?.total_page"
      />
    </div>
    <el-dialog v-model="dialogFormVisible" title="Lokasi Baru" width="500">
      <el-form :model="form" :rules="rules">
        <el-form-item label="Nama">
          <el-input
            v-model="form.name"
            :disabled="disable"
            autocomplete="off"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false" :loading="disable"
            >Cancel</el-button
          >
          <el-button type="primary" @click="onSubmit" :loading="disable">
            Submit
          </el-button>
        </div>
      </template>
    </el-dialog>
  </TrumsWrapper>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import type { Catalogue } from "~/types/catalogue";
import { InfoFilled } from "@element-plus/icons-vue";
import type { FormRules } from "element-plus";
import { useApi } from "#imports";
import type { Pagination } from "~/types/pagination";

const locations = ref<Pagination<Catalogue[]>>();

const disable = ref<boolean>(false);
const search = ref("");
const dialogFormVisible = ref(false);
const formLabelWidth = "140px";

const axios = useApi();

const form = reactive({
  name: "",
});

const rules = reactive<FormRules>({
  name: [{ required: true, message: "Masukan Nama Lokasi", trigger: "blur" }],
});

const filterTableData = computed(() =>
  locations.value?.query.filter(
    (data) =>
      !search.value ||
      data.unique_code?.toLowerCase().includes(search.value.toLowerCase()) ||
      data.unique_id?.toLowerCase().includes(search.value.toLowerCase()) ||
      data.name?.toLowerCase().includes(search.value.toLowerCase())
  )
);

const columns = [
  {
    label: "Unique Code",
    prop: "unique_code",
    sortable: true,
  },
  {
    label: "Name",
    prop: "name",
  },
  {
    label: "Total Item",
    prop: "quantity",
  },
];

const handleEdit = (row: any) => {
  console.log("Editing:", row);
};

const handleDelete = (row: any) => {
  console.log("Deleting:", row);
};

const handleSelectionChange = (selection: any[]) => {
  console.log("Selected Rows:", selection);
};

const fetchData = async () => {
  disable.value = true;
  try {
    const response = await axios.get("/catalogues-read");
    if (response.status == 200) {
      locations.value = response.data.data;
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message);
  } finally {
    disable.value = false;
  }
};

const onSubmit = async () => {
  disable.value = true;
  try {
    const response = await axios.post("/catalogues-create", {
      name: form.name,
      type: "place",
    });
    if (response.status == 201) {
      fetchData();
      dialogFormVisible.value = false;
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message);
  } finally {
    disable.value = false;
  }
};

onMounted(() => {
  fetchData();
});

console.log(locations);
</script>
